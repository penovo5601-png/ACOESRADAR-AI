"use client";

import React, { useEffect, useState } from "react";
import { PortfolioPlan } from "@/lib/portfolio";
import { Briefcase, RefreshCw, PieChart, ShieldCheck, TrendingUp, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

const eur = (v: number) => v.toLocaleString("pt-PT", { maximumFractionDigits: 0 }) + " €";
const pc = (v: number | null | undefined, d = 1) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(d)}%`);

export function PortfolioBuilder({ onSelectStock }: { onSelectStock?: (s: string) => void }) {
  const [budget, setBudget] = useState(100000);
  const [horizon, setHorizon] = useState(2);
  const [target, setTarget] = useState(6);
  const [data, setData] = useState<{ portfolios: PortfolioPlan[]; universeSize: number; note: string; generatedAt: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<string | null>(null);

  const load = async (b = budget, h = horizon, t = target) => {
    setLoading(true); setErr(null);
    try { const r = await fetch(`/api/portfolio?budget=${b}&horizon=${h}&target=${t}`); const j = await r.json(); if (!r.ok) throw new Error(j.error); setData(j); } catch (e: any) { setErr(e.message || "Erro"); } finally { setLoading(false); }
  };
  useEffect(() => { load(100000, 2, 6); }, []);
  const p = data?.portfolios[active];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/20"><Briefcase className="h-3.5 w-3.5" /> COMPOSIÇÃO DE CARTEIRAS — SÓ AÇÕES — ATÉ 100.000 €</div>
            <h2 className="mt-2 text-2xl font-black text-white">Carteira Tática (objetivo no prazo) + 3 carteiras de perfil — rendibilidade esperada, probabilidade e tese por ação</h2>
            <p className="mt-1 max-w-3xl text-xs text-slate-400">Universo real da Zona Euro (Euronext Lisboa/Paris/Amesterdão/Bruxelas, Madrid, Xetra, Milão). Seleção pelo método do guia: PER vs concorrentes, ROE, dividend yield, tendência de 6 meses; máx. 2 ações por setor, 1 por indústria, 40% por país; stop loss e objetivo definidos à partida.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 min-w-[260px]">
            <label className="text-[11px] font-semibold text-slate-400">Capital a investir: <span className="text-white text-base font-black">{eur(budget)}</span></label>
            <input type="range" min={5000} max={100000} step={1000} value={budget} onChange={e => setBudget(Number(e.target.value))} className="mt-2 w-full accent-emerald-500" />
            <div className="mt-2 flex gap-2">{[25000, 50000, 100000].map(v => <button key={v} onClick={() => { setBudget(v); load(v); }} className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800">{v / 1000}k</button>)}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <label className="text-slate-400">Prazo<select value={horizon} onChange={e => setHorizon(Number(e.target.value))} className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-white">{[1, 2, 3, 6, 12].map(m => <option key={m} value={m}>{m} {m === 1 ? "mês" : "meses"}</option>)}</select></label>
              <label className="text-slate-400">Objetivo<select value={target} onChange={e => setTarget(Number(e.target.value))} className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-white">{[3, 4, 5, 6, 8, 10, 15].map(t => <option key={t} value={t}>+{t}%</option>)}</select></label>
            </div>
            <button onClick={() => load(budget, horizon, target)} disabled={loading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50">{loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PieChart className="h-4 w-4" />}{loading ? "A compor carteiras…" : "Gerar carteiras"}</button>
          </div>
        </div>
        {data && <div className="mt-3 text-[11px] text-slate-500">{data.note} Gerado às {new Date(data.generatedAt).toLocaleTimeString("pt-PT")}.</div>}
        {err && <div className="mt-3 rounded-xl border border-rose-800 bg-rose-950/40 p-3 text-xs text-rose-200">{err}</div>}
      </div>

      {data && (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {data.portfolios.map((pf, i) => (
              <button key={pf.profile} onClick={() => setActive(i)} className={`rounded-2xl border p-4 text-left transition ${active === i ? "border-emerald-500 bg-emerald-950/30" : "border-slate-800 bg-slate-900 hover:border-slate-600"}`}>
                <div className="text-xs font-bold text-slate-300">{pf.title}</div>
                <div className="mt-1 flex items-baseline gap-2"><span className={`text-2xl font-black ${pf.expectedReturnPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{pc(pf.expectedReturnPct)}</span><span className="text-xs text-slate-400">em {pf.horizonMonths} {pf.horizonMonths === 1 ? "mês" : "meses"} ≈ {eur(pf.expectedGain)}</span></div>
                <div className={`mt-1 text-xs font-bold ${pf.probTargetPct >= 50 ? "text-emerald-300" : "text-amber-300"}`}>Retorno positivo: {pf.probPositivePct}% · ≥ +{pf.targetPct}%: {pf.probTargetPct}% · 12M {pc(pf.expected12mPct)}</div>
                {pf.verified && <div className="mt-1 text-[10px] text-emerald-400">✔ Validada com velas reais{pf.replaced.length ? ` · ${pf.replaced.length} substituída(s)` : ""}</div>}
                <div className="mt-1 text-[11px] text-slate-400">{pf.holdings.length} ações · {pf.sectors.length} setores · {pf.countries.length} países · vol. {pf.expectedVolPct}% · beta {pf.beta} · DY {pf.dividendYieldPct}%</div>
              </button>
            ))}
          </div>

          {p && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
                <h3 className="text-lg font-black text-white">{p.title}</h3>
                <p className="mt-1 text-xs text-slate-300">{p.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 text-center">
                  {[["Investido", eur(p.invested)], ["Caixa", eur(p.cash)], ["Esperado em " + p.horizonMonths + "M", pc(p.expectedReturnPct)], ["Ganho esperado", eur(p.expectedGain)], ["Prob. retorno positivo", `${p.probPositivePct}%`], ["Prob. ≥ +" + p.targetPct + "%", `${p.probTargetPct}%`]].map(([l, v]) => <div key={l} className="rounded-xl border border-slate-800 bg-slate-950 p-3"><div className="text-[10px] text-slate-400">{l}</div><div className="text-sm font-black text-white">{v}</div></div>)}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Diversificação por setor</div>
                    {p.sectors.map(s => <div key={s.name} className="mb-1.5"><div className="flex justify-between text-[11px] text-slate-300"><span>{s.name}</span><span>{s.pct}%</span></div><div className="h-1.5 rounded-full bg-slate-800"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${s.pct}%` }} /></div></div>)}
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Diversificação por país</div>
                    {p.countries.map(s => <div key={s.name} className="mb-1.5"><div className="flex justify-between text-[11px] text-slate-300"><span>{s.name}</span><span>{s.pct}%</span></div><div className="h-1.5 rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${s.pct}%` }} /></div></div>)}
                    <div className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Cenários de stress</div>
                    <div className="mt-1 grid grid-cols-5 gap-1 text-center text-[10px]">{p.stressScenarios.map(s => <div key={s.name} className="rounded bg-slate-900 p-1.5"><div className="text-slate-400">{s.name.split(" (")[0]}</div><div className={`font-bold ${s.portfolioMove >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{pc(s.portfolioMove)}</div><div className="text-slate-500">{eur(s.value)}</div></div>)}</div>
                  </div>
                </div>
              </div>

              {/* Holdings */}
              <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/90">
                <table className="w-full text-xs">
                  <thead className="bg-slate-950 text-slate-400"><tr><th className="px-3 py-2 text-left">Ação</th><th className="px-2 py-2">Setor / País</th><th className="px-2 py-2">Peso</th><th className="px-2 py-2">Qtd × Preço</th><th className="px-2 py-2">Investido</th><th className="px-2 py-2">PER</th><th className="px-2 py-2">ROE</th><th className="px-2 py-2">DY</th><th className="px-2 py-2">1M / 3M</th><th className="px-2 py-2">Setup</th><th className="px-2 py-2">Esperado ({p.horizonMonths}M)</th><th className="px-2 py-2">Stop / Alvo</th></tr></thead>
                  <tbody>
                    {p.holdings.map(h => (
                      <React.Fragment key={h.symbol}>
                        <tr className="border-t border-slate-800 text-center text-slate-300 hover:bg-slate-900 cursor-pointer" onClick={() => setOpen(open === h.symbol ? null : h.symbol)}>
                          <td className="px-3 py-2 text-left"><div className="font-bold text-white">{h.name.slice(0, 30)}</div><button onClick={e => { e.stopPropagation(); onSelectStock?.(h.symbol); }} className="font-mono text-[11px] text-blue-400 hover:underline">{h.symbol} ↗</button></td>
                          <td className="px-2 py-2 text-[11px]">{h.sector}<br /><span className="text-slate-500">{h.country}</span></td>
                          <td className="px-2 py-2 font-bold text-white">{h.weightPct}%</td><td className="px-2 py-2">{h.shares} × {h.price.toFixed(2)}</td><td className="px-2 py-2">{eur(h.invested)}</td>
                          <td className="px-2 py-2">{h.per?.toFixed(1) ?? "—"}</td><td className="px-2 py-2">{h.roe?.toFixed(0) ?? "—"}%</td><td className="px-2 py-2">{h.dy?.toFixed(1) ?? "0"}%</td>
                          <td className={`px-2 py-2 ${(h.perf1m ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{pc(h.perf1m)}<div className="text-[10px] text-slate-500">{pc(h.perf3m)}</div></td>
                          <td className="px-2 py-2 text-[10px]"><div className={`font-semibold ${h.trend === "Bullish" ? "text-emerald-400" : h.trend === "Bearish" ? "text-rose-400" : "text-amber-300"}`}>{h.trend}</div><div className="text-slate-400">{h.aboveSma20 ? "▲MM20" : "▽MM20"} {h.aboveSma50 ? "▲MM50" : "▽MM50"} {h.macdBull ? "MACD+" : "MACD−"} RSI {h.rsi?.toFixed(0)}</div><div className="mt-0.5 flex justify-center gap-0.5">{[h.thesis.semaforo.fundamentals, h.thesis.semaforo.trend, h.thesis.semaforo.levels, h.thesis.semaforo.mas, h.thesis.semaforo.oscillator].map((l, i) => <span key={i} className={`inline-block h-2 w-2 rounded-full ${l === "V" ? "bg-emerald-500" : l === "A" ? "bg-amber-400" : "bg-rose-500"}`} />)}</div></td>
                          <td className={`px-2 py-2 font-black ${h.expectedReturnPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{pc(h.expectedReturnPct)}<div className="text-[10px] font-normal text-slate-500">{eur(h.expectedGain)} · positivo {h.probPositivePct}% · ≥{p.targetPct}%: {h.probTargetPct}%</div>{h.verification && <div className={`text-[10px] font-semibold ${h.verification.ok ? "text-emerald-400" : "text-rose-400"}`}>{h.verification.ok ? "✔ velas" : "✖ velas"} {h.verification.trend.split(" ")[0]} · {h.verification.contacts} contactos</div>}</td>
                          <td className="px-2 py-2 text-[11px]"><span className="text-rose-300">{h.stopLoss}</span> / <span className="text-emerald-300">{h.target}</span> {open === h.symbol ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />}</td>
                        </tr>
                        {open === h.symbol && <tr className="border-t border-slate-800 bg-slate-950"><td colSpan={12} className="px-4 py-4 text-left text-xs text-slate-200">
                          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                            <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-3"><div className="mb-1 font-bold text-emerald-300">✅ O que me leva a acreditar nesta ação</div><ul className="list-disc list-inside space-y-1 leading-relaxed">{h.thesis.believe.map((b, i) => <li key={i}>{b}</li>)}</ul></div>
                            <div className="space-y-3">
                              <div className="rounded-xl border border-blue-900/50 bg-blue-950/20 p-3"><div className="mb-1 font-bold text-blue-300">⚡ Catalisadores no prazo</div><ul className="list-disc list-inside space-y-1">{h.thesis.catalysts.map((b, i) => <li key={i}>{b}</li>)}</ul></div>
                              <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-3"><div className="mb-1 font-bold text-amber-300">🚪 Plano de saída</div><ul className="list-disc list-inside space-y-1">{h.thesis.exit.map((b, i) => <li key={i}>{b}</li>)}</ul></div>
                              <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-3"><div className="mb-1 font-bold text-rose-300">⚠️ Riscos</div><ul className="list-disc list-inside space-y-1">{h.thesis.risks.map((b, i) => <li key={i}>{b}</li>)}</ul></div>
                            </div>
                          </div>
                          {h.verification && <div className={`mt-3 rounded-xl border p-3 text-xs ${h.verification.ok ? "border-emerald-800 bg-emerald-950/30 text-emerald-100" : "border-rose-800 bg-rose-950/30 text-rose-100"}`}><strong>Verificação com velas reais ({h.verification.candleSource}):</strong> {h.verification.note} Suporte {h.verification.support} / resistência {h.verification.resistance}.</div>}
                          <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900 p-3 italic leading-relaxed">{h.justification}</div>
                          <div className="mt-1 text-[10px] text-slate-500">Semáforo do guia: {h.thesis.semaforo.greens} verdes / {h.thesis.semaforo.reds} vermelhos → {h.thesis.semaforo.decision}{h.consensus ? ` · Analistas: ${h.consensus}${h.analystUpsidePct != null ? ` (alvo ${pc(h.analystUpsidePct)})` : ""}` : ""}{h.nextEarnings ? ` · Resultados: ${h.nextEarnings}` : ""}</div>
                        </td></tr>}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-2xl border border-indigo-900/50 bg-indigo-950/20 p-5"><h4 className="text-sm font-bold text-indigo-300">🗓️ Plano de gestão para atingir +{p.targetPct}% em {p.horizonMonths} {p.horizonMonths === 1 ? "mês" : "meses"}</h4><ol className="mt-2 list-decimal list-inside space-y-1 text-xs text-slate-200">{p.managementPlan.map((r, i) => <li key={i}>{r}</li>)}</ol></div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-5"><h4 className="flex items-center gap-2 text-sm font-bold text-emerald-300"><ShieldCheck className="h-4 w-4" /> Porque esta carteira está bem construída</h4><ul className="mt-2 list-disc list-inside space-y-1 text-xs text-slate-200">{p.rationale.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
                <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-5"><h4 className="flex items-center gap-2 text-sm font-bold text-amber-300"><AlertTriangle className="h-4 w-4" /> Riscos e limites</h4><ul className="mt-2 list-disc list-inside space-y-1 text-xs text-slate-200">{p.risks.map((r, i) => <li key={i}>{r}</li>)}</ul><p className="mt-2 text-[10px] text-slate-500 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Clica numa linha para ver a justificação completa de cada ação; clica no ticker para abrir a análise detalhada.</p></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
