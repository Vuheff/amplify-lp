import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const port = process.argv[2] || "9222";
const outputDirectory = resolve("assets/images/web");
const assets = [
  {
    source: "./assets/images/AmplifyUGC Assets 2026-08-06/BAW/3007/IMG_7059.jpg",
    output: "photo-rail-operation.webp",
    focusY: 0.46,
  },
  {
    source: "./assets/images/AmplifyUGC Assets 2026-08-06/Cariri/IMG_9573.jpeg",
    output: "photo-rail-field.webp",
    focusY: 0.44,
  },
  {
    source: "./assets/images/AmplifyUGC Assets 2026-08-06/Daniel Zuk/IMG_7804.jpg",
    output: "photo-rail-creator.webp",
    focusY: 0.42,
  },
  {
    source: "./assets/images/AmplifyUGC Assets 2026-08-06/PE.Q3 LAST DAY/IMG_1858.jpg",
    output: "photo-rail-event.webp",
    focusY: 0.44,
  },
  {
    source: "./assets/images/AmplifyUGC Assets 2026-08-06/PODCAST/3007/MATTEO THE FOUNDERS/IMG_7217.jpg",
    output: "photo-rail-studio.webp",
    focusY: 0.46,
  },
  {
    source: "./assets/images/AmplifyUGC Assets 2026-08-06/RJ GoldSpell/IMG_9279.jpeg",
    output: "photo-rail-live.webp",
    focusY: 0.48,
  },
  {
    source: "./assets/images/AmplifyUGC Assets 2026-08-06/The Founders/IMG_5245.jpg",
    output: "photo-rail-founders.webp",
    focusY: 0.44,
  },
  {
    source: "./assets/images/AmplifyUGC Assets 2026-08-06/V4 CAMPINAS/IMG_7718.jpg",
    output: "photo-rail-strategy.webp",
    focusY: 0.45,
  },
];

const pages = await fetch(`http://127.0.0.1:${port}/json`).then((response) => response.json());
const page = pages.find((candidate) => candidate.type === "page" && candidate.url.includes("127.0.0.1:4173"));
if (!page) throw new Error("No local preview page available");

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 0;

await new Promise((resolveOpen, rejectOpen) => {
  socket.addEventListener("open", resolveOpen, { once: true });
  socket.addEventListener("error", rejectOpen, { once: true });
});

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id) return;
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  if (message.error) request.reject(new Error(message.error.message));
  else request.resolve(message.result);
});

function send(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolveRequest, rejectRequest) => {
    pending.set(id, { resolve: resolveRequest, reject: rejectRequest });
  });
}

await mkdir(outputDirectory, { recursive: true });

for (const asset of assets) {
  const payload = JSON.stringify(asset);
  const response = await send("Runtime.evaluate", {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const asset = ${payload};
      const image = new Image();
      image.src = asset.source;
      await image.decode();

      const width = 480;
      const height = 640;
      const targetRatio = width / height;
      const sourceRatio = image.naturalWidth / image.naturalHeight;
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = image.naturalWidth;
      let sourceHeight = image.naturalHeight;

      if (sourceRatio > targetRatio) {
        sourceWidth = sourceHeight * targetRatio;
        sourceX = (image.naturalWidth - sourceWidth) * 0.5;
      } else {
        sourceHeight = sourceWidth / targetRatio;
        sourceY = (image.naturalHeight - sourceHeight) * asset.focusY;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { alpha: false });
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);

      const blob = await new Promise((resolveBlob) => canvas.toBlob(resolveBlob, 'image/webp', 0.72));
      if (!blob) throw new Error('WebP encoding is unavailable');
      return await new Promise((resolveData, rejectData) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => resolveData(reader.result), { once: true });
        reader.addEventListener('error', rejectData, { once: true });
        reader.readAsDataURL(blob);
      });
    })()`,
  });

  if (response.exceptionDetails) throw new Error(`Failed to render ${asset.output}`);
  const dataUrl = response.result.value;
  const encoded = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const outputPath = resolve(outputDirectory, asset.output);
  const buffer = Buffer.from(encoded, "base64");
  await writeFile(outputPath, buffer);
  console.log(`${asset.output}: ${Math.round(buffer.length / 1024)} KB`);
}

socket.close();
