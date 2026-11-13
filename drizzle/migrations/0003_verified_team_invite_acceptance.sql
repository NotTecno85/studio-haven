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
CREATE TRIGGER on_auth_user_confirmed_accepts_team_invites
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.accept_team_invites_for_new_user();