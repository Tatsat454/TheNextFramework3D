/**
 * Every piece of copy on Pocket Island lives here. Components only read from this file.
 *
 * Anything marked `placeholder: true` (or wrapped in PLACEHOLDER(...)) is invented filler
 * that Tatsat should replace with real content. `draft: true` sections were written from
 * his resume/portfolio but interpret beyond it, so they need a quick review.
 */

export type LandmarkId = "house" | "townhall" | "museum" | "market" | "arcade" | "dock";

export const profile = {
  name: "Tatsat Upadhyay",
  firstName: "Tatsat",
  initials: "TU",
  headline: "M.S. Economics at Georgia Tech, building toward product in games & entertainment.",
  motto: "Where models meet markets.",
  location: "Atlanta, GA · from Corona, CA",
  email: "tat.upadhyay@gmail.com",
  links: [
    { label: "Email", href: "mailto:tat.upadhyay@gmail.com", value: "tat.upadhyay@gmail.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/tatsat-upadhyay", value: "/in/tatsat-upadhyay" },
    { label: "GitHub", href: "https://github.com/Tatsat454", value: "/Tatsat454" },
    { label: "The Next Framework", href: "https://thenextframework.blog", value: "thenextframework.blog" },
  ],
  seoDescription:
    "Tatsat Upadhyay's portfolio as a cozy island you can walk around: economics research, product thinking, and games. M.S. Economics at Georgia Tech.",
  stats: [
    { value: "4.0", label: "GPA, PhD-level micro sequence" },
    { value: "$100K", label: "Sales at the brand I founded" },
    { value: "83K+", label: "Taxi trips modeled in my DDC paper" },
  ],
  /** The chibi player. Tweak freely; the model reads these values directly. */
  look: {
    skin: "#C68E6A",
    hair: "#2B2233",
    outfit: "#7B6CF6",
    pants: "#4B3FB5",
    shoes: "#FFF8EC",
    accessory: "headphones" as const,
    accessoryColor: "#FF8A65",
  },
};

export type StorySection = {
  heading: string;
  body: string[];
  bullets?: string[];
  draft?: boolean;
  placeholder?: boolean;
};

export type Story = {
  slug: string;
  kind: "case-study" | "page";
  eyebrow: string;
  title: string;
  summary: string;
  meta?: string;
  tags?: string[];
  sections: StorySection[];
  links?: { label: string; href: string }[];
  placeholder?: boolean;
};

/** Case-study sections always follow this order. */
export const caseStudyHeadings = [
  "Problem",
  "Players",
  "Insight",
  "What I'd build",
  "How I'd measure it",
  "What I learned",
] as const;

