import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PanelBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Obsidian Atelier" },
      {
        name: "description",
        content:
          "A curated 12-column showcase of premium agency design cases across branding, web, motion, product, and packaging.",
      },
      { property: "og:title", content: "Portfolio — Obsidian Atelier" },
      { property: "og:description", content: "Curated premium agency design cases." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});

type Category = "All" | "Branding" | "Web" | "Motion" | "Product" | "Packaging";

interface CaseStudy {
  title: string;
  client: string;
  category: Exclude<Category, "All">;
  year: string;
  gradient: string;
  span: string;
  ratio: string;
}

const CASES: CaseStudy[] = [
  { title: "Helios Identity System", client: "Helios Ventures", category: "Branding", year: "2026", gradient: "var(--gradient-case-a)", span: "md:col-span-6", ratio: "aspect-[16/9]" },
  { title: "Northbeam Trading Console", client: "Northbeam Capital", category: "Product", year: "2025", gradient: "var(--gradient-case-b)", span: "md:col-span-3", ratio: "aspect-[4/5]" },
  { title: "Pulse Motion Reel", client: "Pulse Fitness", category: "Motion", year: "2026", gradient: "var(--gradient-case-c)", span: "md:col-span-3", ratio: "aspect-[4/5]" },
  { title: "Verdant E-commerce Platform", client: "Verdant Goods", category: "Web", year: "2025", gradient: "var(--gradient-case-d)", span: "md:col-span-4", ratio: "aspect-[4/3]" },
  { title: "Aurora Packaging Suite", client: "Aurora Botanics", category: "Packaging", year: "2024", gradient: "var(--gradient-case-a)", span: "md:col-span-4", ratio: "aspect-[4/3]" },
  { title: "Meridian Brand Refresh", client: "Meridian Labs", category: "Branding", year: "2026", gradient: "var(--gradient-case-b)", span: "md:col-span-4", ratio: "aspect-[4/3]" },
  { title: "Cobalt Design System", client: "Cobalt Systems", category: "Product", year: "2025", gradient: "var(--gradient-case-c)", span: "md:col-span-5", ratio: "aspect-[16/10]" },
  { title: "Eclipse Launch Film", client: "Eclipse Media", category: "Motion", year: "2024", gradient: "var(--gradient-case-d)", span: "md:col-span-3", ratio: "aspect-[4/5]" },
  { title: "Solstice Web Experience", client: "Solstice Travel", category: "Web", year: "2026", gradient: "var(--gradient-case-a)", span: "md:col-span-4", ratio: "aspect-[4/3]" },
  { title: "Terra Reserve Packaging", client: "Terra Reserve", category: "Packaging", year: "2025", gradient: "var(--gradient-case-b)", span: "md:col-span-6", ratio: "aspect-[16/9]" },
  { title: "Kinetic Type Exploration", client: "Studio Internal", category: "Motion", year: "2026", gradient: "var(--gradient-case-c)", span: "md:col-span-3", ratio: "aspect-square" },
  { title: "Atlas Product Configurator", client: "Atlas Hardware", category: "Product", year: "2024", gradient: "var(--gradient-case-d)", span: "md:col-span-3", ratio: "aspect-square" },
];

const CATEGORIES: Category[] = ["All", "Branding", "Web", "Motion", "Product", "Packaging"];

function Portfolio() {
  const [active, setActive] = useState<Category>("All");
  const filtered = active === "All" ? CASES : CASES.filter((c) => c.category === active);

  return (
    <div className="min-h-screen bg-background">
      <PanelBoundary>
        <header className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <span className="headline font-display text-lg font-semibold">Obsidian Atelier</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/pricing"
              className="rounded-xl px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              to="/signin"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Client Access
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-6 pb-24">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Home
          </Link>
          <h1 className="headline mt-6 font-display text-5xl font-semibold md:text-6xl">
            Selected Work
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground">
            Twelve flagship cases across five disciplines, filtered live by category.
          </p>

          <div className="mt-10 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={
                  active === cat
                    ? "rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    : "rounded-xl border border-border bg-surface px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                }
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 transition-all md:grid-cols-12">
            {filtered.map((item) => (
              <article
                key={item.title}
                className={`group cursor-pointer overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:bg-surface-2 ${item.span}`}
              >
                <div
                  className={`${item.ratio} w-full transition-transform duration-300 group-hover:scale-[1.02]`}
                  style={{ backgroundImage: item.gradient }}
                />
                <div className="flex items-start justify-between p-5">
                  <div>
                    <h3 className="headline font-display text-base font-semibold">{item.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.client} · {item.category} · {item.year}
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
              </article>
            ))}
          </div>
        </main>
      </PanelBoundary>
    </div>
  );
}
