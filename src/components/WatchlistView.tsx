"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Trash2, ArrowRight, Plus, ExternalLink, Sparkles } from "lucide-react";

interface WatchlistItem {
  id: number;
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  addedPrice: number | null;
  targetPrice: number | null;
  notes: string | null;
  createdAt: string;
}

interface WatchlistViewProps {
  onSelectStock: (symbol: string) => void;
}

export function WatchlistView({ onSelectStock }: WatchlistViewProps) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSymbol, setNewSymbol] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        setItems(data.watchlist || []);
      }
    } catch (err) {
      console.error("Watchlist fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: newSymbol.trim().toUpperCase(),
          targetPrice: newTarget ? Number(newTarget) : null,
          notes: newNotes.trim() || null
        })
      });

      if (res.ok) {
        setNewSymbol("");
        setNewTarget("");
        setNewNotes("");
        setShowAddForm(false);
        fetchWatchlist();
      }
    } catch (err) {
      console.error("Error adding to watchlist:", err);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/watchlist?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      console.error("Error deleting from watchlist:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20 mb-2">
              <Bookmark className="h-3.5 w-3.5" /> PORTFÓLIO &amp; VIGILÂNCIA
            </div>
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              A Minha Watchlist de Ações
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Guarda as tuas ações favoritas na base de dados para acompanhamento regular de sinais e projeções.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
          >
            <Plus className="h-4 w-4" /> Adicionar Nova Ação
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAdd} className="mt-5 rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 block">Adicionar Ação à Watchlist:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Ticker (ex: EDP.LS, GALP.LS, AAPL)"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                required
                className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 uppercase font-mono"
              />
              <input
                type="number"
                step="any"
                placeholder="Preço Alvo Desejado (Opcional)"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Notas pessoais (ex: Comprar no suporte dos 3.80€)"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
              >
                Guardar Ação
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Watchlist Cards */}
      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 text-xs text-slate-400">
          A carregar a tua watchlist...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 space-y-3">
          <Bookmark className="mx-auto h-10 w-10 text-slate-600" />
          <h4 className="text-base font-bold text-slate-300">A tua Watchlist está vazia</h4>
          <p className="text-xs max-w-sm mx-auto">
            Clica em &ldquo;Seguir na Watchlist&rdquo; em qualquer ação para a fixares aqui e acompanhares a evolução dos indicadores.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectStock(item.symbol)}
              className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all hover:border-blue-500 hover:bg-slate-900/90 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-base font-black text-white">
                    {item.symbol}
                  </span>
                  <h3 className="text-sm font-bold text-slate-300 mt-0.5">
                    {item.name}
                  </h3>
                  <span className="text-[10px] text-slate-500 block">
                    Bolsa: {item.exchange}
                  </span>
                </div>

                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  title="Remover da watchlist"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-950 hover:text-rose-400 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {item.targetPrice && (
                <div className="mt-3 rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-400">Preço Alvo Definido:</span>
                  <span className="font-bold text-emerald-400">
                    {item.targetPrice.toFixed(2)} {item.currency}
                  </span>
                </div>
              )}

              {item.notes && (
                <p className="mt-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 italic">
                  &ldquo;{item.notes}&rdquo;
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3 text-xs">
                <span className="text-blue-400 font-semibold flex items-center gap-1">
                  Abrir Análise <ArrowRight className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString("pt-PT")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
