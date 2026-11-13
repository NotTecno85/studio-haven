CREATE OR REPLACE FUNCTION public.accept_team_invites_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.team_invites
    SET member_user_id = NEW.id, status = 'accepted'
    WHERE lower(invite_email) = lower(NEW.email)
      AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_team_invite(_invite_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_rows INTEGER;
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
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows > 0;
END;
$$;
REVOKE ALL ON FUNCTION public.accept_team_invite(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_team_invite(UUID) TO authenticated;