import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { PanelBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Obsidian Atelier" },
      {
        name: "description",
        content:
          "Engagement package matrix with a live volume slider that recalculates capacity and pricing as you drag.",
      },
      { property: "og:title", content: "Pricing — Obsidian Atelier" },
      { property: "og:description", content: "Engagement packages with live volume pricing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

interface Tier {
  name: string;
  base: number;
  unit: number;
  blurb: string;
  features: string[];
  featured?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Studio",
    base: 4800,
    unit: 120,
    blurb: "A focused engagement for a single product surface.",
    features: ["1 concurrent workstream", "Weekly design review", "Figma + handoff kit", "2-week iterations"],
  },
  {
    name: "Atelier",
    base: 12400,
    unit: 260,
    blurb: "A full design partner across brand and product.",
    features: [
      "3 concurrent workstreams",
      "Dedicated design lead",
      "Motion + brand system",
      "Priority scheduling",
      "Quarterly strategy session",
    ],
    featured: true,
  },
  {
    name: "Obsidian",
    base: 26000,
    unit: 420,
    blurb: "Embedded studio capacity for platform-scale programs.",
    features: [
      "Unlimited workstreams",
      "Embedded multi-discipline pod",
      "24h turnaround lane",
      "Design ops & tooling",
      "Executive reporting",
    ],
  },
];

function Pricing() {
  const [volume, setVolume] = useState(12);

  const calc = useMemo(() => {
    const weight = Math.max(1, volume);
    return TIERS.map((tier) => {
      const price = Math.round((tier.base + tier.unit * weight) / 50) * 50;
      const perUnit = Math.round(price / weight);
      const capacity =
        weight <= 8
          ? "light operational load"
          : weight <= 20
            ? "standard operational load"
            : weight <= 35
              ? "heavy operational load"
              : "platform-scale operational load";
      const turnaround = weight <= 8 ? "10 business days" : weight <= 20 ? "7 business days" : weight <= 35 ? "4 business days" : "48 hours";
      return { tier, price, perUnit, capacity, turnaround };
    });
  }, [volume]);

  return (
    <div className="min-h-screen bg-background">
      <PanelBoundary>
        <header className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6">
          <span className="headline font-display text-lg font-semibold">Obsidian Atelier</span>
          <div className="flex items-center gap-2">
            <Link
              to="/portfolio"
              className="rounded-xl px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Portfolio
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
          <div className="flex flex-col items-center py-10 text-center">
            <h1 className="headline font-display text-5xl font-semibold md:text-6xl">
              Engagement Tiers
            </h1>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground">
              Drag the volume slider to model your operational weight — every tier recalculates
              live.
            </p>
          </div>

          <PanelBoundary>
            <section className="mx-auto max-w-3xl rounded-xl border border-border bg-surface p-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Volume weight
                  </p>
                  <p className="headline mt-2 font-display text-4xl font-semibold text-primary">
                    {volume}
                    <span className="ml-2 text-base font-medium text-muted-foreground">
                      deliverable units / month
                    </span>
                  </p>
                </div>
                <p className="hidden text-sm text-muted-foreground md:block">
                  {volume <= 8 ? "Light" : volume <= 20 ? "Standard" : volume <= 35 ? "Heavy" : "Platform"}{" "}
                  operational profile
                </p>
              </div>
              <Slider
                className="mt-8"
                value={[volume]}
                min={1}
                max={50}
                step={1}
                onValueChange={(vals) => setVolume(vals[0] ?? 1)}
                aria-label="Volume weight"
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>50</span>
              </div>
            </section>
          </PanelBoundary>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {calc.map(({ tier, price, perUnit, capacity, turnaround }) => (
              <div
                key={tier.name}
                className={
                  tier.featured
                    ? "relative rounded-xl border border-primary bg-surface p-8 shadow-[var(--shadow-emerald)]"
                    : "rounded-xl border border-border bg-surface p-8"
                }
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    <Sparkles className="size-3" />
                    Most engaged
                  </span>
                )}
                <h3 className="headline font-display text-xl font-semibold">{tier.name}</h3>
                <p className="mt-2 min-h-10 text-sm text-muted-foreground">{tier.blurb}</p>
                <p className="headline mt-6 font-display text-4xl font-semibold">
                  ${price.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground"> /mo</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ≈ ${perUnit.toLocaleString()} per unit · {capacity}
                </p>

                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {turnaround} standard turnaround at this weight
                  </li>
                </ul>

                <Link
                  to="/checkout"
                  search={{ tier: tier.name.toLowerCase() }}
                  className={
                    tier.featured
                      ? "mt-8 flex h-10 items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      : "mt-8 flex h-10 items-center justify-center rounded-xl border border-border bg-canvas text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
                  }
                >
                  Start {tier.name} engagement
                </Link>
              </div>
            ))}
          </div>
        </main>
      </PanelBoundary>
    </div>
  );
}
