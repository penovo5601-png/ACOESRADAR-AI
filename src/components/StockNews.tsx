"use client";

import React from "react";
import { NewsSentimentSummary } from "@/lib/news";
import { Newspaper, ExternalLink, ThumbsUp, ThumbsDown, Minus } from "lucide-react";

export function StockNews({ news, symbol }: { news: NewsSentimentSummary; symbol: string }) {
  const scoreColor = news.score >= 12 ? "text-emerald-400" : news.score <= -12 ? "text-rose-400" : "text-amber-400";
  const barColor = news.score >= 12 ? "bg-emerald-500" : news.score <= -12 ? "bg-rose-500" : "bg-amber-500";
  const total = Math.max(1, news.items.length);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "há minutos";
    if (h < 24) return `há ${h}h`;
    const d = Math.floor(h / 24);
    return d === 1 ? "há 1 dia" : `há ${d} dias`;
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
            <Newspaper className="h-3.5 w-3.5" /> NOTÍCIAS ASSOCIADAS A {symbol}
          </div>
          <h3 className="mt-2 text-xl font-black text-white">Fluxo Noticioso &amp; Sentimento</h3>
          <p className="text-xs text-slate-400 mt-1">
            Agregado em tempo real (Yahoo Finance + Google Notícias). O sentimento das manchetes é ponderado pela recência e entra no veredito final (até ±8 pontos).
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 min-w-[220px]">
          <span className="text-[11px] uppercase tracking-wider text-slate-400">Sentimento Agregado</span>
          <div className={`text-2xl font-black ${scoreColor}`}>{news.score > 0 ? "+" : ""}{news.score}</div>
          <div className="text-[11px] font-semibold text-slate-300">{news.label}</div>
          <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-emerald-500" style={{ width: `${(news.positive / total) * 100}%` }} />
            <div className="h-full bg-slate-500" style={{ width: `${(news.neutral / total) * 100}%` }} />
            <div className="h-full bg-rose-500" style={{ width: `${(news.negative / total) * 100}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
            <span className="text-emerald-400">▲ {news.positive} positivas</span>
            <span>{news.neutral} neutras</span>
            <span className="text-rose-400">▼ {news.negative} negativas</span>
          </div>
          <div className={`mt-2 text-[11px] font-bold ${scoreColor}`}>
            Impacto no veredito: {news.scoreImpact > 0 ? "+" : ""}{news.scoreImpact} pts
          </div>
        </div>
      </div>

      {news.items.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">
          Sem notícias recentes encontradas para esta ação. O veredito baseia-se apenas nos indicadores técnicos e fundamentais.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {news.items.map((n, i) => (
            <a
              key={i}
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-3.5 transition hover:border-blue-500/60 hover:bg-slate-900"
            >
              {n.thumbnail ? (
                <img src={n.thumbnail} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover bg-slate-800" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
                  <Newspaper className="h-6 w-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300 truncate">{n.source}</span>
                  <span>•</span>
                  <span>{timeAgo(n.publishedAt)}</span>
                  <span
                    className={`ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-bold ${
                      n.sentiment === "POSITIVA"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : n.sentiment === "NEGATIVA"
                        ? "bg-rose-950 text-rose-400 border border-rose-800"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {n.sentiment === "POSITIVA" ? <ThumbsUp className="h-3 w-3" /> : n.sentiment === "NEGATIVA" ? <ThumbsDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    {n.sentiment}
                  </span>
                </div>
                <h4 className="mt-1 text-xs font-bold text-white leading-snug line-clamp-2 group-hover:text-blue-300">
                  {n.title}
                </h4>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                  <span>{n.origin}</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
