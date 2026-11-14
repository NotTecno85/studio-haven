import type { ReactNode } from "react";
import { Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, BriefcaseBusiness, Check, Compass, FolderKanban, LogOut, Settings2, Sparkles, WalletCards } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PanelBoundary } from "@/components/error-boundary";
import { hasDemoSession, usePortalSession } from "@/lib/use-portal-session";
import { supabase } from "@/lib/supabase";

export function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className={`flex shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground ${small ? "size-8" : "size-9"}`}>
        <Sparkles className={small ? "size-4" : "size-[18px]"} />
      </span>
      <span className="headline truncate font-display font-semibold">Obsidian Atelier</span>
    </span>
  );
}

export function PublicHeader({ current = "showcase" }: { current?: "showcase" | "onboarding" }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link to="/showcase" aria-label="Obsidian Atelier — showcase" className="min-w-0">
          <BrandMark />
        </Link>
        <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link to="/showcase" className={current === "showcase" ? "rounded-xl bg-surface-2 px-3 py-2 text-sm text-foreground" : "rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"}>
            Work
          </Link>
          <Link to="/onboarding" className={current === "onboarding" ? "rounded-xl bg-surface-2 px-3 py-2 text-sm text-foreground" : "rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"}>
            Start a project
          </Link>
          <Button asChild size="sm" className="rounded-xl px-3 sm:px-4">
            <Link to="/signin">Client access</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-border px-5 py-8 sm:px-8 sm:py-10 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="font-mono text-xs uppercase text-primary">{eyebrow}</p>
        <h1 className="headline mt-3 font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function SectionTitle({ index, title, detail }: { index: string; title: string; detail?: string }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-border pb-3">
      <span className="font-mono text-xs text-primary">{index}</span>
      <h2 className="headline font-display text-base font-semibold">{title}</h2>
      {detail ? <span className="ml-auto text-xs text-muted-foreground">{detail}</span> : null}
    </div>
  );
}

export function StateLabel({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warning" }) {
  const style = tone === "good"
    ? "border-primary/40 bg-primary/10 text-primary"
    : tone === "warning"
      ? "border-chart-4/40 bg-chart-4/10 text-chart-4"
      : "border-border bg-surface-2 text-muted-foreground";
  return <span className={`inline-flex items-center rounded-xl border px-2.5 py-1 text-[11px] font-medium ${style}`}>{children}</span>;
}

const PORTAL_LINKS = [
  { to: "/workspace", label: "Sprint & approvals", icon: FolderKanban },
  { to: "/vault", label: "Brand vault", icon: Compass },
  { to: "/billing", label: "Billing", icon: WalletCards },
  { to: "/settings", label: "Profile & team", icon: Settings2 },
] as const;

export function PortalLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { session, ready } = usePortalSession();

  const signOut = async () => {
    if (session?.isDemo) {
      window.localStorage.removeItem("studio_demo_session");
    } else if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) return;
    }
    await navigate({ to: "/signin", replace: true });
  };

  if (!ready || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-sm text-muted-foreground">
        Checking your client workspace…
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[264px] shrink-0 flex-col border-r border-border bg-surface px-5 py-6 md:flex">
          <Link to="/showcase" aria-label="Obsidian Atelier showcase" className="px-2">
            <BrandMark small />
          </Link>
          <div className="mt-9 px-2 font-mono text-[10px] uppercase text-muted-foreground">Client portal</div>
          <nav aria-label="Client portal" className="mt-3 space-y-1">
            {PORTAL_LINKS.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} className={active ? "flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-3 text-sm font-medium text-foreground" : "flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"}>
                  <Icon className={active ? "size-4 text-primary" : "size-4"} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto space-y-3 border-t border-border pt-5">
            <Link to="/showcase" className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowUpRight className="size-4" /> Public showcase
            </Link>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-canvas p-3">
              <span className="relative flex size-2.5 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
                <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{session.isDemo ? "Preview session" : session.displayName}</p>
                <p className="truncate text-[11px] text-muted-foreground">{session.isDemo ? "Local preview" : session.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => void signOut()}>
              <LogOut /> Leave workspace
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 md:hidden">
            <Link to="/showcase" aria-label="Obsidian Atelier showcase"><BrandMark small /></Link>
            <Button variant="outline" size="icon" aria-label="Leave workspace" onClick={() => void signOut()}>
              <LogOut />
            </Button>
          </header>
          <nav aria-label="Client portal" className="grid grid-cols-4 border-b border-border md:hidden">
            {PORTAL_LINKS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={pathname === to ? "flex min-h-[60px] flex-col items-center justify-center gap-1 border-b-2 border-primary px-1 text-[10px] text-primary" : "flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 text-[10px] text-muted-foreground"}>
                <Icon className="size-4" />
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </nav>
          <PanelBoundary><Outlet /></PanelBoundary>
        </div>
      </div>
    </div>
  );
}

export function portalBeforeLoad(location: string) {
  if (typeof window === "undefined") return;
  if (hasDemoSession()) return;
  if (!supabase) throw redirect({ to: "/signin" });
  return supabase.auth.getUser().then(({ data, error }) => {
    if (error || !data.user) throw redirect({ to: "/signin" });
    return { userId: data.user.id, location };
  });
}

export function PortalWelcome({ section }: { section: string }) {
  const { session } = usePortalSession();
  return (
    <div className="sr-only" aria-live="polite">
      {session?.company ? `${section} for ${session.company}` : `${section} client portal`}
    </div>
  );
}