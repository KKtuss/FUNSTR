import Link from "next/link";

import { LogoMark } from "@/components/LogoMark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 overflow-visible border-b border-white/10 bg-[#050a1d]/75 backdrop-blur">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="relative flex h-20 items-center sm:h-24">
          {/* Keep the logo huge, but let it float outside the shorter header bar */}
          <Link
            href="/"
            className="absolute left-0 top-1/2 -translate-y-1/2 origin-left scale-[0.72] sm:scale-100"
            aria-label="Home"
          >
            <LogoMark alt="FUNSTRATEGY logo" size={120} />
          </Link>

          <nav className="ml-auto flex flex-wrap items-center gap-1 text-xs font-semibold sm:text-sm">
          <Link
            href="/"
            className="rounded-full px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white sm:px-4"
          >
            Token
          </Link>
          <Link
            href="/domains"
            className="rounded-full px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white sm:px-4"
          >
            Domains
          </Link>
        </nav>
        </div>
      </div>
    </header>
  );
}


