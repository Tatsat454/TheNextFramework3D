/**
 * Every piece of copy on Pocket Island lives here. Components only read from this file.
 *
 * Anything marked `placeholder: true` (or wrapped in PLACEHOLDER(...)) is invented filler
 * that Tatsat should replace with real content. `draft: true` sections were written from
 * his resume/portfolio but interpret beyond it, so they need a quick review.
 */

export type LandmarkId = "house" | "townhall" | "museum" | "market" | "arcade" | "garden" | "dock";

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
    eyebrow: "Garden · Skills",
    title: "What grows in the garden",
    summary: "Each crop row is a skill. Taller crops are the ones I've used most, on real work.",
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
    blurb: "Six exhibits, from structural econometrics to a robot for my grandparents. Read one to the end to donate it to the museum.",
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
    id: "garden",
    name: "Garden",
    section: "Skills",
    eyebrow: "Garden · Skills",
    title: "Tend the garden",
    blurb: "Every crop row is a skill. Grab the watering can and water a row to see it grow, with a real example of when I used it.",
    cta: { label: "See every skill", href: "/story/skills" },
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
  | "pixel-petal";

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
];

export type ResidentId = "bramble" | "drizzle" | "pip" | "sol";

export type Resident = {
  id: ResidentId;
  name: string;
  species: string;
  role: "Greeter" | "Guide" | "Fan" | "Curator";
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
  {
    id: "sol",
    name: "Sol",
    species: "a round sunny bird",
    role: "Curator",
    tagColor: "#FF8A65",
    voice: [480, 700],
    unlockAt: 5,
    intro: "Welcome, welcome! I'm the curator of this fine museum.",
    lines: [
      "Each pedestal out front holds one of Tatsat's projects.",
      "Read an exhibit all the way to the end and I'll mark it donated with a gold star.",
      "{museum}",
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
  wateringCan: "You got a watering can!",
  currentlyPlaying: {
    placeholder: true,
    games: ["PLACEHOLDER game", "PLACEHOLDER game", "PLACEHOLDER game"],
  },
};

export const getStory = (slug: string) => stories.find((s) => s.slug === slug);
export const getLandmark = (id: LandmarkId) => landmarks.find((l) => l.id === id)!;
export const getItem = (id: ItemId) => items.find((i) => i.id === id)!;
export const isPlaceholderText = (s: string) => s.startsWith("PLACEHOLDER");
