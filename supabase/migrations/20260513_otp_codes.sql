-- OTP codes table for email verification
create table if not exists public.otp_codes (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  code        text not null,
  purpose     text not null default 'verify',
  expires_at  timestamptz not null,
  used        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Index for fast lookups
create index if not exists otp_codes_email_purpose_idx
  on public.otp_codes (email, purpose);

-- Auto-cleanup: delete used or expired codes older than 1 day
create or replace function public.cleanup_otp_codes()
returns void language sql security definer as $$
  delete from public.otp_codes
  where used = true or expires_at < now() - interval '1 day';
$$;

-- RLS: only service role can read/write
alter table public.otp_codes enable row level security;

-- No public access — API routes use service role key
create policy "No public access" on public.otp_codes
  for all using (false);
