import type { CatalogProduct } from "../../scrapers/types";
import { getEnabledCatalog } from "../../catalog/products";
import type {
  AccessoryProduct,
  DashboardData,
  GradedCard,
  RawCard,
  SealedProduct,
} from "../../types";
import { findBlueprintImage, getBlueprintImageById } from "./blueprints";
import { isCardTraderConfigured } from "./client";

async function resolveCatalogImage(
  item: CatalogProduct
): Promise<string | null> {
  const ct = item.scrape;

  if (ct.cardtraderBlueprintId) {
    const byId = await getBlueprintImageById(
      ct.cardtraderBlueprintId,
      ct.cardtraderExpansionId
    );
    if (byId) return byId;
  }

  return findBlueprintImage({
    expansionId: ct.cardtraderExpansionId,
    blueprintId: ct.cardtraderBlueprintId,
    tcgplayerProductId: ct.tcgplayerProductId,
    nameIncludes: ct.cardtraderNameIncludes,
  });
}

const catalogImageCache = new Map<string, string | null>();

async function imageForCatalogId(catalogId: string): Promise<string | null> {
  if (catalogImageCache.has(catalogId)) {
    return catalogImageCache.get(catalogId) ?? null;
  }

  const item = getEnabledCatalog().find((p) => p.id === catalogId);
  if (!item) {
    catalogImageCache.set(catalogId, null);
    return null;
  }

  const url = await resolveCatalogImage(item);
  catalogImageCache.set(catalogId, url);
  return url;
}

async function applyImage<T extends { id: string; imageUrl?: string }>(
  entity: T,
  catalogId: string
): Promise<T> {
  if (!isCardTraderConfigured()) return entity;

  const ctImage = await imageForCatalogId(catalogId);
  if (!ctImage) return entity;

  return { ...entity, imageUrl: ctImage };
}

/** Sovrascribe imageUrl con immagini CardTrader (solo immagini, mai prezzi). */
export async function enrichDashboardImages(
  data: DashboardData
): Promise<DashboardData> {
  if (!isCardTraderConfigured()) return data;

  const [sealed, graded, raw, accessory] = await Promise.all([
    Promise.all(data.sealed.map((p) => applyImage(p, p.id))),
    Promise.all(data.graded.map((c) => applyImage(c, c.id))),
    Promise.all(data.raw.map((c) => applyImage(c, c.id))),
    Promise.all(data.accessory.map((p) => applyImage(p, p.id))),
  ]);

  return { ...data, sealed, graded, raw, accessory };
}
