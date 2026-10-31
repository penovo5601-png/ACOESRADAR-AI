import { NextRequest, NextResponse } from "next/server";
import { fetchStockNews } from "@/lib/news";

export async function GET(request: NextRequest, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const name = new URL(request.url).searchParams.get("name") || undefined;
  try {
    const news = await fetchStockNews(symbol, name);
    return NextResponse.json(news);
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao obter notícias", details: error?.message }, { status: 500 });
  }
}
