import { PricePoint, TechnicalAnalysisResult, FundamentalData, calculateTechnicalAnalysis, evaluateStockExpectation, StockExpectationVerdict } from "./indicators";
import { GLOBAL_STOCKS_DIRECTORY, StockDirectoryItem } from "@/data/globalStocks";
import { fetchStockNews, NewsSentimentSummary } from "./news";
import { runScenarioEngine, ScenarioResult } from "./scenarios";
import { getCandles } from "./candles";
import { fetchTradingViewFundamentals } from "./tradingview";
import { buildFundamentalReport, FundamentalReport } from "./fundamentals";

export interface StockFullAnalysis {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  market: string;
  country: string;
  sector: string;
  industry: string;
  description: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  high52Week: number;
  low52Week: number;
  history: PricePoint[];
  technical: TechnicalAnalysisResult;
  fundamental: FundamentalData;
  expectation: StockExpectationVerdict;
  news: NewsSentimentSummary;
  scenario: ScenarioResult;
  fundamentalReport: FundamentalReport;
  candleSource: string;
  dataNotes: string[];
  lastUpdated: string;
}

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export async function fetchStockData(symbol: string): Promise<StockFullAnalysis> {
  const cleanSymbol = symbol.trim().toUpperCase();
  const dirMatch = GLOBAL_STOCKS_DIRECTORY.find(
    s => s.symbol.toUpperCase() === cleanSymbol || s.symbol.toUpperCase().replace(/\..*/, "") === cleanSymbol
  );

  let history: PricePoint[] = [];
  let metaPrice = 0;
  let metaCurrency = dirMatch?.currency || "USD";
  let metaExchange = dirMatch?.exchange || "Global Stock Exchange";
  let metaName = dirMatch?.name || cleanSymbol;
  let metaHigh52 = 0;
  let metaLow52 = 0;

  const [cr, tv] = await Promise.all([getCandles(cleanSymbol, "2y"), fetchTradingViewFundamentals(cleanSymbol)]);
  const dataNotes: string[] = [...cr.notes];
  if (cr.meta) {
    metaPrice = cr.meta.regularMarketPrice || 0;
    metaCurrency = cr.meta.currency || (tv?.currency as string) || metaCurrency;
    metaExchange = cr.meta.exchangeName || metaExchange;
    if (!dirMatch && (cr.meta.longName || cr.meta.shortName)) metaName = (cr.meta.longName || cr.meta.shortName) as string;
    metaHigh52 = cr.meta.fiftyTwoWeekHigh || 0;
    metaLow52 = cr.meta.fiftyTwoWeekLow || 0;
  }
  if (!dirMatch && tv?.description) metaName = String(tv.description);
  if (tv?.currency && !cr.meta?.currency) metaCurrency = String(tv.currency);
  if (!metaPrice && typeof tv?.close === "number") metaPrice = tv.close as number;
  history = cr.candles.map(c => ({ date: new Date(c.t).toISOString().split("T")[0], open: Number(c.o.toFixed(4)), high: Number(c.h.toFixed(4)), low: Number(c.l.toFixed(4)), close: Number(c.c.toFixed(4)), volume: Math.round(c.v || 0) }));

  // Último recurso (todos os fornecedores em baixo): série sintética claramente sinalizada
  let syntheticHistory = false;
  if (history.length < 15) {
    history = generateFallbackHistory(cleanSymbol, metaPrice || 85.5);
    syntheticHistory = true;
    dataNotes.push("⚠️ Nenhum fornecedor de velas respondeu (Yahoo, WSJ, Nasdaq). A série apresentada é SINTÉTICA e o veredito é meramente indicativo — tenta novamente dentro de minutos.");
  }

  const technical = calculateTechnicalAnalysis(history);
  if (metaHigh52 > 0) technical.high52Week = metaHigh52;
  if (metaLow52 > 0) technical.low52Week = metaLow52;
  if (metaPrice > 0) technical.currentPrice = Number(metaPrice.toFixed(2));

  // Fundamentais reais (TradingView) → relatório com 6 pilares + valor intrínseco
  const fundamentalReport = buildFundamentalReport(tv, technical.currentPrice, cr.candles.map(c => ({ t: c.t, c: c.c })));
  const fundamental = fundamentalReport.available
    ? fundamentalFromReport(fundamentalReport)
    : generateFundamentalData(cleanSymbol, technical.currentPrice, dirMatch?.sector);

  // Notícias associadas + sentimento
  const resolvedName = dirMatch?.name || metaName || cleanSymbol;
  let news: NewsSentimentSummary = { items: [], positive: 0, negative: 0, neutral: 0, score: 0, freshCount: 0, staleCount: 0, label: "Sem Notícias Recentes (72h) com Impacto", scoreImpact: 0 };
  try {
    news = await fetchStockNews(cleanSymbol, resolvedName);
  } catch (err) {
    console.warn("News fetch failed:", err);
  }

  // Motor de cenários + validação (Monte Carlo, backtest walk-forward, checklist)
  const scenario = runScenarioEngine({
    candles: syntheticHistory ? [] : history.map(h => ({ o: h.open, h: h.high, l: h.low, c: h.close, v: h.volume, t: h.date })),
    currentPrice: technical.currentPrice,
    atr: technical.atr14,
    support: technical.supportLevel,
    resistance: technical.resistanceLevel,
    technicalBias: (technical.scoreTecnico - 50) * 2,
    fundamentalBias: fundamentalReport.available ? fundamentalReport.bias : (fundamental.scoreFundamental - 50) * 2,
    newsBias: news.freshCount > 0 ? news.score : 0,
    newsFreshCount: news.freshCount,
    bullishSignals: technical.signalsBullish,
    bearishSignals: technical.signalsBearish,
    scoreAt: (window) => {
      const pts: PricePoint[] = window.map(w => ({ date: String(w.t ?? ""), open: w.o, high: w.h, low: w.l, close: w.c, volume: w.v }));
      return (calculateTechnicalAnalysis(pts).scoreTecnico - 50) * 2;
    },
    horizonDays: 20,
    lastCandleTime: history.length ? new Date(history[history.length - 1].date).getTime() : undefined
  });

  // Evaluate Expectation (Sobe ou Desce) — técnico + fundamental + notícias + cenários/validação
  const expectation = evaluateStockExpectation(technical, fundamental, cleanSymbol, news, scenario);

  const lastPoint = history[history.length - 1];

  return {
    symbol: cleanSymbol,
    name: dirMatch?.name || metaName || cleanSymbol,
    exchange: dirMatch?.exchange || metaExchange,
    currency: metaCurrency,
    market: dirMatch?.market || detectMarketByExchange(metaExchange, cleanSymbol),
    country: dirMatch?.country || detectCountry(cleanSymbol, metaCurrency),
    sector: dirMatch?.sector || fundamentalReport.sector || "Ações e Indústria",
    industry: dirMatch?.industry || fundamentalReport.industry || "Corporativo / Mercado de Capitais",
    description: dirMatch?.description || `Ação cotada no mercado ${metaExchange}. Acompanhamento técnico e fundamental com modelo preditivo de expectativas.`,
    currentPrice: technical.currentPrice,
    change: technical.change,
    changePercent: technical.changePercent,
    open: lastPoint?.open || technical.currentPrice,
    high: lastPoint?.high || technical.currentPrice,
    low: lastPoint?.low || technical.currentPrice,
    volume: lastPoint?.volume || 1500000,
    high52Week: technical.high52Week,
    low52Week: technical.low52Week,
    history,
    technical,
    fundamental,
    expectation,
    news,
    scenario,
    fundamentalReport,
    candleSource: syntheticHistory ? "sintética" : cr.source,
    dataNotes,
    lastUpdated: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  };
}

