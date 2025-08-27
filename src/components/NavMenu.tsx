"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMenu() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);
  return (
    <div className="flex items-center gap-6">
      <Link
        href="/"
        className={`text-sm font-semibold tracking-tight transition-colors ${isActive("/") ? "text-blue-600 dark:text-blue-400" : "text-neutral-900 hover:text-blue-600 dark:text-neutral-100 dark:hover:text-blue-400"}`}
      >
        Controle
      </Link>
      <Link
        href="/bills"
        className={`text-sm font-medium transition-colors ${isActive("/bills") ? "text-blue-600 dark:text-blue-400" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"}`}
      >
        Contas
      </Link>
      <Link
        href="/groups"
        className={`text-sm font-medium transition-colors ${isActive("/groups") ? "text-blue-600 dark:text-blue-400" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"}`}
      >
        Grupos
      </Link>
    </div>
  );
}
