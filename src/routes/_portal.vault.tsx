import { useCallback, useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Download, FileDown, Plus, Type, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PanelBoundary } from "@/components/error-boundary";
import { PageHeading, SectionTitle, StateLabel } from "@/components/portal-chrome";
import { createDemoId, readDemoAssets, saveDemoAssets, type PortalAsset } from "@/lib/demo-store";
import { createAsset, listAssets } from "@/lib/portal.functions";
import { usePortalSession } from "@/lib/use-portal-session";

export const Route = createFileRoute("/_portal/vault")({
  head: () => ({
    meta: [
      { title: "Brand Vault — Obsidian Atelier" },
      { name: "description", content: "Review client brand colors, typography specifications, and downloadable identity files." },
      { property: "og:title", content: "Brand Vault — Obsidian Atelier" },
      { property: "og:description", content: "One source of truth for brand color, typography, and identity files." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Vault,
});

function Vault() {
  const { session } = usePortalSession();
  const loadAssets = useServerFn(listAssets);
  const addAsset = useServerFn(createAsset);
  const [assets, setAssets] = useState<PortalAsset[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [assetType, setAssetType] = useState<"color" | "typography" | "file" | "guideline">("color");

  const refresh = useCallback(async () => {
    if (!session) return;
    if (session.isDemo) {
      setAssets(readDemoAssets());
      setLoaded(true);
      return;
    }
    try {
      setAssets(await loadAssets() as PortalAsset[]);
    } catch {
      toast.error("Your brand assets couldn't be loaded.");
    } finally {
      setLoaded(true);
    }
  }, [loadAssets, session]);
  useEffect(() => { void refresh(); }, [refresh]);

  const colorAssets = assets.filter((asset) => asset.asset_type === "color");
  const typographyAssets = assets.filter((asset) => asset.asset_type === "typography");
  const fileAssets = assets.filter((asset) => asset.asset_type === "file" || asset.asset_type === "guideline");

  const copyValue = async (asset: PortalAsset) => {
    try {
      await navigator.clipboard.writeText(asset.value);
      setCopied(asset.id);
      window.setTimeout(() => setCopied((current) => current === asset.id ? null : current), 1600);
      toast.success(`${asset.asset_type === "color" ? "Color" : "Value"} copied.`);
    } catch {
      toast.error("Clipboard access isn't available in this browser.");
    }
  };

  const downloadFile = (asset: PortalAsset) => {
    const body = `${asset.title}\n${"=".repeat(asset.title.length)}\n\n${asset.description}\n\n${asset.value}\n`;
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = asset.value.trim().split("/").pop() || `${asset.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const addBrandAsset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) return;
    try {
      if (session.isDemo) {
        const next = [...assets, { id: createDemoId(), title: title.trim(), asset_type: assetType, value: value.trim(), description: description.trim(), created_at: new Date().toISOString() }];
        setAssets(next);
        saveDemoAssets(next);
      } else {
        const row = await addAsset({ data: { title: title.trim(), assetType, value: value.trim(), description: description.trim() } });
        setAssets((current) => [...current, row as PortalAsset]);
      }
      setTitle(""); setValue(""); setDescription("");
      toast.success("Brand vault updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The asset couldn't be saved.");
    }
  };

  return (
    <PanelBoundary>
      <main>
        <PageHeading eyebrow="Client workspace · 02" title="Brand vault" description="The current source of truth for color, type, and studio-ready identity files." action={session?.isDemo ? <StateLabel tone="warning">Preview collection</StateLabel> : <StateLabel tone="good">Private brand assets</StateLabel>} />
        <section className="px-5 py-8 sm:px-8">
          <SectionTitle index="A" title="Color system" detail={`${colorAssets.length} colors`} />
          {!loaded ? <div className="py-10 text-sm text-muted-foreground">Loading brand system…</div> : colorAssets.length ? (
            <div className="grid grid-cols-2 gap-3 py-5 sm:grid-cols-3 lg:grid-cols-4">
              {colorAssets.map((asset) => (
                <article key={asset.id} className="overflow-hidden rounded-xl border border-border bg-surface">
                  <div className="h-24 border-b border-border sm:h-32" style={{ backgroundColor: /^#[0-9a-f]{6}$/i.test(asset.value) ? asset.value : undefined }} aria-label={`${asset.title}: ${asset.value}`} />
                  <div className="p-3 sm:p-4"><p className="text-sm font-medium">{asset.title}</p><p className="mt-1 text-[11px] text-muted-foreground">{asset.description}</p><div className="mt-3 flex items-center justify-between gap-2"><code className="font-mono text-xs text-primary">{asset.value}</code><Button type="button" variant="ghost" size="icon" aria-label={`Copy ${asset.title} color`} title={`Copy ${asset.value}`} onClick={() => void copyValue(asset)} className="size-8 rounded-xl">{copied === asset.id ? <Check /> : <Copy />}</Button></div></div>
                </article>
              ))}
            </div>
          ) : <div className="py-8 text-sm text-muted-foreground">The studio has not added color values yet.</div>}
        </section>

        <section className="border-t border-border px-5 py-8 sm:px-8">
          <SectionTitle index="B" title="Typography" detail="Type styles & roles" />
          {typographyAssets.length ? <div className="divide-y divide-border">{typographyAssets.map((asset) => <article key={asset.id} className="flex flex-wrap items-center gap-4 py-5"><Type className="size-4 text-primary" /><div className="min-w-0 flex-1"><h3 className="font-display text-lg font-semibold">{asset.title}</h3><p className="mt-1 text-xs text-muted-foreground">{asset.description}</p></div><code className="font-mono text-xs text-muted-foreground">{asset.value}</code><Button type="button" variant="ghost" size="icon" aria-label={`Copy ${asset.title} typography`} onClick={() => void copyValue(asset)} className="rounded-xl">{copied === asset.id ? <Check /> : <Copy />}</Button></article>)}</div> : <p className="py-6 text-sm text-muted-foreground">Typography specifications will appear here when added to your brand collection.</p>}
        </section>

        <section className="border-t border-border px-5 py-8 sm:px-8">
          <SectionTitle index="C" title="Identity files" detail="Download the current working specs" />
          {fileAssets.length ? <div className="divide-y divide-border">{fileAssets.map((asset) => <article key={asset.id} className="flex flex-wrap items-center gap-4 py-4"><FileDown className="size-4 text-primary" /><div className="min-w-0 flex-1"><h3 className="text-sm font-medium">{asset.title}</h3><p className="mt-1 text-xs text-muted-foreground">{asset.description}</p></div><code className="font-mono text-[10px] text-muted-foreground">{asset.value}</code><Button type="button" variant="outline" size="sm" onClick={() => downloadFile(asset)} className="rounded-xl"><Download /> Download</Button></article>)}</div> : <p className="py-6 text-sm text-muted-foreground">No downloadable identity files have been attached to this workspace.</p>}
        </section>

        <section className="border-t border-border bg-surface px-5 py-8 sm:px-8">
          <SectionTitle index="D" title="Add a brand reference" detail="For internal project assets" />
          <form onSubmit={(event) => void addBrandAsset(event)} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
            <label className="space-y-1.5 text-xs text-muted-foreground">Asset name<input required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Secondary ink" className="h-10 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-foreground outline-none focus:border-primary" /></label>
            <label className="space-y-1.5 text-xs text-muted-foreground">Kind<select value={assetType} onChange={(event) => setAssetType(event.target.value as typeof assetType)} className="h-10 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-foreground outline-none focus:border-primary"><option value="color">Color</option><option value="typography">Typography</option><option value="guideline">Guideline</option><option value="file">File reference</option></select></label>
            <label className="space-y-1.5 text-xs text-muted-foreground">Value or file name<input required maxLength={2000} value={value} onChange={(event) => setValue(event.target.value)} placeholder={assetType === "color" ? "#B8F21A" : "asset-spec.txt"} className="h-10 w-full rounded-xl border border-border bg-canvas px-3 font-mono text-xs text-foreground outline-none focus:border-primary" /></label>
            <Button type="submit" className="h-10 rounded-xl"><Plus /> Add reference</Button>
            <label className="space-y-1.5 text-xs text-muted-foreground sm:col-span-2 lg:col-span-4">Description<input maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Where and how should this be used?" className="h-10 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-foreground outline-none focus:border-primary" /></label>
          </form>
          <p className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground"><Upload className="size-3" /> For file references, enter a project file name; generated downloads contain the reference details.</p>
        </section>
      </main>
    </PanelBoundary>
  );
}