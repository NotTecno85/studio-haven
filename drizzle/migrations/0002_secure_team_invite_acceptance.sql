DROP POLICY "Invitees can accept invitations" ON public.team_invites;

CREATE OR REPLACE FUNCTION public.accept_team_invite(_invite_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  accepted BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  UPDATE public.team_invites
  SET member_user_id = auth.uid(), status = 'accepted'
  WHERE id = _invite_id
    AND member_user_id IS NULL
    AND status = 'pending'
    AND lower(invite_email) = lower(coalesce(auth.jwt() ->> 'email', ''));
  GET DIAGNOSTICS accepted = ROW_COUNT;
  RETURN accepted;
END;
$$;
REVOKE ALL ON FUNCTION public.accept_team_invite(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_team_invite(UUID) TO authenticated;