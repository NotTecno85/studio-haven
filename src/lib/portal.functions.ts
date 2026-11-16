import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const deliverableInput = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1200).default(""),
});

export const listDeliverables = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("deliverables")
      .select("id, title, description, status, feedback, created_at, updated_at")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error("Your deliverables could not be loaded.");
    return data ?? [];
  });

export const createDeliverable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deliverableInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("deliverables")
      .insert({ user_id: context.userId, title: data.title, description: data.description, status: "in_progress" })
      .select("id, title, description, status, feedback, created_at, updated_at")
      .single();
    if (error) throw new Error("The task request could not be saved.");
    return row;
  });

export const updateDeliverable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    id: z.string().uuid(),
    status: z.enum(["in_progress", "in_review", "approved"]).optional(),
    feedback: z.string().trim().max(1200).optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const updates: { status?: string; feedback?: string; updated_at: string } = { updated_at: new Date().toISOString() };
    if (data.status) updates.status = data.status;
    if (data.feedback !== undefined) updates.feedback = data.feedback;
    const { data: row, error } = await context.supabase
      .from("deliverables")
      .update(updates)
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select("id, title, description, status, feedback, created_at, updated_at")
      .maybeSingle();
    if (error || !row) throw new Error("That deliverable could not be updated.");
    return row;
  });

export const listAssets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("assets")
      .select("id, title, asset_type, value, description, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    if (error) throw new Error("Your brand assets could not be loaded.");
    return data ?? [];
  });

export const createAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    title: z.string().trim().min(1).max(120),
    assetType: z.enum(["color", "typography", "file", "guideline"]),
    value: z.string().trim().min(1).max(2000),
    description: z.string().trim().max(500).default(""),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("assets")
      .insert({ user_id: context.userId, title: data.title, asset_type: data.assetType, value: data.value, description: data.description })
      .select("id, title, asset_type, value, description, created_at")
      .single();
    if (error) throw new Error("The brand asset could not be saved.");
    return row;
  });

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("user_id, display_name, company, avatar_url, created_at, updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error("Your profile could not be loaded.");
    return data;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    displayName: z.string().trim().min(1).max(120),
    company: z.string().trim().max(160),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("profiles")
      .upsert({ user_id: context.userId, display_name: data.displayName, company: data.company, updated_at: new Date().toISOString() })
      .select("user_id, display_name, company, avatar_url, created_at, updated_at")
      .single();
    if (error) throw new Error("Your profile changes could not be saved.");
    return row;
  });

export const listTeamInvites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("team_invites")
      .select("id, invite_email, access_level, status, created_at, member_user_id")
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error("Team access could not be loaded.");
    return data ?? [];
  });

export const createTeamInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    email: z.string().trim().email().max(255),
    accessLevel: z.enum(["editor", "viewer"]),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: invite, error } = await context.supabase
      .from("team_invites")
      .insert({ owner_id: context.userId, invite_email: data.email.toLowerCase(), access_level: data.accessLevel, status: "pending" })
      .select("id, invite_email, access_level, status, created_at, member_user_id")
      .single();
    if (error) throw new Error("That team member could not be added.");
    return invite;
  });

export const removeTeamInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("team_invites").delete().eq("id", data.id).eq("owner_id", context.userId);
    if (error) throw new Error("That team invitation could not be removed.");
    return { ok: true };
  });

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
    if (error || !invite || invite.status !== "pending") throw new Error("That invitation could not be verified.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: invitationError } = await supabaseAdmin.auth.admin.inviteUserByEmail(invite.invite_email, {
      redirectTo: `${getRequestHeader("origin") ?? ""}/signin`,
    });
    if (invitationError) {
      const message = invitationError.message.toLowerCase();
      if (message.includes("already registered") || message.includes("already been registered") || message.includes("already exists")) {
        return { emailSent: false, existingAccount: true };
      }
      throw new Error("The invitation email could not be sent. Please try again.");
    }
    return { emailSent: true, existingAccount: false };
  });