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
