"use client";

import { useEffect, useState } from "react";
import { X, Plus, Pencil } from "lucide-react";
import type { CatalogProduct } from "@/lib/scrapers/types";

interface AddProductPanelProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  editProduct?: CatalogProduct;
}

function productToForm(product: CatalogProduct) {
  return {
    kind: product.kind,
    name: product.name,
    set: product.set ?? "",
    language: product.language ?? ("EN" as CatalogProduct["language"]),
    searchTerm: product.scrape?.searchTerm ?? "",
    cardmarketUrl: product.scrape?.cardmarketUrl ?? "",
    cardNumber: product.cardNumber ?? "",
    gradingCompany: product.grading?.company ?? "PSA",
    grade: String(product.grading?.grades?.[0] ?? 10),
    sealedType: product.sealedType ?? ("etb" as CatalogProduct["sealedType"]),
  };
}

export function AddProductPanel({
  open,
  onClose,
  onAdded,
  editProduct,
}: AddProductPanelProps) {
  const isEdit = editProduct != null;
  const [kind, setKind] = useState<CatalogProduct["kind"]>("graded");
  const [name, setName] = useState("");
  const [set, setSet] = useState("");
  const [language, setLanguage] = useState<CatalogProduct["language"]>("JP");
  const [searchTerm, setSearchTerm] = useState("");
  const [cardmarketUrl, setCardmarketUrl] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [gradingCompany, setGradingCompany] = useState("PSA");
  const [grade, setGrade] = useState("10");
  const [sealedType, setSealedType] = useState<CatalogProduct["sealedType"]>("etb");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editProduct) {
      const form = productToForm(editProduct);
      setKind(form.kind);
      setName(form.name);
      setSet(form.set);
      setLanguage(form.language);
      setSearchTerm(form.searchTerm);
      setCardmarketUrl(form.cardmarketUrl);
      setCardNumber(form.cardNumber);
      setGradingCompany(form.gradingCompany);
      setGrade(form.grade);
      setSealedType(form.sealedType);
    } else {
      setKind("graded");
      setName("");
      setSet("");
      setLanguage("JP");
      setSearchTerm("");
      setCardmarketUrl("");
      setCardNumber("");
      setGradingCompany("PSA");
      setGrade("10");
      setSealedType("etb");
    }
    setError(null);
  }, [open, editProduct]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Inserisci il nome del prodotto");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        id: editProduct?.id,
        kind,
        name,
        set,
        language,
        searchTerm,
        cardmarketUrl,
        cardNumber,
        gradingCompany,
        grade: Number(grade),
        sealedType,
      };

      const res = await fetch("/api/catalog", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Errore");
      onAdded();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore salvataggio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-zinc-100">
              {isEdit ? (
                <Pencil className="h-4 w-4 text-pokemon-yellow" />
              ) : (
                <Plus className="h-4 w-4 text-pokemon-yellow" />
              )}
              {isEdit ? "Modifica prodotto" : "Aggiungi prodotto"}
            </h3>
            <p className="mt-0.5 text-sm text-zinc-500">
              {isEdit
                ? "Aggiorna i dati di scraping del prodotto personalizzato"
                : "Salvato in data/user-catalog.json — poi clicca Aggiorna prezzi"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">Tipo</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as CatalogProduct["kind"])}
              disabled={isEdit}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 disabled:opacity-60"
            >
              <option value="graded">Gradato</option>
              <option value="sealed">Sealed</option>
              <option value="raw">Raw</option>
              <option value="accessory">Accessorio</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">Nome *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
              placeholder="Charizard ex PSA 10"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">Set</span>
              <input
                value={set}
                onChange={(e) => setSet(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">Lingua</span>
              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as CatalogProduct["language"])
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
              >
                <option value="JP">JP</option>
                <option value="IT">IT</option>
                <option value="EN">EN</option>
              </select>
            </label>
          </div>

          {kind === "graded" && (
            <div className="grid grid-cols-3 gap-3">
              <label className="col-span-1 block text-sm">
                <span className="mb-1 block text-zinc-400">Grading</span>
                <select
                  value={gradingCompany}
                  onChange={(e) => setGradingCompany(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
                >
                  <option value="PSA">PSA</option>
                  <option value="BGS">BGS</option>
                  <option value="CGC">CGC</option>
                </select>
              </label>
              <label className="col-span-1 block text-sm">
                <span className="mb-1 block text-zinc-400">Grado</span>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
                >
                  <option value="10">10</option>
                  <option value="9">9</option>
                </select>
              </label>
              <label className="col-span-1 block text-sm">
                <span className="mb-1 block text-zinc-400"># carta</span>
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
                />
              </label>
            </div>
          )}

          {kind === "sealed" && (
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-400">Tipo sealed</span>
              <select
                value={sealedType}
                onChange={(e) =>
                  setSealedType(e.target.value as CatalogProduct["sealedType"])
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
              >
                <option value="etb">ETB</option>
                <option value="booster_box">Booster Box</option>
                <option value="booster_bundle">Bundle</option>
              </select>
            </label>
          )}

          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">Ricerca eBay EU</span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
              placeholder="pokemon charizard psa 10 japanese"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">URL Cardmarket (opz.)</span>
            <input
              value={cardmarketUrl}
              onChange={(e) => setCardmarketUrl(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
              placeholder="https://www.cardmarket.com/it/Pokemon/..."
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="mt-5 w-full rounded-xl bg-pokemon-yellow py-2.5 text-sm font-semibold text-zinc-900 disabled:opacity-50"
        >
          {saving ? "Salvataggio…" : isEdit ? "Salva modifiche" : "Aggiungi al catalogo"}
        </button>
      </div>
    </div>
  );
}
