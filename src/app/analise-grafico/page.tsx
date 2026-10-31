import type { Metadata } from "next";
import Link from "next/link";
import { ChartPhotoAnalyzer } from "@/components/ChartPhotoAnalyzer";
import { Camera, TrendingUp, Sparkles, ArrowLeft, ShieldCheck, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Analisador de Foto de Gráfico AI | Sobe ou Desce Ações",
  description: "Envia a foto ou captura de ecrã do gráfico de qualquer ação e recebe análise técnica imediata: previsão se a ação vai subir ou descer, padrões de candlestick e níveis de trade.",
};

export default function ChartPhotoPage() {
  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-lg shadow-purple-500/20 text-white">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white">
                    CHART<span className="text-purple-400">VISION</span> AI
                  </span>
                  <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-black text-purple-300 border border-purple-500/30">
                    ANÁLISE DE FOTO
                  </span>
                </div>
                <span className="block text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                  SOBE OU DESCE • RECONHECIMENTO DE PADRÕES
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Ir para Avaliação de Tickers Mundiais</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao Portal Principal de Ações
          </Link>
          <span className="text-xs text-purple-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Portal Dedicado: Foto &amp; Reconhecimento Visual
          </span>
        </div>

        <ChartPhotoAnalyzer />
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-black text-slate-300">CHARTVISION AI</span> — Sistema Especializado em Análise Visual de Gráficos de Ações.
          </div>
          <div className="text-[11px] text-slate-500">
            Reconhecimento algorítmico e multimodal de candlesticks, suportes e tendências para auxílio de decisão.
          </div>
        </div>
      </footer>
    </div>
  );
}
