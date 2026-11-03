import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { readSessionToken, writeGuestDemoSession } from "@/lib/auth";
import { PanelBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign In — Obsidian Atelier" },
      {
        name: "description",
        content: "Access the Obsidian Atelier client workspace or launch the guest demo session.",
      },
      { property: "og:title", content: "Sign In — Obsidian Atelier" },
      { property: "og:description", content: "Access the client workspace or launch the demo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);

  // If a valid session token persists (hard refresh / return visit), route
  // straight into the workspace — never bounce back to this gate.
  useEffect(() => {
    if (readSessionToken()) {
      navigate({ to: "/client/tasks", replace: true });
    }
  }, [navigate]);

  const handleViewDemo = () => {
    setDemoLoading(true);
    window.setTimeout(() => {
      writeGuestDemoSession();
      toast.success("Verification successful — guest demo session authorized.", {
        description: "Token persisted. Routing into your workspace.",
      });
      navigate({ to: "/client/tasks", replace: true });
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <PanelBoundary>
        <Link
          to="/"
          className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to studio
        </Link>

        <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <h1 className="headline mt-6 font-display text-2xl font-semibold">
              Client Access Gate
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to enter your secured workspace.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs text-muted-foreground">
                Work email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                className="h-10 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs text-muted-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-10 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <button
              type="button"
              className="h-10 w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={handleViewDemo}
              disabled={demoLoading}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-canvas text-sm font-medium text-foreground transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {demoLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Verifying session…
                </>
              ) : (
                "View Demo"
              )}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            New to the atelier?{" "}
            <span className="text-foreground">Create Account</span>
          </p>
        </div>
      </PanelBoundary>
    </div>
  );
}
