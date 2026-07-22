import { NextResponse } from "next/server";
import {
  addUserCatalogProduct,
  buildUserProductId,
  loadUserCatalog,
} from "@/lib/catalog/user-catalog.server";
import type { CatalogProduct } from "@/lib/scrapers/types";

export async function GET() {
  const products = await loadUserCatalog();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
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

    if (!body.kind || !body.name?.trim()) {
      return NextResponse.json(
        { error: "kind e name sono obbligatori" },
        { status: 400 }
      );
    }

    const id = buildUserProductId(body.kind, body.name.trim());
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

    const products = await addUserCatalogProduct(product);
    return NextResponse.json({ ok: true, product, products });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore aggiunta prodotto";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
