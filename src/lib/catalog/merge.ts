import "server-only";

import type { CatalogProduct } from "../scrapers/types";
import { PRODUCT_CATALOG } from "./products";
import { loadUserCatalog } from "./user-catalog.server";

export async function getMergedCatalog(): Promise<CatalogProduct[]> {
  const builtIn = PRODUCT_CATALOG.filter((p) => p.enabled !== false);
  const user = await loadUserCatalog();
  const ids = new Set(builtIn.map((p) => p.id));
  return [...builtIn, ...user.filter((p) => p.enabled !== false && !ids.has(p.id))];
}

export async function getCatalogByKind(
  kind: CatalogProduct["kind"]
): Promise<CatalogProduct[]> {
  const catalog = await getMergedCatalog();
  return catalog.filter((p) => p.kind === kind);
}
