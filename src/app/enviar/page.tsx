"use client";

import React, { useEffect, useRef, useState } from "react";

interface Item { id: number; filename: string; sizeBytes: number; note: string | null; createdAt: string }

export default function EnviarPage() {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [list, setList] = useState<Item[]>([]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => { try { const r = await fetch("/api/upload"); const j = await r.json(); setList(j.uploads ?? []); } catch {} };
  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!file) { setErr("Escolhe primeiro o ficheiro."); return; }
    setBusy(true); setErr(null); setMsg(null);
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("note", note);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Erro no envio");
      setMsg(`✅ Recebido: ${j.upload.filename} (${(j.upload.sizeBytes / 1024).toFixed(0)} KB). Já o consigo ler.`);
      setFile(null); setNote(""); if (inputRef.current) inputRef.current.value = "";
      load();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <main className="min-h-screen bg-[#070b12] text-slate-100 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-black">📄 Enviar PDF / documento</h1>
          <p className="mt-1 text-sm text-slate-400">Carrega aqui o ficheiro. Fica guardado na base de dados e eu leio-o antes de mexer nos sites.</p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${drag ? "border-blue-500 bg-blue-500/10" : file ? "border-emerald-600 bg-emerald-950/20" : "border-slate-700 bg-slate-900/60 hover:border-slate-500"}`}
        >
          <input ref={inputRef} type="file" accept=".pdf,application/pdf,image/*,.doc,.docx,.txt" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {file ? (
            <div><div className="text-base font-bold text-emerald-300">{file.name}</div><div className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB · clica para trocar</div></div>
          ) : (
            <div><div className="text-base font-bold">Arrasta o PDF para aqui ou clica para escolher</div><div className="mt-1 text-xs text-slate-400">PDF, imagens, Word ou texto · até 25 MB</div></div>
          )}
        </div>

        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota opcional (ex.: o que queres que eu veja no documento)" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" />

        <button onClick={send} disabled={busy || !file} className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50">
          {busy ? "A enviar…" : "Enviar ficheiro"}
        </button>

        {msg && <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-200">{msg}</div>}
        {err && <div className="rounded-xl border border-rose-800 bg-rose-950/40 p-3 text-sm text-rose-200">{err}</div>}

        {list.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Ficheiros recebidos</div>
            <ul className="space-y-1.5 text-sm">
              {list.map((it) => (
                <li key={it.id} className="flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2">
                  <span className="truncate">#{it.id} · {it.filename} <span className="text-slate-500">({(it.sizeBytes / 1024).toFixed(0)} KB)</span>{it.note && <span className="text-slate-400"> — {it.note}</span>}</span>
                  <a href={`/api/upload?id=${it.id}`} target="_blank" className="ml-3 shrink-0 text-xs text-blue-400 hover:underline">abrir</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
