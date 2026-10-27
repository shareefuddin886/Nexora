import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Save,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { GoogleIcon } from "@/components/AuthForm";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — Nexora" }] }),
  component: ProfilePage,
});

const inputClass =
  "h-11 w-full rounded-xl border border-border/70 bg-background/60 px-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/20";

function ProfilePage() {
  const { user } = useAuthUser();
  const [fullName, setFullName] = useState("");
  const [education, setEducation] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profiles")
      .select("full_name, education")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setFullName(data?.full_name ?? user.user_metadata?.full_name ?? "");
        setEducation(data?.education ?? "");
        setLoaded(true);
      });
  }, [user]);

  if (!user) return null;

  const provider = (user.app_metadata?.provider as string | undefined) ?? "email";
  const usesPassword = provider === "email";
  const initials = (fullName || user.email || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const name = fullName.trim().slice(0, 100);
    const edu = education.trim().slice(0, 150);
    const { error } = await supabase
      .from("profiles")
      .upsert(
        { user_id: user.id, full_name: name, education: edu || null, email: user.email },
        { onConflict: "user_id" },
      );
    // Keep the name shown in the navbar in sync.
    if (!error) await supabase.auth.updateUser({ data: { full_name: name } });
    setSaving(false);
    if (error) toast.error("Couldn't save your profile. Please try again.");
    else toast.success("Profile saved");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setChanging(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChanging(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewPassword("");
    setConfirm("");
    toast.success("Password updated");
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">
      {/* Header */}
      <div className="flex items-center gap-5">
        <span
          className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl text-2xl font-bold text-primary-foreground shadow-glow"
          style={{ background: "var(--gradient-gold)", fontFamily: "var(--font-display)" }}
        >
          {initials}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            My profile
          </p>
          <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight">
            {fullName || user.email?.split("@")[0]}
          </h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Personal details */}
      <section className="mt-10 rounded-2xl border border-border/60 bg-surface/40 p-5 md:p-7">
        <h2 className="text-lg font-semibold">Personal details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Shown on your dashboard and used to personalise your experience.
        </p>
        {!loaded ? (
          <div className="grid place-items-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={saveProfile} className="mt-6 space-y-4">
            <Field icon={UserIcon} label="Full name" htmlFor="fullName">
              <input
                id="fullName"
                value={fullName}
                maxLength={100}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className={`${inputClass} pl-10`}
                required
              />
            </Field>
            <Field icon={GraduationCap} label="College / education" htmlFor="education">
              <input
                id="education"
                value={education}
                maxLength={150}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. B.Tech CSE, JNTU Hyderabad — 2026"
                className={`${inputClass} pl-10`}
              />
            </Field>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-70"
              style={{ background: "var(--gradient-gold)" }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </button>
          </form>
        )}
      </section>

      {/* Account */}
      <section className="mt-6 rounded-2xl border border-border/60 bg-surface/40 p-5 md:p-7">
        <h2 className="text-lg font-semibold">Account</h2>
        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/50 p-3">
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd className="mt-1 flex items-center gap-1.5 truncate text-sm font-medium">
              <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{user.email}</span>
            </dd>
          </div>
          <div className="rounded-xl border border-border/50 p-3">
            <dt className="text-xs text-muted-foreground">Signs in with</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium">
              {provider === "google" ? (
                <GoogleIcon />
              ) : (
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {provider === "google" ? "Google" : "Email & password"}
            </dd>
          </div>
          <div className="rounded-xl border border-border/50 p-3">
            <dt className="text-xs text-muted-foreground">Member since</dt>
            <dd className="mt-1 text-sm font-medium">
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })
                : "—"}
            </dd>
          </div>
        </dl>

        {usesPassword && (
          <form onSubmit={changePassword} className="mt-7 border-t border-border/50 pt-6">
            <h3 className="font-semibold">Change password</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className={inputClass}
                aria-label="New password"
              />
              <input
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className={inputClass}
                aria-label="Confirm new password"
              />
            </div>
            <button
              type="submit"
              disabled={changing}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-border/70 bg-surface/60 px-4 text-sm font-medium hover:border-primary/50 disabled:opacity-70"
            >
              {changing && <Loader2 className="h-4 w-4 animate-spin" />}
              Update password
            </button>
          </form>
        )}
      </section>

      <button
        onClick={() => void supabase.auth.signOut()}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 text-sm text-muted-foreground transition hover:border-destructive/50 hover:text-destructive"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </main>
  );
}

function Field({
  icon: Icon,
  label,
  htmlFor,
  children,
}: {
  icon: typeof Mail;
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}
