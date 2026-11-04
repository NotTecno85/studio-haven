import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  CalendarClock,
  FolderKanban,
  Layers,
  LogOut,
  Sparkles,
} from "lucide-react";
import { clearSessionToken, readSessionToken } from "@/lib/auth";
import { PanelBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/client")({
  beforeLoad: ({ location }) => {
    // Synchronous localStorage gate: a valid session token grants uninterrupted
    // passage across every /client/* path, including after hard refresh (F5).
    if (typeof window === "undefined") return;
    if (!readSessionToken()) {
      throw redirect({ to: "/signin" });
    }
    if (location.pathname === "/client") {
      throw redirect({ to: "/client/tasks" });
    }
  },
  component: ClientWorkspaceLayout,
});

const NAV = [
  { to: "/client/tasks", label: "Milestones", icon: FolderKanban },
  { to: "/client/assets", label: "Asset Vault", icon: Layers },
  { to: "/client/booker", label: "Session Booker", icon: CalendarClock },
] as const;

function ClientWorkspaceLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    const active = Boolean(readSessionToken());
    setSessionActive(active);
    if (!active) {
      navigate({ to: "/signin", replace: true });
    }
  }, [navigate, pathname]);

  const signOut = () => {
    clearSessionToken();
    setSessionActive(false);
    navigate({ to: "/signin", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-border bg-surface p-5 md:flex">
          <div>
            <Link to="/" className="flex items-center gap-2 px-2 py-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <span className="headline font-display text-base font-semibold">
                Obsidian Atelier
              </span>
            </Link>

            <nav className="mt-8 space-y-1">
              {NAV.map(({ to, label, icon: Icon }) => {
                const isActive = pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={
                      isActive
                        ? "flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5 text-sm font-medium text-foreground"
                        : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                    }
                  >
                    <Icon className={isActive ? "size-4 text-primary" : "size-4"} />
                    {label}
                  </Link>
                );
              })}

              {/* Strict conditional rendering: when a session is authorized, the
                  sign-in / create-account choices are completely un-rendered. */}
              {!sessionActive && (
                <div className="space-y-1 pt-4">
                  <Link
                    to="/signin"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signin"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </nav>
          </div>

          <div className="rounded-xl border border-border bg-canvas p-4">
            <div className="flex items-center gap-2.5">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">
                  Authorized Client Session
                </p>
                <p className="truncate text-[11px] text-muted-foreground">guest_demo_authorized</p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-2"
            >
              <LogOut className="size-3.5" />
              Sign Out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <PanelBoundary>
            <Outlet />
          </PanelBoundary>
        </div>
      </div>
    </div>
  );
}

export function WorkspaceHeader({ title, subtitle }: { title: string; subtitle: string }): ReactNode {
  return (
    <header className="border-b border-border px-8 py-8">
      <h1 className="headline font-display text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
    </header>
  );
}
