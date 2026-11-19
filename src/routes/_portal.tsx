import { createFileRoute, redirect } from "@tanstack/react-router";
import { PortalLayout } from "@/components/portal-chrome";
import { hasDemoSession } from "@/lib/use-portal-session";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_portal")({
  beforeLoad: async () => {
    if (typeof window === "undefined" || hasDemoSession()) return;
    const { data, error } = await supabase?.auth.getUser() ?? { data: { user: null }, error: null };
    if (error || !data.user) throw redirect({ to: "/signin" });
  },
  component: PortalLayout,
});