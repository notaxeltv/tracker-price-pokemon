import { NextResponse } from "next/server";
import { fetchDashboardData, fetchDashboardSnapshot } from "@/lib/data-service";

export async function GET(request: Request) {
  try {
    const fast = new URL(request.url).searchParams.get("fast") === "1";

    if (fast) {
      const snap = await fetchDashboardSnapshot();
      if (!snap) {
        return NextResponse.json(
          { error: "Nessuno snapshot disponibile" },
          { status: 404 }
        );
      }
      return NextResponse.json(snap);
    }

    const data = await fetchDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dei dati" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
