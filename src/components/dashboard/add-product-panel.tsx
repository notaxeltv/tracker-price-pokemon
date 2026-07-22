"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import type { CatalogProduct } from "@/lib/scrapers/types";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, LabelSm, Select } from "@/components/ui/input";

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
    <Modal open={open} onClose={onClose} size="lg" zIndex="top">
      <ModalHeader
        onClose={onClose}
        icon={
          isEdit ? (
            <Pencil className="h-4 w-4 text-pokemon-yellow" />
          ) : (
            <Plus className="h-4 w-4 text-pokemon-yellow" />
          )
        }
        title={isEdit ? "Modifica prodotto" : "Aggiungi prodotto"}
        description={
          isEdit
            ? "Aggiorna i dati di scraping del prodotto personalizzato"
            : "Salvato in data/user-catalog.json — poi clicca Aggiorna prezzi"
        }
      />

      <div className="space-y-3">
        <label className="block text-sm">
          <LabelSm>Tipo</LabelSm>
          <Select
            value={kind}
            onChange={(e) => setKind(e.target.value as CatalogProduct["kind"])}
            disabled={isEdit}
            className="w-full px-3 pl-3 disabled:opacity-60"
          >
            <option value="graded">Gradato</option>
            <option value="sealed">Sealed</option>
            <option value="raw">Raw</option>
            <option value="accessory">Accessorio</option>
          </Select>
        </label>

        <label className="block text-sm">
          <LabelSm>Nome *</LabelSm>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Charizard ex PSA 10"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <LabelSm>Set</LabelSm>
            <Input value={set} onChange={(e) => setSet(e.target.value)} />
          </label>
          <label className="block text-sm">
            <LabelSm>Lingua</LabelSm>
            <Select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as CatalogProduct["language"])
              }
              className="w-full px-3 pl-3"
            >
              <option value="JP">JP</option>
              <option value="IT">IT</option>
              <option value="EN">EN</option>
            </Select>
          </label>
        </div>

        {kind === "graded" && (
          <div className="grid grid-cols-3 gap-3">
            <label className="col-span-1 block text-sm">
              <LabelSm>Grading</LabelSm>
              <Select
                value={gradingCompany}
                onChange={(e) => setGradingCompany(e.target.value)}
                className="w-full px-3 pl-3"
              >
                <option value="PSA">PSA</option>
                <option value="BGS">BGS</option>
                <option value="CGC">CGC</option>
              </Select>
            </label>
            <label className="col-span-1 block text-sm">
              <LabelSm>Grado</LabelSm>
              <Select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 pl-3"
              >
                <option value="10">10</option>
                <option value="9">9</option>
              </Select>
            </label>
            <label className="col-span-1 block text-sm">
              <LabelSm># carta</LabelSm>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </label>
          </div>
        )}

        {kind === "sealed" && (
          <label className="block text-sm">
            <LabelSm>Tipo sealed</LabelSm>
            <Select
              value={sealedType}
              onChange={(e) =>
                setSealedType(e.target.value as CatalogProduct["sealedType"])
              }
              className="w-full px-3 pl-3"
            >
              <option value="etb">ETB</option>
              <option value="booster_box">Booster Box</option>
              <option value="booster_bundle">Bundle</option>
            </Select>
          </label>
        )}

        <label className="block text-sm">
          <LabelSm>Ricerca eBay EU</LabelSm>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="pokemon charizard psa 10 japanese"
          />
        </label>

        <label className="block text-sm">
          <LabelSm>URL Cardmarket (opz.)</LabelSm>
          <Input
            value={cardmarketUrl}
            onChange={(e) => setCardmarketUrl(e.target.value)}
            placeholder="https://www.cardmarket.com/it/Pokemon/..."
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={saving}
        className="btn-primary mt-5 w-full"
      >
        {saving ? "Salvataggio…" : isEdit ? "Salva modifiche" : "Aggiungi al catalogo"}
      </Button>
    </Modal>
  );
}
