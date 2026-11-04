import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Database, Globe, KeyRound, Terminal } from "lucide-react";
import { WorkspaceHeader } from "@/routes/client";
import { PanelBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/client/assets")({
  head: () => ({
    meta: [
      { title: "Asset Vault — Obsidian Atelier Workspace" },
      {
        name: "description",
        content: "Developer asset command vault: environment keys, endpoints, and schema snippets with one-click copy.",
      },
      { property: "og:title", content: "Asset Vault — Client Workspace" },
      { property: "og:description", content: "Environment keys, endpoints, and schema snippets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientAssets,
});

interface AssetSnippet {
  id: string;
  title: string;
  kind: "env" | "endpoint" | "schema" | "command";
  code: string;
}

const SNIPPETS: AssetSnippet[] = [
  {
    id: "api-key",
    title: "Design API key",
    kind: "env",
    code: "OBSIDIAN_STUDIO_KEY=oa_live_4f9c2e7a1d8b",
  },
  {
    id: "cdn",
    title: "Asset CDN origin",
    kind: "endpoint",
    code: "https://cdn.obsidian-atelier.io/clients/primary/",
  },
  {
    id: "tokens",
    title: "Token export table",
    kind: "schema",
    code: "CREATE TABLE design_tokens (\n  id UUID PRIMARY KEY,\n  name TEXT NOT NULL,\n  value TEXT NOT NULL,\n  scope TEXT DEFAULT 'global'\n);",
  },
  {
    id: "sync",
    title: "Token sync command",
    kind: "command",
    code: "npx obsidian-tokens pull --project primary --watch",
  },
];

const KIND_ICON = {
  env: KeyRound,
  endpoint: Globe,
  schema: Database,
  command: Terminal,
} as const;

function ClientAssets() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = async (snippet: AssetSnippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = snippet.code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedId(snippet.id);
    window.setTimeout(() => setCopiedId((cur) => (cur === snippet.id ? null : cur)), 1600);
  };

  return (
    <div>
      <WorkspaceHeader
        title="Asset Command Vault"
        subtitle="Developer handoff material — click any block to copy it with clipboard verification."
      />

      <div className="px-8 py-8">
        <PanelBoundary>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {SNIPPETS.map((snippet) => {
              const Icon = KIND_ICON[snippet.kind];
              const copied = copiedId === snippet.id;
              return (
                <div
                  key={snippet.id}
                  className="overflow-hidden rounded-xl border border-border bg-surface"
                >
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-4 text-primary" />
                      <span className="text-sm font-medium">{snippet.title}</span>
                      <span className="rounded-xl border border-border bg-canvas px-2 py-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                        {snippet.kind}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copy(snippet)}
                      aria-label={`Copy ${snippet.title}`}
                      className={
                        copied
                          ? "inline-flex items-center gap-1.5 rounded-xl border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                          : "inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                      }
                    >
                      {copied ? (
                        <>
                          <Check className="size-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="overflow-x-auto border-t border-border bg-canvas px-5 py-4 text-left">
                    <code className="font-mono text-xs leading-relaxed text-foreground">
                      {snippet.code}
                    </code>
                  </pre>
                </div>
              );
            })}
          </div>
        </PanelBoundary>
      </div>
    </div>
  );
}
