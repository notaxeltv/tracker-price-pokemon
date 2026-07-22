# Pokémon Price Tracker

Dashboard per monitorare prezzi **PSA giapponesi** e **sealed ITA/ENG** — **senza abbonamenti API**, via scraping.

## Architettura scraper (estensibile)

```
src/lib/
├── catalog/products.ts    # Catalogo prodotti — aggiungi qui nuovi item
├── scrapers/
│   ├── types.ts           # Tipi + ProductKind + GradingCompany
│   ├── registry.ts        # Registro scraper (plugin-style)
│   ├── orchestrator.ts    # Coordina scrape per prodotto/mercato
├── scrapers/
│   ├── types.ts           # Tipi + ProductKind + GradingCompany
│   ├── registry.ts        # Registro scraper (plugin-style)
│   ├── orchestrator.ts    # Coordina scrape per prodotto/mercato
│   ├── cardmarket.ts      # Scrape Cardmarket IT
│   ├── ebay.ts            # Scrape eBay IT/US vendute
│   ├── tcgplayer.ts       # Fetch TCGPlayer mpapi (sealed ENG)
│   └── playwright-scraper.ts  # Playwright server-only (locale)
├── data-service.server.ts # Logica scrape lato server
└── data-service.ts        # Re-export server-only per API routes
```

### Aggiungere prodotti futuri (BGS, CGC, raw EN, sealed JP…)

1. Apri `src/lib/catalog/products.ts`
2. Aggiungi una voce `CatalogProduct` con `kind`, `language`, `grading`, `sources`
3. Imposta `enabled: true` (o ometti — default attivo)
4. Esempio disabilitato già presente: `graded-en-charizard-legacy` (BGS)

### Sorgenti prezzo

| Prodotto | Sorgente | Metodo |
|----------|----------|--------|
| Sealed ENG | TCGPlayer | mpapi pubblico |
| Sealed ITA | Cardmarket | scrape HTML / Playwright |
| PSA JP | eBay IT + US | scrape vendute |
| Fallback carte | TCGdex | trend Cardmarket (non scrape) |

## Avvio

```bash
npm install
npm run dev
```

## Scraping in locale (Cardmarket + eBay)

Cloud/datacenter IP sono spesso **bloccati da Cloudflare**. In locale:

```bash
# .env.local
SCRAPE_USE_PLAYWRIGHT=true
```

Poi riavvia `npm run dev`. Playwright apre un browser headless per bypassare i blocchi.

Refresh manuale cache:

```bash
curl -X POST http://localhost:3000/api/scrape/refresh
```

## Variabili ambiente

Vedi `.env.example` — **nessuna API key a pagamento richiesta**.

## Stack

Next.js 15 · Cheerio · Playwright (opzionale) · Recharts · Tailwind 4
