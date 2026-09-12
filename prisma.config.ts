import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Generation doesn't need a live database. CLI database commands require
    // one of these values; use the direct Neon URL for migrations when provided.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
