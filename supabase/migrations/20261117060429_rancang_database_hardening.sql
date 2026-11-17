CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON rancang.sessions(user_id);
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