export const stories: Story[] = [
  // ─── Museum exhibits (case studies) ───
  {
    slug: "nyc-taxi-ddc",
    kind: "case-study",
    eyebrow: "Exhibit · Structural econometrics",
    title: "Why taxi drivers drive where they drive",
    summary:
      "A Dynamic Discrete Choice model of NYC taxi drivers, estimated from 83,000+ trips, to recover the preferences behind every 'where next?' decision.",
    meta: "UC Riverside · Jan–Feb 2026",
    tags: ["Python", "R", "NFXP", "Value function iteration"],
    sections: [
      {
        heading: "Problem",
        body: [
          "Every empty taxi is making a bet: wait here, drift toward Midtown, or call it a night. Aggregate trip data shows where drivers end up, but not why they chose it. Without the why, you can't predict how drivers respond when prices, demand or rules change.",
        ],
      },
      {
        heading: "Players",
        body: [
          "Drivers optimizing a whole shift, not a single fare. Riders whose wait times depend on where supply drifts. Platforms and regulators who set the prices and zones that shape those choices.",
        ],
      },
      {
        heading: "Insight",
        body: [
          "I engineered 83K+ NYC trip records into sequential shifts, filtering time windows and aggregating 265 taxi zones into 15 behaviorally meaningful ones. Then I estimated a full structural model in Python and R: transition matrices for how drivers move between zones, and a Nested Fixed Point (NFXP) value-function-iteration routine to recover why they choose where to search, when to head back toward dense demand, and when to stop.",
          "The model treats drivers as forward-looking, and the data is granular enough to keep that honest: revealed preferences in a dynamic environment.",
        ],
        bullets: ["83K+ trips", "265 → 15 zones", "NFXP estimation"],
      },
      {
        heading: "What I'd build",
        draft: true,
        body: [
          "A 'next best zone' nudge for drivers on a ride-hailing app: a live map that ranks nearby zones by expected value over the rest of the shift, not just the next fare. The same model powers a simulator that lets the ops team test a surge rule before it ships.",
        ],
      },
      {
        heading: "How I'd measure it",
        draft: true,
        body: [
          "A/B test by driver cohort. North-star: earnings per online hour. Guardrails: rider wait time in the zones supply leaves, and deadhead (empty) miles. Validate the simulator by back-testing against a past pricing change.",
        ],
      },
      {
        heading: "What I learned",
        draft: true,
        body: [
          "Most of the work is building the dataset so the model can be believed. And a structural model is a product: it's only worth something if someone can ask it 'what if?' and trust the answer.",
        ],
      },
    ],
    links: [{ label: "Read the full paper", href: "https://drive.google.com/file/d/12_YDLHcJTAI3FRRCVqYile0xuvCYIPNO/view" }],
  },
  {
    slug: "pjm-ai-electricity",
    kind: "case-study",
    eyebrow: "Exhibit · Energy markets",
    title: "The AI data-center puzzle in the power grid",
    summary:
      "Why AI-driven electricity demand clusters in specific corners of the PJM Interconnection, and what that clustering does to grid load forecasts.",
    meta: "UC Riverside · Jan–Mar 2026 · Advised by Prof. Youngeun Choi",
    tags: ["Energy markets", "Capacity pricing", "Macro"],
    sections: [
      {
        heading: "Problem",
        body: [
          "AI load isn't spreading out the way population or industrial demand historically has. It clusters around cheap power and fiber routes, and that lumpiness is starting to distort how utilities and regulators plan for reliability.",
        ],
      },
      {
        heading: "Players",
        body: [
          "Data-center developers chasing cheap megawatts and fiber. Utilities and PJM planners forecasting load. Generators and transmission builders reading price signals to decide what to invest in. Households who pay for the capacity.",
        ],
      },
      {
        heading: "Insight",
        body: [
          "I traced how PJM's energy and capacity markets turn supply-demand dynamics, transmission constraints and market structure into the price signals behind real generation and transmission investment. The puzzle is macroeconomic: a new, geographically lumpy source of demand is growing faster than the forecasting models were built to handle.",
        ],
      },
      {
        heading: "What I'd build",
        draft: true,
        body: [
          "A siting dashboard for planners: overlay announced data-center projects, transmission headroom and capacity prices, and flag zones where forecast error is likely to spike before it shows up in the auction.",
        ],
      },
      {
        heading: "How I'd measure it",
        draft: true,
        body: [
          "Forecast error (MAPE) by zone before and after adding clustering signals, how far ahead of the auction a constraint gets flagged, and planner adoption: weekly active users among the target team.",
        ],
      },
      {
        heading: "What I learned",
        draft: true,
        body: [
          "Price signals are a product surface too. When a market's signals lag reality, the most valuable thing you can do is shorten that lag for the people making the bets.",
        ],
      },
    ],
    links: [{ label: "Read the full paper", href: "https://docs.google.com/document/d/1RdxttWFKVUh-v5Mpnh5NdulgkWqoU-2Z/edit" }],
  },
  {
    slug: "startup-failure",
    kind: "case-study",
    eyebrow: "Exhibit · Venture economics",
    title: "What actually kills startups",
    summary:
      "Pulling apart aggregated post-mortem data to separate the startups that find traction from the ones that don't, then turning it into a framework founders can use.",
    meta: "UC Riverside · Sep–Dec 2025 · Econ 106 final project",
    tags: ["Market research", "GTM", "Capital efficiency"],
    sections: [
      {
        heading: "Problem",
        body: [
          "Startup folklore says founders fail from bad luck or bad timing. The aggregated evidence says something more useful, and more avoidable.",
        ],
      },
      {
        heading: "Players",
        body: ["First-time founders deciding whether to quit a day job, and the early check-writers deciding whether to back them."],
      },
      {
        heading: "Insight",
        body: [
          "The single largest cause of failure, by a wide margin, is no real market need, followed closely by running out of cash before finding one. Across survivors, three variables show up again and again: scalability, customer acquisition and operational efficiency.",
        ],
      },
      {
        heading: "What I'd build",
        draft: true,
        body: [
          "A 20-minute 'pressure test' tool: a founder answers structured questions about need, channel and burn, and gets a scorecard with the one riskiest assumption to test first.",
        ],
      },
      {
        heading: "How I'd measure it",
        draft: true,
        body: [
          "Completion rate, share of founders who run the suggested test within two weeks, and a six-month follow-up comparing pivot or kill decisions against the scorecard.",
        ],
      },
      {
        heading: "What I learned",
        body: [
          "Having run my own brand, the data matched the scar tissue: find the need before you scale the thing.",
        ],
        draft: true,
      },
    ],
    links: [
      { label: "Read the full paper", href: "https://docs.google.com/document/d/1p5DEkt8RaFbv2ApwcXwB4Nx1NX4POlWb5OOID0KcHL4/edit?tab=t.0" },
    ],
  },
  {
    slug: "home-robot-vlm",
    kind: "case-study",
    eyebrow: "Exhibit · In progress",
    title: "A home robot for my grandparents",
    summary:
      "A 3D-printed, carbon-fiber home-assistance robot with a Vision-Language Model brain that picks up clothes, recharges itself and, eventually, cleans. Built at Georgia Tech's makerspace.",
    meta: "Georgia Tech makerspace · Ongoing",
    tags: ["VLM", "3D printing", "Carbon fiber", "Open source"],
    sections: [
      {
        heading: "Problem",
        body: [
          "My parents and grandparents have a genuinely hard time bending down for small, repetitive tasks, like picking clothes up off the floor. Most home robots are demos, not help.",
        ],
      },
      {
        heading: "Players",
        body: ["Older adults and their families, makers with access to a 3D printer, and the open-source robotics community."],
      },
      {
        heading: "Insight",
        body: [
          "The body is the easy part. I 3D-printed the parts and I'm learning to go from printed molds to resin-and-carbon-fiber pieces so the chassis ends up light and strong. The hard problem is the brain: a Vision-Language Model trained to recognize clothes on the floor, know when to head back and recharge, and grow into basic cleaning.",
        ],
      },
      {
        heading: "What I'd build",
        body: [
          "Once it works, I'll open-source the whole thing: models, print files and a build guide, so anyone with a 3D printer nearby can build their own.",
        ],
      },
      {
        heading: "How I'd measure it",
        draft: true,
        body: [
          "Task success rate per pickup attempt, autonomous hours between manual recharges, and, once open-sourced, the number of community builds and forks.",
        ],
      },
      {
        heading: "What I learned",
        draft: true,
        body: ["Start from the person, not the tech. The spec got a lot simpler once the question was 'what does grandma actually struggle with?'"],
      },
    ],
  },
  {
    slug: "pokemon-red-agent",
    kind: "case-study",
    eyebrow: "Exhibit · Reinforcement learning",
    title: "Teaching an agent to play a classic monster-catching RPG",
    summary:
      "A PPO reinforcement-learning agent that learns to explore a 1996 handheld RPG from pixels, with reward shaping, exploration heatmaps and published checkpoints.",
    meta: "Personal project · 2026",
    tags: ["Python", "PPO", "Stable-Baselines3", "Emulation"],
    sections: [
      {
        heading: "Problem",
        body: [
          "Open-world games are a brutal RL environment: rewards are sparse, the map is huge, and an agent that only chases short-term reward walks in circles forever.",
        ],
      },
      {
        heading: "Players",
        body: ["The agent, the reward function I design for it, and anyone curious about how game design choices shape learned behavior (for AI and for people)."],
      },
      {
        heading: "Insight",
        body: [
          "Using an emulator plus Stable-Baselines3 (PPO), I ran an independent training run with shaped rewards for exploration. It learned to leave the starting town, cross the first route, reach the first city and head into the forest. Map heatmaps show exactly where curiosity paid off and where it stalled.",
        ],
        bullets: ["PPO agent", "Reward shaping", "Exploration heatmaps", "Published checkpoints"],
      },
      {
        heading: "What I'd build",
        draft: true,
        body: [
          "A playtest bot for designers: point it at a new level, and the heatmap shows where players are likely to get lost or bored before a single human playtest.",
        ],
      },
      {
        heading: "How I'd measure it",
        draft: true,
        body: ["How well bot heatmaps correlate with real player heatmaps on shipped levels, and designer hours saved per playtest cycle."],
      },
      {
        heading: "What I learned",
        draft: true,
        body: ["Reward design is game design. The agent does exactly what you incentivize, which is a very PM lesson."],
      },
    ],
    links: [{ label: "View on GitHub", href: "https://github.com/Tatsat454/PokemonRedAgent" }],
  },
  {
    slug: "pocket-console",
    kind: "case-study",
    eyebrow: "Exhibit · Product build",
    title: "Pocket Console: 15 games for road trips",
    summary:
      "A mobile-friendly mini-game console for solo play, pass-and-play on one phone, private rooms for friends, or local Wi-Fi when there's no internet.",
    meta: "Personal project · 2026",
    tags: ["TypeScript", "Socket.IO", "Multiplayer"],
    sections: [
      {
        heading: "Problem",
        body: [
          "Group games on phones usually assume everyone has the same app, an account and good internet. None of that is true in the back seat of a car.",
        ],
      },
      {
        heading: "Players",
        body: ["Friends on a road trip, families at a table with one phone, and the host who just wants it to work in 10 seconds."],
      },
      {
        heading: "Insight",
        body: [
          "Mode flexibility is the feature. Every one of the 15 games (Solitaire, Color Clash, Tic-Tac-Toe, Road-Trip Bingo, Would You Rather and more) plugs into one game-module interface, so it can run solo, same-device, in a private online room or over local Wi-Fi.",
        ],
        bullets: ["15 games", "4 play modes", "Offline-capable"],
      },
      {
        heading: "What I'd build",
        draft: true,
        body: ["Next: a 'party playlist' that picks the next game based on group size and how long the last one ran, so nobody has to decide."],
      },
      {
        heading: "How I'd measure it",
        draft: true,
        body: ["Time from open to first game, games per session, and the share of sessions that reach a second game."],
      },
      {
        heading: "What I learned",
        draft: true,
        body: ["The hardest part of multiplayer isn't networking. It's making the lobby so simple nobody needs instructions."],
      },
    ],
    links: [{ label: "View on GitHub", href: "https://github.com/Tatsat454/pocket-console" }],
  },

  // ─── Landmark pages ───
  {
    slug: "about",
    kind: "page",
    eyebrow: "My House · About me",
    title: "Hi, I'm Tatsat.",
    summary: "Economist by training, founder by habit, and a lifelong gamer who wants to build the next great game economy.",
    sections: [
      {
        heading: "The short version",
        body: [
          "I'm doing an M.S. in Economics at Georgia Tech (4.0, through a PhD-level micro sequence) after a B.A. in Business Economics at UC Riverside. Before that I spent four and a half years running Divinity Supply & Co., an apparel and design brand I founded.",
          "I write about AI/ML, econometrics and product strategy every week on The Next Framework. I'm looking for roles in product, growth or partnerships, ideally in games and entertainment.",
        ],
      },
      {
        heading: "What I can do for you",
        body: [],
        bullets: [
          "Build the model and explain it: structural econometrics for the technical team, a clear dashboard for everyone else, the same day.",
          "Own things end to end: I've held finance, marketing and ops at the same time without a big team around me.",
          "Write clearly on a deadline: weekly essays on The Next Framework, plus a real editorial process writing for BAPS.",
          "Ramp fast under real constraints: a 4.0 while leading two student orgs and running a company.",
        ],
      },
      {
        heading: "Outside the classroom",
        body: [
          "I'm President of the M.S. Economics Organization at Georgia Tech, a long-time BAPS volunteer, and an author of Bal Sabha books, the texts children in BAPS's youth program read every week.",
        ],
      },
    ],
  },
  {
    slug: "experience",
    kind: "page",
    eyebrow: "Town Hall · Work experience",
    title: "The record at Town Hall",
    summary: "Four roles across founding, analytics and partnerships, each one closer to owning product decisions end to end.",
    sections: [
      {
        heading: "President, M.S. Economics Organization",
        body: ["Georgia Institute of Technology · 2026 – present", "Leading and representing the graduate economics community at Georgia Tech."],
      },
      {
        heading: "Website & Sponsorship Lead, UCR Formula SAE",
        body: ["Feb 2025 – May 2025"],
        bullets: [
          "Drove sponsorship across ~13 partner relationships worth ~$134K in recorded value: cash, software, services and in-kind engineering resources.",
          "Managed a 50+ prospect pipeline from prospecting to acquisition, prioritized by team needs and partnership fit.",
          "Translated vehicle-development requirements into partnership asks with engineering and executive stakeholders.",
          "Redesigned the team website for mobile performance and engagement.",
        ],
      },
      {
        heading: "Business & Analytics Intern, WellomyTech",
        body: ["Apr 2024 – Mar 2025"],
        bullets: [
          "Analyzed $15K+/month in AWS and IT spend; recommendations contributed to a 20% cut in operating expenses.",
          "Automated CRM reporting, removing ~32 hours of manual analysis and turning recurring reports into self-serve decision support.",
          "Analyzed revenue alongside operating and customer data to surface growth opportunities for the CEO.",
          "Quantified C2C vs. W-2 hiring economics to inform the company's hiring strategy.",
        ],
      },
      {
        heading: "Founder & CEO, Divinity Supply & Co.",
        body: ["Mar 2020 – Sep 2024"],
        bullets: [
          "Scaled an apparel and design venture to ~$100K in cumulative sales and consulting revenue.",
          "Built two revenue streams, direct-to-consumer apparel and design/merch consulting.",
          "Designed custom merch and event-specific concepts with event and concert-entertainment clients.",
          "Led a 2–3 person remote team and owned a 4-stage product lifecycle: discovery → design → launch → iteration.",
        ],
      },
      {
        heading: "Education",
        body: [
          "Georgia Institute of Technology: M.S. Economics, Aug 2026 – Apr 2027 · GPA 4.0",
          "University of California, Riverside: B.A. Business Economics, Jan 2025 – May 2026 · GPA 3.93",
        ],
      },
    ],
    links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/tatsat-upadhyay" }],
  },
  {
    slug: "virtual-economies",
    kind: "page",
    eyebrow: "Market Stall · Econ thesis",
    title: "Virtual economies, priced like real ones",
    summary: "My economics thesis direction: what game economies can learn from real markets, and vice versa.",
    placeholder: true,
    sections: [
      {
        heading: "The thesis",
        placeholder: true,
        body: [
          "PLACEHOLDER: One or two paragraphs on the virtual-economies thesis: the question, the game or market you're studying, and the data or model you plan to use.",
        ],
      },
      {
        heading: "Why it matters for games",
        placeholder: true,
        body: [
          "PLACEHOLDER: How the finding would change a live-ops or economy-design decision, such as sink/faucet balance, pricing of premium currency, or drop rates.",
        ],
      },
      {
        heading: "Already on the shelf: Edge Finder",
        body: [
          "A browser-based pricing workspace I built for betting markets: implied and no-vig fair probabilities, EV and edge, parlay math with correlation warnings, and a dashboard of P&L and implied-vs-realized results by odds bucket. It's how I practice thinking about prices as information.",
        ],
      },
    ],
    links: [{ label: "Edge Finder on GitHub", href: "https://github.com/Tatsat454/GamblingOdds" }],
  },
  {
    slug: "game-teardown",
    kind: "case-study",
    eyebrow: "Exhibit · Game teardown",
    title: "PLACEHOLDER: game teardown title",
    summary: "PLACEHOLDER: one-line summary of the teardown — core loop, economy, or retention hook.",
    placeholder: true,
    sections: [
      {
        heading: "Problem",
        placeholder: true,
        body: ["PLACEHOLDER: the design or economy problem this teardown is about."],
      },
      {
        heading: "Players",
        placeholder: true,
        body: ["PLACEHOLDER: who the game is for, and who wins if the loop is healthy."],
      },
      {
        heading: "Insight",
        placeholder: true,
        body: ["PLACEHOLDER: the one mechanic or economy choice that makes the game work — or the one you'd change."],
      },
      {
        heading: "What I'd build",
        placeholder: true,
        body: ["PLACEHOLDER: the change you'd ship as PM, and why."],
      },
      {
        heading: "How I'd measure it",
        placeholder: true,
        body: ["PLACEHOLDER: the metric you'd move, plus a guardrail."],
      },
      {
        heading: "What I learned",
        placeholder: true,
        body: ["PLACEHOLDER: the lesson you'd take to the next game."],
      },
    ],
  },
  {
    slug: "feature-spec",
    kind: "case-study",
    eyebrow: "Exhibit · Feature spec",
    title: "PLACEHOLDER: feature spec title",
    summary: "PLACEHOLDER: one-line summary of the feature and the player problem it solves.",
    placeholder: true,
    sections: [
      {
        heading: "Problem",
        placeholder: true,
        body: ["PLACEHOLDER: the player or operator problem this spec is answering."],
      },
      {
        heading: "Players",
        placeholder: true,
        body: ["PLACEHOLDER: who uses the feature, who ships it, and who is affected if it fails."],
      },
      {
        heading: "Insight",
        placeholder: true,
        body: ["PLACEHOLDER: the insight that shaped the spec — what you learned before writing requirements."],
      },
      {
        heading: "What I'd build",
        placeholder: true,
        body: ["PLACEHOLDER: the feature, scoped to an MVP, with the one thing you would not cut."],
      },
      {
        heading: "How I'd measure it",
        placeholder: true,
        body: ["PLACEHOLDER: north-star metric, guardrails, and how you'd know it shipped."],
      },
      {
        heading: "What I learned",
        placeholder: true,
        body: ["PLACEHOLDER: what writing this spec taught you about product."],
      },
    ],
  },
  {
    slug: "user-research",
    kind: "case-study",
    eyebrow: "Exhibit · User research",
    title: "PLACEHOLDER: user-research / side-project title",
    summary: "PLACEHOLDER: one-line summary of the research or side project and what you were trying to learn.",
    placeholder: true,
    sections: [
      {
        heading: "Problem",
        placeholder: true,
        body: ["PLACEHOLDER: the question you went into research with."],
      },
      {
        heading: "Players",
        placeholder: true,
        body: ["PLACEHOLDER: who you talked to, and why they were the right people."],
      },
      {
        heading: "Insight",
        placeholder: true,
        body: ["PLACEHOLDER: the finding that surprised you — and the one you expected."],
      },
      {
        heading: "What I'd build",
        placeholder: true,
        body: ["PLACEHOLDER: the product or side-project change this research argues for."],
      },
      {
        heading: "How I'd measure it",
        placeholder: true,
        body: ["PLACEHOLDER: how you'd know the next version answered the research question."],
      },
      {
        heading: "What I learned",
        placeholder: true,
        body: ["PLACEHOLDER: the research habit you'd keep on the next project."],
      },
    ],
  },
  {
    slug: "arcade",
    kind: "page",
    eyebrow: "Arcade Shack · Games",
    title: "Game teardowns & what I'm playing",
    summary: "How I take games apart, plus the games I've built myself.",
    sections: [
      {
        heading: "Teardown: PLACEHOLDER game title",
        placeholder: true,
        body: [
          "PLACEHOLDER: A short teardown covering the core loop, the economy, the retention hook, and the one thing you'd change as PM, with the metric you'd move.",
        ],
      },
      {
        heading: "Teardown: PLACEHOLDER game title",
        placeholder: true,
        body: ["PLACEHOLDER: A second teardown, ideally a different genre (for example a cozy life-sim vs. a competitive live-service game)."],
      },
      {
        heading: "Currently playing",
        placeholder: true,
        body: ["PLACEHOLDER: 2–3 games you're playing right now and one line on why each one hooks you."],
      },
      {
        heading: "Games I've built",
        body: [],
        bullets: [
          "Petal Quest, Episode One: The Lily in Lilburn: a complete top-down pixel RPG on HTML5 Canvas with no game libraries (tile map, collisions, NPC dialogue, 5 collectible petals).",
          "Pocket Console: 15 mini-games with solo, pass-and-play, online rooms and local Wi-Fi modes.",
          "An RL agent that learned to explore a classic handheld RPG from pixels.",
        ],
      },
    ],
    links: [
      { label: "Petal Quest on GitHub", href: "https://github.com/Tatsat454/PetalQuest" },
      { label: "Pocket Console on GitHub", href: "https://github.com/Tatsat454/pocket-console" },
    ],
  },
  {
    slug: "skills",
    kind: "page",
    eyebrow: "Skills",
    title: "What I reach for",
    summary: "The tools I use most, with a real example of when I used each one.",
    sections: [],
  },
];

