"use client";

import React, { useState } from "react";
import { ScenarioResult } from "@/lib/scenarios";
import { FlaskConical, CheckCircle2, XCircle, AlertTriangle, Brain, Dices, History, ChevronDown, ChevronUp } from "lucide-react";

export function ScenarioPanel({ scenario, currency }: { scenario: ScenarioResult; currency: string }) {
  const [showReasoning, setShowReasoning] = useState(true);
  const { monteCarlo: mc, backtest: bt, validation: v, final } = scenario;

  const gradeColor = v.grade === "Validação Forte" ? "text-emerald-400 border-emerald-700 bg-emerald-950/50" : v.grade === "Validação Razoável" ? "text-amber-400 border-amber-700 bg-amber-950/50" : "text-rose-400 border-rose-700 bg-rose-950/50";
  const relColor = bt.reliability === "A" ? "text-emerald-400" : bt.reliability === "B" ? "text-amber-400" : bt.reliability === "C" ? "text-rose-400" : "text-slate-400";

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
            <FlaskConical className="h-3.5 w-3.5" /> MOTOR DE CENÁRIOS &amp; VALIDAÇÃO DO VEREDITO
          </div>
          <h3 className="mt-2 text-xl font-black text-white">Previsão de Cenários, Simulação e Backtest</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Antes de dar o veredito, o sistema simula {mc.paths.toLocaleString("pt-PT")} trajetórias de preço a {scenario.horizonDays} sessões com os retornos reais desta ação,
            testa o próprio modelo no passado do título (walk-forward) e corre uma checklist de validação. Só depois decide.
          </p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 text-center ${gradeColor}`}>
          <div className="text-[10px] uppercase tracking-wider opacity-80">Grau de validação</div>
          <div className="text-lg font-black">{v.grade}</div>
          <div className="text-[11px]">{v.passed}/{v.total} verificações · confiança {final.confidence}%</div>
        </div>
      </div>

      {scenario.dataQuality !== "OK" && (
        <div className={`rounded-xl border p-3 text-xs ${scenario.dataQuality === "SEM_HISTORICO" ? "border-rose-800 bg-rose-950/40 text-rose-200" : "border-amber-800 bg-amber-950/30 text-amber-200"}`}>
          <strong>Qualidade dos dados: {scenario.dataQuality.replace("_", " ")}.</strong> {scenario.dataQualityNote}
        </div>
      )}

      {/* Cenários */}
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><Brain className="h-4 w-4 text-indigo-400" /> Cenários projetados ({scenario.horizonDays} sessões)</h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {scenario.scenarios.map((sc) => {
            const color = sc.key === "BULL" ? "emerald" : sc.key === "BEAR" ? "rose" : "amber";
            const isDominant = sc.probability === Math.max(...scenario.scenarios.map(x => x.probability));
            return (
              <div key={sc.key} className={`rounded-2xl border p-4 ${isDominant ? `border-${color}-500/60 bg-${color}-950/30` : "border-slate-800 bg-slate-950"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black text-${color}-400`}>{sc.name}</span>
                  {isDominant && <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white">MAIS PROVÁVEL</span>}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{sc.probability}%</span>
                  <span className={`text-sm font-bold text-${color}-400`}>{sc.targetPrice.toFixed(2)} {currency} ({sc.targetPct > 0 ? "+" : ""}{sc.targetPct}%)</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800"><div className={`h-full bg-${color}-500`} style={{ width: `${sc.probability}%` }} /></div>
                <div className="mt-3 text-[11px] text-slate-300"><strong className="text-slate-200">Gatilho:</strong> {sc.trigger}</div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{sc.narrative}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Monte Carlo */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><Dices className="h-4 w-4 text-cyan-400" /> Simulação Monte Carlo (bootstrap de retornos reais)</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800"><span className="text-slate-400 block">Prob. fechar acima do preço atual</span><span className="text-xl font-black text-white">{mc.pUpEnd}%</span><span className="block text-[10px] text-slate-500">só estatística (sem indicadores): {mc.pUpEndNeutral}%</span></div>
            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800"><span className="text-slate-400 block">Retorno esperado ({scenario.horizonDays}s)</span><span className={`text-xl font-black ${mc.expectedReturnPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{mc.expectedReturnPct > 0 ? "+" : ""}{mc.expectedReturnPct}%</span></div>
            <div className="rounded-xl bg-slate-900 p-3 border border-emerald-900/40"><span className="text-slate-400 block">Toca o alvo ({mc.target}) antes do stop</span><span className="text-xl font-black text-emerald-400">{mc.pHitTargetFirst}%</span></div>
            <div className="rounded-xl bg-slate-900 p-3 border border-rose-900/40"><span className="text-slate-400 block">Toca o stop ({mc.stop}) antes do alvo</span><span className="text-xl font-black text-rose-400">{mc.pHitStopFirst}%</span></div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>P10 {mc.p10}</span><span>P25 {mc.p25}</span><span className="text-white font-bold">Mediana {mc.p50}</span><span>P75 {mc.p75}</span><span>P90 {mc.p90}</span></div>
            <div className="relative h-2 rounded-full bg-gradient-to-r from-rose-600 via-slate-500 to-emerald-600" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-slate-400">
            <span>Vol. diária {scenario.stats.dailyVolPct}%</span><span>Vol. anual {scenario.stats.annualVolPct}%</span><span>Drawdown máx. {scenario.stats.maxDrawdownPct}%</span>
            <span>Dias de subida {scenario.stats.upDaysPct}%</span><span>Sessões {scenario.stats.bars}</span><span>Inclinação/dia {mc.tiltPerDayPct > 0 ? "+" : ""}{mc.tiltPerDayPct}%</span>
          </div>
        </div>

        {/* Backtest */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><History className="h-4 w-4 text-amber-400" /> Backtest walk-forward do modelo nesta ação</h4>
          <div className="flex items-center gap-3">
            <div className={`text-4xl font-black ${relColor}`}>{bt.reliability}</div>
            <div className="text-xs text-slate-300">{bt.reliabilityLabel}</div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
              <span className="text-slate-400 block">Quando disse “SOBE”</span>
              <span className="text-lg font-black text-white">{bt.bullishAccuracy != null ? `${bt.bullishAccuracy}%` : "—"}</span>
              <span className="block text-[10px] text-slate-500">{bt.bullishHits}/{bt.bullishSamples} acertos · retorno médio {bt.bullishAvgFwdPct != null ? `${bt.bullishAvgFwdPct > 0 ? "+" : ""}${bt.bullishAvgFwdPct}%` : "—"}</span>
            </div>
            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
              <span className="text-slate-400 block">Quando disse “DESCE”</span>
              <span className="text-lg font-black text-white">{bt.bearishAccuracy != null ? `${bt.bearishAccuracy}%` : "—"}</span>
              <span className="block text-[10px] text-slate-500">{bt.bearishHits}/{bt.bearishSamples} acertos · retorno médio {bt.bearishAvgFwdPct != null ? `${bt.bearishAvgFwdPct > 0 ? "+" : ""}${bt.bearishAvgFwdPct}%` : "—"}</span>
            </div>
            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800"><span className="text-slate-400 block">Acerto global</span><span className="text-lg font-black text-white">{bt.overallAccuracy != null ? `${bt.overallAccuracy}%` : "—"}</span><span className="block text-[10px] text-slate-500">edge {bt.edgePct != null ? `${bt.edgePct > 0 ? "+" : ""}${bt.edgePct} pts` : "—"} vs moeda ao ar</span></div>
            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800"><span className="text-slate-400 block">Base: % janelas em alta</span><span className="text-lg font-black text-white">{bt.baselineUpPct != null ? `${bt.baselineUpPct}%` : "—"}</span><span className="block text-[10px] text-slate-500">{bt.samples} janelas de {scenario.horizonDays} sessões testadas</span></div>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Checklist de validação da decisão</h4>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {v.checks.map((c) => (
            <div key={c.name} className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${c.passed ? "border-emerald-900/50 bg-emerald-950/20" : c.critical ? "border-rose-900/60 bg-rose-950/30" : "border-amber-900/50 bg-amber-950/20"}`}>
              {c.passed ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> : <XCircle className={`h-4 w-4 shrink-0 ${c.critical ? "text-rose-400" : "text-amber-400"}`} />}
              <div><div className="font-bold text-slate-200">{c.name}{c.critical && <span className="ml-1 text-[9px] text-slate-500">(crítica)</span>}</div><div className="text-[11px] text-slate-400">{c.detail}</div></div>
            </div>
          ))}
        </div>
        {v.contradictions.length > 0 && (
          <div className="mt-3 rounded-xl border border-amber-800/60 bg-amber-950/30 p-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-300"><AlertTriangle className="h-4 w-4" /> Contradições detetadas (reduzem a confiança)</div>
            <ul className="mt-1 list-disc list-inside text-amber-100/90 space-y-0.5">{v.contradictions.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </div>
        )}
      </div>

      {/* Raciocínio */}
      <div className="rounded-2xl border border-indigo-900/50 bg-indigo-950/20 p-5">
        <button onClick={() => setShowReasoning(!showReasoning)} className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-300">
          <span className="flex items-center gap-2"><Brain className="h-4 w-4" /> Raciocínio passo a passo que levou ao veredito</span>
          {showReasoning ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showReasoning && (
          <ol className="mt-3 space-y-1.5 text-xs text-slate-200">
            {final.reasoning.map((r, i) => <li key={i} className={`rounded-lg px-3 py-2 ${r.startsWith("⇒") ? "bg-indigo-900/40 font-bold text-white" : "bg-slate-950/60"}`}>{r}</li>)}
          </ol>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-400">
          <span className="rounded bg-slate-900 px-2 py-0.5">Pesos: técnico {Math.round(final.weights.technical * 100)}%</span>
          <span className="rounded bg-slate-900 px-2 py-0.5">fundamental {Math.round(final.weights.fundamental * 100)}%</span>
          <span className="rounded bg-slate-900 px-2 py-0.5">notícias ≤72h {Math.round(final.weights.news * 100)}%</span>
          <span className="rounded bg-slate-900 px-2 py-0.5">Monte Carlo {Math.round(final.weights.monteCarlo * 100)}%</span>
          <span className="rounded bg-slate-900 px-2 py-0.5">backtest {Math.round(final.weights.backtest * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
