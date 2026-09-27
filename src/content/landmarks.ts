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
  table?: { headers: string[]; rows: string[][] };
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
  "Insight",
  "What I built",
  "How I measured it",
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
    title: "Geographic Concentration of AI-Driven Electricity Demand",
    summary:
      "PJM forecasts Northern Virginia's electricity use will nearly triple by 2045 while nearby zones grow much more slowly. Standard macro can't explain why, so I extended it.",
    meta: "UC Riverside · Jan–Mar 2026 · Advised by Prof. Youngeun Choi",
    tags: ["Energy markets", "Solow", "R", "PJM"],
    sections: [
      {
        heading: "Problem",
        body: [
          "Standard macro intuition says demand for a major input like electricity should grow gradually and fairly evenly across a mature economy. PJM's 2025 Long-Term Load Forecast says otherwise. The Dominion zone (Northern Virginia) is forecast to grow 5.25% a year from 2025 to 2045, going from 131,194 to 364,977 GWh, versus 3.78% for AEP and 4.14% for PL. DOM starts out smaller than AEP and ends up nearly 70,000 GWh ahead.",
        ],
      },
      {
        heading: "Insight",
        body: [
          "The Solow model explains why demand rises: AI is a productivity shock, capital builds up during the transition to a new steady state, and data-center capital can't run without continuous electricity. That means the grid sees the shock before GDP does. But Solow assumes technology applies evenly everywhere, so it can't explain why the growth piles up in one zone.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "An extension to the regional production function with a location-specific infrastructure and agglomeration multiplier, θᵢ. Northern Virginia's decades of grid capacity, fiber, and permitting experience make each unit of capital more productive there, and that advantage compounds. I backed it with FRED construction employment data (Virginia vs. Pennsylvania and Ohio, diverging from 2021) and industry investment figures. The analysis was done in R.",
        ],
      },
      {
        heading: "How I measured it",
        body: [
          "20-year CAGRs from PJM's Table E-1, checked against the reported growth rates, compared across three zones, and cross-checked against state-level construction employment indexed to 2015.",
        ],
      },
      {
        heading: "What I learned",
        body: [
          "DOM isn't growing faster because it's more technologically sophisticated. It's growing faster because it built the infrastructure first. Modern shocks need models with spatial frictions, or they'll keep underestimating how concentrated the adjustment gets.",
        ],
      },
    ],
    links: [{ label: "Read the full paper", href: "https://docs.google.com/document/d/1RdxttWFKVUh-v5Mpnh5NdulgkWqoU-2Z/edit" }],
  },
  {
    slug: "startup-failure",
    kind: "case-study",
    eyebrow: "Exhibit · Venture economics",
    title: "What Actually Separates Startups That Climb from Ones That Stall",
    summary: "Hold the idea constant. Then what decides whether a startup gets acquired or shuts down? I tested the folklore on 923 startups.",
    meta: "UC Riverside · Econ 106 final project",
    tags: ["Crunchbase", "R", "ggplot", "Venture"],
    sections: [
      {
        heading: "Problem",
        body: [
          "Post-mortems say startups mostly die from things other than the idea itself: no market need, running out of cash, the wrong team. Most startup advice about \"winning factors\" is intuitive but has no data behind it.",
        ],
      },
      {
        heading: "Insight",
        body: [
          "Some of the folklore held up and some didn't. More funding rounds and more milestones went with more capital raised, and Top 500 startups raised dramatically more. But VC backing didn't mean better outcomes. Non-VC startups were acquired 414 times vs. 208 closures (about 67% acquired), while VC-backed startups were 183 vs. 118 (about 61%). Likely reasons: survivorship bias, early strategic acquisitions of leaner startups, and VC pressure to swing bigger.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "A cleaned Crunchbase dataset (923 startups, 35 industries lumped into 5) and a set of R/ggplot visualizations: VC status vs. outcome, funding by status, rounds × funding × milestones, and Top 500 funding distributions by industry.",
        ],
      },
      {
        heading: "How I measured it",
        body: [
          "Acquisition vs. closure (597 acquired, 326 closed), total funding on a log scale, funding rounds, milestones, relationships, and Top 500 status, broken out by industry.",
        ],
      },
      {
        heading: "What I learned",
        body: [
          "Once the idea is held constant, success belongs to the startups that show progress, pile up milestones, and get investor or public attention early. A lot of what the startup world assumes is shaped more by narrative than by data.",
        ],
      },
    ],
    links: [
      { label: "Read the full paper", href: "https://docs.google.com/document/d/1p5DEkt8RaFbv2ApwcXwB4Nx1NX4POlWb5OOID0KcHL4/edit" },
    ],
  },
  {
    slug: "home-robot-vlm",
    kind: "case-study",
    eyebrow: "Exhibit · In progress",
    title: "A Robot for Home",
    summary:
      "I'm building a robot in Georgia Tech's makerspace that picks clothes up off the floor, goes back to charge on its own, and eventually does basic cleaning around the house.",
    meta: "Georgia Tech makerspace · Ongoing",
    tags: ["VLM", "3D printing", "Carbon fiber", "Open source"],
    sections: [
      {
        heading: "Problem",
        body: [
          "My parents and grandparents have a hard time bending down to do small, repetitive tasks. I wanted to build something that actually helps, not another demo.",
        ],
      },
      {
        heading: "Insight",
        body: [
          "The hard part is the brain, not the body. Printing parts is doable. Connecting the electrical and mechanical pieces is the real problem. The brain is the kind of sequential decision I've already modeled — taxi drivers, a Pokémon agent.",
        ],
      },
      {
        heading: "What I'm building",
        body: [
          "I 3D-printed the robot's parts first. Now I'm learning to go from a 3D-printed mold to real carbon fiber using resin, so the chassis ends up light and strong instead of just plastic. For the brain, I'm using my ML background from econ coursework to build a Vision-Language Model (VLM).",
        ],
      },
      {
        heading: "How I'll measure it",
        body: [
          "Three jobs, in order: pick clothes up off the floor, head back and recharge without help, then handle basic cleaning. It works when my family stops having to do those tasks themselves.",
        ],
      },
      {
        heading: "What I've learned so far",
        body: [
          "Georgia Tech's makerspace means I get to actually build the robot instead of just modeling it on paper. The build forced me to learn a whole new skill — going from printed molds to carbon fiber — before the ML part even starts.",
        ],
      },
    ],
    links: [{ label: "See the build", href: "https://tatsatupadhyay.netlify.app/" }],
  },
  {
    slug: "pokemon-red-agent",
    kind: "case-study",
    eyebrow: "Exhibit · Reinforcement learning",
    title: "The Pokémon Reinforcement Problem",
    summary:
      "I spent 15 million training steps teaching an AI to play Pokémon Red. It became a brilliant explorer, a shameless cheater, and once, a total catatonic. It never won a single badge.",
    meta: "Personal project · 2026",
    tags: ["Python", "PyBoy", "Gymnasium", "PPO"],
    sections: [
      {
        heading: "Problem",
        body: [
          "Pokémon Red is brutal for reinforcement learning. There's no score and no feedback, and the first badge sits behind thousands of coordinated decisions. The agent has to behave coherently for most of an hour before the game even acknowledges it exists.",
        ],
      },
      {
        heading: "Insight",
        body: [
          "Every penalty in my reward function is scar tissue from an exploit: the infinite heal loop, menu camping, wall grinding. And because my novelty bonus reset every episode, re-exploring Pallet Town kept paying while the forest never did. The exploration bonus was pricing the frontier out.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "A PyBoy emulator wrapped as a Gymnasium environment, seven training runs, reward-hacking patches, and tile-visit heatmaps. Everything is released: environment, training code, logs, checkpoints, and heatmaps.",
        ],
      },
      {
        heading: "How I measured it",
        body: [
          "Actual game progress, which was zero everywhere, since reward wasn't comparable across runs. Policy entropy turned out to be the real early warning. In run 6 the reward still looked fine while entropy hit zero and the policy was already dead.",
        ],
      },
      {
        heading: "What I learned",
        body: [
          "Persist novelty across episodes, put game state in the observation, watch entropy like a smoke alarm, and only then scale compute. The agent learned everything I rewarded and nothing I wanted, and that's the test working.",
        ],
      },
    ],
    links: [
      { label: "Blog post", href: "https://thenextframework.blog/2026/07/13/the-pokemon-reinforcement-problem/" },
      { label: "Research", href: "https://shorturl.at/epbvJ" },
    ],
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
        heading: "What I learned at UCR",
        body: [
          "University of California, Riverside: B.A. Business Economics, Jan 2025 – May 2026 · GPA 3.93",
          "UCR is where I learned to think like an economist. Studying Business Economics taught me to start with intuition: before running a single regression, ask what should happen and why. Comparative statics became my go-to habit: change one thing, hold everything else constant, and trace the effect. Game theory taught me to think about how people respond to each other, not just to prices.",
          "It's also where I learned how to research. My PJM paper started as an econometrics assignment and turned into a real research question with a faculty mentor. My taxi model took 83,000 raw trip records and turned them into a structural model of how drivers make decisions. Along the way I picked up the tools to actually do the work: R, Python, Stata, SQL, and C++.",
        ],
      },
      {
        heading: "What I'm learning at Georgia Tech",
        body: [
          "Georgia Institute of Technology: M.S. Economics, Aug 2026 – Apr 2027 · GPA 4.0",
          "Georgia Tech is where intuition meets rigor. Through PhD-level Microeconomic Analysis, Econometrics, and Mathematical Economics, I'm learning quantitative research methods at a deeper level: not just how to run a model, but how to prove why it works and when it breaks.",
          "The bigger shift is applying those methods to real decisions. In Global Enterprise, I'm studying business entry decisions: when a firm should enter a market, how it should enter, and what it's betting on when it does. Money & Capital Markets adds how prices carry information and how capital moves. Together, it's teaching me to take a messy business question and turn it into something I can actually model, test, and answer.",
        ],
      },
    ],
    links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/tatsat-upadhyay" }],
  },
  {
    slug: "virtual-economies",
    kind: "page",
    eyebrow: "Market Stall · Econ thesis",
    title: "Open vs. closed virtual economies",
    summary:
      "Valorant's Night Market vs. CS2's player market: two ways to price skins, and what each one costs a live game.",
    tags: ["Valorant", "CS2", "Night Market", "Virtual economies"],
    sections: [
      {
        heading: "How the market is built",
        body: [
          "You buy Valorant Points (VP) with real money and spend them in Riot's store. Skins come in tiers: Select (875 VP), Deluxe (1,275 VP), and Premium (1,775 VP), with Exclusive and Ultra editions above that. There's no trading and no resale, so a skin's price is whatever Riot says it is, and its value to you is pure utility and identity, never investment.",
        ],
      },
      {
        heading: "Hidden insight 1: The tiers are versioning, not just price points",
        body: [
          "Each tier adds a specific layer. Select skins change the model but have no custom effects, finishers, or animations. Deluxe adds custom animations but no finisher or upgraded VFX. Premium adds custom models, VFX, animations, finishers, and sometimes variants. This is classic good-better-best pricing: the same weapon sold three ways, so players self-sort by willingness to pay. The cheaper tiers also make Premium look reasonable by comparison.",
        ],
      },
      {
        heading: "Hidden insight 2: The VP packs are designed to leave money behind",
        body: [
          "You can't buy an exact amount of VP. $9.99 gets 1,000 VP, $19.99 gets 2,050 VP, and larger packs add bonus VP, at roughly 100 VP per dollar. Skin prices don't line up with pack sizes, so a discounted Premium skin at around 1,420 VP will usually push you into the next pack and leave a leftover balance on your account. That leftover balance is a hook: it's \"money\" that only feels useful if you spend more later. Gift cards and airline miles work the same way.",
        ],
      },
      {
        heading: "Hidden insight 3: Night Market is personalized price discrimination",
        body: [
          "Once per Act, every player gets six random skins at a discount, from Select, Deluxe, and Premium tiers, excluding skins you already own, and they disappear after two weeks. Discounts range from 10% to 49%. The current one is live right now, running September 22 to October 6, 2026.",
          "What looks like a fun event is actually precise economics:",
        ],
        bullets: [
          "Everyone pays a different price. Your six offers aren't the same as a friend's. Riot can't see your willingness to pay, so it samples discounts and lets you reveal it.",
          "It protects full price for new skins. Skins released within two acts of the shop's opening are excluded from the pool. That's the hardcover-then-paperback strategy: collect full price from eager buyers first, then discount for everyone else later.",
          "It protects the top tier. Ultra Edition skins like Elderflame, Champions, and Spectrum never appear in Night Market. Never discounting the flagship keeps its price anchor intact.",
          "It's a reactivation event, not a reward. Every account that logs in during the window gets a Night Market, whether you played 400 games that act or none. It's designed to bring lapsed players back with a reason to spend.",
        ],
      },
      {
        heading: "Hidden insight 4: Riot closed the arbitrage loophole",
        body: [
          "Gifting was added in April 2025, but it's a fresh purchase from the featured store, and Night Market offers are excluded. If you could gift Night Market skins, players would buy discounted skins and resell them to friends, creating an informal secondary market. Blocking that keeps the discount personal and the price wall intact.",
        ],
      },
      {
        heading: "Hidden insight 5: Scarcity comes from time, not supply",
        body: [
          "In CS2, scarcity is how many items exist. In Valorant, every skin is infinitely available in theory, so scarcity comes from when you can buy it: rotating daily stores, bundles that leave, and Night Market windows. Once the event ends, skins go back to full price in the featured store. It's artificial scarcity through timing, and it creates urgency without the risk of a market crash.",
        ],
      },
      {
        heading: "CS2 vs. Valorant, side by side",
        body: [],
        table: {
          headers: ["", "CS2", "Valorant"],
          rows: [
            ["Economy type", "Open, player-driven", "Closed, publisher-priced"],
            ["Who sets prices", "The market", "Riot"],
            ["Scarcity from", "Supply (drop rates, trade-ups)", "Time (rotations, windows)"],
            ["Can skins lose value?", "Yes, as the Oct 2025 crash showed", "No, because they were never assets"],
            ["Main risk", "Supply shocks and broken trust", "Player fatigue with FOMO"],
            ["Price discrimination", "Emerges from the market", "Designed (Night Market)"],
          ],
        },
      },
      {
        heading: "What a game PM takes from this",
        body: [
          "CS2 shows what happens when you let a real market form: huge engagement and value, but your patch notes become monetary policy. Valorant shows the other path: give up the secondary market and you get total pricing control, no crash risk, and the ability to price-discriminate precisely. Neither is \"right.\" The choice between them is one of the biggest economy-design decisions a live game makes, and it's a clean frame for this Market Stall thesis: open vs. closed virtual economies, and what each one costs.",
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
    title: "Games that made me want to build",
    summary: "Four cabinets. Four games that pulled me in, and what each one taught me about product.",
    sections: [
      {
        heading: "God of War Ragnarök",
        body: [
          "I love God of War. The story is truly a story: it pulls you in, shows what fantasy really is at its best, and makes it fun just to be part of that world. The camera is what makes it special. The way it's placed and the way it moves, you're not just watching a movie. In combat, it feels like you are Kratos.",
          "One design decision can change how people experience the whole product. The camera turns players from viewers into participants, and that's what I want to build toward: products where people feel like they're part of the experience, not just watching it.",
        ],
      },
      {
        heading: "Final Fantasy VII Remake Series",
        body: [
          "This series shows how much depth every character can have, not just the main cast but the side characters too. People who only had a few lines in the original, like Jessie, Biggs, and Wedge, now have their own stories and real reasons to care about them.",
          "You can take an existing concept and give it a new direction. Keep what's already great, add a new layer to it, and fix what isn't working. It's the simplest and most iterative process there is.",
        ],
      },
      {
        heading: "Pokémon X and Y",
        body: [
          "Pokémon follows a simple recipe: beat eight gyms, stop the evil team, catch the legendary, defeat the Elite Four, and become Champion. It was so cool and so immersive to be part of that. The 3DS as a product kept finding new ways to play, and the battles made you feel like reality didn't exist.",
          "I learned how Pokémon kept finding new gameplay mechanics, and how a creative risk paired with the right concept can turn into a hugely successful product. X and Y proved it: Mega Evolution and fully 3D battles took a proven formula and made it feel new again.",
        ],
      },
      {
        heading: "Horizon Zero Dawn",
        body: [
          "I loved how Horizon brought its machines to life through AI. They're robots, but their behavior makes them move and act like real animals: grazing, keeping watch, reacting to danger as a herd. I still wonder how they pulled it off, because it looks so real.",
          "Execution requires sweating the details most people will never consciously notice. Players don't think about behavior systems, they just feel that the world is alive. That feeling only happens when a team gets hundreds of small things right.",
        ],
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
] as const;

/** The five indoor gallery pedestals. Donation stars and the Curator's counter use this list. */
export const galleryExhibits = [
  "nyc-taxi-ddc",
  "pjm-ai-electricity",
  "startup-failure",
  "home-robot-vlm",
  "pokemon-red-agent",
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
    title: "Open vs. closed",
    blurb: "Valorant prices what CS2 lets the market decide. The stall's numbers drift while you watch — a closed economy, in a crate.",
    cta: { label: "Read the thesis", href: "/story/virtual-economies" },
  },
  {
    id: "arcade",
    name: "Arcade Shack",
    section: "Games that inspired me",
    eyebrow: "Arcade Shack · Games",
    title: "Insert coin",
    blurb: "Four games that made me want to build, and the games I've built myself.",
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
    flavor: "Tatsat is a huge nerd. He grew up playing Beyblade. His favorite is L-Drago.",
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
    flavor: "His all-time favorite is Final Fantasy XV. He'd steal Warp: Prince Noctis throws his weapon and instantly teleports to it. Fueled by the magic of the Lucian kings, that move is the backbone of the game's combat and exploration.",
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

/** Market Stall ticker: Valorant skin tiers, drifting around list price. */
export const marketGoods = [
  { name: "Select skin", base: 875 },
  { name: "Deluxe skin", base: 1275 },
  { name: "Premium skin", base: 1775 },
  { name: "Night Market cut", base: 1420 },
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
    placeholder: false,
    games: ["Wolverine", "Pokémon Brilliant Diamond", "Cyberpunk 2077"],
  },
};

/**
 * The Inspiration Arcade: pal lines and cabinet stories.
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
  thanks: "You saw all five — the taxi, the grid, the startups, the robot, and the agent that never won a badge. That's the collection.",
};

export const museumInteriorCopy = {
  curator: {
    name: "Moss",
    verb: "Talk",
    title: "Museum curator",
    lines: ["{gallery}"],
  },
  exhibit1: {
    name: "NYC taxis",
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
    name: "The grid",
    verb: "Read",
    title: "Geographic Concentration of AI-Driven Electricity Demand",
    lines: [
      "Geographic Concentration of AI-Driven Electricity Demand",
      "PJM forecasts Northern Virginia's electricity use will nearly triple by 2045 while nearby zones grow much more slowly. Standard macro can't explain why, so I extended it.",
      "5.25% vs. 3.78%. Same technology shock, very different grids. Faculty mentor: Prof. Youngeun Choi, UCR, Jan–Mar 2026.",
    ],
    href: "/story/pjm-ai-electricity",
    hrefLabel: "Read the story",
  },
  exhibit3: {
    name: "Startups that climb",
    verb: "Read",
    title: "What Actually Separates Startups That Climb from Ones That Stall",
    lines: [
      "What Actually Separates Startups That Climb from Ones That Stall",
      "Hold the idea constant. Then what decides whether a startup gets acquired or shuts down? I tested the folklore on 923 startups.",
      "VC-backed isn't the same as more likely to survive. In 923 startups, non-VC firms were acquired at a higher rate.",
    ],
    href: "/story/startup-failure",
    hrefLabel: "Read the story",
  },
  exhibit4: {
    name: "A Robot for Home",
    verb: "Read",
    title: "A Robot for Home",
    lines: [
      "A Robot for Home",
      "I'm building a robot in Georgia Tech's makerspace that picks clothes up off the floor, goes back to charge on its own, and eventually does basic cleaning around the house.",
      "Printed, going carbon fiber, and getting open-sourced — models, print files, and build guide — once it works.",
    ],
    href: "/story/home-robot-vlm",
    hrefLabel: "Read the story",
  },
  exhibit5: {
    name: "Pokémon RL",
    verb: "Read",
    title: "The Pokémon Reinforcement Problem",
    lines: [
      "The Pokémon Reinforcement Problem",
      "I spent 15 million training steps teaching an AI to play Pokémon Red. It became a brilliant explorer, a shameless cheater, and once, a total catatonic. It never won a single badge.",
      "15M steps. Reward tripled. 0 badges.",
    ],
    href: "/story/pokemon-red-agent",
    hrefLabel: "Read the story",
  },
};

export const arcadeInteriorCopy = {
  cabinet1: {
    name: "God of War Ragnarök",
    verb: "Play",
    title: "God of War Ragnarök",
    lines: [
      "I love God of War. The story is truly a story: it pulls you in, shows what fantasy really is at its best, and makes it fun just to be part of that world.",
      "The camera is what makes it special. The way it's placed and the way it moves, you're not just watching a movie. In combat, it feels like you are Kratos.",
      "What I learned as a future PM:",
      "One design decision can change how people experience the whole product. The camera turns players from viewers into participants, and that's what I want to build toward: products where people feel like they're part of the experience, not just watching it.",
    ],
  },
  cabinet2: {
    name: "Final Fantasy VII Remake",
    verb: "Play",
    title: "Final Fantasy VII Remake Series",
    lines: [
      "This series shows how much depth every character can have, not just the main cast but the side characters too. People who only had a few lines in the original, like Jessie, Biggs, and Wedge, now have their own stories and real reasons to care about them.",
      "What I learned as a future PM:",
      "You can take an existing concept and give it a new direction. Keep what's already great, add a new layer to it, and fix what isn't working. It's the simplest and most iterative process there is.",
    ],
  },
  cabinet3: {
    name: "Pokémon X and Y",
    verb: "Play",
    title: "Pokémon X and Y",
    lines: [
      "Pokémon follows a simple recipe: beat eight gyms, stop the evil team, catch the legendary, defeat the Elite Four, and become Champion. It was so cool and so immersive to be part of that.",
      "The 3DS as a product kept finding new ways to play, and the battles made you feel like reality didn't exist.",
      "What I learned as a future PM:",
      "I learned how Pokémon kept finding new gameplay mechanics, and how a creative risk paired with the right concept can turn into a hugely successful product. X and Y proved it: Mega Evolution and fully 3D battles took a proven formula and made it feel new again.",
    ],
  },
  cabinet4: {
    name: "Horizon Zero Dawn",
    verb: "Play",
    title: "Horizon Zero Dawn",
    lines: [
      "I loved how Horizon brought its machines to life through AI. They're robots, but their behavior makes them move and act like real animals: grazing, keeping watch, reacting to danger as a herd. I still wonder how they pulled it off, because it looks so real.",
      "What I learned as a future PM:",
      "Execution requires sweating the details most people will never consciously notice. Players don't think about behavior systems, they just feel that the world is alive. That feeling only happens when a team gets hundreds of small things right.",
    ],
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
    "He wants the next one to be a very special project: a real challenge, or something he has always dreamed of becoming.",
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
      "UCR is where I learned to think like an economist. Studying Business Economics taught me to start with intuition: before running a single regression, ask what should happen and why. Comparative statics became my go-to habit: change one thing, hold everything else constant, and trace the effect. Game theory taught me to think about how people respond to each other, not just to prices.",
      "It's also where I learned how to research. My PJM paper started as an econometrics assignment and turned into a real research question with a faculty mentor. My taxi model took 83,000 raw trip records and turned them into a structural model of how drivers make decisions. Along the way I picked up the tools to actually do the work: R, Python, Stata, SQL, and C++.",
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
      "Georgia Tech is where intuition meets rigor. Through PhD-level Microeconomic Analysis, Econometrics, and Mathematical Economics, I'm learning quantitative research methods at a deeper level: not just how to run a model, but how to prove why it works and when it breaks.",
      "The bigger shift is applying those methods to real decisions. In Global Enterprise, I'm studying business entry decisions: when a firm should enter a market, how it should enter, and what it's betting on when it does. Money & Capital Markets adds how prices carry information and how capital moves. Together, it's teaching me to take a messy business question and turn it into something I can actually model, test, and answer.",
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
      "Result: event attendance went from 15 people to 62 of 71.",
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
      "Take a messy business question and turn it into something I can actually model, test, and answer.",
    ],
  },
  notices: {
    name: "Notice board",
    verb: "Read",
    title: "Announcements",
    lines: [
      "Town Hall announcements — pin a note, leave a note.",
      "Graduated magna cum laude.",
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
      "The God of War trailer drops, and the Laufey trailer too — as soon as possible!",
      "I hope I get to make new friends at your company.",
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
