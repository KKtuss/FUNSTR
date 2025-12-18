import Link from "next/link";
import { Space_Grotesk } from "next/font/google";

import { BackgroundVideo } from "@/components/BackgroundVideo";
import { SiteHeader } from "@/components/SiteHeader";
import { LatestDomainsTerminal } from "@/components/LatestDomainsTerminal";
import { CopyOnClickText } from "@/components/CopyOnClickText";
import { Reveal } from "@/components/Reveal";
import { token } from "@/lib/token";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
});

function normalizeAmount(value: string) {
  return value.replace(/^\s*[$€£]\s*/, "").trim();
}

function Stat({ label, value }: { label: string; value: string }) {
  const v = normalizeAmount(value);
  return (
    <div className="rounded-3xl bg-black/35 p-4 ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-[2px] hover:ring-white/20 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="text-3xl font-black tracking-tight text-cyan-200 sm:text-4xl">
          {v}
        </div>

        <div className="mt-4 h-px w-full bg-white/10" />

        <div className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-white/65 sm:text-xs">
          {label}
        </div>
      </div>
    </div>
  );
}

function HowStep({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-black/35 p-4 ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-[2px] hover:ring-white/20 sm:p-8">
      <div className="flex items-center justify-between">
        <div className="text-xs font-extrabold tracking-wide text-white/55 sm:text-sm">
          {step}
        </div>
        <div className="h-2 w-2 rounded-full bg-cyan-300/70" />
      </div>
      <div className="mt-3 break-words text-base font-extrabold text-white sm:text-lg">
        {title}
      </div>
      <div className="mt-3 break-words text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
        {body}
      </div>
    </div>
  );
}

function LinkRow({
  label,
  href,
  external = false,
}: {
  label: string;
  href: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={[
        "group relative flex items-center justify-between overflow-hidden",
        "rounded-2xl bg-black/35 px-4 py-3 ring-1 ring-white/10 sm:px-5 sm:py-4",
        "transition hover:-translate-y-[1px] hover:bg-black/25 hover:ring-white/20",
      ].join(" ")}
    >
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-300/60 via-indigo-400/30 to-transparent opacity-70" />
      <div className="min-w-0 pr-4 text-sm font-semibold text-white/90 sm:text-base">
        <span className="block truncate">{label}</span>
      </div>
      <div className="shrink-0 text-white/45 transition group-hover:text-white/75">
        →
      </div>
    </Link>
  );
}

export default function Home() {
  const actions = [
    token.links.buy && { label: "Buy $FUNSTR", href: token.links.buy },
    token.links.chart && { label: "Chart", href: token.links.chart },
    token.links.telegram && { label: "Telegram", href: token.links.telegram },
    token.links.x && { label: "X (Twitter)", href: token.links.x },
    token.links.whitepaper && {
      label: "Whitepaper",
      href: token.links.whitepaper,
    },
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#020313] text-white">
      <BackgroundVideo />

      <SiteHeader />

      <main className="relative z-10 mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 sm:py-14 lg:max-w-[1400px] lg:px-10 2xl:max-w-[1560px]">
        {/* Row 1: Hero (left) + Reserve overview (right) */}
        <section className="grid gap-8 sm:gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <Reveal delayMs={30}>
              <h1
                className={`${displayFont.className} break-words text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl`}
              >
                <span className="text-white drop-shadow-[0_0_16px_rgba(255,255,255,0.22)] sm:drop-shadow-[0_0_20px_rgba(255,255,255,0.26)]">
                  WHY FUNSTRATEGY?
                </span>
              </h1>
            </Reveal>

            <Reveal delayMs={120}>
              <p className="mt-4 max-w-2xl text-[13px] leading-5 text-white/75 sm:mt-6 sm:text-lg sm:leading-8 lg:text-xl">
                {token.tagline}
              </p>
            </Reveal>

            <Reveal delayMs={170}>
              <div className="mt-4 sm:mt-5">
                <Link
                  href="/domains"
                  className="text-sm font-semibold text-white/80 hover:text-white hover:underline sm:text-base"
                >
                  View .fun domains reserve →
                </Link>
              </div>
            </Reveal>

            <Reveal delayMs={240}>
              <div className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-5">
                <Stat label="Domains bought" value={token.domainsBought ?? "0"} />
                <Stat label="Total spent" value={token.totalSpent ?? "0"} />
              </div>
            </Reveal>

          </div>

          <div className="lg:col-span-5">
            <Reveal delayMs={140}>
              <LatestDomainsTerminal />
            </Reveal>
          </div>
        </section>

        <Reveal delayMs={80}>
          <div className="mt-8 text-center sm:mt-10">
            <span className="text-sm font-semibold text-white/55 sm:text-base">
              CA:
            </span>{" "}
            <CopyOnClickText
              text={token.contractAddress}
              className="inline-block max-w-full select-all break-all font-mono text-[13px] text-white/80 hover:text-white hover:underline sm:text-base cursor-pointer"
              copiedLabel="Copied"
            />
          </div>
        </Reveal>

        {/* Row 2: How it works (left) + Links (right) */}
        <section className="mt-12 grid gap-8 border-t border-white/10 pt-12 sm:mt-14 sm:gap-10 sm:pt-14 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-7">
            <Reveal delayMs={60} className="h-full">
              <div
                className={`${displayFont.className} text-lg font-extrabold tracking-wide text-white sm:text-xl lg:text-2xl`}
              >
                How it works
              </div>
              <div className="mt-2 max-w-3xl text-sm text-white/65 sm:text-base">
                Our strategy loop breakout
              </div>

              <div className="mt-5 grid gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-5">
                <HowStep
                  step="01"
                  title="Domain acquisition"
                  body="Automated procurement of random .fun domain funded by creator fees at a rate of two domains per minute"
                />
                <HowStep
                  step="02"
                  title="Route to parked pages"
                  body={
                    <>
                      Each domain points to our{" "}
                      <Link
                        href="/parked"
                        className="font-semibold text-white/80 hover:text-white hover:underline"
                      >
                        parked page
                      </Link>{" "}
                      and shows the FUNSTRATEGY-owned landing page.
                    </>
                  }
                />
                <HowStep
                  step="03"
                  title="Grow the reserve"
                  body="We curate and hold the strongest names, measure what performs, and reinvest into the next wave of domains."
                />
                <HowStep
                  step="04"
                  title="Increase our exposure"
                  body="Every new .fun domain expands reach and attention across the ecosystem."
                />
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:self-stretch">
            <Reveal delayMs={110} className="h-full">
              <div className="flex h-full flex-col">
                <div
                  className={`${displayFont.className} text-lg font-extrabold text-white sm:text-xl lg:text-2xl`}
                >
                  Project Links
                </div>
                <div className="mt-2 text-sm text-white/60">
                  Official destinations and resources.
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:mt-6 lg:flex-1 lg:[&>a]:flex-1">
                  {actions.map((a) => (
                    <LinkRow
                      key={a.label}
                      label={a.label}
                      href={a.href}
                      external
                    />
                  ))}
                  <LinkRow label="Domains (live list)" href="/domains" />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <footer className="mt-12 border-t border-white/10 py-8 text-sm text-white/45 sm:mt-16 sm:py-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              © {new Date().getFullYear()} {token.name}. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <Link href="/domains" className="hover:text-white/70">
                Domains
              </Link>
              <a
                href={token.links.x ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
                className="hover:text-white/70"
          >
                X
          </a>
        </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
