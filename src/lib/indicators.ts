export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalAnalysisResult {
  currentPrice: number;
  change: number;
  changePercent: number;
  high52Week: number;
  low52Week: number;
  rsi14: number;
  rsiSignal: "Sobrevendido (Oportunidade)" | "Neutro" | "Sobrecomprado (Alerta de Venda)";
  ema20: number;
  sma50: number;
  sma200: number;
  goldenCross: boolean;
  deathCross: boolean;
  maTrend: "Fortemente Altista" | "Altista" | "Neutra" | "Baixista" | "Fortemente Baixista";
  macd: {
    line: number;
    signal: number;
    histogram: number;
    status: "Cruzamento Altista (Compra)" | "Cruzamento Baixista (Venda)" | "Neutro";
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    position: "Banda Superior (Resistência)" | "Meio da Banda" | "Banda Inferior (Suporte)";
  };
  stochastic: {
    k: number;
    d: number;
    status: "Sobrevendido (<20)" | "Neutro" | "Sobrecomprado (>80)";
  };
  atr14: number;
  supportLevel: number;
  resistanceLevel: number;
  volumeTrend: "Volume Acima da Média (Forte Validação)" | "Volume Normal" | "Volume Fraco (Baixa Convicção)";
  adx: { value: number; plusDI: number; minusDI: number; strength: "Tendência Forte" | "Tendência Moderada" | "Sem Tendência (Lateral)"; direction: "Compradores Dominam" | "Vendedores Dominam" | "Equilíbrio" };
  williamsR: { value: number; status: "Sobrevendido" | "Neutro" | "Sobrecomprado" };
  cci: { value: number; status: "Sobrevendido (<-100)" | "Neutro" | "Sobrecomprado (>100)" };
  obv: { trend: "Acumulação (Fluxo Comprador)" | "Distribuição (Fluxo Vendedor)" | "Neutro"; divergence: string | null };
  roc: { value: number; status: "Momentum Positivo" | "Momentum Negativo" | "Momentum Neutro" };
  ichimoku: { tenkan: number; kijun: number; spanA: number; spanB: number; position: "Acima da Nuvem (Altista)" | "Dentro da Nuvem (Indefinido)" | "Abaixo da Nuvem (Baixista)"; tkCross: "Cruzamento Altista" | "Cruzamento Baixista" | "Sem Cruzamento" };
  parabolicSar: { value: number; signal: "SAR Abaixo do Preço (Compra)" | "SAR Acima do Preço (Venda)" };
  vwap: { value: number; position: "Preço Acima do VWAP" | "Preço Abaixo do VWAP" };
  fibonacci: { high: number; low: number; levels: { label: string; price: number }[]; nearest: string };
  signalsBullish: number;
  signalsBearish: number;
  signalsTotal: number;
  scoreTecnico: number; // 0 - 100
}

export interface FundamentalData {
  peRatio?: number;
  forwardPE?: number;
  priceToBook?: number;
  dividendYield?: number;
  marketCap?: number;
  enterpriseToEbitda?: number;
  debtToEquity?: number;
  returnOnEquity?: number;
  profitMargin?: number;
  grahamValue?: number;
  dcfFairValue?: number;
  valuationStatus: "Subavaliada (Grande Desconto)" | "Preço Justo" | "Sobreavaliada (Risco Elevado)";
  scoreFundamental: number; // 0 - 100
}

export interface StockExpectationVerdict {
  verdict: "FORTE_SUBIDA" | "SUBIDA_MODERADA" | "NEUTRO" | "QUEDA_MODERADA" | "FORTE_QUEDA";
  verdictLabel: string;
  verdictEmoji: string;
  verdictColor: string; // Tailwind color classes
  direction: "SOBE" | "DESCE" | "NEUTRO";
  probability: number; // e.g. 78%
  confidenceLevel: "Alta Convicção" | "Média Convicção" | "Baixa / Cautela";
  overallScore: number; // 0 - 100
  timeHorizonShort: {
    period: "1 a 4 Semanas (Swing Trade)";
    targetPrice: number;
    targetPercent: number;
    stopLossPrice: number;
    riskPercent: number;
    riskRewardRatio: string;
  };
  timeHorizonMedium: {
    period: "1 a 6 Meses (Posição)";
    targetPrice: number;
    targetPercent: number;
  };
  keyBullishFactors: string[];
  keyBearishRisks: string[];
  tradingPlan: string;
}

export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(data[i]);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const sum = slice.reduce((a, b) => a + b, 0);
      result.push(Number((sum / period).toFixed(2)));
    }
  }
  return result;
}

export function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [];
  if (data.length === 0) return result;
  result.push(data[0]);

  for (let i = 1; i < data.length; i++) {
    const val = data[i] * k + result[i - 1] * (1 - k);
    result.push(Number(val.toFixed(2)));
  }
  return result;
}

