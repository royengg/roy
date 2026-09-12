// Real touch hit-testing; API responses are intercepted, never written to Neon.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";

const base = process.env.BOARD_TEST_URL || "http://127.0.0.1:3112";
assert.equal(new URL(base).hostname, "127.0.0.1");
const pages = await (await fetch("http://127.0.0.1:9335/json/list")).json();
const ws = new WebSocket(
  pages.find((page) => page.type === "page").webSocketDebuggerUrl,
);
await new Promise((resolve) =>
  ws.addEventListener("open", resolve, { once: true }),
);
let id = 0;
let submissions = 0;
const pending = new Map();
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const requestId = ++id;
    const timer = setTimeout(() => {
      pending.delete(requestId);
      reject(new Error(`Timeout: ${method}`));
    }, 15000);
    pending.set(requestId, { resolve, reject, timer });
    ws.send(JSON.stringify({ id: requestId, method, params }));
  });
ws.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === "Fetch.requestPaused") {
    const post = message.params.request.method === "POST";
    if (post) submissions++;
    void send("Fetch.fulfillRequest", {
      requestId: message.params.requestId,
      responseCode: post ? 202 : 200,
      responseHeaders: [{ name: "Content-Type", value: "application/json" }],
      body: Buffer.from(
        JSON.stringify(
          post ? { submitted: true } : { notes: [], total: 0, accepting: true },
        ),
      ).toString("base64"),
    });
    return;
  }
  const request = pending.get(message.id);
  if (!request) return;
  clearTimeout(request.timer);
  pending.delete(message.id);
  if (message.error) request.reject(message.error);
  else request.resolve(message.result);
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
  for (let i = 0; i < 80; i++) {
    if (await run(`Boolean(${expression})`)) return;
    await sleep(100);
  }
  throw new Error(`Timed out: ${expression}`);
};
const tapPoint = async (point) => {
  await send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ ...point, radiusX: 2, radiusY: 2, force: 1, id: 1 }],
  });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
};
const tap = async (selector) => {
  const point = await run(
    `(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`,
  );
  const target = await run(
    `document.elementFromPoint(${point.x}, ${point.y})?.closest('button')?.getAttribute('aria-label') || document.elementFromPoint(${point.x}, ${point.y})?.className`,
  );
  console.log(`Touch target for ${selector}: ${target}`);
  await tapPoint(point);
};
mkdirSync(".codex-artifacts", { recursive: true });
const capture = async (name) => {
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(
    `.codex-artifacts/${name}.png`,
    Buffer.from(shot.data, "base64"),
  );
};
try {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Fetch.enable", {
    patterns: [{ urlPattern: `${base}/api/testimonials*` }],
  });
  await send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 1,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  for (const width of [390, 320]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await send("Page.navigate", { url: `${base}/#kind-words` });
    await until(
      `document.querySelector('.testimonial-board[aria-busy="false"]')`,
    );
    await sleep(500);
    await run(
      `document.querySelector('.testimonial-board').scrollIntoView({block:'start'})`,
    );
    await sleep(400);
    for (const theme of ["light", "dark"]) {
      await run(
        `document.documentElement.classList.toggle('dark', ${theme === "dark"})`,
      );
      const add = async () => {
        const point = await run(
          `(() => {const r = document.querySelector('.testimonial-board').getBoundingClientRect(); return { x: r.x + 35, y: r.y + 65 };})()`,
        );
        await tapPoint(point);
        await until(`document.querySelector('.sticky-composer textarea')`);
        await sleep(300);
      };
      await add();
      await capture(`board-touch-before-cancel-${theme}-${width}`);
      await tap('[aria-label="Cancel note"]');
      await until(`!document.querySelector('.sticky-composer')`);
      assert.ok(
        await run(`!document.activeElement.matches('textarea, input')`),
      );
      await add();
      await tap('[aria-label="Your note"]');
      await send("Input.insertText", {
        text: "!", // Short notes must also work through the inline editor.
      });
      await tap('[aria-label="Your name"]');
      await send("Input.insertText", { text: "Touch test" });
      await capture(`board-touch-filled-${theme}-${width}`);
      const before = submissions;
      await tap('[aria-label="Submit for approval"]');
      await until(
        `document.querySelector('.sticky-status')?.textContent === 'Waiting for approval'`,
      );
      assert.equal(submissions, before + 1);
      await capture(`board-touch-sent-${theme}-${width}`);
      await tap('[aria-label="Dismiss pending note"]');
      await until(`!document.querySelector('.sticky-composer')`);
      console.log(
        `PASS: ${width}px ${theme}: real touch cancel, field entry, submit once, dismiss.`,
      );
    }
  }
} finally {
  await send("Fetch.disable");
  await send("Emulation.setTouchEmulationEnabled", { enabled: false });
  ws.close();
}
