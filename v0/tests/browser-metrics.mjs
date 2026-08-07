const port = process.argv[2] || "9222";
const pages = await fetch(`http://127.0.0.1:${port}/json`).then((response) => response.json());
const page = pages.find((candidate) => candidate.type === "page" && candidate.url.includes("127.0.0.1:4173"));

if (!page) throw new Error("No browser page available");

const socket = new WebSocket(page.webSocketDebuggerUrl);
const result = await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error("Metrics request timed out")), 5000);

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({
      id: 1,
      method: "Runtime.evaluate",
      params: {
        returnByValue: true,
        expression: `JSON.stringify((() => {
          const select = (selector) => document.querySelector(selector);
          const rect = (selector) => {
            const element = select(selector);
            if (!element) return null;
            const box = element.getBoundingClientRect();
            return {
              left: box.left,
              right: box.right,
              width: box.width,
              clientWidth: element.clientWidth,
              scrollWidth: element.scrollWidth,
              minWidth: getComputedStyle(element).minWidth,
              boxSizing: getComputedStyle(element).boxSizing,
            };
          };

          return {
            viewport: {
              innerWidth,
              innerHeight,
              outerWidth,
              outerHeight,
              devicePixelRatio,
              bodyClientWidth: document.body.clientWidth,
              bodyScrollWidth: document.body.scrollWidth,
            },
            container: rect(".o-container"),
            layout: rect(".c-hero__layout"),
            copy: rect(".c-hero__copy"),
            title: rect(".c-hero__title"),
            preview: rect(".c-decision-preview"),
            rail: rect(".c-decision-preview__rail"),
          };
        })())`,
      },
    }));
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id !== 1) return;
    clearTimeout(timeout);
    resolve(JSON.parse(message.result.result.value));
  });

  socket.addEventListener("error", reject);
});

socket.close();
console.log(JSON.stringify(result, null, 2));