export function calculateRSI(closes: number[], period: number = 14): number[] {
  if (closes.length <= period) {
    return closes.map(() => 50);
  }

  const rsi: number[] = new Array(period).fill(50);
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const firstRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(Number((100 - 100 / (1 + firstRs)).toFixed(2)));

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(Number((100 - 100 / (1 + rs)).toFixed(2)));
    }
  }

  return rsi;
}

export function calculateMACD(closes: number[]): { line: number[]; signal: number[]; histogram: number[] } {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdLine = ema12.map((val, idx) => Number((val - (ema26[idx] || val)).toFixed(2)));
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((val, idx) => Number((val - (signalLine[idx] || val)).toFixed(2)));

  return { line: macdLine, signal: signalLine, histogram };
}

export function calculateBollingerBands(closes: number[], period: number = 20, stdDevMult: number = 2) {
  const sma = calculateSMA(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(closes[i]);
      lower.push(closes[i]);
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      upper.push(Number((mean + stdDev * stdDevMult).toFixed(2)));
      lower.push(Number((mean - stdDev * stdDevMult).toFixed(2)));
    }
  }

  return { middle: sma, upper, lower };
}

export function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
  if (closes.length < 2) return 1.0;
  const trs: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trs.push(tr);
  }
  const slice = trs.slice(-period);
  const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
  return Number(avg.toFixed(2));
}


export function calculateADX(highs: number[], lows: number[], closes: number[], period = 14) {
  const n = closes.length;
  if (n < period + 2) return { adx: 20, plusDI: 20, minusDI: 20 };
  const tr: number[] = [], pdm: number[] = [], ndm: number[] = [];
  for (let i = 1; i < n; i++) {
    const up = highs[i] - highs[i - 1];
    const down = lows[i - 1] - lows[i];
    pdm.push(up > down && up > 0 ? up : 0);
    ndm.push(down > up && down > 0 ? down : 0);
    tr.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
  }
  const smooth = (arr: number[]) => {
    const out: number[] = [];
    let s = arr.slice(0, period).reduce((a, b) => a + b, 0);
    out.push(s);
    for (let i = period; i < arr.length; i++) { s = s - s / period + arr[i]; out.push(s); }
    return out;
  };
  const sTR = smooth(tr), sP = smooth(pdm), sN = smooth(ndm);
  const dx: number[] = [];
  let lastP = 0, lastN = 0;
  for (let i = 0; i < sTR.length; i++) {
    const p = sTR[i] ? (sP[i] / sTR[i]) * 100 : 0;
    const q = sTR[i] ? (sN[i] / sTR[i]) * 100 : 0;
    lastP = p; lastN = q;
    dx.push(p + q ? (Math.abs(p - q) / (p + q)) * 100 : 0);
  }
  const adxSlice = dx.slice(-period);
  const adx = adxSlice.reduce((a, b) => a + b, 0) / Math.max(1, adxSlice.length);
  return { adx: Number(adx.toFixed(1)), plusDI: Number(lastP.toFixed(1)), minusDI: Number(lastN.toFixed(1)) };
}

export function calculateParabolicSAR(highs: number[], lows: number[], step = 0.02, max = 0.2): number {
  const n = highs.length;
  if (n < 3) return lows[n - 1] || 0;
  let uptrend = highs[1] > highs[0];
  let sar = uptrend ? lows[0] : highs[0];
  let ep = uptrend ? highs[1] : lows[1];
  let af = step;
  for (let i = 2; i < n; i++) {
    sar = sar + af * (ep - sar);
    if (uptrend) {
      sar = Math.min(sar, lows[i - 1], lows[i - 2]);
      if (lows[i] < sar) { uptrend = false; sar = ep; ep = lows[i]; af = step; }
      else if (highs[i] > ep) { ep = highs[i]; af = Math.min(max, af + step); }
    } else {
      sar = Math.max(sar, highs[i - 1], highs[i - 2]);
      if (highs[i] > sar) { uptrend = true; sar = ep; ep = highs[i]; af = step; }
      else if (lows[i] < ep) { ep = lows[i]; af = Math.min(max, af + step); }
    }
  }
  return Number(sar.toFixed(2));
}

