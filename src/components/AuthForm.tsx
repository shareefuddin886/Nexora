import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, MailCheck, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type AuthMode = "signin" | "signup" | "forgot" | "check-email";

const TITLES: Record<AuthMode, string> = {
  signin: "Welcome back",
  signup: "Create your account",
  forgot: "Reset your password",
  "check-email": "Verify your email",
};

/**
 * Sign in / sign up / forgot-password form, shared by the /login page and
 * the sign-in dialog. Calls onSuccess once a session exists.
 */
export function AuthForm({
  defaultMode = "signin",
  onSuccess,
}: {
  defaultMode?: "signin" | "signup";
  onSuccess?: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);

  const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setUnverified(false);
  };

  // Google verifies the email itself, so no confirmation email is sent.
  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.href : undefined },
    });
    // On success the browser navigates to Google; only failures land here.
    if (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  const resendVerification = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Verification email sent. Check your inbox.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (mode !== "forgot" && !password)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo, data: { full_name: fullName } },
        });
        if (error) throw error;

        // Supabase returns a user with no identities when the email is
        // already registered (so it doesn't leak which emails exist).
        if (data.user && data.user.identities?.length === 0) {
          toast.error("An account with this email already exists. Please sign in.");
          switchMode("signin");
          return;
        }
        if (!data.session) {
          // Email confirmation is on: the user must click the link first.
          switchMode("check-email");
          return;
        }
        toast.success("Account created. Welcome to Nexora!");
        onSuccess?.();
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${redirectTo}/reset-password`,
        });
        if (error) throw error;
        toast.success("If that email has an account, a reset link is on its way.");
        switchMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.code === "email_not_confirmed") {
            setUnverified(true);
            return;
          }
          if (error.code === "invalid_credentials") {
            toast.error("Wrong email or password.");
            return;
          }
          throw error;
        }
        toast.success("Signed in successfully!");
        onSuccess?.();
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error((err as Error)?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const description: Record<AuthMode, string> = {
    signin: "Sign in to continue your learning, tests and interview practice.",
    signup: "Free account. Your progress is saved across every device.",
    forgot: "Enter your email and we'll send you a link to set a new password.",
    "check-email": `We sent a verification link to ${email}. Click it to activate your account, then sign in.`,
  };

  if (mode === "check-email") {
    return (
      <div className="text-center">
        <span
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground shadow-glow"
          style={{ background: "var(--gradient-gold)" }}
        >
          <MailCheck className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-2xl font-bold tracking-tight">{TITLES[mode]}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description[mode]}</p>
        <div className="mt-7 space-y-3">
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className="h-11 w-full rounded-xl text-sm font-semibold text-primary-foreground shadow-glow"
            style={{ background: "var(--gradient-gold)" }}
          >
            I've verified — Sign in
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void resendVerification()}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border/70 bg-surface/50 text-sm font-medium hover:bg-surface"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Resend verification email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sign in / Sign up switch */}
      {mode !== "forgot" && (
        <div className="mb-7 grid grid-cols-2 rounded-xl border border-border/60 bg-background/50 p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              aria-pressed={mode === m}
              className={`h-9 rounded-lg text-sm font-semibold transition ${
                mode === m
                  ? "bg-surface-2 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold tracking-tight md:text-[28px]">{TITLES[mode]}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{description[mode]}</p>

      {mode !== "forgot" && (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={() => void signInWithGoogle()}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border/70 bg-surface/60 text-sm font-medium transition hover:border-primary/40 hover:bg-surface disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or with email
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className={`space-y-4 ${mode === "forgot" ? "mt-6" : ""}`}>
        {mode === "signup" && (
          <Field id="fullName" label="Full name" icon={User}>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              required
            />
          </Field>
        )}

        <Field id="email" label="Email" icon={Mail}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
        </Field>

        {mode !== "forgot" && (
          <Field
            id="password"
            label="Password"
            icon={Lock}
            action={
              mode === "signin" && (
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              )
            }
          >
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-11`}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </Field>
        )}

        {unverified && mode === "signin" && (
          <div className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-xs text-foreground">
            Your email isn't verified yet. Check your inbox for the link, or{" "}
            <button
              type="button"
              onClick={() => void resendVerification()}
              className="font-semibold text-primary hover:underline"
            >
              resend it
            </button>
            .
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-105 disabled:opacity-70"
          style={{ background: "var(--gradient-gold)" }}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signin" ? "Sign in" : mode === "forgot" ? "Send reset link" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </button>
          </>
        ) : mode === "forgot" ? (
          <>
            Remembered it?{" "}
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="font-semibold text-primary hover:underline"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            New to Nexora?{" "}
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className="font-semibold text-primary hover:underline"
            >
              Create an account
            </button>
          </>
        )}
      </p>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-border/70 bg-background/60 pl-10 pr-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/20";

function Field({
  id,
  label,
  icon: Icon,
  action,
  children,
}: {
  id: string;
  label: string;
  icon: typeof Mail;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
        {action}
      </div>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
