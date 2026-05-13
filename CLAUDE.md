# CLAUDE.md

## Projeto
Dashboard interno de marketing para análise de vendas (Airtable)
e desempenho de site (Google Analytics). Uso exclusivo do time interno.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- shadcn/ui + Tailwind CSS v4 + Recharts + date-fns-tz

## Comandos
```bash
npm run dev    # localhost:3000
npm run build  # rodar antes de todo commit — obrigatório
```

## Variáveis de ambiente
Obrigatórias em `.env.local` — sem elas `/api/*` retorna erro 500:
AIRTABLE_BASE_ID=
AIRTABLE_API_KEY=

## Tipo central
`Transaction` em `airtable-client.ts` é a fonte da verdade.
Mudança nele impacta todas as libs — confirmar com utilizador antes.

## Armadilhas — não alterar sem perguntar

**Timezone:** Airtable armazena em São Paulo, dashboard exibe em
Phoenix (`lib/date.ts`). `customer-metrics.ts` não usa essa conversão
— inconsistência conhecida e intencional.

**endDate:** hardcoded em `/api/airtable/route.ts` — razão de negócio,
não alterar.

**Classificação:** dois sistemas coexistem intencionalmente:
- 3-bucket (`mapCategory`): instructor | integration | non-icp
- 13 produtos nomeados (`lib/product-map.ts`)
Não unificar.

## Fluxo de trabalho
- Não fazer push nem deploy sem pedido explícito
- Rodar `npm run build` e corrigir erros antes de qualquer commit
