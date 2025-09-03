"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function NavMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const LinkItem = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(href) ? "text-white bg-blue-600 dark:bg-blue-500" : "text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"}`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="relative">
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-6">
        <Link href="/" className={`text-lg font-extrabold tracking-tight transition-colors ${isActive("/") ? "text-blue-600 dark:text-blue-400" : "text-neutral-900 hover:text-blue-600 dark:text-neutral-100 dark:hover:text-blue-400"}`}>
          Controle
        </Link>
        <Link href="/bills" className={`text-sm font-medium transition-colors ${isActive("/bills") ? "text-blue-600 dark:text-blue-400" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"}`}>
          Contas
        </Link>
        <Link href="/groups" className={`text-sm font-medium transition-colors ${isActive("/groups") ? "text-blue-600 dark:text-blue-400" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"}`}>
          Grupos
        </Link>
      </div>

      {/* Mobile: hamburger */}
      <div className="sm:hidden flex items-center">
        <button
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen(v => !v)}
          className="p-2 rounded-md bg-white/80 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 shadow-sm"
        >
          {open ? <XMarkIcon className="h-5 w-5 text-neutral-800 dark:text-neutral-200" /> : <Bars3Icon className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`sm:hidden absolute right-0 mt-2 w-56 transform transition-all origin-top-right ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
        style={{ zIndex: 60 }}
      >
        <div className="rounded-lg bg-white dark:bg-neutral-900 shadow-lg ring-1 ring-black/5 overflow-hidden">
          <div className="p-2">
            <LinkItem href="/">Controle</LinkItem>
            <LinkItem href="/bills">Contas</LinkItem>
            <LinkItem href="/groups">Grupos</LinkItem>
          </div>
        </div>
      </div>
    </nav>
  );
}
