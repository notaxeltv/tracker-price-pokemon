# Pokémon Price Tracker

Dashboard per monitorare prezzi Pokémon — **PSA/BGS/CGC**, **sealed ITA/ENG/JP**, **raw**, accessori — **senza abbonamenti API**, via scraping + snapshot JSON.

## Architettura

```
src/lib/
├── catalog/products.ts         # Catalogo built-in
├── catalog/user-catalog.server.ts  # Prodotti aggiunti da UI
├── catalog/merge.ts            # Merge built-in + utente
├── scrapers/
│   ├── orchestrator.ts         # Coordina scrape per mercato IT/INTL
│   ├── cardmarket.ts · ebay.ts   # Solo Cardmarket + eBay EU
│   ├── snapshot.ts             # Persistenza JSON + merge history
│   └── playwright-scraper.ts   # Bypass Cloudflare (locale)
├── portfolio.ts · portfolio.server.ts  # Acquisti, vendite, alert
├── portfolio-resolve.ts        # Risolve nomi prodotti nel portfolio
├── portfolio-export.ts         # Export CSV/JSON
scripts/scrape-cron.ts            # Cron locale → data/scrape-snapshot.json
data/portfolio.json               # Portfolio utente (gitignored)
data/user-catalog.json            # Catalogo personalizzato (gitignored)
```

## Catalogo attivo

| Tipo | Esempi | Sorgenti |
|------|--------|----------|
| Sealed ITA/ENG/JP | 151, Prismatic, VSTAR | Cardmarket · eBay EU |
| Gradate PSA/BGS/CGC | Charizard 151, Umbreon | Cardmarket · eBay EU |
| Raw EN/JP | Charizard Base, Pikachu 151 | Cardmarket · eBay EU |
| Accessori | Sleeves, Toploader | eBay EU |

**Solo due fonti prezzo:** Cardmarket (min listing mercato EU) ed eBay (vendute + in vendita, filtro provenienza Unione Europea `LH_PrefLoc=3`).

Prodotti built-in in `src/lib/catalog/products.ts` · prodotti personalizzati via **Aggiungi prodotto** → `data/user-catalog.json`.

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

```bash
npm run scrape
curl -X POST "http://localhost:3000/api/scrape/refresh?force=1"
```

## Portfolio

Tab **Portfolio** nella dashboard oppure filtro **Solo portfolio** nelle altre tab.

### Acquisto

Clic **Acquisto** su un prodotto:

- Prezzo unitario (€)
- **Quantità** (es. 3 ETB)
- Data acquisto e note
- Teca plexiglass (+ costo opzionale)
- **Alert prezzo**: soglia sopra (target vendita) / sotto (stop loss) — badge visivo quando scattano

### Vendita

Clic **Vendi** → prezzo totale di vendita + data → P/L **realizzato**.

### Export

Nella tab Portfolio: **Export CSV** o **Export JSON** per backup/analisi.

### Catalogo personalizzato

- **Aggiungi prodotto** — nuovo item in `data/user-catalog.json`
- **Catalogo** — modifica o elimina prodotti aggiunti da UI
- Dopo ogni modifica: **Aggiorna prezzi**

Chiavi portfolio gradate: `productId:PSA-10`.

## Variabili ambiente

Vedi `.env.example`.

```bash
# Portfolio
# PORTFOLIO_PATH=data/portfolio.json

# Catalogo utente
# USER_CATALOG_PATH=data/user-catalog.json

# CardTrader — solo immagini (mai prezzi)
# CARDTRADER_API_TOKEN=...
```

## Stack

Next.js 15 · Cheerio · Playwright (opzionale) · tsx · Recharts · Tailwind 4
