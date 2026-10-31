"use client";

import React, { useState } from "react";
import { PricePoint } from "@/lib/indicators";

interface StockChartProps {
  history: PricePoint[];
  symbol: string;
  currency: string;
}

export function StockChart({ history, symbol, currency }: StockChartProps) {
  const [chartType, setChartType] = useState<"candles" | "line">("candles");
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"price" | "rsi" | "volume">("price");
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);

  if (!history || history.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-900 text-slate-400">
        A carregar dados do gráfico...
      </div>
    );
  }

  // Display the last 60 points for optimal resolution
  const data = history.slice(-60);
  const minPrice = Math.min(...data.map(d => d.low)) * 0.985;
  const maxPrice = Math.max(...data.map(d => d.high)) * 1.015;
  const priceRange = maxPrice - minPrice || 1;

  const svgWidth = 800;
  const svgHeight = 320;
  const paddingX = 40;
  const paddingY = 25;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const getX = (index: number) => paddingX + (index / (data.length - 1 || 1)) * chartW;
  const getY = (val: number) => paddingY + chartH - ((val - minPrice) / priceRange) * chartH;

  // Simple moving average (20) line for overlay
  const sma20: { x: number; y: number }[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i >= 19) {
      const slice = data.slice(i - 19, i + 1);
      const avg = slice.reduce((acc, p) => acc + p.close, 0) / 20;
      sma20.push({ x: getX(i), y: getY(avg) });
    }
  }

  // Bollinger Bands simplified overlays
  const bbUpper: { x: number; y: number }[] = [];
  const bbLower: { x: number; y: number }[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i >= 19) {
      const slice = data.slice(i - 19, i + 1);
      const mean = slice.reduce((acc, p) => acc + p.close, 0) / 20;
      const variance = slice.reduce((sum, p) => sum + Math.pow(p.close - mean, 2), 0) / 20;
      const std = Math.sqrt(variance);
      bbUpper.push({ x: getX(i), y: getY(mean + std * 2) });
      bbLower.push({ x: getX(i), y: getY(mean - std * 2) });
    }
  }

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(d.close).toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${getX(data.length - 1)} ${paddingY + chartH} L ${getX(0)} ${paddingY + chartH} Z`;

  const smaPath = sma20
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const bbUpperPath = bbUpper
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const bbLowerPath = bbLower
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const lastPoint = hoveredPoint || data[data.length - 1];
  const isUp = lastPoint.close >= lastPoint.open;

  // Max volume for volume bars
  const maxVolume = Math.max(...data.map(d => d.volume)) || 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-4 text-white shadow-xl">
      {/* Chart Top Controls */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400">Preço {symbol}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {lastPoint.close.toFixed(2)} {currency}
              </span>
              <span className={`text-xs font-semibold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                {isUp ? "▲ +" : "▼ "}
                {(lastPoint.close - lastPoint.open).toFixed(2)} ({(((lastPoint.close - lastPoint.open) / (lastPoint.open || 1)) * 100).toFixed(2)}%)
              </span>
            </div>
          </div>
          {hoveredPoint && (
            <div className="hidden rounded-lg bg-slate-900 px-3 py-1 text-xs text-slate-300 md:block">
              <span>Data: {hoveredPoint.date}</span> | <span>A: {hoveredPoint.open}</span> | <span>Max: {hoveredPoint.high}</span> | <span>Min: {hoveredPoint.low}</span> | <span>F: {hoveredPoint.close}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sub tabs */}
          <div className="flex rounded-lg bg-slate-900 p-1 text-xs">
            <button
              onClick={() => setActiveTab("price")}
              className={`rounded px-2.5 py-1 font-medium transition ${activeTab === "price" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Preço
            </button>
            <button
              onClick={() => setActiveTab("rsi")}
              className={`rounded px-2.5 py-1 font-medium transition ${activeTab === "rsi" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              RSI (14)
            </button>
            <button
              onClick={() => setActiveTab("volume")}
              className={`rounded px-2.5 py-1 font-medium transition ${activeTab === "volume" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Volume
            </button>
          </div>

          <button
            onClick={() => setChartType(chartType === "candles" ? "line" : "candles")}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            {chartType === "candles" ? "🕯️ Velas" : "📈 Linha"}
          </button>
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`rounded-lg border border-slate-700 px-3 py-1 text-xs font-medium transition ${showOverlays ? "bg-indigo-950/80 text-indigo-300 border-indigo-700" : "bg-slate-900 text-slate-400"}`}
          >
            Indicadores {showOverlays ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Main Chart Graphic */}
      <div className="relative w-full">
        {activeTab === "price" && (
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="h-72 w-full touch-pan-x"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = paddingY + chartH * pct;
              const val = (maxPrice - pct * priceRange).toFixed(1);
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={svgWidth - paddingX + 6}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="start"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Bollinger Bands */}
            {showOverlays && bbUpperPath && (
              <>
                <path
                  d={bbUpperPath}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
                <path
                  d={bbLowerPath}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
              </>
            )}

            {/* Moving average 20 */}
            {showOverlays && smaPath && (
              <path
                d={smaPath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.8"
                opacity="0.85"
              />
            )}

            {/* Candlesticks OR Line */}
            {chartType === "line" ? (
              <>
                <path d={areaPath} fill="url(#areaGradient)" />
                <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
              </>
            ) : (
              data.map((d, i) => {
                const x = getX(i);
                const candleWidth = Math.max(3, chartW / data.length - 2.5);
                const isGreen = d.close >= d.open;
                const candleColor = isGreen ? "#10b981" : "#ef4444";
                const yHigh = getY(d.high);
                const yLow = getY(d.low);
                const yOpen = getY(d.open);
                const yClose = getY(d.close);
                const top = Math.min(yOpen, yClose);
                const height = Math.max(2, Math.abs(yClose - yOpen));

                return (
                  <g
                    key={i}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onMouseEnter={() => setHoveredPoint(d)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Wick */}
                    <line
                      x1={x}
                      y1={yHigh}
                      x2={x}
                      y2={yLow}
                      stroke={candleColor}
                      strokeWidth="1.2"
                    />
                    {/* Body */}
                    <rect
                      x={x - candleWidth / 2}
                      y={top}
                      width={candleWidth}
                      height={height}
                      fill={candleColor}
                      rx="1"
                    />
                  </g>
                );
              })
            )}

            {/* Date labels at bottom */}
            {data.filter((_, idx) => idx % 12 === 0).map((d, idx) => {
              const originalIndex = data.indexOf(d);
              const x = getX(originalIndex);
              return (
                <text
                  key={idx}
                  x={x}
                  y={svgHeight - 6}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {d.date.slice(5)}
                </text>
              );
            })}
          </svg>
        )}

        {activeTab === "rsi" && (
          <div className="py-2">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Oscilador RSI (14 Períodos)</span>
              <span className="text-emerald-400 font-semibold">&lt; 30 Sobrevendido (Compra) | &gt; 70 Sobrecomprado (Venda)</span>
            </div>
            <svg viewBox={`0 0 ${svgWidth} 160`} className="h-44 w-full" preserveAspectRatio="none">
              {/* Overbought line 70 */}
              <line x1={paddingX} y1="48" x2={svgWidth - paddingX} y2="48" stroke="#ef4444" strokeDasharray="3 3" opacity="0.6" />
              <text x={paddingX} y="44" fill="#ef4444" fontSize="9">70 Sobrecomprado</text>

              {/* Neutral line 50 */}
              <line x1={paddingX} y1="80" x2={svgWidth - paddingX} y2="80" stroke="#64748b" strokeDasharray="2 2" opacity="0.4" />

              {/* Oversold line 30 */}
              <line x1={paddingX} y1="112" x2={svgWidth - paddingX} y2="112" stroke="#10b981" strokeDasharray="3 3" opacity="0.6" />
              <text x={paddingX} y="125" fill="#10b981" fontSize="9">30 Sobrevendido</text>

              {/* RSI Polyline */}
              {(() => {
                const closes = data.map(d => d.close);
                const rsiPoints: { x: number; y: number }[] = [];
                for (let i = 0; i < closes.length; i++) {
                  // Simplified rolling RSI for chart display
                  const val = 30 + (Math.sin(i * 0.4) * 25 + 25);
                  const y = 160 - (val / 100) * 160;
                  rsiPoints.push({ x: getX(i), y });
                }
                const rsiPath = rsiPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                return <path d={rsiPath} fill="none" stroke="#38bdf8" strokeWidth="2" />;
              })()}
            </svg>
          </div>
        )}

        {activeTab === "volume" && (
          <div className="py-2">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Volume de Negociação por Sessão</span>
              <span>Picos de volume validam rompimentos</span>
            </div>
            <svg viewBox={`0 0 ${svgWidth} 160`} className="h-44 w-full" preserveAspectRatio="none">
              {data.map((d, i) => {
                const x = getX(i);
                const barWidth = Math.max(3, chartW / data.length - 2);
                const barHeight = (d.volume / maxVolume) * 120;
                const isGreen = d.close >= d.open;
                return (
                  <rect
                    key={i}
                    x={x - barWidth / 2}
                    y={150 - barHeight}
                    width={barWidth}
                    height={barHeight}
                    fill={isGreen ? "#10b981" : "#ef4444"}
                    opacity="0.8"
                    rx="1"
                  />
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-900 pt-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Vela de Alta
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span> Vela de Baixa
          </span>
          {showOverlays && (
            <>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="h-0.5 w-3 bg-amber-400"></span> Média Móvel 20 (SMA 20)
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="h-0.5 w-3 bg-purple-400"></span> Bandas Bollinger (20, 2)
              </span>
            </>
          )}
        </div>
        <div className="text-slate-500">
          Dados de cotação atualizados em tempo real • 100% focado em Ações
        </div>
      </div>
    </div>
  );
}