export const museumExhibits = [
  "nyc-taxi-ddc",
  "pjm-ai-electricity",
  "startup-failure",
  "home-robot-vlm",
  "pokemon-red-agent",
  "pocket-console",
] as const;

/** The five indoor gallery pedestals. Donation stars and the Curator's counter use this list. */
export const galleryExhibits = [
  "nyc-taxi-ddc",
  "virtual-economies",
  "game-teardown",
  "feature-spec",
  "user-research",
] as const;

/** Smaller builds listed in the museum's archive drawer and on /work. */
export const archive = [
  { title: "Petal Quest", blurb: "Pixel RPG on raw HTML5 Canvas.", href: "https://github.com/Tatsat454/PetalQuest" },
  { title: "Edge Finder", blurb: "Pricing, EV and parlay math for betting markets.", href: "https://github.com/Tatsat454/GamblingOdds" },
  { title: "Days Away", blurb: "SwiftUI countdowns with 11 widget styles.", href: "https://github.com/Tatsat454/DaysAway" },
  { title: "Fall GUI", blurb: "Cozy autumn desktop dashboard with Spotify controls.", href: "https://github.com/Tatsat454/Fall-GUI" },
];

export type Landmark = {
  id: LandmarkId;
  name: string;
  section: string;
  eyebrow: string;
  title: string;
  blurb: string;
  cta: { label: string; href: string } | null;
};

