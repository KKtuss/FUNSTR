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
                How FUNSTRATEGY builds and maintains a strategic reserve of premium .fun domains.
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
                    The system operates through a multi-stage pipeline that analyzes market data, evaluates domain 
                    potential, and automatically acquires high-value domains based on sophisticated scoring algorithms.
                  </p>
                </div>
              </section>

              <section className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
                <h2 className="text-2xl font-extrabold sm:text-3xl">2. How It Works</h2>
                <div className="mt-4 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-cyan-200">2.1 Curation Pipeline</h3>
                    <div className="mt-3 space-y-3 text-base leading-7 text-white/80 sm:text-lg">
                      <p>
                        Our curation pipeline runs daily, executing four distinct stages:
                      </p>
                      <ul className="ml-6 list-disc space-y-2">
                        <li><strong>INGEST:</strong> Collects domain data and market signals</li>
                        <li><strong>EXTRACT:</strong> Analyzes domain features including length, structure, and patterns</li>
                        <li><strong>SCORE:</strong> Evaluates domains using our proprietary algorithms</li>
                        <li><strong>ADAPT:</strong> Updates acquisition strategies based on performance data</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-cyan-200">2.2 Domain Agent</h3>
                    <div className="mt-3 space-y-3 text-base leading-7 text-white/80 sm:text-lg">
                      <p>
                        Our Domain Agent provides intelligent analysis of domain acquisitions and portfolio performance. 
                        It evaluates domains based on multiple factors:
                      </p>
                      <ul className="ml-6 list-disc space-y-2">
                        <li>Label length and brandability</li>
                        <li>Structure quality and readability</li>
                        <li>Market-aligned keywords and trends</li>
                        <li>Pronounceability and memorability</li>
                        <li>Cultural relevance and appeal</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
                <h2 className="text-2xl font-extrabold sm:text-3xl">3. Automation</h2>
                <div className="mt-4 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-cyan-200">3.1 Automated Scheduling</h3>
                    <div className="mt-3 space-y-3 text-base leading-7 text-white/80 sm:text-lg">
                      <p>
                        A scheduled cron job runs daily to automatically process domain acquisitions. This ensures:
                      </p>
                      <ul className="ml-6 list-disc space-y-2">
                        <li>Consistent daily evaluation of market opportunities</li>
                        <li>Automated execution of the curation pipeline</li>
                        <li>Systematic portfolio growth and optimization</li>
                        <li>Real-time updates to market analysis and statistics</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-cyan-200">3.2 Automated Domain Purchases</h3>
                    <div className="mt-3 space-y-3 text-base leading-7 text-white/80 sm:text-lg">
                      <p>
                        The system integrates with domain registrar APIs to automatically purchase high-scoring domains:
                      </p>
                      <ul className="ml-6 list-disc space-y-2">
                        <li>Automated search and discovery of available domains</li>
                        <li>Intelligent purchase decisions based on scoring algorithms</li>
                        <li>Portfolio management and tracking</li>
                        <li>Automatic DNS configuration and setup</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
                <h2 className="text-2xl font-extrabold sm:text-3xl">4. Market Analysis</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-white/80 sm:text-lg">
                  <p>
                    Our system maintains a comprehensive view of the .fun domain market, tracking:
                  </p>
                  <ul className="ml-6 list-disc space-y-2">
                    <li><strong>Top Market Criteria:</strong> Most searched and in-demand keywords and patterns</li>
                    <li><strong>Structure Patterns:</strong> Analysis of domain length, hyphens, and digit usage</li>
                    <li><strong>Market Dominance:</strong> Share percentages for trending criteria</li>
                    <li><strong>Baseline Statistics:</strong> Average characteristics of premium .fun domains</li>
                  </ul>
                  <p className="mt-4">
                    This market intelligence ensures our acquisitions align with current trends and future potential.
                  </p>
                </div>
              </section>

              <section className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
                <h2 className="text-2xl font-extrabold sm:text-3xl">5. Domain Scoring</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-white/80 sm:text-lg">
                  <p>
                    Each domain is evaluated using a multi-factor scoring system that considers:
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl bg-white/5 p-4">
                      <strong className="text-cyan-200">Length:</strong> Optimal domain length for memorability and brandability
                    </div>
                    <div className="rounded-xl bg-white/5 p-4">
                      <strong className="text-cyan-200">Structure:</strong> Clean, readable formats preferred over complex patterns
                    </div>
                    <div className="rounded-xl bg-white/5 p-4">
                      <strong className="text-cyan-200">Brandability:</strong> Letters-only domains with strong brand potential
                    </div>
                    <div className="rounded-xl bg-white/5 p-4">
                      <strong className="text-cyan-200">Pronounceability:</strong> Easy to say and remember
                    </div>
                    <div className="rounded-xl bg-white/5 p-4">
                      <strong className="text-cyan-200">Market Alignment:</strong> Relevance to current market trends and demand
                    </div>
                    <div className="rounded-xl bg-white/5 p-4">
                      <strong className="text-cyan-200">Portfolio Fit:</strong> How well the domain complements existing holdings
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
                <h2 className="text-2xl font-extrabold sm:text-3xl">6. The Process</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-white/80 sm:text-lg">
                  <ol className="ml-6 list-decimal space-y-3">
                    <li><strong>Daily Evaluation:</strong> Automated system initiates the curation process</li>
                    <li><strong>Market Analysis:</strong> System analyzes current market signals and trends</li>
                    <li><strong>Domain Discovery:</strong> Available domains are identified and evaluated</li>
                    <li><strong>Scoring & Ranking:</strong> Each domain receives a comprehensive score</li>
                    <li><strong>Acquisition Decision:</strong> High-scoring domains are selected for purchase</li>
                    <li><strong>Automated Purchase:</strong> Selected domains are automatically acquired</li>
                    <li><strong>Portfolio Integration:</strong> New domains are added to our strategic reserve</li>
                    <li><strong>Strategy Refinement:</strong> System learns and adapts for future acquisitions</li>
                  </ol>
                </div>
              </section>

              <section className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
                <h2 className="text-2xl font-extrabold sm:text-3xl">7. Security & Reliability</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-white/80 sm:text-lg">
                  <p>
                    FUNSTRATEGY prioritizes security and reliability in all operations:
                  </p>
                  <ul className="ml-6 list-disc space-y-2">
                    <li>Secure credential management and API authentication</li>
                    <li>Respectful rate limiting to maintain system stability</li>
                    <li>Comprehensive error handling and recovery mechanisms</li>
                    <li>Complete audit logging of all acquisition decisions</li>
                    <li>Budget controls and spending limits</li>
                    <li>Multiple validation layers before any purchase</li>
                  </ul>
                </div>
              </section>

              <section className="rounded-3xl bg-black/35 p-6 ring-1 ring-white/10 sm:p-8">
                <h2 className="text-2xl font-extrabold sm:text-3xl">8. Future Vision</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-white/80 sm:text-lg">
                  <p>
                    FUNSTRATEGY is continuously evolving. Planned enhancements include:
                  </p>
                  <ul className="ml-6 list-disc space-y-2">
                    <li>Advanced machine learning for improved domain evaluation</li>
                    <li>Expanded registry partnerships</li>
                    <li>Real-time market intelligence feeds</li>
                    <li>Enhanced portfolio analytics and insights</li>
                    <li>Community engagement and domain suggestions</li>
                    <li>Marketplace integration for domain sales</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </Reveal>
      </main>
    </div>
  );
}

