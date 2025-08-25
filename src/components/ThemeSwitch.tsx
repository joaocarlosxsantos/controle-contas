"use client";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export function ThemeSwitch() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Detecta tema salvo ou preferência do sistema
    const saved = localStorage.getItem("theme");
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <button
      aria-label="Alternar tema"
      onClick={toggleTheme}
      className="ml-auto flex items-center gap-2 rounded px-2 py-1 text-sm font-medium transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800"
      style={{ background: "none", border: "none", cursor: "pointer" }}
    >
      {theme === "dark" ? (
        <SunIcon className="h-5 w-5 text-yellow-400" />
      ) : (
        <MoonIcon className="h-5 w-5 text-gray-800" />
      )}
      <span className="hidden sm:inline">{theme === "dark" ? "Claro" : "Escuro"}</span>
    </button>
  );
}
