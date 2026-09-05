# DriverCash — Controle financeiro para motoristas

Sistema web para controlar seus ganhos e despesas como motorista de aplicativo (Uber, 99, InDrive, etc.).

## Recursos

- **Dashboard**: KPIs de ganhos, despesas, lucro líquido e lucro por hora, com comparação ao mês anterior.
- **Resumo do mês**: dias trabalhados, corridas, km rodados, horas online, ganho por dia/hora/km e custo por km.
- **Gráficos**: evolução diária de ganhos x despesas e distribuição de despesas por categoria.
- **Ganhos e Despesas**: cadastro, edição e exclusão de lançamentos.
- **Combustível**: preço médio por litro, consumo médio (km/L) e custo por km.
- **Manutenção, Veículos, Metas, Relatórios e Calendário**.
- **Metas mensais** com barra de progresso.
- **Relatórios**: comparativo dos últimos 6 meses e exportação para CSV.
- **Tema claro/escuro** e navegação por mês.
- **Login/cadastro** e **dados salvos na nuvem** (Supabase), acessíveis de qualquer dispositivo.

## Tecnologias

- React 18 + Vite
- Tailwind CSS
- Recharts (gráficos)
- Lucide (ícones)
- **Supabase** (banco de dados PostgreSQL na nuvem + autenticação)

## Configuração do Supabase (obrigatório)

1. Crie um projeto grátis em **https://supabase.com**.
2. No painel do projeto, abra **SQL Editor → New query**, cole todo o conteúdo do arquivo
   `supabase/schema.sql` deste projeto e clique em **Run**. Isso cria as tabelas e as regras de segurança.
3. Vá em **Project Settings → API** e copie a **Project URL** e a chave **anon public**.
4. Copie o arquivo `.env.example` para `.env` e preencha:

   ```
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon
   ```

5. (Opcional) Em **Authentication → Providers → Email**, você pode desativar
   "Confirm email" para entrar sem precisar confirmar o e-mail durante os testes.

## Como rodar

```bash
npm install
npm run dev
```

O app abre em `http://localhost:5173`.

Na primeira vez, **crie sua conta** na tela de login. Os dados (ganhos, despesas, veículos, metas)
ficam salvos no seu projeto Supabase e são acessíveis de qualquer dispositivo.

Para carregar **dados de exemplo**, entre em **Configurações → Dados → Restaurar dados de exemplo**.

## Build de produção

```bash
npm run build
npm run preview
```

## Assinatura via Hotmart (7 dias grátis + R$ 19,90/mês)

Todo usuário novo tem **7 dias grátis** a partir do cadastro. Depois disso o app mostra a
tela de assinatura. O pagamento (Pix, cartão, boleto) é feito na Hotmart, que avisa o app
por **webhook** e libera o acesso automaticamente para o **e-mail usado na compra**.

### 1. Supabase

No **SQL Editor**, rode o arquivo `supabase/subscriptions.sql`.

Para liberar acesso permanente para você mesmo (ou para um usuário manualmente), rode:

```sql
insert into public.subscriptions (email, status, plan, current_period_end)
values ('seu-email@exemplo.com', 'active', 'Vitalício', '2099-12-31')
on conflict (email) do update set status = 'active', current_period_end = '2099-12-31';
```

### 2. Hotmart

1. Produto do tipo **Assinatura**, preço **R$ 19,90/mês**.
2. Na oferta, ative **Período de teste gratuito** de 7 dias (opcional, o app já dá 7 dias).
3. Copie o **link de checkout** (ex.: `https://pay.hotmart.com/XXXXXXX`).
4. Em **Ferramentas → Webhook (Postback)** cadastre a URL:
   `https://SEU-SITE.netlify.app/.netlify/functions/hotmart-webhook`
   - Versão: **2.0**
   - Eventos: marque todos de **Compra** e **Assinatura**.
5. Copie o **Hottok** (token exibido na tela do webhook).

### 3. Netlify — variáveis de ambiente

Em **Site settings → Environment variables**, adicione:

| Variável | Valor |
|---|---|
| `VITE_HOTMART_CHECKOUT_URL` | link de checkout da Hotmart |
| `HOTMART_HOTTOK` | token do webhook da Hotmart |
| `SUPABASE_URL` | Project URL do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → **service_role** (secreta!) |

Depois clique em **Trigger deploy** para aplicar.

### 4. Testar

Na Hotmart, em **Ferramentas → Webhook**, use **Enviar teste** com o evento
`PURCHASE_APPROVED`. A linha deve aparecer na tabela `subscriptions` do Supabase.
