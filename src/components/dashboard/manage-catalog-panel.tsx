"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import type { CatalogProduct } from "@/lib/scrapers/types";
import { AddProductPanel } from "./add-product-panel";

interface ManageCatalogPanelProps {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}

export function ManageCatalogPanel({
  open,
  onClose,
  onChanged,
}: ManageCatalogPanelProps) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<CatalogProduct | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/catalog");
      if (!res.ok) throw new Error("Caricamento fallito");
      const json = (await res.json()) as { products: CatalogProduct[] };
      setProducts(json.products ?? []);
    } catch {
      setError("Impossibile caricare il catalogo utente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadProducts();
  }, [open, loadProducts]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminare "${name}" dal catalogo?`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/catalog?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Eliminazione fallita");
      await loadProducts();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore eliminazione");
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
        <div className="absolute inset-0" onClick={onClose} aria-hidden />
        <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-zinc-100">Catalogo personalizzato</h3>
              <p className="mt-0.5 text-sm text-zinc-500">
                Modifica o elimina prodotti aggiunti da UI
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {loading && (
            <p className="py-8 text-center text-sm text-zinc-500">Caricamento…</p>
          )}

          {!loading && products.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500">
              Nessun prodotto personalizzato. Usa &quot;Aggiungi prodotto&quot;.
            </p>
          )}

          {!loading && products.length > 0 && (
            <ul className="space-y-2">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-800/40 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-100">
                      {product.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {product.kind} · {product.set} · {product.language}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => setEditProduct(product)}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                      title="Modifica"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id, product.name)}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                      title="Elimina"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      </div>

      <AddProductPanel
        open={editProduct != null}
        editProduct={editProduct ?? undefined}
        onClose={() => setEditProduct(null)}
        onAdded={() => {
          setEditProduct(null);
          loadProducts();
          onChanged();
        }}
      />
    </>
  );
}
