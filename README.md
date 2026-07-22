# Pokémon Price Tracker

Dashboard per monitorare prezzi Pokémon — **PSA/BGS/CGC**, **sealed ITA/ENG/JP**, **raw**, accessori — **senza abbonamenti API**, via scraping + snapshot JSON.

## Architettura

```
src/lib/
├── catalog/products.ts         # Catalogo prodotti (tutti i tipi attivi)
├── scrapers/
│   ├── orchestrator.ts         # Coordina scrape per mercato IT/INTL
│   ├── cardmarket.ts · ebay.ts · tcgplayer.ts
│   ├── snapshot.ts             # Persistenza JSON + merge history
│   └── playwright-scraper.ts   # Bypass Cloudflare (locale)
├── data-service.server.ts      # Live scrape + lettura snapshot
├── providers/cardtrader/       # Solo immagini (mai prezzi)
├── portfolio.ts · portfolio.server.ts  # Prezzo acquisto manuale
scripts/scrape-cron.ts            # Cron locale → data/scrape-snapshot.json
data/portfolio.json               # Portfolio utente (gitignored)
```

## Catalogo attivo

| Tipo | Esempi | Sorgenti |
|------|--------|----------|
| Sealed ITA/ENG/JP | 151, Prismatic, VSTAR | Cardmarket · TCGPlayer · eBay |
| Gradate PSA JP | Pikachu 151, Umbreon | eBay IT/US · Cardmarket |
| Gradate BGS/CGC EN | Charizard Base, Lugia | eBay · Cardmarket |
| Raw EN | Charizard Base, Pikachu 151 | Cardmarket · eBay · TCGPlayer |
| Accessori | Sleeves, Toploader | eBay IT/US |

Aggiungi prodotti in `src/lib/catalog/products.ts`.

## Avvio dashboard

```bash
npm install
npm run dev
```

La dashboard legge `data/scrape-snapshot.json` se fresco (`SCRAPE_USE_SNAPSHOT=true`, default).

## Cron locale (passo consigliato)

Cardmarket/eBay sono bloccati su IP cloud. Esegui lo scrape **in locale** e salva lo snapshot:

```bash
# .env.local
SCRAPE_USE_PLAYWRIGHT=true
SCRAPE_CACHE_TTL=21600

npm run scrape
```

Output: `data/scrape-snapshot.json` con prezzi live + storico giornaliero (merge automatico).

**Crontab** (ogni 6 ore):

```cron
0 */6 * * * cd /path/to/tracker && SCRAPE_USE_PLAYWRIGHT=true npm run scrape >> scrape.log 2>&1
```

Refresh via API (invalida cache + riscrive snapshot):

```bash
curl -X POST http://localhost:3000/api/scrape/refresh
```

## Variabili ambiente

Vedi `.env.example` — nessuna API key a pagamento per i prezzi.

### CardTrader (opzionale — solo immagini)

Imposta `CARDTRADER_API_TOKEN` in `.env.local` per caricare le immagini ufficiali di carte e prodotti sigillati da CardTrader. **Non viene usato per i prezzi** (restano scraping Cardmarket/eBay/TCGPlayer).

```bash
# .env.local
CARDTRADER_API_TOKEN=your_jwt_token
```

Nel catalogo (`products.ts`) puoi mappare `cardtraderBlueprintId` e `cardtraderExpansionId` per ogni prodotto.

### Portfolio (prezzo acquisto manuale)

Clicca **Inserisci** nella colonna **Acquisto** per registrare:

- **Prezzo di acquisto** (€)
- **Teca in plexiglass** — checkbox con etichetta visibile sulla riga
- **Costo teca** (opzionale) — se lasci vuoto, la teca è già inclusa nel prezzo di acquisto

I dati vengono salvati in `data/portfolio.json` (separati dallo snapshot prezzi). Le carte gradate usano una chiave per grado (`productId:PSA-10`).

## Stack

Next.js 15 · Cheerio · Playwright (opzionale) · tsx · Recharts · Tailwind 4