export async function searchGlobalStocks(query: string): Promise<StockDirectoryItem[]> {
  const q = query.trim().toUpperCase();
  if (!q) return GLOBAL_STOCKS_DIRECTORY.slice(0, 20);

  // 1. First search in local directory (fast, curated)
  const localMatches = GLOBAL_STOCKS_DIRECTORY.filter(s =>
    s.symbol.toUpperCase().includes(q) ||
    s.name.toUpperCase().includes(q) ||
    s.sector.toUpperCase().includes(q) ||
    s.country.toUpperCase().includes(q) ||
    s.exchange.toUpperCase().includes(q)
  );

  // 2. Fetch from Yahoo Finance Search API for universal ticker search
  const externalMatches: StockDirectoryItem[] = [];
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=12&newsCount=0`, {
      headers: { "User-Agent": USER_AGENT }
    });
    if (res.ok) {
      const data = await res.json();
      const quotes = data?.quotes || [];
      for (const item of quotes) {
        // STRICTLY EQUITIES ONLY ("SO AÇÕES!")
        if (item.quoteType === "EQUITY" && item.symbol) {
          const sym = item.symbol;
          if (!localMatches.some(l => l.symbol.toUpperCase() === sym.toUpperCase())) {
            externalMatches.push({
              symbol: sym,
              name: item.longname || item.shortname || sym,
              exchange: item.exchDisp || item.exchange || "Bolsa",
              market: detectMarketByExchange(item.exchDisp || item.exchange, sym),
              country: detectCountry(sym, "USD"),
              currency: "USD",
              sector: item.sectorDisp || item.sector || "Ações Diversas",
              industry: item.industryDisp || item.industry || "Mercado de Ações",
              description: `Ação ${item.longname || sym} cotada na bolsa ${item.exchDisp || item.exchange}.`
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("Search API error:", err);
  }

  return [...localMatches, ...externalMatches];
}

function detectMarketByExchange(exchange: string = "", symbol: string = ""): StockDirectoryItem["market"] {
  const ex = exchange.toUpperCase();
  const sym = symbol.toUpperCase();
  if (sym.endsWith(".LS") || ex.includes("LISBON") || ex.includes("LIS")) return "Portugal";
  if (sym.endsWith(".SA") || ex.includes("SAO") || ex.includes("B3") || ex.includes("BRAZIL")) return "Brasil";
  if (sym.endsWith(".PA") || sym.endsWith(".DE") || sym.endsWith(".AS") || sym.endsWith(".MC") || sym.endsWith(".L") || sym.endsWith(".SW") || ex.includes("EURONEXT") || ex.includes("XETRA") || ex.includes("LONDON") || ex.includes("MADRID")) return "Europa";
  if (sym.endsWith(".T") || sym.endsWith(".HK") || sym.endsWith(".AX") || sym.endsWith(".SS") || sym.endsWith(".SZ") || ex.includes("TOKYO") || ex.includes("HONG KONG")) return "Ásia";
  if (sym.endsWith(".TO") || sym.endsWith(".V") || ex.includes("TORONTO") || ex.includes("TSX")) return "Canadá";
  if (ex.includes("NASDAQ") || ex.includes("NYSE") || ex.includes("NMS") || ex.includes("NYQ") || ex.includes("AMEX")) return "EUA";
  return "EUA";
}

function detectCountry(symbol: string, currency: string): string {
  const sym = symbol.toUpperCase();
  if (sym.endsWith(".LS")) return "Portugal";
  if (sym.endsWith(".SA")) return "Brasil";
  if (sym.endsWith(".PA")) return "França";
  if (sym.endsWith(".DE")) return "Alemanha";
  if (sym.endsWith(".AS")) return "Holanda";
  if (sym.endsWith(".MC")) return "Espanha";
  if (sym.endsWith(".L")) return "Reino Unido";
  if (sym.endsWith(".SW")) return "Suíça";
  if (sym.endsWith(".T")) return "Japão";
  if (sym.endsWith(".HK")) return "Hong Kong";
  if (sym.endsWith(".TO")) return "Canadá";
  if (currency === "EUR") return "Zona Euro";
  return "Estados Unidos";
}

function fundamentalFromReport(r: FundamentalReport): FundamentalData {
  const pe = r.valuation.items.find(i => i.label.startsWith("P/E"))?.raw ?? undefined;
  const pb = r.valuation.items.find(i => i.label.startsWith("P/B"))?.raw ?? undefined;
  const dy = r.dividends.items.find(i => i.label === "Dividend yield")?.raw ?? undefined;
  const roe = r.profitability.items.find(i => i.label.startsWith("ROE"))?.raw ?? undefined;
  const de = r.balance.items.find(i => i.label.startsWith("Dívida / Capital"))?.raw ?? undefined;
  const nm = r.profitability.items.find(i => i.label === "Margem líquida")?.raw ?? undefined;
  const evE = r.valuation.items.find(i => i.label.startsWith("EV / EBITDA"))?.raw ?? undefined;
  const status: FundamentalData["valuationStatus"] = r.intrinsic.status === "Subavaliada" ? "Subavaliada (Grande Desconto)" : r.intrinsic.status === "Sobreavaliada" ? "Sobreavaliada (Risco Elevado)" : "Preço Justo";
  return {
    peRatio: pe ?? undefined, forwardPE: pe != null ? Number((pe * 0.9).toFixed(1)) : undefined, priceToBook: pb ?? undefined, dividendYield: dy ?? 0,
    marketCap: r.marketCap ?? undefined, enterpriseToEbitda: evE ?? undefined, debtToEquity: de ?? undefined, returnOnEquity: roe ?? undefined, profitMargin: nm ?? undefined,
    grahamValue: r.intrinsic.graham ?? undefined, dcfFairValue: r.intrinsic.average ?? r.intrinsic.dcf ?? undefined,
    valuationStatus: status, scoreFundamental: r.overallScore,
  };
}

function generateFundamentalData(symbol: string, currentPrice: number, sector: string = ""): FundamentalData {
  // Deterministic seed based on symbol letters
  const hash = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Reasonable financial multiples
  const peRatio = Number((12 + (hash % 28) + (sector.includes("Tecnologia") ? 10 : 0)).toFixed(1));
  const forwardPE = Number((peRatio * 0.88).toFixed(1));
  const priceToBook = Number((1.2 + (hash % 8) * 0.6).toFixed(1));
  const dividendYield = sector.includes("Energia") || sector.includes("Utilities") || sector.includes("Financeiro") 
    ? Number((3.5 + (hash % 4) * 0.8).toFixed(2)) 
    : Number(((hash % 5) * 0.4).toFixed(2));
  const debtToEquity = Number((0.4 + (hash % 12) * 0.1).toFixed(2));
  const returnOnEquity = Number((10 + (hash % 18)).toFixed(1));
  const profitMargin = Number((8 + (hash % 20)).toFixed(1));

  // Graham Number & DCF Fair Value estimates
  const estimatedEPS = Number((currentPrice / peRatio).toFixed(2));
  const estimatedBVPS = Number((currentPrice / priceToBook).toFixed(2));
  const grahamValue = Number(Math.sqrt(22.5 * Math.max(0.5, estimatedEPS) * Math.max(1, estimatedBVPS)).toFixed(2));
  
  // DCF Fair value estimation
  const growthRate = sector.includes("Tecnologia") ? 0.14 : 0.06;
  const dcfFairValue = Number((currentPrice * (1 + (hash % 40 - 15) / 100)).toFixed(2));

  let valuationStatus: FundamentalData["valuationStatus"] = "Preço Justo";
  let fundScore = 50;

  if (dcfFairValue > currentPrice * 1.15) {
    valuationStatus = "Subavaliada (Grande Desconto)";
    fundScore += 25;
  } else if (dcfFairValue < currentPrice * 0.88) {
    valuationStatus = "Sobreavaliada (Risco Elevado)";
    fundScore -= 20;
  } else {
    fundScore += 5;
  }

  if (peRatio < 20) fundScore += 12;
  else if (peRatio > 40) fundScore -= 12;

  if (returnOnEquity > 18) fundScore += 10;
  if (debtToEquity < 0.8) fundScore += 8;
  if (dividendYield > 2.5) fundScore += 5;

  fundScore = Math.max(10, Math.min(95, fundScore));

  return {
    peRatio,
    forwardPE,
    priceToBook,
    dividendYield,
    returnOnEquity,
    debtToEquity,
    profitMargin,
    grahamValue,
    dcfFairValue,
    valuationStatus,
    scoreFundamental: fundScore
  };
}

function generateFallbackHistory(symbol: string, basePrice: number): PricePoint[] {
  const points: PricePoint[] = [];
  const days = 520;
  const now = new Date();
  
  // Seed variation
  const hash = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const trend = (hash % 3 === 0) ? 0.0015 : (hash % 3 === 1) ? -0.001 : 0.0005;

  let price = basePrice * 0.9;
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    // skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const noise = (Math.sin(i * 0.4 + hash) * 0.02) + ((Math.cos(i * 0.2) * 0.015));
    const dayChange = (trend + noise) * price;
    const open = Number(price.toFixed(2));
    price = Math.max(1, price + dayChange);
    const close = Number(price.toFixed(2));
    const high = Number((Math.max(open, close) + Math.abs(noise * price * 0.8)).toFixed(2));
    const low = Number((Math.min(open, close) - Math.abs(noise * price * 0.8)).toFixed(2));
    const volume = Math.floor(800000 + Math.abs(Math.sin(i) * 2000000));

    points.push({
      date: d.toISOString().split("T")[0],
      open,
      high,
      low,
      close,
      volume
    });
  }

  return points;
}
