import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AçõesRadar AI | Avaliação de Ações & Previsão Sobe ou Desce",
  description: "Plataforma de análise técnica e fundamental de ações com cobertura mundial de todos os tickers. Veredito preditivo de subida ou descida e analisador visual de fotos de gráficos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt" className="dark">
      <body className="bg-[#070b12] text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
