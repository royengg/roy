export type SystemDesignNode = {
  kicker: string;
  title: string;
  description: string;
  technologies: string[];
  role: "client" | "service" | "worker" | "data" | "external";
  handoff?: string;
};

export type SystemDesignNote = {
  kicker: string;
  title: string;
  description: string;
};

export type ProjectSystemDesign = {
  summary: string;
  flow: SystemDesignNode[];
  notes: SystemDesignNote[];
};

/**
 * A deliberately small, visual summary of each project's runtime boundaries.
 * These are kept separate from the marketing copy in portfolio.ts so the
 * diagram can evolve without changing the project card or chat prompt.
 */
export const projectSystemDesign: Record<string, ProjectSystemDesign> = {
  savekaro: {
    summary: "A request path for discovery, with a separate fast lane for ingestion, alerts, and community activity.",
    flow: [
      {
        kicker: "01 / client",
        title: "React web app",
        description: "Filters, voting, comments, and saved deals stay in a responsive Vite shell.",
        technologies: ["React", "TanStack Query"],
        role: "client",
        handoff: "HTTPS",
      },
      {
        kicker: "02 / API",
        title: "Hono service",
        description: "Auth, deal queries, moderation, and cache headers form the request boundary.",
        technologies: ["Bun", "Hono"],
        role: "service",
        handoff: "jobs",
      },
      {
        kicker: "03 / fast lane",
        title: "Redis + workers",
        description: "Queues absorb Reddit ingestion, classifier work, rate limits, and alert matching.",
        technologies: ["Redis", "BullMQ"],
        role: "worker",
        handoff: "writes",
      },
      {
        kicker: "04 / durable",
        title: "PostgreSQL",
        description: "Deals, price history, votes, comments, and reputation remain the source of truth.",
        technologies: ["PostgreSQL", "Prisma"],
        role: "data",
      },
    ],
    notes: [
      {
        kicker: "async path",
        title: "Ingestion is decoupled",
        description: "Reddit and alert work can retry without holding a browser request open.",
      },
      {
        kicker: "consistency",
        title: "One deal model",
        description: "Votes, comments, saves, and price history converge on the same deal record.",
      },
    ],
  },
  "homework-ai": {
    summary: "Uploads become durable jobs first, so parsing and model work can progress independently of the browser.",
    flow: [
      {
        kicker: "01 / client",
        title: "React workspace",
        description: "The document viewer presents upload state, analysis progress, and structured answers.",
        technologies: ["React", "Vite"],
        role: "client",
        handoff: "upload",
      },
      {
        kicker: "02 / boundary",
        title: "Express API",
        description: "JWT auth validates the request and records the document before expensive work starts.",
        technologies: ["Express", "Zod"],
        role: "service",
        handoff: "queue",
      },
      {
        kicker: "03 / worker",
        title: "Analysis pipeline",
        description: "BullMQ workers parse the PDF, call Gemini, and publish observable job states.",
        technologies: ["BullMQ", "Gemini"],
        role: "worker",
        handoff: "result",
      },
      {
        kicker: "04 / storage",
        title: "Files + status",
        description: "Source files live in S3-compatible storage while Prisma keeps durable progress and answers.",
        technologies: ["Amazon S3", "PostgreSQL"],
        role: "data",
      },
    ],
    notes: [
      {
        kicker: "reliability",
        title: "The request stays cheap",
        description: "A short API response hands off the heavy work to a retryable worker instead of timing out.",
      },
      {
        kicker: "feedback loop",
        title: "Status is first-class data",
        description: "Parsing, analysis, and completion are persisted so the UI can recover after a refresh.",
      },
    ],
  },
  "directors-cut": {
    summary: "A show is the durable source of truth; generation and rendering move through a dependency-aware media pipeline.",
    flow: [
      {
        kicker: "01 / studio",
        title: "Show editor",
        description: "Creators shape the story bible, cast, beats, and visual direction in one workspace.",
        technologies: ["Next.js", "TypeScript"],
        role: "client",
        handoff: "commands",
      },
      {
        kicker: "02 / domain",
        title: "Production API",
        description: "The app validates show state and turns the next available beat into a pipeline action.",
        technologies: ["Next.js", "Express"],
        role: "service",
        handoff: "jobs",
      },
      {
        kicker: "03 / pipeline",
        title: "Generation workers",
        description: "Queued stages preserve continuity while media generation and FFmpeg rendering run out of band.",
        technologies: ["Bun", "Gemini"],
        role: "worker",
        handoff: "artifacts",
      },
      {
        kicker: "04 / record",
        title: "Show + media state",
        description: "Canonical story data and generated assets stay available for the next episode and final cut.",
        technologies: ["PostgreSQL", "Prisma"],
        role: "data",
      },
    ],
    notes: [
      {
        kicker: "continuity",
        title: "The bible is the boundary",
        description: "Characters and visual rules are read from one canonical state before a scene is generated.",
      },
      {
        kicker: "throughput",
        title: "Stages can recover",
        description: "A failed render does not erase the show; the pipeline can resume from its last completed stage.",
      },
    ],
  },
  "veda-ai": {
    summary: "A guided assessment request becomes a durable generation job, then returns as a typed paper ready for review and export.",
    flow: [
      {
        kicker: "01 / authoring",
        title: "Teacher form",
        description: "Subject, class, marks, and question types are captured before generation begins.",
        technologies: ["Next.js", "TypeScript"],
        role: "client",
        handoff: "POST",
      },
      {
        kicker: "02 / API",
        title: "Assignment service",
        description: "Auth and validation persist the assignment without making the request wait on the model.",
        technologies: ["Express", "PostgreSQL"],
        role: "service",
        handoff: "queue",
      },
      {
        kicker: "03 / async",
        title: "Gemini worker",
        description: "BullMQ drives generation and records pending, processing, and completed states.",
        technologies: ["BullMQ", "Gemini"],
        role: "worker",
        handoff: "paper",
      },
      {
        kicker: "04 / output",
        title: "Typed question paper",
        description: "Structured sections render in the browser and can be exported without re-parsing raw AI text.",
        technologies: ["Redis", "PDF export"],
        role: "data",
      },
    ],
    notes: [
      {
        kicker: "job state",
        title: "Polling has a contract",
        description: "The client watches a small set of explicit states instead of guessing whether generation finished.",
      },
      {
        kicker: "shape",
        title: "The model is not the UI",
        description: "Questions are normalized into sections, marks, and difficulty before they reach the paper view.",
      },
    ],
  },
  noteformula: {
    summary: "Study activity feeds an adaptive plan while durable learning records keep the next recommendation explainable.",
    flow: [
      {
        kicker: "01 / student",
        title: "Study workspace",
        description: "Students revise material, practise questions, and review mock performance in one loop.",
        technologies: ["Next.js", "TypeScript"],
        role: "client",
        handoff: "actions",
      },
      {
        kicker: "02 / domain",
        title: "Learning routes",
        description: "Server actions combine syllabus coverage, weak topics, and recent performance into a plan request.",
        technologies: ["Next.js", "Prisma"],
        role: "service",
        handoff: "events",
      },
      {
        kicker: "03 / guidance",
        title: "Plan + AI jobs",
        description: "Background work generates material and explanations without blocking the exam dashboard.",
        technologies: ["Bun", "Gemini"],
        role: "worker",
        handoff: "read model",
      },
      {
        kicker: "04 / durable",
        title: "Progress records",
        description: "Plans, attempts, readiness, and weak areas persist so each recommendation has context.",
        technologies: ["PostgreSQL", "Prisma"],
        role: "data",
      },
    ],
    notes: [
      {
        kicker: "adaptation",
        title: "Recommendations have memory",
        description: "A new plan is derived from durable performance rather than a one-off prompt.",
      },
      {
        kicker: "testing",
        title: "Fixtures protect the loop",
        description: "Deterministic practice data makes the planning and review states repeatable in browser tests.",
      },
    ],
  },
  "litmus-ai": {
    summary: "Claims enter a queued evidence pipeline that separates retrieval, analysis, and the final credibility record.",
    flow: [
      {
        kicker: "01 / claim",
        title: "Analysis workspace",
        description: "A claim or URL starts a review and exposes progress while sources are being gathered.",
        technologies: ["Next.js", "Clerk"],
        role: "client",
        handoff: "job",
      },
      {
        kicker: "02 / boundary",
        title: "Express API",
        description: "The API authenticates the request, creates an analysis job, and keeps the browser responsive.",
        technologies: ["Express", "BullMQ"],
        role: "service",
        handoff: "retrieve",
      },
      {
        kicker: "03 / evidence",
        title: "Retrieval workers",
        description: "Search, scraping, vector context, and Gemini reasoning are composed into one review pipeline.",
        technologies: ["Exa", "Pinecone", "Gemini"],
        role: "external",
        handoff: "persist",
      },
      {
        kicker: "04 / record",
        title: "Credibility result",
        description: "Scores, summaries, and supporting context are stored for the signed-in user's history.",
        technologies: ["PostgreSQL", "Prisma"],
        role: "data",
      },
    ],
    notes: [
      {
        kicker: "grounding",
        title: "Evidence arrives before judgment",
        description: "The model receives retrieved context rather than treating the submitted claim as its only source.",
      },
      {
        kicker: "operations",
        title: "Long work is observable",
        description: "Queue state and persisted analysis history make a slow or failed review recoverable.",
      },
    ],
  },
  "one-auction": {
    summary: "The socket server owns the live auction clock and bid decision; Redis is the fast state lane and Postgres is the ledger.",
    flow: [
      {
        kicker: "01 / room",
        title: "Next.js clients",
        description: "Auctioneers and bidders see the same room while each action carries an authenticated identity.",
        technologies: ["Next.js", "Socket.IO"],
        role: "client",
        handoff: "socket",
      },
      {
        kicker: "02 / authority",
        title: "Socket server",
        description: "One server validates bids, broadcasts presence, and resolves each item against the live clock.",
        technologies: ["Express", "JWT"],
        role: "service",
        handoff: "atomic",
      },
      {
        kicker: "03 / live state",
        title: "Redis auction state",
        description: "High bids, timers, reservations, and presence update in a low-latency shared store.",
        technologies: ["Redis", "Lua"],
        role: "worker",
        handoff: "settle",
      },
      {
        kicker: "04 / ledger",
        title: "PostgreSQL results",
        description: "Rooms, bids, winners, and resolved items become the durable record after the live action.",
        technologies: ["PostgreSQL", "Prisma"],
        role: "data",
      },
    ],
    notes: [
      {
        kicker: "fairness",
        title: "The server decides",
        description: "A client can request a bid, but only the authoritative socket path can accept or reject it.",
      },
      {
        kicker: "recovery",
        title: "Live and durable are separate",
        description: "Fast auction state can expire without losing the settled room history and winner record.",
      },
    ],
  },
  "leadly-live": {
    summary: "Scheduled monitors feed an AI qualification pipeline that turns noisy Reddit conversations into durable, ranked leads.",
    flow: [
      {
        kicker: "01 / control",
        title: "Leadly dashboard",
        description: "Teams define ICPs, subreddits, keywords, schedules, and outreach preferences.",
        technologies: ["Next.js", "TypeScript"],
        role: "client",
        handoff: "schedule",
      },
      {
        kicker: "02 / orchestration",
        title: "API + scheduler",
        description: "Quota checks and scheduled windows turn a monitor into a bounded collection job.",
        technologies: ["Express", "BullMQ"],
        role: "service",
        handoff: "collect",
      },
      {
        kicker: "03 / qualification",
        title: "Reddit + Gemini",
        description: "Workers collect posts, score intent and ICP fit, then enrich only useful conversations.",
        technologies: ["Redis", "Gemini"],
        role: "external",
        handoff: "rank",
      },
      {
        kicker: "04 / workspace",
        title: "Lead records",
        description: "Signals, scores, profiles, quotas, and outreach context remain available for follow-up.",
        technologies: ["PostgreSQL", "Prisma"],
        role: "data",
      },
    ],
    notes: [
      {
        kicker: "signal",
        title: "Precision beats volume",
        description: "ICP scoring narrows a broad social stream before it reaches the sales workspace.",
      },
      {
        kicker: "limits",
        title: "Collection has guardrails",
        description: "Rate limits, idempotency, and tier quotas keep scheduled work predictable and repeatable.",
      },
    ],
  },
  "yunami-bot": {
    summary: "Discord is the presentation layer; a durable story engine keeps parties, choices, secrets, and progress consistent between scenes.",
    flow: [
      {
        kicker: "01 / players",
        title: "Discord surfaces",
        description: "Shared scene messages and private role prompts give each player a different view of the story.",
        technologies: ["Discord.js", "TypeScript"],
        role: "client",
        handoff: "events",
      },
      {
        kicker: "02 / gateway",
        title: "Bot + API",
        description: "Commands, lobby checks, and message delivery translate Discord events into domain actions.",
        technologies: ["Bun", "Express"],
        role: "service",
        handoff: "branch",
      },
      {
        kicker: "03 / story engine",
        title: "Choices + secrets",
        description: "The engine resolves role-aware branches, minigames, and the next shared scene.",
        technologies: ["Prisma", "TypeScript"],
        role: "worker",
        handoff: "save",
      },
      {
        kicker: "04 / session state",
        title: "PostgreSQL",
        description: "Parties, roles, choices, and progress survive restarts so a campaign can keep moving.",
        technologies: ["PostgreSQL", "Prisma"],
        role: "data",
      },
    ],
    notes: [
      {
        kicker: "privacy",
        title: "Secrets follow the role",
        description: "Private prompts are delivered at the edge while shared story state stays canonical.",
      },
      {
        kicker: "state",
        title: "Messages are a projection",
        description: "The updating scene is rendered from durable choices rather than treated as the database itself.",
      },
    ],
  },
  "payme-app": {
    summary: "A Discord command becomes a PayPal invoice while the database and webhook path keep payment status trustworthy.",
    flow: [
      {
        kicker: "01 / command",
        title: "Discord client",
        description: "Slash commands let a freelancer create invoices, reuse templates, and inspect payment state.",
        technologies: ["Discord.js", "TypeScript"],
        role: "client",
        handoff: "command",
      },
      {
        kicker: "02 / service",
        title: "Bot + API",
        description: "Validation, client lookup, currency rules, and invoice creation stay behind one boundary.",
        technologies: ["Bun", "Express"],
        role: "service",
        handoff: "payment",
      },
      {
        kicker: "03 / external",
        title: "PayPal + webhook",
        description: "PayPal owns payment execution; signed callbacks bring settled status back to the product.",
        technologies: ["PayPal API", "Webhooks"],
        role: "external",
        handoff: "ledger",
      },
      {
        kicker: "04 / record",
        title: "Invoice ledger",
        description: "Invoices, templates, clients, currencies, and notification settings stay queryable and durable.",
        technologies: ["PostgreSQL", "Prisma"],
        role: "data",
      },
    ],
    notes: [
      {
        kicker: "trust",
        title: "Payment is never inferred",
        description: "The invoice record changes when PayPal confirms the event, not when a command is sent.",
      },
      {
        kicker: "reuse",
        title: "Templates live beside the ledger",
        description: "Recurring services can be reused without duplicating the rules that create a valid invoice.",
      },
    ],
  },
};

