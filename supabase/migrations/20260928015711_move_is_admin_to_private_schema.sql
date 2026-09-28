-- Keep is_admin() out of the Data API (/rest/v1/rpc). RLS policies reference
-- the function by OID, so they keep working after the move.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

alter function public.is_admin() set schema private;