export function calculateTechnicalAnalysis(history: PricePoint[]): TechnicalAnalysisResult {
  if (!history || history.length === 0) {
    return {
      currentPrice: 100,
      change: 0,
      changePercent: 0,
      high52Week: 120,
      low52Week: 80,
      rsi14: 50,
      rsiSignal: "Neutro",
      ema20: 100,
      sma50: 100,
      sma200: 100,
      goldenCross: false,
      deathCross: false,
      maTrend: "Neutra",
      macd: { line: 0, signal: 0, histogram: 0, status: "Neutro" },
      bollingerBands: { upper: 105, middle: 100, lower: 95, position: "Meio da Banda" },
      stochastic: { k: 50, d: 50, status: "Neutro" },
      atr14: 2.5,
      supportLevel: 95,
      resistanceLevel: 105,
      volumeTrend: "Volume Normal",
      adx: { value: 20, plusDI: 20, minusDI: 20, strength: "Sem Tendência (Lateral)", direction: "Equilíbrio" },
      williamsR: { value: -50, status: "Neutro" },
      cci: { value: 0, status: "Neutro" },
      obv: { trend: "Neutro", divergence: null },
      roc: { value: 0, status: "Momentum Neutro" },
      ichimoku: { tenkan: 100, kijun: 100, spanA: 100, spanB: 100, position: "Dentro da Nuvem (Indefinido)", tkCross: "Sem Cruzamento" },
      parabolicSar: { value: 98, signal: "SAR Abaixo do Preço (Compra)" },
      vwap: { value: 100, position: "Preço Acima do VWAP" },
      fibonacci: { high: 120, low: 80, levels: [], nearest: "50%" },
      signalsBullish: 0,
      signalsBearish: 0,
      signalsTotal: 0,
      scoreTecnico: 50
    };
  }

  const closes = history.map(h => h.close);
  const highs = history.map(h => h.high);
  const lows = history.map(h => h.low);
  const volumes = history.map(h => h.volume);

  const currentPrice = closes[closes.length - 1];
  const prevPrice = closes.length > 1 ? closes[closes.length - 2] : currentPrice;
  const change = Number((currentPrice - prevPrice).toFixed(2));
  const changePercent = Number(((change / prevPrice) * 100).toFixed(2));

  const high52Week = Math.max(...highs);
  const low52Week = Math.min(...lows);

  // Indicators
  const rsiSeries = calculateRSI(closes, 14);
  const currentRsi = rsiSeries[rsiSeries.length - 1];
  let rsiSignal: TechnicalAnalysisResult["rsiSignal"] = "Neutro";
  if (currentRsi <= 32) rsiSignal = "Sobrevendido (Oportunidade)";
  else if (currentRsi >= 68) rsiSignal = "Sobrecomprado (Alerta de Venda)";

  const ema20Series = calculateEMA(closes, 20);
  const sma50Series = calculateSMA(closes, 50);
  const sma200Series = calculateSMA(closes, Math.min(200, closes.length));

  const ema20 = ema20Series[ema20Series.length - 1];
  const sma50 = sma50Series[sma50Series.length - 1];
  const sma200 = sma200Series[sma200Series.length - 1];

  const goldenCross = sma50 > sma200 && (sma50Series[sma50Series.length - 5] || 0) <= (sma200Series[sma200Series.length - 5] || 0);
  const deathCross = sma50 < sma200 && (sma50Series[sma50Series.length - 5] || 0) >= (sma200Series[sma200Series.length - 5] || 0);

  let maTrend: TechnicalAnalysisResult["maTrend"] = "Neutra";
  if (currentPrice > ema20 && ema20 > sma50 && sma50 > sma200) {
    maTrend = "Fortemente Altista";
  } else if (currentPrice > sma50) {
    maTrend = "Altista";
  } else if (currentPrice < ema20 && ema20 < sma50 && sma50 < sma200) {
    maTrend = "Fortemente Baixista";
  } else if (currentPrice < sma50) {
    maTrend = "Baixista";
  }

  // MACD
  const macdData = calculateMACD(closes);
  const macdLine = macdData.line[macdData.line.length - 1];
  const macdSignal = macdData.signal[macdData.signal.length - 1];
  const macdHist = macdData.histogram[macdData.histogram.length - 1];
  let macdStatus: TechnicalAnalysisResult["macd"]["status"] = "Neutro";
  if (macdHist > 0 && macdLine > macdSignal) {
    macdStatus = "Cruzamento Altista (Compra)";
  } else if (macdHist < 0 && macdLine < macdSignal) {
    macdStatus = "Cruzamento Baixista (Venda)";
  }

  // Bollinger Bands
  const bb = calculateBollingerBands(closes, 20, 2);
  const bbUpper = bb.upper[bb.upper.length - 1];
  const bbMiddle = bb.middle[bb.middle.length - 1];
  const bbLower = bb.lower[bb.lower.length - 1];
  let bbPos: TechnicalAnalysisResult["bollingerBands"]["position"] = "Meio da Banda";
  if (currentPrice >= bbUpper * 0.985) bbPos = "Banda Superior (Resistência)";
  else if (currentPrice <= bbLower * 1.015) bbPos = "Banda Inferior (Suporte)";

  // Stochastic (14)
  const recentHigh14 = Math.max(...highs.slice(-14));
  const recentLow14 = Math.min(...lows.slice(-14));
  const stochK = recentHigh14 === recentLow14 ? 50 : Number((((currentPrice - recentLow14) / (recentHigh14 - recentLow14)) * 100).toFixed(1));
  const kSeries: number[] = [];
  for (let i = Math.max(14, closes.length - 3); i <= closes.length; i++) {
    const hh = Math.max(...highs.slice(i - 14, i)); const ll = Math.min(...lows.slice(i - 14, i));
    kSeries.push(hh === ll ? 50 : ((closes[i - 1] - ll) / (hh - ll)) * 100);
  }
  const stochD = Number((kSeries.reduce((a, b) => a + b, 0) / Math.max(1, kSeries.length)).toFixed(1));
  let stochStatus: TechnicalAnalysisResult["stochastic"]["status"] = "Neutro";
  if (stochK <= 20) stochStatus = "Sobrevendido (<20)";
  else if (stochK >= 80) stochStatus = "Sobrecomprado (>80)";

  // ATR
  const atr14 = calculateATR(highs, lows, closes, 14);

  // Support & Resistance (swing levels)
  const recentSlice = history.slice(-30);
  const sortedLows = [...recentSlice.map(p => p.low)].sort((a, b) => a - b);
  const sortedHighs = [...recentSlice.map(p => p.high)].sort((a, b) => b - a);
  const supportLevel = Number((sortedLows[Math.floor(sortedLows.length * 0.15)] || currentPrice * 0.95).toFixed(2));
  const resistanceLevel = Number((sortedHighs[Math.floor(sortedHighs.length * 0.15)] || currentPrice * 1.05).toFixed(2));

  // Volume trend
  const recentVolAvg = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const longVolAvg = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  let volumeTrend: TechnicalAnalysisResult["volumeTrend"] = "Volume Normal";
  if (recentVolAvg > longVolAvg * 1.25) volumeTrend = "Volume Acima da Média (Forte Validação)";
  else if (recentVolAvg < longVolAvg * 0.75) volumeTrend = "Volume Fraco (Baixa Convicção)";


  // ADX / DMI
  const adxRaw = calculateADX(highs, lows, closes, 14);
  const adxStrength: TechnicalAnalysisResult["adx"]["strength"] = adxRaw.adx >= 25 ? "Tendência Forte" : adxRaw.adx >= 18 ? "Tendência Moderada" : "Sem Tendência (Lateral)";
  const adxDirection: TechnicalAnalysisResult["adx"]["direction"] = adxRaw.plusDI > adxRaw.minusDI * 1.1 ? "Compradores Dominam" : adxRaw.minusDI > adxRaw.plusDI * 1.1 ? "Vendedores Dominam" : "Equilíbrio";

  // Williams %R (14)
  const wr = recentHigh14 === recentLow14 ? -50 : Number((((recentHigh14 - currentPrice) / (recentHigh14 - recentLow14)) * -100).toFixed(1));
  const wrStatus: TechnicalAnalysisResult["williamsR"]["status"] = wr <= -80 ? "Sobrevendido" : wr >= -20 ? "Sobrecomprado" : "Neutro";

  // CCI (20)
  const tp = history.map(h => (h.high + h.low + h.close) / 3);
  const tp20 = tp.slice(-20);
  const tpMean = tp20.reduce((a, b) => a + b, 0) / tp20.length;
  const meanDev = tp20.reduce((a, b) => a + Math.abs(b - tpMean), 0) / tp20.length || 1;
  const cciVal = Number((((tp[tp.length - 1] - tpMean) / (0.015 * meanDev))).toFixed(1));
  const cciStatus: TechnicalAnalysisResult["cci"]["status"] = cciVal < -100 ? "Sobrevendido (<-100)" : cciVal > 100 ? "Sobrecomprado (>100)" : "Neutro";

  // OBV
  let obv = 0; const obvSeries: number[] = [0];
  for (let i = 1; i < closes.length; i++) { obv += closes[i] > closes[i - 1] ? volumes[i] : closes[i] < closes[i - 1] ? -volumes[i] : 0; obvSeries.push(obv); }
  const obvNow = obvSeries[obvSeries.length - 1]; const obvPrev = obvSeries[Math.max(0, obvSeries.length - 11)];
  const priceNow = closes[closes.length - 1]; const pricePrev = closes[Math.max(0, closes.length - 11)];
  const obvTrend: TechnicalAnalysisResult["obv"]["trend"] = obvNow > obvPrev * 1.0001 + 1 ? "Acumulação (Fluxo Comprador)" : obvNow < obvPrev - 1 ? "Distribuição (Fluxo Vendedor)" : "Neutro";
  let obvDiv: string | null = null;
  if (priceNow < pricePrev && obvNow > obvPrev) obvDiv = "Divergência Altista: preço cai mas OBV sobe (acumulação oculta)";
  if (priceNow > pricePrev && obvNow < obvPrev) obvDiv = "Divergência Baixista: preço sobe mas OBV cai (distribuição oculta)";

  // ROC (12)
  const rocBase = closes[Math.max(0, closes.length - 13)] || currentPrice;
  const rocVal = Number((((currentPrice - rocBase) / rocBase) * 100).toFixed(2));
  const rocStatus: TechnicalAnalysisResult["roc"]["status"] = rocVal > 1.5 ? "Momentum Positivo" : rocVal < -1.5 ? "Momentum Negativo" : "Momentum Neutro";

  // Ichimoku (9, 26, 52)
  const mid = (arr: number[], p: number, hs: number[], ls: number[]) => { const h = Math.max(...hs.slice(-p)); const l = Math.min(...ls.slice(-p)); return (h + l) / 2; };
  const tenkan = Number(mid(closes, 9, highs, lows).toFixed(2));
  const kijun = Number(mid(closes, 26, highs, lows).toFixed(2));
  const spanA = Number(((tenkan + kijun) / 2).toFixed(2));
  const spanB = Number(mid(closes, Math.min(52, closes.length), highs, lows).toFixed(2));
  const cloudTop = Math.max(spanA, spanB), cloudBottom = Math.min(spanA, spanB);
  const ichiPos: TechnicalAnalysisResult["ichimoku"]["position"] = currentPrice > cloudTop ? "Acima da Nuvem (Altista)" : currentPrice < cloudBottom ? "Abaixo da Nuvem (Baixista)" : "Dentro da Nuvem (Indefinido)";
  const tkCross: TechnicalAnalysisResult["ichimoku"]["tkCross"] = tenkan > kijun ? "Cruzamento Altista" : tenkan < kijun ? "Cruzamento Baixista" : "Sem Cruzamento";

  // Parabolic SAR
  const sarVal = calculateParabolicSAR(highs, lows);
  const sarSignal: TechnicalAnalysisResult["parabolicSar"]["signal"] = sarVal < currentPrice ? "SAR Abaixo do Preço (Compra)" : "SAR Acima do Preço (Venda)";

  // VWAP (últimas 20 sessões)
  const last20 = history.slice(-20);
  const vwapNum = last20.reduce((a, h) => a + ((h.high + h.low + h.close) / 3) * h.volume, 0);
  const vwapDen = last20.reduce((a, h) => a + h.volume, 0) || 1;
  const vwapVal = Number((vwapNum / vwapDen).toFixed(2));
  const vwapPos: TechnicalAnalysisResult["vwap"]["position"] = currentPrice >= vwapVal ? "Preço Acima do VWAP" : "Preço Abaixo do VWAP";

  // Fibonacci (swing 60 sessões)
  const sw = history.slice(-60);
  const fibHigh = Math.max(...sw.map(p => p.high)); const fibLow = Math.min(...sw.map(p => p.low));
  const fibRange = fibHigh - fibLow || 1;
  const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1].map(r => ({ label: `${(r * 100).toFixed(1)}%`, price: Number((fibHigh - fibRange * r).toFixed(2)) }));
  const nearestFib = fibLevels.reduce((best, l) => Math.abs(l.price - currentPrice) < Math.abs(best.price - currentPrice) ? l : best, fibLevels[0]).label;

  // Contagem de sinais (confluência)
  let bullSignals = 0, bearSignals = 0;
  const vote = (b: boolean | null) => { if (b === true) bullSignals++; else if (b === false) bearSignals++; };
  vote(currentRsi < 35 ? true : currentRsi > 68 ? false : null);
  vote(macdStatus.includes("Altista") ? true : macdStatus.includes("Baixista") ? false : null);
  vote(maTrend.includes("Altista") ? true : maTrend.includes("Baixista") ? false : null);
  vote(bbPos.includes("Inferior") ? true : bbPos.includes("Superior") ? false : null);
  vote(stochK <= 20 ? true : stochK >= 80 ? false : null);
  vote(adxDirection === "Compradores Dominam" ? true : adxDirection === "Vendedores Dominam" ? false : null);
  vote(wrStatus === "Sobrevendido" ? true : wrStatus === "Sobrecomprado" ? false : null);
  vote(cciStatus.includes("Sobrevendido") ? true : cciStatus.includes("Sobrecomprado") ? false : null);
  vote(obvTrend.includes("Acumulação") ? true : obvTrend.includes("Distribuição") ? false : null);
  vote(rocStatus === "Momentum Positivo" ? true : rocStatus === "Momentum Negativo" ? false : null);
  vote(ichiPos.includes("Acima") ? true : ichiPos.includes("Abaixo") ? false : null);
  vote(tkCross === "Cruzamento Altista" ? true : tkCross === "Cruzamento Baixista" ? false : null);
  vote(sarSignal.includes("Compra") ? true : false);
  vote(vwapPos.includes("Acima") ? true : false);
  vote(goldenCross ? true : deathCross ? false : null);

  // Score Técnico (0 - 100)
  let techScore = 50;

  // RSI points
  if (currentRsi < 30) techScore += 18; // oversold rebound potential
  else if (currentRsi < 45) techScore += 8;
  else if (currentRsi > 70) techScore -= 18; // overbought risk
  else if (currentRsi > 60) techScore -= 5;

  // MA trend points
  if (maTrend === "Fortemente Altista") techScore += 22;
  else if (maTrend === "Altista") techScore += 12;
  else if (maTrend === "Fortemente Baixista") techScore -= 22;
  else if (maTrend === "Baixista") techScore -= 12;

  // MACD points
  if (macdStatus === "Cruzamento Altista (Compra)") techScore += 12;
  else if (macdStatus === "Cruzamento Baixista (Venda)") techScore -= 12;

  // Bollinger position
  if (bbPos === "Banda Inferior (Suporte)") techScore += 10;
  else if (bbPos === "Banda Superior (Resistência)") techScore -= 10;

  // Golden / Death Cross
  if (goldenCross) techScore += 15;
  if (deathCross) techScore -= 15;

  // Novos indicadores (confluência)
  if (adxDirection === "Compradores Dominam" && adxRaw.adx >= 20) techScore += 8;
  else if (adxDirection === "Vendedores Dominam" && adxRaw.adx >= 20) techScore -= 8;
  if (ichiPos.includes("Acima")) techScore += 7; else if (ichiPos.includes("Abaixo")) techScore -= 7;
  if (tkCross === "Cruzamento Altista") techScore += 3; else if (tkCross === "Cruzamento Baixista") techScore -= 3;
  if (obvTrend.includes("Acumulação")) techScore += 5; else if (obvTrend.includes("Distribuição")) techScore -= 5;
  if (obvDiv?.startsWith("Divergência Altista")) techScore += 4; if (obvDiv?.startsWith("Divergência Baixista")) techScore -= 4;
  if (rocStatus === "Momentum Positivo") techScore += 4; else if (rocStatus === "Momentum Negativo") techScore -= 4;
  if (sarSignal.includes("Compra")) techScore += 4; else techScore -= 4;
  if (vwapPos.includes("Acima")) techScore += 3; else techScore -= 3;
  if (wrStatus === "Sobrevendido") techScore += 4; else if (wrStatus === "Sobrecomprado") techScore -= 4;
  if (cciStatus.includes("Sobrevendido")) techScore += 4; else if (cciStatus.includes("Sobrecomprado")) techScore -= 4;
  if (stochK <= 20) techScore += 4; else if (stochK >= 80) techScore -= 4;

  techScore = Math.max(5, Math.min(95, Math.round(techScore)));

  return {
    currentPrice,
    change,
    changePercent,
    high52Week,
    low52Week,
    rsi14: currentRsi,
    rsiSignal,
    ema20,
    sma50,
    sma200,
    goldenCross,
    deathCross,
    maTrend,
    macd: { line: macdLine, signal: macdSignal, histogram: macdHist, status: macdStatus },
    bollingerBands: { upper: bbUpper, middle: bbMiddle, lower: bbLower, position: bbPos },
    stochastic: { k: stochK, d: stochD, status: stochStatus },
    atr14,
    supportLevel,
    resistanceLevel,
    volumeTrend,
    adx: { value: adxRaw.adx, plusDI: adxRaw.plusDI, minusDI: adxRaw.minusDI, strength: adxStrength, direction: adxDirection },
    williamsR: { value: wr, status: wrStatus },
    cci: { value: cciVal, status: cciStatus },
    obv: { trend: obvTrend, divergence: obvDiv },
    roc: { value: rocVal, status: rocStatus },
    ichimoku: { tenkan, kijun, spanA, spanB, position: ichiPos, tkCross },
    parabolicSar: { value: sarVal, signal: sarSignal },
    vwap: { value: vwapVal, position: vwapPos },
    fibonacci: { high: fibHigh, low: fibLow, levels: fibLevels, nearest: nearestFib },
    signalsBullish: bullSignals,
    signalsBearish: bearSignals,
    signalsTotal: bullSignals + bearSignals,
    scoreTecnico: techScore
  };
}

