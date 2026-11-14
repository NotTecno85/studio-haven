import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Obsidian Atelier — Design Client Portal" },
      { name: "description", content: "A considered design portfolio and client workspace for sprint approvals, brand assets, and retainer planning." },
      { property: "og:title", content: "Obsidian Atelier — Design Client Portal" },
      { property: "og:description", content: "Explore studio work or continue into a clear, connected design engagement." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/showcase" });
  },
});