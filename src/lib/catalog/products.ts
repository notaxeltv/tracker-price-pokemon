import type { CatalogProduct } from "../scrapers/types";

/**
 * Catalogo prodotti — aggiungi nuove voci qui per espandere il monitoraggio.
 * Supporta: sealed IT/EN/JP, graded PSA/BGS/..., raw, accessory (futuro).
 */
export const PRODUCT_CATALOG: CatalogProduct[] = [
  // ─── Sealed ENG ─────────────────────────────────────────
  {
    id: "sealed-151-bb-en",
    kind: "sealed",
    name: "151 Booster Box",
    set: "Scarlet & Violet — 151",
    setCode: "MEW",
    language: "EN",
    sealedType: "booster_box",
    imageUrl: "https://assets.tcgdex.net/en/sv/sv03.5/logo",
    sources: ["tcgplayer"],
    scrape: {
      tcgplayerProductId: 593355,
      searchTerm: "pokemon 151 booster box english sealed",
    },
    tags: ["current"],
  },
  {
    id: "sealed-151-etb-en",
    kind: "sealed",
    name: "151 Elite Trainer Box",
    set: "Scarlet & Violet — 151",
    setCode: "MEW",
    language: "EN",
    sealedType: "etb",
    imageUrl: "https://assets.tcgdex.net/en/sv/sv03.5/logo",
    sources: ["tcgplayer"],
    scrape: { tcgplayerProductId: 528038 },
    tags: ["current"],
  },
  {
    id: "sealed-prismatic-bb-en",
    kind: "sealed",
    name: "Prismatic Evolutions Booster Box",
    set: "Scarlet & Violet — Prismatic Evolutions",
    setCode: "PRE",
    language: "EN",
    sealedType: "booster_box",
    sources: ["tcgplayer"],
    scrape: { tcgplayerProductId: 553001 },
    tags: ["current"],
  },
  {
    id: "sealed-evolving-bb-en",
    kind: "sealed",
    name: "Evolving Skies Booster Box",
    set: "Sword & Shield — Evolving Skies",
    setCode: "EVS",
    language: "EN",
    sealedType: "booster_box",
    imageUrl: "https://assets.tcgdex.net/en/swsh/swsh7/logo",
    sources: ["tcgplayer"],
    scrape: { tcgplayerProductId: 624679 },
    tags: ["current"],
  },
  {
    id: "sealed-crown-etb-en",
    kind: "sealed",
    name: "Crown Zenith Elite Trainer Box",
    set: "Sword & Shield — Crown Zenith",
    setCode: "CRZ",
    language: "EN",
    sealedType: "etb",
    imageUrl: "https://assets.tcgdex.net/en/swsh/swsh12.5/logo",
    sources: ["tcgplayer"],
    scrape: { tcgplayerProductId: 450289 },
    tags: ["current"],
  },

  // ─── Sealed ITA (Cardmarket scrape) ─────────────────────
  {
    id: "sealed-151-bb-it",
    kind: "sealed",
    name: "151 Display Booster (IT)",
    set: "Scarlet & Violet — 151",
    setCode: "MEW",
    language: "IT",
    sealedType: "booster_box",
    imageUrl: "https://assets.tcgdex.net/en/sv/sv03.5/logo",
    sources: ["cardmarket"],
    scrape: {
      cardmarketUrl:
        "https://www.cardmarket.com/it/Pokemon/Products/Sealed-Products/Booster-Boxes/151",
      searchTerm: "151 display booster italiano",
    },
    tags: ["current"],
  },
  {
    id: "sealed-151-etb-it",
    kind: "sealed",
    name: "151 Elite Trainer Box (IT)",
    set: "Scarlet & Violet — 151",
    setCode: "MEW",
    language: "IT",
    sealedType: "etb",
    imageUrl: "https://assets.tcgdex.net/en/sv/sv03.5/logo",
    sources: ["cardmarket"],
    scrape: {
      cardmarketUrl:
        "https://www.cardmarket.com/it/Pokemon/Products/Sealed-Products/Trainer-Boxes/151",
    },
    tags: ["current"],
  },
  {
    id: "sealed-prismatic-bb-it",
    kind: "sealed",
    name: "Prismatic Evolutions Booster Box (IT)",
    set: "Scarlet & Violet — Prismatic Evolutions",
    setCode: "PRE",
    language: "IT",
    sealedType: "booster_box",
    sources: ["cardmarket"],
    scrape: {
      cardmarketUrl:
        "https://www.cardmarket.com/it/Pokemon/Products/Sealed-Products/Booster-Boxes/Prismatic-Evolutions",
    },
    tags: ["current"],
  },
  {
    id: "sealed-ascesa-eroica-etb-it",
    kind: "sealed",
    name: "Ascesa Eroica ETB (IT)",
    set: "Megaevoluzione — Ascesa Eroica",
    setCode: "ASC",
    language: "IT",
    sealedType: "etb",
    sources: ["cardmarket"],
    scrape: {
      cardmarketUrl:
        "https://www.cardmarket.com/it/Pokemon/Products/Elite-Trainer-Boxes/Ascended-Heroes-Elite-Trainer-Box",
      searchTerm:
        "pokemon ascesa eroica set allenatore fuoriclasse italiano sigillato",
    },
    tags: ["current", "it"],
  },
  {
    id: "sealed-obsidian-etb-it",
    kind: "sealed",
    name: "Fiamme Obsidiane ETB (IT)",
    set: "Scarlet & Violet — Obsidian Flames",
    setCode: "OBF",
    language: "IT",
    sealedType: "etb",
    imageUrl: "https://assets.tcgdex.net/en/sv/sv3/logo",
    sources: ["cardmarket"],
    scrape: {
      cardmarketUrl:
        "https://www.cardmarket.com/it/Pokemon/Products/Sealed-Products/Trainer-Boxes/Obsidian-Flames",
    },
    tags: ["current"],
  },

  // ─── PSA JP (eBay scrape) ───────────────────────────────
  {
    id: "graded-jp-pikachu-151",
    kind: "graded",
    name: "Pikachu",
    nameLocal: "ピカチュウ",
    set: "ポケモンカード151",
    setCode: "SV2a",
    language: "JP",
    cardNumber: "173/165",
    imageUrl: "https://assets.tcgdex.net/ja/SV/SV2a/173",
    grading: { company: "PSA", grades: [10, 9] },
    sources: ["ebay_it", "ebay_us", "cardmarket"],
    scrape: {
      tcgdxCardId: "SV2a-173",
      searchTerm: "pokemon 151 pikachu 173 psa 10 japanese",
    },
    tags: ["current", "psa", "jp"],
  },
  {
    id: "graded-jp-mew-ex-151",
    kind: "graded",
    name: "Mew ex",
    nameLocal: "ミュウex",
    set: "ポケモンカード151",
    setCode: "SV2a",
    language: "JP",
    cardNumber: "205/165",
    imageUrl: "https://assets.tcgdex.net/ja/SV/SV2a/205",
    grading: { company: "PSA", grades: [10, 9] },
    sources: ["ebay_it", "ebay_us", "cardmarket"],
    scrape: {
      tcgdxCardId: "SV2a-205",
      searchTerm: "pokemon 151 mew ex 205 psa 10 japanese",
    },
    tags: ["current", "psa", "jp"],
  },
  {
    id: "graded-jp-charizard-151",
    kind: "graded",
    name: "Charizard ex",
    nameLocal: "リザードンex",
    set: "ポケモンカード151",
    setCode: "SV2a",
    language: "JP",
    cardNumber: "201/165",
    imageUrl: "https://assets.tcgdex.net/ja/SV/SV2a/201",
    grading: { company: "PSA", grades: [10, 9] },
    sources: ["ebay_it", "ebay_us", "cardmarket"],
    scrape: {
      tcgdxCardId: "SV2a-201",
      searchTerm: "charizard ex 201/165 PSA 10 japanese sv2a",
    },
    tags: ["current", "psa", "jp"],
  },
  {
    id: "graded-jp-umbreon-vmax",
    kind: "graded",
    name: "Umbreon VMAX (HR)",
    nameLocal: "ブラッキーVMAX",
    set: "イーブイヒーローズ",
    setCode: "S6a",
    language: "JP",
    cardNumber: "025/069",
    imageUrl: "https://assets.tcgdex.net/ja/S/S6a/025",
    grading: { company: "PSA", grades: [10] },
    sources: ["ebay_it", "ebay_us"],
    scrape: {
      searchTerm: "pokemon umbreon vmax psa 10 japanese s6a",
    },
    tags: ["current", "psa", "jp"],
  },
  {
    id: "graded-jp-lillie",
    kind: "graded",
    name: "Lillie (SR)",
    nameLocal: "リーリエ",
    set: "コレクション ムーン",
    setCode: "SM1M",
    language: "JP",
    cardNumber: "066/060",
    imageUrl: "https://assets.tcgdex.net/ja/SM/SM1M/066",
    grading: { company: "PSA", grades: [10, 9] },
    sources: ["ebay_it", "ebay_us"],
    scrape: {
      searchTerm: "pokemon lillie sr psa 10 japanese sm1m",
    },
    tags: ["current", "psa", "jp"],
  },
  {
    id: "graded-jp-giratina-vstar",
    kind: "graded",
    name: "Giratina VSTAR (AR)",
    nameLocal: "ギラティナVSTAR",
    set: "VSTARユニバース",
    setCode: "S12a",
    language: "JP",
    cardNumber: "111/172",
    imageUrl: "https://assets.tcgdex.net/ja/S/S12a/111",
    grading: { company: "PSA", grades: [10] },
    sources: ["ebay_it", "ebay_us"],
    scrape: {
      searchTerm: "pokemon giratina vstar psa 10 japanese s12a",
    },
    tags: ["current", "psa", "jp"],
  },

  // ─── Esempio futuro (disabilitato) — BGS EN raw ───────────
  {
    id: "graded-en-charizard-legacy",
    kind: "graded",
    name: "Charizard Base Set",
    set: "Base Set",
    setCode: "BS",
    language: "EN",
    cardNumber: "4/102",
    grading: { company: "BGS", grades: [10, 9] },
    sources: ["ebay_us", "ebay_it", "cardmarket"],
    scrape: {
      searchTerm: "pokemon charizard base set bgs 10",
    },
    tags: ["bgs", "en"],
  },
  {
    id: "graded-en-lugia-cgc",
    kind: "graded",
    name: "Lugia Neo Genesis",
    set: "Neo Genesis",
    setCode: "N1",
    language: "EN",
    cardNumber: "9/111",
    grading: { company: "CGC", grades: [10] },
    sources: ["ebay_us", "cardmarket"],
    scrape: {
      searchTerm: "pokemon lugia neo genesis cgc 10",
    },
    tags: ["cgc", "en"],
  },

  // ─── Sealed JP ───────────────────────────────────────────
  {
    id: "sealed-151-bb-jp",
    kind: "sealed",
    name: "151 Booster Box (JP)",
    set: "ポケモンカード151",
    setCode: "SV2a",
    language: "JP",
    sealedType: "booster_box",
    imageUrl: "https://assets.tcgdex.net/ja/SV/SV2a/logo",
    sources: ["ebay_us", "cardmarket"],
    scrape: {
      searchTerm: "pokemon 151 booster box japanese sealed sv2a",
      cardmarketUrl:
        "https://www.cardmarket.com/en/Pokemon/Products/Sealed-Products/Booster-Boxes/151-Japanese",
    },
    tags: ["jp"],
  },
  {
    id: "sealed-vstar-box-jp",
    kind: "sealed",
    name: "VSTAR Universe Booster Box (JP)",
    set: "VSTARユニバース",
    setCode: "S12a",
    language: "JP",
    sealedType: "booster_box",
    imageUrl: "https://assets.tcgdex.net/ja/S/S12a/logo",
    sources: ["ebay_us", "cardmarket"],
    scrape: {
      searchTerm: "pokemon vstar universe booster box japanese s12a sealed",
    },
    tags: ["jp"],
  },

  // ─── Raw EN ──────────────────────────────────────────────
  {
    id: "raw-en-charizard-base",
    kind: "raw",
    name: "Charizard",
    set: "Base Set",
    setCode: "BS",
    language: "EN",
    cardNumber: "4/102",
    sources: ["cardmarket", "ebay_us", "tcgplayer"],
    scrape: {
      tcgdxCardId: "base1-4",
      searchTerm: "pokemon charizard base set 4/102 holo raw nm",
    },
    tags: ["raw", "en"],
  },
  {
    id: "raw-en-pikachu-151",
    kind: "raw",
    name: "Pikachu",
    set: "Scarlet & Violet — 151",
    setCode: "MEW",
    language: "EN",
    cardNumber: "173/165",
    imageUrl: "https://assets.tcgdex.net/en/sv/sv03.5/173",
    sources: ["tcgplayer", "cardmarket", "ebay_us"],
    scrape: {
      searchTerm: "pokemon 151 pikachu 173/165 raw english",
    },
    tags: ["raw", "en"],
  },

  // ─── Accessori ───────────────────────────────────────────
  {
    id: "accessory-etb-sleeves",
    kind: "accessory",
    name: "Ultra Pro Eclipse Sleeves (100ct)",
    set: "Accessori",
    setCode: "ACC",
    language: "ANY",
    sources: ["ebay_it", "ebay_us"],
    scrape: {
      searchTerm: "ultra pro eclipse pokemon sleeves 100",
    },
    tags: ["accessory"],
  },
  {
    id: "accessory-toploader",
    kind: "accessory",
    name: "Toploader rigidi (25ct)",
    set: "Accessori",
    setCode: "ACC",
    language: "ANY",
    sources: ["ebay_it", "ebay_us"],
    scrape: {
      searchTerm: "pokemon card toploader 25 pack",
    },
    tags: ["accessory"],
  },
];

export function getEnabledCatalog(): CatalogProduct[] {
  return PRODUCT_CATALOG.filter((p) => p.enabled !== false);
}

export function getCatalogByKind(kind: CatalogProduct["kind"]): CatalogProduct[] {
  return getEnabledCatalog().filter((p) => p.kind === kind);
}
