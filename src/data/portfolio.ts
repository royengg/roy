export type Project = {
  slug: string;
  title: string;
  year: string;
  category: string;
  summary: string;
  description: string;
  image: string;
  imageAlt: string;
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
    category: "Deal intelligence platform",
    summary: "Community-ranked deals, price history, alerts, and automated discovery.",
    description:
      "A full-stack deal aggregation platform built for shoppers in India. The system collects and classifies deals, supports community voting and threaded discussion, and adds price tracking, alerts, and gamification around the discovery loop.",
    image: "/projects/savekaro.webp",
    imageAlt: "SaveKaro deal aggregation product interface",
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
    slug: "one-auction",
    title: "1Auction",
    year: "2026",
    category: "Realtime systems",
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
    slug: "homework-ai",
    title: "HomeworkAI",
    year: "2026",
    category: "Document intelligence",
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
    slug: "veda-ai",
    title: "VedaAI",
    year: "2026",
    category: "AI assessment workflow",
    summary: "Asynchronous question-paper generation and structured PDF export.",
    description:
      "An assessment creation platform for teachers. A guided form captures the exam structure, queues generation work outside the request cycle, and turns the model response into a structured paper that can be reviewed and exported.",
    image: "/projects/vedaai.png",
    imageAlt: "Assessment creator with question controls and exam paper preview",
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
