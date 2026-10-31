"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChartAnalysisResult } from "@/lib/chartVision";
import { SAMPLE_CHARTS } from "@/data/sampleCharts";
import {
  Upload,
  Camera,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Crosshair,
  AlertCircle,
  FileImage,
  RefreshCw,
  Key,
  History,
  CheckCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export function ChartPhotoAnalyzer() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [symbolHint, setSymbolHint] = useState<string>("");
  const [userApiKey, setUserApiKey] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ChartAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [savedHistory, setSavedHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Listen for paste (Ctrl+V) anywhere
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setSelectedImage(event.target.result as string);
                setAnalysisResult(null);
                setErrorMsg(null);
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch("/api/chart-analyze/history");
      if (res.ok) {
        const data = await res.json();
        setSavedHistory(data.history || []);
      }
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Por favor seleciona um ficheiro de imagem válido (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
        setAnalysisResult(null);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setErrorMsg("Por favor carrega ou cola uma foto de um gráfico primeiro.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setErrorMsg(null);

      const res = await fetch("/api/chart-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedImage,
          symbolHint: symbolHint.trim().toUpperCase() || undefined,
          userApiKey: userApiKey.trim() || undefined,
          saveToDb: true
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro ao processar imagem.");
      }

      const data = await res.json();
      setAnalysisResult(data.analysis);
      fetchHistory(); // refresh history
    } catch (err: any) {
      setErrorMsg(err.message || "Falha na análise da imagem.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_CHARTS[0]) => {
    setSelectedImage(sample.dataUri);
    setSymbolHint(sample.symbol);
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
              <Sparkles className="h-3.5 w-3.5" /> RECONHECIMENTO VISUAL DE GRÁFICOS (AI &amp; PATTERNS)
            </div>
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              Envia a Foto do Teu Gráfico e Descobre se SOBE ou DESCE!
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tira um print screen (TradingView, homebroker, app de telemóvel) ou arrasta uma fotografia de candlesticks.
              O sistema analisa automaticamente os padrões de velas, linhas de tendência, suportes e osciladores visíveis para te dar um veredito inequívoco e plano tático.
            </p>
          </div>

          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
          >
            <Key className="h-4 w-4 text-amber-400" />
            {showKeyInput ? "Ocultar Chave OpenAI" : "Configurar Chave OpenAI (Opcional)"}
          </button>
        </div>

        {showKeyInput && (
          <div className="mt-4 rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Chave de API OpenAI (Opcional - caso queiras usar GPT-4o Vision próprio):</span>
              <span className="text-emerald-400">Sem chave? O motor algorítmico interno funciona a 100%!</span>
            </div>
            <input
              type="password"
              placeholder="sk-proj-..."
              value={userApiKey}
              onChange={(e) => setUserApiKey(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* Main Upload & Preview Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Upload box & Quick samples */}
        <div className="space-y-4 lg:col-span-6">
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                : selectedImage
                ? "border-emerald-500/50 bg-slate-900/60"
                : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {selectedImage ? (
              <div className="relative w-full overflow-hidden rounded-2xl">
                <img
                  src={selectedImage}
                  alt="Gráfico para análise"
                  className="max-h-72 w-full object-contain rounded-xl bg-slate-950"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                    <div className="relative h-16 w-16">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                      <div className="absolute inset-2 rounded-full border-4 border-emerald-500 border-b-transparent animate-spin [animation-direction:reverse]" />
                    </div>
                    <span className="mt-4 text-xs font-bold text-white tracking-widest uppercase animate-pulse">
                      A Analisar Padrões &amp; Candlesticks...
                    </span>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Imagem pronta para inspeção</span>
                  <span className="text-blue-400 font-medium">Clica para trocar foto</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Upload className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Arrasta a foto do gráfico ou clica para procurar
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Dica: Podes carregar em <kbd className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-slate-300">Ctrl + V</kbd> para colar diretamente do teu clipboard!
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                  <span>PNG, JPG, WEBP, Screenshots</span> • <span>Só Ações</span>
                </div>
              </div>
            )}
          </div>

          {/* Symbol Hint input & Action Button */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Ticker / Ação da Imagem (Opcional, ex: AAPL, EDP.LS, PETR4.SA):
                </label>
                <input
                  type="text"
                  placeholder="Ex: EDP.LS, GALP.LS, NVDA..."
                  value={symbolHint}
                  onChange={(e) => setSymbolHint(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!selectedImage || isAnalyzing}
                className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:brightness-110 disabled:opacity-50 transition"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> A Processar...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Analisar Gráfico Agora!
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-950/70 border border-rose-800 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Quick Demo Sample Charts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              Experimentar Instantaneamente com Gráficos Reais:
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {SAMPLE_CHARTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => loadSample(sample)}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-left transition hover:border-blue-500/50 hover:bg-slate-900"
                >
                  <span className="text-xs font-bold text-white block truncate">{sample.title}</span>
                  <span className="text-[10px] text-slate-400 block mt-1 line-clamp-2">{sample.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Instant Structured Verdict & Technical Results */}
        <div className="lg:col-span-6">
          {analysisResult ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Verdict Card */}
              <div
                className={`rounded-3xl border p-6 shadow-2xl ${
                  analysisResult.verdict === "SOBE"
                    ? "bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-emerald-500/50"
                    : "bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border-rose-500/50"
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Resultado da Inspeção Visual
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-black text-white">VEREDITO:</span>
                      <span
                        className={`text-3xl font-black ${
                          analysisResult.verdict === "SOBE" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {analysisResult.verdict === "SOBE" ? "▲ SOBE!" : "▼ DESCE!"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400">Convicção</span>
                    <div className="text-2xl font-extrabold text-white">
                      {analysisResult.confidence}%
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {analysisResult.source === "AI_VISION" ? "Visão Multimodal" : "Motor de Padrões"}
                    </span>
                  </div>
                </div>

                {/* Pattern & Trend */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800">
                    <span className="text-slate-400 block">Padrão Gráfico Detectado</span>
                    <span className="text-sm font-bold text-white block mt-0.5">
                      {analysisResult.patternDetected}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800">
                    <span className="text-slate-400 block">Estrutura de Tendência</span>
                    <span className="text-sm font-bold text-white block mt-0.5">
                      {analysisResult.trend}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {analysisResult.patternDescription}
                </p>
              </div>

              {/* Tactical Levels (Entry, Stop Loss, Targets) */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 space-y-4 shadow-xl">
                <h4 className="flex items-center gap-2 text-sm font-bold text-white">
                  <Crosshair className="h-4 w-4 text-blue-400" /> Níveis de Execução Táticos (Trading Plan)
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                    <span className="text-slate-400 block">Gatilho de Entrada</span>
                    <span className="text-base font-bold text-blue-400 mt-0.5 block">
                      {analysisResult.keyLevels.entryPrice}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-950 p-3 border border-rose-950">
                    <span className="text-slate-400 block">Stop Loss Técnico</span>
                    <span className="text-base font-bold text-rose-400 mt-0.5 block">
                      {analysisResult.keyLevels.stopLoss}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-950 p-3 border border-emerald-950">
                    <span className="text-slate-400 block">Alvo 1 (Conservador)</span>
                    <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                      {analysisResult.keyLevels.takeProfit1}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-950 p-3 border border-emerald-950">
                    <span className="text-slate-400 block">Alvo 2 (Expansão)</span>
                    <span className="text-base font-bold text-emerald-300 mt-0.5 block">
                      {analysisResult.keyLevels.takeProfit2}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-200 block mb-1">
                    Formação de Candlesticks Observada:
                  </span>
                  <span className="text-slate-300">{analysisResult.candlestickFormation}</span>
                </div>

                <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-200 block mb-1">
                    Indicadores Visíveis no Gráfico:
                  </span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {analysisResult.visibleIndicators.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-blue-950/40 border border-blue-800/40 p-4 text-xs">
                  <span className="font-bold text-blue-300 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="h-4 w-4" /> Plano Operacional Recomendado:
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {analysisResult.tradingPlan}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400">
              <Camera className="h-12 w-12 text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-slate-300">
                A aguardar envio da fotografia do gráfico
              </h4>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                Carrega um ficheiro, clica num dos exemplos ou prime Ctrl+V para obteres a leitura detalhada de subida ou descida.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* History of Previous Analyses */}
      {savedHistory.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-base font-bold text-white">
              <History className="h-4 w-4 text-blue-400" /> Histórico de Gráficos Analisados
            </h3>
            <span className="text-xs text-slate-400">{savedHistory.length} registos guardados</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedHistory.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[180px]">
                    {item.title}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-black ${
                      item.verdict === "SOBE"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-rose-950 text-rose-400 border border-rose-800"
                    }`}
                  >
                    {item.verdict} ({Math.round(item.confidence)}%)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Padrão: <strong className="text-slate-300">{item.patternDetected}</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Data: {new Date(item.createdAt).toLocaleDateString("pt-PT")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
