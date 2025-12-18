"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function HeaderNav() {
  const pathname = usePathname() ?? "/";
  const onDomains = pathname === "/domains" || pathname.startsWith("/domains/");

  return (
    <nav className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-wrap items-center gap-1 text-xs font-semibold sm:text-sm lg:gap-2">
      {onDomains ? (
        <Link
          href="/"
          className="rounded-full px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white sm:px-4"
        >
          Token
        </Link>
      ) : (
        <Link
          href="/domains"
          className="rounded-full px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white sm:px-4"
        >
          Domains
        </Link>
      )}
    </nav>
  );
}


