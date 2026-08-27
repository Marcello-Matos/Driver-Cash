-- ============================================================
-- DriverCash — Schema do banco de dados (Supabase / PostgreSQL)
-- Rode este arquivo no Supabase: Dashboard -> SQL Editor -> New query
-- ============================================================

-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- PROFILES (1 por usuário)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null default 'Motorista',
  role         text not null default 'Motorista',
  monthly_goal numeric not null default 5000,
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- VEHICLES
-- ------------------------------------------------------------
create table if not exists public.vehicles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text,
  brand      text,
  model      text,
  plate      text,
  year       int,
  color      text,
  odometer   numeric default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- EARNINGS (ganhos)
-- ------------------------------------------------------------
create table if not exists public.earnings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  platform   text not null default 'UberX',
  gross      numeric not null default 0,
  trips      int not null default 0,
  km         numeric not null default 0,
  hours      numeric not null default 0,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  note       text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- EXPENSES (despesas)
-- ------------------------------------------------------------
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  category    text not null default 'Outros',
  description text,
  amount      numeric not null default 0,
  liters      numeric,
  vehicle_id  uuid references public.vehicles(id) on delete set null,
  note        text,
  created_at  timestamptz not null default now()
);

-- Índices para consultas por usuário/data
create index if not exists idx_earnings_user_date on public.earnings(user_id, date);
create index if not exists idx_expenses_user_date on public.expenses(user_id, date);
create index if not exists idx_vehicles_user on public.vehicles(user_id);

-- ============================================================
-- ROW LEVEL SECURITY: cada usuário só acessa os próprios dados
-- ============================================================
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.earnings enable row level security;
alter table public.expenses enable row level security;

-- PROFILES
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Macro helper: políticas iguais para tabelas com user_id
-- VEHICLES
drop policy if exists "vehicles_all_own" on public.vehicles;
create policy "vehicles_all_own" on public.vehicles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- EARNINGS
drop policy if exists "earnings_all_own" on public.earnings;
create policy "earnings_all_own" on public.earnings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- EXPENSES
drop policy if exists "expenses_all_own" on public.expenses;
create policy "expenses_all_own" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: cria um profile automaticamente ao registrar usuário
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Motorista'),
    'Motorista'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