export const landmarks: Landmark[] = [
  {
    id: "house",
    name: "My House",
    section: "About me",
    eyebrow: "My House · About",
    title: "Hi, I'm Tatsat.",
    blurb:
      "M.S. Economics at Georgia Tech, former founder, weekly writer, lifelong gamer. I want to build the economies and systems that make games feel alive.",
    cta: { label: "Come on in", href: "/story/about" },
  },
  {
    id: "townhall",
    name: "Town Hall",
    section: "Work experience",
    eyebrow: "Town Hall · Experience",
    title: "The official record",
    blurb:
      "Founder & CEO for four and a half years, analytics intern who cut opex 20%, sponsorship lead who brought in ~$134K, and now President of Georgia Tech's M.S. Econ Org.",
    cta: { label: "Read the record", href: "/story/experience" },
  },
  {
    id: "museum",
    name: "Museum",
    section: "Projects",
    eyebrow: "Museum · Projects",
    title: "The collection",
    blurb: "Five exhibits inside, each one a project. Walk in — Moss will show you around. Read a story to the end to donate it.",
    cta: null,
  },
  {
    id: "market",
    name: "Market Stall",
    section: "Econ thesis: virtual economies",
    eyebrow: "Market Stall · Econ thesis",
    title: "Virtual economies",
    blurb: "Prices here drift a little while you watch. That's the thesis: game economies are real economies, and they deserve real models.",
    cta: { label: "Browse the stall", href: "/story/virtual-economies" },
  },
  {
    id: "arcade",
    name: "Arcade Shack",
    section: "Game teardowns",
    eyebrow: "Arcade Shack · Games",
    title: "Insert coin",
    blurb: "How I take games apart (loops, economies, retention), what I'm playing right now, and the games I've built myself.",
    cta: { label: "Play the teardowns", href: "/story/arcade" },
  },
  {
    id: "dock",
    name: "Dock",
    section: "Contact",
    eyebrow: "Dock · Contact",
    title: "Send a message in a bottle",
    blurb: "Hiring for product, growth or partnerships in games and entertainment? I'd love to hear from you. I usually reply within a day.",
    cta: { label: "Email me", href: "mailto:tat.upadhyay@gmail.com" },
  },
];

