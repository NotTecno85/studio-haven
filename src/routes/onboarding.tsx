import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PanelBoundary } from "@/components/error-boundary";
import { PublicHeader, SectionTitle } from "@/components/portal-chrome";
import { estimateScope, SERVICE_OPTIONS } from "@/lib/portal-model";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Plan a Project — Obsidian Atelier" },
      { name: "description", content: "Build a clear design project scope with a live estimate and send a brief to Obsidian Atelier." },
      { property: "og:title", content: "Plan a Project — Obsidian Atelier" },
      { property: "og:description", content: "Shape a design engagement around the services and timeline your team needs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<string[]>([]);
  const [timelineWeeks, setTimelineWeeks] = useState(8);
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [brief, setBrief] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const estimate = estimateScope(services, timelineWeeks);

  const toggleService = (name: string) => setServices((selected) => selected.includes(name) ? selected.filter((item) => item !== name) : [...selected, name]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      toast.error("Brief delivery isn't connected yet. Your scope is still available on this page.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: userResult } = await supabase.auth.getUser();
      const { error } = await supabase.from("inquiries").insert({
        user_id: userResult.user?.id ?? null,
        full_name: fullName.trim(),
        company: company.trim(),
        email: email.trim(),
        services,
        timeline_weeks: timelineWeeks,
        estimated_budget: estimate,
        brief: brief.trim(),
      });
      if (error) throw error;
      toast.success("Your project brief has been sent.");
      setStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Your brief could not be sent.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader current="onboarding" />
      <PanelBoundary>
        <main className="mx-auto max-w-[1600px] px-5 pb-20 sm:px-8">
          <div className="border-b border-border py-10 sm:py-14">
            <Link to="/showcase" className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-3.5" /> Selected work</Link>
            <p className="mt-8 font-mono text-xs uppercase text-primary">New business · Project intake</p>
            <h1 className="headline mt-3 font-display text-3xl font-semibold sm:text-5xl">A good brief starts with a conversation.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Choose a direction, set a pace, and share what you want to move forward.</p>
            <div className="mt-8 flex max-w-lg items-center gap-3" aria-label={`Step ${Math.min(step, 2)} of 2`}>
              {[1, 2].map((item) => <span key={item} className="flex flex-1 items-center gap-2"><span className={step >= item ? "flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground" : "flex size-7 items-center justify-center rounded-full border border-border text-xs text-muted-foreground"}>{step > item ? <Check className="size-4" /> : `0${item}`}</span><span className={step >= item ? "text-xs text-foreground" : "text-xs text-muted-foreground"}>{item === 1 ? "Scope" : "Your brief"}</span><span className="h-px flex-1 bg-border last:hidden" /></span>)}
            </div>
          </div>

          {step === 3 ? (
            <section className="max-w-2xl py-14">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="size-5" /></span>
              <h2 className="headline mt-5 font-display text-2xl font-semibold">Your brief is with the studio.</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">We’ll follow up at {email} with next steps for {services.length ? services.join(", ") : "your project"}.</p>
              <Button asChild className="mt-6 rounded-xl"><Link to="/showcase">Back to selected work</Link></Button>
            </section>
          ) : step === 1 ? (
            <div className="grid gap-10 py-9 lg:grid-cols-[1fr_300px]">
              <section>
                <SectionTitle index="01" title="Choose your disciplines" detail="Select all that apply" />
                <div className="divide-y divide-border">
                  {SERVICE_OPTIONS.map((service) => {
                    const selected = services.includes(service.name);
                    return (
                      <button key={service.name} type="button" aria-pressed={selected} onClick={() => toggleService(service.name)} className="flex w-full items-center gap-4 py-4 text-left">
                        <span className={selected ? "flex size-5 shrink-0 items-center justify-center rounded-md border border-primary bg-primary text-primary-foreground" : "size-5 shrink-0 rounded-md border border-border"}>{selected ? <Check className="size-3.5" /> : null}</span>
                        <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{service.name}</span><span className="mt-1 block text-xs text-muted-foreground">{service.note}</span></span>
                        <span className="font-mono text-xs text-muted-foreground">from ${service.fee.toLocaleString()}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-10 border-t border-border pt-7">
                  <div className="flex items-end justify-between gap-4"><div><h2 className="text-sm font-medium">Project pace</h2><p className="mt-1 text-xs text-muted-foreground">Estimated engagement length</p></div><span className="font-mono text-sm text-primary">{timelineWeeks} weeks</span></div>
                  <input type="range" min={4} max={20} step={1} value={timelineWeeks} onChange={(event) => setTimelineWeeks(Number(event.target.value))} aria-label="Timeline in weeks" className="mt-5 w-full accent-primary" />
                  <div className="flex justify-between font-mono text-[10px] text-muted-foreground"><span>04 weeks</span><span>20 weeks</span></div>
                </div>
              </section>

              <aside className="h-fit border-t border-border pt-5 lg:sticky lg:top-8 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Your working scope</p>
                <p className="headline mt-3 font-display text-2xl font-semibold">{services.length ? `${services.length.toString().padStart(2, "0")} selected` : "Let’s define it"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{services.length ? "Working scope overview" : "Choose services to outline your scope"}</p>
                <div className="mt-5 space-y-3 border-y border-border py-4 text-xs">
                  {services.length ? services.map((name) => <div key={name} className="flex justify-between gap-3"><span>{name}</span><span className="font-mono text-muted-foreground">scope item</span></div>) : <p className="text-muted-foreground">Choose a discipline to build your scope.</p>}
                  <div className="flex justify-between gap-3 pt-1"><span>Timeline</span><span className="font-mono text-muted-foreground">{timelineWeeks} weeks</span></div>
                </div>
                <Button type="button" disabled={!services.length} onClick={() => setStep(2)} className="mt-5 w-full rounded-xl">Continue to your brief <ArrowRight /></Button>
                <p className="mt-3 text-[11px] leading-5 text-muted-foreground">The studio will confirm project scope and rates directly with you.</p>
              </aside>
            </div>
          ) : (
            <form onSubmit={(event) => void submit(event)} className="grid gap-10 py-9 lg:grid-cols-[1fr_300px]">
              <section>
                <SectionTitle index="02" title="Tell us where to begin" detail="Your details stay with the studio" />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5 text-xs text-muted-foreground">Full name<input required maxLength={120} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary" /></label>
                  <label className="space-y-1.5 text-xs text-muted-foreground">Company<input maxLength={160} autoComplete="organization" value={company} onChange={(event) => setCompany(event.target.value)} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary" /></label>
                  <label className="space-y-1.5 text-xs text-muted-foreground sm:col-span-2">Work email<input required type="email" maxLength={255} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary" /></label>
                  <label className="space-y-1.5 text-xs text-muted-foreground sm:col-span-2">What are you trying to change?<textarea maxLength={4000} rows={6} value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="A little context about your team, the opportunity, or what feels stuck…" className="w-full resize-y rounded-xl border border-border bg-surface px-3 py-2.5 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" /></label>
                </div>
              </section>
              <aside className="h-fit border-t border-border pt-5 lg:sticky lg:top-8 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Scope summary</p>
                <p className="headline mt-3 font-display text-lg font-semibold">{summary}</p>
                <div className="mt-4 space-y-2 border-y border-border py-4 text-xs"><p>{services.join(" · ")}</p><p className="text-muted-foreground">Rates are confirmed after your brief is reviewed.</p></div>
                <Button type="submit" disabled={submitting} className="mt-5 w-full rounded-xl">{submitting ? <LoaderCircle className="animate-spin" /> : <Send />} Send project brief</Button>
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="mt-2 w-full rounded-xl"><ArrowLeft /> Adjust scope</Button>
              </aside>
            </form>
          )}
        </main>
      </PanelBoundary>
    </div>
  );
}