CREATE TABLE public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  invite_email TEXT NOT NULL CHECK (char_length(invite_email) <= 255 AND invite_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  member_user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  access_level TEXT NOT NULL DEFAULT 'editor' CHECK (access_level IN ('editor', 'viewer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_invites TO authenticated;
GRANT ALL ON public.team_invites TO service_role;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX team_invites_owner_email_idx ON public.team_invites (owner_id, lower(invite_email));
CREATE POLICY "Owners and invitees can read team invitations" ON public.team_invites FOR SELECT TO authenticated USING (owner_id = auth.uid() OR member_user_id = auth.uid() OR lower(invite_email) = lower(coalesce(auth.jwt() ->> 'email', '')));
CREATE POLICY "Owners can create invitations" ON public.team_invites FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND member_user_id IS NULL AND status = 'pending');
CREATE POLICY "Invitees can accept invitations" ON public.team_invites FOR UPDATE TO authenticated USING (lower(invite_email) = lower(coalesce(auth.jwt() ->> 'email', '')) AND status = 'pending') WITH CHECK (member_user_id = auth.uid() AND status = 'accepted');
CREATE POLICY "Owners can manage invitations" ON public.team_invites FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can remove invitations" ON public.team_invites FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Invited collaborators can read deliverables" ON public.deliverables FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.team_invites invite WHERE invite.owner_id = deliverables.user_id AND invite.member_user_id = auth.uid() AND invite.status = 'accepted'));
CREATE POLICY "Editors can add deliverables" ON public.deliverables FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.team_invites invite WHERE invite.owner_id = deliverables.user_id AND invite.member_user_id = auth.uid() AND invite.access_level = 'editor' AND invite.status = 'accepted'));
CREATE POLICY "Editors can update deliverables" ON public.deliverables FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.team_invites invite WHERE invite.owner_id = deliverables.user_id AND invite.member_user_id = auth.uid() AND invite.access_level = 'editor' AND invite.status = 'accepted')) WITH CHECK (EXISTS (SELECT 1 FROM public.team_invites invite WHERE invite.owner_id = deliverables.user_id AND invite.member_user_id = auth.uid() AND invite.access_level = 'editor' AND invite.status = 'accepted'));
CREATE POLICY "Invited collaborators can read brand assets" ON public.assets FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.team_invites invite WHERE invite.owner_id = assets.user_id AND invite.member_user_id = auth.uid() AND invite.status = 'accepted'));

CREATE OR REPLACE FUNCTION public.accept_team_invites_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.team_invites
  SET member_user_id = NEW.id, status = 'accepted'
  WHERE lower(invite_email) = lower(NEW.email)
    AND status = 'pending';
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_new_auth_user_accepts_team_invites
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.accept_team_invites_for_new_user();