export type Skill = {
  id: string;
  name: string;
  /** 1–5, sets crop height. */
  level: number;
  crop: "sprout" | "wheat" | "carrot" | "tulip" | "berry" | "sunflower";
  example: string;
};

export const skills: Skill[] = [
  {
    id: "econometrics",
    name: "Econometrics",
    level: 5,
    crop: "sunflower",
    example:
      "Estimated a Dynamic Discrete Choice model of NYC taxi drivers from 83K+ trips using value function iteration (NFXP).",
  },
  {
    id: "python",
    name: "Python",
    level: 5,
    crop: "wheat",
    example: "Built the DDC estimation pipeline and trained a PPO reinforcement-learning agent with Stable-Baselines3.",
  },
  {
    id: "sql",
    name: "SQL",
    level: 4,
    crop: "carrot",
    example: "Automated CRM reporting at WellomyTech, removing ~32 hours of manual analysis.",
  },
  {
    id: "r-stata",
    name: "R & Stata",
    level: 4,
    crop: "berry",
    example: "Estimated structural models and ran advanced econometrics coursework in R (Tidyverse, ggplot) and Stata.",
  },
  {
    id: "dashboards",
    name: "Power BI & Tableau",
    level: 3,
    crop: "tulip",
    example: "Turned $15K+/month of AWS spend into a cost dashboard whose recommendations cut opex 20%.",
  },
  {
    id: "gtm",
    name: "Go-to-market",
    level: 4,
    crop: "sprout",
    example: "Built two revenue streams at Divinity Supply & Co. and ran a 50+ sponsor pipeline for UCR Formula SAE.",
  },
];

export type ItemId =
  | "spiral-shell"
  | "sand-dollar"
  | "pink-cowrie"
  | "moon-snail"
  | "sunpeach"
  | "honeypear"
  | "cloudberry"
  | "taxi-token"
  | "lightning-jar"
  | "carbon-offcut"
  | "tiny-cartridge"
  | "pixel-petal"
  | "official-visitor";

export type Item = {
  id: ItemId;
  name: string;
  kind: "shell" | "fruit" | "hidden";
  color: string;
  flavor: string;
  placeholder?: boolean;
};

