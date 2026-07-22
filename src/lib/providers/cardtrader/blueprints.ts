import { cardTraderFetch, isCardTraderConfigured } from "./client";
import type { CardTraderBlueprint } from "./types";

const expansionCache = new Map<number, CardTraderBlueprint[]>();
const blueprintImageCache = new Map<number, string>();

/** CardTrader usa /preview_ nelle URL — /show_ per risoluzione maggiore */
export function normalizeCardTraderImageUrl(url: string): string {
  return url.replace("/preview_", "/show_");
}

export async function loadExpansionBlueprints(
  expansionId: number
): Promise<CardTraderBlueprint[]> {
  const cached = expansionCache.get(expansionId);
  if (cached) return cached;

  const data = await cardTraderFetch<CardTraderBlueprint[]>(
    `/blueprints/export?expansion_id=${expansionId}`
  );
  expansionCache.set(expansionId, data);
  for (const bp of data) {
    if (bp.image_url) {
      blueprintImageCache.set(bp.id, normalizeCardTraderImageUrl(bp.image_url));
    }
  }
  return data;
}

export async function getBlueprintImageById(
  blueprintId: number,
  expansionId?: number
): Promise<string | null> {
  if (!isCardTraderConfigured()) return null;

  const cached = blueprintImageCache.get(blueprintId);
  if (cached) return cached;

  if (expansionId) {
    await loadExpansionBlueprints(expansionId);
    return blueprintImageCache.get(blueprintId) ?? null;
  }

  return null;
}

export async function findBlueprintImage(options: {
  expansionId?: number;
  blueprintId?: number;
  tcgplayerProductId?: number;
  nameIncludes?: string[];
}): Promise<string | null> {
  if (!isCardTraderConfigured() || !options.expansionId) return null;

  const blueprints = await loadExpansionBlueprints(options.expansionId);

  let match: CardTraderBlueprint | undefined;

  if (options.blueprintId) {
    match = blueprints.find((b) => b.id === options.blueprintId);
  }

  if (!match && options.tcgplayerProductId) {
    const id = String(options.tcgplayerProductId);
    match = blueprints.find((b) => String(b.tcg_player_id ?? "") === id);
  }

  if (!match && options.nameIncludes?.length) {
    const terms = options.nameIncludes.map((t) => t.toLowerCase());
    match = blueprints.find((b) => {
      const name = b.name.toLowerCase();
      return terms.every((t) => name.includes(t));
    });
  }

  if (!match?.image_url) return null;
  const url = normalizeCardTraderImageUrl(match.image_url);
  blueprintImageCache.set(match.id, url);
  return url;
}
