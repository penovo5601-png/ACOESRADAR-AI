import { NextRequest, NextResponse } from "next/server";
import { buildAllPortfolios } from "@/lib/portfolio";
export const maxDuration = 60;
export async function GET(req: NextRequest) {
  const budget = Number(new URL(req.url).searchParams.get("budget") ?? 100000);
  try { return NextResponse.json(await buildAllPortfolios(isFinite(budget) ? budget : 100000)); }
  catch (e: any) { return NextResponse.json({ error: "Erro ao construir carteiras", details: e?.message }, { status: 500 }); }
}
