import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./styles/globals.css";
import Navegacao from "@/components/navegacao";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clinica Resilience",
  description: "Uma ferramenta para centralizar as operações da clinica",
  icons: {
    icon: "./assets/icones/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`!bg-azul-ciano-claro overflow-auto ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navegacao />
        {children}
      </body>
    </html>
  );
}
