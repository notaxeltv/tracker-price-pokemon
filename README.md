# Pokémon Price Tracker

Dashboard per monitorare prezzi Pokémon — **PSA/BGS/CGC**, **sealed ITA/ENG/JP**, **raw**, accessori — **senza abbonamenti API**, via scraping + snapshot JSON.

## Architettura

```
src/lib/
├── catalog/products.ts         # Catalogo prodotti (tutti i tipi attivi)
├── scrapers/
│   ├── orchestrator.ts         # Coordina scrape per mercato IT/INTL
│   ├── cardmarket.ts · ebay.ts   # Solo Cardmarket + eBay EU
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
| Sealed ITA/ENG/JP | 151, Prismatic, VSTAR | Cardmarket · eBay EU |
| Gradate PSA/BGS/CGC | Charizard 151, Umbreon | Cardmarket · eBay EU |
| Raw EN/JP | Charizard Base, Pikachu 151 | Cardmarket · eBay EU |
| Accessori | Sleeves, Toploader | eBay EU |

**Solo due fonti prezzo:** Cardmarket (min listing mercato EU) ed eBay (vendute + in vendita, filtro provenienza Unione Europea `LH_PrefLoc=3`). Nessun TCGPlayer / eBay US.

Aggiungi prodotti in `src/lib/catalog/products.ts`.

## Avvio dashboard

```bash
npm install
npm run dev
```

## Scrape on-demand (consigliato — nessun cron)

**Non serve tenere il programma sempre acceso.** Apri la dashboard quando ti serve: aggiorna i prezzi in automatico se lo snapshot è vecchio o mancante.

```bash
# .env.local
SCRAPE_USE_PLAYWRIGHT=true
SCRAPE_ON_DEMAND=true
SCRAPE_CACHE_TTL=3600
```

```bash
npm install
npx playwright install chromium
npm run dev
```

Flusso:

1. Apri `http://localhost:3000` — vedi subito l’ultimo snapshot (se esiste)
2. Se i dati hanno > 1h o sono bloccati, parte lo **scrape automatico** (Cardmarket + eBay EU)
3. Clic **Aggiorna prezzi** per forzare un nuovo scrape in qualsiasi momento

Cardmarket/eBay richiedono **Playwright in locale** (IP domestico). Il cloud resta bloccato.

### Cron opzionale

Se vuoi snapshot freschi anche senza aprire la dashboard:

```bash
npm run scrape
# crontab ogni 6h — opzionale
```

```bash
curl -X POST "http://localhost:3000/api/scrape/refresh?force=1"
```

## Variabili ambiente

Vedi `.env.example` — nessuna API key a pagamento per i prezzi.

### CardTrader (opzionale — solo immagini)

Imposta `CARDTRADER_API_TOKEN` in `.env.local` per caricare le immagini ufficiali di carte e prodotti sigillati da CardTrader. **Non viene usato per i prezzi** (restano Cardmarket + eBay EU).

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
