# Design: World Map Widget + ICP Funnel Redesign

**Date:** 2026-04-14  
**Tab:** Website  
**Status:** Approved

---

## 1. Overview

Two new features for the Website tab:

1. **World Map Widget** — choropleth map + country list sidebar showing top 10 countries by GA4 sessions.
2. **ICP Funnel Redesign** — replace the placeholder "Funil ICP" card with a real wave/gradient funnel using live GA4 data for the PCI 2026 funnel.

---

## 2. API Changes (`/api/analytics`)

### New fields added to `AnalyticsData`

```ts
countries: { country: string; code: string; sessions: number }[]
// Top 10 countries by sessions. Used for both map coloring and sidebar list.

funnel: {
  visita: number      // GA4 screenPageViews for /pci2026
  checkout: number    // GA4 screenPageViews for /payment?product_id=pci-2026-*
  finalizado: number  // GA4 screenPageViews for /obrigado-pci*
}
```

### GA4 queries (added to existing `Promise.all`)

- **Country report**: dimension `country`, metric `sessions`, limit 10, ordered desc.
- **Funnel**: dimension `pagePath`, metric `screenPageViews`, with three separate filter expressions (one per funnel step), OR combined into a single report filtered by regex and grouped.

### Country → ISO code mapping

A local dictionary (`lib/country-codes.ts`) maps GA4 country names (English) to ISO 3166-1 alpha-2 codes. Covers at minimum the top 50 most common countries by web traffic. Flag emojis are derived from the ISO code (regional indicator symbols).

---

## 3. World Map Widget

**File:** `components/world-map-widget.tsx`

**Library:** `react-simple-maps` + `d3-scale` for color interpolation.

### Layout

Card spanning full width (4 columns), two panels side by side:

| Panel | Width | Content |
|-------|-------|---------|
| Left  | ~60%  | SVG choropleth world map |
| Right | ~40%  | Top 10 country list |

### Map panel

- `ComposableMap` + `Geographies` from `react-simple-maps`
- GeoJSON source: built-in topojson from `react-simple-maps` (no external fetch needed)
- Color scale: linear from `#E0E8F4` (0 sessions) → `#004B8D` (max sessions)
- Countries not in top 10 get the lowest shade
- Hover tooltip: country name + session count

### Country list panel

Each row (top to bottom, ordered by sessions desc):

```
🇺🇸  US    48.3K  ████████████████████
🇮🇳  IN    18.1K  ███████
🇨🇦  CA    17.1K  ██████
...
```

- Flag emoji (derived from ISO code)
- ISO 2-letter code, bold
- Session count formatted (e.g. `18.1K`, `4.2K`)
- Horizontal bar, width proportional to top country (top = 100%)
- Bar color: `#7EB3E8` (matches dashboard palette)

### Position in page

New row below the existing row 2 of the website tab. Full-width card.

---

## 4. ICP Funnel Redesign

**File:** `components/icp-funnel-chart.tsx`

### Visual design

Three wave columns side by side, plus a conversion rate callout on the right.

**Per column:**
- SVG path: fills from top, with a sinusoidal bottom edge (wave curve)
- Height proportional to value: Visita = 100%, others = (value / visita) × 100%
- Gradient fill (vertical, top opaque → bottom semi-transparent):
  - Visita: `#7C3AED` → `#A78BFA`
  - Checkout: `#4F46E5` → `#818CF8`
  - Finalizado: `#0EA5E9` → `#BAE6FD`
- Below each column: large bold number + label ("Visita", "Checkout", "Finalizado")

**Conversion rate callout** (right side, outside columns):
- Rate = `(finalizado / visita × 100).toFixed(1)%`
- Large number in blue/purple, label "Conversion rate" below
- Styled like the reference image

### Layout changes to existing row 2

The current 4-col grid in row 2:
- **Before**: New/Returning (2) + Origem (1) + Funil ICP (1)
- **After**: New/Returning (2) + Origem (1) + *(Funil ICP removed)*

The Funil ICP becomes its own full-width row between row 2 and the world map row.

### Funnel page path filters

GA4's `pagePath` dimension strips query parameters. Checkout URLs include `?product_id=pci-2026-*`, so we must use `pagePathPlusQueryString` for the checkout step to distinguish PCI checkouts from other products.

| Step       | GA4 dimension              | Filter                                          |
|------------|----------------------------|-------------------------------------------------|
| Visita     | `pagePath`                 | `== /pci2026`                                   |
| Checkout   | `pagePathPlusQueryString`  | `contains /payment` AND `contains pci-2026`     |
| Finalizado | `pagePath`                 | `contains /obrigado-pci`                        |

Each step is fetched as a separate GA4 report (same date range), summing `screenPageViews`.

---

## 5. Page Layout (Website Tab — After)

```
Row 1: [Sessions] [Users] [Bounce Rate] [Pageviews]     ← unchanged
Row 2: [New vs Returning (2col)] [Origem (1col)]         ← Funil ICP removed
Row 3: [ICP Funnel — full width (4col)]                  ← NEW redesigned
Row 4: [World Map — full width (4col)]                   ← NEW
```

---

## 6. Dependencies

- `react-simple-maps` — SVG world map
- `d3-scale` — color interpolation for choropleth
- No other new dependencies

---

## 7. Files Changed / Created

| File | Action |
|------|--------|
| `app/api/analytics/route.ts` | Extend with `countries` + `funnel` fields |
| `lib/country-codes.ts` | New — ISO code dictionary |
| `components/world-map-widget.tsx` | New — map + sidebar |
| `components/icp-funnel-chart.tsx` | New — wave funnel |
| `app/page.tsx` | Wire new components, update layout |
