import "server-only";

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { CatalogProduct } from "../scrapers/types";

const DEFAULT_PATH = path.join(process.cwd(), "data/user-catalog.json");

export function getUserCatalogPath(): string {
  return process.env.USER_CATALOG_PATH ?? DEFAULT_PATH;
}

export async function loadUserCatalog(): Promise<CatalogProduct[]> {
  try {
    const raw = await readFile(getUserCatalogPath(), "utf-8");
    const parsed = JSON.parse(raw) as CatalogProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveUserCatalog(products: CatalogProduct[]): Promise<void> {
  const filePath = getUserCatalogPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(products, null, 2), "utf-8");
}

export async function addUserCatalogProduct(
  product: CatalogProduct
): Promise<CatalogProduct[]> {
  const current = await loadUserCatalog();
  if (current.some((p) => p.id === product.id)) {
    throw new Error("Prodotto già presente nel catalogo");
  }
  const next = [...current, product];
  await saveUserCatalog(next);
  return next;
}

export function slugifyId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export function buildUserProductId(kind: string, name: string): string {
  const slug = slugifyId(name) || "prodotto";
  return `user-${kind}-${slug}-${Date.now().toString(36)}`;
}

export function isUserCatalogProduct(id: string): boolean {
  return id.startsWith("user-");
}

export async function updateUserCatalogProduct(
  id: string,
  updates: Partial<CatalogProduct>
): Promise<CatalogProduct[]> {
  if (!isUserCatalogProduct(id)) {
    throw new Error("Solo i prodotti aggiunti da UI sono modificabili");
  }

  const current = await loadUserCatalog();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Prodotto non trovato");

  const existing = current[index];
  current[index] = {
    ...existing,
    ...updates,
    id: existing.id,
    tags: ["user"],
  };

  await saveUserCatalog(current);
  return current;
}

export async function deleteUserCatalogProduct(
  id: string
): Promise<CatalogProduct[]> {
  if (!isUserCatalogProduct(id)) {
    throw new Error("Solo i prodotti aggiunti da UI sono eliminabili");
  }

  const current = await loadUserCatalog();
  const next = current.filter((p) => p.id !== id);
  if (next.length === current.length) {
    throw new Error("Prodotto non trovato");
  }

  await saveUserCatalog(next);
  return next;
}
