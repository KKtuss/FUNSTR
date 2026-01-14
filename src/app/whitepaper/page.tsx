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
              Version 1.0 • {new Date().getFullYear()}
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
            token holders through strategic domain curation.
          </p>
          <p>
            Our Claude-powered Domain Agent analyzes domains in real-time,
            scoring them based on market-validated criteria including keyword
            alignment, brandability, and cultural relevance. This intelligent
            curation system ensures that the FUNSTRATEGY reserve holds the
            strongest names in the .fun namespace, creating long-term value and
            positioning the protocol as a cornerstone of the .fun ecosystem.
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
          <p>
            Our approach combines automated domain procurement, AI-driven
            analysis, and strategic curation to build a portfolio that captures
            the most valuable properties in the .fun namespace.
          </p>
        </Section>

        {/* Problem Statement */}
        <Section title="2. Market Opportunity">
          <p>
            The .fun domain extension has emerged as a key destination for
            entertainment, creator, and meme-native projects. However, manual
            domain acquisition lacks the speed, consistency, and strategic
            insight needed to build a comprehensive reserve. Key challenges
            include:
          </p>
          <ul className="ml-6 list-disc space-y-2 text-white/80">
            <li>
              <strong>Scalability:</strong> Manual acquisition cannot match the
              pace needed to build a significant reserve
            </li>
            <li>
              <strong>Quality Assessment:</strong> Evaluating domain value
              requires deep understanding of market trends and cultural
              relevance
            </li>
            <li>
              <strong>Strategic Positioning:</strong> Building a reserve that
              captures market value requires systematic analysis and
              data-driven decisions
            </li>
            <li>
              <strong>Resource Efficiency:</strong> Optimizing acquisition
              spending requires intelligent prioritization
            </li>
          </ul>
        </Section>

        {/* Solution */}
        <Section title="3. The FUNSTRATEGY Solution">
          <p>
            FUNSTRATEGY solves these challenges through an integrated system of
            automated domain acquisition, AI-powered analysis, and strategic
            curation. Our solution consists of four core components:
          </p>

          <SubSection title="3.1 Automated Domain Acquisition">
            <p>
              Our system automatically procures .fun domains at a rate of two
              domains per minute, funded by creator fees. This automated
              approach ensures consistent growth of the FUNSTRATEGY reserve
              without manual intervention.
            </p>
          </SubSection>

          <SubSection title="3.2 Domain Routing & Infrastructure">
            <p>
              Each acquired domain is immediately routed to a centralized parked
              page, creating a unified brand presence while maintaining
              individual domain identity. This infrastructure scales seamlessly
              as the reserve grows.
            </p>
          </SubSection>

          <SubSection title="3.3 Claude Domain Agent">
            <p>
              Our Claude-powered Domain Agent provides real-time analysis of
              each domain in the reserve. The agent evaluates domains using a
              comprehensive scoring system that considers:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Market Keywords:</strong> Alignment with high-value
                .fun market terms (AI, creator, meme, etc.)
              </li>
              <li>
                <strong>Brandability:</strong> Length, pronounceability, and
                structural quality
              </li>
              <li>
                <strong>Cultural Relevance:</strong> Recognition of
                meme-friendly patterns and culture-centric numerics
              </li>
              <li>
                <strong>Portfolio Analysis:</strong> Strategic positioning
                within the overall reserve
              </li>
            </ul>
            <p className="mt-4">
              The Claude Domain Agent generates detailed explanations for each
              domain, providing insights into why specific domains are strong
              additions to the reserve. This transparency enables stakeholders
              to understand the strategic value of our curation decisions.
            </p>
          </SubSection>

          <SubSection title="3.4 Strategic Reserve Growth">
            <p>
              The Claude Domain Agent tracks domain performance and guides
              future acquisition strategy. By analyzing what performs well, the
              system continuously improves its curation criteria, ensuring that
              the reserve focuses on the most valuable domains in the .fun
              ecosystem.
            </p>
          </SubSection>
        </Section>

        {/* Technology - Claude Agent */}
        <Section title="4. Claude Domain Agent Architecture">
          <p>
            The Claude Domain Agent is the intelligent core of FUNSTRATEGY's
            domain curation system. Built on Anthropic's Claude AI, the agent
            provides sophisticated analysis and strategic guidance.
          </p>

          <SubSection title="4.1 Domain Scoring System">
            <p>
              Each domain receives a score from 0-100 based on multiple
              factors:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Length Optimization:</strong> Prefers domains between
                4-8 characters, with optimal brandability
              </li>
              <li>
                <strong>Token Analysis:</strong> Identifies market-validated
                keywords with proven value in .fun sales data
              </li>
              <li>
                <strong>Structural Quality:</strong> Evaluates hyphens, digits,
                and letter composition
              </li>
              <li>
                <strong>Pronounceability:</strong> Analyzes vowel distribution
                for optimal brandability
              </li>
              <li>
                <strong>Market Patterns:</strong> Recognizes successful patterns
                like "keyword + suffix" combinations
              </li>
            </ul>
          </SubSection>

          <SubSection title="4.2 Real-Time Analysis">
            <p>
              The agent provides real-time analysis of domains in the reserve,
              generating explanations that include:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Strength indicators (reasons for high scores)</li>
              <li>Cautions (potential weaknesses)</li>
              <li>Market alignment factors</li>
              <li>Strategic positioning within the portfolio</li>
            </ul>
          </SubSection>

          <SubSection title="4.3 Portfolio-Level Intelligence">
            <p>
              Beyond individual domain analysis, the Claude Domain Agent
              provides portfolio-level insights:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Overall reserve composition and quality metrics</li>
              <li>Trend identification and pattern recognition</li>
              <li>Recommendations for strategic focus areas</li>
              <li>Suggested domains for future acquisition</li>
            </ul>
          </SubSection>

          <SubSection title="4.4 Continuous Learning">
            <p>
              The system incorporates market data and performance metrics to
              continuously refine its analysis criteria. As the .fun ecosystem
              evolves, the Claude Domain Agent adapts its evaluation framework
              to maintain relevance and strategic value.
            </p>
          </SubSection>
        </Section>

        {/* Tokenomics */}
        <Section title="5. Tokenomics">
          <p>
            $FUNSTR is the native token of the FUNSTRATEGY protocol. Token
            economics are designed to align incentives between domain
            acquisition, reserve growth, and stakeholder value.
          </p>

          <SubSection title="5.1 Token Details">
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Token Symbol:</strong> $FUNSTR
              </li>
              <li>
                <strong>Total Supply:</strong> {token.totalSupply} tokens
              </li>
              <li>
                <strong>Decimals:</strong> {token.decimals}
              </li>
              <li>
                <strong>Chain:</strong> {token.chain}
              </li>
            </ul>
          </SubSection>

          <SubSection title="5.2 Economics">
            <p>
              Creator fees fund domain acquisition, creating a self-sustaining
              loop where protocol growth drives reserve expansion. The Claude
              Domain Agent ensures efficient allocation of resources by
              prioritizing high-value domains.
            </p>
            <p className="mt-4">
              <strong>Token Utility:</strong> $FUNSTR serves as the exclusive currency
              for purchasing domains from the FUNSTRATEGY reserve. This creates
              organic demand for the token as the quality and value of the domain
              portfolio increases.
            </p>
          </SubSection>
        </Section>

        {/* Roadmap */}
        <Section title="6. Roadmap">
          <SubSection title="Phase 1: Foundation">
            <ul className="ml-6 list-disc space-y-2">
              <li>Launch automated domain acquisition system</li>
              <li>Deploy Claude Domain Agent for analysis</li>
              <li>Build initial reserve portfolio</li>
              <li>Establish domain routing infrastructure</li>
            </ul>
          </SubSection>

          <SubSection title="Phase 2: Scale">
            <ul className="ml-6 list-disc space-y-2">
              <li>Expand reserve to target size</li>
              <li>Enhance Claude Domain Agent capabilities</li>
              <li>Implement advanced portfolio analytics</li>
              <li>Develop strategic partnerships</li>
            </ul>
          </SubSection>

          <SubSection title="Phase 3: Ecosystem">
            <ul className="ml-6 list-disc space-y-2">
              <li>Establish FUNSTRATEGY as .fun ecosystem leader</li>
              <li>Launch additional value-generating mechanisms</li>
              <li>Expand AI agent capabilities to new use cases</li>
              <li>Create sustainable long-term value for holders</li>
            </ul>
          </SubSection>
        </Section>

        {/* Conclusion */}
        <Section title="7. Conclusion">
          <p>
            FUNSTRATEGY represents a new approach to domain strategy, combining
            automation, artificial intelligence, and strategic curation to build
            value in the .fun ecosystem. Our Claude-powered Domain Agent ensures
            that every domain in the reserve is carefully evaluated and
            strategically positioned.
          </p>
          <p>
            By establishing $FUNSTR as the leading force behind the .fun
            trademark, we create long-term value for token holders while
            contributing to the growth and maturation of the .fun ecosystem.
          </p>
          <p>
            As the .fun namespace continues to evolve, FUNSTRATEGY's intelligent
            curation system positions the protocol to capture and maintain
            strategic value in this emerging digital frontier.
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
