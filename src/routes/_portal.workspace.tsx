import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-router";
import { ArrowRight, Check, Circle, ClipboardCheck, FilePlus2, MessageSquareText, Plus, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PanelBoundary } from "@/components/error-boundary";
import { PageHeading, SectionTitle, StateLabel } from "@/components/portal-chrome";
import { createDemoId, readDemoDeliverables, saveDemoDeliverables, type PortalDeliverable } from "@/lib/demo-store";
import { createDeliverable, listDeliverables, updateDeliverable } from "@/lib/portal.functions";
import { usePortalSession } from "@/lib/use-portal-session";

export const Route = createFileRoute("/_portal/workspace")({
  head: () => ({
    meta: [
      { title: "Sprint & Approvals — Obsidian Atelier" },
      { name: "description", content: "Review design deliverables, share feedback, and manage client sprint requests." },
      { property: "og:title", content: "Sprint & Approvals — Obsidian Atelier" },
      { property: "og:description", content: "A focused view of project progress and design approvals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

const statusLabel: Record<PortalDeliverable["status"], string> = {
  in_progress: "In progress",
  in_review: "Ready for review",
  approved: "Approved",
};

function Workspace() {
  const { session } = usePortalSession();
  const fetchRows = useServerFn(listDeliverables);
  const addRow = useServerFn(createDeliverable);
  const updateRow = useServerFn(updateDeliverable);
  const [rows, setRows] = useState<PortalDeliverable[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session) return;
    if (session.isDemo) {
      setRows(readDemoDeliverables());
      setLoaded(true);
      return;
    }
    try {
      const data = await fetchRows();
      setRows(data as PortalDeliverable[]);
    } catch {
      toast.error("Your project list couldn't be loaded.");
    } finally {
      setLoaded(true);
    }
  }, [fetchRows, session]);

  useEffect(() => { void refresh(); }, [refresh]);

  const addTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || !session) return;
    setBusyId("new");
    try {
      if (session.isDemo) {
        const now = new Date().toISOString();
        const next = [{ id: createDemoId(), title: cleanTitle, description: description.trim(), status: "in_progress" as const, feedback: "", created_at: now, updated_at: now }, ...rows];
        setRows(next);
        saveDemoDeliverables(next);
      } else {
        const created = await addRow({ data: { title: cleanTitle, description: description.trim() } });
        setRows((current) => [created as PortalDeliverable, ...current]);
      }
      setTitle("");
      setDescription("");
      toast.success("The request was added to your sprint.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The request could not be added.");
    } finally {
      setBusyId(null);
    }
  };

  const changeStatus = async (row: PortalDeliverable) => {
    if (!session || row.status === "approved") return;
    const status: PortalDeliverable["status"] = row.status === "in_review" ? "approved" : "in_review";
    setBusyId(row.id);
    try {
      const next = rows.map((item) => item.id === row.id ? { ...item, status, updated_at: new Date().toISOString() } : item);
      if (session.isDemo) {
        setRows(next);
        saveDemoDeliverables(next);
      } else {
        const updated = await updateRow({ data: { id: row.id, status } });
        setRows((current) => current.map((item) => item.id === row.id ? updated as PortalDeliverable : item));
      }
      toast.success(status === "approved" ? "Deliverable approved." : "Deliverable moved to review.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The status couldn't be updated.");
    } finally {
      setBusyId(null);
    }
  };

  const saveFeedback = async (row: PortalDeliverable) => {
    if (!session) return;
    const feedback = feedbackDrafts[row.id] ?? row.feedback;
    setBusyId(row.id);
    try {
      if (session.isDemo) {
        const next = rows.map((item) => item.id === row.id ? { ...item, feedback, updated_at: new Date().toISOString() } : item);
        setRows(next);
        saveDemoDeliverables(next);
      } else {
        const updated = await updateRow({ data: { id: row.id, feedback } });
        setRows((current) => current.map((item) => item.id === row.id ? updated as PortalDeliverable : item));
      }
      toast.success("Feedback saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Feedback couldn't be saved.");
    } finally {
      setBusyId(null);
    }
  };

  const approved = rows.filter((row) => row.status === "approved").length;
  const review = rows.filter((row) => row.status === "in_review").length;

  return (
    <PanelBoundary>
      <main>
        <PageHeading eyebrow="Client workspace · 01" title="Sprint & approvals" description="Keep decisions moving. Review the current work, leave a useful note, or add a request to the sprint." action={session?.isDemo ? <StateLabel tone="warning">Preview data · stored on this device</StateLabel> : <StateLabel tone="good">Private client workspace</StateLabel>} />

        <section className="grid border-b border-border sm:grid-cols-3">
          <div className="border-b border-border px-5 py-5 sm:border-b-0 sm:border-r sm:px-8"><p className="font-mono text-[10px] uppercase text-muted-foreground">In this sprint</p><p className="headline mt-2 font-display text-3xl font-semibold">{rows.length.toString().padStart(2, "0")}</p></div>
          <div className="border-b border-border px-5 py-5 sm:border-b-0 sm:border-r sm:px-8"><p className="font-mono text-[10px] uppercase text-muted-foreground">Awaiting your review</p><p className="headline mt-2 font-display text-3xl font-semibold text-chart-4">{review.toString().padStart(2, "0")}</p></div>
          <div className="px-5 py-5 sm:px-8"><p className="font-mono text-[10px] uppercase text-muted-foreground">Approved</p><p className="headline mt-2 font-display text-3xl font-semibold text-primary">{approved.toString().padStart(2, "0")}</p></div>
        </section>

        <section className="px-5 py-8 sm:px-8">
          <SectionTitle index="A" title="Active deliverables" detail={`${rows.length} in the workspace`} />
          {!loaded ? <div className="py-12 text-center text-sm text-muted-foreground">Loading project work…</div> : rows.length === 0 ? (
            <div className="border-b border-border py-12 text-center"><Sparkles className="mx-auto size-5 text-primary" /><p className="mt-3 text-sm">Your first sprint is ready to take shape.</p><p className="mt-1 text-xs text-muted-foreground">Add a request below to start the conversation.</p></div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((row, index) => {
                const tone = row.status === "approved" ? "good" : row.status === "in_review" ? "warning" : "neutral";
                return (
                  <article key={row.id} className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)] lg:gap-10">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3"><span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span><h3 className="headline font-display text-base font-semibold">{row.title}</h3><StateLabel tone={tone}>{statusLabel[row.status]}</StateLabel></div>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{row.description || "No project note has been added yet."}</p>
                      {row.feedback ? <p className="mt-4 border-l-2 border-primary/50 pl-3 text-xs leading-5 text-muted-foreground">Last note: {row.feedback}</p> : null}
                      <Button type="button" size="sm" variant="outline" disabled={busyId === row.id || row.status === "approved"} onClick={() => void changeStatus(row)} className="mt-4 rounded-xl">
                        {row.status === "approved" ? <Check /> : row.status === "in_review" ? <ClipboardCheck /> : <Circle />}
                        {row.status === "approved" ? "Approved" : row.status === "in_review" ? "Approve deliverable" : "Mark ready for review"}
                      </Button>
                    </div>
                    <form onSubmit={(event) => { event.preventDefault(); void saveFeedback(row); }} className="border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                      <label htmlFor={`feedback-${row.id}`} className="flex items-center gap-2 text-xs font-medium"><MessageSquareText className="size-3.5 text-primary" /> Feedback for the studio</label>
                      <textarea id={`feedback-${row.id}`} value={feedbackDrafts[row.id] ?? row.feedback} maxLength={1200} onChange={(event) => setFeedbackDrafts((current) => ({ ...current, [row.id]: event.target.value }))} rows={2} placeholder="Add a decision, question, or revision note…" className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 text-xs leading-5 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" />
                      <Button type="submit" size="sm" variant="ghost" disabled={busyId === row.id} className="mt-2 rounded-xl px-2"><Send /> Save feedback</Button>
                    </form>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="border-t border-border bg-surface px-5 py-8 sm:px-8">
          <SectionTitle index="B" title="Add a task request" detail="A little context helps the studio estimate the next step" />
          <form onSubmit={(event) => void addTask(event)} className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <label className="space-y-1.5 text-xs text-muted-foreground">Request title<input required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Explore a second landing page direction" className="h-10 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" /></label>
            <label className="space-y-1.5 text-xs text-muted-foreground">Context<textarea maxLength={1200} rows={1} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What should the studio know?" className="min-h-10 w-full resize-y rounded-xl border border-border bg-canvas px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" /></label>
            <Button type="submit" disabled={busyId === "new"} className="h-10 rounded-xl"><Plus /> Add request <ArrowRight /></Button>
          </form>
        </section>
      </main>
    </PanelBoundary>
  );
}