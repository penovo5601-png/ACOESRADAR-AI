import { NextRequest, NextResponse } from "next/server";
import { buildAllPortfolios } from "@/lib/portfolio";
export const maxDuration = 60;
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const budget = Number(sp.get("budget") ?? 100000), horizon = Number(sp.get("horizon") ?? 2), target = Number(sp.get("target") ?? 6);
  try { return NextResponse.json(await buildAllPortfolios(isFinite(budget) ? budget : 100000, isFinite(horizon) ? horizon : 2, isFinite(target) ? target : 6)); }
  catch (e: any) { return NextResponse.json({ error: "Erro ao construir carteiras", details: e?.message }, { status: 500 }); }
}
