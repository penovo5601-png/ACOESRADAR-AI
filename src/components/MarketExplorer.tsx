"use client";

import React, { useState, useEffect } from "react";
import { GLOBAL_STOCKS_DIRECTORY, STOCK_MARKETS, STOCK_SECTORS, StockDirectoryItem } from "@/data/globalStocks";
import { Search, Globe, Filter, ExternalLink, ArrowRight, TrendingUp } from "lucide-react";

interface MarketExplorerProps {
  onSelectStock: (symbol: string) => void;
  selectedSymbol?: string;
}

export function MarketExplorer({ onSelectStock, selectedSymbol }: MarketExplorerProps) {
  const [selectedMarket, setSelectedMarket] = useState<string>("ALL");
  const [selectedSector, setSelectedSector] = useState<string>("Todos os Setores");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<StockDirectoryItem[]>([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState<boolean>(false);

  // Filtered curated stocks
  const filteredCurated = GLOBAL_STOCKS_DIRECTORY.filter((item) => {
    const matchesMarket = selectedMarket === "ALL" || item.market === selectedMarket;
    const matchesSector = selectedSector === "Todos os Setores" || item.sector.includes(selectedSector);
    const matchesSearch =
      !searchQuery ||
      item.symbol.toUpperCase().includes(searchQuery.toUpperCase()) ||
      item.name.toUpperCase().includes(searchQuery.toUpperCase()) ||
      item.country.toUpperCase().includes(searchQuery.toUpperCase());
    return matchesMarket && matchesSector && matchesSearch;
  });

  // Debounced search for universal global search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingExternal(true);
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err) {
        console.error("Search query error:", err);
      } finally {
        setIsSearchingExternal(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displayList = searchResults.length > 0 ? searchResults : filteredCurated;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20 mb-2">
              <Globe className="h-3.5 w-3.5" /> DIRETÓRIO GLOBAL DE TICKERS &amp; BOLSAS
            </div>
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              Explorador de Ações Mundiais
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Pesquisa qualquer ação cotada no mundo (EUA, Euronext Lisboa, Brasil B3, Europa, Ásia ou Canadá).
              Sem cripto ou forex — 100% focado no universo de Ações (Equities)!
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar ticker ou empresa (ex: EDP, AAPL, PETR4)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
            {isSearchingExternal && (
              <span className="absolute right-3.5 top-3 text-[10px] text-blue-400 animate-pulse">
                A procurar na rede...
              </span>
            )}
          </div>
        </div>

        {/* Market Filter Chips */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800/80 pt-4">
          {STOCK_MARKETS.map((m) => (
            <button
              key={m.id}
              onClick={() => { setSelectedMarket(m.id); setSearchQuery(""); }}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedMarket === m.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {m.flag && <span>{m.flag}</span>}
              <span>{m.name}</span>
            </button>
          ))}
        </div>

        {/* Sector Filter Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STOCK_SECTORS.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSector(s)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                selectedSector === s
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Stocks */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayList.map((item) => {
          const isSelected = selectedSymbol?.toUpperCase() === item.symbol.toUpperCase();
          return (
            <div
              key={item.symbol}
              onClick={() => onSelectStock(item.symbol)}
              className={`cursor-pointer rounded-2xl border p-5 transition-all hover:scale-[1.01] hover:shadow-xl ${
                isSelected
                  ? "border-blue-500 bg-blue-950/40 shadow-blue-950/40"
                  : "border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-white">
                      {item.symbol}
                    </span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                      {item.country}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-slate-200 line-clamp-1">
                    {item.name}
                  </h3>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/80 text-slate-300">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-slate-950 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-800">
                  {item.exchange}
                </span>
                <span className="rounded-md bg-slate-950 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-800">
                  {item.sector}
                </span>
                <span className="rounded-md bg-slate-950 px-2 py-0.5 text-[10px] text-emerald-400 border border-slate-800">
                  Moeda: {item.currency}
                </span>
              </div>

              <p className="mt-3 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3 text-xs">
                <span className="text-[11px] text-blue-400 font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Ver Análise &amp; Veredito
                </span>
                <span className="text-[10px] text-slate-400">100% Ações</span>
              </div>
            </div>
          );
        })}
      </div>

      {displayList.length === 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
          <p className="text-base font-bold text-slate-300">Nenhuma ação encontrada para os filtros selecionados.</p>
          <p className="mt-1 text-xs">Tenta escrever o código exato da ação na barra de pesquisa (ex: AAPL, BCP.LS, PETR4.SA).</p>
        </div>
      )}
    </div>
  );
}
