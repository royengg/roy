export type Project = {
  slug: string;
  title: string;
  year: string;
  category: string;
  summary: string;
  description: string;
  image: string;
  imageAlt: string;
  mobileImage?: string;
  detailImage?: string;
  mobileDetailImage?: string;
  detailImageAlt?: string;
  mobileDetailImageAlt?: string;
  color: string;
  textColor: string;
  stack: string[];
  highlights: string[];
  github: string;
  live?: string;
};

export const projects: Project[] = [
  {
    slug: "savekaro",
    title: "SaveKaro",
    year: "2026",
    category: "Deal aggregation platform",
    summary: "Community-ranked deals, price history, alerts, and automated discovery.",
    description:
      "A full-stack deal aggregation platform built for shoppers in India. The system collects and classifies deals, supports community voting and threaded discussion, and adds price tracking, alerts, and gamification around the discovery loop.",
    image: "/projects/savekaro.webp",
    imageAlt: "SaveKaro deal aggregation product interface",
    detailImage: "/projects/savekaro-detail-hq.png",
    mobileDetailImage: "/projects/savekaro-detail-mobile-hq.png",
    detailImageAlt: "SaveKaro mobile deals home screen with search, featured deals, and cart",
    color: "#f2c84b",
    textColor: "#211b08",
    stack: ["Bun", "Hono", "PostgreSQL", "Redis", "Prisma", "React"],
    highlights: [
      "Redis-backed caching, queues, and rate limits",
      "Secure access and refresh-token authentication",
      "Automated Reddit ingestion and deal classification",
      "Price history, notifications, and community reputation",
    ],
    github: "https://github.com/royengg/SaveKaro",
    live: "https://savekaro.online",
  },
  {
    slug: "homework-ai",
    title: "HomeworkAI",
    year: "2026",
    category: "Assignment Solver",
    summary: "Queued PDF analysis with structured, step-by-step AI explanations.",
    description:
      "A production-oriented SaaS workflow for processing academic PDFs. Uploads are stored securely, parsed asynchronously, analyzed with Gemini, and returned as structured explanations with live job status.",
    image: "/projects/homeworkai.png",
    imageAlt: "Homework document analysis workspace with AI-generated solution steps",
    color: "#aea6ff",
    textColor: "#16122e",
    stack: ["Express", "PostgreSQL", "BullMQ", "Redis", "Gemini", "Amazon S3"],
    highlights: [
      "BullMQ workers isolate expensive AI workloads",
      "S3-compatible storage for source documents",
      "Redis-backed limits protect compute-heavy routes",
      "Structured logging and health checks for operations",
    ],
    github: "https://github.com/royengg/homeworkai",
    live: "https://hw.cooldash.xyz",
  },
  {
    slug: "directors-cut",
    title: "Director’s Cut",
    year: "2026",
    category: "AI filmmaking studio",
    summary: "Continuity-aware episodic direction from story bible to final video.",
    description:
      "An AI-assisted production studio for building serialized vertical-video shows. Each show owns a canonical story bible, cast, visual direction, sound, and episode pipeline so generated scenes preserve character identity and narrative continuity from one cut to the next.",
    image: "/projects/directorscut.png",
    mobileImage: "/projects/directorscut-mobile.png",
    imageAlt: "Director’s Cut show library with three seeded productions and pipeline states",
    detailImage: "/projects/directorscut-detail.png",
    mobileDetailImage: "/projects/directorscut-detail-mobile.png",
    detailImageAlt: "Director’s Cut show overview with story bible, cast, and episodic production pipeline",
    color: "#e0aa43",
    textColor: "#1b1205",
    stack: ["TypeScript", "Bun", "Next.js", "Express", "PostgreSQL", "Prisma", "Gemini"],
    highlights: [
      "Seven-stage generation pipeline with dependency-aware next actions",
      "Canonical cast and story state keep faces, motives, and continuity stable",
      "Beat boards model causal turns, character presence, and shot direction",
      "AI media generation, object storage, and FFmpeg rendering in one studio",
    ],
    github: "https://github.com/royengg/directorscut",
  },
  {
    slug: "veda-ai",
    title: "VedaAI",
    year: "2026",
    category: "AI assessment workflow",
    summary: "Asynchronous question-paper generation and structured PDF export.",
    description:
      "An assessment creation platform for teachers. A guided form captures the exam structure, queues generation work outside the request cycle, and turns the model response into a structured paper that can be reviewed and exported.",
    image: "/projects/vedaai-workspace-hq-clean.png",
    imageAlt: "VedaAI assignment workspace with generated question-paper cards",
    mobileImage: "/projects/vedaai-workspace-mobile-hq.png",
    detailImage: "/projects/vedaai-detail-hq.png",
    mobileDetailImage: "/projects/vedaai-workspace-mobile-hq.png",
    detailImageAlt: "VedaAI generated question paper with exam details and student instructions",
    mobileDetailImageAlt: "VedaAI assignment workspace with sidebar navigation and assignment cards",
    color: "#c9ff73",
    textColor: "#17220b",
    stack: ["Next.js", "Express", "BullMQ", "Redis", "PostgreSQL", "Gemini"],
    highlights: [
      "Background generation with observable job states",
      "Typed question sections, difficulty, and marks",
      "HTTP-only cookie authentication",
      "Structured paper rendering and PDF export",
    ],
    github: "https://github.com/royengg/vedaai-assignment",
    live: "https://vedaai.cooldash.xyz/assignments",
  },
  {
    slug: "noteformula",
    title: "NoteFormula",
    year: "2026",
    category: "Adaptive exam preparation",
    summary: "Personalized study plans, practice, and AI guidance built around exam readiness.",
    description:
      "A full-stack learning platform that turns syllabus coverage, recent performance, and weak topics into an adaptive daily plan. Students can revise structured material, practise generated questions, review mock results, and ask for explanations without leaving a single exam-focused workspace.",
    image: "/projects/noteformula.png",
    mobileImage: "/projects/noteformula-mobile.png",
    imageAlt: "NoteFormula JEE dashboard with study plan, mock history, readiness, and weak areas",
    detailImage: "/projects/noteformula-detail.png",
    mobileDetailImage: "/projects/noteformula-detail-mobile.png",
    detailImageAlt: "NoteFormula adaptive study workspace populated with JEE preparation activity",
    color: "#4f8df7",
    textColor: "#071426",
    stack: ["TypeScript", "Bun", "Next.js", "PostgreSQL", "Prisma", "Gemini", "Better Auth"],
    highlights: [
      "Adaptive daily plans combine weak areas, spaced revision, and mixed practice",
      "Structured study material, mock history, readiness, and progress analytics",
      "Durable background workflows isolate document and AI processing",
      "Fixture-backed integration and browser suites avoid spending live AI quota",
    ],
    github: "https://github.com/royengg/noteformula",
  },
  {
    slug: "litmus-ai",
    title: "Litmus AI",
    year: "2025",
    category: "AI fact-checking pipeline",
    summary: "Fact-checking assistant with multi-source retrieval and credibility scoring.",
    description:
      "A fact-checking assistant that turns submitted claims and URLs into evidence-backed credibility analysis. A Next.js workspace sends long-running work to an Express and BullMQ pipeline, where retrieval, scraping, and Gemini analysis run outside the request cycle before results are persisted for review.",
    image: "/projects/litmus-ai-workspace-hq.png",
    imageAlt: "Litmus AI fact-checking workspace with a claim analysis input",
    detailImage: "/projects/litmus-ai-detail-hq.png",
    detailImageAlt: "Litmus AI completed credibility analysis with score, summary, and sources",
    color: "#63d8c9",
    textColor: "#102522",
    stack: ["Next.js", "Express", "BullMQ", "Redis", "PostgreSQL", "Gemini"],
    highlights: [
      "BullMQ workers isolate scraping, retrieval, and model analysis from API requests",
      "Exa search and Pinecone retrieval ground credibility assessments in external context",
      "Redis-backed queue controls cover monitoring, capacity limits, and job recovery",
      "Clerk authentication and Prisma persistence keep analysis history tied to each user",
    ],
    github: "https://github.com/royengg/Litmus-AI",
  },
  {
    slug: "one-auction",
    title: "1Auction",
    year: "2026",
    category: "Realtime auction",
    summary: "Server-authoritative live auctions with atomic bidding and presence.",
    description:
      "A realtime auction room where hosts list inventory and bidders compete live. Redis owns fast-moving auction state while PostgreSQL stores durable results, with the socket server acting as the single authoritative writer.",
    image: "/projects/1auction.png",
    imageAlt: "Dark realtime auction dashboard with countdown and active bids",
    color: "#ff6658",
    textColor: "#20100d",
    stack: ["Next.js", "Socket.IO", "Redis", "PostgreSQL", "Prisma", "Better Auth"],
    highlights: [
      "Atomic Lua validation for concurrent bids",
      "Server-owned countdown, pause, and item resolution",
      "Authenticated WebSocket handshake and live presence",
      "Separated realtime and durable persistence layers",
    ],
    github: "https://github.com/royengg/1auction",
    live: "https://1auction.cooldash.xyz",
  },
  {
    slug: "leadly-live",
    title: "Leadly",
    year: "2026",
    category: "AI lead intelligence",
    summary: "Autonomous Reddit monitoring that qualifies high-intent conversations.",
    description:
      "A full-stack lead intelligence product that continuously monitors Reddit for high-intent conversations. Scheduled workers collect posts, Gemini scores them against an ideal customer profile, and the product turns qualified signals into enriched leads and personalized outreach.",
    image: "/projects/leadly.png",
    imageAlt: "Leadly workspace overview with monitoring and lead intelligence metrics",
    detailImage: "/projects/leadly-detail-hq.png",
    detailImageAlt: "Leadly workspace overview dashboard with sidebar navigation and lead metrics",
    color: "#d7a5aa",
    textColor: "#2f1419",
    stack: ["Next.js", "Express", "BullMQ", "Redis", "PostgreSQL", "Gemini"],
    highlights: [
      "Scheduled Reddit and keyword monitors feed dedicated BullMQ workers",
      "Gemini scores relevance, buyer intent, sentiment, and ideal-customer fit",
      "Tier-aware quotas and Dodo Payments webhooks control subscription access",
      "Cursor-based collection, rate limiting, and Redis idempotency protect the pipeline",
    ],
    github: "https://github.com/royengg/leadly-live",
    live: "https://leadly.live",
  },
  {
    slug: "yunami-bot",
    title: "Yunami",
    year: "2025",
    category: "Multiplayer narrative engine",
    summary: "Discord-first role-playing stories with branching choices and secret roles.",
    description:
      "A multiplayer narrative engine built around Discord. The bot delivers role-specific story prompts and private information while a durable API tracks parties, branching choices, minigames, and progress across long-running sessions.",
    image: "/projects/yunami-bot.png",
    mobileImage: "/projects/yunami-bot-mobile.png",
    imageAlt: "Yunami multiplayer story dashboard for The Pale King's Wake",
    detailImage: "/projects/yunami-bot-detail.png",
    mobileDetailImage: "/projects/yunami-bot-detail-mobile.png",
    detailImageAlt: "Yunami haunted-manor story scene with branching choices and party roles",
    mobileDetailImageAlt:
      "Responsive Yunami story interface with a haunted manor, choices, and party roles",
    color: "#8274e8",
    textColor: "#101126",
    stack: ["TypeScript", "Bun", "Discord.js", "Express", "PostgreSQL", "Prisma"],
    highlights: [
      "Branching story graph with persistent sessions and player progress",
      "Role-specific choices, secret information, and private Discord prompts",
      "Party lobbies, ready checks, role assignment, and narrative minigames",
      "Stateless bot presentation backed by a durable REST API",
    ],
    github: "https://github.com/royengg/yunami-bot",
  },
  {
    slug: "payme-app",
    title: "PayMe",
    year: "2026",
    category: "Discord invoicing",
    summary: "PayPal invoices, reusable client templates, and payment alerts inside Discord.",
    description:
      "A Discord-first invoicing workflow for freelancers and small teams. PayMe turns slash commands into professional PayPal invoices, keeps reusable client and invoice templates, and posts webhook-driven payment updates back into Discord.",
    image: "/projects/paymeapp.png",
    mobileImage: "/projects/paymeapp-mobile.png",
    imageAlt: "PayMe invoicing dashboard with balances, invoices, and recent payments",
    detailImage: "/projects/paymeapp-detail.png",
    mobileDetailImage: "/projects/paymeapp-detail-mobile.png",
    detailImageAlt: "PayMe invoice builder with client, line items, totals, and payment activity",
    mobileDetailImageAlt:
      "Responsive PayMe invoice builder with line items, totals, and PayPal payment status",
    color: "#65a9ed",
    textColor: "#0a1728",
    stack: [
      "TypeScript",
      "Bun",
      "Discord.js",
      "Express",
      "PostgreSQL",
      "Prisma",
      "PayPal API",
      "Zod",
    ],
    highlights: [
      "Create, send, remind, cancel, and track PayPal invoices from Discord",
      "Reusable invoice templates and a persistent client address book",
      "Webhook-driven payment notifications and invoice status updates",
      "Multi-currency billing, PayPal.me links, and invoice statistics",
    ],
    github: "https://github.com/royengg/PayMe-app",
  },
];

