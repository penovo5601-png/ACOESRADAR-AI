"use client";

import React, { useState } from "react";
import { StockFullAnalysis } from "@/lib/stockApi";
import { StockChart } from "./StockChart";
import { StockNews } from "./StockNews";
import { ScenarioPanel } from "./ScenarioPanel";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Bookmark,
  Check,
  Zap,
  Info,
  DollarSign,
  Scale,
  Crosshair,
  BarChart2,
  Layers,
  PieChart
} from "lucide-react";

interface StockDetailViewProps {
  stock: StockFullAnalysis;
  onAddToWatchlist?: (stock: StockFullAnalysis) => void;
  isWatchlisted?: boolean;
}

export function StockDetailView({ stock, onAddToWatchlist, isWatchlisted = false }: StockDetailViewProps) {
  const [added, setAdded] = useState(isWatchlisted);
  const [activeTab, setActiveTab] = useState<"overview" | "technical" | "fundamental">("overview");

  const { expectation, technical, fundamental } = stock;
  const isUp = stock.change >= 0;

  const handleWatchlistClick = () => {
    if (onAddToWatchlist) {
      onAddToWatchlist(stock);
      setAdded(true);
    }
  };

  const getVerdictStyles = () => {
    switch (expectation.verdict) {
      case "FORTE_SUBIDA":
        return {
          bg: "from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/50 shadow-emerald-950/40",
          badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
          text: "text-emerald-400",
          barColor: "bg-emerald-500",
          icon: <TrendingUp className="h-9 w-9 text-emerald-400" />
        };
      case "SUBIDA_MODERADA":
        return {
          bg: "from-green-950/70 via-slate-900 to-slate-950 border-green-500/40 shadow-green-950/40",
          badge: "bg-green-500/20 text-green-400 border-green-500/30",
          text: "text-green-400",
          barColor: "bg-green-500",
          icon: <ArrowUpRight className="h-9 w-9 text-green-400" />
        };
      case "QUEDA_MODERADA":
        return {
          bg: "from-amber-950/70 via-slate-900 to-slate-950 border-amber-500/40 shadow-amber-950/40",
          badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
          text: "text-amber-400",
          barColor: "bg-amber-500",
          icon: <ArrowDownRight className="h-9 w-9 text-amber-400" />
        };
      case "FORTE_QUEDA":
        return {
          bg: "from-rose-950/80 via-slate-900 to-slate-950 border-rose-500/50 shadow-rose-950/40",
          badge: "bg-rose-500/20 text-rose-400 border-rose-500/40",
          text: "text-rose-400",
          barColor: "bg-rose-500",
          icon: <TrendingDown className="h-9 w-9 text-rose-400" />
        };
      default:
        return {
          bg: "from-slate-900 via-slate-900 to-slate-950 border-slate-700 shadow-slate-950/40",
          badge: "bg-slate-700/50 text-slate-300 border-slate-600",
          text: "text-slate-300",
          barColor: "bg-slate-400",
          icon: <Scale className="h-9 w-9 text-slate-300" />
        };
    }
  };

  const vStyles = getVerdictStyles();

  return (
    <div className="space-y-6">
      {/* Stock Top Header Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-blue-600/20 px-2.5 py-1 font-mono text-sm font-bold text-blue-400 border border-blue-500/30">
                {stock.symbol}
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
                {stock.exchange}
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
                {stock.country}
              </span>
              <span className="rounded-md bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                AÇÃO (EQUITY)
              </span>
            </div>
            <h1 className="text-2xl font-black text-white sm:text-3xl tracking-tight">
              {stock.name}
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl line-clamp-2">
              {stock.description}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-3xl font-extrabold text-white">
                {stock.currentPrice.toFixed(2)} <span className="text-lg text-slate-400 font-normal">{stock.currency}</span>
              </div>
              <div className={`flex items-center justify-end gap-1 text-sm font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                {isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {isUp ? "+" : ""}{stock.change.toFixed(2)} ({isUp ? "+" : ""}{stock.changePercent.toFixed(2)}%)
              </div>
            </div>

            <button
              onClick={handleWatchlistClick}
              disabled={added}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                added
                  ? "bg-emerald-950/70 text-emerald-300 border border-emerald-800"
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30"
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> Na Tua Watchlist
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" /> Seguir na Watchlist
                </>
              )}
            </button>
          </div>
        </div>

        {/* 52-Week Range Bar */}
        <div className="mt-5 border-t border-slate-800/80 pt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Mínimo 52 Semanas: <strong className="text-slate-200">{technical.low52Week.toFixed(2)} {stock.currency}</strong></span>
            <span className="font-medium text-slate-300">Range Anual</span>
            <span>Máximo 52 Semanas: <strong className="text-slate-200">{technical.high52Week.toFixed(2)} {stock.currency}</strong></span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
            {(() => {
              const range = technical.high52Week - technical.low52Week || 1;
              const pos = Math.max(0, Math.min(100, ((stock.currentPrice - technical.low52Week) / range) * 100));
              return (
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  style={{ width: `${pos}%` }}
                />
              );
            })()}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CRITICAL VERDICT BANNER (SOBE OU DESCE / EXPECTATIVA)     */}
      {/* ======================================================== */}
      <div className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${vStyles.bg} p-6 shadow-2xl transition-all`}>
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900/80 p-2.5 border border-white/10 shadow-inner">
              {vStyles.icon}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                EXPECTATIVA DO ALGORITMO &amp; INDICADORES
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white">
                  VEREDITO:
                </span>
                <span className={`text-2xl font-black tracking-tight ${vStyles.text}`}>
                  {expectation.direction === "SOBE" && "▲ SOBE"}
                  {expectation.direction === "DESCE" && "▼ DESCE"}
                  {expectation.direction === "NEUTRO" && "⚖️ CONSOLIDAÇÃO"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Probabilidade Estimada</span>
              <div className="text-2xl font-extrabold text-white">
                {expectation.probability}%
              </div>
            </div>
            <div className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${vStyles.badge}`}>
              {expectation.confidenceLevel}
            </div>
          </div>
        </div>

        {/* Probability Meter */}
        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Força da Projeção</span>
            <span className="font-bold">{expectation.verdictLabel}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${vStyles.barColor}`}
              style={{ width: `${expectation.probability}%` }}
            />
          </div>
        </div>

        {/* Confluência de indicadores */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-3 text-xs">
          <span className="font-semibold text-slate-300">
            Confluência de {technical.signalsTotal} indicadores:
            <span className="ml-2 text-emerald-400 font-black">▲ {technical.signalsBullish} a favor da subida</span>
            <span className="mx-2 text-slate-600">|</span>
            <span className="text-rose-400 font-black">▼ {technical.signalsBearish} a favor da queda</span>
          </span>
          <span className={`font-bold ${stock.news.scoreImpact > 0 ? "text-emerald-400" : stock.news.scoreImpact < 0 ? "text-rose-400" : "text-slate-400"}`}>
            Notícias: {stock.news.label} ({stock.news.scoreImpact > 0 ? "+" : ""}{stock.news.scoreImpact} pts)
          </span>
        </div>

        {/* Scorecard: Technical vs Fundamental vs Consolidated */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Score Técnico</span>
              <BarChart2 className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-1 text-2xl font-bold text-cyan-400">
              {technical.scoreTecnico}<span className="text-sm text-slate-400">/100</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {technical.scoreTecnico > 65 ? "Setup altista forte em gráficos" : technical.scoreTecnico < 40 ? "Pressão vendedora em indicadores" : "Oscilando em faixa neutra"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Score Fundamental</span>
              <PieChart className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-1 text-2xl font-bold text-indigo-400">
              {fundamental.scoreFundamental}<span className="text-sm text-slate-400">/100</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Status: <strong className="text-slate-200">{fundamental.valuationStatus}</strong>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Score Consolidado</span>
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-1 text-2xl font-bold text-amber-400">
              {expectation.overallScore}<span className="text-sm text-slate-400">/100</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Técnico + Fundamental + Notícias ≤72h + Monte Carlo + Backtest ({stock.scenario.validation.grade})
            </p>
          </div>
        </div>

        {/* Price Targets & Risk Management */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Targets Box */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <Crosshair className="h-4 w-4 text-blue-400" /> Metas de Preço &amp; Stop Loss
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <span className="text-slate-400 block">Alvo Curto Prazo (1-4 sem)</span>
                <span className="text-lg font-bold text-emerald-400 block mt-0.5">
                  {expectation.timeHorizonShort.targetPrice.toFixed(2)} {stock.currency}
                </span>
                <span className="text-[11px] text-emerald-500 font-semibold">
                  {expectation.timeHorizonShort.targetPercent >= 0 ? "+" : ""}
                  {expectation.timeHorizonShort.targetPercent}%
                </span>
              </div>

              <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <span className="text-slate-400 block">Stop Loss Sugerido</span>
                <span className="text-lg font-bold text-rose-400 block mt-0.5">
                  {expectation.timeHorizonShort.stopLossPrice.toFixed(2)} {stock.currency}
                </span>
                <span className="text-[11px] text-rose-500 font-semibold">
                  {expectation.timeHorizonShort.riskPercent}% risco
                </span>
              </div>

              <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <span className="text-slate-400 block">Alvo Médio Prazo (1-6 meses)</span>
                <span className="text-lg font-bold text-blue-400 block mt-0.5">
                  {expectation.timeHorizonMedium.targetPrice.toFixed(2)} {stock.currency}
                </span>
                <span className="text-[11px] text-blue-400 font-semibold">
                  {expectation.timeHorizonMedium.targetPercent >= 0 ? "+" : ""}
                  {expectation.timeHorizonMedium.targetPercent}% potencial
                </span>
              </div>

              <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <span className="text-slate-400 block">Rácio Risco / Retorno</span>
                <span className="text-lg font-bold text-amber-400 block mt-0.5">
                  {expectation.timeHorizonShort.riskRewardRatio}
                </span>
                <span className="text-[11px] text-slate-400">
                  Assimetria matemática
                </span>
              </div>
            </div>
          </div>

          {/* Rationale & Trading Plan */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Plano Tático de Negociação
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
              {expectation.tradingPlan}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> Fatores Altistas:
                </span>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                  {expectation.keyBullishFactors.slice(0, 2).map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Riscos a Monitorizar:
                </span>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                  {expectation.keyBearishRisks.slice(0, 2).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE CANDLESTICK / PRICE CHART                   */}
      {/* ======================================================== */}
      <StockChart history={stock.history} symbol={stock.symbol} currency={stock.currency} />

      {/* ======================================================== */}
      {/* CENÁRIOS, MONTE CARLO, BACKTEST E VALIDAÇÃO              */}
      {/* ======================================================== */}
      <ScenarioPanel scenario={stock.scenario} currency={stock.currency} />

      {/* ======================================================== */}
      {/* NOTÍCIAS ASSOCIADAS À AÇÃO                               */}
      {/* ======================================================== */}
      <StockNews news={stock.news} symbol={stock.symbol} />

      {/* Navigation tabs for Technical vs Fundamental */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-3 text-sm font-semibold transition border-b-2 ${
            activeTab === "overview"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Matriz de 15+ Indicadores Técnicos
        </button>
        <button
          onClick={() => setActiveTab("fundamental")}
          className={`px-5 py-3 text-sm font-semibold transition border-b-2 ${
            activeTab === "fundamental"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Valuation Fundamental &amp; Múltiplos
        </button>
      </div>

      {/* TAB 1: TECHNICAL INDICATORS MATRIX */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* RSI Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>RSI (14)</span>
              <Activity className="h-4 w-4 text-blue-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {technical.rsi14.toFixed(1)}
            </div>
            <div className="mt-1">
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                  technical.rsi14 < 35
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : technical.rsi14 > 68
                    ? "bg-rose-950 text-rose-400 border border-rose-800"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {technical.rsiSignal}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Mede a velocidade e magnitude das oscilações de preço.
            </p>
          </div>

          {/* MACD Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>MACD (12, 26, 9)</span>
              <Layers className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {technical.macd.histogram.toFixed(2)}
            </div>
            <div className="mt-1">
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                  technical.macd.status.includes("Altista")
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : technical.macd.status.includes("Baixista")
                    ? "bg-rose-950 text-rose-400 border border-rose-800"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {technical.macd.status}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Linha: {technical.macd.line} | Sinal: {technical.macd.signal}
            </p>
          </div>

          {/* Moving Averages Trend */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Médias Móveis (EMA 20/50/200)</span>
              <TrendingUp className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 text-xl font-bold text-white">
              {technical.maTrend}
            </div>
            <div className="mt-1 text-xs text-slate-300 space-y-0.5">
              <div>EMA 20: <strong className="text-slate-100">{technical.ema20.toFixed(2)}</strong></div>
              <div>SMA 50: <strong className="text-slate-100">{technical.sma50.toFixed(2)}</strong></div>
              <div>SMA 200: <strong className="text-slate-100">{technical.sma200.toFixed(2)}</strong></div>
            </div>
            {technical.goldenCross && (
              <span className="mt-2 block rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                ⭐ GOLDEN CROSS ATIVO
              </span>
            )}
          </div>

          {/* Bollinger Bands & Volatility */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Bandas de Bollinger &amp; ATR</span>
              <Scale className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-xl font-bold text-white">
              ATR: {technical.atr14.toFixed(2)} {stock.currency}
            </div>
            <div className="mt-1 text-xs text-slate-300 space-y-0.5">
              <div>Sup: {technical.bollingerBands.upper.toFixed(2)}</div>
              <div>Inf: {technical.bollingerBands.lower.toFixed(2)}</div>
            </div>
            <span className="mt-2 block rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
              {technical.bollingerBands.position}
            </span>
          </div>


          {/* ADX / DMI */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400"><span>ADX / DMI (14)</span><Activity className="h-4 w-4 text-cyan-400" /></div>
            <div className="mt-2 text-2xl font-black text-white">{technical.adx.value}</div>
            <div className="mt-1 text-[11px] text-slate-300">+DI {technical.adx.plusDI} | -DI {technical.adx.minusDI}</div>
            <span className={`mt-2 inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${technical.adx.direction.includes("Compradores") ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : technical.adx.direction.includes("Vendedores") ? "bg-rose-950 text-rose-400 border border-rose-800" : "bg-slate-800 text-slate-300"}`}>{technical.adx.strength} • {technical.adx.direction}</span>
          </div>

          {/* Estocástico */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400"><span>Estocástico (14, 3)</span><Activity className="h-4 w-4 text-pink-400" /></div>
            <div className="mt-2 text-2xl font-black text-white">%K {technical.stochastic.k}</div>
            <div className="mt-1 text-[11px] text-slate-300">%D {technical.stochastic.d}</div>
            <span className={`mt-2 inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${technical.stochastic.status.includes("Sobrevendido") ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : technical.stochastic.status.includes("Sobrecomprado") ? "bg-rose-950 text-rose-400 border border-rose-800" : "bg-slate-800 text-slate-300"}`}>{technical.stochastic.status}</span>
          </div>

          {/* Williams %R + CCI */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400"><span>Williams %R (14) &amp; CCI (20)</span><Scale className="h-4 w-4 text-orange-400" /></div>
            <div className="mt-2 text-xl font-black text-white">%R {technical.williamsR.value}</div>
            <div className="text-[11px] text-slate-300">{technical.williamsR.status}</div>
            <div className="mt-2 text-xl font-black text-white">CCI {technical.cci.value}</div>
            <div className="text-[11px] text-slate-300">{technical.cci.status}</div>
          </div>

          {/* OBV + ROC */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400"><span>OBV &amp; ROC (12)</span><BarChart2 className="h-4 w-4 text-lime-400" /></div>
            <div className={`mt-2 text-sm font-black ${technical.obv.trend.includes("Acumulação") ? "text-emerald-400" : technical.obv.trend.includes("Distribuição") ? "text-rose-400" : "text-white"}`}>{technical.obv.trend}</div>
            {technical.obv.divergence && <div className="mt-1 text-[10px] text-amber-300">{technical.obv.divergence}</div>}
            <div className="mt-2 text-xl font-black text-white">ROC {technical.roc.value > 0 ? "+" : ""}{technical.roc.value}%</div>
            <div className="text-[11px] text-slate-300">{technical.roc.status}</div>
          </div>

          {/* Ichimoku */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400"><span>Ichimoku Kinko Hyo</span><Layers className="h-4 w-4 text-indigo-400" /></div>
            <div className={`mt-2 text-sm font-black ${technical.ichimoku.position.includes("Acima") ? "text-emerald-400" : technical.ichimoku.position.includes("Abaixo") ? "text-rose-400" : "text-amber-400"}`}>{technical.ichimoku.position}</div>
            <div className="mt-1 text-[11px] text-slate-300 space-y-0.5">
              <div>Tenkan {technical.ichimoku.tenkan} | Kijun {technical.ichimoku.kijun}</div>
              <div>Nuvem: {Math.min(technical.ichimoku.spanA, technical.ichimoku.spanB)} – {Math.max(technical.ichimoku.spanA, technical.ichimoku.spanB)}</div>
            </div>
            <span className="mt-2 inline-block rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">TK: {technical.ichimoku.tkCross}</span>
          </div>

          {/* Parabolic SAR + VWAP */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400"><span>Parabolic SAR &amp; VWAP (20)</span><Crosshair className="h-4 w-4 text-teal-400" /></div>
            <div className="mt-2 text-xl font-black text-white">SAR {technical.parabolicSar.value}</div>
            <div className={`text-[11px] font-semibold ${technical.parabolicSar.signal.includes("Compra") ? "text-emerald-400" : "text-rose-400"}`}>{technical.parabolicSar.signal}</div>
            <div className="mt-2 text-xl font-black text-white">VWAP {technical.vwap.value}</div>
            <div className={`text-[11px] font-semibold ${technical.vwap.position.includes("Acima") ? "text-emerald-400" : "text-rose-400"}`}>{technical.vwap.position}</div>
          </div>

          {/* Fibonacci */}
          <div className="col-span-1 sm:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400"><span>Retrações de Fibonacci (swing 60 sessões)</span><span className="text-amber-400 font-semibold">Nível mais próximo: {technical.fibonacci.nearest}</span></div>
            <div className="mt-3 grid grid-cols-4 sm:grid-cols-7 gap-2">
              {technical.fibonacci.levels.map((l) => (
                <div key={l.label} className={`rounded-xl p-2 text-center border ${l.label === technical.fibonacci.nearest ? "border-amber-500 bg-amber-950/40" : "border-slate-800 bg-slate-950"}`}>
                  <div className="text-[10px] text-slate-400">{l.label}</div>
                  <div className="text-xs font-bold text-white">{l.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Support and Resistance exact levels */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Níveis Chave de Suporte e Resistência Identificados
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-slate-950 p-4 border border-rose-900/40">
                <span className="text-xs text-rose-400 font-semibold block">Zona de Suporte Imediato</span>
                <span className="text-2xl font-black text-rose-300 mt-1 block">
                  {technical.supportLevel.toFixed(2)} {stock.currency}
                </span>
                <span className="text-[11px] text-slate-400">Ponto crítico para colocação de Stop Loss</span>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 border border-blue-900/40">
                <span className="text-xs text-blue-400 font-semibold block">Preço Atual</span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {stock.currentPrice.toFixed(2)} {stock.currency}
                </span>
                <span className="text-[11px] text-slate-400">Negociação no mercado</span>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 border border-emerald-900/40">
                <span className="text-xs text-emerald-400 font-semibold block">Zona de Resistência Imediata</span>
                <span className="text-2xl font-black text-emerald-300 mt-1 block">
                  {technical.resistanceLevel.toFixed(2)} {stock.currency}
                </span>
                <span className="text-[11px] text-slate-400">Barreira de tomada de lucro inicial</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FUNDAMENTAL VALUATION */}
      {activeTab === "fundamental" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <span className="text-xs text-slate-400">Múltiplo P/E (Preço / Lucro)</span>
              <div className="text-2xl font-black text-white mt-1">
                {fundamental.peRatio ? `${fundamental.peRatio}x` : "N/D"}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Forward P/E: {fundamental.forwardPE ? `${fundamental.forwardPE}x` : "N/D"}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <span className="text-xs text-slate-400">P/B (Preço / Valor Patrimonial)</span>
              <div className="text-2xl font-black text-white mt-1">
                {fundamental.priceToBook ? `${fundamental.priceToBook}x` : "N/D"}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Multiplicador sobre valor em livros
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <span className="text-xs text-slate-400">Dividend Yield Anual</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {fundamental.dividendYield ? `${fundamental.dividendYield.toFixed(2)}%` : "0.0%"}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Retorno via proventos anuais
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <span className="text-xs text-slate-400">ROE (Rentabilidade do Capital)</span>
              <div className="text-2xl font-black text-blue-400 mt-1">
                {fundamental.returnOnEquity ? `${fundamental.returnOnEquity}%` : "14.5%"}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Eficiência na geração de lucro
              </span>
            </div>
          </div>

          {/* Fair Value DCF & Graham Number */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" /> Modelos de Avaliação Intrínseca (Valuation)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
                <span className="text-xs text-slate-400">Preço Atual da Ação</span>
                <div className="text-2xl font-extrabold text-white mt-1">
                  {stock.currentPrice.toFixed(2)} {stock.currency}
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 border border-emerald-900/40">
                <span className="text-xs text-emerald-400 font-semibold">Preço Justo Modelo DCF</span>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                  {fundamental.dcfFairValue ? `${fundamental.dcfFairValue.toFixed(2)} ${stock.currency}` : "N/D"}
                </div>
                <span className="text-[11px] text-slate-400">
                  Desconto de Fluxos de Caixa projetados
                </span>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 border border-indigo-900/40">
                <span className="text-xs text-indigo-400 font-semibold">Fórmula de Benjamin Graham</span>
                <div className="text-2xl font-extrabold text-indigo-400 mt-1">
                  {fundamental.grahamValue ? `${fundamental.grahamValue.toFixed(2)} ${stock.currency}` : "N/D"}
                </div>
                <span className="text-[11px] text-slate-400">
                  √(22.5 × EPS × BVPS)
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-950/80 p-4 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Veredito Fundamental Consolidado:</span>
                <div className="text-base font-bold text-white mt-0.5">
                  {fundamental.valuationStatus}
                </div>
              </div>
              <div className="rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 text-xs font-semibold">
                Score: {fundamental.scoreFundamental}/100
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