export const items: Item[] = [
  {
    id: "spiral-shell",
    name: "Spiral shell",
    kind: "shell",
    color: "#FFC4D6",
    flavor: "Tatsat writes Bal Sabha books, the texts children in BAPS's youth program read every week.",
  },
  {
    id: "sand-dollar",
    name: "Sand dollar",
    kind: "shell",
    color: "#F2E6D8",
    flavor: "He ran his own apparel & design brand for four and a half years: ~$100K in sales, zero investors.",
  },
  {
    id: "pink-cowrie",
    name: "Pink cowrie",
    kind: "shell",
    color: "#FF8A65",
    flavor: "He's President of the M.S. Economics Organization at Georgia Tech.",
  },
  {
    id: "moon-snail",
    name: "Moon snail shell",
    kind: "shell",
    color: "#C7B9FF",
    flavor: "PLACEHOLDER: a fun fact only his friends know.",
    placeholder: true,
  },
  {
    id: "sunpeach",
    name: "Sunpeach",
    kind: "fruit",
    color: "#FFC857",
    flavor: "He publishes an essay on The Next Framework every single week.",
  },
  {
    id: "honeypear",
    name: "Honeypear",
    kind: "fruit",
    color: "#FF8A65",
    flavor: "4.0 GPA through a PhD-level microeconomics sequence, while running two orgs.",
  },
  {
    id: "cloudberry",
    name: "Cloudberry",
    kind: "fruit",
    color: "#7B6CF6",
    flavor: "PLACEHOLDER: his all-time favorite game, and the one mechanic he'd steal from it.",
    placeholder: true,
  },
  {
    id: "taxi-token",
    name: "Taxi token",
    kind: "hidden",
    color: "#FFC857",
    flavor: "One of 83,000+ NYC taxi trips he modeled to learn how drivers decide where to go next.",
  },
  {
    id: "lightning-jar",
    name: "Lightning in a jar",
    kind: "hidden",
    color: "#FFF3A3",
    flavor: "A souvenir from his research on AI data centers straining the PJM power grid.",
  },
  {
    id: "carbon-offcut",
    name: "Carbon-fiber offcut",
    kind: "hidden",
    color: "#1E1B3A",
    flavor: "Left over from the home robot he's building for his grandparents at the GT makerspace.",
  },
  {
    id: "tiny-cartridge",
    name: "Tiny cartridge",
    kind: "hidden",
    color: "#C8373C",
    flavor: "He trained an RL agent to explore a classic handheld RPG, and it made it all the way to the forest.",
  },
  {
    id: "pixel-petal",
    name: "Pixel petal",
    kind: "hidden",
    color: "#FFC4D6",
    flavor: "From Petal Quest, the pixel RPG he wrote from scratch on HTML5 Canvas.",
  },
  {
    id: "official-visitor",
    name: "Official Visitor certificate",
    kind: "hidden",
    color: "#FFF6E6",
    flavor: "Stamped at Town Hall. The Island Records recognize you as an official visitor.",
  },
];

export type ResidentId = "bramble" | "drizzle" | "pip";

export type Resident = {
  id: ResidentId;
  name: string;
  species: string;
  role: "Greeter" | "Guide" | "Fan";
  tagColor: string;
  /** Babble voice range in Hz. */
  voice: [number, number];
  /** Landmarks visited before this resident moves in. */
  unlockAt: number;
  intro: string;
  lines: string[];
};

export const residents: Resident[] = [
  {
    id: "bramble",
    name: "Bramble",
    species: "a mossy bun",
    role: "Greeter",
    tagColor: "#7CC49A",
    voice: [220, 330],
    unlockAt: 0,
    intro: "Oh! A visitor! Welcome to Pocket Island!",
    lines: [
      "This is Tatsat's island. Every building is one piece of his portfolio.",
      "{controls}",
      "Walk up to a building and I bet something nice happens.",
      "In a hurry? The 'Just show me the work' button up top has everything, no walking required.",
    ],
  },
  {
    id: "drizzle",
    name: "Drizzle",
    species: "a tiny cloud with legs",
    role: "Guide",
    tagColor: "#8FD3E8",
    voice: [380, 560],
    unlockAt: 1,
    intro: "Hiya! I float around and keep track of where you've been.",
    lines: ["{guide}"],
  },
  {
    id: "pip",
    name: "Pip",
    species: "a pebble with a leaf sprout",
    role: "Fan",
    tagColor: "#FFC857",
    voice: [300, 440],
    unlockAt: 3,
    intro: "Psst. I'm Tatsat's biggest fan. Want to hear something?",
    lines: [
      "He once ran finance, marketing and ops for his own brand, all at the same time. For four and a half years!",
      "PLACEHOLDER testimonial: \"Tatsat is the person who…\", from a real manager, professor or teammate (name, role).",
      "Shake the fruit trees. Everything that falls out has a fact about him in it.",
    ],
  },
];

/** Market Stall ticker: prices drift slowly around these bases. */
export const marketGoods = [
  { name: "Sunpeach", base: 120 },
  { name: "Blossom bundle", base: 340 },
  { name: "Mystery crate", base: 980 },
  { name: "Premium seeds", base: 55 },
];

export const copy = {
  loadingLine: "hi. you found it.",
  hudHint: { desktop: "Arrow keys or WASD to explore", mobile: "Tap to explore" },
  fastModeCta: "Just show me the work",
  enterIsland: "Enter the island",
  backToIsland: "Back to the island",
  islandComplete: "You found every corner of Pocket Island!",
  pocketsFull: "Your pockets are full",
  insidePrefix: "Inside",
  currentlyPlaying: {
    placeholder: true,
    games: ["PLACEHOLDER game", "PLACEHOLDER game", "PLACEHOLDER game"],
  },
};

/**
 * The Inspiration Arcade: pal lines, cabinet stories, and write-up links.
 * Anything starting with PLACEHOLDER is meant to be replaced.
 */
export const arcadePal = {
  id: "blink",
  name: "Blink",
  role: "Attendant",
  tagColor: "#FF8AE2",
  voice: [310, 470] as [number, number],
  welcome: [
    "Welcome to the arcade! These are Tatsat's inspirations, the games that made him want to build games.",
    "Walk up to any cabinet to hear its story!",
  ],
};

/**
 * The Museum: Moss the Curator and the five gallery plaques.
 * Anything starting with PLACEHOLDER is meant to be replaced.
 */
export const museumPal = {
  id: "moss",
  name: "Moss",
  role: "Curator",
  tagColor: "#D4A13A",
  voice: [340, 500] as [number, number],
  welcome: [
    "Welcome to the Museum! Every exhibit here is one of Tatsat's projects. The most important one is waiting at the top of the stairs!",
  ],
  progress: "You've seen {n} of 5 exhibits!",
  thanks: "PLACEHOLDER: a thank-you for seeing every exhibit — something warm, specific, and a little proud.",
};

