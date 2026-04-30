# Design Spec — Aba Campanhas

**Data:** 2026-04-30  
**Estado:** Aprovado pelo utilizador

---

## Objectivo

Adicionar uma 4ª aba "Campanhas" ao dashboard GB Institute que lista campanhas de marketing e exibe métricas detalhadas de cada uma num modal, cruzando dados do GA4 com vendas por cupão no Airtable.

---

## Arquitectura geral

```
page.tsx
  └── CampaignsTab (lê campaigns-data.ts estático)
        └── ao clicar linha → CampaignModal
              └── fetch /api/ga4/campaign/[id]
                    ├── GA4 runReport ×3 (Promise.all)
                    └── Airtable fetch directo (cupões)
```

### Ficheiros a criar

| Ficheiro | Responsabilidade |
|---|---|
| `lib/campaigns-data.ts` | Tipo `Campaign` + array estático de campanhas |
| `lib/classify-source.ts` | Extracção da função `classifySource` de `/api/analytics/route.ts` |
| `app/api/ga4/campaign/[id]/route.ts` | Agrega GA4 + Airtable, retorna `CampaignMetrics` |
| `components/campaigns-tab.tsx` | Tabela de listagem de campanhas |
| `components/campaign-modal.tsx` | Dialog com métricas, cards e gráfico |

### Ficheiros a modificar

| Ficheiro | Alteração |
|---|---|
| `components/top-tabs.tsx` | Adicionar `"campanhas"` ao tipo `Tab` e ao array de tabs |
| `app/page.tsx` | Adicionar `"campanhas"` ao tipo `Tab` local; renderizar `<CampaignsTab>` |
| `app/api/analytics/route.ts` | Substituir `classifySource` inline por import de `lib/classify-source.ts` |

---

## Camada de dados

### `lib/campaigns-data.ts`

```ts
export type Campaign = {
  id: string
  name: string
  entryPaths: string[]       // ex: ["/legado", "/legacy"]
  thankYouPath: string       // ex: "/obrigado-pci"
  coupons: string[]          // ex: ["LEGADO", "LEGACY", "F40"]
  landingPage: "instructor" | "integration" | "non-icp"
  startDate: string          // "YYYY-MM-DD"
  endDate: string | null     // null = campanha activa
}

export const campaigns: Campaign[] = [
  {
    id: "legado26",
    name: "Campanha Legado 2026",
    entryPaths: ["/legado", "/legacy"],
    thankYouPath: "/obrigado-pci",
    coupons: ["LEGADO", "LEGACY", "F40"],
    landingPage: "instructor",
    startDate: "2025-01-01",
    endDate: null,
  },
]
```

### `lib/classify-source.ts`

Extracção sem alteração de lógica da função `classifySource(src, medium)` já existente em `/api/analytics/route.ts`. Evita duplicação na nova rota de campanha. A rota de analytics passa a importar daqui.

### `app/api/ga4/campaign/[id]/route.ts`

**Tipo de resposta:**

```ts
export type CampaignMetrics = {
  entryPageviews: number
  thankYouPageviews: number
  conversionRate: number   // percentagem, ex: 4.2
  sources: { channel: string; sessions: number; pct: number }[]
  sales: { count: number; revenue: number }
}
```

**GA4 — 3 queries em `Promise.all`:**

1. **Pageviews entry paths** — `screenPageViews` com filtro OR: `pagePath CONTAINS /legado` OR `pagePath CONTAINS /legacy`. Soma todos os rows.
2. **Sessões por origem** — `sessionSource` + `sessionMedium` com o mesmo filtro OR nas entry paths. Agrupa via `classifySource`. Top 7.
3. **Pageviews thank you** — `screenPageViews` com filtro `pagePath CONTAINS /obrigado-pci`. Soma todos os rows.

**Airtable — 1 fetch directo:**

- Campos: `Data`, `Produto`, `Value`, `Cupom`
- `filterByFormula`: OR dos cupões + range de datas (`startDate` até `endDate ?? hoje`)
- Normaliza valores do campo `Cupom` em uppercase no servidor antes de comparar
- Retorna `{ count: number, revenue: number }`

**Conversão:** `conversionRate = Math.round((thankYouPageviews / entryPageviews) * 100 * 10) / 10`

**Cache:** module-level Map com TTL de 1 hora — igual ao padrão de `/api/analytics`.

**Autenticação GA4:** reutiliza as mesmas env vars (`GA4_PROPERTY_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`).

**Erro:** retorna 404 se campaign id não existir; 500 se GA4 ou Airtable falhar.

---

## UI

### TopTabs

Tipo `Tab` passa a ser `"sales" | "website" | "email" | "campanhas"`. Tab label: `"Campanhas"`.

### `components/campaigns-tab.tsx`

Tabela shadcn com colunas:

| Nome | Período | Status | (acção) |
|---|---|---|---|
| Campanha Legado 2026 | 1 Jan 2025 → activa | `Ativa` badge verde | linha clicável |

- **Período:** formata `startDate` → `endDate` (ou "activa" se null)
- **Status badge:** `Ativa` (cor verde/success) se `endDate === null || endDate > hoje`; `Encerrada` (cinzento) caso contrário
- Pageviews, Conversão e Receita **não são pré-carregados** na listagem — ficam como `—`. Carregam apenas quando o modal abre
- Linha inteira clicável abre `CampaignModal` com o `Campaign` seleccionado

### `components/campaign-modal.tsx`

Dialog shadcn, `max-w-2xl`.

**Estrutura:**
```
Header: nome da campanha + badge status + período
────────────────────────────────
Cards (2×2 grid):
  Pageviews entrada | Pageviews obrigado
  Taxa de conversão | Receita atribuída
────────────────────────────────
Gráfico: Sessões por origem
  BarChart horizontal (Recharts)
  eixo Y: channel, eixo X: sessions
  tooltip com nº de sessões e %
```

- **Loading state:** shadcn `Skeleton` nos 4 cards e na área do gráfico enquanto o fetch não resolve
- **Erro:** mensagem inline ("Não foi possível carregar os dados de GA4") se a rota retornar erro, com botão de retry
- **Gráfico:** `BarChart` do Recharts com `layout="vertical"` — segue o padrão de cores do projecto (`hsl(var(--chart-1))` etc.)
- O modal dispara o fetch ao montar (`useEffect` ou equivalente). Sem pre-fetch na listagem.

---

## Restrições respeitadas

- `Transaction` em `airtable-client.ts` **não é alterado**
- `getRecordsSince2024` / `getAllRecords` **não são chamados** pela nova rota
- Timezone e `endDate` hardcoded em `/api/airtable/route.ts` **intocados**
- Os dois sistemas de classificação (`mapCategory` 3-bucket + `lib/product-map.ts` 13 produtos) **intocados**
- Nenhum push/deploy sem pedido explícito

---

## Build & validação

`npm run build` corre e passa sem erros antes de qualquer commit.
