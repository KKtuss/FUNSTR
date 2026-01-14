import Link from "next/link";

import { HeaderNav } from "@/components/HeaderNav";
import { LogoMark } from "@/components/LogoMark";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 overflow-visible bg-black/35 ring-1 ring-white/10 backdrop-blur">
      {/* Full-width header; on desktop keep padding tiny so logo/nav sit near viewport edges */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
        <div className="relative flex h-[72px] items-center justify-between overflow-visible sm:h-24">
          {/* Keep the logo huge, but let it float outside the shorter header bar */}
          <div className="relative flex items-center">
            <Link
              href="/"
              className="absolute left-0 top-1/2 -translate-y-1/2 origin-left scale-[0.72] sm:scale-100"
              aria-label="Home"
            >
              <LogoMark alt="FUNSTRATEGY logo" size={120} />
            </Link>
            {/* Spacer for the logo */}
            <div className="w-[86px] sm:w-[120px]" />
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <HeaderNav />
            <ConnectWalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}


