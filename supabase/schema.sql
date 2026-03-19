-- Run this in Supabase SQL editor.
-- Creates: profiles + payments tables with basic roles and access status.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'client' check (role in ('client','admin')),
  access_status text not null default 'free' check (access_status in ('free','active')),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete set null,
  stripe_session_id text not null unique,
  email text,
  amount_cents integer,
  currency text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.payments enable row level security;

-- Profiles: users can read their own row; only service role updates in practice.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "profiles_update_own_limited" on public.profiles;
create policy "profiles_update_own_limited"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Payments: users can read their own payments; admin can read all.
drop policy if exists "payments_select_own_or_admin" on public.payments;
create policy "payments_select_own_or_admin"
on public.payments for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Inserts/updates to payments should be done by service role via webhook.

