import { FUNDAMENTAL_COLUMNS, FundamentalRaw } from "./fundamentals";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const SUFFIX_TO_TV: Record<string, string[]> = {
  LS: ["EURONEXT"], PA: ["EURONEXT"], AS: ["EURONEXT"], BR: ["EURONEXT"], IR: ["EURONEXT"], OL: ["EURONEXT", "OSE"],
  MI: ["MIL"], DE: ["XETR", "FWB"], F: ["FWB", "XETR"], VI: ["VIE"], L: ["LSE"], SA: ["BMFBOVESPA"], MC: ["BME"], T: ["TSE"], HK: ["HKEX"],
  SS: ["SSE"], SZ: ["SZSE"], BO: ["BSE"], NS: ["NSE"], AX: ["ASX"], ST: ["OMXSTO"], CO: ["OMXCOP"], HE: ["OMXHEL"], TO: ["TSX"], V: ["TSXV"], SW: ["SIX"],
  KS: ["KRX"], KQ: ["KRX"], TW: ["TWSE"], BA: ["BCBA"], JO: ["JSE"], SR: ["TADAWUL"], NZ: ["NZX"], SI: ["SGX"], AT: ["ATHEX"], WA: ["GPW"], MX: ["BMV"], SN: ["BCS"], BK: ["SET"], JK: ["IDX"], IS: ["BIST"], TA: ["TASE"], KL: ["MYX"],
};
const US_EX = ["NASDAQ", "NYSE", "AMEX", "OTC"];
const cache = new Map<string, { at: number; data: (FundamentalRaw & { __tv: string }) | null }>();
const TTL = 15 * 60 * 1000;

export async function fetchTradingViewFundamentals(symbol: string): Promise<(FundamentalRaw & { __tv: string }) | null> {
  const s = symbol.toUpperCase();
  const hit = cache.get(s); if (hit && Date.now() - hit.at < TTL) return hit.data;
  const dot = s.lastIndexOf(".");
  const base = (dot > 0 ? s.slice(0, dot) : s).replace(/-/g, ".");
  const suffix = dot > 0 ? s.slice(dot + 1) : "";
  const exchanges = SUFFIX_TO_TV[suffix] ?? (suffix ? [] : US_EX);
  if (!exchanges.length) return null;
  const tickers = exchanges.map(e => `${e}:${base}`);
  try {
    const res = await fetch("https://scanner.tradingview.com/global/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": UA, Origin: "https://www.tradingview.com", Referer: "https://www.tradingview.com/" },
      body: JSON.stringify({ symbols: { tickers }, columns: FUNDAMENTAL_COLUMNS }),
      signal: AbortSignal.timeout(10000), cache: "no-store",
    });
    if (!res.ok) { cache.set(s, { at: Date.now(), data: null }); return null; }
    const json = await res.json();
    const rows: { s: string; d: (number | string | null)[] }[] = json?.data ?? [];
    // Preferir a primeira exchange com close válido (ordem de prioridade)
    const row = tickers.map(t => rows.find(r => r.s === t)).find(r => r && typeof r.d[0] === "number") ?? rows[0];
    if (!row) { cache.set(s, { at: Date.now(), data: null }); return null; }
    const out: FundamentalRaw & { __tv: string } = { __tv: row.s };
    FUNDAMENTAL_COLUMNS.forEach((c, i) => { out[c] = row.d[i]; });
    cache.set(s, { at: Date.now(), data: out });
    return out;
  } catch { return null; }
}
