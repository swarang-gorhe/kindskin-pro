-- ONE-CLICK ADMIN SETUP — paste entire file in Supabase SQL Editor and click Run.
-- Dashboard: https://supabase.com/dashboard/project/gcaaupopzmxxwkkjwzij/sql/new

-- ── 1. Profiles table + signup trigger (migration 003) ──────────────────────

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on profiles (email);
create index if not exists profiles_role_idx on profiles (role);

create or replace function profiles_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles for each row
  execute function profiles_set_updated_at();

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row
  execute function handle_new_user();

alter table profiles enable row level security;

drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile"
  on profiles for select to authenticated
  using (auth.uid() = id);

-- ── 2. Confirm email (skip inbox confirmation) ─────────────────────────────

update auth.users
set
  email_confirmed_at = coalesce(email_confirmed_at, timezone('utc', now())),
  confirmed_at = coalesce(confirmed_at, timezone('utc', now()))
where lower(email) = lower('swanand.pushkaraj.akolkar@dpsnashik.in');

-- ── 3. Promote to admin ──────────────────────────────────────────────────────

insert into public.profiles (id, email, role)
select id, email, 'admin'
from auth.users
where lower(email) = lower('swanand.pushkaraj.akolkar@dpsnashik.in')
on conflict (id) do update
  set role = 'admin', email = excluded.email, updated_at = now();
