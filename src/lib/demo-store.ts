import { DEMO_DELIVERABLES, DEMO_BRAND_ASSETS, withDemoIds } from "@/lib/portal-model";

const DELIVERABLES_KEY = "studio_demo_deliverables_v1";
const ASSETS_KEY = "studio_demo_assets_v1";

export interface PortalDeliverable {
  id: string;
  title: string;
  description: string;
  status: "in_progress" | "in_review" | "approved";
  feedback: string;
  created_at: string;
  updated_at: string;
}

export interface PortalAsset {
  id: string;
  title: string;
  asset_type: string;
  value: string;
  description: string;
  created_at: string;
}

function readList<T>(key: string): T[] | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as T[] : null;
  } catch {
    return null;
  }
}

function storeList<T>(key: string, rows: T[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(rows));
  } catch {
    // Keep the active preview usable even when browser storage is full or disabled.
  }
}

export function readDemoDeliverables(): PortalDeliverable[] {
  return readList<PortalDeliverable>(DELIVERABLES_KEY) ?? withDemoIds(DEMO_DELIVERABLES).map((row) => ({ ...row, created_at: "2026-06-01T12:00:00.000Z", updated_at: "2026-06-01T12:00:00.000Z" }));
}

export function saveDemoDeliverables(rows: PortalDeliverable[]): void {
  storeList(DELIVERABLES_KEY, rows);
}

export function readDemoAssets(): PortalAsset[] {
  return readList<PortalAsset>(ASSETS_KEY) ?? withDemoIds(DEMO_BRAND_ASSETS).map((row) => ({ ...row, created_at: "2026-06-01T12:00:00.000Z" }));
}

export function saveDemoAssets(rows: PortalAsset[]): void {
  storeList(ASSETS_KEY, rows);
}

export function createDemoId(): string {
  return `preview-${Date.now()}-${window.performance.now().toFixed(0)}`;
}