import Link from "next/link";

import { BackgroundVideo } from "@/components/BackgroundVideo";
import { SiteHeader } from "@/components/SiteHeader";
import { DomainsClient } from "@/app/domains/DomainsClient";

export default function DomainsPage() {
  return (
    <div className="min-h-screen bg-[#020313] text-white">
      <BackgroundVideo />

      <SiteHeader />

      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-col gap-2">
          <div className="text-3xl font-extrabold tracking-tight">
            Domains owned by the project
          </div>
          <div className="text-sm text-white/65">
            This list is fetched from GoDaddy via a server-side API route, so
            your credentials stay private.{" "}
            <Link href="/" className="font-semibold text-white/80 hover:underline">
              Back to token page
            </Link>
            .
          </div>
        </div>

        <DomainsClient />
      </main>
    </div>
  );
}