export const experiences = [
  {
    index: "01",
    name: "Go Gym",
    role: "Software Engineer",
    type: "freelance",
    period: "Jun 2026—now",
    location: "United Kingdom · Remote",
    detail:
      "Working across software infrastructure and frontend development for a remote UK team.",
    stack: [
      "TypeScript",
      "React Native",
      "Expo",
      "Next.js",
      "Tailwind CSS",
      "Supabase",
      "PostgreSQL",
      "LiveKit / WebRTC",
      "ElevenLabs / AI",
    ],
  },
  {
    index: "02",
    name: "Hanabi Labs",
    role: "Software Engineer",
    type: "freelance",
    period: "Apr 2026—now",
    location: "Kolkata, India · Remote",
    detail:
      "Contributing to product software development as a freelance engineer across backend and full-stack delivery.",
    stack: [
      "TypeScript",
      "Next.js",
      "Tailwind CSS",
      "Bun",
      "Express",
      "PostgreSQL",
      "Prisma",
      "Redis",
      "ElevenLabs",
    ],
  },
  {
    index: "03",
    name: "Wabi Sabi",
    role: "Founder",
    type: "self-employed",
    period: "Jun 2020—now",
    location: "Kolkata, India · Remote",
    detail:
      "Leading freelance designers, client acquisition, project operations, and international payments while maintaining long-term client relationships and consistent delivery.",
  },
];
