export const PORTAL_NAV = [
  { to: "/workspace", label: "Sprint & approvals", group: "Client portal" },
  { to: "/vault", label: "Brand vault", group: "Client portal" },
  { to: "/billing", label: "Billing", group: "Client portal" },
  { to: "/settings", label: "Profile & team", group: "Client portal" },
] as const;

export const SERVICE_OPTIONS = [
  { name: "Brand strategy", fee: 4800, note: "Positioning, narrative, and direction" },
  { name: "Visual identity", fee: 6200, note: "Identity system and launch toolkit" },
  { name: "Product design", fee: 7400, note: "Research, interface, and prototyping" },
  { name: "Digital experience", fee: 5800, note: "Website art direction and design" },
  { name: "Motion system", fee: 3900, note: "Motion principles and key moments" },
] as const;

export function estimateScope(services: string[], timelineWeeks: number): number {
  const selectedTotal = SERVICE_OPTIONS.reduce(
    (sum, service) => sum + (services.includes(service.name) ? service.fee : 0),
    0,
  );
  if (selectedTotal === 0) return 0;

  const paceFactor = timelineWeeks < 6 ? 1.2 : timelineWeeks < 8 ? 1.1 : timelineWeeks > 14 ? 0.95 : 1;
  return Math.round((selectedTotal * paceFactor) / 100) * 100;
}

export const DEMO_DELIVERABLES = [
  { title: "Identity system · round 02", description: "Refined symbol, type pairing, and core lockups.", status: "in_review", feedback: "" },
  { title: "Product foundations", description: "Navigation model and dashboard component direction.", status: "in_progress", feedback: "" },
  { title: "Launch motion frames", description: "Three key moments for the launch sequence.", status: "approved", feedback: "Approved for final production." },
] as const;

export const DEMO_BRAND_ASSETS = [
  { title: "Electric lime", asset_type: "color", value: "#B8F21A", description: "Primary brand signal" },
  { title: "Cobalt field", asset_type: "color", value: "#1756F2", description: "Digital surface accent" },
  { title: "Ink", asset_type: "color", value: "#121416", description: "Primary text and mark" },
  { title: "Paper", asset_type: "color", value: "#F4F1E8", description: "Light canvas" },
  { title: "Display type", asset_type: "typography", value: "Space Grotesk · 600", description: "Headline and wordmark" },
  { title: "Editorial type", asset_type: "typography", value: "DM Sans · 400 / 500", description: "Body copy and captions" },
  { title: "Brand guide", asset_type: "file", value: "brand-guidelines.txt", description: "Identity rules and typography specs" },
  { title: "Logo suite", asset_type: "file", value: "logo-suite.txt", description: "Primary, compact, and reversed marks" },
] as const;

export const DEMO_INVOICES = [
  { number: "OA-2026-06", period: "June 2026", amount: "$12,400", status: "Paid" },
  { number: "OA-2026-05", period: "May 2026", amount: "$12,400", status: "Paid" },
  { number: "OA-2026-04", period: "April 2026", amount: "$12,400", status: "Paid" },
] as const;

export type DemoDeliverable = (typeof DEMO_DELIVERABLES)[number] & { id: string };
export type DemoAsset = (typeof DEMO_BRAND_ASSETS)[number] & { id: string };

export function withDemoIds<T extends object>(rows: readonly T[]): (T & { id: string })[] {
  return rows.map((row, index) => ({ ...row, id: `demo-${index + 1}` }));
}