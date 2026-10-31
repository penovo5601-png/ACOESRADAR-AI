// Generate realistic base64 chart data for quick demo testing
function generateSampleChartDataUri(patternType: "bull_flag" | "head_shoulders" | "double_bottom"): string {
  let title = "BULL FLAG BREAKOUT";
  let polylinePoints = "20,180 50,140 80,110 110,60 140,80 170,70 200,90 230,80 260,100 290,90 320,50 350,30 380,20";
  let strokeColor = "#10b981";

  if (patternType === "head_shoulders") {
    title = "HEAD AND SHOULDERS BREAKDOWN";
    polylinePoints = "20,160 50,120 80,100 110,130 140,70 170,50 200,80 230,130 260,105 290,120 320,160 350,190 380,210";
    strokeColor = "#ef4444";
  } else if (patternType === "double_bottom") {
    title = "DOUBLE BOTTOM (W) REVERSAL";
    polylinePoints = "20,60 50,110 80,160 110,175 140,110 170,120 200,175 230,165 260,120 290,80 320,55 350,40 380,30";
    strokeColor = "#10b981";
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240" style="background:#090d16">
    <rect width="400" height="240" fill="#090d16"/>
    <!-- Grid -->
    <line x1="20" y1="40" x2="380" y2="40" stroke="#1e293b" stroke-dasharray="3 3"/>
    <line x1="20" y1="90" x2="380" y2="90" stroke="#1e293b" stroke-dasharray="3 3"/>
    <line x1="20" y1="140" x2="380" y2="140" stroke="#1e293b" stroke-dasharray="3 3"/>
    <line x1="20" y1="190" x2="380" y2="190" stroke="#1e293b" stroke-dasharray="3 3"/>
    
    <!-- Title -->
    <text x="30" y="25" fill="#94a3b8" font-family="sans-serif" font-size="11" font-weight="bold">${title} - STOCK CHART</text>
    <text x="320" y="25" fill="#38bdf8" font-family="sans-serif" font-size="11">RSI: 62.4</text>
    
    <!-- Moving Average -->
    <path d="M 20 150 Q 150 120 380 70" fill="none" stroke="#f59e0b" stroke-width="2" opacity="0.6"/>
    
    <!-- Price Action -->
    <polyline fill="none" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${polylinePoints}"/>
    
    <!-- Support/Resistance line -->
    <line x1="20" y1="110" x2="380" y2="110" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4 4"/>
  </svg>`;

  if (typeof btoa !== "undefined") {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export const SAMPLE_CHARTS = [
  {
    id: "bull_flag",
    title: "📈 Rompimento de Bandeira de Alta (Bull Flag)",
    symbol: "NVDA",
    description: "Impulso prévio forte, consolidação controlada e rompimento de topo.",
    dataUri: generateSampleChartDataUri("bull_flag")
  },
  {
    id: "head_shoulders",
    title: "📉 Ombro-Cabeça-Ombro Baixista (H&S)",
    symbol: "TSLA",
    description: "Perda da linha de pescoço (neckline) e cruzamento de médias para venda.",
    dataUri: generateSampleChartDataUri("head_shoulders")
  },
  {
    id: "double_bottom",
    title: "🔄 Fundo Duplo em Suporte Chave (Double Bottom)",
    symbol: "EDP.LS",
    description: "Formação de pivô em 'W' em suporte histórico com divergência altista de RSI.",
    dataUri: generateSampleChartDataUri("double_bottom")
  }
];
