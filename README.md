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

| Strategia | Costo | Sealed | Gradate | EUR (Cardmarket) | USD | Note |
|-----------|-------|--------|---------|------------------|-----|------|
| **[TCGdex](https://tcgdex.dev/markets-prices)** | **Gratis**, no API key | ❌ | ❌ | ✅ carte raw | ✅ | Unica opzione live davvero gratuita |
| **[PkmnPrices](https://www.pkmnprices.com/docs) Free** | $0 | ❌ | ❌ | ❌ | ⚠️ solo carte EN | 100 crediti/giorno, no sealed/EU/eBay |
| **[PkmnPrices](https://www.pkmnprices.com/docs) Pro** | ~$15/mo | ✅ | ✅ | ✅ | ✅ | Copre tutto ciò che serve |
| **[PokeTrace](https://poketrace.com/docs) Pro** | a pagamento | ✅ | ✅ | ✅ | ✅ | Free: accesso limitato, no EU/gradate |
| **Consultazione manuale** | Gratis | ✅ | ✅ | [cardmarket.com/it](https://www.cardmarket.com/it/Pokemon) | [tcgplayer.com](https://www.tcgplayer.com) | — |

> **Attenzione piano Free PkmnPrices:** niente sealed, niente prezzi EU (Cardmarket), niente listing TCGPlayer/Cardmarket, niente eBay vendute, solo carte inglesi. Per la dashboard IT + internazionale serve almeno **Pro**.

## Integrazione API esterne

La dashboard usa attualmente **dati demo**. Strategia consigliata per prezzi live:

| Componente | Fonte | Piano |
|------------|-------|-------|
| Carte raw IT + INTL | **TCGdex** (gratis) | Nessuna key |
| Sealed + gradate + storico | **PkmnPrices Pro** o **PokeTrace Pro** | A pagamento |

```env
# Gratis — carte singole live (Cardmarket EUR + TCGPlayer USD)
TCGDEX_LANG=it

# A pagamento — sealed, gradate, storico completo
PKMNPRICES_API_KEY=your_pro_key
# oppure
POKETRACE_API_KEY=your_pro_key
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
