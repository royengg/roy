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
let lastSubmission;
let mouseMode = false;
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
    if (post) {
      submissions++;
      lastSubmission = JSON.parse(message.params.request.postData);
    }
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
  if (mouseMode) {
    await send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      ...point,
      button: "left",
      buttons: 1,
      clickCount: 1,
    });
    await send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      ...point,
      button: "left",
      buttons: 0,
      clickCount: 1,
    });
    return;
  }
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
const swipeBoard = async (dy) => {
  const start = await run(
    `(() => { const r = document.querySelector('.testimonial-board').getBoundingClientRect(); return { x: r.x + r.width / 2, y: Math.max(200, r.y + 250) }; })()`,
  );
  const before = await run("scrollY");
  await send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ ...start, id: 1 }],
  });
  for (let step = 1; step <= 10; step++) {
    await send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: start.x, y: start.y + (dy * step) / 10, id: 1 }],
    });
    await sleep(30);
  }
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await sleep(350);
  const after = await run("scrollY");
  assert.ok(
    dy < 0 ? after > before + 50 : after < before - 50,
    `Swipe ${dy}: page scroll ${before} → ${after}`,
  );
  assert.ok(
    await run("!document.querySelector('.sticky-composer')"),
    "Swiping must not create a draft.",
  );
};
const dragDraft = async (dx, dy, mouse = false) => {
  const start = await run(
    `(() => { const r = document.querySelector('.sticky-composer').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + 20 }; })()`,
  );
  if (mouse)
    await send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      ...start,
      button: "left",
      buttons: 1,
      clickCount: 1,
    });
  else
    await send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ ...start, id: 1 }],
    });
  for (let step = 1; step <= 8; step++) {
    const point = {
      x: start.x + (dx * step) / 8,
      y: start.y + (dy * step) / 8,
    };
    if (mouse)
      await send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        ...point,
        button: "left",
        buttons: 1,
      });
    else
      await send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ ...point, id: 1 }],
      });
    await sleep(25);
  }
  assert.equal(
    await run(
      `getComputedStyle(document.querySelector('.sticky-composer')).cursor`,
    ),
    "grabbing",
  );
  if (mouse)
    await send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: start.x + dx,
      y: start.y + dy,
      button: "left",
      buttons: 0,
      clickCount: 1,
    });
  else
    await send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
  await sleep(100);
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
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: 0,
    y: 0,
    button: "left",
    buttons: 0,
  });
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
  for (const width of [390, 320, 1440]) {
    mouseMode = width === 1440;
    await send("Emulation.setTouchEmulationEnabled", { enabled: !mouseMode });
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width < 768,
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
    if (!mouseMode) {
      await swipeBoard(-160);
      await swipeBoard(160);
      await run(
        `document.querySelector('.testimonial-board').scrollIntoView({block:'start'})`,
      );
      await sleep(400);
      console.log(
        `PASS: ${width}px: empty-board swipes scroll the page in both directions without creating notes.`,
      );
    }
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
      const oldY = await run(
        `document.querySelector('.sticky-composer').getBoundingClientRect().y`,
      );
      assert.equal(
        await run(
          `getComputedStyle(document.querySelector('.sticky-composer')).cursor`,
        ),
        "grab",
      );
      await dragDraft(12, 65, width === 1440);
      assert.ok(
        await run(
          `document.querySelector('.sticky-composer').getBoundingClientRect().y > ${oldY + 40}`,
        ),
      );
      assert.equal(
        await run(`document.querySelector('.sticky-composer textarea').value`),
        "!",
      );
      assert.equal(
        await run(`document.querySelector('.sticky-name').value`),
        "Touch test",
      );
      await dragDraft(900, 700, width === 1440);
      assert.ok(
        await run(
          `(() => {const note = document.querySelector('.sticky-composer').getBoundingClientRect(); const board = document.querySelector('.testimonial-board').getBoundingClientRect(); return note.left >= board.left && note.top >= board.top && note.right <= board.right && note.bottom <= board.bottom;})()`,
        ),
      );
      const placement = await run(
        `(() => { const node = document.querySelector('.react-flow__node-draft'); const board = document.querySelector('.testimonial-board'); const transform = new DOMMatrix(getComputedStyle(node).transform); return { x: (transform.e - 16) / (board.clientWidth - node.offsetWidth - 32), y: (transform.f - 16) / (board.clientHeight - node.offsetHeight - 32) }; })()`,
      );
      await capture(`board-touch-filled-${theme}-${width}`);
      const before = submissions;
      await tap('[aria-label="Submit for approval"]');
      await until(
        `document.querySelector('.sticky-status')?.textContent === 'Waiting for approval'`,
      );
      assert.equal(submissions, before + 1);
      assert.ok(Math.abs(lastSubmission.x - placement.x) < 0.01);
      assert.ok(Math.abs(lastSubmission.y - placement.y) < 0.01);
      assert.equal(
        await run(
          `document.querySelector('.sticky-composer').dataset.draggable`,
        ),
        "false",
      );
      await capture(`board-touch-sent-${theme}-${width}`);
      await tap('[aria-label="Dismiss pending note"]');
      await until(`!document.querySelector('.sticky-composer')`);
      console.log(
        `PASS: ${width}px ${theme}: touch cancel, editing, drag/cursors, saved position, submit once, dismiss.`,
      );
    }
  }
} catch (error) {
  await capture("board-interaction-failure");
  throw error;
} finally {
  await send("Fetch.disable");
  await send("Emulation.setTouchEmulationEnabled", { enabled: false });
  ws.close();
}
