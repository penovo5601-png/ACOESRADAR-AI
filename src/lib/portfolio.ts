import { fetchEuroUniverse, type UniverseRow } from "./peers";
import { expectedReturn12m } from "./guide";

type U = UniverseRow;
export type PortfolioProfile = "TATICA" | "CONSERVADORA" | "EQUILIBRADA" | "CRESCIMENTO";

export interface Thesis { believe: string[]; catalysts: string[]; exit: string[]; risks: string[]; semaforo: { fundamentals: "V" | "A" | "R"; trend: "V" | "A" | "R"; levels: "V" | "A" | "R"; mas: "V" | "A" | "R"; oscillator: "V" | "A" | "R"; greens: number; reds: number; decision: string } }
export interface Holding {
  symbol: string; tv: string; name: string; country: string; sector: string; industry: string; price: number; currency: string;
  weightPct: number; amount: number; shares: number; invested: number;
  expectedReturnPct: number; expectedLow: number; expectedHigh: number; expectedGain: number; // horizonte escolhido
  expected12mPct: number; probTargetPct: number;
  per: number | null; pbv: number | null; roe: number | null; dy: number | null; perf1w: number | null; perf1m: number | null; perf3m: number | null; perf6m: number | null; perf1y: number | null; beta: number | null;
  rsi: number | null; adx: number | null; aboveSma20: boolean; aboveSma50: boolean; macdBull: boolean; distTo52HighPct: number | null; analystUpsidePct: number | null; consensus: string | null; nextEarnings: string | null; earningsInHorizon: boolean; epsSurprise: number | null; relVol: number | null;
  sectorMedianPer: number | null; score: number; trend: "Bullish" | "Bearish" | "Lateral"; stopLoss: number; target: number; partialTarget: number;
  justification: string; thesis: Thesis;
}
export interface PortfolioPlan {
  profile: PortfolioProfile; title: string; description: string; budget: number; invested: number; cash: number; horizonMonths: number; targetPct: number;
  holdings: Holding[];
  expectedReturnPct: number; expectedGain: number; expectedLowPct: number; expectedHighPct: number; expectedVolPct: number; probTargetPct: number; expected12mPct: number; dividendYieldPct: number; beta: number;
  sectors: { name: string; pct: number }[]; countries: { name: string; pct: number }[];
  rationale: string[]; risks: string[]; managementPlan: string[];
  stressScenarios: { name: string; marketMove: number; portfolioMove: number; value: number }[];
}