export const museumInteriorCopy = {
  curator: {
    name: "Moss",
    verb: "Talk",
    title: "Museum curator",
    lines: ["{gallery}"],
  },
  exhibit1: {
    name: "Why taxi drivers drive where they drive",
    verb: "Read",
    title: "Why taxi drivers drive where they drive",
    lines: [
      "Why taxi drivers drive where they drive",
      "A Dynamic Discrete Choice model of NYC taxi drivers, estimated from 83,000+ trips, to recover the preferences behind every 'where next?' decision.",
      "Key result: 83K+ trips, 265 zones folded into 15, a full NFXP model of where drivers search next.",
    ],
    href: "/story/nyc-taxi-ddc",
    hrefLabel: "Read the story",
  },
  exhibit2: {
    name: "Virtual economies, priced like real ones",
    verb: "Read",
    title: "Virtual economies, priced like real ones",
    lines: [
      "Virtual economies, priced like real ones",
      "My economics thesis direction: what game economies can learn from real markets, and vice versa.",
      "PLACEHOLDER: one key result from the virtual-economies thesis.",
    ],
    href: "/story/virtual-economies",
    hrefLabel: "Read the story",
  },
  exhibit3: {
    name: "PLACEHOLDER: game teardown title",
    verb: "Read",
    title: "PLACEHOLDER: game teardown title",
    lines: [
      "PLACEHOLDER: game teardown title",
      "PLACEHOLDER: one-line summary of the teardown — core loop, economy, or retention hook.",
      "PLACEHOLDER: one key result from the game teardown.",
    ],
    href: "/story/game-teardown",
    hrefLabel: "Read the story",
  },
  exhibit4: {
    name: "PLACEHOLDER: feature spec title",
    verb: "Read",
    title: "PLACEHOLDER: feature spec title",
    lines: [
      "PLACEHOLDER: feature spec title",
      "PLACEHOLDER: one-line summary of the feature and the player problem it solves.",
      "PLACEHOLDER: one key result from the feature spec.",
    ],
    href: "/story/feature-spec",
    hrefLabel: "Read the story",
  },
  exhibit5: {
    name: "PLACEHOLDER: user-research / side-project title",
    verb: "Read",
    title: "PLACEHOLDER: user-research / side-project title",
    lines: [
      "PLACEHOLDER: user-research / side-project title",
      "PLACEHOLDER: one-line summary of the research or side project and what you were trying to learn.",
      "PLACEHOLDER: one key result from the user-research project.",
    ],
    href: "/story/user-research",
    hrefLabel: "Read the story",
  },
};

export const arcadeInteriorCopy = {
  cabinet1: {
    name: "God of War II",
    verb: "Play",
    title: "God of War II",
    lines: [
      "This cabinet is God of War II — one of the games that made Tatsat want to build games.",
      "PLACEHOLDER: why God of War II inspired Tatsat.",
      "What I learned as a future PM:",
      "PLACEHOLDER: the PM lesson from God of War II.",
    ],
    href: "PLACEHOLDER God of War II write-up URL",
    hrefLabel: "Read the full write-up",
  },
  cabinet2: {
    name: "Final Fantasy VII Remake series",
    verb: "Play",
    title: "Final Fantasy VII Remake series",
    lines: [
      "This cabinet is the Final Fantasy VII Remake series — another game that pulled Tatsat toward making games.",
      "PLACEHOLDER: why the Final Fantasy VII Remake series inspired Tatsat.",
      "What I learned as a future PM:",
      "PLACEHOLDER: the PM lesson from the Final Fantasy VII Remake series.",
    ],
    href: "PLACEHOLDER FF7 Remake write-up URL",
    hrefLabel: "Read the full write-up",
  },
  cabinet3: {
    name: "Final Fantasy XV",
    verb: "Play",
    title: "Final Fantasy XV",
    lines: [
      "This cabinet is Final Fantasy XV — a road-trip RPG that stuck with Tatsat.",
      "PLACEHOLDER: why Final Fantasy XV inspired Tatsat.",
      "What I learned as a future PM:",
      "PLACEHOLDER: the PM lesson from Final Fantasy XV.",
    ],
    href: "PLACEHOLDER Final Fantasy XV write-up URL",
    hrefLabel: "Read the full write-up",
  },
  cabinet4: {
    name: "Horizon",
    verb: "Play",
    title: "Horizon",
    lines: [
      "This cabinet is Horizon — machines, wilds, and a world Tatsat still thinks about.",
      "PLACEHOLDER: why Horizon inspired Tatsat.",
      "What I learned as a future PM:",
      "PLACEHOLDER: the PM lesson from Horizon.",
    ],
    href: "PLACEHOLDER Horizon write-up URL",
    hrefLabel: "Read the full write-up",
  },
};

/**
 * The Island Records (Town Hall): clerk lines, history-wall frames, notices, certificate.
 * Anything starting with PLACEHOLDER is meant to be replaced.
 */
export const townHallPal = {
  id: "quill",
  name: "Quill",
  role: "Clerk",
  tagColor: "#4B3FB5",
  voice: [270, 410] as [number, number],
  welcome: [
    "Welcome to Town Hall! These are the official records of Tatsat's journey. Walk along the history wall to see every chapter, or ask me for the full resume!",
  ],
  ask: "How can the records office help you today?",
  resumeLines: [
    "The full resume is on file. I'll stamp the envelope — you can open it from here.",
  ],
  resumeHref: "https://thenextframework.blog/496-2/",
  resumeHrefLabel: "Open resume",
  lookingFor: [
    "Tatsat is looking for product roles in games and entertainment — live ops, economy, and systems that make a world feel alive.",
    "PLACEHOLDER: one more sentence on the kind of team, studio, or problem he wants next.",
  ],
};

