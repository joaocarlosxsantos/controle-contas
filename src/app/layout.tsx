import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { ThemeSwitch } from "../components/ThemeSwitch";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Controle de Contas",
  description: "Aplicação web para divisão de contas domésticas entre membros da família.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/controle-contas-favicon.svg" />
        <title>Controle de Contas</title>
      </head>
      <body
        className={`min-h-screen bg-background text-foreground antialiased transition-colors ${geistSans.variable} ${geistMono.variable}`}
      >
        <nav className="flex items-center gap-4 bg-blue-600 px-4 py-3 text-white dark:bg-neutral-900">
          <a href="/families" className="hover:underline">Famílias</a>
          <a href="/bills" className="hover:underline">Contas</a>
          <div className="ml-auto">
            <ThemeSwitch />
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
