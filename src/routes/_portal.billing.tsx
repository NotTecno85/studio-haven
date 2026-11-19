import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CircleDollarSign, FileText, ShieldCheck } from "lucide-react";
import { PanelBoundary } from "@/components/error-boundary";
import { PageHeading, SectionTitle, StateLabel } from "@/components/portal-chrome";

export const Route = createFileRoute("/_portal/billing")({
  head: () => ({
    meta: [
      { title: "Billing — Obsidian Atelier" },
      { name: "description", content: "Review your design retainer and invoice history in the Obsidian Atelier client portal." },
      { property: "og:title", content: "Billing — Obsidian Atelier" },
      { property: "og:description", content: "A clear view of subscription and invoice information connected to your workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Billing,
});

function Billing() {
  return (
    <PanelBoundary>
      <main>
        <PageHeading eyebrow="Client workspace · 03" title="Retainer & invoices" description="A clear place for engagement charges, invoice history, and billing details." action={<StateLabel>Billing status</StateLabel>} />
        <section className="grid gap-8 border-b border-border px-5 py-8 sm:px-8 lg:grid-cols-[1fr_0.72fr]">
          <div className="border-l-2 border-primary pl-5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-muted-foreground"><ShieldCheck className="size-3.5 text-primary" /> Connected engagement</div>
            <h2 className="headline mt-4 font-display text-2xl font-semibold">Billing isn’t connected yet</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">This workspace doesn’t have a payment provider or invoice records connected. No sample charges are shown, so your billing history stays accurate.</p>
            <div className="mt-5 flex flex-wrap items-center gap-2"><StateLabel tone="warning">No active subscription on file</StateLabel><StateLabel>Invoice history unavailable</StateLabel></div>
          </div>
          <div className="border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <p className="font-mono text-[10px] uppercase text-muted-foreground">Your engagement</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3"><CalendarDays className="mt-0.5 size-4 text-primary" /><div><p className="text-sm font-medium">Renewal date</p><p className="mt-1 text-xs text-muted-foreground">Not set</p></div></div>
              <div className="flex gap-3"><CircleDollarSign className="mt-0.5 size-4 text-primary" /><div><p className="text-sm font-medium">Retainer amount</p><p className="mt-1 text-xs text-muted-foreground">Not set</p></div></div>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">Your studio lead can confirm payment terms and send invoices when billing is connected.</p>
          </div>
        </section>

        <section className="px-5 py-8 sm:px-8">
          <SectionTitle index="A" title="Invoice history" detail="This account" />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead><tr className="border-b border-border font-mono text-[10px] uppercase text-muted-foreground"><th className="py-3 font-normal">Invoice</th><th className="py-3 font-normal">Period</th><th className="py-3 font-normal">Amount</th><th className="py-3 font-normal">Status</th><th className="py-3 font-normal">File</th></tr></thead>
              <tbody><tr><td colSpan={5} className="py-12 text-center"><FileText className="mx-auto size-5 text-muted-foreground" /><p className="mt-3 text-sm text-foreground">No invoices to show</p><p className="mt-1 text-xs text-muted-foreground">Invoices appear here when a billing service is connected.</p></td></tr></tbody>
            </table>
          </div>
        </section>
        <div className="border-t border-border px-5 py-4 text-xs text-muted-foreground sm:px-8">Need a receipt or payment update? Contact your studio lead directly.</div>
      </main>
    </PanelBoundary>
  );
}