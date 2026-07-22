"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { CatalogProduct } from "@/lib/scrapers/types";
import { AddProductPanel } from "./add-product-panel";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

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

  return (
    <>
      <Modal open={open} onClose={onClose} size="lg">
        <ModalHeader
          onClose={onClose}
          title="Catalogo personalizzato"
          description="Modifica o elimina prodotti aggiunti da UI"
        />

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
                className="flex items-start justify-between gap-3 rounded-xl border border-border bg-zinc-800/40 p-3"
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
                  <Button
                    variant="danger-ghost"
                    onClick={() => setEditProduct(product)}
                    title="Modifica"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger-ghost"
                    onClick={() => handleDelete(product.id, product.name)}
                    className="hover:bg-red-500/10 hover:text-red-400"
                    title="Elimina"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </Modal>

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
