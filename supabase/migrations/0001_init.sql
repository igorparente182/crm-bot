-- CRM Bot — schema inicial
-- Tabelas: stages (etapas do funil), contacts, deals
-- RLS: cada usuário só vê os próprios registros. Stages são globais (read-only para todos os usuários autenticados).

create extension if not exists "pgcrypto";

-- STAGES (globais)
create table if not exists public.stages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#6366f1',
  position int not null
);

alter table public.stages enable row level security;

drop policy if exists "stages_read_authenticated" on public.stages;
create policy "stages_read_authenticated" on public.stages
  for select using (auth.role() = 'authenticated');

insert into public.stages (name, color, position) values
  ('Novo lead', '#6366f1', 1),
  ('Qualificação', '#8b5cf6', 2),
  ('Proposta', '#ec4899', 3),
  ('Negociação', '#f59e0b', 4),
  ('Fechado', '#10b981', 5)
on conflict do nothing;

-- CONTACTS
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  created_at timestamptz not null default now()
);

create index if not exists contacts_user_idx on public.contacts(user_id);

alter table public.contacts enable row level security;

drop policy if exists "contacts_owner_all" on public.contacts;
create policy "contacts_owner_all" on public.contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- DEALS
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stage_id uuid not null references public.stages(id) on delete restrict,
  contact_id uuid references public.contacts(id) on delete set null,
  title text not null,
  contact_name text,
  value numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists deals_user_idx on public.deals(user_id);
create index if not exists deals_stage_idx on public.deals(stage_id);

alter table public.deals enable row level security;

drop policy if exists "deals_owner_all" on public.deals;
create policy "deals_owner_all" on public.deals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
