import React from "react";
import "./globals.css";
import { NavMenu } from "@/components/NavMenu";
import { ThemeSwitch } from "@/components/ThemeSwitch";

export const metadata = {
  title: "Controle de Contas",
  description: "Gerencie grupos, membros e contas de forma simples.",
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
        <header className="w-full border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30 shadow-sm">
          <div className="container mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-3 px-4">
            <div className="flex flex-1 items-center justify-center sm:justify-start">
              <h1 className="text-2xl font-extrabold tracking-tight text-blue-700 dark:text-blue-300 drop-shadow-sm select-none">Controle de Contas</h1>
            </div>
            <div className="flex flex-1 items-center justify-center sm:justify-center mt-2 sm:mt-0">
              <NavMenu />
            </div>
            <div className="flex flex-1 items-center justify-center sm:justify-end mt-2 sm:mt-0">
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
