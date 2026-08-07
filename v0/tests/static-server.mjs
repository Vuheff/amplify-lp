import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(currentDirectory, "..");
const port = Number(process.env.PORT || 4173);
const previewUrl = `http://127.0.0.1:${port}`;
const shouldOpenBrowser = process.argv.includes("--open");

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
]);

function resolveRequestPath(requestUrl = "/") {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const absolutePath = resolve(root, relativePath);

  if (absolutePath !== root && !absolutePath.startsWith(`${root}${sep}`)) return null;
  return absolutePath;
}

const server = createServer(async (request, response) => {
  const requestedPath = resolveRequestPath(request.url);

  if (!requestedPath) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const fileStats = await stat(requestedPath);
    if (!fileStats.isFile()) throw new Error("Not a file");

    const body = await readFile(requestedPath);
    const contentType = contentTypes.get(extname(requestedPath).toLowerCase()) || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" }).end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

function openBrowser() {
  if (process.platform !== "win32") {
    console.warn(`Abra ${previewUrl} no navegador.`);
    return;
  }

  const browserProcess = spawn("explorer.exe", [previewUrl], {
    detached: true,
    stdio: "ignore",
  });
  browserProcess.on("error", () => console.warn(`Não foi possível abrir o navegador. Acesse ${previewUrl}.`));
  browserProcess.unref();
}

server.listen(port, "127.0.0.1", () => {
  console.log(`Preview disponível em ${previewUrl}`);
  console.log("Pressione Ctrl+C para encerrar.");
  if (shouldOpenBrowser) openBrowser();
});

function closeServer() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);
