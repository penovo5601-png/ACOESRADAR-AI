export interface StockDirectoryItem {
  symbol: string;
  name: string;
  exchange: string;
  market: "EUA" | "Portugal" | "Europa" | "Brasil" | "Ásia" | "Canadá" | "Outros";
  country: string;
  currency: string;
  sector: string;
  industry: string;
  description: string;
}

export const GLOBAL_STOCKS_DIRECTORY: StockDirectoryItem[] = [
  // --- PORTUGAL (Euronext Lisboa) ---
  {
    symbol: "EDP.LS",
    name: "EDP - Energias de Portugal",
    exchange: "Euronext Lisbon",
    market: "Portugal",
    country: "Portugal",
    currency: "EUR",
    sector: "Energia / Utilities",
    industry: "Electric Utilities",
    description: "Principal empresa de energia em Portugal e líder mundial em energias renováveis."
  },
  {
    symbol: "GALP.LS",
    name: "Galp Energia",
    exchange: "Euronext Lisbon",
    market: "Portugal",
    country: "Portugal",
    currency: "EUR",
    sector: "Energia",
    industry: "Oil & Gas",
    description: "Multinacional portuguesa de energia e exploração de petróleo e gás natural."
  },
  {
    symbol: "JMT.LS",
    name: "Jerónimo Martins",
    exchange: "Euronext Lisbon",
    market: "Portugal",
    country: "Portugal",
    currency: "EUR",
    sector: "Consumo Básico",
    industry: "Supermercados & Distribuição",
    description: "Grupo retalhista com operações em Portugal (Pingo Doce), Polónia (Biedronka) e Colômbia."
  },
  {
    symbol: "BCP.LS",
    name: "Banco Comercial Português (Millennium bcp)",
    exchange: "Euronext Lisbon",
    market: "Portugal",
    country: "Portugal",
    currency: "EUR",
    sector: "Banca & Finanças",
    industry: "Banca Comercial",
    description: "Maior banco privado português cotado em bolsa com forte presença em Portugal e Polónia."
  },
  {
    symbol: "NOS.LS",
    name: "NOS SGPS",
    exchange: "Euronext Lisbon",
    market: "Portugal",
    country: "Portugal",
    currency: "EUR",
    sector: "Telecomunicações & Media",
    industry: "Telecomunicações",
    description: "Grupo português de telecomunicações, entretenimento e distribuição de cinema."
  },
  {
    symbol: "SEM.LS",
    name: "Semapa",
    exchange: "Euronext Lisbon",
    market: "Portugal",
    country: "Portugal",
    currency: "EUR",
    sector: "Materiais Básicos / Pasta e Papel",
    industry: "Indústria de Papel e Cimento",
    description: "Holding industrial portuguesa com participações na Navigator e Secil."
  },
  {
    symbol: "NVG.LS",
    name: "The Navigator Company",
    exchange: "Euronext Lisbon",
    market: "Portugal",
    country: "Portugal",
    currency: "EUR",
    sector: "Materiais Básicos",
    industry: "Papel e Celulose",
    description: "Um dos maiores produtores europeus de pasta branqueada de eucalipto e papel de escritório."
  },
  {
    symbol: "ALTR.LS",
    name: "Altri SGPS",
    exchange: "Euronext Lisbon",
    market: "Portugal",
    country: "Portugal",
    currency: "EUR",
    sector: "Materiais Básicos",
    industry: "Celulose e Biomassa",
    description: "Produtora europeia de referência de pasta de celulose e energia renovável de biomassa."
  },
  {
    symbol: "CTT.LS",
    name: "CTT - Correios de Portugal",
    exchange: "Euronext Lisbon",
    market: "Portugal",
    country: "Portugal",
    currency: "EUR",
    sector: "Logística & Serviços Financeiros",
    industry: "Logística e Correio",
    description: "Operador postal histórico português com forte crescimento em e-commerce e Banco CTT."
  },
  {
    symbol: "RENO.LS",
    name: "REN - Redes Energéticas Nacionais",
    exchange: "Euronext Lisbon",
    market: "Portugal",
    country: "Portugal",
    currency: "EUR",
    sector: "Utilities",
    industry: "Transporte de Eletricidade e Gás",
    description: "Concessionária das redes nacionais de transporte de eletricidade e gás de alta pressão."
  },
  {
    symbol: "SON.LS",
    name: "Sonae SGPS",
    exchange: "Euronext Lisbon",
    market: "Portugal",
    country: "Portugal",
    currency: "EUR",
    sector: "Consumo & Retalho",
    industry: "Retalho e Telecomunicações",
    description: "Multinacional com presença no retalho alimentar (Continente), eletrónica (Worten) e telecomunicações."
  },
  {
    symbol: "COR.LS",
    name: "Corticeira Amorim",
    exchange: "Euronext Lisbon",
    market: "Portugal",
    country: "Portugal",
    currency: "EUR",
    sector: "Indústria",
    industry: "Cortiça e Derivados",
    description: "Líder mundial indiscutível na transformação e distribuição de produtos de cortiça."
  },
  {
    symbol: "IBS.LS",
    name: "Ibersol",
    exchange: "Euronext Lisbon",
    market: "Portugal",
    country: "Portugal",
    currency: "EUR",
    sector: "Consumo Discricionário",
    industry: "Restauração",
    description: "Grupo multimarca de restauração organizada na Península Ibérica."
  },
  {
    symbol: "EPR.LS",
    name: "EDP Renováveis",
    exchange: "Euronext Lisbon",
    market: "Portugal",
    country: "Portugal",
    currency: "EUR",
    sector: "Energia Renovável",
    industry: "Energia Eólica e Solar",
    description: "Um dos maiores produtores mundiais de energia renovável eólica e fotovoltaica."
  },

  // --- ESTADOS UNIDOS (EUA - NYSE, NASDAQ) ---
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Tecnologia",
    industry: "Consumidor Eletrónico",
    description: "Fabricante do iPhone, iPad, Mac e ecossistema de serviços digitais líderes mundiais."
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    exchange: "NASDAQ",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Tecnologia",
    industry: "Software e Cloud",
    description: "Gigante tecnológica dona do Azure, Windows, Office 365 e infraestrutura de Inteligência Artificial."
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NASDAQ",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Tecnologia",
    industry: "Semicondutores & IA",
    description: "Pioneira e líder mundial em processadores gráficos (GPUs) para computação acelerada e IA generativa."
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    exchange: "NASDAQ",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Tecnologia de Comunicação",
    industry: "Internet e Motores de Busca",
    description: "Controladora do Google, YouTube, Android, Google Cloud e modelo Gemini AI."
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    exchange: "NASDAQ",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Consumo Discricionário",
    industry: "E-Commerce e Nuvem",
    description: "Maior plataforma de comércio eletrónico ocidental e líder em computação na nuvem (AWS)."
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    exchange: "NASDAQ",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Tecnologia de Comunicação",
    industry: "Redes Sociais",
    description: "Proprietária do Facebook, Instagram, WhatsApp, Messenger e desenvolvimentos de IA open-source LLaMA."
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    exchange: "NASDAQ",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Consumo Discricionário / Automóvel",
    industry: "Veículos Elétricos & Energia",
    description: "Líder em carros elétricos, sistemas de baterias solares e condução autónoma (FSD)."
  },
  {
    symbol: "BRK-B",
    name: "Berkshire Hathaway Inc.",
    exchange: "NYSE",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Financeiro / Conglomerado",
    industry: "Holding de Investimentos",
    description: "Holding multinacional de investimentos gerida pelo lendário investidor Warren Buffett."
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    exchange: "NYSE",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Financeiro",
    industry: "Grandes Bancos",
    description: "Maior instituição bancária dos Estados Unidos por ativos e líder em banca de investimento."
  },
  {
    symbol: "V",
    name: "Visa Inc.",
    exchange: "NYSE",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Financeiro / Tecnologia",
    industry: "Infraestrutura de Pagamentos",
    description: "Rede global de tecnologia de pagamentos digitais com biliões de transações anuais."
  },
  {
    symbol: "LLY",
    name: "Eli Lilly and Company",
    exchange: "NYSE",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Saúde / Farmacêutica",
    industry: "Farmacêutica e Biotecnologia",
    description: "Gigante farmacêutica líder em tratamentos para diabetes e obesidade (Mounjaro / Zepbound)."
  },
  {
    symbol: "WMT",
    name: "Walmart Inc.",
    exchange: "NYSE",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Consumo Básico",
    industry: "Hipermercados e Retalho",
    description: "Maior retalhista do mundo em receitas e número de funcionários."
  },
  {
    symbol: "XOM",
    name: "Exxon Mobil Corporation",
    exchange: "NYSE",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Energia",
    industry: "Petróleo e Gás Integrado",
    description: "Uma das maiores petrolíferas privadas globais com exploração, refino e petroquímica."
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices Inc.",
    exchange: "NASDAQ",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Tecnologia",
    industry: "Semicondutores",
    description: "Desenvolvedora de processadores CPU Ryzen, EPYC e aceleradores gráficos de IA Instinct."
  },
  {
    symbol: "PLTR",
    name: "Palantir Technologies Inc.",
    exchange: "NASDAQ",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Tecnologia",
    industry: "Software de Análise de Dados e IA",
    description: "Plataformas de análise de big data e IA (Foundry, Gotham e AIP) para defesa e empresas."
  },
  {
    symbol: "NFLX",
    name: "Netflix Inc.",
    exchange: "NASDAQ",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Comunicação",
    industry: "Streaming de Entretenimento",
    description: "Pioneira e líder global de streaming de vídeo por subscrição com produções originais."
  },
  {
    symbol: "CRM",
    name: "Salesforce Inc.",
    exchange: "NYSE",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Tecnologia",
    industry: "Software Empresarial na Nuvem",
    description: "Plataforma número 1 do mundo em gestão de relacionamento com clientes (CRM) e Agentforce."
  },
  {
    symbol: "COST",
    name: "Costco Wholesale Corp.",
    exchange: "NASDAQ",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Consumo Básico",
    industry: "Clube de Compras Grossista",
    description: "Rede multinacional de retalho baseada em modelo de subscrição e elevada lealdade de clientes."
  },
  {
    symbol: "DIS",
    name: "The Walt Disney Company",
    exchange: "NYSE",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Comunicação",
    industry: "Entretenimento & Parques",
    description: "Conglomerado de media, estúdios cinematográficos, streaming Disney+ e parques temáticos."
  },
  {
    symbol: "KO",
    name: "The Coca-Cola Company",
    exchange: "NYSE",
    market: "EUA",
    country: "Estados Unidos",
    currency: "USD",
    sector: "Consumo Básico",
    industry: "Bebidas Não Alcoólicas",
    description: "Fabricante e distribuidora global de bebidas e refrigerantes mais famosa do mundo."
  },

  // --- BRASIL (B3) ---
  {
    symbol: "PETR4.SA",
    name: "Petróleo Brasileiro S.A. - Petrobras (PN)",
    exchange: "B3 São Paulo",
    market: "Brasil",
    country: "Brasil",
    currency: "BRL",
    sector: "Energia",
    industry: "Petróleo, Gás e Derivados",
    description: "Maior petrolífera da América Latina, exploradora das reservas do pré-sal brasileiro."
  },
  {
    symbol: "VALE3.SA",
    name: "Vale S.A.",
    exchange: "B3 São Paulo",
    market: "Brasil",
    country: "Brasil",
    currency: "BRL",
    sector: "Materiais Básicos",
    industry: "Mineração de Minério de Ferro",
    description: "Uma das maiores mineradoras do planeta e principal produtora de minério de ferro e pelotas."
  },
  {
    symbol: "ITUB4.SA",
    name: "Itaú Unibanco Holding S.A.",
    exchange: "B3 São Paulo",
    market: "Brasil",
    country: "Brasil",
    currency: "BRL",
    sector: "Financeiro",
    industry: "Banca Comercial e Múltipla",
    description: "Maior conglomerado financeiro privado da América Latina em valor de mercado."
  },
  {
    symbol: "BBDC4.SA",
    name: "Banco Bradesco S.A.",
    exchange: "B3 São Paulo",
    market: "Brasil",
    country: "Brasil",
    currency: "BRL",
    sector: "Financeiro",
    industry: "Banca e Seguros",
    description: "Segundo maior banco privado brasileiro com ampla rede de agências e liderança em seguros."
  },
  {
    symbol: "BBAS3.SA",
    name: "Banco do Brasil S.A.",
    exchange: "B3 São Paulo",
    market: "Brasil",
    country: "Brasil",
    currency: "BRL",
    sector: "Financeiro",
    industry: "Banca e Agronegócio",
    description: "Instituição bancária mais antiga do Brasil e principal financiadora do agronegócio nacional."
  },
  {
    symbol: "WEGE3.SA",
    name: "WEG S.A.",
    exchange: "B3 São Paulo",
    market: "Brasil",
    country: "Brasil",
    currency: "BRL",
    sector: "Bens Industriais",
    industry: "Equipamentos Elétricos e Motores",
    description: "Multinacional brasileira de excelência em motores elétricos, transformadores e automação."
  },
  {
    symbol: "ABEV3.SA",
    name: "Ambev S.A.",
    exchange: "B3 São Paulo",
    market: "Brasil",
    country: "Brasil",
    currency: "BRL",
    sector: "Consumo Básico",
    industry: "Cervejas e Bebidas",
    description: "Subsidiária da AB InBev e líder em cervejas e bebidas no continente sul-americano."
  },
  {
    symbol: "RENT3.SA",
    name: "Localiza Rent a Car S.A.",
    exchange: "B3 São Paulo",
    market: "Brasil",
    country: "Brasil",
    currency: "BRL",
    sector: "Consumo Discricionário",
    industry: "Aluguer de Carros e Gestão de Frotas",
    description: "Maior empresa de locação de veículos e gestão de frotas da América do Sul."
  },
  {
    symbol: "PRIO3.SA",
    name: "PRIO S.A. (PetroRio)",
    exchange: "B3 São Paulo",
    market: "Brasil",
    country: "Brasil",
    currency: "BRL",
    sector: "Energia",
    industry: "Exploração de Petróleo e Gás",
    description: "Maior produtora independente de petróleo e gás no Brasil com foco em campos maduros."
  },
  {
    symbol: "SUZB3.SA",
    name: "Suzano S.A.",
    exchange: "B3 São Paulo",
    market: "Brasil",
    country: "Brasil",
    currency: "BRL",
    sector: "Materiais Básicos",
    industry: "Papel e Celulose",
    description: "Maior produtora global de celulose de eucalipto do mundo."
  },

  // --- EUROPA (DAX, CAC 40, FTSE 100, IBEX 35, SIX) ---
  {
    symbol: "MC.PA",
    name: "LVMH Moët Hennessy Louis Vuitton",
    exchange: "Euronext Paris",
    market: "Europa",
    country: "França",
    currency: "EUR",
    sector: "Consumo Discricionário",
    industry: "Luxo e Moda",
    description: "Maior conglomerado de bens de luxo do mundo (Louis Vuitton, Dior, Moët & Chandon, Bulgari)."
  },
  {
    symbol: "ASML.AS",
    name: "ASML Holding N.V.",
    exchange: "Euronext Amsterdam",
    market: "Europa",
    country: "Holanda",
    currency: "EUR",
    sector: "Tecnologia",
    industry: "Equipamentos de Litografia EUV",
    description: "Monopólio mundial em máquinas de litografia ultravioleta extrema para fabrico de chips avançados."
  },
  {
    symbol: "SAP.DE",
    name: "SAP SE",
    exchange: "Deutsche Börse XETRA",
    market: "Europa",
    country: "Alemanha",
    currency: "EUR",
    sector: "Tecnologia",
    industry: "Software de Gestão Empresarial (ERP)",
    description: "Maior empresa de software da Europa, líder mundial em soluções ERP para corporações."
  },
  {
    symbol: "SIE.DE",
    name: "Siemens AG",
    exchange: "Deutsche Börse XETRA",
    market: "Europa",
    country: "Alemanha",
    currency: "EUR",
    sector: "Bens Industriais",
    industry: "Automação Industrial e Eletrificação",
    description: "Líder mundial em tecnologia de automação industrial, redes inteligentes e mobilidade ferroviária."
  },
  {
    symbol: "TTE.PA",
    name: "TotalEnergies SE",
    exchange: "Euronext Paris",
    market: "Europa",
    country: "França",
    currency: "EUR",
    sector: "Energia",
    industry: "Petróleo, Gás e Eletricidade",
    description: "Uma das grandes petrolíferas globais integradas com forte expansão em energias renováveis."
  },
  {
    symbol: "OR.PA",
    name: "L'Oréal S.A.",
    exchange: "Euronext Paris",
    market: "Europa",
    country: "França",
    currency: "EUR",
    sector: "Consumo Básico",
    industry: "Cosméticos e Beleza",
    description: "Maior fabricante de cosméticos e produtos de beleza do mundo."
  },
  {
    symbol: "SAN.MC",
    name: "Banco Santander S.A.",
    exchange: "Bolsa de Madrid",
    market: "Europa",
    country: "Espanha",
    currency: "EUR",
    sector: "Financeiro",
    industry: "Banca Comercial",
    description: "Um dos maiores bancos da Zona Euro com forte presença na Europa e Américas."
  },
  {
    symbol: "ITX.MC",
    name: "Industria de Diseño Textil (Inditex)",
    exchange: "Bolsa de Madrid",
    market: "Europa",
    country: "Espanha",
    currency: "EUR",
    sector: "Consumo Discricionário",
    industry: "Fast Fashion e Retalho de Moda",
    description: "Dona da Zara, Massimo Dutti, Pull&Bear, Bershka e Stradivarius."
  },
  {
    symbol: "SHEL.L",
    name: "Shell plc",
    exchange: "London Stock Exchange",
    market: "Europa",
    country: "Reino Unido",
    currency: "GBP",
    sector: "Energia",
    industry: "Petróleo e Gás Natural",
    description: "Multinacional britânica de energia e principal negociadora mundial de GNL (gás natural liquefeito)."
  },
  {
    symbol: "AZN.L",
    name: "AstraZeneca PLC",
    exchange: "London Stock Exchange",
    market: "Europa",
    country: "Reino Unido",
    currency: "GBP",
    sector: "Saúde",
    industry: "Biotecnologia e Farmacêutica",
    description: "Líder biofarmacêutica britânica-sueca em tratamentos oncológicos e cardiovasculares."
  },
  {
    symbol: "NESN.SW",
    name: "Nestlé S.A.",
    exchange: "SIX Swiss Exchange",
    market: "Europa",
    country: "Suíça",
    currency: "CHF",
    sector: "Consumo Básico",
    industry: "Alimentação e Bebidas",
    description: "Maior empresa de alimentação e bebidas do mundo com marcas como Nespresso, KitKat e Purina."
  },
  {
    symbol: "AIR.PA",
    name: "Airbus SE",
    exchange: "Euronext Paris",
    market: "Europa",
    country: "França / Europa",
    currency: "EUR",
    sector: "Aeroespacial & Defesa",
    industry: "Fabricação de Aeronaves Comerciais",
    description: "Líder global na fabricação de aviões comerciais da família A320neo e A350."
  },

  // --- ÁSIA & PACÍFICO ---
  {
    symbol: "7203.T",
    name: "Toyota Motor Corporation",
    exchange: "Tokyo Stock Exchange",
    market: "Ásia",
    country: "Japão",
    currency: "JPY",
    sector: "Consumo Discricionário",
    industry: "Fabricação Automóvel",
    description: "Maior fabricante automóvel do mundo em volume de vendas e pioneira em motores híbridos."
  },
  {
    symbol: "6758.T",
    name: "Sony Group Corporation",
    exchange: "Tokyo Stock Exchange",
    market: "Ásia",
    country: "Japão",
    currency: "JPY",
    sector: "Tecnologia / Entretenimento",
    industry: "Eletrónicos e Videojogos (PlayStation)",
    description: "Conglomerado de entretenimento, música, cinema, semicondutores de imagem e consola PlayStation."
  },
  {
    symbol: "9984.T",
    name: "SoftBank Group Corp.",
    exchange: "Tokyo Stock Exchange",
    market: "Ásia",
    country: "Japão",
    currency: "JPY",
    sector: "Tecnologia / Investimentos",
    industry: "Capital de Risco e IA",
    description: "Maior investidora de risco em tecnologia através do Vision Fund e acionista controladora da Arm."
  },
  {
    symbol: "0700.HK",
    name: "Tencent Holdings Ltd.",
    exchange: "Hong Kong Stock Exchange",
    market: "Ásia",
    country: "Hong Kong / China",
    currency: "HKD",
    sector: "Tecnologia de Comunicação",
    industry: "Internet, Jogos e WeChat",
    description: "Maior empresa de videojogos do mundo e operadora da super-aplicação WeChat na China."
  },
  {
    symbol: "9988.HK",
    name: "Alibaba Group Holding Ltd.",
    exchange: "Hong Kong Stock Exchange",
    market: "Ásia",
    country: "Hong Kong / China",
    currency: "HKD",
    sector: "Consumo Discricionário",
    industry: "E-Commerce e Computação em Nuvem",
    description: "Líder chinesa em comércio eletrónico (Taobao, Tmall) e serviços de infraestrutura cloud."
  },

  // --- CANADÁ ---
  {
    symbol: "SHOP.TO",
    name: "Shopify Inc.",
    exchange: "Toronto Stock Exchange",
    market: "Canadá",
    country: "Canadá",
    currency: "CAD",
    sector: "Tecnologia",
    industry: "Software de Comércio Eletrónico",
    description: "Plataforma líder mundial para comerciantes criarem e gerirem as suas próprias lojas online."
  },
  {
    symbol: "RY.TO",
    name: "Royal Bank of Canada",
    exchange: "Toronto Stock Exchange",
    market: "Canadá",
    country: "Canadá",
    currency: "CAD",
    sector: "Financeiro",
    industry: "Banca Comercial",
    description: "Maior banco do Canadá e uma das maiores instituições financeiras da América do Norte."
  }
];

export const STOCK_MARKETS = [
  { id: "ALL", name: "Todos os Mercados Globais", count: "Milhares" },
  { id: "EUA", name: "EUA (NYSE, NASDAQ)", flag: "🇺🇸" },
  { id: "Portugal", name: "Portugal (Euronext Lisboa)", flag: "🇵🇹" },
  { id: "Europa", name: "Europa (DAX, CAC, FTSE, IBEX)", flag: "🇪🇺" },
  { id: "Brasil", name: "Brasil (B3 São Paulo)", flag: "🇧🇷" },
  { id: "Ásia", name: "Ásia (Tóquio, Hong Kong)", flag: "🇯🇵" },
  { id: "Canadá", name: "Canadá (TSX)", flag: "🇨🇦" }
];

export const STOCK_SECTORS = [
  "Todos os Setores",
  "Tecnologia",
  "Energia",
  "Financeiro",
  "Consumo Básico",
  "Consumo Discricionário",
  "Saúde / Farmacêutica",
  "Materiais Básicos",
  "Bens Industriais",
  "Comunicação",
  "Utilities"
];
