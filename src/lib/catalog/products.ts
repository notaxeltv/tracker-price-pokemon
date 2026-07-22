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
      searchTerm: "pokemon 151 charizard ex 201 psa 10 japanese",
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
    grading: { company: "BGS", grades: [10] },
    sources: ["ebay_us", "cardmarket"],
    scrape: {
      searchTerm: "pokemon charizard base set bgs 10",
    },
    enabled: false,
    tags: ["future", "bgs", "en"],
  },
];

export function getEnabledCatalog(): CatalogProduct[] {
  return PRODUCT_CATALOG.filter((p) => p.enabled !== false);
}

export function getCatalogByKind(kind: CatalogProduct["kind"]): CatalogProduct[] {
  return getEnabledCatalog().filter((p) => p.kind === kind);
}