const SECTOR_PT: Record<string, string> = { "Finance": "Banca & Seguros", "Energy Minerals": "Energia (Petróleo & Gás)", "Utilities": "Utilities (Eletricidade & Gás)", "Retail Trade": "Retalho", "Consumer Non-Durables": "Consumo Básico & Luxo", "Consumer Durables": "Bens Duradouros & Automóvel", "Health Technology": "Saúde & Farmacêutica", "Technology Services": "Tecnologia (Software)", "Electronic Technology": "Tecnologia (Hardware & Semicondutores)", "Producer Manufacturing": "Indústria", "Industrial Services": "Serviços Industriais & Construção", "Non-Energy Minerals": "Materiais & Construção", "Process Industries": "Química & Processos", "Communications": "Telecomunicações", "Transportation": "Transportes", "Consumer Services": "Serviços ao Consumidor", "Commercial Services": "Serviços Empresariais", "Distribution Services": "Distribuição", "Health Services": "Serviços de Saúde", "Miscellaneous": "Diversos" };
const COUNTRY_PT: Record<string, string> = { Portugal: "Portugal", Spain: "Espanha", France: "França", Italy: "Itália", Germany: "Alemanha", Netherlands: "Países Baixos", Belgium: "Bélgica", Austria: "Áustria", Ireland: "Irlanda", Finland: "Finlândia" };
const r1 = (v: number) => Math.round(v * 10) / 10;
const r2 = (v: number) => Math.round(v * 100) / 100;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const pc = (v: number | null | undefined, d = 1) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(d)}%`);
// Φ normal padrão
const Phi = (z: number) => { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; };
const median = (a: (number | null)[]) => { const v = a.filter((x): x is number => x != null && isFinite(x)).sort((x, y) => x - y); return v.length ? v[Math.floor(v.length / 2)] : null; };

function consensusLabel(m: number | null) { return m == null ? null : m <= 1.5 ? "Compra forte" : m <= 2.5 ? "Compra" : m <= 3.5 ? "Manter" : m <= 4.5 ? "Venda" : "Venda forte"; }

/** Retorno esperado no horizonte (meses) — para táticas: momentum de curto prazo + catalisadores, encolhido. */
function expectedHorizon(u: U, months: number, analystUpside: number | null): { exp: number; vol: number } {
  const m1 = u.perf1m ?? 0, m3 = u.perf3m ?? 0, m6 = u.perf6m ?? 0;
  const monthlyMom = clamp((m1 * 0.45 + (m3 / 3) * 0.35 + (m6 / 6) * 0.2), -6, 6) * 0.45; // continuação de momentum (encolhida a 45%)
  const trendBonus = (u.sma20 && u.sma50 && u.price && u.price > u.sma20 && u.sma20 > u.sma50 ? 0.6 : 0) + (u.macd != null && u.macdSignal != null && u.macd > u.macdSignal ? 0.3 : 0);
  const rsiPen = u.rsi != null && u.rsi > 72 ? -0.8 : u.rsi != null && u.rsi < 45 ? -0.3 : 0;
  const room = u.high52 && u.price ? clamp(((u.high52 / u.price) - 1) * 100, 0, 20) : 5; // espaço até ao máximo 52s
  const roomBonus = room < 2 ? -0.4 : room < 8 ? 0.4 : room < 15 ? 0.2 : 0;
  const analyst = analystUpside != null ? clamp(analystUpside, -20, 30) * 0.04 : 0;
  const div = (u.dy ?? 0) / 12;
  const earningsSoon = u.nextEarnings ? (u.nextEarnings * 1000 - Date.now()) / 86400000 : null;
  const catalyst = earningsSoon != null && earningsSoon > 0 && earningsSoon <= months * 31 && (u.epsSurprise ?? 0) > 0 ? 0.5 : 0;
  const perMonth = monthlyMom + trendBonus + rsiPen + roomBonus + analyst + div + catalyst + 0.4; // 0.4 ≈ prémio de risco mensal
  const exp = clamp(perMonth * months, -8, 14);
  const volM = (u.volM ?? 1.6) * Math.sqrt(21); // Volatility.M é diária(%) → mensal
  const vol = clamp(volM * Math.sqrt(months), 4, 40);
  return { exp: r1(exp), vol: r1(vol) };
}

function scoreStock(u: U, profile: PortfolioProfile): number {
  const per = u.per ?? 25, roe = u.roe ?? 8, dy = u.dy ?? 0, p1 = u.perf1m ?? 0, p3 = u.perf3m ?? 0, p6 = u.perf6m ?? 0, p1y = u.perf1y ?? 0, beta = u.beta ?? 1, de = u.de ?? 1, revG = u.revG ?? 0, epsG = u.epsG ?? 0, vol = u.volM ?? 2;
  const valueS = clamp((30 - per) * 4, 0, 100), qualityS = clamp(roe * 4, 0, 100), incomeS = clamp(dy * 16, 0, 100);
  const momS = clamp(50 + p6 * 1.5 + p1y * 0.5, 0, 100), growthS = clamp(50 + revG * 2 + epsG * 0.8, 0, 100);
  const safetyS = clamp(100 - Math.max(0, beta - 0.8) * 60 - Math.max(0, de - 1) * 15 - Math.max(0, vol - 1.5) * 10, 0, 100);
  if (profile === "TATICA") {
    const price = u.price ?? 0;
    const setup = (u.sma20 && price > u.sma20 ? 20 : 0) + (u.sma50 && price > u.sma50 ? 15 : 0) + (u.sma20 && u.sma50 && u.sma20 > u.sma50 ? 15 : 0) + (u.macd != null && u.macdSignal != null && u.macd > u.macdSignal ? 15 : 0) + (u.adx != null && u.adx >= 20 ? 10 : 0) + (u.rsi != null && u.rsi >= 50 && u.rsi <= 70 ? 15 : u.rsi != null && u.rsi > 70 ? -10 : 0) + ((u.tvRec ?? 0) > 0.2 ? 10 : 0);
    const shortMom = clamp(50 + p1 * 3 + p3 * 1.2 + (u.perf1w ?? 0) * 2, 0, 100);
    const room = u.high52 && price ? ((u.high52 / price) - 1) * 100 : 10;
    const roomS = room < 1.5 ? 40 : room <= 10 ? 90 : room <= 20 ? 70 : 40;
    const earningsSoon = u.nextEarnings ? (u.nextEarnings * 1000 - Date.now()) / 86400000 : null;
    const catalystS = (earningsSoon != null && earningsSoon > 0 && earningsSoon <= 62 ? 50 : 20) + ((u.epsSurprise ?? 0) > 0 ? 30 : 0) + ((u.recMark ?? 3) <= 2 ? 20 : 0);
    const liq = (u.avgVol ?? 0) * price > 5_000_000 ? 100 : 50;
    return clamp(setup, 0, 100) * 0.3 + shortMom * 0.25 + roomS * 0.1 + catalystS * 0.15 + qualityS * 0.08 + valueS * 0.05 + liq * 0.07;
  }
  if (profile === "CONSERVADORA") return valueS * 0.2 + qualityS * 0.2 + incomeS * 0.25 + momS * 0.1 + growthS * 0.05 + safetyS * 0.2;
  if (profile === "CRESCIMENTO") return valueS * 0.1 + qualityS * 0.2 + incomeS * 0.05 + momS * 0.3 + growthS * 0.3 + safetyS * 0.05;
  return valueS * 0.2 + qualityS * 0.2 + incomeS * 0.15 + momS * 0.2 + growthS * 0.15 + safetyS * 0.1;
}

function selectDiversified(universe: U[], profile: PortfolioProfile, n: number): U[] {
  const pool = universe.filter(u => u.price && u.price > 0 && u.sector && (profile === "TATICA" ? (u.perf1m ?? -99) > -2 && (u.perf3m ?? -99) > 0 && (u.rsi ?? 60) < 76 && (!u.sma50 || u.price > u.sma50) : (u.per != null && u.per > 0 && u.per < (profile === "CRESCIMENTO" ? 60 : 35) && (u.roe ?? 0) > (profile === "CONSERVADORA" ? 6 : 3) && (profile !== "CONSERVADORA" || (u.beta ?? 1) < 1.25) && (profile !== "CONSERVADORA" || (u.perf1y ?? 0) > -20))));
  const ranked = pool.map(u => ({ u, s: scoreStock(u, profile) })).sort((a, b) => b.s - a.s);
  const picked: U[] = []; const perSector = new Map<string, number>(); const perCountry = new Map<string, number>(); const perIndustry = new Set<string>();
  const maxPerSector = 2, maxPerCountry = Math.ceil(n * 0.4);
  for (const { u } of ranked) {
    if (picked.length >= n) break;
    const sec = u.sector!, cty = u.country, ind = u.industry ?? sec;
    if ((perSector.get(sec) ?? 0) >= maxPerSector || (perCountry.get(cty) ?? 0) >= maxPerCountry || perIndustry.has(ind)) continue;
    picked.push(u); perSector.set(sec, (perSector.get(sec) ?? 0) + 1); perCountry.set(cty, (perCountry.get(cty) ?? 0) + 1); perIndustry.add(ind);
  }
  if (profile !== "TATICA" && !picked.some(p => p.country === "Portugal")) {
    const pt = ranked.find(r => r.u.country === "Portugal" && !picked.includes(r.u));
    if (pt && picked.length) { const same = picked.map((u, i) => ({ u, i })).filter(x => x.u.sector === pt.u.sector); const victim = (perSector.get(pt.u.sector!) ?? 0) >= maxPerSector && same.length ? same[same.length - 1].i : picked.length - 1; picked[victim] = pt.u; }
  }
  return picked;
}

function L(v: "V" | "A" | "R") { return v; }

export function buildPortfolio(universe: U[], profile: PortfolioProfile, budget: number, horizonMonths = 2, targetPct = 6): PortfolioPlan {
  const n = profile === "TATICA" ? 7 : profile === "CONSERVADORA" ? 10 : profile === "CRESCIMENTO" ? 8 : 9;
  const picks = selectDiversified(universe, profile, n);
  const scores = picks.map(u => scoreStock(u, profile));
  const minS = Math.min(...scores), maxS = Math.max(...scores);
  const raw = scores.map(s => 1 + (maxS > minS ? (s - minS) / (maxS - minS) : 0) * (profile === "TATICA" ? 1.0 : 0.8));
  let weights = raw.map(w => w / raw.reduce((a, b) => a + b, 0));
  const capHi = profile === "TATICA" ? 0.2 : 0.16, capLo = profile === "TATICA" ? 0.1 : 0.08;
  weights = weights.map(w => clamp(w, capLo, capHi)); const wsum = weights.reduce((a, b) => a + b, 0); weights = weights.map(w => w / wsum);
  const investable = budget * 0.98;
  const sectorMedians = new Map<string, number | null>();
  for (const u of universe) if (u.sector && !sectorMedians.has(u.sector)) sectorMedians.set(u.sector, median(universe.filter(x => x.sector === u.sector && (x.per ?? 0) > 0).map(x => x.per)));

  const holdings: Holding[] = picks.map((u, i) => {
    const price = u.price!;
    const amount = investable * weights[i];
    const shares = Math.max(1, Math.floor(amount / price));
    const invested = shares * price;
    const analystUpside = u.analystTarget && u.price && u.fccy === u.currency ? (u.analystTarget / price - 1) * 100 : u.analystTarget && u.price && u.per && u.marketCap && u.shares ? ((u.analystTarget * ((price * u.shares) / u.marketCap)) / price - 1) * 100 : null;
    const au = analystUpside != null && Math.abs(analystUpside) < 60 ? r1(analystUpside) : null;
    const er12 = expectedReturn12m({ perf1y: u.perf1y, perf6m: u.perf6m, dy: u.dy, per: u.per, roe: u.roe, analystUpside: au, beta: u.beta });
    const eh = expectedHorizon(u, horizonMonths, au);
    const probTarget = r1(100 * (1 - Phi((targetPct - eh.exp) / eh.vol)));
    const aboveSma20 = !!(u.sma20 && price > u.sma20), aboveSma50 = !!(u.sma50 && price > u.sma50), macdBull = u.macd != null && u.macdSignal != null && u.macd > u.macdSignal;
    const trend: Holding["trend"] = (u.perf6m ?? 0) > 4 && aboveSma50 ? "Bullish" : (u.perf6m ?? 0) < -4 && !aboveSma50 ? "Bearish" : "Lateral";
    const dist52 = u.high52 ? r1((u.high52 / price - 1) * 100) : null;
    const earningsDays = u.nextEarnings ? Math.round((u.nextEarnings * 1000 - Date.now()) / 86400000) : null;
    const nextEarnings = u.nextEarnings ? new Date(u.nextEarnings * 1000).toLocaleDateString("pt-PT") : null;
    const earningsInHorizon = earningsDays != null && earningsDays > 0 && earningsDays <= horizonMonths * 31;
    const sectorPt = SECTOR_PT[u.sector!] ?? u.sector!, countryPt = COUNTRY_PT[u.country] ?? u.country;
    const secMed = sectorMedians.get(u.sector!) ?? null;
    const consensus = consensusLabel(u.recMark);
    const stopLoss = r2(Math.max(price * 0.94, u.sma50 && u.sma50 < price ? Math.min(u.sma50 * 0.99, price * 0.97) : 0) || price * 0.94);
    const partialTarget = r2(price * 1.08), target = r2(Math.max(price * 1.10, u.high52 && u.high52 > price * 1.02 && u.high52 < price * 1.18 ? u.high52 : price * 1.10));

    // ---------- Semáforo do guia (dados do scanner) ----------
    const fL = secMed != null && u.per != null ? (u.per < secMed * 0.9 && (u.roe ?? 0) >= 10 ? L("V") : u.per > secMed * 1.3 || (u.roe ?? 0) < 6 ? L("R") : L("A")) : L("A");
    const tL = trend === "Bullish" ? L("V") : trend === "Bearish" ? L("R") : L("A");
    const lL = dist52 != null && dist52 <= 1 ? L("R") : u.low1m && u.high1m && price <= u.low1m * 1.03 && trend === "Bullish" ? L("V") : u.high1m && price >= u.high1m * 0.995 && (u.perf1w ?? 0) > 0 ? L("V") : L("A");
    const mL = aboveSma20 && aboveSma50 ? L("V") : !aboveSma20 && !aboveSma50 ? L("R") : L("A");
    const useMacd = (u.adx ?? 20) >= 25;
    const oL = useMacd ? (macdBull ? L("V") : L("R")) : (u.rsi != null && u.rsi >= 50 && u.rsi < 70 ? L("V") : u.rsi != null && u.rsi >= 70 ? L("R") : L("A"));
    const lights = [fL, tL, lL, mL, oL]; const greens = lights.filter(x => x === "V").length, reds = lights.filter(x => x === "R").length;
    const decision = reds >= 2 ? "Não comprar / vender" : greens >= 4 ? "Comprar" : "Comprar menos / esperar confirmação";

    // ---------- Tese ----------
    const believe: string[] = [];
    if (aboveSma20 && aboveSma50 && (u.sma20 ?? 0) > (u.sma50 ?? 0)) believe.push(`Tendência ascendente confirmada pelo guia: preço (${price.toFixed(2)}) acima da MM20 (${u.sma20?.toFixed(2)}) e da MM50 (${u.sma50?.toFixed(2)}), com MM20 > MM50 — "the trend is your friend".`);
    else if (aboveSma50) believe.push(`Preço acima da MM50 (${u.sma50?.toFixed(2)}): a tendência de médio prazo mantém-se positiva.`);
    if ((u.perf1m ?? 0) > 2 || (u.perf3m ?? 0) > 5) believe.push(`Momentum real: ${pc(u.perf1w)} na semana, ${pc(u.perf1m)} no mês, ${pc(u.perf3m)} em 3 meses, ${pc(u.perf6m)} em 6 meses — o movimento está em curso, não é uma aposta em reversão.`);
    if (macdBull) believe.push(`MACD acima da linha de sinal (${u.macd?.toFixed(2)} vs ${u.macdSignal?.toFixed(2)})${(u.adx ?? 0) >= 25 ? ` com ADX ${u.adx?.toFixed(0)} (há tendência) — é o indicador certo segundo o guia` : ""}.`);
    if (u.rsi != null && u.rsi >= 50 && u.rsi <= 70) believe.push(`RSI em ${u.rsi.toFixed(0)}: zona compradora sem estar sobrecomprada — ainda há espaço antes de "preparar a venda" (70–80).`);
    if (dist52 != null && dist52 > 1.5 && dist52 <= 12) believe.push(`Está a ${dist52}% do máximo de 52 semanas (${u.high52?.toFixed(2)}): o antigo teto é um alvo natural dentro do prazo, e romper um máximo anual costuma atrair compradores.`);
    if (dist52 != null && dist52 <= 1.5) believe.push(`Em máximos de 52 semanas: não há resistência por cima (price discovery); gerir com stop apertado.`);
    if (secMed != null && u.per != null && u.per < secMed) believe.push(`PER ${u.per.toFixed(1)} abaixo da mediana do setor (${secMed.toFixed(1)}): sobe com a tendência sem estar cara face aos pares.`);
    if ((u.roe ?? 0) >= 15) believe.push(`ROE ${u.roe?.toFixed(1)}%: empresa muito rentável — o mercado paga por qualidade quando o momentum é positivo.`);
    if ((u.epsSurprise ?? 0) > 0) believe.push(`Último trimestre bateu as estimativas de lucro em ${pc(u.epsSurprise)}: tendência de revisões em alta.`);
    if ((u.revG ?? 0) > 5) believe.push(`Receitas a crescer ${pc(u.revG)} YoY${(u.epsG ?? 0) > 5 ? ` e lucro por ação ${pc(u.epsG)}` : ""}.`);
    if (consensus && (u.recMark ?? 3) <= 2.5) believe.push(`Consenso de analistas "${consensus}"${au != null ? ` com alvo médio ${pc(au)} acima do preço` : ""}.`);
    if ((u.relVol ?? 1) > 1.2) believe.push(`Volume ${((u.relVol ?? 1) * 100 - 100).toFixed(0)}% acima da média de 10 dias: o movimento tem participação institucional.`);
    if ((u.dy ?? 0) >= 3) believe.push(`Dividend yield ${u.dy?.toFixed(2)}%: almofada de rendimento se o preço lateralizar.`);
    if (believe.length < 3) believe.push(`Selecionada por pontuação composta (${Math.round(scores[i])}/100) no perfil ${profile.toLowerCase()}: melhor combinação de valor, qualidade, rendimento e tendência disponível no setor ${sectorPt}.`);
    const catalysts: string[] = [];
    if (earningsInHorizon) catalysts.push(`Resultados trimestrais a ${nextEarnings} (daqui a ${earningsDays} dias) — dentro do prazo; ${(u.epsSurprise ?? 0) > 0 ? "historial recente de surpresas positivas" : "evento binário: reduzir posição antes se o semáforo piorar"}.`);
    else if (nextEarnings) catalysts.push(`Próximos resultados a ${nextEarnings} (fora do prazo de ${horizonMonths} meses): sem risco de evento binário até lá.`);
    if ((u.dy ?? 0) > 2) catalysts.push(`Dividendo anual ≈ ${u.dy?.toFixed(2)}%: pagamentos/ex-dividendo costumam suportar o preço.`);
    if (dist52 != null && dist52 > 0 && dist52 <= 10) catalysts.push(`Rompimento do máximo de 52 semanas (${u.high52?.toFixed(2)}) como gatilho técnico.`);
    if ((u.tvRec ?? 0) > 0.3) catalysts.push(`Agregado técnico TradingView em "compra" (${((u.tvRec ?? 0) * 100).toFixed(0)}/100).`);
    if (!catalysts.length) catalysts.push("Sem catalisador datado: a tese assenta na continuação da tendência.");
    const exit: string[] = [
      `Stop loss a ${stopLoss} € (${pc((stopLoss / price - 1) * 100)}): ${u.sma50 && stopLoss <= u.sma50 * 1.0 ? "logo abaixo da MM50" : "regra 5–8% do guia"}. Perda máxima na posição ≈ ${Math.round(invested * (1 - stopLoss / price)).toLocaleString("pt-PT")} €.`,
      `Realizar metade a ${partialTarget} € (+8%) e subir o stop para o preço de compra; resto até ${target} € (${pc((target / price - 1) * 100)}${u.high52 && target === r2(u.high52) ? ", o máximo de 52 semanas" : ""}).`,
      `Sair antes do prazo se: fecho abaixo da MM20 dois dias seguidos, MACD cruzar para baixo, ou RSI acima de 75 sem progressão de preço.`,
    ];
    const risks: string[] = [];
    if ((u.beta ?? 1) > 1.2) risks.push(`Beta ${u.beta?.toFixed(2)}: amplifica o mercado em ±${((u.beta ?? 1) * 10).toFixed(0)}% por cada 10%.`);
    if ((u.rsi ?? 50) > 68) risks.push(`RSI ${u.rsi?.toFixed(0)} perto de sobrecompra: possível pausa/correção de curto prazo.`);
    if (earningsInHorizon) risks.push("Evento de resultados dentro do prazo pode mover a ação ±5–10% num dia.");
    if ((u.volM ?? 1.5) > 2.2) risks.push(`Volatilidade diária ${u.volM?.toFixed(1)}%: oscilações amplas, respeitar o stop.`);
    if (secMed != null && u.per != null && u.per > secMed * 1.3) risks.push(`PER ${u.per.toFixed(1)} acima da mediana do setor (${secMed.toFixed(1)}): múltiplo exigente.`);
    if (!risks.length) risks.push("Risco de mercado geral (Zona Euro / BCE) e de inversão de momentum.");
    const thesis: Thesis = { believe: believe.slice(0, 6), catalysts, exit, risks, semaforo: { fundamentals: fL, trend: tL, levels: lL, mas: mL, oscillator: oL, greens, reds, decision } };

    const justification = `${u.name} (${countryPt}, ${sectorPt}) — ${weights[i] * 100 > 0 ? "" : ""}Comprei ${shares} ações a ${price.toFixed(2)} €, cerca de ${Math.round(invested).toLocaleString("pt-PT")} € (${r1((invested / budget) * 100)}% da carteira). Fundamentais: PER ${u.per?.toFixed(1) ?? "—"}${secMed != null ? ` vs mediana do setor ${secMed.toFixed(1)}` : ""}, ROE ${u.roe?.toFixed(1) ?? "—"}%, dividend yield ${u.dy?.toFixed(2) ?? "0"}%${(u.revG ?? 0) !== 0 ? `, receitas ${pc(u.revG)}` : ""}. Técnica: tendência de 6 meses ${trend.toLowerCase()} (${pc(u.perf6m)}; 1M ${pc(u.perf1m)}), preço ${aboveSma20 ? "acima" : "abaixo"} da MM20 e ${aboveSma50 ? "acima" : "abaixo"} da MM50, ADX ${u.adx?.toFixed(0) ?? "—"} → ${useMacd ? "MACD" : "RSI"} ${oL === "V" ? "com sinal de compra" : oL === "R" ? "com sinal de venda" : "sem sinal"}${dist52 != null ? `; a ${dist52}% do máximo de 52 semanas` : ""}. Semáforo: ${greens} verdes / ${reds} vermelhos → ${decision}. Papel na carteira: ${profile === "TATICA" ? "contribuir para o objetivo de +" + targetPct + "% em " + horizonMonths + " meses com tendência já em curso" : profile === "CONSERVADORA" ? "estabilidade e rendimento" : profile === "CRESCIMENTO" ? "motor de crescimento" : "equilíbrio entre valor e tendência"}; diversifica ${sectorPt} / ${countryPt}. Esperado em ${horizonMonths} meses ≈ ${pc(eh.exp)} (12 meses ≈ ${pc(er12.expected)}; probabilidade de ≥ +${targetPct}% no prazo ≈ ${probTarget}%). Stop loss ${stopLoss} €, parcial a ${partialTarget} €, objetivo ${target} €.`;

    return {
      symbol: u.symbol, tv: u.tv, name: u.name, country: countryPt, sector: sectorPt, industry: u.industry ?? "", price, currency: u.currency ?? "EUR",
      weightPct: 0, amount: Math.round(amount), shares, invested: r2(invested),
      expectedReturnPct: eh.exp, expectedLow: r1(eh.exp - eh.vol), expectedHigh: r1(eh.exp + eh.vol), expectedGain: Math.round(invested * eh.exp / 100), expected12mPct: er12.expected, probTargetPct: probTarget,
      per: u.per, pbv: u.pbv, roe: u.roe, dy: u.dy, perf1w: u.perf1w, perf1m: u.perf1m, perf3m: u.perf3m, perf6m: u.perf6m, perf1y: u.perf1y, beta: u.beta,
      rsi: u.rsi, adx: u.adx, aboveSma20, aboveSma50, macdBull, distTo52HighPct: dist52, analystUpsidePct: au, consensus, nextEarnings, earningsInHorizon, epsSurprise: u.epsSurprise, relVol: u.relVol,
      sectorMedianPer: secMed, score: Math.round(scores[i]), trend, stopLoss, target, partialTarget, justification, thesis,
    };
  });

  const invested = holdings.reduce((a, h) => a + h.invested, 0);
  holdings.forEach(h => { h.weightPct = r1((h.invested / budget) * 100); });
  const cash = r2(budget - invested);
  const w = holdings.map(h => h.invested / invested);
  const expectedReturnPct = r1(holdings.reduce((a, h, i) => a + h.expectedReturnPct * w[i], 0));
  const expected12mPct = r1(holdings.reduce((a, h, i) => a + h.expected12mPct * w[i], 0));
  const beta = r1(holdings.reduce((a, h, i) => a + (h.beta ?? 1) * w[i], 0));
  const dividendYieldPct = r1(holdings.reduce((a, h, i) => a + (h.dy ?? 0) * w[i], 0));
  const nH = holdings.length, rho = 0.45;
  const avgVol = holdings.reduce((a, h, i) => a + (h.expectedHigh - h.expectedReturnPct) * w[i], 0);
  const expectedVolPct = r1(avgVol * Math.sqrt(1 / nH + (1 - 1 / nH) * rho));
  const probTargetPct = r1(100 * (1 - Phi((targetPct - expectedReturnPct) / Math.max(1, expectedVolPct))));
  const sectors = Object.entries(holdings.reduce<Record<string, number>>((m, h) => { m[h.sector] = (m[h.sector] ?? 0) + h.invested; return m; }, {})).map(([name, v]) => ({ name, pct: r1((v / invested) * 100) })).sort((a, b) => b.pct - a.pct);
  const countries = Object.entries(holdings.reduce<Record<string, number>>((m, h) => { m[h.country] = (m[h.country] ?? 0) + h.invested; return m; }, {})).map(([name, v]) => ({ name, pct: r1((v / invested) * 100) })).sort((a, b) => b.pct - a.pct);
  const stressScenarios = [{ name: "Mercado +10%", marketMove: 10 }, { name: "Mercado +5%", marketMove: 5 }, { name: "Mercado 0%", marketMove: 0 }, { name: "Correção −7%", marketMove: -7 }, { name: "Queda −15%", marketMove: -15 }]
    .map(s => { const pm = r1(s.marketMove * beta + (s.marketMove >= 0 ? expectedReturnPct * 0.5 : 0)); return { ...s, portfolioMove: pm, value: Math.round(invested * (1 + pm / 100) + cash) }; });
  const titles: Record<PortfolioProfile, [string, string]> = {
    TATICA: [`Carteira Tática — objetivo +${targetPct}% em ${horizonMonths} ${horizonMonths === 1 ? "mês" : "meses"}`, `Concentrada (7 posições) em ações com tendência bullish já confirmada (preço > MM20 > MM50, MACD positivo, RSI 50–70), momentum de 1–3 meses, espaço até ao máximo de 52 semanas e catalisadores dentro do prazo. É a única forma realista de tentar +${targetPct}% em tão pouco tempo — com gestão ativa obrigatória.`],
    CONSERVADORA: ["Carteira Conservadora (rendimento e estabilidade)", "Grande capitalização, dividendos sólidos, PER moderado, beta baixo e balanço robusto. Objetivo: preservar capital e receber rendimento."],
    EQUILIBRADA: ["Carteira Equilibrada (valor + tendência)", "Empresas rentáveis a preço razoável com tendência de 6 meses favorável. Objetivo: crescer acima do mercado com risco controlado."],
    CRESCIMENTO: ["Carteira Crescimento (momentum + resultados)", "Receitas e lucros em expansão e tendência bullish confirmada. Objetivo: maximizar rendibilidade aceitando maior volatilidade."],
  };
  const rationale = [
    `Só ações cotadas em euros (Euronext Lisboa/Paris/Amesterdão/Bruxelas, Madrid, Xetra, Milão): sem risco cambial e compatível com a plataforma.`,
    `${nH} posições com pesos entre ${Math.min(...holdings.map(h => h.weightPct))}% e ${Math.max(...holdings.map(h => h.weightPct))}%; ${sectors.length} setores e ${countries.length} países (máx. 2 por setor, 1 por indústria, 40% por país).`,
    profile === "TATICA"
      ? `Critério de entrada (guia, secção 5–6): todas as posições têm preço acima da MM50, ${holdings.filter(h => h.aboveSma20 && h.macdBull).length} de ${nH} com MM20 e MACD a confirmar, ${holdings.filter(h => h.thesis.semaforo.greens >= 3).length} com ≥3 verdes no semáforo; ${holdings.filter(h => h.earningsInHorizon).length} com resultados dentro do prazo (catalisador).`
      : `Seleção pelo método do guia: PER vs mediana do setor, ROE, dividend yield, tendência de 6 meses e médias móveis; stop loss e objetivo definidos à partida.`,
    `Rendibilidade esperada em ${horizonMonths} meses: ${pc(expectedReturnPct)} (≈ ${Math.round(invested * expectedReturnPct / 100).toLocaleString("pt-PT")} €); probabilidade estimada de atingir ≥ +${targetPct}% no prazo: ${probTargetPct}%. A 12 meses: ${pc(expected12mPct)}. Dividendos ${dividendYieldPct}%/ano, beta ${beta}.`,
    `Caixa residual de ${cash.toLocaleString("pt-PT")} € para comissões e arredondamento de lotes.`,
  ];
  const managementPlan = [
    `Semana 0: entrar nas ${nH} posições; colocar imediatamente as ordens stop (coluna "Stop").`,
    `Cada semana: refazer a tabela-semáforo de cada ação; se 2+ vermelhos → vender e rodar para a melhor candidata do mesmo setor.`,
    `Em qualquer posição a +8%: vender metade e subir o stop para o preço de compra (lucro garantido). A +10% ou no máximo de 52 semanas: vender o resto, salvo rompimento com volume.`,
    `Se a carteira atingir +${targetPct}% antes do prazo: fechar 50–70% e deixar o resto com stop no breakeven — o objetivo está cumprido, não se devolve ao mercado.`,
    `Se a carteira estiver a −4%: reduzir para as 4 melhores posições; a −6%: passar a caixa e reavaliar (o guia privilegia esperar a perder).`,
    `Evitar comprar na véspera de resultados sem convicção; evitar perseguir subidas >4% num dia (esperar recuo à MM20).`,
  ];
  const risks = [
    `Intervalo provável em ${horizonMonths} meses: ${pc(r1(expectedReturnPct - expectedVolPct))} a ${pc(r1(expectedReturnPct + expectedVolPct))} (±1 desvio-padrão). Num mercado a −15% a carteira perderia ≈ ${stressScenarios[4].portfolioMove}% apesar dos stops (gaps).`,
    profile === "TATICA" ? `Um objetivo de +${targetPct}% em ${horizonMonths} meses equivale a ≈ ${r1(targetPct * 12 / horizonMonths)}% anualizado — acima da média histórica das ações (7–9%): a probabilidade estimada é ${probTargetPct}%, não uma garantia. A carteira só funciona com a gestão semanal descrita.` : `Concentração geográfica na Zona Euro: sensível ao BCE e à economia europeia.`,
    `As estimativas usam dados de hoje (TradingView/Yahoo) e momentum passado; resultados, notícias e choques macro podem inverter as tendências em dias.`,
  ];
  return { profile, title: titles[profile][0], description: titles[profile][1], budget, invested: r2(invested), cash, horizonMonths, targetPct, holdings, expectedReturnPct, expectedGain: Math.round(invested * expectedReturnPct / 100), expectedLowPct: r1(expectedReturnPct - expectedVolPct), expectedHighPct: r1(expectedReturnPct + expectedVolPct), expectedVolPct, probTargetPct, expected12mPct, dividendYieldPct, beta, sectors, countries, rationale, risks, managementPlan, stressScenarios };
}

let universeCache: { at: number; data: U[] } | null = null;
export async function buildAllPortfolios(budget: number, horizonMonths = 2, targetPct = 6): Promise<{ budget: number; horizonMonths: number; targetPct: number; generatedAt: string; universeSize: number; portfolios: PortfolioPlan[]; note: string }> {
  const b = clamp(Math.round(budget), 1000, 100000); const h = clamp(Math.round(horizonMonths), 1, 12); const t = clamp(targetPct, 1, 30);
  if (!universeCache || Date.now() - universeCache.at > 20 * 60 * 1000) { const u = await fetchEuroUniverse(); if (u.length) universeCache = { at: Date.now(), data: u }; }
  const universe = universeCache?.data ?? [];
  const portfolios = (["TATICA", "EQUILIBRADA", "CRESCIMENTO", "CONSERVADORA"] as PortfolioProfile[]).map(p => buildPortfolio(universe, p, b, h, t));
  return { budget: b, horizonMonths: h, targetPct: t, generatedAt: new Date().toISOString(), universeSize: universe.length, portfolios, note: universe.length ? `Universo: ${universe.length} ações da Zona Euro com capitalização > 2 mM€ e liquidez (TradingView, agora).` : "Fornecedor de dados indisponível — tenta novamente dentro de minutos." };
}
