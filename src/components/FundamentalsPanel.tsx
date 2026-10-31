"use client";

import React from "react";
import { FundamentalReport, Pillar } from "@/lib/fundamentals";
import { Landmark, TrendingUp, ShieldCheck, Repeat, Scale, Coins, Target, CalendarClock, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

const gradeColor = (g: string) => g === "A" ? "text-emerald-400 border-emerald-700 bg-emerald-950/40" : g === "B" ? "text-green-400 border-green-700 bg-green-950/40" : g === "C" ? "text-amber-400 border-amber-700 bg-amber-950/40" : g === "D" ? "text-orange-400 border-orange-700 bg-orange-950/40" : "text-rose-400 border-rose-700 bg-rose-950/40";
const barColor = (s: number) => s >= 65 ? "bg-emerald-500" : s >= 45 ? "bg-amber-500" : "bg-rose-500";

function PillarCard({ p, icon }: { p: Pillar; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-white">{icon}{p.name}</div>
        <span className={`rounded-lg border px-2.5 py-1 text-sm font-black ${gradeColor(p.grade)}`}>{p.grade} · {p.score}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800"><div className={`h-full ${barColor(p.score)}`} style={{ width: `${p.score}%` }} /></div>
      <p className="mt-2 text-[11px] text-slate-300">{p.summary}</p>
      <div className="mt-3 space-y-1.5">
        {p.items.map((it) => (
          <div key={it.label} className="flex items-start justify-between gap-3 rounded-lg bg-slate-900/70 px-2.5 py-1.5 text-[11px]">
            <div className="flex items-start gap-1.5 min-w-0">
              {it.good === true ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" /> : it.good === false ? <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" /> : <MinusCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />}
              <div className="min-w-0"><div className="text-slate-300">{it.label}</div>{it.note && <div className="text-[10px] text-slate-500">{it.note}</div>}</div>
            </div>
            <span className={`shrink-0 font-mono font-bold ${it.good === true ? "text-emerald-300" : it.good === false ? "text-rose-300" : "text-white"}`}>{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FundamentalsPanel({ r, price, currency }: { r: FundamentalReport; price: number; currency: string }) {
  const perfColor = (v: number | null) => v == null ? "text-slate-500" : v >= 0 ? "text-emerald-400" : "text-rose-400";
  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20"><Landmark className="h-3.5 w-3.5" /> ANÁLISE FUNDAMENTAL — DADOS REAIS ({r.source})</div>
            <h3 className="mt-2 text-xl font-black text-white">Qualidade da Empresa &amp; Valor Intrínseco</h3>
            <p className="mt-1 max-w-2xl text-xs text-slate-400">{r.summary}</p>
            {r.sector && <div className="mt-2 text-[11px] text-slate-400">Setor: <span className="text-slate-200">{r.sector}</span>{r.industry && <> · Indústria: <span className="text-slate-200">{r.industry}</span></>}{r.nextEarnings && <> · <CalendarClock className="inline h-3 w-3" /> Próximos resultados: <span className="text-amber-300">{r.nextEarnings}</span></>}</div>}
          </div>
          <div className={`rounded-2xl border px-5 py-3 text-center ${gradeColor(r.overallGrade)}`}>
            <div className="text-[10px] uppercase tracking-wider opacity-80">Nota global</div>
            <div className="text-4xl font-black">{r.overallGrade}</div>
            <div className="text-[11px]">{r.overallScore}/100 · viés {r.bias > 0 ? "+" : ""}{r.bias}</div>
          </div>
        </div>

        {/* Desempenho histórico */}
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Como se tem comportado (rentabilidade por período)</span>
            <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${r.behaviour.trend === "ASCENDENTE" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : r.behaviour.trend === "DESCENDENTE" ? "bg-rose-950 text-rose-400 border border-rose-800" : "bg-amber-950 text-amber-300 border border-amber-800"}`}>{r.behaviour.trend}</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
            {r.performance.map((p) => (
              <div key={p.label} className="rounded-xl bg-slate-900 p-2.5 text-center border border-slate-800">
                <div className="text-[10px] text-slate-400">{p.label}</div>
                <div className={`text-sm font-black ${perfColor(p.pct)}`}>{p.pct == null ? "—" : `${p.pct > 0 ? "+" : ""}${p.pct.toFixed(1)}%`}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-300">{r.behaviour.text}</p>
          {r.monthly.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] text-slate-500 mb-1">Retornos mensais (últimos {r.monthly.length} meses) — verde subiu, vermelho desceu</div>
              <div className="flex flex-wrap gap-1">
                {r.monthly.map((m) => (
                  <div key={m.label} title={`${m.label}: ${m.pct > 0 ? "+" : ""}${m.pct.toFixed(1)}%`} className={`flex h-9 w-[46px] flex-col items-center justify-center rounded text-[9px] font-bold ${m.pct >= 0 ? "bg-emerald-900/60 text-emerald-300" : "bg-rose-900/60 text-rose-300"}`}>
                    <span>{m.label.slice(2).replace("-", "/")}</span><span>{m.pct > 0 ? "+" : ""}{m.pct.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Valor intrínseco */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="flex items-center gap-2 text-sm font-bold text-white"><Target className="h-4 w-4 text-emerald-400" /> Valor Intrínseco (4 modelos + consenso de analistas)</h4>
          <span className={`rounded-lg border px-3 py-1 text-xs font-black ${r.intrinsic.status === "Subavaliada" ? "border-emerald-700 bg-emerald-950/50 text-emerald-300" : r.intrinsic.status === "Sobreavaliada" ? "border-rose-700 bg-rose-950/50 text-rose-300" : "border-amber-700 bg-amber-950/50 text-amber-300"}`}>{r.intrinsic.status}{r.intrinsic.marginOfSafetyPct != null && ` · margem de segurança ${r.intrinsic.marginOfSafetyPct > 0 ? "+" : ""}${r.intrinsic.marginOfSafetyPct}%`}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { l: "Preço atual", v: price, hl: true },
            { l: "Nº de Graham", v: r.intrinsic.graham },
            { l: "Graham c/ crescimento", v: r.intrinsic.grahamGrowth },
            { l: "DCF (5 anos)", v: r.intrinsic.dcf },
            { l: "EV/EBITDA justo", v: r.intrinsic.evEbitdaFair },
            { l: "Alvo analistas", v: r.intrinsic.analystTarget },
          ].map((m) => (
            <div key={m.l} className={`rounded-xl border p-3 ${m.hl ? "border-blue-800 bg-blue-950/40" : "border-slate-800 bg-slate-950"}`}>
              <div className="text-[10px] text-slate-400">{m.l}</div>
              <div className={`text-base font-black ${m.hl ? "text-white" : m.v == null ? "text-slate-600" : m.v > price ? "text-emerald-400" : "text-rose-400"}`}>{m.v == null ? "—" : `${m.v.toFixed(2)} ${currency}`}</div>
              {!m.hl && m.v != null && <div className="text-[10px] text-slate-500">{((m.v / price - 1) * 100) > 0 ? "+" : ""}{((m.v / price - 1) * 100).toFixed(0)}% vs preço</div>}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-950 border border-slate-800 p-3">
          <div className="text-xs text-slate-300">Valor justo médio ponderado: <strong className="text-white">{r.intrinsic.average != null ? `${r.intrinsic.average.toFixed(2)} ${currency}` : "—"}</strong></div>
          {r.analysts.consensus && <div className="text-xs text-slate-300">Consenso de analistas: <strong className="text-white">{r.analysts.consensus}</strong>{r.analysts.target != null && <> · alvo {r.analysts.target.toFixed(2)} ({r.analysts.upsidePct! > 0 ? "+" : ""}{r.analysts.upsidePct}%)</>}{r.analysts.high != null && r.analysts.low != null && <span className="text-slate-500"> · intervalo {r.analysts.low.toFixed(2)}–{r.analysts.high.toFixed(2)}</span>}</div>}
        </div>
        {r.intrinsic.notes.length > 0 && <ul className="mt-2 list-disc list-inside text-[10px] text-slate-500">{r.intrinsic.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>}
      </div>

      {/* Pilares */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <PillarCard p={r.profitability} icon={<Coins className="h-4 w-4 text-emerald-400" />} />
        <PillarCard p={r.growth} icon={<TrendingUp className="h-4 w-4 text-blue-400" />} />
        <PillarCard p={r.balance} icon={<ShieldCheck className="h-4 w-4 text-cyan-400" />} />
        <PillarCard p={r.consistency} icon={<Repeat className="h-4 w-4 text-purple-400" />} />
        <PillarCard p={r.valuation} icon={<Scale className="h-4 w-4 text-amber-400" />} />
        <PillarCard p={r.dividends} icon={<Landmark className="h-4 w-4 text-pink-400" />} />
      </div>
    </div>
  );
}