export const townHallInteriorCopy = {
  clerk: {
    name: "Quill",
    verb: "Talk",
    title: "Records clerk",
    lines: ["How can the records office help you today?"],
  },
  frame1: {
    name: "2020 · Founder",
    verb: "Read",
    title: "Founder & CEO",
    year: "2020",
    lines: [
      "Founder & CEO — Divinity Supply & Co.",
      "Mar 2020 – Sep 2024",
      "Owned an apparel and design brand end to end: discovery, design, launch, iteration.",
      "Result: ~$100K in sales, two revenue streams, a 2–3 person remote team.",
    ],
    href: "/story/experience",
    hrefLabel: "Read the full record",
  },
  frame2: {
    name: "2024 · Internship",
    verb: "Read",
    title: "Business & Analytics Intern",
    year: "2024",
    lines: [
      "Business & Analytics Intern — WellomyTech",
      "Apr 2024 – Mar 2025",
      "Turned AWS, CRM, and hiring data into decisions for the CEO.",
      "Result: recommendations that cut operating expenses 20% and saved ~32 hours of reporting.",
    ],
    href: "/story/experience",
    hrefLabel: "Read the full record",
  },
  frame3: {
    name: "2025 · Education",
    verb: "Read",
    title: "B.A. Business Economics",
    year: "2025",
    lines: [
      "B.A. Business Economics — University of California, Riverside",
      "Jan 2025 – May 2026 · GPA 3.93",
      "PLACEHOLDER: one line on what this chapter taught him.",
      "Result: a foundation in markets, then straight into graduate economics.",
    ],
    href: "/story/experience",
    hrefLabel: "Read the full record",
  },
  frame4: {
    name: "2025 · Partnerships",
    verb: "Read",
    title: "Website & Sponsorship Lead",
    year: "2025",
    lines: [
      "Website & Sponsorship Lead — UCR Formula SAE",
      "Feb 2025 – May 2025",
      "Ran a 50+ prospect pipeline and turned engineering needs into partnership asks.",
      "Result: ~$134K across ~13 partners, plus a redesigned team site.",
    ],
    href: "/story/experience",
    hrefLabel: "Read the full record",
  },
  frame5: {
    name: "2026 · Graduate school",
    verb: "Read",
    title: "M.S. Economics",
    year: "2026",
    lines: [
      "M.S. Economics — Georgia Institute of Technology",
      "Aug 2026 – Apr 2027 · GPA 4.0",
      "PhD-level micro sequence while running student orgs and writing every week.",
      "Result: PLACEHOLDER: the question this degree is helping him answer.",
    ],
    href: "/story/experience",
    hrefLabel: "Read the full record",
  },
  frame6: {
    name: "2026 · Leadership",
    verb: "Read",
    title: "President, M.S. Economics Organization",
    year: "2026",
    lines: [
      "President — M.S. Economics Organization, Georgia Tech",
      "2026 – present",
      "Leading and representing the graduate economics community.",
      "Result: PLACEHOLDER: one concrete thing the org shipped under his watch.",
    ],
    href: "/story/experience",
    hrefLabel: "Read the full record",
  },
  certificate: {
    name: "Mayor's certificate",
    verb: "Look",
    title: "Degree on file",
    lines: [
      "Issued by the Island Records office.",
      "Georgia Institute of Technology — M.S. Economics, Aug 2026 – Apr 2027 · GPA 4.0",
      "University of California, Riverside — B.A. Business Economics, Jan 2025 – May 2026 · GPA 3.93",
      "PLACEHOLDER: a line you'd want on a diploma wall, in your own words.",
    ],
  },
  notices: {
    name: "Notice board",
    verb: "Read",
    title: "Announcements",
    lines: [
      "Town Hall announcements — pin a note, leave a note.",
      "PLACEHOLDER: a recent award, publication, or talk.",
      "PLACEHOLDER: a club, org, or community win.",
      "PLACEHOLDER: news you'd put on a fridge: shipping, a launch, a yes.",
    ],
  },
  stamp: {
    name: "Official stamp",
    verb: "Stamp",
    title: "Records stamp",
    lines: [
      "THUNK. The clerk's stamp bites the paper.",
      "You're on file now — an Official Visitor certificate slides into your pockets.",
    ],
    already: "This page is already stamped. Check your pockets for the Official Visitor certificate.",
  },
};

/**
 * Copy for objects inside My House.
 */
export const houseInteriorCopy = {
  computer: {
    name: "Computer",
    verb: "Use",
    title: "My resume",
    lines: [
      "The chunky beige box still boots. Resume's on the desktop — the short version of how I got here.",
      "Aspiring product manager: 4.0 in Georgia Tech's M.S. Economics, president of the graduate econ org, and I take work from the data all the way through the writing.",
    ],
    href: "https://thenextframework.blog/496-2/",
    hrefLabel: "Open resume",
  },
  tv: {
    name: "TV",
    verb: "Watch",
    title: "What I'm watching right now",
    lines: [
      "The queue is a mix of prestige, comfort, and legal-drama popcorn.",
      "Lanterns, on HBO Max. Super suspenseful mystery — DC is stepping up their game.",
      "Jane the Virgin. I can't believe I hadn't watched this until now. Almost done with season 2!",
      "Suits. This would never happen in real life, but it is pure entertainment.",
    ],
    shows: [
      { title: "Lanterns", detail: "DC mystery", color: "#1F6B4A" },
      { title: "Jane the Virgin", detail: "Season 2", color: "#E8513F" },
      { title: "Suits", detail: "Legal popcorn", color: "#2C3A6B" },
    ],
  },
  bookshelf: {
    name: "Bookshelf",
    verb: "Browse",
    title: "Three I've read",
    lines: [
      "Nudge — Richard Thaler and Cass Sunstein. I love this one: it shows how behavioral economics actually works, and how you can trick your own mind.",
      "Think and Grow Rich — Napoleon Hill. A really good book, and the ideals haven't aged.",
      "Persuasion — Robert Cialdini. An interesting take on how you sell things — and, more importantly, how you persuade.",
    ],
  },
  picture: {
    name: "Framed picture",
    verb: "Look",
    title: "About me",
    lines: [
      "Hi — I'm Tatsat. M.S. Economics at Georgia Tech, former founder, weekly writer, lifelong gamer.",
      "I want to build the economies and systems that make games feel alive.",
      "I love cars. Shang-Chi is my favorite Marvel hero. I grew up on Pokémon, Bakugan, and Vanguard.",
    ],
  },
  bed: {
    name: "Bed",
    verb: "Sit",
    title: "Bed",
    lines: ["Not sleepy yet!"],
  },
};

/** Marks invented filler so Tatsat can find and replace it. */
export const PLACEHOLDER = (s: string) => `PLACEHOLDER: ${s}`;

/** Copy for plaza props. Wish lines are placeholders until Tatsat writes real ones. */
export const plazaCopy = {
  fountain: {
    name: "Fountain",
    verb: "Toss a coin?",
    wishes: [
      PLACEHOLDER("A quiet wish about the next paper, the next game, or the next yes."),
      PLACEHOLDER("Something you'd only tell a fountain — small, specific, and a little greedy."),
      PLACEHOLDER("A wish for the team you haven't met yet."),
      PLACEHOLDER("One true launch, and someone who notices."),
    ],
  },
  bench: {
    name: "Bench",
    verb: "Sit",
  },
};

export const getStory = (slug: string) => stories.find((s) => s.slug === slug);
export const getLandmark = (id: LandmarkId) => landmarks.find((l) => l.id === id)!;
export const getItem = (id: ItemId) => items.find((i) => i.id === id)!;
export const isPlaceholderText = (s: string) => s.startsWith("PLACEHOLDER");
