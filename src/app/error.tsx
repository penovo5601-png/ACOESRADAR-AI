"use client";
import { useEffect } from "react";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="min-h-screen bg-[#070b12] text-slate-100 flex items-center justify-center px-4">
      <div className="max-w-xl rounded-3xl border border-amber-800 bg-amber-950/30 p-8 text-center">
        <h1 className="text-xl font-black">Ocorreu um problema temporário</h1>
        <p className="mt-2 text-sm text-slate-300">Normalmente é um fornecedor de dados a demorar. Tenta de novo — tudo é recalculado na hora.</p>
        {error?.digest && <p className="mt-2 text-[11px] text-slate-500">ref. {error.digest}</p>}
        <div className="mt-5 flex justify-center gap-3"><button onClick={() => reset()} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Tentar novamente</button><a href="/" className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold">Início</a></div>
      </div>
    </main>
  );
}
