import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceHeader } from "@/routes/client";
import { PanelBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/client/booker")({
  head: () => ({
    meta: [
      { title: "Session Booker — Obsidian Atelier Workspace" },
      {
        name: "description",
        content: "Coordination calendar with selectable timeline blocks and a live session scheduling trigger.",
      },
      { property: "og:title", content: "Session Booker — Client Workspace" },
      { property: "og:description", content: "Coordinate design sessions on the studio timeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientBooker,
});

interface TimelineBlock {
  id: string;
  day: string;
  time: string;
  label: string;
  open: boolean;
}

const BLOCKS: TimelineBlock[] = [
  { id: "tue-10", day: "Tue", time: "10:00", label: "Design review", open: true },
  { id: "tue-14", day: "Tue", time: "14:00", label: "Motion crit", open: false },
  { id: "wed-09", day: "Wed", time: "09:00", label: "Brand walkthrough", open: true },
  { id: "wed-16", day: "Wed", time: "16:00", label: "Handoff sync", open: true },
  { id: "thu-11", day: "Thu", time: "11:00", label: "Design system QA", open: true },
  { id: "fri-15", day: "Fri", time: "15:00", label: "Executive readout", open: false },
];

interface BookedSession {
  id: number;
  block: string;
  topic: string;
}

let sessionId = 100;

function ClientBooker() {
  const [selected, setSelected] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [booked, setBooked] = useState<BookedSession[]>([
    { id: 1, block: "Mon 10:00 · Kickoff", topic: "Engagement kickoff" },
  ]);

  const schedule = () => {
    const block = BLOCKS.find((b) => b.id === selected);
    if (!block || !topic.trim()) return;
    setBooked((prev) => [
      ...prev,
      { id: sessionId++, block: `${block.day} ${block.time} · ${block.label}`, topic: topic.trim() },
    ]);
    toast.success("Session scheduled", {
      description: `${block.day} ${block.time} — ${topic.trim()}`,
    });
    setTopic("");
    setSelected(null);
  };

  return (
    <div>
      <WorkspaceHeader
        title="Session Booker"
        subtitle="Pick an open timeline block, then trigger the scheduling request with a topic."
      />

      <div className="grid grid-cols-1 gap-6 px-8 py-8 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <PanelBoundary>
            <div className="rounded-xl border border-border bg-surface p-6">
              <h2 className="headline font-display text-lg font-semibold">Week timeline</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Closed blocks are already claimed by the studio.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                {BLOCKS.map((block) => {
                  const isSelected = selected === block.id;
                  return (
                    <button
                      key={block.id}
                      type="button"
                      disabled={!block.open}
                      onClick={() => setSelected(isSelected ? null : block.id)}
                      className={
                        isSelected
                          ? "rounded-xl border border-primary bg-primary/10 p-4 text-left shadow-[var(--shadow-emerald)]"
                          : block.open
                            ? "rounded-xl border border-border bg-canvas p-4 text-left transition-colors hover:bg-surface-2"
                            : "rounded-xl border border-border bg-canvas p-4 text-left opacity-40"
                      }
                    >
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3.5" />
                        {block.day} · {block.time}
                      </div>
                      <p className="mt-2 text-sm font-medium">{block.label}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                        {block.open ? (isSelected ? "Selected" : "Open") : "Booked"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </PanelBoundary>

          <PanelBoundary>
            <div className="mt-6 rounded-xl border border-border bg-surface p-6">
              <h2 className="headline font-display text-lg font-semibold">Scheduled sessions</h2>
              <div className="mt-4 space-y-2">
                {booked.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-canvas px-4 py-3"
                  >
                    <CalendarCheck className="size-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{session.block}</p>
                      <p className="truncate text-xs text-muted-foreground">{session.topic}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PanelBoundary>
        </div>

        <div className="xl:col-span-5">
          <PanelBoundary>
            <div className="rounded-xl border border-border bg-surface p-6">
              <h2 className="headline font-display text-lg font-semibold">Scheduling trigger</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {selected
                  ? "Block locked in — name the session."
                  : "Select an open timeline block first."}
              </p>
              <div className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="session-topic" className="text-xs text-muted-foreground">
                    Session topic
                  </label>
                  <input
                    id="session-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Q3 brand system review"
                    className="h-10 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={schedule}
                  disabled={!selected || !topic.trim()}
                  className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Schedule Session
                </button>
              </div>
            </div>
          </PanelBoundary>
        </div>
      </div>
    </div>
  );
}
