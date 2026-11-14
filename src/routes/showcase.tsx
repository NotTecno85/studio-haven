import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, MoveRight, X } from "lucide-react";
import limeImage from "@/assets/case-lime.jpg";
import cobaltImage from "@/assets/case-cobalt.jpg";
import architectureImage from "@/assets/case-architectural.jpg";
import coralImage from "@/assets/case-coral.jpg";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { PanelBoundary } from "@/components/error-boundary";
import { PublicHeader } from "@/components/portal-chrome";

export const Route = createFileRoute("/showcase")({
  head: () => ({
    meta: [
      { title: "Selected Work — Obsidian Atelier" },
      { name: "description", content: "Explore selected identity, digital product, editorial, and campaign projects from Obsidian Atelier." },
      { property: "og:title", content: "Selected Work — Obsidian Atelier" },
      { property: "og:description", content: "A focused collection of brand and digital design projects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Showcase,
});

const categories = ["All work", "Identity", "Digital", "Editorial", "Campaign"] as const;
type Category = (typeof categories)[number];

const projects = [
  { title: "Botanical, made bolder", client: "Verdant House", category: "Identity", year: "2026", image: limeImage, challenge: "An emerging care brand needed its botanical story to feel precise, premium, and unmistakably modern.", solution: "We paired a distilled wordmark with a vivid green visual language and a tactile packaging system.", deliverables: ["Brand strategy", "Visual identity", "Packaging direction"] },
  { title: "A room for new rituals", client: "Forme Objects", category: "Digital", year: "2026", image: cobaltImage, challenge: "A growing furniture studio had beautiful pieces but no confident way to present a complete collection online.", solution: "A sculptural, product-led commerce concept gives each object room to breathe while clarifying the buying journey.", deliverables: ["Commerce UX", "Art direction", "Product page system"] },
  { title: "Quiet geometry", client: "Linea Journal", category: "Editorial", year: "2025", image: architectureImage, challenge: "A quarterly print publication wanted a new identity that would feel architectural without becoming cold.", solution: "A flexible typographic grid and restrained image treatment lets each issue take its own shape.", deliverables: ["Editorial identity", "Publication system", "Art direction"] },
  { title: "Energy in motion", client: "Rally Athletics", category: "Campaign", year: "2025", image: coralImage, challenge: "A performance label needed a launch system that could travel across motion, social, and outdoor placements.", solution: "An expressive color palette and kinetic forms bring the campaign together without relying on a single format.", deliverables: ["Campaign concept", "Motion direction", "Social toolkit"] },
] as const;

function Showcase() {
  const [category, setCategory] = useState<Category>("All work");
  const [selected, setSelected] = useState<(typeof projects)[number] | null>(null);
  const visibleProjects = category === "All work" ? projects : projects.filter((project) => project.category === category);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <PanelBoundary>
        <main className="mx-auto max-w-[1600px] px-5 pb-20 sm:px-8">
          <section className="grid gap-8 border-b border-border py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:py-20">
            <div>
              <p className="font-mono text-xs uppercase text-primary">Independent design practice · 2026</p>
              <h1 className="headline mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-6xl">We make complex brands feel <span className="text-primary">obvious.</span></h1>
            </div>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:pb-2">
              <p className="max-w-md text-sm leading-6 text-muted-foreground">Strategy, identity, and digital experiences built to move ambitious teams forward.</p>
              <a href="/onboarding" className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary">Scope a project <MoveRight className="size-4" /></a>
            </div>
          </section>

          <section className="pt-7">
            <div className="flex flex-wrap items-center gap-2 border-b border-border pb-5" aria-label="Project categories">
              {categories.map((item) => (
                <Button key={item} type="button" variant={category === item ? "secondary" : "ghost"} aria-pressed={category === item} onClick={() => setCategory(item)} className={category === item ? "rounded-xl border border-primary/40 bg-primary/10 text-primary" : "rounded-xl text-muted-foreground"}>{item}</Button>
              ))}
              <span className="ml-auto font-mono text-xs text-muted-foreground">{visibleProjects.length.toString().padStart(2, "0")} projects</span>
            </div>

            <div className="grid gap-x-5 gap-y-9 py-7 sm:grid-cols-2">
              {visibleProjects.map((project, index) => (
                <button key={project.title} type="button" onClick={() => setSelected(project)} className="group cursor-pointer text-left">
                  <span className="relative block aspect-[1.36] overflow-hidden rounded-xl bg-surface">
                    <img src={project.image} alt={`${project.title} art direction`} loading="lazy" width={960} height={720} className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
                    <span className="absolute left-4 top-4 rounded-xl border border-border bg-background/85 px-2.5 py-1 font-mono text-[10px] uppercase text-foreground">0{index + 1} · {project.category}</span>
                    <span className="absolute bottom-4 right-4 flex size-9 items-center justify-center rounded-xl border border-border bg-background/85 text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><ArrowUpRight className="size-4" /></span>
                  </span>
                  <span className="mt-4 flex items-start justify-between gap-4">
                    <span><span className="headline block font-display text-lg font-semibold">{project.title}</span><span className="mt-1 block text-xs text-muted-foreground">{project.client} · {project.year}</span></span>
                    <span className="pt-1 font-mono text-[10px] text-muted-foreground">CASE 0{index + 1}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </main>
      </PanelBoundary>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <SheetContent side="right" className="w-full overflow-y-auto border-border bg-surface sm:max-w-xl">
          {selected ? (
            <div className="pt-9">
              <p className="font-mono text-xs uppercase text-primary">{selected.client} · {selected.category} · {selected.year}</p>
              <SheetTitle className="headline mt-4 font-display text-3xl font-semibold">{selected.title}</SheetTitle>
              <SheetDescription className="mt-3 text-sm leading-6 text-muted-foreground">A selected project from the Obsidian Atelier practice.</SheetDescription>
              <img src={selected.image} alt={`${selected.title} project`} loading="lazy" width={960} height={720} className="mt-7 aspect-[1.2] w-full rounded-xl object-cover" />
              <div className="mt-8 space-y-7">
                <div><p className="font-mono text-[10px] uppercase text-muted-foreground">01 · The challenge</p><p className="mt-2 text-sm leading-6 text-foreground">{selected.challenge}</p></div>
                <div><p className="font-mono text-[10px] uppercase text-muted-foreground">02 · The response</p><p className="mt-2 text-sm leading-6 text-foreground">{selected.solution}</p></div>
                <div><p className="font-mono text-[10px] uppercase text-muted-foreground">03 · Deliverables</p><ul className="mt-3 space-y-2">{selected.deliverables.map((item) => <li key={item} className="flex items-center gap-2 text-sm"><span className="size-1.5 rounded-full bg-primary" />{item}</li>)}</ul></div>
              </div>
              <Button asChild className="mt-9 rounded-xl"><a href="/onboarding">Plan a project <ArrowUpRight /></a></Button>
              <SheetClose asChild><Button variant="ghost" size="icon" aria-label="Close project details" className="absolute right-4 top-4 rounded-xl"><X /></Button></SheetClose>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}