import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BadgeCheck, Lock, ShieldX } from "lucide-react";
import { PanelBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>) => ({
    tier: typeof search.tier === "string" ? search.tier : "studio",
  }),
  head: () => ({
    meta: [
      { title: "Checkout — Obsidian Atelier" },
      {
        name: "description",
        content:
          "Split-screen engagement checkout: client intake on one side, a live statement-of-work receipt with voucher validation on the other.",
      },
      { property: "og:title", content: "Checkout — Obsidian Atelier" },
      { property: "og:description", content: "Client intake and statement-of-work checkout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

const TIERS: Record<string, { label: string; monthly: number }> = {
  studio: { label: "Studio", monthly: 6000 },
  atelier: { label: "Atelier", monthly: 16000 },
  obsidian: { label: "Obsidian", monthly: 33000 },
};

const VOUCHERS: Record<string, number> = {
  STUDIO20: 0.2,
  ATELIER15: 0.15,
  LAUNCH10: 0.1,
};

function Checkout() {
  const { tier } = Route.useSearch();
  const navigate = useNavigate();
  const selected = TIERS[tier] ? tier : "studio";
  const monthly = TIERS[selected].monthly;

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    brief: "",
    budget: "16000",
  });
  const [voucher, setVoucher] = useState("");
  const [voucherState, setVoucherState] = useState<{
    code: string;
    discount: number;
    status: "valid" | "invalid";
  } | null>(null);

  const totals = useMemo(() => {
    const discount = voucherState?.status === "valid" ? voucherState.discount : 0;
    const discounted = Math.round(monthly * (1 - discount));
    const onboarding = 750;
    return {
      discountPct: discount,
      discounted,
      onboarding,
      total: discounted + onboarding,
    };
  }, [monthly, voucherState]);

  const applyVoucher = () => {
    const code = voucher.trim().toUpperCase();
    if (VOUCHERS[code]) {
      setVoucherState({ code, discount: VOUCHERS[code], status: "valid" });
    } else {
      setVoucherState({ code: code || "—", discount: 0, status: "invalid" });
    }
  };

  const field =
    "h-10 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";
  const label = "text-xs text-muted-foreground";

  return (
    <div className="min-h-screen bg-background">
      <PanelBoundary>
        <header className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6">
          <span className="headline font-display text-lg font-semibold">Obsidian Atelier</span>
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3.5 text-primary" />
            Secured transactional environment
          </span>
        </header>

        <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-6 pb-24 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <h1 className="headline font-display text-4xl font-semibold">Client Intake</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us who the engagement is for and what we're building.
            </p>

            <PanelBoundary>
              <div className="mt-8 space-y-6 rounded-xl border border-border bg-surface p-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="co-name" className={label}>
                      Full name
                    </label>
                    <input
                      id="co-name"
                      className={field}
                      placeholder="Ada Vance"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="co-company" className={label}>
                      Company
                    </label>
                    <input
                      id="co-company"
                      className={field}
                      placeholder="Vance Industries"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="co-email" className={label}>
                    Work email
                  </label>
                  <input
                    id="co-email"
                    type="email"
                    className={field}
                    placeholder="ada@vance.co"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="co-brief" className={label}>
                    Project brief
                  </label>
                  <textarea
                    id="co-brief"
                    rows={5}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                    placeholder="What are we designing, and what does success look like?"
                    value={form.brief}
                    onChange={(e) => setForm({ ...form, brief: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="co-budget" className={label}>
                    Approved monthly budget ceiling (USD)
                  </label>
                  <input
                    id="co-budget"
                    type="number"
                    className={field}
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border pt-6">
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/pricing" })}
                    className="rounded-xl border border-border bg-canvas px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
                  >
                    Back to tiers
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-emerald)] transition-colors hover:bg-primary/90"
                  >
                    Submit engagement request
                  </button>
                </div>
              </div>
            </PanelBoundary>
          </section>

          <section className="lg:col-span-5">
            <div className="sticky top-6 rounded-xl border border-border bg-surface p-8">
              <h2 className="headline font-display text-xl font-semibold">Statement of Work</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Receipt summary · billed monthly
              </p>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Engagement tier</span>
                  <span className="font-medium">{TIERS[selected].label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Base retainer</span>
                  <span className="font-medium">${monthly.toLocaleString()}</span>
                </div>
                {voucherState?.status === "valid" && (
                  <div className="flex items-center justify-between text-primary">
                    <span className="inline-flex items-center gap-1.5">
                      <BadgeCheck className="size-4" />
                      Voucher {voucherState.code}
                    </span>
                    <span>−{Math.round(voucherState.discount * 100)}%</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Onboarding & audit</span>
                  <span className="font-medium">${totals.onboarding.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-2 rounded-xl border border-border bg-canvas p-4">
                <label htmlFor="voucher" className={label}>
                  Voucher code
                </label>
                <div className="flex gap-2">
                  <input
                    id="voucher"
                    className={field}
                    placeholder="STUDIO20"
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={applyVoucher}
                    className="shrink-0 rounded-xl border border-border bg-surface-2 px-4 text-sm font-medium text-foreground transition-colors hover:bg-canvas"
                  >
                    Apply
                  </button>
                </div>
                {voucherState?.status === "valid" && (
                  <p className="inline-flex items-center gap-1.5 text-xs text-primary">
                    <BadgeCheck className="size-3.5" />
                    {voucherState.code} applied — {Math.round(voucherState.discount * 100)}% off the
                    retainer.
                  </p>
                )}
                {voucherState?.status === "invalid" && (
                  <p className="inline-flex items-center gap-1.5 text-xs text-destructive">
                    <ShieldX className="size-3.5" />
                    "{voucherState.code}" is not a recognized voucher.
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-end justify-between border-t border-border pt-6">
                <span className="text-sm text-muted-foreground">Total due today</span>
                <span className="headline font-display text-3xl font-semibold text-primary">
                  ${totals.total.toLocaleString()}
                </span>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                No charge is made until the statement of work is countersigned.
              </p>
            </div>
          </section>
        </main>
      </PanelBoundary>
    </div>
  );
}
