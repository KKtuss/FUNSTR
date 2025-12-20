"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function HeaderNav() {
  const pathname = usePathname() ?? "/";
  const onDomains = pathname === "/domains" || pathname.startsWith("/domains/");
  const onWhitepaper = pathname === "/whitepaper" || pathname.startsWith("/whitepaper/");

  return (
    <nav className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-wrap items-center gap-1 text-xs font-semibold sm:text-sm lg:gap-2">
      {onDomains ? (
        <>
          <Link
            href="/"
            className="px-1 py-1 text-white/75 hover:text-white hover:underline underline-offset-4 sm:px-2"
          >
            Token
          </Link>
          <Link
            href="/whitepaper"
            className="px-1 py-1 text-white/75 hover:text-white hover:underline underline-offset-4 sm:px-2"
          >
            Whitepaper
          </Link>
        </>
      ) : onWhitepaper ? (
        <>
          <Link
            href="/"
            className="px-1 py-1 text-white/75 hover:text-white hover:underline underline-offset-4 sm:px-2"
          >
            Token
          </Link>
          <Link
            href="/domains"
            className="px-1 py-1 text-white/75 hover:text-white hover:underline underline-offset-4 sm:px-2"
          >
            Domains
          </Link>
        </>
      ) : (
        <>
          <Link
            href="/domains"
            className="px-1 py-1 text-white/75 hover:text-white hover:underline underline-offset-4 sm:px-2"
          >
            Domains
          </Link>
          <Link
            href="/whitepaper"
            className="px-1 py-1 text-white/75 hover:text-white hover:underline underline-offset-4 sm:px-2"
          >
            Whitepaper
          </Link>
        </>
      )}
    </nav>
  );
}


