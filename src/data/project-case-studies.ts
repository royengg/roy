export type ProjectCaseStudy = {
  problem: string;
  constraints: string[];
  ownership: string;
  outcome: string;
};

export const projectCaseStudies: Record<string, ProjectCaseStudy> = {
  savekaro: {
    problem:
      "Deal feeds make it easy to collect links but much harder to tell which offers are current, trustworthy, and worth a shopper's attention. SaveKaro needed to combine automated discovery with price context and community judgment without making the browsing experience feel like a background-processing dashboard.",
    constraints: [
      "Source pages and Reddit posts arrive in inconsistent formats and can change after ingestion.",
      "Scraping, classification, alerts, and email delivery must not slow down ordinary browsing requests.",
      "Votes, comments, saves, and price history need one consistent deal record even when several actions happen close together.",
    ],
    ownership:
      "My work covered the product's end-to-end engineering path: the deal and community data model, the Hono API, authentication, Redis-backed queues and limits, automated Reddit ingestion, classification, alerts, and the React experience that brings those parts together.",
    outcome:
      "The result is a deployed product at savekaro.online where automated collection and community activity share one coherent deal history. Background work can continue or retry independently, while shoppers can still search, vote, discuss, save, and track offers through responsive request paths.",
  },
  "homework-ai": {
    problem:
      "Turning a multi-page academic PDF into useful, step-by-step help takes longer than a normal web request and involves several failure-prone stages. The product needed to accept a document quickly, show honest progress, and preserve both the source and its answers across refreshes.",
    constraints: [
      "PDF parsing and model generation are expensive enough to time out or exhaust a request process.",
      "Uploaded files and generated answers must stay linked to the authenticated student.",
      "Usage limits and storage boundaries have to protect the service from unusually large or repeated jobs.",
    ],
    ownership:
      "I focused on the backend workflow and the product states around it: authenticated upload routes, S3-compatible document storage, BullMQ processing, Gemini response shaping, persisted job status, operational logging, and the UI feedback needed while analysis is still running.",
    outcome:
      "HomeworkAI now behaves like a durable workflow rather than a single AI request. A student can submit a document, leave or refresh the page, and return to a structured result whose parsing and generation stages can be observed and recovered independently.",
  },
  "directors-cut": {
    problem:
      "Generative video tools can make an isolated scene, but serialized work falls apart when characters, motives, locations, or visual rules drift between episodes. Director's Cut needed to treat continuity as product state and coordinate several costly media steps without losing completed work.",
    constraints: [
      "Every scene must inherit the same canonical cast, story, and visual direction.",
      "Generation and rendering stages have dependencies, long runtimes, and different failure modes.",
      "Large media artifacts need to remain connected to the exact episode and stage that produced them.",
    ],
    ownership:
      "I designed the show's data model and production workflow, including the story bible, cast and beat structures, dependency-aware stage progression, AI media generation, artifact storage, and FFmpeg assembly that turns generated material into a final cut.",
    outcome:
      "The result is a working production studio where a show can move from a persistent creative brief to repeatable episode stages. Continuity is carried by saved state instead of being reconstructed from memory in every prompt, and a failed stage can resume without discarding the rest of the production.",
  },
  "veda-ai": {
    problem:
      "A useful question paper is more than a block of generated text: marks must add up, sections need predictable shapes, and teachers need something they can review and export. VedaAI needed to keep that structure intact while moving slow model work outside the request cycle.",
    constraints: [
      "Subjects, difficulty, question types, marks, and instructions must survive model output consistently.",
      "Generation may take long enough that the teacher needs explicit pending, processing, and completed states.",
      "Assignments and generated papers must remain scoped to authenticated accounts through secure cookies.",
    ],
    ownership:
      "My work connected the guided authoring experience to the underlying generation pipeline: request validation, assignment persistence, BullMQ job handling, Gemini output normalization, typed question sections, progress polling, paper rendering, and PDF export.",
    outcome:
      "The completed workflow turns a teacher's brief into a reviewable question paper instead of exposing raw model output. Generation can continue after the initial request finishes, and the resulting sections remain structured enough to render in the product or export as a document.",
  },
  noteformula: {
    problem:
      "Most study plans are static even though a student's weak topics and readiness change after every practice session. NoteFormula needed one learning record that could connect syllabus coverage, daily work, mock results, revision, and AI guidance without making recommendations feel arbitrary.",
    constraints: [
      "Plans must use durable performance history rather than a one-off prompt or self-reported confidence alone.",
      "Question generation and document work should not block the core study experience.",
      "Integration and browser tests need realistic data without spending live AI quota or touching production records.",
    ],
    ownership:
      "I built across the full-stack application: the learning and progress schema, Better Auth integration, study-plan and practice workflows, background AI paths, readiness views, seeded fixtures, and isolated integration and Playwright suites for the critical student journeys.",
    outcome:
      "The result is an end-to-end exam workspace where a student's next task can be traced back to saved coverage, attempts, and weak areas. Deterministic fixtures make those adaptive states repeatable in development and automated tests while live AI remains an optional, controlled path.",
  },
  "litmus-ai": {
    problem:
      "A language model can sound certain without having checked the claim it was given. Litmus AI needed to gather external evidence first, keep slow search and scraping away from the browser request, and preserve enough context for a person to review how a credibility result was reached.",
    constraints: [
      "Search results and scraped pages vary in quality, availability, and structure.",
      "Retrieval, vector lookup, and model analysis can fail or finish at different times.",
      "Analysis history and supporting sources must remain attached to the signed-in user.",
    ],
    ownership:
      "I built the queued analysis path that joins the Next.js workspace to the Express API, BullMQ workers, Exa search, page extraction, Pinecone context, Gemini reasoning, and Prisma persistence used for completed reports and user history.",
    outcome:
      "The resulting workflow produces an evidence-backed record rather than a disposable chat response. Each analysis can expose its progress, retain its sources and summary, and remain available for later review even when retrieval or model work takes longer than a typical request.",
  },
  "one-auction": {
    problem:
      "A live auction becomes unfair if two clients can disagree about the highest bid or the remaining time. 1Auction needed one authoritative path for bidding and item resolution while still delivering low-latency updates to every participant in the room.",
    constraints: [
      "Concurrent bids must be compared atomically rather than accepted from stale browser state.",
      "Countdown, pause, presence, and winner selection must stay server-owned across connected clients.",
      "Fast, temporary room state must eventually settle into a durable history of bids and winners.",
    ],
    ownership:
      "I designed the realtime boundary around Socket.IO, implemented authenticated room events and presence, used Redis and Lua for atomic bid validation, and connected the live state machine to PostgreSQL records for inventory, bids, winners, and resolved items.",
    outcome:
      "The deployed system supports a complete live-auction loop with a server-owned clock and bid decision. Redis handles the fast-moving room state, while settled results survive outside that temporary layer as a durable ledger that can be inspected after the event ends.",
  },
  "leadly-live": {
    problem:
      "Potential customers often describe a problem on Reddit long before they fill out a sales form, but manually reading that volume is noisy and difficult to repeat. Leadly needed to collect on a schedule, qualify intent against a real customer profile, and show only useful conversations without exceeding platform or subscription limits.",
    constraints: [
      "Reddit collection must respect rate limits and avoid processing the same post repeatedly.",
      "AI qualification needs customer-profile context so relevance is more than keyword matching.",
      "Schedules, quotas, billing state, and outreach data must remain consistent across background jobs.",
    ],
    ownership:
      "My work spanned monitor setup, scheduled collection, BullMQ workers, Redis idempotency, Gemini scoring, lead enrichment, cursor-based APIs, tier-aware quotas, Dodo Payments webhooks, and the workspace used to review and act on qualified signals.",
    outcome:
      "Leadly is deployed as a working lead-intelligence product that turns a broad social feed into ranked, reviewable opportunities. Collection and qualification run independently of the dashboard, so teams can return to accumulated context instead of keeping a browser session open during every scrape.",
  },
  "yunami-bot": {
    problem:
      "A multiplayer story needs shared progress, but it also needs secrets that only one role should see. Discord is a strong delivery surface, yet its messages alone cannot reliably represent a branching campaign that may continue across sessions or survive a bot restart.",
    constraints: [
      "Public scenes and private role information must be delivered to the correct audience.",
      "Choices, minigames, ready checks, and party progress need deterministic rules.",
      "The story must recover from stored state instead of depending on old Discord messages.",
    ],
    ownership:
      "I built the bot and story-engine boundary: party lobbies, role assignment, command handling, private prompts, branch resolution, narrative minigames, the REST API, and the PostgreSQL state that keeps long-running sessions coherent.",
    outcome:
      "The result is a durable multiplayer narrative system rather than a sequence of disconnected bot replies. Discord can present a different view to each role while the canonical party, choice, and scene state remains available for the next interaction or process restart.",
  },
  "payme-app": {
    problem:
      "Freelancers who already coordinate work in Discord still have to switch tools to create invoices, remember client details, and check whether a payment settled. PayMe needed to make that workflow conversational without pretending the bot itself was the authority on money movement.",
    constraints: [
      "Invoice amounts, currencies, clients, and reusable line items require strict validation.",
      "PayPal remains the payment authority, so local status must follow verified webhook events.",
      "Templates and client records should reduce repeated entry without duplicating invoice rules.",
    ],
    ownership:
      "I built the Discord command experience and the services behind it: client and template storage, invoice validation, PayPal creation and management calls, webhook-driven status updates, reminders, cancellation, multi-currency support, and payment notifications.",
    outcome:
      "The completed flow covers the invoice lifecycle from a Discord command to PayPal settlement and a durable local record. Reusable clients and templates reduce repeated setup, while webhook confirmation keeps payment status tied to the provider that actually processed the transaction.",
  },
};

const fallbackCaseStudy: ProjectCaseStudy = {
  problem:
    "The project turns a multi-step workflow into a product people can complete without needing to understand the services behind it.",
  constraints: [
    "The interface must stay responsive while slower work completes.",
    "Important state must survive refreshes, retries, and new sessions.",
  ],
  ownership:
    "My work connected the user-facing workflow to the application rules, background processing, and durable data needed to support it.",
  outcome:
    "The result is a working end-to-end path with explicit boundaries between the interface, processing, and stored state.",
};

export function getProjectCaseStudy(slug: string): ProjectCaseStudy {
  return projectCaseStudies[slug] ?? fallbackCaseStudy;
}
