create table if not exists public.auth_rate_limits (
  key_hash text primary key,
  attempts integer not null default 0,
  window_started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.auth_rate_limits enable row level security;

create or replace function public.consume_auth_rate_limit(
  p_key_hash text,
  p_max_attempts integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.auth_rate_limits%rowtype;
begin
  insert into public.auth_rate_limits (key_hash, attempts, window_started_at, updated_at)
  values (p_key_hash, 0, now(), now())
  on conflict (key_hash) do nothing;

  select * into current_row
  from public.auth_rate_limits
  where key_hash = p_key_hash
  for update;

  if current_row.window_started_at <= now() - make_interval(secs => p_window_seconds) then
    update public.auth_rate_limits
    set attempts = 1, window_started_at = now(), updated_at = now()
    where key_hash = p_key_hash;
    return true;
  end if;

  if current_row.attempts >= p_max_attempts then
    return false;
  end if;

  update public.auth_rate_limits
  set attempts = attempts + 1, updated_at = now()
  where key_hash = p_key_hash;
  return true;
end;
$$;

revoke all on function public.consume_auth_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_auth_rate_limit(text, integer, integer) to service_role;

create index if not exists auth_rate_limits_updated_at_idx
  on public.auth_rate_limits (updated_at);
