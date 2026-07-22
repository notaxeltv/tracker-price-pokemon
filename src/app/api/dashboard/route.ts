import { NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/data-service";

export async function GET() {
  try {
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
