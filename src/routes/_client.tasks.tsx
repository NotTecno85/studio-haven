import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, CircleDashed, Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { WorkspaceHeader } from "@/routes/_client";
import { PanelBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/_client/tasks")({
  head: () => ({
    meta: [
      { title: "Milestones — Obsidian Atelier Workspace" },
      {
        name: "description",
        content: "Live milestone tracker for active design engagements — add, toggle, and clear deliverables.",
      },
      { property: "og:title", content: "Milestones — Client Workspace" },
      { property: "og:description", content: "Live milestone tracker for active engagements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientTasks,
});

interface Milestone {
  id: number;
  title: string;
  phase: string;
  done: boolean;
}

let nextId = 100;

function ClientTasks() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 1, title: "Brand identity exploration — round 2", phase: "Design", done: true },
    { id: 2, title: "Design system token audit", phase: "Product", done: false },
    { id: 3, title: "Launch film storyboard lock", phase: "Motion", done: false },
  ]);
  const [draft, setDraft] = useState("");

  const addDeliverable = () => {
    const title = draft.trim();
    if (!title) return;
    setMilestones((prev) => [
      ...prev,
      { id: nextId++, title, phase: "New", done: false },
    ]);
    setDraft("");
  };

  const toggle = (id: number, done: boolean) =>
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, done } : m)));

  const remove = (id: number) => setMilestones((prev) => prev.filter((m) => m.id !== id));

  const completed = milestones.filter((m) => m.done).length;

  return (
    <div>
      <WorkspaceHeader
        title="Milestone Tracker"
        subtitle={`${completed} of ${milestones.length} deliverables cleared on this engagement.`}
      />

      <div className="px-8 py-8">
        <PanelBoundary>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addDeliverable()}
              placeholder="Name the next deliverable…"
              aria-label="New deliverable"
              className="h-11 flex-1 rounded-xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
            <button
              type="button"
              onClick={addDeliverable}
              disabled={!draft.trim()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-4" />
              Add Deliverable
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  {m.done ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  ) : (
                    <CircleDashed className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0">
                    <p
                      className={
                        m.done
                          ? "truncate text-sm text-muted-foreground line-through"
                          : "truncate text-sm text-foreground"
                      }
                    >
                      {m.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{m.phase} phase</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Switch
                    checked={m.done}
                    onCheckedChange={(checked) => toggle(m.id, checked)}
                    aria-label={`Toggle ${m.title}`}
                  />
                  <button
                    type="button"
                    onClick={() => remove(m.id)}
                    aria-label={`Remove ${m.title}`}
                    className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </PanelBoundary>
      </div>
    </div>
  );
}
