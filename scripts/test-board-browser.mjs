import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import pg from "pg";

const base = process.env.BOARD_TEST_URL || "http://127.0.0.1:3110";
assert.equal(
  new URL(base).hostname,
  "127.0.0.1",
  "Browser tests require a local development server.",
);
const pages = await (await fetch("http://127.0.0.1:9335/json/list")).json();
const ws = new WebSocket(
  pages.find((page) => page.type === "page").webSocketDebuggerUrl,
);
await new Promise((resolve) =>
  ws.addEventListener("open", resolve, { once: true }),
);
let id = 0;
const pending = new Map();
const exceptions = [];
ws.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === "Runtime.exceptionThrown")
    exceptions.push(message.params.exceptionDetails.text);
  if (!pending.has(message.id)) return;
  const request = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) request.reject(message.error);
  else request.resolve(message.result);
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`CDP timeout: ${method}`)),
      30000,
    );
    pending.set(++id, {
      resolve: (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      reject: (error) => {
        clearTimeout(timer);
        reject(error);
      },
    });
    ws.send(JSON.stringify({ id, method, params }));
  });
const run = async (expression) => {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const until = async (expression) => {
  for (let i = 0; i < 120; i++) {
    if (await run(`Boolean(${expression})`)) return;
    await sleep(250);
  }
  throw new Error(`Timed out: ${expression}`);
};
const click = (selector) =>
  run(
    `(() => { const element = document.querySelector(${JSON.stringify(selector)}); element.focus(); element.click(); })()`,
  );
const fill = async (selector, text) => {
  await run(`document.querySelector(${JSON.stringify(selector)}).focus()`);
  await send("Input.insertText", { text });
};
const view = (width, height = 1100) =>
  send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
const directory = ".codex-artifacts";
mkdirSync(directory, { recursive: true });
const capture = async (name) => {
  const result = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${directory}/${name}.png`, Buffer.from(result.data, "base64"));
};
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
const keys = [];
const testName = `Browser test ${randomUUID().slice(0, 8)}`;
const testIp = `browser-test-${randomUUID()}`;
try {
  await client.connect();
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Network.setExtraHTTPHeaders", {
    headers: { "CF-Connecting-IP": testIp },
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await view(1440);
  await send("Page.navigate", { url: base + "/#kind-words" });
  await until(
    `document.querySelector('.testimonial-board[aria-busy="false"] .react-flow__pane')`,
  );
  await run(`document.querySelector('#kind-words').scrollIntoView()`);
  await sleep(400);
  // A real click on the empty board must open the composer.
  const point = await run(
    `(() => {const r=document.querySelector('.testimonial-board .react-flow__pane').getBoundingClientRect();return {x:r.x+60,y:r.y+70};})()`,
  );
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    ...point,
    button: "left",
    clickCount: 1,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    ...point,
    button: "left",
    clickCount: 1,
  });
  await until(`document.querySelector('.sticky-composer textarea')`);
  await until(`document.activeElement?.matches('.sticky-composer textarea')`);
  assert.ok(
    await run(
      `document.querySelector('.sticky-composer').contains(document.activeElement)`,
    ),
  );
  assert.ok(
    await run(
      `!document.querySelector('dialog[open]') && !document.querySelector('.board-intro')`,
    ),
  );
  await fill(
    ".sticky-composer textarea",
    "This is a temporary browser verification note. It is removed after testing.",
  );
  await fill(".sticky-name", testName);
  await capture("board-inline-editor");
  await click('[aria-label="Submit for approval"]');
  await until(
    `document.querySelector('.sticky-status')?.textContent === 'Waiting for approval'`,
  );
  await capture("board-submitted");
  const created = await client.query(
    'SELECT id, "submissionKey", status FROM "Testimonial" WHERE name = $1',
    [testName],
  );
  assert.equal(created.rows.length, 1);
  keys.push(created.rows[0].submissionKey);
  assert.equal(created.rows[0].status, "PENDING");
  const publicData = await (await fetch(base + "/api/testimonials")).json();
  assert.ok(!publicData.notes.some((note) => note.name === testName));
  await click('[aria-label="Dismiss pending note"]');
  await send("Page.navigate", { url: base + "/admin/testimonials" });
  await until(`document.querySelector('.admin-login input')`);
  await fill(".admin-login input", process.env.BOARD_ADMIN_PASSWORD);
  await run(`document.querySelector('.admin-login').requestSubmit()`);
  await until(`document.querySelector('.admin-note')`);
  await capture("board-owner-review");
  await run(
    `Array.from(document.querySelectorAll('.admin-note')).find(n=>n.innerText.includes(${JSON.stringify(testName)})).querySelector('.board-button-primary').click()`,
  );
  await until(
    `document.querySelector('.admin-notice')?.innerText.includes('Approved')`,
  );
  const approved = await (await fetch(base + "/api/testimonials")).json();
  assert.ok(approved.notes.some((note) => note.name === testName));
  console.log(
    "PASS: real board click → inline editing → submit → owner login → approve → public read; no intro row or composer modal.",
  );

  // Clearly labeled temporary layout fixtures, never presented as endorsements.
  await client.query('DELETE FROM "Testimonial" WHERE "submissionKey" = $1', [
    keys[0],
  ]);
  for (let i = 0; i < 7; i++) {
    const key = randomUUID();
    keys.push(key);
    const message =
      i === 0
        ? "W".repeat(280)
        : i === 1
          ? "A longer example for checking readable text, spacing, and the full-note view. "
              .repeat(3)
              .slice(0, 280)
          : "An example note for layout verification. These paper cards use the portfolio’s existing fonts and are removed after this check.";
    await client.query(
      'INSERT INTO "Testimonial" (id, "submissionKey", name, message, context, color, x, y, rotation, status, "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,\'APPROVED\',NOW())',
      [
        randomUUID(),
        key,
        `Example ${i + 1} — layout test`,
        message,
        "Temporary test fixture",
        ["PAPER", "YELLOW", "SAGE", "ROSE"][i % 4],
        (i % 3) / 3,
        Math.floor(i / 3) / 3,
        [-2, 2, -1, 1, -3, 3, 0][i],
      ],
    );
  }
  await send("Page.navigate", { url: base + "/#kind-words" });
  await until(`document.querySelectorAll('.board-note-button').length === 6`);
  await run(`document.fonts.ready.then(()=>true)`);
  for (const width of [1440, 768, 390, 320]) {
    await view(width);
    await until(
      `document.querySelectorAll('.board-note-button').length === ${width < 500 ? 2 : width < 900 ? 4 : 6}`,
    );
    for (const theme of ["dark", "light"]) {
      await run(
        `document.documentElement.classList.toggle('dark', ${theme === "dark"});document.querySelector('#kind-words').scrollIntoView();`,
      );
      await sleep(600);
      assert.ok(
        await run(`document.documentElement.scrollWidth <= innerWidth`),
        `Overflow at ${width}px`,
      );
      await capture(`board-populated-${theme}-${width}`);
    }
  }
  await view(1440);
  await until(`document.querySelectorAll('.board-note-button').length === 6`);
  await run(`document.querySelector('#kind-words').scrollIntoView()`);
  await sleep(300);
  await click(".board-note-button");
  await until(`document.querySelector('.note-reader[open]')`);
  await capture("board-read-note");
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  await until(`!document.querySelector('.note-reader')`);
  assert.ok(
    await run(`document.activeElement.classList.contains('board-note-button')`),
  );
  await click('[aria-label="Next notes"]');
  await until(`document.querySelectorAll('.board-note-button').length === 1`);
  console.log(
    "PASS: both themes at 1440/768/390/320px, full reading view, keyboard dismissal/focus restoration, pagination.",
  );
  console.log("Runtime exception count:", exceptions.length);
} finally {
  await client.query(
    'DELETE FROM "Testimonial" WHERE "submissionKey" = ANY($1::uuid[]) OR name = $2',
    [keys, testName],
  );
  const hash = createHmac("sha256", process.env.BOARD_ADMIN_PASSWORD)
    .update(testIp)
    .digest("hex");
  await client.query('DELETE FROM "BoardRateLimit" WHERE "key" = ANY($1)', [
    [`note:${hash}`, `login:${hash}`],
  ]);
  await client.end();
  await send("Network.setExtraHTTPHeaders", { headers: {} });
  await send("Network.clearBrowserCookies");
  ws.close();
  console.log(
    "Removed all temporary browser-test notes and signed out the test browser.",
  );
}
