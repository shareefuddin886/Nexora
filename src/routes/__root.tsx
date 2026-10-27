import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import appCss from "../styles.css?url";
import { Navbar } from "../components/Navbar";
import { Toaster } from "../components/ui/sonner";
import { useAuthUser } from "../hooks/useAuthUser";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-glow" />
      <div className="max-w-md text-center">
        <p
          className="text-8xl font-bold tracking-tight text-gradient-gold md:text-9xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold">This page doesn't exist</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The link may be broken or the page may have moved. Let's get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
            style={{ background: "var(--gradient-gold)" }}
          >
            Go home
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-border/70 bg-surface/60 px-5 py-2.5 text-sm font-medium"
          >
            My dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Something went wrong on our end. You can try refreshing or head back home.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {errorMessage}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nexora — AI Career Platform" },
      { name: "description", content: "Build your resume, master your skills, and land your dream job. Nexora is the AI-powered career platform for ambitious students and professionals." },
      { property: "og:title", content: "Nexora — AI Career Platform" },
      { property: "og:description", content: "AI resume builder, resume reviewer, skill assessments, and mock interviews — all in one platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Login and admin pages are full-page, without the student site navigation.
  const bare = pathname === "/login" || pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate pathname={pathname}>
        {!bare && <Navbar />}
        <main className={bare ? "" : "pt-20"}>
          <Outlet />
        </main>
      </AuthGate>
      <Toaster position="bottom-right" richColors />
    </QueryClientProvider>
  );
}

// Pages that work without signing in. /admin has its own login form.
const PUBLIC_PATHS = ["/login", "/reset-password", "/admin"];

/**
 * Sends signed-out visitors to /login (remembering where they were going)
 * and sends signed-in users away from /login.
 */
function AuthGate({ pathname, children }: { pathname: string; children: ReactNode }) {
  const { user, loading } = useAuthUser();
  const navigate = useNavigate();
  const search = useRouterState({ select: (s) => s.location.search }) as { redirect?: string };
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const mustLogin = !loading && !user && !isPublic;
  const leaveLogin = !loading && !!user && pathname === "/login";

  useEffect(() => {
    if (mustLogin) {
      const redirect = pathname === "/" ? undefined : pathname;
      void navigate({ to: "/login", search: { redirect }, replace: true });
    } else if (leaveLogin) {
      void navigate({ to: (search.redirect ?? "/") as "/", replace: true });
    }
  }, [mustLogin, leaveLogin, pathname, search.redirect, navigate]);

  if ((loading && !isPublic) || mustLogin || leaveLogin) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  return <>{children}</>;
}
