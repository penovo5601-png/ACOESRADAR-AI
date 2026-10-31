import { NextRequest, NextResponse } from "next/server";
import { analyzeChartImage } from "@/lib/chartVision";
import { db } from "@/db";
import { chartAnalyses } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, symbolHint, userApiKey, saveToDb = true } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "Foto do gráfico não fornecida" }, { status: 400 });
    }

    const analysis = await analyzeChartImage(imageBase64, symbolHint, userApiKey);

    let savedId: number | null = null;
    if (saveToDb) {
      try {
        const [saved] = await db
          .insert(chartAnalyses)
          .values({
            title: symbolHint ? `Análise Técnica de ${symbolHint}` : `Análise de Gráfico - ${analysis.patternDetected}`,
            symbol: symbolHint || null,
            imageUrl: imageBase64.length < 500000 ? imageBase64 : null, // save if under 500kb
            verdict: analysis.verdict,
            confidence: analysis.confidence,
            patternDetected: analysis.patternDetected,
            trend: analysis.trend,
            entryPrice: analysis.keyLevels.entryPrice,
            stopLoss: analysis.keyLevels.stopLoss,
            takeProfit1: analysis.keyLevels.takeProfit1,
            takeProfit2: analysis.keyLevels.takeProfit2,
            riskReward: analysis.keyLevels.riskRewardRatio,
            rationale: analysis.detailedRationale,
            keyIndicators: analysis.visibleIndicators.join("; ")
          })
          .returning();
        savedId = saved.id;
      } catch (dbErr) {
        console.warn("Could not save chart analysis to DB:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      savedId
    });
  } catch (error: any) {
    console.error("Chart analysis API error:", error);
    return NextResponse.json(
      { error: "Erro ao processar imagem do gráfico", details: error?.message },
      { status: 500 }
    );
  }
}
