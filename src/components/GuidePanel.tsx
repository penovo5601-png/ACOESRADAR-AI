"use client";

import React, { useState } from "react";
import { GuideAnalysis, Light } from "@/lib/guide";
import { BookOpen, Copy, Check, TrendingUp, Layers, Activity, Target, ClipboardList } from "lucide-react";

const lightCls = (l: Light) => l === "VERDE" ? "bg-emerald-500" : l === "AMARELO" ? "bg-amber-400" : "bg-rose-500";
const lightText = (l: Light) => l === "VERDE" ? "text-emerald-400" : l === "AMARELO" ? "text-amber-300" : "text-rose-400";
const lightBox = (l: Light) => l === "VERDE" ? "border-emerald-700 bg-emerald-950/40" : l === "AMARELO" ? "border-amber-700 bg-amber-950/30" : "border-rose-700 bg-rose-950/40";
const f = (v: number | null | undefined, d = 1) => (v == null ? "—" : v.toFixed(d));

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return <button onClick={() => { navigator.clipboard?.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800">{ok ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}{ok ? "Copiado" : "Copiar"}</button>;
}

export function GuidePanel({ g, symbol, currency }: { g: GuideAnalysis; symbol: string; currency: string }) {
  const [tab, setTab] = useState<"buy" | "wait">(g.semaforo.decision === "COMPRAR" ? "buy" : "wait");
  return (
    <div className="space-y-5">
      {/* Semáforo */}
      <div className={`rounded-3xl border p-6 shadow-xl ${lightBox(g.semaforo.decisionLight)}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-500/20"><BookOpen className="h-3.5 w-3.5" /> MÉTODO DO GUIA PRÁTICO — TABELA-SEMÁFORO</div>
            <h3 className="mt-2 text-xl font-black text-white">Decisão: <span className={lightText(g.semaforo.decisionLight)}>{g.semaforo.decision}</span></h3>
            <p className="mt-1 text-xs text-slate-300">{g.semaforo.greens} verdes · {g.semaforo.yellows} amarelos · {g.semaforo.reds} vermelhos — regra: 4–5 verdes = comprar; mistura = comprar menos/esperar; 2+ vermelhos = não comprar.</p>
          </div>
          <div className="flex gap-1.5">{g.semaforo.rows.map(r => <div key={r.n} title={`${r.question}: ${r.reading}`} className={`h-8 w-8 rounded-full ${lightCls(r.light)} flex items-center justify-center text-xs font-black text-slate-950`}>{r.n}</div>)}</div>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-xs">
            <thead className="bg-slate-950 text-slate-400"><tr><th className="px-3 py-2 text-left">Pergunta</th><th className="px-3 py-2 text-left">Leitura</th><th className="px-3 py-2 text-center">Cor</th></tr></thead>
            <tbody>{g.semaforo.rows.map(r => <tr key={r.n} className="border-t border-slate-800 bg-slate-900/60"><td className="px-3 py-2 font-semibold text-slate-200">{r.n}. {r.question}</td><td className="px-3 py-2 text-slate-300">{r.reading}</td><td className="px-3 py-2 text-center"><span className={`inline-block h-3.5 w-3.5 rounded-full ${lightCls(r.light)}`} /></td></tr>)}</tbody>
          </table>
        </div>
        {/* Plano de saída */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-rose-900/60 bg-slate-950 p-3"><div className="text-[10px] text-slate-400">Stop loss (perda máxima)</div><div className="text-lg font-black text-rose-400">{g.exitPlan.stopLoss} {currency}</div><div className="text-[11px] text-rose-300">{g.exitPlan.stopPct}%</div></div>
          <div className="rounded-xl border border-emerald-900/60 bg-slate-950 p-3"><div className="text-[10px] text-slate-400">Objetivo de ganho (profit taking)</div><div className="text-lg font-black text-emerald-400">{g.exitPlan.target} {currency}</div><div className="text-[11px] text-emerald-300">+{g.exitPlan.targetPct}%</div></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-[11px] text-slate-300 flex items-center">{g.exitPlan.rationale}</div>
        </div>
      </div>

      {/* 1. Fundamentais vs concorrentes */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="flex items-center gap-2 text-sm font-bold text-white"><Layers className="h-4 w-4 text-indigo-400" /> 1. A empresa está bem? — comparação com concorrentes</h4>
          <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${lightBox(g.fundamentals.light)} ${lightText(g.fundamentals.light)}`}>{g.fundamentals.verdict}</span>
        </div>
        <p className="mt-2 text-xs text-slate-300">{g.fundamentals.text}</p>
        {g.fundamentals.peers.length > 0 && (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-xs">
              <thead className="bg-slate-950 text-slate-400"><tr><th className="px-3 py-2 text-left">Empresa</th><th className="px-2 py-2">País</th><th className="px-2 py-2">PER</th><th className="px-2 py-2">PBV</th><th className="px-2 py-2">ROE</th><th className="px-2 py-2">Div. yield</th><th className="px-2 py-2">Pay-out</th><th className="px-2 py-2">6M</th><th className="px-2 py-2">1A</th></tr></thead>
              <tbody>
                {[...g.fundamentals.peers].sort((a, b) => (b.isSelf ? 1 : 0) - (a.isSelf ? 1 : 0)).map(p => (
                  <tr key={p.symbol} className={`border-t border-slate-800 text-center ${p.isSelf ? "bg-blue-950/50 font-bold text-white" : "bg-slate-900/60 text-slate-300"}`}>
                    <td className="px-3 py-1.5 text-left">{p.isSelf ? "★ " : ""}{p.name.slice(0, 28)} <span className="text-slate-500">({p.symbol})</span></td><td className="px-2 py-1.5">{p.country}</td>
                    <td className={`px-2 py-1.5 ${g.fundamentals.peerMedian.per != null && p.per != null ? (p.per < g.fundamentals.peerMedian.per ? "text-emerald-400" : "text-rose-300") : ""}`}>{f(p.per)}</td><td className="px-2 py-1.5">{f(p.pbv, 2)}</td>
                    <td className={`px-2 py-1.5 ${g.fundamentals.peerMedian.roe != null && p.roe != null ? (p.roe > g.fundamentals.peerMedian.roe ? "text-emerald-400" : "text-rose-300") : ""}`}>{f(p.roe)}%</td><td className="px-2 py-1.5">{f(p.dy, 2)}%</td><td className="px-2 py-1.5">{f(p.payout, 0)}%</td>
                    <td className={`px-2 py-1.5 ${(p.perf6m ?? 0) >= 0 ? "text-emerald-400" : "text-rose-300"}`}>{f(p.perf6m)}%</td><td className={`px-2 py-1.5 ${(p.perf1y ?? 0) >= 0 ? "text-emerald-400" : "text-rose-300"}`}>{f(p.perf1y)}%</td>
                  </tr>
                ))}
                <tr className="border-t border-slate-700 bg-slate-950 text-center text-slate-400"><td className="px-3 py-1.5 text-left font-semibold">Mediana dos concorrentes</td><td /><td>{f(g.fundamentals.peerMedian.per)}</td><td>{f(g.fundamentals.peerMedian.pbv, 2)}</td><td>{f(g.fundamentals.peerMedian.roe)}%</td><td>{f(g.fundamentals.peerMedian.dy, 2)}%</td><td>{f(g.fundamentals.peerMedian.payout, 0)}%</td><td /><td /></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2–5 técnico */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={`rounded-2xl border p-5 ${lightBox(g.trend.light)}`}>
          <div className="flex items-center justify-between"><h4 className="flex items-center gap-2 text-sm font-bold text-white"><TrendingUp className="h-4 w-4" /> 2. Tendência (6 meses)</h4><span className={`text-sm font-black ${lightText(g.trend.light)}`}>{g.trend.label}</span></div>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded bg-slate-950 px-2 py-0.5 text-slate-300">{g.trend.contacts} pontos de contacto {g.trend.confirmed ? "✔ confirmada" : "(precisa de 3)"}</span>
            <span className="rounded bg-slate-950 px-2 py-0.5 text-slate-300">6M {g.trend.change6mPct > 0 ? "+" : ""}{g.trend.change6mPct}%</span>
            <span className="rounded bg-slate-950 px-2 py-0.5 text-slate-300">{g.trend.higherLows ? "mínimos mais altos" : g.trend.lowerHighs ? "máximos mais baixos" : "sem sequência clara"}</span>
          </div>
          <p className="mt-2 text-xs text-slate-300">{g.trend.text}</p>
          <p className="mt-1 text-xs font-semibold text-white">O que fazer: {g.trend.action}</p>
        </div>
        <div className={`rounded-2xl border p-5 ${lightBox(g.levels.light)}`}>
          <h4 className="flex items-center gap-2 text-sm font-bold text-white"><Target className="h-4 w-4" /> 3. Chão e teto (suporte / resistência)</h4>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-slate-950 p-2"><div className="text-[10px] text-slate-400">Suporte</div><div className="font-black text-rose-300">{g.levels.support}</div></div>
            <div className="rounded-lg bg-slate-950 p-2"><div className="text-[10px] text-slate-400">52 semanas</div><div className="font-black text-white">{g.levels.range52.positionPct}%</div><div className="text-[9px] text-slate-500">{g.levels.range52.low}–{g.levels.range52.high}</div></div>
            <div className="rounded-lg bg-slate-950 p-2"><div className="text-[10px] text-slate-400">Resistência</div><div className="font-black text-emerald-300">{g.levels.resistance}</div></div>
          </div>
          <p className="mt-2 text-xs text-slate-300">{g.levels.text}</p>
        </div>
        <div className={`rounded-2xl border p-5 ${lightBox(g.movingAverages.light)}`}>
          <h4 className="flex items-center gap-2 text-sm font-bold text-white"><Activity className="h-4 w-4" /> 4. Velas e médias móveis (MM20 / MM50)</h4>
          <p className="mt-2 text-xs text-slate-300">{g.candles.text}</p>
          <p className="mt-1 text-xs text-slate-300">{g.movingAverages.text}</p>
        </div>
        <div className={`rounded-2xl border p-5 ${lightBox(g.oscillator.light)}`}>
          <h4 className="flex items-center gap-2 text-sm font-bold text-white"><Activity className="h-4 w-4" /> 5. ADX → {g.oscillator.chosen}</h4>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]"><span className="rounded bg-slate-950 px-2 py-0.5 text-slate-300">ADX {g.oscillator.adx}</span><span className="rounded bg-slate-950 px-2 py-0.5 text-slate-300">RSI {g.oscillator.rsi}</span><span className="rounded bg-slate-950 px-2 py-0.5 text-slate-300">MACD {g.oscillator.macd.line} / sinal {g.oscillator.macd.signal} / hist {g.oscillator.macd.hist}</span></div>
          <p className="mt-2 text-xs text-slate-300">{g.oscillator.text}</p>
          {g.patterns.length > 0 && <div className="mt-2 space-y-1">{g.patterns.map(p => <div key={p.name} className="rounded-lg bg-slate-950 px-2.5 py-1.5 text-[11px]"><span className={`font-bold ${p.bias === "COMPRA" ? "text-emerald-400" : p.bias === "VENDA" ? "text-rose-400" : "text-amber-300"}`}>Padrão: {p.name} ({p.bias})</span> — <span className="text-slate-300">{p.description}</span></div>)}</div>}
        </div>
      </div>

      {/* Justificação */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="flex items-center gap-2 text-sm font-bold text-white"><ClipboardList className="h-4 w-4 text-amber-400" /> Justificação para o relatório (Ficha de Fundamentação)</h4>
          <div className="flex gap-1 rounded-lg bg-slate-950 p-1 text-xs"><button onClick={() => setTab("buy")} className={`rounded px-2.5 py-1 font-semibold ${tab === "buy" ? "bg-emerald-600 text-white" : "text-slate-400"}`}>Se compro</button><button onClick={() => setTab("wait")} className={`rounded px-2.5 py-1 font-semibold ${tab === "wait" ? "bg-amber-600 text-white" : "text-slate-400"}`}>Se espero</button></div>
        </div>
        <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-200 italic">{tab === "buy" ? g.justification.buy : g.justification.wait}</div>
        <div className="mt-2 flex items-center justify-between"><span className="text-[10px] text-slate-500">Os espaços ___ são para preencheres com a quantidade e o peso na carteira.</span><CopyBtn text={tab === "buy" ? g.justification.buy : g.justification.wait} /></div>
        <div className="mt-4 grid grid-cols-1 gap-1 sm:grid-cols-2">{g.checklist.map(c => <div key={c.item} className="flex items-start gap-2 text-[11px] text-slate-300"><span className={c.done ? "text-emerald-400" : "text-slate-600"}>{c.done ? "☑" : "☐"}</span>{c.item}</div>)}</div>
      </div>
    </div>
  );
}