const fallbackSystemDesign: ProjectSystemDesign = {
  summary: "A small request path separates the user interface, application boundary, background work, and durable state.",
  flow: [
    {
      kicker: "01 / client",
      title: "Product interface",
      description: "The user-facing surface gathers intent and presents the result.",
      technologies: ["TypeScript"],
      role: "client",
      handoff: "request",
    },
    {
      kicker: "02 / service",
      title: "Application boundary",
      description: "Validation and domain rules keep the request predictable.",
      technologies: ["API"],
      role: "service",
      handoff: "work",
    },
    {
      kicker: "03 / worker",
      title: "Background work",
      description: "Long-running tasks can run independently and retry safely.",
      technologies: ["Queue"],
      role: "worker",
      handoff: "persist",
    },
    {
      kicker: "04 / data",
      title: "Durable state",
      description: "The result remains available for the next request and the next session.",
      technologies: ["Database"],
      role: "data",
    },
  ],
  notes: [
    {
      kicker: "boundary",
      title: "Responsibilities stay explicit",
      description: "Each stage has one job, which makes the path easier to inspect and recover.",
    },
    {
      kicker: "state",
      title: "The result is durable",
      description: "The UI reads a stored outcome rather than relying on an in-flight request.",
    },
  ],
};

export function getProjectSystemDesign(slug: string): ProjectSystemDesign {
  return projectSystemDesign[slug] ?? fallbackSystemDesign;
}
