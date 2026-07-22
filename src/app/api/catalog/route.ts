import { NextResponse } from "next/server";
import {
  addUserCatalogProduct,
  buildUserProductId,
  deleteUserCatalogProduct,
  loadUserCatalog,
  updateUserCatalogProduct,
} from "@/lib/catalog/user-catalog.server";
import type { CatalogProduct } from "@/lib/scrapers/types";

type CatalogBody = {
  id?: string;
  kind?: CatalogProduct["kind"];
  name?: string;
  set?: string;
  setCode?: string;
  language?: CatalogProduct["language"];
  searchTerm?: string;
  cardmarketUrl?: string;
  cardNumber?: string;
  sealedType?: CatalogProduct["sealedType"];
  gradingCompany?: string;
  grade?: number;
};

function buildProductFromBody(body: CatalogBody, id: string): CatalogProduct {
  if (!body.kind || !body.name?.trim()) {
    throw new Error("kind e name sono obbligatori");
  }

  const product: CatalogProduct = {
    id,
    kind: body.kind,
    name: body.name.trim(),
    set: body.set?.trim() || "Custom",
    setCode: body.setCode?.trim() || "CUS",
    language: body.language ?? "EN",
    sources: ["cardmarket", "ebay_eu"],
    scrape: {
      searchTerm: body.searchTerm?.trim(),
      cardmarketUrl: body.cardmarketUrl?.trim(),
    },
    tags: ["user"],
  };

  if (body.kind === "sealed") {
    product.sealedType = body.sealedType ?? "etb";
  }

  if (body.kind === "graded") {
    product.cardNumber = body.cardNumber?.trim() ?? "";
    const company =
      (body.gradingCompany as "PSA" | "BGS" | "CGC" | "ACE" | "TAG") ?? "PSA";
    product.grading = {
      company,
      grades: [body.grade ?? 10],
    };
  }

  if (body.kind === "raw") {
    product.cardNumber = body.cardNumber?.trim() ?? "";
  }

  return product;
}

export async function GET() {
  const products = await loadUserCatalog();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CatalogBody;
    const id = buildUserProductId(body.kind ?? "graded", body.name ?? "");
    const product = buildProductFromBody(body, id);
    const products = await addUserCatalogProduct(product);
    return NextResponse.json({ ok: true, product, products });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore aggiunta prodotto";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as CatalogBody;
    if (!body.id) {
      return NextResponse.json({ error: "id obbligatorio" }, { status: 400 });
    }

    const product = buildProductFromBody(body, body.id);
    const products = await updateUserCatalogProduct(body.id, product);
    return NextResponse.json({ ok: true, product, products });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore modifica prodotto";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id obbligatorio" }, { status: 400 });
    }

    const products = await deleteUserCatalogProduct(id);
    return NextResponse.json({ ok: true, products });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore eliminazione prodotto";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
