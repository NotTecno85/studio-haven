import { useCallback, useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, MailPlus, RefreshCw, Save, Shield, Trash2, Users, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PanelBoundary } from "@/components/error-boundary";
import { PageHeading, SectionTitle, StateLabel } from "@/components/portal-chrome";
import { createTeamInvite, getProfile, listTeamInvites, removeTeamInvite, sendTeamInvite, updateProfile } from "@/lib/portal.functions";
import { usePortalSession } from "@/lib/use-portal-session";

type InviteRecord = { id: string; invite_email: string; access_level: string; status: string; created_at: string; member_user_id: string | null };

export const Route = createFileRoute("/_portal/settings")({
  head: () => ({
    meta: [
      { title: "Profile & Team — Obsidian Atelier" },
      { name: "description", content: "Update your client profile and manage invited collaborators in the Obsidian Atelier workspace." },
      { property: "og:title", content: "Profile & Team — Obsidian Atelier" },
      { property: "og:description", content: "Manage the company details and team access connected to your client workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { session } = usePortalSession();
  const loadProfile = useServerFn(getProfile);
  const saveProfile = useServerFn(updateProfile);
  const loadInvites = useServerFn(listTeamInvites);
  const addInvite = useServerFn(createTeamInvite);
  const deleteInvite = useServerFn(removeTeamInvite);
  const sendInvite = useServerFn(sendTeamInvite);
  const [displayName, setDisplayName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState<"editor" | "viewer">("editor");
  const [invites, setInvites] = useState<InviteRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session) return;
    setDisplayName(session.displayName === "Client" ? "" : session.displayName);
    setCompany(session.company === "Preview mode" ? "" : session.company);
    if (session.isDemo) {
      setInvites([]);
      setLoaded(true);
      return;
    }
    try {
      const [profile, team] = await Promise.all([loadProfile(), loadInvites()]);
      setDisplayName(profile?.display_name || session.displayName);
      setCompany(profile?.company || session.company);
      setInvites(team as InviteRecord[]);
    } catch {
      toast.error("Your profile details couldn't be loaded.");
    } finally {
      setLoaded(true);
    }
  }, [loadInvites, loadProfile, session]);
  useEffect(() => { void refresh(); }, [refresh]);

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) return;
    if (session.isDemo) {
      toast.info("Profile changes are not saved in preview mode.");
      return;
    }
    setSavingProfile(true);
    try {
      await saveProfile({ data: { displayName: displayName.trim(), company: company.trim() } });
      toast.success("Your profile has been updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Your profile couldn't be saved.");
    } finally {
      setSavingProfile(false);
    }
  };

  const submitInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) return;
    if (session.isDemo) {
      toast.info("Team access requires a signed-in client account.");
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    try {
      const record = await addInvite({ data: { email: cleanEmail, accessLevel } });
      setInvites((current) => [record as InviteRecord, ...current]);
      setEmail("");
      setSendingTo(record.id);
      const sent = await sendInvite({ data: { inviteId: record.id } });
      if (sent.emailSent) toast.success(`Invitation sent to ${cleanEmail}.`);
      else toast.info(`${cleanEmail} already has an account. They can sign in to accept the invitation.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The team invite couldn't be sent.");
    } finally {
      setSendingTo(null);
    }
  };

  const revokeInvite = async (id: string) => {
    if (session?.isDemo) return;
    try {
      await deleteInvite({ data: { id } });
      setInvites((current) => current.filter((invite) => invite.id !== id));
      toast.success("Team access removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Team access couldn't be removed.");
    }
  };

  return (
    <PanelBoundary>
      <main>
        <PageHeading eyebrow="Client workspace · 04" title="Profile & team" description="Keep your company information current and give collaborators the access they need." action={session?.isDemo ? <StateLabel tone="warning">Preview is read-only</StateLabel> : <StateLabel tone="good">Account settings</StateLabel>} />
        {!loaded ? <div className="px-8 py-12 text-sm text-muted-foreground">Loading account details…</div> : (
          <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="border-b border-border px-5 py-8 sm:px-8 lg:border-b-0 lg:border-r">
              <SectionTitle index="A" title="Client profile" detail="Private to this account" />
              <div className="mt-6 flex items-center gap-3 border-b border-border pb-5"><span className="flex size-10 items-center justify-center rounded-xl bg-surface-2 text-primary"><UserRound className="size-5" /></span><div className="min-w-0"><p className="truncate text-sm font-medium">{session?.email}</p><p className="mt-1 text-xs text-muted-foreground">Verified account email</p></div></div>
              <form onSubmit={(event) => void submitProfile(event)} className="mt-5 space-y-4">
                <label className="block space-y-1.5 text-xs text-muted-foreground">Display name<input required maxLength={120} value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary" /></label>
                <label className="block space-y-1.5 text-xs text-muted-foreground">Company or team<input maxLength={160} value={company} onChange={(event) => setCompany(event.target.value)} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary" /></label>
                <Button type="submit" disabled={savingProfile || session?.isDemo} className="rounded-xl"><Save /> Save profile</Button>
              </form>
            </section>

            <section className="px-5 py-8 sm:px-8">
              <SectionTitle index="B" title="Team access" detail={`${invites.length} collaborators`} />
              <div className="mt-5 flex gap-3 border-l-2 border-primary pl-4"><Users className="mt-0.5 size-4 shrink-0 text-primary" /><p className="text-xs leading-5 text-muted-foreground">Invited teammates can review the same deliverables and brand assets. Editors can also add requests and update work; viewers can only review.</p></div>
              <form onSubmit={(event) => void submitInvite(event)} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                <label className="space-y-1.5 text-xs text-muted-foreground">Collaborator email<input required type="email" maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="teammate@company.com" className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" /></label>
                <label className="space-y-1.5 text-xs text-muted-foreground">Access<select value={accessLevel} onChange={(event) => setAccessLevel(event.target.value as typeof accessLevel)} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"><option value="editor">Editor</option><option value="viewer">Viewer</option></select></label>
                <Button type="submit" disabled={session?.isDemo || sendingTo !== null} className="h-10 rounded-xl"><MailPlus /> Invite</Button>
              </form>
              {session?.isDemo ? <p className="mt-3 text-xs text-muted-foreground">Sign in with a client account to invite a real teammate.</p> : null}
              <div className="mt-6 divide-y divide-border border-y border-border">
                {invites.length ? invites.map((invite) => <article key={invite.id} className="flex flex-wrap items-center gap-3 py-4"><span className="flex size-8 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground"><MailPlus className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{invite.invite_email}</p><p className="mt-1 text-[11px] text-muted-foreground">{invite.access_level === "editor" ? "Editor" : "Viewer"} · added {new Date(invite.created_at).toLocaleDateString()}</p></div><StateLabel tone={invite.status === "accepted" ? "good" : "warning"}>{invite.status === "accepted" ? "Accepted" : "Pending"}</StateLabel>{invite.status === "pending" ? <Button type="button" variant="ghost" size="icon" disabled={sendingTo === invite.id} aria-label={`Resend invitation to ${invite.invite_email}`} title="Resend invitation" onClick={() => { setSendingTo(invite.id); void sendInvite({ data: { inviteId: invite.id } }).then((result) => toast.success(result.emailSent ? `Invitation resent to ${invite.invite_email}.` : "This teammate already has an account.")).catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Invitation couldn't be sent.")).finally(() => setSendingTo(null)); }} className="rounded-xl">{sendingTo === invite.id ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}</Button> : null}<Button type="button" variant="ghost" size="icon" aria-label={`Remove ${invite.invite_email}`} title="Remove team access" onClick={() => void revokeInvite(invite.id)} className="rounded-xl"><Trash2 /></Button></article>) : <div className="py-8 text-center"><Shield className="mx-auto size-5 text-muted-foreground" /><p className="mt-2 text-sm">No teammates added yet</p><p className="mt-1 text-xs text-muted-foreground">Invite someone to share the project conversation.</p></div>}
              </div>
            </section>
          </div>
        )}
      </main>
    </PanelBoundary>
  );
}