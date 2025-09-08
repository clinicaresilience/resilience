import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./styles/globals.css";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

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
      <head>
        {/* Garante responsividade em mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`!bg-azul-ciano-claro min-h-screen ${geistSans.variable} ${geistMono.variable} antialiased pt-24`}
      >
        <AuthProvider>
          <AuthenticatedLayout>
            {children}
          </AuthenticatedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
