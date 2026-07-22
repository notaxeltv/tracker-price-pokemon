# Pokémon Price Tracker

Dashboard web per monitorare i prezzi di **prodotti sealed** (booster box, ETB, bundle) e **carte gradate** (PSA, BGS, CGC) del Pokémon TCG sui mercati EU e US.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## Funzionalità

- **Overview statistiche**: prodotti monitorati, variazione media 7g, top gainers/losers
- **Prodotti sealed**: tabella con prezzi, variazioni 24h/7g/30g e sparkline
- **Carte gradate**: prezzi per PSA, BGS e CGC con breakdown per grado
- **Grafici storici**: trend prezzi con intervalli 7G, 30G, 90G, 1A
- **Filtri**: ricerca, mercato (EU/US), grading company, ordinamento
- **API REST**: endpoint `/api/dashboard` per integrazioni esterne

## Avvio rapido

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Build produzione

```bash
npm run build
npm start
```

## Integrazione API esterne

La dashboard usa attualmente dati demo realistici. Per collegare fonti live, configura le variabili in `.env`:

```env
PKMNPRICES_API_KEY=your_key
TCG_PRICE_LOOKUP_API_KEY=your_key
RAPIDAPI_KEY=your_key
```

Provider compatibili:

| Provider | Sealed | Gradate | Storico |
|----------|--------|---------|---------|
| [PkmnPrices](https://www.pkmnprices.com/docs) | ✅ | ✅ | ✅ |
| [PokeTrace](https://poketrace.com) | ✅ | ✅ | ✅ |
| [TCG Price Lookup](https://tcgpricelookup.com/tcg-api) | — | ✅ | ✅ |

## Struttura progetto

```
src/
├── app/
│   ├── api/dashboard/route.ts   # API dati dashboard
│   ├── layout.tsx
│   └── page.tsx
├── components/dashboard/        # UI componenti
└── lib/
    ├── types.ts                 # Tipi TypeScript
    ├── mock-data.ts             # Dati demo
    ├── data-service.ts          # Logica fetch e filtri
    └── utils.ts                 # Formattazione e helper
```

## Stack

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **Recharts** per i grafici
- **Lucide React** per le icone

## Licenza

MIT
