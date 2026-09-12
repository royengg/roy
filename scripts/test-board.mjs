// Integration test against a running development server and its development DB.
// Every test note is identified by a generated key and removed in finally.
import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import pg from "pg";

const base = process.env.BOARD_TEST_URL || "http://127.0.0.1:3110";
assert.ok(
  new URL(base).hostname === "127.0.0.1",
  "Run against the local development server only.",
);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
const key = randomUUID();
const testIp = `board-test-${randomUUID()}`;
const common = {
  "Content-Type": "application/json",
  Origin: base,
  "CF-Connecting-IP": testIp,
};
let cookie = "";
const call = async (path, method = "GET", body, headers = {}) => {
  const response = await fetch(base + path, {
    method,
    headers: { ...common, ...(cookie ? { Cookie: cookie } : {}), ...headers },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { response, data: await response.json() };
};
const note = {
  submissionKey: key,
  name: "Integration test",
  message: "This is a temporary verification note, not a testimonial.",
  context: "Automated test",
  color: "SAGE",
  x: 0.3,
  y: 0.6,
  status: "APPROVED",
};
try {
  await client.connect();
  assert.equal(
    (await call("/api/testimonials?size=1000")).response.status,
    400,
  );
  assert.equal((await call("/api/testimonials?page=0.5")).response.status, 400);
  assert.equal((await call("/api/admin/testimonials")).response.status, 401);
  assert.equal(
    (
      await call("/api/admin/testimonials", "PATCH", {
        id: "nope",
        status: "APPROVED",
      })
    ).response.status,
    401,
  );
  assert.equal(
    (
      await call("/api/testimonials", "POST", note, {
        Origin: "https://invalid.example",
      })
    ).response.status,
    403,
  );
  assert.equal(
    (await call("/api/testimonials", "POST", note, { Origin: "invalid" }))
      .response.status,
    403,
  );
  assert.equal(
    (await call("/api/testimonials", "POST", { ...note, message: "short" }))
      .response.status,
    400,
  );
  assert.equal(
    (await call("/api/testimonials", "POST", { ...note, x: 2 })).response
      .status,
    400,
  );
  assert.equal(
    (await call("/api/testimonials", "POST", { ...note, website: "spam" }))
      .response.status,
    400,
  );
  const oversized = await fetch(base + "/api/testimonials", {
    method: "POST",
    headers: common,
    body: JSON.stringify({ message: "x".repeat(9000) }),
  });
  assert.equal(oversized.status, 413);
  assert.equal(
    (await call("/api/testimonials", "POST", note)).response.status,
    202,
  );
  assert.equal(
    (await call("/api/testimonials", "POST", note)).response.status,
    202,
  );
  const rows = await client.query(
    'SELECT id, status FROM "Testimonial" WHERE "submissionKey" = $1',
    [key],
  );
  assert.equal(rows.rows.length, 1, "Retries must not duplicate a submission");
  assert.equal(
    rows.rows[0].status,
    "PENDING",
    "Client status cannot bypass moderation",
  );
  const id = rows.rows[0].id;
  assert.ok(
    !(await call("/api/testimonials")).data.notes.some((n) => n.id === id),
  );
  assert.equal(
    (await call("/api/admin/session", "POST", { password: "wrong" })).response
      .status,
    401,
  );
  const session = await call("/api/admin/session", "POST", {
    password: process.env.BOARD_ADMIN_PASSWORD,
  });
  assert.equal(session.response.status, 200);
  const setCookie = session.response.headers.get("set-cookie");
  assert.ok(
    setCookie.includes("HttpOnly") && setCookie.includes("SameSite=strict"),
  );
  cookie = setCookie.split(";")[0];
  let pending = (await call("/api/admin/testimonials")).data.notes.find(
    (n) => n.id === id,
  );
  assert.ok(pending);
  assert.equal(
    (
      await call("/api/admin/testimonials", "PATCH", {
        id,
        updatedAt: pending.updatedAt,
        status: "APPROVED",
      })
    ).response.status,
    200,
  );
  assert.equal(
    (
      await call("/api/admin/testimonials", "PATCH", {
        id,
        updatedAt: pending.updatedAt,
        status: "REJECTED",
      })
    ).response.status,
    409,
  );
  let published = (await call("/api/testimonials")).data.notes.find(
    (n) => n.id === id,
  );
  assert.equal(published.message, note.message);
  assert.ok(!("submissionKey" in published) && !("reviewedBy" in published));
  const approved = (
    await call("/api/admin/testimonials?status=APPROVED")
  ).data.notes.find((n) => n.id === id);
  assert.equal(
    (
      await call("/api/admin/testimonials", "PATCH", {
        id,
        updatedAt: approved.updatedAt,
        status: "PENDING",
      })
    ).response.status,
    200,
  );
  assert.ok(
    !(await call("/api/testimonials")).data.notes.some((n) => n.id === id),
  );
  pending = (await call("/api/admin/testimonials")).data.notes.find(
    (n) => n.id === id,
  );
  assert.equal(
    (
      await call("/api/admin/testimonials", "PATCH", {
        id,
        updatedAt: pending.updatedAt,
        status: "REJECTED",
      })
    ).response.status,
    200,
  );
  assert.ok(
    !(await call("/api/testimonials")).data.notes.some((n) => n.id === id),
  );
  await call("/api/testimonials", "POST", note);
  assert.equal(
    (await call("/api/testimonials", "POST", note)).response.status,
    429,
  );
  assert.equal(
    (await call("/api/admin/session", "DELETE")).response.status,
    200,
  );
  cookie = "";
  assert.equal((await call("/api/admin/session")).response.status, 401);
  console.log(
    "PASS: validation, CSRF, owner authentication, pending privacy, idempotency, approval, conflict handling, unpublish, rejection, and shared rate limits.",
  );
} finally {
  await client.query('DELETE FROM "Testimonial" WHERE "submissionKey" = $1', [
    key,
  ]);
  const hash = createHmac("sha256", process.env.BOARD_ADMIN_PASSWORD)
    .update(testIp)
    .digest("hex");
  await client.query('DELETE FROM "BoardRateLimit" WHERE "key" = ANY($1)', [
    [`note:${hash}`, `login:${hash}`],
  ]);
  await client.end();
  console.log("Temporary test note and test-specific rate counters removed.");
}
