import Link from "next/link";

import { BackgroundVideo } from "@/components/BackgroundVideo";
import { SiteHeader } from "@/components/SiteHeader";
import { CopyField } from "@/components/ui/CopyField";
import { token } from "@/lib/token";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
      <div className="text-xs font-semibold tracking-wide text-white/50">
        {label}
      </div>
      <div className="mt-2 text-base font-bold text-white">{value}</div>
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
  body: string;
}) {
  return (
    <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
      <div className="flex items-center justify-between">
        <div className="text-xs font-extrabold tracking-wide text-white/50">
          {step}
        </div>
        <div className="h-2 w-2 rounded-full bg-cyan-300/70" />
      </div>
      <div className="mt-3 text-base font-extrabold text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-white/70">{body}</div>
    </div>
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
    <div className="min-h-screen bg-[#020313] text-white">
      <BackgroundVideo />

      <SiteHeader />

      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10">
        <section className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              FUNSTRATEGY
              <span className="text-white/60"> ($FUNSTR)</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              {token.tagline}
            </p>

            <div className="mt-4">
              <Link
                href="/domains"
                className="text-sm font-semibold text-white/80 hover:text-white hover:underline"
              >
                View .fun domains reserve →
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Stat label="Domains bought" value={token.domainsBought ?? "0"} />
              <Stat label="Total spent" value={token.totalSpent ?? "$0"} />
            </div>

            <div className="mt-6">
              <CopyField label="Contract Address" value={token.contractAddress} />
            </div>

            <div className="mt-6 text-xs leading-5 text-white/50">
              Not financial advice. Always verify contract addresses and links
              from official sources.
            </div>

            <section className="mt-12">
              <div className="text-sm font-extrabold tracking-wide text-white">
                How it works
              </div>
              <div className="mt-2 max-w-2xl text-sm text-white/65">
                A simple loop: acquire great .fun names, route them to the
                project, and reward creators as the reserve grows.
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <HowStep
                  step="01"
                  title="Acquire .fun domains"
                  body="FUNSTRATEGY accumulates a strategic reserve of .fun domains."
                />
                <HowStep
                  step="02"
                  title="Route to parked pages"
                  body="Each domain points to our Vercel setup and shows the FUNSTRATEGY-owned landing page."
                />
                <HowStep
                  step="03"
                  title="Creator rewards"
                  body="Creators receive rewards tied to activity and growth of the .fun reserve."
                />
                <HowStep
                  step="04"
                  title="Grow the reserve"
                  body="More domains, more visibility, more activity—fueling the ecosystem around FUNSTR."
                />
              </div>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
              <div className="text-sm font-extrabold text-white">
                Project Links
              </div>
              <div className="mt-4 grid gap-3">
                {actions.map((a) => (
                  <Link
                    key={a.label}
                    href={a.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 ring-1 ring-white/10 hover:bg-white/10"
                  >
                    {a.label}
                  </Link>
                ))}
                <Link
                  href="/domains"
                  className="rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 ring-1 ring-white/10 hover:bg-white/10"
                >
                  GoDaddy Domains (live list)
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t border-white/10 py-10 text-sm text-white/45">
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
