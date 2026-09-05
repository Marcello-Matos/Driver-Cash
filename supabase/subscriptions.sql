-- ============================================================
-- ASSINATURAS (Hotmart)
-- Rode este arquivo no SQL Editor do Supabase.
-- A tabela é preenchida SOMENTE pelo webhook da Hotmart
-- (Netlify Function usando a service_role key). O usuário logado
-- só consegue LER a linha do próprio e-mail.
-- ============================================================
create table if not exists public.subscriptions (
  email               text primary key,
  status              text not null default 'inactive',   -- active | past_due | canceled | refunded | inactive
  plan                text,
  hotmart_transaction text,
  hotmart_subscriber  text,
  buyer_name          text,
  last_event          text,
  started_at          timestamptz,
  current_period_end  timestamptz,
  updated_at          timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_read_own" on public.subscriptions;
create policy "subscriptions_read_own" on public.subscriptions
  for select using (lower(email) = lower(auth.jwt() ->> 'email'));

-- Sem policies de insert/update/delete: apenas a service_role (webhook) escreve.

-- Guarda a data de criação do perfil para calcular o teste grátis de 7 dias
alter table public.profiles add column if not exists created_at timestamptz not null default now();