export function evaluateStockExpectation(
  tech: TechnicalAnalysisResult,
  fund: FundamentalData,
  ticker: string,
  news?: { scoreImpact: number; label: string; positive: number; negative: number }
): StockExpectationVerdict {
  // Consolidated score weighted: 60% Technical, 40% Fundamental, + ajuste de sentimento noticioso (-8..+8)
  const newsAdj = news?.scoreImpact || 0;
  const overallScore = Math.max(3, Math.min(97, Math.round(tech.scoreTecnico * 0.6 + fund.scoreFundamental * 0.4 + newsAdj)));

  let verdict: StockExpectationVerdict["verdict"];
  let verdictLabel: string;
  let verdictEmoji: string;
  let verdictColor: string;
  let direction: StockExpectationVerdict["direction"];
  let probability: number;
  let confidenceLevel: StockExpectationVerdict["confidenceLevel"];

  if (overallScore >= 76) {
    verdict = "FORTE_SUBIDA";
    verdictLabel = "FORTE SUBIDA (COMPRA FORTE / STRONG BULLISH)";
    verdictEmoji = "🚀";
    verdictColor = "emerald";
    direction = "SOBE";
    probability = Math.min(94, 75 + Math.round((overallScore - 75) * 0.8));
    confidenceLevel = "Alta Convicção";
  } else if (overallScore >= 58) {
    verdict = "SUBIDA_MODERADA";
    verdictLabel = "SUBIDA MODERADA (VIÉS ALTISTA / LEAN BULLISH)";
    verdictEmoji = "📈";
    verdictColor = "green";
    direction = "SOBE";
    probability = Math.min(74, 60 + Math.round((overallScore - 58) * 0.8));
    confidenceLevel = "Média Convicção";
  } else if (overallScore >= 43) {
    verdict = "NEUTRO";
    verdictLabel = "NEUTRO / LATERALIZAÇÃO (AGUARDAR CONFIRMAÇÃO)";
    verdictEmoji = "⚖️";
    verdictColor = "amber";
    direction = "NEUTRO";
    probability = 50;
    confidenceLevel = "Baixa / Cautela";
  } else if (overallScore >= 26) {
    verdict = "QUEDA_MODERADA";
    verdictLabel = "QUEDA MODERADA (VIÉS BAIXISTA / LEAN BEARISH)";
    verdictEmoji = "📉";
    verdictColor = "orange";
    direction = "DESCE";
    probability = Math.min(74, 60 + Math.round((43 - overallScore) * 0.8));
    confidenceLevel = "Média Convicção";
  } else {
    verdict = "FORTE_QUEDA";
    verdictLabel = "FORTE QUEDA (VENDA / STRONG BEARISH)";
    verdictEmoji = "🔴";
    verdictColor = "rose";
    direction = "DESCE";
    probability = Math.min(95, 75 + Math.round((26 - overallScore) * 0.8));
    confidenceLevel = "Alta Convicção";
  }

  // Price targets calculation
  const current = tech.currentPrice;
  const atr = tech.atr14 || current * 0.02;

  let targetShortPrice = current;
  let stopLossPrice = current;
  let targetMediumPrice = current;

  if (direction === "SOBE") {
    targetShortPrice = Number(Math.max(tech.resistanceLevel, current + atr * 2.2).toFixed(2));
    stopLossPrice = Number(Math.min(tech.supportLevel, current - atr * 1.5).toFixed(2));
    targetMediumPrice = Number((current * (1 + (overallScore > 75 ? 0.18 : 0.09))).toFixed(2));
  } else if (direction === "DESCE") {
    targetShortPrice = Number(Math.min(tech.supportLevel, current - atr * 2.2).toFixed(2));
    stopLossPrice = Number(Math.max(tech.resistanceLevel, current + atr * 1.5).toFixed(2));
    targetMediumPrice = Number((current * (1 - (overallScore < 25 ? 0.16 : 0.08))).toFixed(2));
  } else {
    targetShortPrice = Number((current * 1.025).toFixed(2));
    stopLossPrice = Number((current * 0.975).toFixed(2));
    targetMediumPrice = Number((current * 1.04).toFixed(2));
  }

  const targetPercent = Number((((targetShortPrice - current) / current) * 100).toFixed(2));
  const riskPercent = Number((((stopLossPrice - current) / current) * 100).toFixed(2));
  const riskRewardVal = Math.abs(targetPercent / (riskPercent || 1)).toFixed(1);
  const targetMedPercent = Number((((targetMediumPrice - current) / current) * 100).toFixed(2));

  // Build Bullish & Bearish factor lists
  const bullish: string[] = [];
  const bearish: string[] = [];

  if (tech.rsi14 <= 35) bullish.push(`RSI(14) em ${tech.rsi14} indica forte condição de sobrevenda com potencial ressalto.`);
  if (tech.rsi14 >= 68) bearish.push(`RSI(14) em ${tech.rsi14} em zona de sobrecompra extrema (risco de correção imediata).`);

  if (tech.maTrend.includes("Altista")) bullish.push(`Preço acima das Médias Móveis principais (EMA 20 e SMA 50) com estrutura altista.`);
  if (tech.maTrend.includes("Baixista")) bearish.push(`Preço negociando sob pressão abaixo das médias de 50 e 200 períodos.`);

  if (tech.goldenCross) bullish.push(`Golden Cross recente: cruzamento altista da média de 50 dias sobre a de 200 dias.`);
  if (tech.deathCross) bearish.push(`Death Cross recente: sinal técnico perigoso com média de 50 cruzando abaixo da de 200.`);

  if (tech.macd.status.includes("Altista")) bullish.push(`Histograma MACD com expansão positiva e linha MACD acima da linha de sinal.`);
  if (tech.macd.status.includes("Baixista")) bearish.push(`Histograma MACD em território negativo confirmando aceleração vendedora.`);

  if (fund.valuationStatus.includes("Subavaliada")) bullish.push(`Valuation favorável: rácio P/L atrativo e modelo DCF sugerindo ação com desconto face ao valor intrínseco.`);
  if (fund.valuationStatus.includes("Sobreavaliada")) bearish.push(`Valuation esticado com múltiplos P/L elevados face à média histórica e pares do setor.`);

  if (tech.adx.direction === "Compradores Dominam" && tech.adx.value >= 20) bullish.push(`ADX em ${tech.adx.value} com +DI > -DI: tendência com força e compradores no controlo.`);
  if (tech.adx.direction === "Vendedores Dominam" && tech.adx.value >= 20) bearish.push(`ADX em ${tech.adx.value} com -DI > +DI: pressão vendedora com força de tendência.`);
  if (tech.ichimoku.position.includes("Acima")) bullish.push(`Preço acima da Nuvem Ichimoku (Kumo) — estrutura de tendência altista confirmada.`);
  if (tech.ichimoku.position.includes("Abaixo")) bearish.push(`Preço abaixo da Nuvem Ichimoku — resistência dinâmica por cima do preço.`);
  if (tech.obv.divergence) (tech.obv.divergence.startsWith("Divergência Altista") ? bullish : bearish).push(tech.obv.divergence + ".");
  if (tech.parabolicSar.signal.includes("Compra")) bullish.push(`Parabolic SAR (${tech.parabolicSar.value}) abaixo do preço a servir de trailing stop.`);
  else bearish.push(`Parabolic SAR (${tech.parabolicSar.value}) acima do preço — sinal de venda ativo.`);
  if (news && news.scoreImpact >= 2) bullish.push(`${news.label}: ${news.positive} notícias positivas vs ${news.negative} negativas nos últimos dias.`);
  if (news && news.scoreImpact <= -2) bearish.push(`${news.label}: ${news.negative} notícias negativas vs ${news.positive} positivas nos últimos dias.`);
  bullish.push(`Confluência: ${tech.signalsBullish} de ${tech.signalsTotal} indicadores a apontar para subida.`);
  bearish.push(`Confluência: ${tech.signalsBearish} de ${tech.signalsTotal} indicadores a apontar para queda.`);

  if (fund.dividendYield && fund.dividendYield > 3.0) bullish.push(`Yield de dividendo sólido de ${fund.dividendYield.toFixed(1)}% oferece suporte defensivo.`);

  if (bullish.length === 0) bullish.push("Manutenção do suporte crítico imediato e consolidação da base de preços.");
  if (bearish.length === 0) bearish.push("Possível desaceleração macroeconómica ou realização pontual de lucros após ganhos.");

  let tradingPlan = "";
  if (direction === "SOBE") {
    tradingPlan = `Estratégia Recomendada: Posicionamento comprador (LONG) junto aos níveis atuais ou em retração até ${tech.supportLevel}. Colocar Stop Loss rigoroso em ${stopLossPrice} (-${Math.abs(riskPercent)}%) e realizar lucros parciais no primeiro alvo em ${targetShortPrice} (+${Math.abs(targetPercent)}%). Rácio Risco/Retorno projetado de 1:${riskRewardVal}.`;
  } else if (direction === "DESCE") {
    tradingPlan = `Estratégia Recomendada: Evitar compras de momento ou considerar proteção/hedge. Se negociar vendido (SHORT), acionar na quebra de suporte com alvo em ${targetShortPrice} e Stop de proteção acima de ${stopLossPrice}.`;
  } else {
    tradingPlan = `Estratégia Recomendada: Aguardar que o preço quebre decisivamente a resistência (${tech.resistanceLevel}) ou o suporte (${tech.supportLevel}) com volume confirmatório antes de abrir novas posições direcionais.`;
  }

  return {
    verdict,
    verdictLabel,
    verdictEmoji,
    verdictColor,
    direction,
    probability,
    confidenceLevel,
    overallScore,
    timeHorizonShort: {
      period: "1 a 4 Semanas (Swing Trade)",
      targetPrice: targetShortPrice,
      targetPercent,
      stopLossPrice,
      riskPercent,
      riskRewardRatio: `1:${riskRewardVal}`
    },
    timeHorizonMedium: {
      period: "1 a 6 Meses (Posição)",
      targetPrice: targetMediumPrice,
      targetPercent: targetMedPercent
    },
    keyBullishFactors: bullish,
    keyBearishRisks: bearish,
    tradingPlan
  };
}
