"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "バズ検索" },
  { href: "/dashboard", label: "ダッシュボード" },
  { href: "/own-posts", label: "自分の投稿" },
  { href: "/analysis", label: "勝ちパターン分析" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-xs font-semibold text-white">
            X
          </span>
          <span className="text-sm font-semibold tracking-tight text-neutral-900">
            X Buzz Analyzer
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  active ? "font-medium text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
