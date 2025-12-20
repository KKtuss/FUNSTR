import { BackgroundVideo } from "@/components/BackgroundVideo";
import { SiteHeader } from "@/components/SiteHeader";
import { Reveal } from "@/components/Reveal";

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#020313] text-white">
      <BackgroundVideo />

      <SiteHeader />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 xl:max-w-7xl">
        <Reveal delayMs={40}>
          <article className="prose prose-invert max-w-none">
            <div className="rounded-3xl bg-black/35 p-8 ring-1 ring-white/10 sm:p-12">
              <header className="mb-12 border-b border-white/10 pb-8">
                <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  FUNSTRATEGY Whitepaper
                </h1>
                <p className="text-lg text-white/75 sm:text-xl">
                  How FUNSTRATEGY builds and maintains a strategic reserve of premium .fun domains.
                </p>
              </header>

              <div className="space-y-10 text-base leading-7 text-white/80 sm:text-lg">
                <section>
                  <h2 className="mb-4 text-2xl font-extrabold text-white sm:text-3xl">1. Overview</h2>
                  <p className="mb-4">
                    FUNSTRATEGY ($FUNSTR) is a strategic domain reserve system built around the .fun TLD. 
                    Our platform combines automated domain curation, market analysis, and intelligent acquisition 
                    to build and maintain a premium portfolio of .fun domains.
                  </p>
                  <p>
                    The system operates through a multi-stage pipeline that analyzes market data, evaluates domain 
                    potential, and automatically acquires high-value domains based on sophisticated scoring algorithms.
                  </p>
                </section>

                <section>
                  <h2 className="mb-6 text-2xl font-extrabold text-white sm:text-3xl">2. How It Works</h2>
                  
                  <h3 className="mb-3 mt-6 text-xl font-bold text-cyan-200">2.1 Curation Pipeline</h3>
                  <p className="mb-3">
                    Our curation pipeline runs daily, executing four distinct stages:
                  </p>
                  <ul className="mb-6 ml-6 list-disc space-y-2">
                    <li><strong>INGEST:</strong> Collects domain data and market signals</li>
                    <li><strong>EXTRACT:</strong> Analyzes domain features including length, structure, and patterns</li>
                    <li><strong>SCORE:</strong> Evaluates domains using our proprietary algorithms</li>
                    <li><strong>ADAPT:</strong> Updates acquisition strategies based on performance data</li>
                  </ul>

                  <h3 className="mb-3 mt-6 text-xl font-bold text-cyan-200">2.2 Domain Agent</h3>
                  <p className="mb-3">
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
                </section>

                <section>
                  <h2 className="mb-6 text-2xl font-extrabold text-white sm:text-3xl">3. Automation</h2>
                  
                  <h3 className="mb-3 mt-6 text-xl font-bold text-cyan-200">3.1 Automated Domain Purchases</h3>
                  <p className="mb-3">
                    The system integrates with domain registrar APIs to automatically purchase high-scoring domains:
                  </p>
                  <ul className="mb-6 ml-6 list-disc space-y-2">
                    <li>Automated search and discovery of available domains</li>
                    <li>Intelligent purchase decisions based on scoring algorithms</li>
                    <li>Portfolio management and tracking</li>
                    <li>Real-time acquisition processing</li>
                  </ul>

                  <h3 className="mb-3 mt-6 text-xl font-bold text-cyan-200">3.2 Automated DNS Mapping</h3>
                  <p className="mb-3">
                    Once domains are purchased, the system automatically configures DNS settings:
                  </p>
                  <ul className="mb-6 ml-6 list-disc space-y-2">
                    <li>Automatic DNS configuration and setup</li>
                    <li>Name server assignment</li>
                    <li>Domain routing configuration</li>
                    <li>Parked page assignment via Vercel cron jobs</li>
                  </ul>

                  <h3 className="mb-3 mt-6 text-xl font-bold text-cyan-200">3.3 Automated Owned Domain Curation</h3>
                  <p className="mb-3">
                    Our custom Domain Agent automatically curates and analyzes owned domains:
                  </p>
                  <ul className="ml-6 list-disc space-y-2">
                    <li>Consistent daily evaluation of portfolio performance</li>
                    <li>Automated execution of the curation pipeline</li>
                    <li>Systematic portfolio analysis and optimization</li>
                    <li>Real-time updates to market analysis and statistics</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-extrabold text-white sm:text-3xl">4. Market Analysis</h2>
                  <p className="mb-4">
                    Our system maintains a comprehensive view of the .fun domain market, tracking top market criteria 
                    including the most searched and in-demand keywords and patterns. We analyze structure patterns such 
                    as domain length, hyphens, and digit usage to understand market preferences. Market dominance metrics 
                    calculate share percentages for trending criteria, while baseline statistics capture the average 
                    characteristics of premium .fun domains. This market intelligence ensures our acquisitions align with 
                    current trends and future potential.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-extrabold text-white sm:text-3xl">5. Domain Scoring</h2>
                  <p className="mb-4">
                    Each domain is evaluated using a multi-factor scoring system that considers length (optimal domain 
                    length for memorability and brandability), structure (clean, readable formats preferred over complex 
                    patterns), and brandability (letters-only domains with strong brand potential). The system also 
                    evaluates pronounceability (ease of saying and remembering), market alignment (relevance to current 
                    market trends and demand), and portfolio fit (how well the domain complements existing holdings).
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-extrabold text-white sm:text-3xl">6. The Process</h2>
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
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-extrabold text-white sm:text-3xl">7. Security & Reliability</h2>
                  <p className="mb-4">
                    FUNSTRATEGY prioritizes security and reliability in all operations through secure credential 
                    management and API authentication, respectful rate limiting to maintain system stability, and 
                    comprehensive error handling and recovery mechanisms. All acquisition decisions are logged for 
                    complete audit trails, while budget controls and spending limits prevent overspending. Multiple 
                    validation layers ensure accuracy before any purchase is executed.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-extrabold text-white sm:text-3xl">8. Future Vision</h2>
                  <p className="mb-4">
                    FUNSTRATEGY is continuously evolving. Planned enhancements include advanced machine learning for 
                    improved domain evaluation, expanded registry partnerships, and real-time market intelligence feeds. 
                    We're also developing enhanced portfolio analytics and insights, community engagement features for 
                    domain suggestions, and marketplace integration for domain sales.
                  </p>
                </section>
              </div>
            </div>
          </article>
        </Reveal>
      </main>
    </div>
  );
}

