# Rudraksh Roy — Portfolio

A centered editorial portfolio built with Next.js, TypeScript, Tailwind CSS, Motion, and Lenis. Project details open in a focused modal with a repository-grounded Gemini chat for each featured public repository.

## Local development

```bash
bun install
cp .env.example .env.local
bun run dev --hostname 0.0.0.0 --port 3000
```

Set `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local` before using project chat. The key is read only by the server route and `.env.local` is ignored by Git.

## Project chat

The API route at `src/app/api/projects/[slug]/chat/route.ts` streams answers from Gemini. Its system context combines portfolio metadata with curated repository snapshots from `src/data/repository-context.json`.

To refresh those snapshots after the public repositories change, place local checkouts of `SaveKaro`, `1auction`, `homeworkai`, and `vedaai-assignment` in one directory, then run:

```bash
REPOSITORY_SOURCE_DIR=/absolute/path/to/checkouts bun run sync:repository-context
```

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
- `src/components` — portfolio, project chat, and Cal.com UI
- `src/data` — portfolio content, GitHub contributions, and repository snapshots
- `src/lib` — server-only repository prompt assembly
- `scripts` — repeatable repository-context generation
- `public/projects` — project imagery
- `DESIGN.md` — design tokens and interface guidance
- `design-qa.md` — visual, interaction, accessibility, and automated verification notes
