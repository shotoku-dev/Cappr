#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientRoot = join(__dirname, "..");
const repoRoot = join(clientRoot, "..");
const outDir = join(clientRoot, "public", "textures");

const THEMES = [
  { name: "dark", back: "#0a0a0b", front: "#3e92cc" },
  { name: "light", back: "#f9f9fa", front: "#3e92cc" },
];

const WIDTH = 1920;
const HEIGHT = 1280;

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".map")) return "application/json";
  return "application/octet-stream";
}

function startStaticServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url ?? "/", "http://localhost");
        const rel = decodeURIComponent(url.pathname);
        let filePath;
        if (rel.startsWith("/node_modules/")) {
          filePath = join(repoRoot, rel);
        } else {
          filePath = join(clientRoot, rel === "/" ? "/scripts/bake-dither.html" : rel);
        }
        const data = await readFile(filePath);
        res.writeHead(200, { "Content-Type": contentType(filePath) });
        res.end(data);
      } catch {
        res.writeHead(404).end("Not found");
      }
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function bake() {
  const require = createRequire(import.meta.url);
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.error("Playwright is required. Run: npm i -D playwright && npx playwright install chromium");
    process.exit(1);
  }

  const server = await startStaticServer();
  const { port } = server.address();
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });

  await mkdir(outDir, { recursive: true });

  for (const theme of THEMES) {
    const url =
      `http://127.0.0.1:${port}/scripts/bake-dither.html` +
      `?w=${WIDTH}&h=${HEIGHT}&back=${encodeURIComponent(theme.back)}` +
      `&front=${encodeURIComponent(theme.front)}&frame=0`;

    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__ready === true, undefined, { timeout: 10_000 });

    const canvas = page.locator("#mount canvas");
    const png = await canvas.screenshot({ type: "png" });
    const outPath = join(outDir, `landing-dither-${theme.name}.png`);
    await writeFile(outPath, png);
    console.log(`Wrote ${outPath}`);
  }

  await browser.close();
  server.close();
}

bake().catch((error) => {
  console.error(error);
  process.exit(1);
});
