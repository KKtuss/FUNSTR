import { BackgroundVideo } from "@/components/BackgroundVideo";
import { SiteHeader } from "@/components/SiteHeader";
import { Reveal } from "@/components/Reveal";

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#020313] text-white">
      <BackgroundVideo />

      <SiteHeader />

      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <Reveal delayMs={40}>
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                FUNSTRATEGY Whitepaper
              </h1>
              <p className="mt-4 text-lg text-white/75 sm:text-xl">
                The complete technical documentation of the FUNSTRATEGY domain curation and acquisition system.
              </p>
            </div>

            <div className="mt-12 space-y-12">
              <section className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
                <h2 className="text-2xl font-extrabold sm:text-3xl">1. Overview</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-white/80 sm:text-lg">
                  <p>
                    FUNSTRATEGY ($FUNSTR) is a strategic domain reserve system built around the .fun TLD. 
                    Our platform combines automated domain curation, market analysis, and intelligent acquisition 
                    to build and maintain a premium portfolio of .fun domains.
                  </p>
                  <p>
                    The system operates through a multi-stage pipeline that ingests market data, extracts domain 
                    features, scores potential acquisitions, and adapts strategies based on performance metrics.
                  </p>
                </div>
              </section>

              <section className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
                <h2 className="text-2xl font-extrabold sm:text-3xl">2. Architecture</h2>
                <div className="mt-4 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-cyan-200">2.1 Curation Pipeline</h3>
                    <div className="mt-3 space-y-3 text-base leading-7 text-white/80 sm:text-lg">
                      <p>
                        The curation pipeline operates on a daily cadence, executing four distinct stages:
                      </p>
                      <ul className="ml-6 list-disc space-y-2">
                        <li><strong>INGEST:</strong> Collects domain data from GoDaddy API and market signals</li>
                        <li><strong>EXTRACT:</strong> Analyzes domain features (length, structure, tokens, patterns)</li>
                        <li><strong>SCORE:</strong> Evaluates domains using heuristic algorithms and market alignment</li>
                        <li><strong>ADAPT:</strong> Updates acquisition strategies based on performance data</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-cyan-200">2.2 Domain Agent (Oracle)</h3>
                    <div className="mt-3 space-y-3 text-base leading-7 text-white/80 sm:text-lg">
                      <p>
                        The Domain Agent provides intelligent explanations for domain acquisitions and portfolio analysis. 
                        It uses heuristic scoring algorithms to evaluate domains based on:
                      </p>
                      <ul className="ml-6 list-disc space-y-2">
                        <li>Label length and brandability (4-7 character sweet spot)</li>
                        <li>Structure quality (hyphen/digit penalties, vowel ratios)</li>
                        <li>Market-aligned tokens (AI, creator, novelty terms)</li>
                        <li>Culture-centric numerics (404, 69, 420, 1337)</li>
                        <li>Pronounceability and syllable patterns</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
                <h2 className="text-2xl font-extrabold sm:text-3xl">3. Automation Systems</h2>
                <div className="mt-4 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-cyan-200">3.1 Vercel Cron Job</h3>
                    <div className="mt-3 space-y-3 text-base leading-7 text-white/80 sm:text-lg">
                      <p>
                        A scheduled Vercel cron job runs daily to automatically assign and process domain acquisitions. 
                        The cron job:
                      </p>
                      <ul className="ml-6 list-disc space-y-2">
                        <li>Executes at a fixed UTC time (configurable via environment variables)</li>
                        <li>Triggers the curation pipeline stages sequentially</li>
                        <li>Processes domain assignments based on market signals and scoring</li>
                        <li>Updates portfolio statistics and market analysis</li>
                        <li>Logs all actions for audit and monitoring</li>
                      </ul>
                      <p className="mt-4 rounded-xl bg-white/5 p-4 text-sm">
                        <strong>Endpoint:</strong> <code className="text-cyan-300">/api/cron/sync-domains</code><br />
                        <strong>Schedule:</strong> Daily at 00:00 UTC (configurable)<br />
                        <strong>Implementation:</strong> Vercel Cron Jobs with serverless function execution
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-cyan-200">3.2 GoDaddy API Integration</h3>
                    <div className="mt-3 space-y-3 text-base leading-7 text-white/80 sm:text-lg">
                      <p>
                        The system integrates with GoDaddy's API for automated domain purchases and management:
                      </p>
                      <ul className="ml-6 list-disc space-y-2">
                        <li><strong>Domain Search:</strong> Queries available .fun domains via GoDaddy API</li>
                        <li><strong>Automated Purchases:</strong> Executes buys for high-scoring domains</li>
                        <li><strong>Portfolio Management:</strong> Tracks owned domains, expiration dates, and status</li>
                        <li><strong>Price Tracking:</strong> Monitors domain pricing and renewal costs</li>
                        <li><strong>DNS Configuration:</strong> Automatically configures name servers and DNS records</li>
                      </ul>
                      <p className="mt-4 rounded-xl bg-white/5 p-4 text-sm">
                        <strong>API Endpoint:</strong> <code className="text-cyan-300">/api/godaddy/domains</code><br />
                        <strong>Authentication:</strong> GoDaddy API Key + Secret (environment variables)<br />
                        <strong>Rate Limiting:</strong> Respects GoDaddy API rate limits with exponential backoff<br />
                        <strong>Error Handling:</strong> Comprehensive retry logic and fallback mechanisms
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
                <h2 className="text-2xl font-extrabold sm:text-3xl">4. Market Analysis</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-white/80 sm:text-lg">
                  <p>
                    The system maintains a global market baseline derived from .fun domain heuristics, not just 
                    owned domains. This ensures accurate market representation:
                  </p>
                  <ul className="ml-6 list-disc space-y-2">
                    <li><strong>Top Market Criteria:</strong> Tracks most bidded/searched keywords (AI, Rooms, Creator)</li>
                    <li><strong>Shape Patterns:</strong> Analyzes domain structure patterns (length, hyphens, digits)</li>
                    <li><strong>Dominance Metrics:</strong> Calculates market share percentages for top criteria</li>
                    <li><strong>Daily Regime Wobble:</strong> Introduces realistic market fluctuations</li>
                    <li><strong>Baseline Statistics:</strong> Average label length, brandable %, short %, hyphen %, digits %</li>
                  </ul>
                </div>
              </section>

              <section className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
                <h2 className="text-2xl font-extrabold sm:text-3xl">5. Scoring Algorithm</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-white/80 sm:text-lg">
                  <p>
                    Domains are scored using a multi-factor heuristic algorithm (0-100 scale):
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl bg-white/5 p-4">
                      <strong className="text-cyan-200">Length Score:</strong> 4-8 characters optimal (up to +14 points)
                    </div>
                    <div className="rounded-xl bg-white/5 p-4">
                      <strong className="text-cyan-200">Structure Score:</strong> Penalties for hyphens (-8) and digits (-10, or -3 for culture numerics)
                    </div>
                    <div className="rounded-xl bg-white/5 p-4">
                      <strong className="text-cyan-200">Brandability:</strong> 4-7 letter, letters-only domains (+10 points)
                    </div>
                    <div className="rounded-xl bg-white/5 p-4">
                      <strong className="text-cyan-200">Pronounceability:</strong> Vowel ratio 30-60% optimal (+6 points)
                    </div>
                    <div className="rounded-xl bg-white/5 p-4">
                      <strong className="text-cyan-200">Token Alignment:</strong> Market-validated keywords (+12 bump, e.g., AI, Rooms, Creator)
                    </div>
                    <div className="rounded-xl bg-white/5 p-4">
                      <strong className="text-cyan-200">Momentum:</strong> Portfolio token frequency (logarithmic scaling, capped at 24)
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
                <h2 className="text-2xl font-extrabold sm:text-3xl">6. Data Flow</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-white/80 sm:text-lg">
                  <ol className="ml-6 list-decimal space-y-3">
                    <li><strong>Daily Cron Trigger:</strong> Vercel cron job initiates the curation pipeline</li>
                    <li><strong>Market Data Ingestion:</strong> System fetches market signals and domain availability</li>
                    <li><strong>Feature Extraction:</strong> Domains are analyzed for structural and semantic features</li>
                    <li><strong>Scoring & Ranking:</strong> Each domain receives a score and is ranked against market baseline</li>
                    <li><strong>Acquisition Decision:</strong> High-scoring domains are queued for purchase</li>
                    <li><strong>GoDaddy API Call:</strong> Automated purchase requests are sent to GoDaddy</li>
                    <li><strong>Portfolio Update:</strong> New acquisitions are added to the portfolio database</li>
                    <li><strong>Strategy Adaptation:</strong> Pipeline adjusts based on acquisition success and market trends</li>
                  </ol>
                </div>
              </section>

              <section className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
                <h2 className="text-2xl font-extrabold sm:text-3xl">7. Security & Reliability</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-white/80 sm:text-lg">
                  <ul className="ml-6 list-disc space-y-2">
                    <li><strong>API Key Management:</strong> GoDaddy credentials stored in secure environment variables</li>
                    <li><strong>Rate Limiting:</strong> Respects API limits with exponential backoff and retry logic</li>
                    <li><strong>Error Handling:</strong> Comprehensive try-catch blocks and fallback mechanisms</li>
                    <li><strong>Audit Logging:</strong> All acquisitions and decisions are logged for review</li>
                    <li><strong>Budget Controls:</strong> Configurable spending limits per acquisition cycle</li>
                    <li><strong>Validation:</strong> Multiple validation layers before executing purchases</li>
                  </ul>
                </div>
              </section>

              <section className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
                <h2 className="text-2xl font-extrabold sm:text-3xl">8. Future Enhancements</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-white/80 sm:text-lg">
                  <ul className="ml-6 list-disc space-y-2">
                    <li>Machine learning integration for improved scoring accuracy</li>
                    <li>Multi-registry support (beyond GoDaddy)</li>
                    <li>Real-time market data feeds</li>
                    <li>Advanced portfolio analytics and reporting</li>
                    <li>Community-driven domain suggestions</li>
                    <li>Automated domain sales and marketplace integration</li>
                  </ul>
                </div>
              </section>
            </div>

            <div className="mt-12 rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
              <p className="text-center text-sm text-white/60">
                Last updated: {new Date().toLocaleDateString("en-US", { 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </p>
            </div>
          </div>
        </Reveal>
      </main>
    </div>
  );
}

