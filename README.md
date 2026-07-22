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

## Mercati supportati

| Mercato | Fonti (riferimento) | Valuta | Note |
|---------|----------------------|--------|------|
| **🇮🇹 Italia / EU** | Cardmarket, eBay IT | EUR | Prezzi consultabili su Cardmarket; **nessuna API key pubblica** |
| **🌍 Internazionale** | TCGPlayer, eBay US | USD | API disponibili via aggregatori |

La dashboard mostra un **confronto side-by-side** con spread percentuale e grafici duali (verde = IT/EU, arancione = INTL).

## Cardmarket e API: cosa sapere

**Cardmarket non rilascia chiavi API** in modalità self-service. L’accesso programmatico ufficiale (OAuth 1.0a) è riservato a partner/tool registrati, con processo di approvazione.

Per automatizzare i prezzi **senza API Cardmarket diretta**, le opzioni realistiche sono:

| Strategia | Costo | Sealed | Gradate | EUR (Cardmarket) | USD |
|-----------|-------|--------|---------|------------------|-----|
| **[PkmnPrices](https://www.pkmnprices.com/docs)** | Free tier | ✅ | ✅ | ✅ aggregato | ✅ |
| **[PokeTrace](https://poketrace.com/docs)** | Free tier | ✅ | ✅ | ✅ aggregato | ✅ |
| **[TCGdex](https://tcgdex.dev/markets-prices)** | Gratuito, **no API key** | ❌ | ❌ | ✅ carte raw | ✅ |
| **Consultazione manuale** | Gratis | ✅ | ✅ | [cardmarket.com/it](https://www.cardmarket.com/it/Pokemon) | [tcgplayer.com](https://www.tcgplayer.com) |

> **TCGdex** è l’unica opzione gratuita senza registrazione: include prezzi Cardmarket (trend, avg7, avg30) nelle risposte carta, ma **non copre sealed né gradate**.

## Integrazione API esterne

La dashboard usa attualmente **dati demo**. Per collegare fonti live:

```env
# Aggregatori (consigliati per IT + internazionale)
PKMNPRICES_API_KEY=your_key
POKETRACE_API_KEY=your_key

# Gratuito, solo carte singole raw
TCGDEX_LANG=it
```

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
