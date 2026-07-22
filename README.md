# Pokémon Price Tracker

> **European market dashboard** for Pokémon sealed products, graded cards (PSA / BGS / CGC), raw cards, and accessories — **no paid price APIs**, powered by scraping + local JSON snapshots.

Monitor **Cardmarket** (minimum EU listing) and **eBay EU** (sold + active listings, EU origin filter) side by side. Track your personal portfolio: purchase price, quantity, sales, profit/loss, and price alerts.

---

## Table of Contents (English)

1. [Features](#features)
2. [Market Sources](#market-sources)
3. [Quick Start](#quick-start)
4. [Environment Variables](#environment-variables)
5. [Scraping](#scraping)
6. [Dashboard UI](#dashboard-ui)
7. [Portfolio](#portfolio)
8. [Custom Catalog](#custom-catalog)
9. [REST API](#rest-api)
10. [Data Files](#data-files)
11. [Architecture](#architecture)
12. [Built-in Catalog](#built-in-catalog)
13. [Troubleshooting](#troubleshooting)
14. [Tech Stack](#tech-stack)

---

## Features

| Area | Capability |
|------|------------|
| **Prices** | Cardmarket min listing (EUR) + eBay EU sold/active (EUR), EU origin only |
| **Product types** | Sealed IT/EN/JP, graded PSA/BGS/CGC, raw, accessories |
| **Charts** | 7d / 30d / 90d / 1y history, dual-market compare, **purchase reference line** |
| **Portfolio** | Purchase price, quantity, date, notes, plexiglass case cost |
| **Sales** | Record sale price + date → **realized P/L** vs **unrealized P/L** (still owned) |
| **Alerts** | Price above (sell target) / below (stop loss) — visual badges + banner |
| **Export** | Portfolio → CSV or JSON |
| **Catalog** | Add / edit / delete custom products from the UI |
| **Filters** | Search, language, grading, market, sort, **portfolio-only** |
| **Images** | Optional CardTrader API (images only, never prices) |
| **Scraping** | On-demand when opening the app; optional local cron |

---

## Market Sources

Only **two price sources** are used in the live pipeline:

| Region code | Source | What it shows |
|-------------|--------|---------------|
| `IT` | **Cardmarket** | Minimum listing price on the European marketplace (EUR) |
| `INTL` | **eBay EU** | Sold listings + active listings, filtered to **European Union** origin (`LH_PrefLoc=3` on ebay.it) |

> TCGPlayer, eBay US, and other legacy scrapers exist in the codebase but are **not** used for dashboard prices.

**CardTrader** (optional): enriches product/card **images** only when `CARDTRADER_API_TOKEN` is set. Prices always come from Cardmarket + eBay EU.

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- **Local machine recommended** for scraping (home IP + Playwright). Cloud/Vercel deployments will show many sources as **BLOCKED**.

### Install & run

```bash
git clone <your-repo>
cd tracker-price-pokemon
npm install
npx playwright install chromium   # required for Cardmarket / eBay in production-like scraping
cp .env.example .env.local        # then edit values
npm run dev
```

Open **http://localhost:3000**.

### Recommended `.env.local`

```bash
SCRAPE_USE_PLAYWRIGHT=true
SCRAPE_ON_DEMAND=true
SCRAPE_CACHE_TTL=3600
SCRAPE_MIN_INTERVAL=300
SCRAPE_USE_SNAPSHOT=true
```

### Production build

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SCRAPE_USE_PLAYWRIGHT` | `false` | Use Playwright to bypass Cloudflare on Cardmarket/eBay |
| `SCRAPE_ON_DEMAND` | `false` | Auto-scrape when dashboard opens if snapshot is stale |
| `SCRAPE_CACHE_TTL` | `3600` | Max snapshot age (seconds) before auto re-scrape |
| `SCRAPE_MIN_INTERVAL` | `300` | Minimum seconds between two scrape runs |
| `SCRAPE_USE_SNAPSHOT` | `true` | Show last snapshot immediately, then refresh in background |
| `SCRAPE_REFRESH_ON_OPEN` | — | If set, always scrape on every dashboard open |
| `SCRAPE_SNAPSHOT_PATH` | `data/scrape-snapshot.json` | Path to price snapshot file |
| `PORTFOLIO_PATH` | `data/portfolio.json` | Path to portfolio entries |
| `USER_CATALOG_PATH` | `data/user-catalog.json` | Path to user-added catalog products |
| `CARDTRADER_API_TOKEN` | — | JWT for CardTrader image enrichment (optional) |

See `.env.example` for a copy-paste template.

---

## Scraping

### On-demand flow (recommended)

You **do not** need to keep the app running 24/7.

1. Open the dashboard → last snapshot loads instantly (if it exists).
2. If snapshot is older than `SCRAPE_CACHE_TTL` or all quotes are blocked, a **background scrape** starts automatically.
3. Click **Aggiorna prezzi** / **Update prices** to force a refresh anytime.

### Manual scrape (CLI)

```bash
npm run scrape
```

Writes/updates `data/scrape-snapshot.json`.

### Manual scrape (HTTP)

```bash
curl -X POST "http://localhost:3000/api/scrape/refresh"
curl -X POST "http://localhost:3000/api/scrape/refresh?force=1"   # ignore min interval
```

### Optional cron (every 6 hours example)

```cron
0 */6 * * * cd /path/to/tracker-price-pokemon && npm run scrape
```

### Playwright requirement

Cardmarket and eBay often block datacenter IPs and headless HTTP-only requests. On your **home network**:

```bash
SCRAPE_USE_PLAYWRIGHT=true
npx playwright install chromium
```

Without Playwright you may see `BLOCKED` badges and `0/58 live` in the snapshot status.

---

## Dashboard UI

### Header

| Control | Action |
|---------|--------|
| **Snapshot badge** | Age, live/blocked quote count, data source |
| **Catalogo** | Manage user-added products (edit / delete) |
| **Aggiungi prodotto** | Add a new custom product to the catalog |
| **Aggiorna prezzi** | Force price scrape |

### Category tabs

| Tab | Content |
|-----|---------|
| **Tutti / All** | Every product type |
| **Portfolio** | Dedicated portfolio table + export |
| **Sealed** | Booster boxes, ETBs, bundles (IT / EN / JP) |
| **Gradate / Graded** | PSA, BGS, CGC by grade |
| **Raw** | Ungraded singles |
| **Accessori / Accessories** | Sleeves, toploaders, etc. |

### Filters

- Full-text search (name, set, card number)
- Sealed language (IT / EN / JP)
- Market: all · compare · Cardmarket only · eBay EU only
- Grading company & grade (on graded tab)
- Sort by price, 7d/30d change, name
- **Solo portfolio / Portfolio only** — hide items you don't own

### Summary cards

When portfolio data exists:

- **Invested** — total cost (purchase + optional separate plexiglass cost) × quantity
- **Unrealized P/L** — open positions vs current market
- **Realized P/L** — closed sales
- **Total P/L** — combined + percentage

### Charts

- Dual line chart: Cardmarket (green) vs eBay EU (orange)
- **Purple dashed line** = your total purchase cost (when recorded)
- Ranges: 7G · 30G · 90G · 1A

### Product tables

Each row shows market prices, 7d change, live/blocked status, sparkline, and portfolio columns:

- **Acquisto / Purchase** — edit cost basis
- **Vendi / Sell** — record a sale (when purchase exists)
- Badges: plexiglass case, sold, price alert, purchase date, notes, quantity

---

## Portfolio

Portfolio data is stored separately from market snapshots in `data/portfolio.json`.

### Recording a purchase

Click **Acquisto** on any product row (or **Acquisto** in the Portfolio tab):

| Field | Description |
|-------|-------------|
| `purchasePrice` | Unit price in EUR |
| `quantity` | Number of copies (default 1). Total invested = unit cost × qty |
| `purchaseDate` | ISO date string (optional) |
| `notes` | Free text (optional) |
| `hasPlexiglassCase` | Show plexiglass badge on the row |
| `plexiglassCost` | Extra EUR for case; leave empty if included in purchase price |
| `alertAbove` | Alert when market unit price ≥ this value (sell target) |
| `alertBelow` | Alert when market unit price ≤ this value (stop loss) |

### Recording a sale

Click **Vendi** → enter **total sale amount** (for the whole lot) + sale date.

- **Realized P/L** = `soldPrice − total invested`
- Sold items no longer count toward unrealized market value

### Portfolio keys

| Product type | Key format | Example |
|--------------|------------|---------|
| Sealed / raw / accessory | `productId` | `sealed-ascesa-eroica-etb-it` |
| Graded (per grade) | `productId:COMPANY-GRADE` | `graded-jp-charizard-151:PSA-10` |

### Export

In the **Portfolio** tab:

- **Export CSV** — spreadsheet-friendly columns (product, qty, cost, market, P/L, alerts…)
- **Export JSON** — full structured export including raw portfolio object

### Price alerts

When market price crosses your thresholds:

- Row badge: **▲ Target reached** or **▼ Below threshold**
- Yellow banner at top of dashboard listing active alerts (up to 5)

---

## Custom Catalog

### Add product (UI)

**Aggiungi prodotto** → fill form:

- Kind: graded · sealed · raw · accessory
- Name, set, language
- Graded: company, grade, card number
- Sealed: type (ETB, booster box, bundle)
- eBay EU search term
- Cardmarket URL (optional)

Saved to `data/user-catalog.json` and merged with the built-in catalog on next dashboard load.

### Manage catalog (UI)

**Catalogo** → list of user products → edit (pencil) or delete (trash).

Only IDs starting with `user-` can be modified/deleted via API.

### After catalog changes

Always click **Aggiorna prezzi** so the new product is included in the scrape run.

---

## REST API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dashboard?fast=1` | Dashboard JSON from snapshot (no scrape) |
| `GET` | `/api/portfolio` | Load portfolio entries |
| `PUT` | `/api/portfolio` | Upsert/delete entry `{ key, entry }` |
| `GET` | `/api/catalog` | List user catalog products |
| `POST` | `/api/catalog` | Add product |
| `PUT` | `/api/catalog` | Update user product (requires `id`) |
| `DELETE` | `/api/catalog?id=<id>` | Delete user product |
| `POST` | `/api/scrape/refresh` | Run scrape (`?force=1` to bypass interval) |

All routes are dynamic (no static cache).

---

## Data Files

| File | Gitignored | Purpose |
|------|------------|---------|
| `data/scrape-snapshot.json` | Yes | Latest market prices + history |
| `data/portfolio.json` | Yes | Your purchase/sale records |
| `data/user-catalog.json` | Yes | UI-added catalog entries |

### Example `portfolio.json`

```json
{
  "entries": {
    "sealed-ascesa-eroica-etb-it": {
      "purchasePrice": 54.9,
      "quantity": 1,
      "purchaseDate": "2026-01-15",
      "notes": "Acquistato in negozio",
      "hasPlexiglassCase": true,
      "alertAbove": 70
    },
    "graded-jp-charizard-151:PSA-10": {
      "purchasePrice": 650,
      "quantity": 1,
      "hasPlexiglassCase": true,
      "plexiglassCost": 45,
      "soldPrice": 720,
      "soldDate": "2026-03-01"
    }
  },
  "updatedAt": "2026-07-22T12:00:00.000Z"
}
```

---

## Architecture

```
src/
├── app/
│   ├── page.tsx                    # Dashboard page
│   └── api/
│       ├── dashboard/route.ts      # Snapshot reader
│       ├── portfolio/route.ts      # Portfolio CRUD
│       ├── catalog/route.ts        # User catalog CRUD
│       └── scrape/refresh/route.ts # On-demand scrape trigger
├── components/dashboard/           # UI: tables, charts, panels, filters
└── lib/
    ├── catalog/
    │   ├── products.ts             # Built-in catalog (~24 products)
    │   ├── user-catalog.server.ts  # User JSON persistence
    │   └── merge.ts                # built-in + user merge
    ├── scrapers/
    │   ├── orchestrator.ts         # Per-product, per-region scrape
    │   ├── cardmarket.ts           # Cardmarket HTML / Playwright
    │   ├── ebay.ts                 # eBay EU + Playwright fallback
    │   ├── playwright-scraper.ts   # Headless browser bypass
    │   └── snapshot.ts             # Save/load + history merge
    ├── portfolio.ts                # Cost, P/L, alerts logic
    ├── portfolio.server.ts         # File I/O
    ├── portfolio-summary.ts        # Dashboard aggregate stats
    ├── portfolio-resolve.ts        # Resolve keys → product names
    ├── portfolio-export.ts         # CSV/JSON export
    └── dashboard-builder.ts        # Build DashboardData from scrape
scripts/
└── scrape-cron.ts                  # CLI scrape → snapshot
data/                               # Runtime JSON (gitignored)
```

### Data flow

```
Catalog (built-in + user)
        ↓
Orchestrator → Cardmarket scraper ──┐
                eBay EU scraper  ────┼→ Merge history → scrape-snapshot.json
                Playwright (opt) ──┘
        ↓
GET /api/dashboard → React dashboard
        +
portfolio.json (manual) → P/L, alerts, export
```

---

## Built-in Catalog

Edit `src/lib/catalog/products.ts` to add products permanently (requires redeploy/restart).

Each entry supports:

- `id`, `kind`, `name`, `set`, `language`
- `scrape.searchTerm`, `scrape.cardmarketUrl`
- `grading.company` + `grading.grades[]` for graded
- `sealedType` for sealed
- `cardtraderBlueprintId` / `cardtraderExpansionId` for images
- `enabled: false` to disable without deleting

User catalog (`data/user-catalog.json`) is preferred for personal one-offs.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| All prices `BLOCKED` | Datacenter IP / no Playwright | Run locally, set `SCRAPE_USE_PLAYWRIGHT=true` |
| `0/58 live` in badge | Snapshot exists but scrape failed | `npm run scrape` on home network |
| New UI product has no prices | Not scraped yet | **Aggiorna prezzi** after adding |
| Images 400 in UI | CardTrader token or domain config | Set `CARDTRADER_API_TOKEN` or ignore |
| Portfolio P/L shows 0 | Market quotes blocked | Fix scraping first |
| Graded portfolio on wrong grade | Key must include grade | Use `productId:PSA-10` format |

---

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Recharts** (price charts)
- **Cheerio** (HTML parsing)
- **Playwright** (optional, Cloudflare bypass)
- **tsx** (CLI scrape script)

---

## NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Development server |
| `build` | `npm run build` | Production build |
| `start` | `npm start` | Production server |
| `scrape` | `npm run scrape` | CLI scrape → snapshot |
| `lint` | `npm run lint` | ESLint |

---

---

# Tracker Prezzi Pokémon

> **Dashboard mercato europeo** per prodotti sealed, carte gradate (PSA / BGS / CGC), raw e accessori — **senza API a pagamento**, basata su scraping + snapshot JSON locali.

Monitora **Cardmarket** (minimo listing EU) ed **eBay EU** (vendute + in vendita, filtro provenienza UE) affiancati. Gestisci il portfolio personale: prezzo di acquisto, quantità, vendite, profitto/perdita e alert prezzo.

---

## Indice (Italiano)

1. [Funzionalità](#funzionalità)
2. [Sorgenti di mercato](#sorgenti-di-mercato)
3. [Avvio rapido](#avvio-rapido)
4. [Variabili d'ambiente](#variabili-dambiente)
5. [Scraping](#scraping-1)
6. [Interfaccia dashboard](#interfaccia-dashboard)
7. [Portfolio](#portfolio-1)
8. [Catalogo personalizzato](#catalogo-personalizzato)
9. [API REST](#api-rest)
10. [File dati](#file-dati)
11. [Architettura](#architettura-1)
12. [Catalogo built-in](#catalogo-built-in)
13. [Risoluzione problemi](#risoluzione-problemi)
14. [Stack tecnologico](#stack-tecnologico)

---

## Funzionalità

| Area | Capacità |
|------|----------|
| **Prezzi** | Cardmarket min listing (EUR) + eBay EU vendute/attive (EUR), solo provenienza UE |
| **Tipi prodotto** | Sealed IT/EN/JP, gradate PSA/BGS/CGC, raw, accessori |
| **Grafici** | Storico 7g / 30g / 90g / 1a, confronto dual-market, **linea prezzo acquisto** |
| **Portfolio** | Prezzo acquisto, quantità, data, note, costo teca plexiglass |
| **Vendite** | Prezzo e data vendita → P/L **realizzato** vs **non realizzato** (ancora posseduti) |
| **Alert** | Soglia sopra (target vendita) / sotto (stop loss) — badge e banner visivi |
| **Export** | Portfolio → CSV o JSON |
| **Catalogo** | Aggiungi / modifica / elimina prodotti personalizzati da UI |
| **Filtri** | Ricerca, lingua, grading, mercato, ordinamento, **solo portfolio** |
| **Immagini** | CardTrader API opzionale (solo immagini, mai prezzi) |
| **Scraping** | On-demand all'apertura app; cron locale opzionale |

---

## Sorgenti di mercato

Solo **due sorgenti prezzo** nel flusso attivo:

| Codice regione | Sorgente | Cosa mostra |
|----------------|----------|-------------|
| `IT` | **Cardmarket** | Prezzo minimo listing sul marketplace europeo (EUR) |
| `INTL` | **eBay EU** | Vendute + in vendita, filtrate per provenienza **Unione Europea** (`LH_PrefLoc=3` su ebay.it) |

> TCGPlayer, eBay US e altri scraper legacy esistono nel codice ma **non** alimentano i prezzi della dashboard.

**CardTrader** (opzionale): arricchisce solo le **immagini** se è impostato `CARDTRADER_API_TOKEN`. I prezzi restano sempre Cardmarket + eBay EU.

---

## Avvio rapido

### Prerequisiti

- Node.js 18+
- npm
- **Macchina locale consigliata** per lo scraping (IP domestico + Playwright). Deploy cloud/Vercel mostreranno molte sorgenti **BLOCKED**.

### Installazione

```bash
git clone <your-repo>
cd tracker-price-pokemon
npm install
npx playwright install chromium   # necessario per Cardmarket/eBay in scraping reale
cp .env.example .env.local        # poi modifica i valori
npm run dev
```

Apri **http://localhost:3000**.

### `.env.local` consigliato

```bash
SCRAPE_USE_PLAYWRIGHT=true
SCRAPE_ON_DEMAND=true
SCRAPE_CACHE_TTL=3600
SCRAPE_MIN_INTERVAL=300
SCRAPE_USE_SNAPSHOT=true
```

### Build produzione

```bash
npm run build
npm start
```

---

## Variabili d'ambiente

| Variabile | Default | Descrizione |
|-----------|---------|-------------|
| `SCRAPE_USE_PLAYWRIGHT` | `false` | Usa Playwright per bypass Cloudflare su Cardmarket/eBay |
| `SCRAPE_ON_DEMAND` | `false` | Scrape automatico all'apertura dashboard se snapshot vecchio |
| `SCRAPE_CACHE_TTL` | `3600` | Età massima snapshot (secondi) prima del re-scrape |
| `SCRAPE_MIN_INTERVAL` | `300` | Secondi minimi tra due scrape |
| `SCRAPE_USE_SNAPSHOT` | `true` | Mostra subito l'ultimo snapshot, poi aggiorna in background |
| `SCRAPE_REFRESH_ON_OPEN` | — | Se impostato, scrape ad ogni apertura |
| `SCRAPE_SNAPSHOT_PATH` | `data/scrape-snapshot.json` | Percorso file snapshot prezzi |
| `PORTFOLIO_PATH` | `data/portfolio.json` | Percorso voci portfolio |
| `USER_CATALOG_PATH` | `data/user-catalog.json` | Percorso catalogo utente |
| `CARDTRADER_API_TOKEN` | — | JWT CardTrader per immagini (opzionale) |

Vedi `.env.example` per il template.

---

## Scraping

### Flusso on-demand (consigliato)

**Non serve** tenere l'app accesa 24/7.

1. Apri la dashboard → carica subito l'ultimo snapshot (se esiste).
2. Se lo snapshot è più vecchio di `SCRAPE_CACHE_TTL` o tutte le quote sono bloccate, parte lo **scrape in background**.
3. Clic **Aggiorna prezzi** per forzare l'aggiornamento in qualsiasi momento.

### Scrape manuale (CLI)

```bash
npm run scrape
```

Scrive/aggiorna `data/scrape-snapshot.json`.

### Scrape manuale (HTTP)

```bash
curl -X POST "http://localhost:3000/api/scrape/refresh"
curl -X POST "http://localhost:3000/api/scrape/refresh?force=1"   # ignora intervallo minimo
```

### Cron opzionale (esempio ogni 6 ore)

```cron
0 */6 * * * cd /path/to/tracker-price-pokemon && npm run scrape
```

### Requisito Playwright

Cardmarket ed eBay spesso bloccano IP da datacenter e richieste HTTP senza browser. Sulla **rete di casa**:

```bash
SCRAPE_USE_PLAYWRIGHT=true
npx playwright install chromium
```

Senza Playwright potresti vedere badge `BLOCKED` e `0/58 live` nello stato snapshot.

---

## Interfaccia dashboard

### Header

| Controllo | Azione |
|-----------|--------|
| **Badge snapshot** | Età dati, quote live/bloccate, sorgente |
| **Catalogo** | Gestisci prodotti aggiunti da UI (modifica / elimina) |
| **Aggiungi prodotto** | Nuovo prodotto nel catalogo personalizzato |
| **Aggiorna prezzi** | Forza scrape prezzi |

### Tab categorie

| Tab | Contenuto |
|-----|-----------|
| **Tutti** | Tutti i tipi prodotto |
| **Portfolio** | Tabella portfolio dedicata + export |
| **Sealed** | Box, ETB, bundle (IT / EN / JP) |
| **Gradate** | PSA, BGS, CGC per grado |
| **Raw** | Carte non gradate |
| **Accessori** | Sleeve, toploader, ecc. |

### Filtri

- Ricerca testuale (nome, set, numero carta)
- Lingua sealed (IT / EN / JP)
- Mercato: tutti · confronto · solo Cardmarket · solo eBay EU
- Grading company e grado (tab gradate)
- Ordinamento per prezzo, variazione 7g/30g, nome
- **Solo portfolio** — mostra solo ciò che possiedi

### Card riepilogo

Con dati portfolio:

- **Investito** — costo totale (acquisto + teca opzionale) × quantità
- **P/L non realizzato** — posizioni aperte vs mercato attuale
- **P/L realizzato** — vendite chiuse
- **P/L totale** — combinato + percentuale

### Grafici

- Grafico doppio: Cardmarket (verde) vs eBay EU (arancione)
- **Linea viola tratteggiata** = costo totale acquisto (se registrato)
- Intervalli: 7G · 30G · 90G · 1A

### Tabelle prodotti

Ogni riga mostra prezzi mercato, variazione 7g, stato live/bloccato, sparkline e colonne portfolio:

- **Acquisto** — modifica costo
- **Vendi** — registra vendita (se esiste un acquisto)
- Badge: teca plexiglass, venduto, alert prezzo, data acquisto, note, quantità

---

## Portfolio

I dati portfolio sono separati dagli snapshot di mercato in `data/portfolio.json`.

### Registrare un acquisto

Clic **Acquisto** su una riga prodotto (o **Acquisto** nella tab Portfolio):

| Campo | Descrizione |
|-------|-------------|
| `purchasePrice` | Prezzo unitario in EUR |
| `quantity` | Numero copie (default 1). Investito totale = costo unitario × qty |
| `purchaseDate` | Data ISO (opzionale) |
| `notes` | Testo libero (opzionale) |
| `hasPlexiglassCase` | Mostra badge teca sulla riga |
| `plexiglassCost` | Costo teca extra; lascia vuoto se incluso nel prezzo |
| `alertAbove` | Alert quando prezzo mercato unitario ≥ soglia (target vendita) |
| `alertBelow` | Alert quando prezzo mercato unitario ≤ soglia (stop loss) |

### Registrare una vendita

Clic **Vendi** → inserisci **importo totale vendita** (intero lotto) + data.

- **P/L realizzato** = `soldPrice − investito totale`
- Gli item venduti non contano più nel valore di mercato non realizzato

### Chiavi portfolio

| Tipo prodotto | Formato chiave | Esempio |
|---------------|----------------|---------|
| Sealed / raw / accessorio | `productId` | `sealed-ascesa-eroica-etb-it` |
| Gradato (per grado) | `productId:COMPANY-GRADE` | `graded-jp-charizard-151:PSA-10` |

### Export

Nella tab **Portfolio**:

- **Export CSV** — colonne per foglio di calcolo (prodotto, qty, costo, mercato, P/L, alert…)
- **Export JSON** — export strutturato completo incluso oggetto portfolio grezzo

### Alert prezzo

Quando il prezzo di mercato supera le soglie:

- Badge riga: **▲ Target raggiunto** o **▼ Sotto soglia**
- Banner giallo in cima alla dashboard con alert attivi (max 5 visibili)

---

## Catalogo personalizzato

### Aggiungi prodotto (UI)

**Aggiungi prodotto** → compila il form:

- Tipo: gradato · sealed · raw · accessorio
- Nome, set, lingua
- Gradato: company, grado, numero carta
- Sealed: tipo (ETB, booster box, bundle)
- Termine ricerca eBay EU
- URL Cardmarket (opzionale)

Salvato in `data/user-catalog.json` e unito al catalogo built-in al prossimo caricamento.

### Gestione catalogo (UI)

**Catalogo** → lista prodotti utente → modifica (matita) o elimina (cestino).

Solo gli ID che iniziano con `user-` sono modificabili/eliminabili via API.

### Dopo modifiche al catalogo

Clicca sempre **Aggiorna prezzi** per includere il nuovo prodotto nello scrape.

---

## API REST

| Metodo | Percorso | Descrizione |
|--------|----------|-------------|
| `GET` | `/api/dashboard?fast=1` | JSON dashboard dallo snapshot (senza scrape) |
| `GET` | `/api/portfolio` | Carica voci portfolio |
| `PUT` | `/api/portfolio` | Inserisci/aggiorna/elimina `{ key, entry }` |
| `GET` | `/api/catalog` | Lista prodotti catalogo utente |
| `POST` | `/api/catalog` | Aggiungi prodotto |
| `PUT` | `/api/catalog` | Modifica prodotto utente (richiede `id`) |
| `DELETE` | `/api/catalog?id=<id>` | Elimina prodotto utente |
| `POST` | `/api/scrape/refresh` | Esegui scrape (`?force=1` ignora intervallo) |

Tutte le route sono dynamic (nessuna cache statica).

---

## File dati

| File | Gitignored | Scopo |
|------|------------|-------|
| `data/scrape-snapshot.json` | Sì | Ultimi prezzi mercato + storico |
| `data/portfolio.json` | Sì | Acquisti/vendite registrati |
| `data/user-catalog.json` | Sì | Prodotti aggiunti da UI |

### Esempio `portfolio.json`

```json
{
  "entries": {
    "sealed-ascesa-eroica-etb-it": {
      "purchasePrice": 54.9,
      "quantity": 1,
      "purchaseDate": "2026-01-15",
      "notes": "Acquistato in negozio",
      "hasPlexiglassCase": true,
      "alertAbove": 70
    },
    "graded-jp-charizard-151:PSA-10": {
      "purchasePrice": 650,
      "quantity": 1,
      "hasPlexiglassCase": true,
      "plexiglassCost": 45,
      "soldPrice": 720,
      "soldDate": "2026-03-01"
    }
  },
  "updatedAt": "2026-07-22T12:00:00.000Z"
}
```

---

## Architettura

```
src/
├── app/
│   ├── page.tsx                    # Pagina dashboard
│   └── api/
│       ├── dashboard/route.ts      # Lettore snapshot
│       ├── portfolio/route.ts      # CRUD portfolio
│       ├── catalog/route.ts        # CRUD catalogo utente
│       └── scrape/refresh/route.ts # Trigger scrape on-demand
├── components/dashboard/           # UI: tabelle, grafici, pannelli, filtri
└── lib/
    ├── catalog/
    │   ├── products.ts             # Catalogo built-in (~24 prodotti)
    │   ├── user-catalog.server.ts  # Persistenza JSON utente
    │   └── merge.ts                # Merge built-in + utente
    ├── scrapers/
    │   ├── orchestrator.ts         # Scrape per prodotto e regione
    │   ├── cardmarket.ts           # Cardmarket HTML / Playwright
    │   ├── ebay.ts                 # eBay EU + fallback Playwright
    │   ├── playwright-scraper.ts   # Bypass browser headless
    │   └── snapshot.ts             # Salvataggio + merge storico
    ├── portfolio.ts                # Logica costi, P/L, alert
    ├── portfolio.server.ts         # I/O file
    ├── portfolio-summary.ts        # Statistiche aggregate dashboard
    ├── portfolio-resolve.ts        # Chiavi → nomi prodotto
    ├── portfolio-export.ts         # Export CSV/JSON
    └── dashboard-builder.ts        # Costruisce DashboardData dallo scrape
scripts/
└── scrape-cron.ts                  # CLI scrape → snapshot
data/                               # JSON runtime (gitignored)
```

### Flusso dati

```
Catalogo (built-in + utente)
        ↓
Orchestrator → Scraper Cardmarket ──┐
                Scraper eBay EU  ────┼→ Merge storico → scrape-snapshot.json
                Playwright (opt) ──┘
        ↓
GET /api/dashboard → Dashboard React
        +
portfolio.json (manuale) → P/L, alert, export
```

---

## Catalogo built-in

Modifica `src/lib/catalog/products.ts` per aggiungere prodotti permanenti (richiede restart/redeploy).

Ogni voce supporta:

- `id`, `kind`, `name`, `set`, `language`
- `scrape.searchTerm`, `scrape.cardmarketUrl`
- `grading.company` + `grading.grades[]` per gradate
- `sealedType` per sealed
- `cardtraderBlueprintId` / `cardtraderExpansionId` per immagini
- `enabled: false` per disabilitare senza eliminare

Per prodotti personali usa preferibilmente `data/user-catalog.json` via UI.

---

## Risoluzione problemi

| Sintomo | Causa probabile | Soluzione |
|---------|-----------------|-----------|
| Tutti i prezzi `BLOCKED` | IP datacenter / no Playwright | Esegui in locale, `SCRAPE_USE_PLAYWRIGHT=true` |
| `0/58 live` nel badge | Snapshot ok ma scrape fallito | `npm run scrape` da rete domestica |
| Nuovo prodotto UI senza prezzi | Non ancora scrapato | **Aggiorna prezzi** dopo l'aggiunta |
| Immagini 400 in UI | Token CardTrader o config domini | Imposta `CARDTRADER_API_TOKEN` o ignora |
| P/L portfolio a 0 | Quote mercato bloccate | Risolvi prima lo scraping |
| Portfolio grado sbagliato | Chiave senza grado | Usa formato `productId:PSA-10` |

---

## Stack tecnologico

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Recharts** (grafici prezzi)
- **Cheerio** (parsing HTML)
- **Playwright** (opzionale, bypass Cloudflare)
- **tsx** (script CLI scrape)

---

## Script NPM

| Script | Comando | Descrizione |
|--------|---------|-------------|
| `dev` | `npm run dev` | Server di sviluppo |
| `build` | `npm run build` | Build produzione |
| `start` | `npm start` | Server produzione |
| `scrape` | `npm run scrape` | Scrape CLI → snapshot |
| `lint` | `npm run lint` | ESLint |

---

## License

Private project — see repository owner for terms.
