import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { readSessionToken } from "@/lib/auth";
import { PanelBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Obsidian Atelier — Design Agency Studio Hub" },
      {
        name: "description",
        content:
          "A premium design agency studio hub: curated portfolio, engagement packages, secure checkout, and an active client workspace.",
      },
      { property: "og:title", content: "Obsidian Atelier — Design Agency Studio Hub" },
      {
        property: "og:description",
        content: "Curated portfolio, engagement packages, and a live client workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setIsAuthorized(Boolean(readSessionToken()));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PanelBoundary>
        <header className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span className="headline font-display text-lg font-semibold">Obsidian Atelier</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              to="/portfolio"
              className="rounded-xl px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Portfolio
            </Link>
            <Link
              to="/pricing"
              className="rounded-xl px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            {isAuthorized ? (
              <Link
                to="/client/tasks"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Open Workspace
              </Link>
            ) : (
              <Link
                to="/signin"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Sign In
              </Link>
            )}
          </nav>
        </header>

        <main className="mx-auto max-w-[1600px] px-6">
          <section className="flex flex-col items-center py-24 text-center md:py-36">
            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              Design Agency Studio Hub — Client Workspace
            </div>
            <h1 className="headline mt-8 max-w-4xl font-display text-5xl font-semibold leading-[1.05] md:text-7xl">
              Interfaces engineered with{" "}
              <span className="text-primary">obsidian-grade</span> precision.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground">
              A curated studio for brand systems, product design, and motion — with a live
              workspace where every deliverable, asset, and session stays in sync.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-emerald)] transition-colors hover:bg-primary/90"
              >
                Explore Portfolio
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
              >
                View Engagement Tiers
              </Link>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 pb-24 md:grid-cols-3">
            {[
              {
                title: "Brand Systems",
                body: "Identity, typography, and motion languages built to scale across every surface.",
              },
              {
                title: "Product Design",
                body: "Dense, operational interfaces for dashboards, consoles, and internal tooling.",
              },
              {
                title: "Client Workspace",
                body: "Milestones, asset vaults, and scheduling — coordinated in one secured session.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-surface p-6 transition-colors hover:bg-surface-2"
              >
                <h3 className="headline font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </section>
        </main>
      </PanelBoundary>
    </div>
  );
}
