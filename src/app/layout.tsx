import React from "react";
import "./globals.css";
import { NavMenu } from "@/components/NavMenu";
import { ThemeSwitch } from "@/components/ThemeSwitch";

export const metadata = {
  title: "Controle de Contas",
  description: "Gerencie grupos, membros e contas de forma simples.",
  icons: {
    icon: '/controle-contas-favicon.svg',
    shortcut: '/controle-contas-favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground transition-colors">
        {/* Script para evitar flash de tema (FART) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
  <header className="w-full border-b border-border bg-background backdrop-blur sticky top-0 z-30 shadow-sm">
          <div className="container mx-auto flex items-center justify-between py-3 px-4 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-blue-700 dark:text-blue-300 drop-shadow-sm select-none truncate">Controle de Contas</h1>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <NavMenu />
            </div>
            <div className="flex items-center justify-end">
              <ThemeSwitch />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 flex-1 flex flex-col gap-8">
          {children}
        </main>
      </body>
    </html>
  );
}
