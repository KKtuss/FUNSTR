import Link from "next/link";
import { Space_Grotesk } from "next/font/google";

import { BackgroundVideo } from "@/components/BackgroundVideo";
import { SiteHeader } from "@/components/SiteHeader";
import { Reveal } from "@/components/Reveal";
import { token } from "@/lib/token";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
});

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 border-t border-white/10 pt-12 sm:mt-16 sm:pt-16">
      <Reveal delayMs={40}>
        <h2
          className={`${displayFont.className} mb-6 text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl`}
        >
          {title}
        </h2>
      </Reveal>
      <Reveal delayMs={80}>
        <div className="prose prose-invert max-w-none">
          <div className="space-y-4 text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
            {children}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <h3
        className={`${displayFont.className} mb-4 text-xl font-bold text-white sm:text-2xl`}
      >
        {title}
      </h3>
      <div className="space-y-3 text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
        {children}
      </div>
    </div>
  );
}

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#020313] text-white">
      <BackgroundVideo />

      <SiteHeader />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
        {/* Title Section */}
        <Reveal delayMs={30}>
          <div className="mb-8 border-b border-white/10 pb-8 sm:mb-12 sm:pb-12">
            <h1
              className={`${displayFont.className} mb-4 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl`}
            >
              FUNSTRATEGY
              <br />
              <span className="text-cyan-200">Whitepaper</span>
            </h1>
            <p className="text-lg text-white/70 sm:text-xl">
              Version 1.1 • {new Date().getFullYear()}
            </p>
          </div>
        </Reveal>

        {/* Executive Summary */}
        <Section title="Executive Summary">
          <p>
            FUNSTRATEGY ($FUNSTR) is a strategic domain acquisition protocol
            that builds and maintains a reserve of .fun domains through an
            automated, AI-powered system. By combining creator fee economics
            with advanced domain analysis, FUNSTRATEGY establishes $FUNSTR as
            the leading force behind the .fun ecosystem while creating value for
            token holders through strategic domain curation and a decentralized
            marketplace.
          </p>
          <p>
            Our system leverages <strong>Claude AI</strong> to analyze domains in real-time,
            scoring them based on market-validated criteria including keyword
            alignment, brandability, and cultural relevance. This intelligent
            curation system ensures that the FUNSTRATEGY reserve holds the
            strongest names in the .fun namespace.
          </p>
        </Section>

        {/* Introduction */}
        <Section title="1. Introduction">
          <p>
            The .fun top-level domain represents a new frontier in digital
            identity, combining entertainment, memes, and creator culture. As
            the .fun ecosystem grows, strategic domain acquisition becomes
            increasingly valuable. FUNSTRATEGY addresses this opportunity by
            building a systematic, automated approach to domain curation backed
            by artificial intelligence.
          </p>
          <p>
            In the era of .fun, it's only natural for strategy to meet memes. At
            FUNSTRATEGY, we're building a strategic reserve of .fun domains with
            creator rewards, establishing $FUNSTR as the leading force behind
            the .fun trademark.
          </p>
        </Section>

        {/* Claude AI Implementation */}
        <Section title="2. Claude AI Implementation">
          <p>
            At the core of FUNSTRATEGY is the <strong>Oracle Agent</strong>, powered by Anthropic's Claude 3.5 Sonnet. This sophisticated AI implementation goes beyond simple keyword matching to perform deep semantic analysis of potential domain acquisitions.
          </p>

          <SubSection title="2.1 The Analysis Pipeline">
            <p>
              When a new domain enters the ecosystem, the Claude API is triggered to perform a multi-dimensional evaluation:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Semantic Understanding:</strong> Claude analyzes the domain name to understand its meaning, wordplay, and cultural context. It can detect puns, meme references, and "slang" that traditional algorithms miss.
              </li>
              <li>
                <strong>Market Validation:</strong> The AI cross-references the domain against current crypto and social media trends to determine its "virality potential."
              </li>
              <li>
                <strong>Brandability Scoring:</strong> A proprietary prompt structure guides Claude to score domains on pronounceability, memorability, and length, generating a final "Strategy Score" (0-100).
              </li>
            </ul>
          </SubSection>

          <SubSection title="2.2 Automated Decision Making">
            <p>
              The Oracle Agent operates autonomously. Domains that pass a rigorous score threshold (typically 85+) are flagged for immediate acquisition or "High Priority" status. This removes human emotional bias and ensures the reserve is built on data-driven quality.
            </p>
          </SubSection>
        </Section>

        {/* The Marketplace */}
        <Section title="3. The Domains Marketplace">
          <p>
            The FUNSTRATEGY Marketplace is the primary interface for users to access the protocol's reserve. It transforms the project from a passive holding company into an active economic engine.
          </p>

          <SubSection title="3.1 Purchasing Mechanism">
            <p>
              All domains in the FUNSTRATEGY Reserve are available for purchase exclusively using <strong>$FUNSTR tokens</strong>. This creates a direct utility loop:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Users browse the curated list of high-quality .fun domains.</li>
              <li>Prices are denominated in USD but settled in $FUNSTR at the current market rate.</li>
              <li>Smart contracts handle the secure transfer of tokens and domain ownership rights (via DNS record configuration).</li>
            </ul>
          </SubSection>

          <SubSection title="3.2 Instant Utility">
            <p>
              Upon purchase, users can immediately configure DNS records (A Records, CNAMEs) directly through the dApp interface. This "Buy & Connect" feature streamlines the process of launching a new meme coin website, creator portfolio, or community hub on a premium .fun domain.
            </p>
          </SubSection>
        </Section>

        {/* Fund Management */}
        <Section title="4. Fund Management & Treasury">
          <p>
            The sustainability of the FUNSTRATEGY protocol relies on prudent management of two capital streams: <strong>Creator Fees</strong> (taxes) and <strong>Marketplace Sales</strong>.
          </p>

          <SubSection title="4.1 Reinvestment Loop">
            <p>
              Funds generated from domain sales are primarily reinvested into the protocol to accelerate growth:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Acquisition:</strong> 50% of sales revenue is routed back to the Acquisition Bot to purchase more domains, constantly replenishing the reserve with fresh inventory.
              </li>
              <li>
                <strong>Renewals:</strong> A portion of the treasury is ring-fenced to cover annual renewal fees for premium domains, ensuring the asset backing of the token remains secure.
              </li>
            </ul>
          </SubSection>

          <SubSection title="4.2 Deflationary Pressure (Buybacks)">
            <p>
              The remaining revenue from Marketplace sales is used to buy back $FUNSTR tokens from the open market. These tokens are either:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li><strong>Burned:</strong> Permanently removed from supply to increase scarcity.</li>
              <li><strong>Rewards:</strong> Distributed to long-term holders or DAO participants (future governance feature).</li>
            </ul>
            <p className="mt-2">
              This mechanism ensures that every domain sale directly benefits the token price and holder value.
            </p>
          </SubSection>
        </Section>

        {/* Tokenomics */}
        <Section title="5. Tokenomics">
          <SubSection title="5.1 Token Details">
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Token Symbol:</strong> $FUNSTR
              </li>
              <li>
                <strong>Total Supply:</strong> {token.totalSupply} tokens
              </li>
              <li>
                <strong>Chain:</strong> {token.chain}
              </li>
            </ul>
          </SubSection>

          <SubSection title="5.2 The Flywheel">
            <p>
              1. <strong>Volume</strong> generates Creator Fees → 2. <strong>Fees</strong> fund Domain Acquisition → 3. <strong>High-Value Domains</strong> populate the Marketplace → 4. <strong>Sales</strong> require $FUNSTR (Demand) → 5. <strong>Revenue</strong> drives Buybacks (Price Support) → 6. Higher Price drives Volume.
            </p>
          </SubSection>
        </Section>

        {/* Roadmap */}
        <Section title="6. Roadmap">
          <SubSection title="Phase 1: Foundation (Completed)">
            <ul className="ml-6 list-disc space-y-2">
              <li>Launch automated domain acquisition system</li>
              <li>Deploy Claude Domain Agent for analysis</li>
              <li>Build initial reserve portfolio</li>
            </ul>
          </SubSection>

          <SubSection title="Phase 2: The Marketplace (Current)">
            <ul className="ml-6 list-disc space-y-2">
              <li>Launch decentralized Domains Marketplace</li>
              <li>Enable $FUNSTR payments for domains</li>
              <li>Implement "Buy & Connect" DNS features</li>
            </ul>
          </SubSection>

          <SubSection title="Phase 3: Expansion">
            <ul className="ml-6 list-disc space-y-2">
              <li>Implement DAO governance for high-value domain sales</li>
              <li>Cross-chain domain bridging</li>
              <li>Partnerships with major meme coin communities</li>
            </ul>
          </SubSection>
        </Section>

        {/* Conclusion */}
        <Section title="7. Conclusion">
          <p>
            FUNSTRATEGY represents a new approach to domain strategy, combining
            automation, artificial intelligence, and strategic curation to build
            value in the .fun ecosystem. Our Claude-powered Domain Agent ensures
            that every domain in the reserve is carefully evaluated, while our Marketplace ensures these assets remain liquid and accessible.
          </p>
          <p>
            By establishing $FUNSTR as the currency of the .fun namespace, we create a robust economic model where digital real estate backs the value of the token.
          </p>
        </Section>

        {/* Footer */}
        <Reveal delayMs={120}>
          <div className="mt-16 border-t border-white/10 pt-8 text-center text-sm text-white/60 sm:mt-20">
            <p>
              For more information, visit{" "}
              <Link
                href="/"
                className="font-semibold text-white/80 hover:text-white hover:underline"
              >
                funstrategy.com
              </Link>
            </p>
            <p className="mt-2">
              © {new Date().getFullYear()} FUNSTRATEGY. All rights reserved.
            </p>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
