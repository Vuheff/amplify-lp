import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const port = process.argv[2] || "9222";
const outputDirectory = resolve("tests/artifacts");
const pageUrl = "http://127.0.0.1:4173/";
const viewports = [
  { name: "hero-320x568.png", width: 320, height: 568, mobile: true },
  { name: "hero-360x800.png", width: 360, height: 800, mobile: true },
  { name: "hero-390x844.png", width: 390, height: 844, mobile: true },
  { name: "hero-430x932.png", width: 430, height: 932, mobile: true },
  { name: "hero-1440x900.png", width: 1440, height: 900, mobile: false },
];

const pages = await fetch(`http://127.0.0.1:${port}/json`).then((response) => response.json());
const page = pages.find((candidate) => candidate.type === "page");
if (!page) throw new Error("No browser page available");

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
const eventWaiters = new Map();
let nextId = 0;

await new Promise((resolveOpen, rejectOpen) => {
  socket.addEventListener("open", resolveOpen, { once: true });
  socket.addEventListener("error", rejectOpen, { once: true });
});

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);

  if (message.id) {
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
    return;
  }

  const waiters = eventWaiters.get(message.method);
  if (!waiters?.length) return;
  waiters.shift()(message.params);
});

function send(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolveRequest, rejectRequest) => {
    pending.set(id, { resolve: resolveRequest, reject: rejectRequest });
  });
}

function waitForEvent(method) {
  return new Promise((resolveEvent) => {
    const waiters = eventWaiters.get(method) || [];
    waiters.push(resolveEvent);
    eventWaiters.set(method, waiters);
  });
}

await mkdir(outputDirectory, { recursive: true });
await send("Page.enable");
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

for (const viewport of viewports) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
  });

  const loaded = waitForEvent("Page.loadEventFired");
  await send("Page.navigate", { url: pageUrl });
  await loaded;
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 300));

  const viewportMetrics = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: "({ width: innerWidth, height: innerHeight, scrollWidth: document.body.scrollWidth })",
  });

  const capture = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });

  await writeFile(resolve(outputDirectory, viewport.name), Buffer.from(capture.data, "base64"));
  console.log(viewport.name, viewportMetrics.result.value);
}

for (const viewport of [
  { name: "landing-390-full.png", width: 390, height: 844, mobile: true },
  { name: "landing-1440-full.png", width: 1440, height: 900, mobile: false },
]) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
  });

  const loaded = waitForEvent("Page.loadEventFired");
  await send("Page.navigate", { url: pageUrl });
  await loaded;
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 300));

  await send("Runtime.evaluate", {
    awaitPromise: true,
    expression: `(async () => {
      const limit = document.documentElement.scrollHeight;
      const step = Math.max(320, innerHeight * 0.7);
      for (let y = 0; y < limit; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 70));
      }
      window.scrollTo(0, limit);
      await new Promise((resolve) => setTimeout(resolve, 250));
    })()`,
  });
  await send("Runtime.evaluate", {
    awaitPromise: true,
    expression: "Promise.all([...document.images].map((image) => image.complete || image.loading === 'lazy' ? true : new Promise((resolve) => image.addEventListener('load', resolve, { once: true })))).then(() => window.scrollTo(0, 0))",
  });

  const { contentSize } = await send("Page.getLayoutMetrics");
  const capture = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: viewport.width, height: Math.ceil(contentSize.height), scale: 1 },
  });

  await writeFile(resolve(outputDirectory, viewport.name), Buffer.from(capture.data, "base64"));
  console.log(viewport.name, { width: viewport.width, height: Math.ceil(contentSize.height), state: "full-page" });
}

await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  screenWidth: 390,
  screenHeight: 844,
  deviceScaleFactor: 1,
  mobile: true,
});

const railLoaded = waitForEvent("Page.loadEventFired");
await send("Page.navigate", { url: pageUrl });
await railLoaded;
await send("Runtime.evaluate", {
  expression: "document.querySelector('[data-js=\"site-nav-toggle\"]').click()",
});
await new Promise((resolveDelay) => setTimeout(resolveDelay, 300));

const navigationCapture = await send("Page.captureScreenshot", {
  format: "png",
  fromSurface: true,
  captureBeyondViewport: false,
});

await writeFile(resolve(outputDirectory, "navigation-open-390.png"), Buffer.from(navigationCapture.data, "base64"));
console.log("navigation-open-390.png", { width: 390, height: 844, state: "menu-open" });
await send("Runtime.evaluate", {
  expression: "document.querySelector('[data-js=\"site-nav-toggle\"]').click()",
});
await send("Runtime.evaluate", {
  awaitPromise: true,
  expression: `(async () => {
    const rail = document.querySelector('.c-photo-rail');
    rail.scrollIntoView({ block: 'center' });
    await new Promise((resolve) => setTimeout(resolve, 500));
  })()`,
});

