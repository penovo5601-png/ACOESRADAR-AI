import { NextRequest, NextResponse } from "next/server";
import { searchGlobalStocks } from "@/lib/stockApi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const results = await searchGlobalStocks(query);
    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Erro na pesquisa de ações" }, { status: 500 });
  }
}
