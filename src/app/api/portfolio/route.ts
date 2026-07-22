import { NextResponse } from "next/server";
import { loadPortfolio, upsertPortfolioEntry } from "@/lib/portfolio.server";
import type { PortfolioEntry } from "@/lib/types";

export async function GET() {
  try {
    const data = await loadPortfolio();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Portfolio GET error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento portfolio" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      key?: string;
      entry?: PortfolioEntry | null;
    };

    if (!body.key || typeof body.key !== "string") {
      return NextResponse.json({ error: "Campo key obbligatorio" }, { status: 400 });
    }

    const data = await upsertPortfolioEntry(body.key, body.entry ?? null);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Portfolio PUT error:", error);
    return NextResponse.json(
      { error: "Errore nel salvataggio portfolio" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