const railBox = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    const box = document.querySelector('.c-photo-rail').getBoundingClientRect();
    return { x: box.left, y: box.top + scrollY, width: box.width, height: box.height };
  })()`,
});

const railCapture = await send("Page.captureScreenshot", {
  format: "png",
  fromSurface: true,
  captureBeyondViewport: true,
  clip: { ...railBox.result.value, scale: 1 },
});

await writeFile(resolve(outputDirectory, "photo-rail-390.png"), Buffer.from(railCapture.data, "base64"));
console.log("photo-rail-390.png", railBox.result.value);

await send("Runtime.evaluate", {
  awaitPromise: true,
  expression: `(async () => {
    const rail = document.querySelector('.c-brand-rail');
    rail.scrollIntoView({ block: 'center' });
    await new Promise((resolve) => setTimeout(resolve, 500));
  })()`,
});

const brandRailBox = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    const box = document.querySelector('.c-brand-rail').getBoundingClientRect();
    return { x: box.left, y: box.top + scrollY, width: box.width, height: box.height };
  })()`,
});

const brandRailCapture = await send("Page.captureScreenshot", {
  format: "png",
  fromSurface: true,
  captureBeyondViewport: true,
  clip: { ...brandRailBox.result.value, scale: 1 },
});

await writeFile(resolve(outputDirectory, "brand-rail-390.png"), Buffer.from(brandRailCapture.data, "base64"));
console.log("brand-rail-390.png", brandRailBox.result.value);

await send("Runtime.evaluate", {
  awaitPromise: true,
  expression: `(async () => {
    window.scrollTo(0, 0);
    document.querySelector('.c-hero [data-js="open-lead-modal"]').click();
    await new Promise((resolve) => setTimeout(resolve, 450));
  })()`,
});

const modalFormCapture = await send("Page.captureScreenshot", {
  format: "png",
  fromSurface: true,
  captureBeyondViewport: false,
});

await writeFile(resolve(outputDirectory, "modal-form-390.png"), Buffer.from(modalFormCapture.data, "base64"));
console.log("modal-form-390.png", { width: 390, height: 844, state: "form" });

await send("Runtime.evaluate", {
  expression: `(() => {
    const root = document.querySelector('[data-js="lead-modal"]');
    root.querySelector('[data-js="lead-form-view"]').hidden = true;
    root.querySelector('[data-js="lead-offer-view"]').hidden = false;
    root.dataset.state = 'offer';
    root.querySelector('.c-lead-modal__panel').scrollTop = 0;
  })()`,
});
await new Promise((resolveDelay) => setTimeout(resolveDelay, 80));

const modalOfferCapture = await send("Page.captureScreenshot", {
  format: "png",
  fromSurface: true,
  captureBeyondViewport: false,
});

await writeFile(resolve(outputDirectory, "modal-offer-390.png"), Buffer.from(modalOfferCapture.data, "base64"));
console.log("modal-offer-390.png", { width: 390, height: 844, state: "offer" });

await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  screenWidth: 1440,
  screenHeight: 900,
  deviceScaleFactor: 1,
  mobile: false,
});

const hoverLoaded = waitForEvent("Page.loadEventFired");
await send("Page.navigate", { url: pageUrl });
await hoverLoaded;

const hoverPoint = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    const box = document.querySelector('.c-decision-preview__stage').getBoundingClientRect();
    return { x: box.left + box.width * 0.5, y: box.top + box.height * 0.5 };
  })()`,
});

await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...hoverPoint.result.value });
await new Promise((resolveDelay) => setTimeout(resolveDelay, 300));

const hoverCapture = await send("Page.captureScreenshot", {
  format: "png",
  fromSurface: true,
  captureBeyondViewport: false,
});

await writeFile(resolve(outputDirectory, "hero-1440-hover.png"), Buffer.from(hoverCapture.data, "base64"));
console.log("hero-1440-hover.png", { width: 1440, height: 900, state: "hover" });

await send("Emulation.setDeviceMetricsOverride", {
  width: 430,
  height: 932,
  screenWidth: 430,
  screenHeight: 932,
  deviceScaleFactor: 1,
  mobile: true,
});

const dragLoaded = waitForEvent("Page.loadEventFired");
await send("Page.navigate", { url: pageUrl });
await dragLoaded;

await send("Runtime.evaluate", {
  expression: "document.querySelector('[data-deck-position=\"active\"]').scrollIntoView({ block: 'center' })",
});
await new Promise((resolveDelay) => setTimeout(resolveDelay, 120));

const dragPoint = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    const box = document.querySelector('[data-deck-position="active"]').getBoundingClientRect();
    return { x: box.left + box.width * 0.72, y: box.top + box.height * 0.5 };
  })()`,
});

const { x, y } = dragPoint.result.value;
await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: 1 });
await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: x - 64, y, button: "left", buttons: 1 });

const dragCapture = await send("Page.captureScreenshot", {
  format: "png",
  fromSurface: true,
  captureBeyondViewport: false,
});

await writeFile(resolve(outputDirectory, "hero-430-drag.png"), Buffer.from(dragCapture.data, "base64"));
await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: x - 64, y, button: "left", buttons: 0, clickCount: 1 });
console.log("hero-430-drag.png", { width: 430, height: 932, state: "dragging" });

socket.close();
