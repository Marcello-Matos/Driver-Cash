-- ============================================================
-- DriverCash — Integração com a Uber Driver API
-- Rode no Supabase: Dashboard -> SQL Editor -> New query
-- ============================================================

-- Conexão OAuth de cada motorista com a Uber.
-- Os tokens NUNCA são lidos pelo app: a tabela não tem políticas de RLS,
-- então só as Netlify Functions (service_role) conseguem acessá-la.
create table if not exists public.uber_connections (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  access_token     text not null,
  refresh_token    text,
  expires_at       timestamptz,
  scope            text,
  uber_driver_id   text,
  driver_name      text,
  connected_at     timestamptz not null default now(),
  last_sync_at     timestamptz,
  last_sync_status text,
  last_sync_error  text
);

alter table public.uber_connections enable row level security;

-- Ganhos importados automaticamente: 1 linha por dia (external_id = 'uber:AAAA-MM-DD')
alter table public.earnings add column if not exists source text not null default 'manual';
alter table public.earnings add column if not exists external_id text;

-- Evita duplicar o mesmo dia na sincronização (linhas manuais têm external_id nulo)
create unique index if not exists uq_earnings_user_external
  on public.earnings(user_id, external_id);
