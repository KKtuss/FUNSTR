"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function HeaderNav() {
  const pathname = usePathname() ?? "/";
  
  const isHome = pathname === "/";
  const isDomains = pathname.startsWith("/domains");
  const isWhitepaper = pathname.startsWith("/whitepaper");

  const linkClass = "px-1 py-1 text-white/75 hover:text-white hover:underline underline-offset-4 sm:px-2";

  return (
    <nav className="flex items-center gap-2 text-xs font-semibold sm:text-sm lg:gap-4">
      {!isHome && (
        <Link href="/" className={linkClass}>
          Token
        </Link>
      )}
      {!isDomains && (
        <Link href="/domains" className={linkClass}>
          Domains
        </Link>
      )}
      {!isWhitepaper && (
        <Link href="/whitepaper" className={linkClass}>
          Whitepaper
        </Link>
      )}
    </nav>
  );
}
