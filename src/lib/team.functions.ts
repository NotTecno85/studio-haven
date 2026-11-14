import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const sendTeamInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ inviteId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: invite, error } = await context.supabase
      .from("team_invites")
      .select("id, invite_email, owner_id, status")
      .eq("id", data.inviteId)
      .eq("owner_id", context.userId)
      .maybeSingle();

    if (error || !invite || invite.status !== "pending") {
      throw new Error("That invitation could not be verified. Refresh the team list and try again.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(invite.invite_email, {
      redirectTo: `${process.env["SUPABASE_URL"]?.replace(/\/$/, "") ?? ""}/auth/callback`,
    });

    if (inviteError) {
      const message = inviteError.message.toLowerCase();
      if (message.includes("already registered") || message.includes("already been registered") || message.includes("already exists")) {
        return { emailSent: false, existingAccount: true };
      }
      throw new Error("We couldn't send that invitation email. The pending invitation has been saved; try again later.");
    }

    return { emailSent: true, existingAccount: false };
  });