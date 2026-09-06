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

## Planos e assinatura via Mercado Pago

| Plano | Acesso |
|---|---|
| **Teste grátis** (7 dias após o cadastro) | Tudo do Pro |
| **Gratuito** (após o teste, sem assinatura) | Dashboard, Ganhos, Despesas (até 3/dia), Veículos, Metas |
| **Pro** (mensal ou anual) | Tudo: Resumo diário, Combustível, Manutenção, Relatórios, Calendário e despesas ilimitadas |

As páginas exclusivas do Pro e o limite do Gratuito ficam em `src/lib/billing.js`
(`PRO_PAGES` e `FREE_EXPENSES_PER_DAY`). A tela **Assinatura** mostra os planos do
Mercado Pago (assinatura recorrente, Pix ou cartão).
Quando o MP confirma a assinatura, ele avisa o app por **webhook**, que libera o acesso
para o **e-mail da conta Mercado Pago do pagador**. Se o e-mail do MP for diferente do
e-mail de login, o usuário usa o botão **"Já paguei, verificar"** e informa o e-mail do MP.

Arquivos envolvidos:

- `netlify/functions/mp-webhook.js` — recebe as notificações do Mercado Pago
- `netlify/functions/mp-verify.js` — botão "Já paguei" (consulta o MP pelo e-mail)
- `src/lib/billing.js` — planos, trial e cálculo de acesso
- `src/components/Paywall.jsx` — tela de assinatura

### 1. Supabase

No **SQL Editor**, rode o arquivo `supabase/subscriptions.sql`.

Para liberar acesso permanente para você mesmo (ou para um usuário manualmente), rode:

```sql
insert into public.subscriptions (email, status, plan, current_period_end)
values ('seu-email@exemplo.com', 'active', 'Vitalício', '2099-12-31')
on conflict (email) do update set status = 'active', current_period_end = '2099-12-31';
```

### 2. Mercado Pago

1. Acesse **https://www.mercadopago.com.br/developers** → **Suas integrações** → crie uma
   aplicação (ou use a existente) do tipo **Pagamentos online / Assinaturas**.
2. Em **Credenciais de produção**, copie o **Access Token** (`APP_USR-...`).
3. Em **Webhooks** → **Configurar notificações** (modo produção):
   - URL: `https://SEU-SITE.netlify.app/.netlify/functions/mp-webhook`
   - Eventos: marque **Planos e assinaturas** (`subscription_preapproval`) e
     **Pagamentos de assinaturas** (`subscription_authorized_payment`).
   - Salve e copie a **Assinatura secreta** exibida.
4. Os links dos planos (`.../subscriptions/checkout?preapproval_plan_id=...`) você já tem
   em **Assinaturas → Planos** no painel do Mercado Pago.

### 3. Netlify — variáveis de ambiente

Em **Site settings → Environment variables**, adicione:

| Variável | Valor |
|---|---|
| `VITE_MP_CHECKOUT_MENSAL` | link do plano mensal |
| `VITE_MP_PRICE_MENSAL` | `19.90` |
| `VITE_MP_CHECKOUT_ANUAL` | link do plano anual (opcional) |
| `VITE_MP_PRICE_ANUAL` | preço anual, ex.: `199.00` (opcional) |
| `VITE_MP_ANUAL_DESTAQUE` | selo do plano anual, ex.: `2 meses grátis` (opcional) |
| `MP_ACCESS_TOKEN` | Access Token de produção do Mercado Pago (**secreta**) |
| `MP_WEBHOOK_SECRET` | Assinatura secreta do webhook (**secreta**) |
| `SUPABASE_URL` | Project URL do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → **service_role** (**secreta**) |

Depois clique em **Trigger deploy** para aplicar.

### 4. Testar

1. Faça uma assinatura de teste pelo link do plano.
2. No Supabase, a tabela `subscriptions` deve receber a linha com `status = active`.
3. Entre no app com o mesmo e-mail — o acesso deve estar liberado.
4. Se não liberar, clique em **"Já paguei, verificar"** na tela de assinatura.
