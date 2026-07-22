import { NextResponse } from "next/server";
import { mergePortfolioEntries } from "@/lib/alert-notifications.server";
import { parsePortfolioCsv } from "@/lib/portfolio-import";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { csv?: string };
    if (!body.csv?.trim()) {
      return NextResponse.json({ error: "Campo csv obbligatorio" }, { status: 400 });
    }

    const { entries, errors } = parsePortfolioCsv(body.csv);
    if (Object.keys(entries).length === 0) {
      return NextResponse.json(
        { error: "Nessuna voce valida", details: errors },
        { status: 400 }
      );
    }

    const portfolio = await mergePortfolioEntries(entries);
    return NextResponse.json({
      ok: true,
      imported: Object.keys(entries).length,
      skipped: errors.length,
      errors,
      portfolio,
    });
  } catch {
    return NextResponse.json({ error: "Import fallito" }, { status: 500 });
  }
}
