import Link from "next/link";

import { BackgroundVideo } from "@/components/BackgroundVideo";

export default function ParkedPage() {
  const mainUrl = process.env.FUNSTR_MAIN_SITE_URL ?? "/";

  return (
    <div className="min-h-screen bg-[#020313] text-white">
      <BackgroundVideo />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col items-center justify-center px-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="FUNSTRATEGY"
          className="w-full max-w-[320px] object-contain sm:max-w-[420px]"
        />

        <div className="mt-8 text-base font-semibold text-white/85">
          This domain is owned and controlled by FUNSTRATEGY
        </div>

        <Link
          href={mainUrl}
          className="mt-4 text-sm font-semibold text-white/75 hover:text-white hover:underline"
        >
          Visit the main website →
        </Link>
      </main>
    </div>
  );
}


