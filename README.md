# Rudraksh Roy — Portfolio

Personal portfolio built with Next.js, TypeScript, Tailwind CSS, and Motion.
Live at [roydev.in](https://roydev.in).

## Setup

Use Node.js 24 and Bun 1.4. Create a root `.env` file with:

```dotenv
DATABASE_URL="your Neon PostgreSQL connection string"
BOARD_ADMIN_PASSWORD="a random password of at least 24 characters"
```

Optional integrations:

- Project chat: `GOOGLE_GENERATIVE_AI_API_KEY`.
- Spotify: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`, and `SPOTIFY_REFRESH_TOKEN`.
- Migrations: `DIRECT_URL` for a direct database connection; otherwise `DATABASE_URL` is used.

Keep environment files private. Use separate development and production databases.

```bash
bun install
bun run db:deploy
bun run dev
```

Open [localhost:3000](http://localhost:3000). Installation generates the Prisma client; `db:deploy` applies committed migrations to the configured database. Builds do not apply migrations.

## Maintenance

Edit portfolio content in `src/data/portfolio.ts` and assets in `public/`.
See [DESIGN.md](DESIGN.md) for design guidance.

Approve testimonial submissions at `/admin/testimonials` using `BOARD_ADMIN_PASSWORD`.
Set `BOARD_SUBMISSIONS_PAUSED=true` to pause new notes.

```bash
bun run lint
bun run build
```

Hosted on Vercel. Automatic deployments from `main` are disabled; publish manually with `vercel --prod` after linking the project and configuring its environment variables.
