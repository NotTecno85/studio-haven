import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export interface PortalSession {
  id: string;
  email: string;
  displayName: string;
  company: string;
  isDemo: boolean;
}

const DEMO_SESSION_KEY = "studio_demo_session";

export function hasDemoSession(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DEMO_SESSION_KEY) === "active";
}

function previewSession(): PortalSession {
  return {
    id: "demo-session",
    email: "Preview workspace",
    displayName: "Studio client",
    company: "Preview mode",
    isDemo: true,
  };
}

async function toPortalSession(user: User): Promise<PortalSession> {
  const profileResult = await supabase?.from("profiles").select("display_name, company").eq("user_id", user.id).maybeSingle();
  return {
    id: user.id,
    email: user.email ?? "Signed-in client",
    displayName: profileResult?.data?.display_name || user.user_metadata["display_name"] || "Client",
    company: profileResult?.data?.company || user.user_metadata["company"] || "",
    isDemo: false,
  };
}

export function usePortalSession() {
  const [session, setSession] = useState<PortalSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const client = supabase;
    if (!client) {
      setSession(hasDemoSession() ? previewSession() : null);
      setReady(true);
      return;
    }

    const loadUser = async () => {
      const { data, error } = await client.auth.getUser();
      if (!active) return;
      if (!error && data.user) {
        setSession(await toPortalSession(data.user));
      } else {
        setSession(hasDemoSession() ? previewSession() : null);
      }
      if (active) setReady(true);
    };

    const { data } = client.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setSession(hasDemoSession() ? previewSession() : null);
        setReady(true);
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        void loadUser();
      }
    });
    void loadUser();

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { session, ready, isSupabaseConfigured };
}