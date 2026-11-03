export const SESSION_TOKEN_KEY = "app_secure_session_token";
export const GUEST_DEMO_TOKEN = "guest_demo_authorized";

export function readSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_TOKEN_KEY);
}

export function writeGuestDemoSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_TOKEN_KEY, GUEST_DEMO_TOKEN);
}

export function clearSessionToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_TOKEN_KEY);
}
