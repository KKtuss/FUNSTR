import { BackgroundVideo } from "@/components/BackgroundVideo";
import { SiteHeader } from "@/components/SiteHeader";
import { DomainsClient } from "@/app/domains/DomainsClient";
import { Reveal } from "@/components/Reveal";

export default function DomainsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#020313] text-white">
      <BackgroundVideo />

      <SiteHeader />

      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <Reveal delayMs={40}>
          <DomainsClient />
        </Reveal>
      </main>
    </div>
  );
}


