import Link from "next/link";

import { HeaderNav } from "@/components/HeaderNav";
import { LogoMark } from "@/components/LogoMark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 overflow-visible bg-black/35 ring-1 ring-white/10 backdrop-blur">
      {/* Full-width header; on desktop keep padding tiny so logo/nav sit near viewport edges */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
        <div className="relative flex h-16 items-center overflow-visible sm:h-24">
          {/* Keep the logo huge, but let it float outside the shorter header bar */}
          <Link
            href="/"
            className="absolute left-0 top-1/2 -translate-y-1/2 origin-left scale-[0.72] sm:scale-100"
            aria-label="Home"
          >
            <LogoMark alt="FUNSTRATEGY logo" size={120} />
          </Link>

          <HeaderNav />
        </div>
      </div>
    </header>
  );
}


