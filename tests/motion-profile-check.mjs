const port = process.argv[2] || "9222";
const pageUrl = "http://127.0.0.1:4173/";
const pages = await fetch(`http://127.0.0.1:${port}/json`).then((response) => response.json());
const page = pages.find((candidate) => candidate.type === "page");
if (!page) throw new Error("No browser page available");

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
const eventWaiters = new Map();
let nextId = 0;
let navigationId = 0;

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
  if (waiters?.length) waiters.shift()(message.params);
});

function send(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolveRequest, rejectRequest) => pending.set(id, { resolve: resolveRequest, reject: rejectRequest }));
}

function waitForEvent(method) {
  return new Promise((resolveEvent) => {
    const waiters = eventWaiters.get(method) || [];
    waiters.push(resolveEvent);
    eventWaiters.set(method, waiters);
  });
}

async function evaluate(expression) {
  const response = await send("Runtime.evaluate", { expression, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function approximately(actual, expected, tolerance = 1) {
  return Math.abs(actual - expected) <= tolerance;
}

function stateExpression(selector, child = false) {
  return `(() => {
    const target = document.querySelector(${JSON.stringify(selector)});
    const subject = ${child ? "target.firstElementChild" : "target"};
    const style = getComputedStyle(subject);
    const matrix = new DOMMatrix(style.transform === 'none' ? undefined : style.transform);
    return {
      engine: document.documentElement.dataset.motionEngine,
      registered: target.hasAttribute('data-sr-id'),
      state: target.dataset.motionState || null,
      opacity: Number.parseFloat(style.opacity),
      transform: style.transform,
      x: matrix.m41,
      y: matrix.m42,
      scale: matrix.a,
      duration: style.transitionDuration,
      delay: style.transitionDelay,
    };
  })()`;
}

async function navigate(reduced) {
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }],
  });
  const loaded = waitForEvent("Page.loadEventFired");
  navigationId += 1;
  await send("Page.navigate", { url: `${pageUrl}?motion-profile=${navigationId}` });
  await loaded;
  await evaluate("window.scrollTo(0, 0)");
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 900));
}

async function sampleProfile(profile, reduced) {
  await navigate(reduced);
  const initial = await evaluate(stateExpression(profile.selector, profile.child));
  assert(initial.registered, `${profile.name} must be registered before entering the viewport`);
  assert(initial.engine === (reduced ? "scrollreveal-reduced" : "scrollreveal"), `${profile.name} must use the expected engine`);
  assert(approximately(initial.opacity, reduced ? profile.reduced.opacity : profile.normal.opacity, 0.02), `${profile.name} must expose its initial opacity: ${JSON.stringify(initial)}`);
  assert(approximately(initial.x, reduced ? profile.reduced.x : profile.normal.x), `${profile.name} must expose its initial horizontal distance: ${JSON.stringify(initial)}`);
  assert(approximately(initial.y, reduced ? profile.reduced.y : profile.normal.y), `${profile.name} must expose its initial vertical distance: ${JSON.stringify(initial)}`);
  assert(approximately(initial.scale, reduced ? profile.reduced.scale : profile.normal.scale, 0.015), `${profile.name} must expose its initial scale: ${JSON.stringify(initial)}`);
  if (profile.child) assert(initial.duration.includes(reduced ? "0.65s" : profile.normal.duration), `${profile.name} must expose its approved child duration: ${JSON.stringify(initial)}`);

  await evaluate(`(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelector(${JSON.stringify(profile.selector)}).scrollIntoView({ block: 'center' });
  })()`);
  await new Promise((resolveDelay) => setTimeout(resolveDelay, reduced ? profile.reduced.wait : profile.normal.wait));
  const intermediate = await evaluate(stateExpression(profile.selector, profile.child));
  assert(intermediate.opacity > initial.opacity && intermediate.opacity < 1, `${profile.name} must pass through an intermediate opacity: ${JSON.stringify({ initial, intermediate })}`);
  assert(intermediate.transform !== initial.transform, `${profile.name} must pass through an intermediate transform: ${JSON.stringify({ initial, intermediate })}`);
  assert(intermediate.duration.includes(reduced ? "0.65s" : profile.normal.duration), `${profile.name} must expose its approved reveal duration: ${JSON.stringify(intermediate)}`);

  await new Promise((resolveDelay) => setTimeout(resolveDelay, 1100));
  const final = await evaluate(stateExpression(profile.selector, profile.child));
  assert(final.state === "visible" && !final.registered, `${profile.name} must reveal once and clean its registration: ${JSON.stringify(final)}`);
  assert(approximately(final.opacity, 1, 0.01) && approximately(final.x, 0) && approximately(final.y, 0) && approximately(final.scale, 1, 0.01), `${profile.name} must finish in the static layout: ${JSON.stringify(final)}`);
  return { initial, intermediate, final };
}

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  screenWidth: 390,
  screenHeight: 844,
  deviceScaleFactor: 1,
  mobile: true,
});

