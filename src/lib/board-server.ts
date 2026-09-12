import "server-only";
import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { BoardError } from "@/lib/testimonials";

export const SESSION_COOKIE = "roy-board-session";
export const SESSION_SECONDS = 8 * 60 * 60;
export const publicNoteSelect = {
  id: true,
  name: true,
  message: true,
  context: true,
  color: true,
  x: true,
  y: true,
  rotation: true,
} as const;

function ownerPassword() {
  const password = process.env.BOARD_ADMIN_PASSWORD;
  if (!password || password.length < 24)
    throw new BoardError("Moderation is not configured yet.", 503);
  return password;
}

export function passwordsMatch(value: string) {
  return timingSafeEqual(
    createHash("sha256").update(value).digest(),
    createHash("sha256").update(ownerPassword()).digest(),
  );
}

export function createSession() {
  const payload = `${Math.floor(Date.now() / 1000) + SESSION_SECONDS}.${randomBytes(24).toString("hex")}`;
  return `${payload}.${createHmac("sha256", ownerPassword()).update(payload).digest("hex")}`;
}

export async function requireOwner() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) throw new BoardError("Please sign in to review notes.", 401);
  const parts = token.split(".");
  if (parts.length !== 3 || !/^[a-f0-9]{64}$/.test(parts[2]))
    throw new BoardError("Please sign in again.", 401);
  const expected = createHmac("sha256", ownerPassword())
    .update(`${parts[0]}.${parts[1]}`)
    .digest();
  if (
    !timingSafeEqual(expected, Buffer.from(parts[2], "hex")) ||
    Number(parts[0]) <= Date.now() / 1000 ||
    !Number.isFinite(Number(parts[0]))
  ) {
    throw new BoardError("Your session expired. Please sign in again.", 401);
  }
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  let originHost: string | undefined;
  try {
    originHost = origin ? new URL(origin).host : undefined;
  } catch {
    /* Reject malformed origins below. */
  }
  if (!originHost || originHost !== host)
    throw new BoardError("Please submit from this website.", 403);
}

export async function readJson(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new BoardError("Expected a JSON request.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new BoardError("The request is empty.");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > 8192) {
      await reader.cancel();
      throw new BoardError("That request is too large.", 413);
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new BoardError("The request could not be read.");
  }
}

export async function rateLimit(request: Request, action: "note" | "login") {
  // Vercel overwrites x-vercel-forwarded-for; Cloudflare overwrites its own header.
  const ip = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    : request.headers.get("cf-connecting-ip");
  const identity = ip || "local";
  const key = `${action}:${createHmac("sha256", ownerPassword()).update(identity).digest("hex")}`;
  const windowSeconds = action === "note" ? 3600 : 900;
  const limit = action === "note" ? 3 : 10;
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "BoardRateLimit" ("key", "count", "expiresAt")
    VALUES (${key}, 1, NOW() + ${windowSeconds} * INTERVAL '1 second')
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "BoardRateLimit"."expiresAt" <= NOW() THEN 1 ELSE "BoardRateLimit"."count" + 1 END,
      "expiresAt" = CASE WHEN "BoardRateLimit"."expiresAt" <= NOW() THEN NOW() + ${windowSeconds} * INTERVAL '1 second' ELSE "BoardRateLimit"."expiresAt" END
    RETURNING "count"
  `;
  await prisma.boardRateLimit.deleteMany({
    where: { expiresAt: { lt: new Date(Date.now() - 86400000) } },
  });
  if (rows[0].count > limit)
    throw new BoardError(
      "A few too many attempts. Please try again later.",
      429,
    );
}

export function boardResponse(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export function boardFailure(error: unknown) {
  if (error instanceof BoardError)
    return boardResponse({ error: error.message }, error.status);
  // Never log connection strings, note bodies, or credentials.
  console.error(
    "Board request failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return boardResponse(
    {
      error: "The board is temporarily unavailable. Please try again shortly.",
    },
    503,
  );
}
