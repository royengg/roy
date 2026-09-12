# Rudraksh Roy — Portfolio

A centered editorial portfolio built with Next.js, TypeScript, Tailwind CSS, Motion, and Lenis. The project list keeps four selected builds visible, previews the next project, and reveals the remaining projects on demand. Project details open in a focused modal with repository-grounded Gemini chat for projects with available repository snapshots.

## Local development

```bash
bun install
cp .env.example .env.local
bun run dev --hostname 0.0.0.0 --port 3000
```

Set `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local` before using project chat. The key is read only by the server route and `.env.local` is ignored by Git.

## Database (Neon + Prisma)

Prisma 7 uses the standard PostgreSQL adapter and a shared server-only client
at `src/lib/prisma.ts`. Put your Neon connection string in a root `.env` file:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.neon.tech/neondb?sslmode=require"
```

Keep Neon's supplied SSL options. Next.js and Prisma's `dotenv` configuration
both load `.env`. Optionally set `DIRECT_URL` to the direct (non-pooler) Neon URL
for migrations; otherwise the CLI also uses `DATABASE_URL`.

```bash
bun run db:generate
bun run db:migrate --name init_testimonials
```

Use a development Neon database/branch for `db:migrate`. Commit the generated
`prisma/migrations` files. To apply committed migrations to a deployment database,
run `bun run db:deploy` with that database's URL. Migrations are intentionally
not run automatically during builds.

Client usage in server components, server actions, or route handlers:

```ts
import { prisma } from "@/lib/prisma";

const notes = await prisma.testimonial.findMany({
  where: { status: "APPROVED" },
  orderBy: { createdAt: "desc" },
});
```

Set `DATABASE_URL` in Vercel for the appropriate environment, and keep preview
and production databases separate. Never prefix it with `NEXT_PUBLIC_`.
Installation and builds generate the client; generated files are not committed.
The initial testimonial schema defaults submissions to `PENDING`; moderation
authorization and submission validation will be implemented with the board.

Setup follows [Prisma's Next.js guide](https://www.prisma.io/docs/guides/v7/frameworks/nextjs)
and [PostgreSQL connection guidance](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql).

## Project chat

The API route at `src/app/api/projects/[slug]/chat/route.ts` streams answers from Gemini. Its system context combines portfolio metadata with curated repository snapshots from `src/data/repository-context.json`.

To refresh those snapshots after the source repositories change, place local checkouts of the repositories configured in `scripts/sync-repository-context.mjs` in one directory, then run:

```bash
REPOSITORY_SOURCE_DIR=/absolute/path/to/checkouts bun run sync:repository-context
```

The configured checkouts currently include `SaveKaro`, `directorscut`, `1auction`, `homeworkai`, `vedaai-assignment`, `Litmus-AI`, `noteformula`, `leadly-live`, `yunami-bot`, and `payme-app`. Some are private repositories and must already be available locally. To refresh only selected snapshots, pass their slugs through `REPOSITORY_SLUGS`, for example `REPOSITORY_SLUGS=directors-cut,noteformula`.

The sync script excludes dependency folders, environment files, generated output, backups, binaries, and lockfiles. It records the exact source revision for each project.

## Commands

```bash
bun run lint
bunx tsc --noEmit
bun run build
bunx @google/design.md lint DESIGN.md
```

## Structure

- `src/app` — page shell and server API routes
- `src/components` — portfolio compositions and interactive sections
- `src/components/ui` — shadcn-compatible source components, including the keyboard, magnetic button, floating dock, and 3D marquee
- `src/data` — portfolio content, GitHub contributions, and repository snapshots
- `src/lib` — server-only repository prompt assembly
- `scripts` — repeatable repository-context generation
- `public/projects` — project imagery
- `DESIGN.md` — design tokens and interface guidance

`components.json` maps `@/components` to `src/components` and `@/components/ui` to `src/components/ui`; `src/app/globals.css` is the configured Tailwind v4 stylesheet.