const contract = await navigate(false).then(() => evaluate(`(() => ({
  profiles: [...new Set([...document.querySelectorAll('[data-motion]')].map((target) => target.dataset.motion))].sort(),
  forbiddenTargets: document.querySelectorAll('.c-hero [data-motion], [data-js="photo-rail-track"] [data-motion], [data-js="brand-rail-track"] [data-motion], [data-js="promo-rail-track"] [data-motion], dialog [data-motion]').length,
  overflow: document.body.scrollWidth - innerWidth,
}))()`));
assert(contract.profiles.join("|") === "cascade|rise|slide-left|slide-right|zoom", `Editorial motion hooks must match the approved vocabulary: ${JSON.stringify(contract)}`);
assert(contract.forbiddenTargets === 0 && contract.overflow <= 0.5, `Editorial motion must not enter isolated engines or create overflow: ${JSON.stringify(contract)}`);

const profiles = [
  {
    name: "cascade",
    selector: "#comparacao .c-section-intro[data-motion=\"cascade\"]",
    child: true,
    normal: { opacity: 0.2, x: 0, y: 32, scale: 1, duration: "0.72s", wait: 260 },
    reduced: { opacity: 0.35, x: 0, y: 16, scale: 1, wait: 220 },
  },
  {
    name: "slide-left",
    selector: "#metodo [data-motion=\"slide-left\"]",
    child: false,
    normal: { opacity: 0.2, x: -56, y: 0, scale: 1, duration: "0.76s", wait: 300 },
    reduced: { opacity: 0.35, x: -20, y: 0, scale: 1, wait: 240 },
  },
  {
    name: "slide-right",
    selector: "#metodo [data-motion=\"slide-right\"]",
    child: false,
    normal: { opacity: 0.2, x: 56, y: 0, scale: 1, duration: "0.76s", wait: 360 },
    reduced: { opacity: 0.35, x: 20, y: 0, scale: 1, wait: 280 },
  },
  {
    name: "zoom",
    selector: "#proximo-passo [data-motion=\"zoom\"]",
    child: false,
    normal: { opacity: 0.2, x: 0, y: 16, scale: 0.94, duration: "0.76s", wait: 280 },
    reduced: { opacity: 0.35, x: 0, y: 8, scale: 0.98, wait: 220 },
  },
];

const results = { normal: {}, reduced: {} };
for (const profile of profiles) results.normal[profile.name] = await sampleProfile(profile, false);
for (const profile of profiles) results.reduced[profile.name] = await sampleProfile(profile, true);

async function sampleBars(reduced) {
  await navigate(reduced);
  const initial = await evaluate(`(() => [...document.querySelectorAll('.c-offer__bar')].map((bar) => {
    const style = getComputedStyle(bar);
    return { opacity: Number.parseFloat(style.opacity), scale: new DOMMatrix(style.transform).d, origin: style.transformOrigin, duration: style.transitionDuration, delay: style.transitionDelay };
  }))()`);
  const expected = reduced ? { opacity: 0.55, scale: 0.72, duration: "0.65s" } : { opacity: 0.35, scale: 0.25, duration: "0.72s" };
  assert(initial.every((bar) => approximately(bar.opacity, expected.opacity, 0.02) && approximately(bar.scale, expected.scale, 0.02) && bar.duration.includes(expected.duration) && bar.origin.split(" ")[1] !== "0px"), `Growth bars must start from the approved base state: ${JSON.stringify(initial)}`);
  const delays = initial.map((bar) => bar.delay.split(",")[0].trim());
  assert(delays.join("|") === (reduced ? "0s|0.05s|0.1s|0.15s" : "0s|0.09s|0.18s|0.27s"), `Growth bars must expose their sequence: ${JSON.stringify(initial)}`);

  await evaluate(`document.querySelector('.c-offer__card').scrollIntoView({ block: 'center' })`);
  await new Promise((resolveDelay) => setTimeout(resolveDelay, reduced ? 230 : 280));
  const intermediate = await evaluate(`(() => [...document.querySelectorAll('.c-offer__bar')].map((bar) => {
    const style = getComputedStyle(bar);
    return { opacity: Number.parseFloat(style.opacity), scale: new DOMMatrix(style.transform).d };
  }))()`);
  assert(intermediate[0].scale > initial[0].scale && intermediate[0].scale < 1 && intermediate[0].scale > intermediate[3].scale, `Growth bars must rise progressively instead of jumping together: ${JSON.stringify({ initial, intermediate })}`);

  await new Promise((resolveDelay) => setTimeout(resolveDelay, 1150));
  const final = await evaluate(`(() => [...document.querySelectorAll('.c-offer__bar')].map((bar) => {
    const style = getComputedStyle(bar);
    return { opacity: Number.parseFloat(style.opacity), scale: new DOMMatrix(style.transform === 'none' ? undefined : style.transform).d };
  }))()`);
  assert(final.every((bar) => approximately(bar.opacity, 1, 0.01) && approximately(bar.scale, 1, 0.01)), `Growth bars must settle at their authored height: ${JSON.stringify(final)}`);
  return { initial, intermediate, final };
}

results.normal.bars = await sampleBars(false);
results.reduced.bars = await sampleBars(true);

socket.close();
console.log(JSON.stringify({ contract, results }, null, 2));
