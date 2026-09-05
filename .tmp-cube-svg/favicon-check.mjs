// Load the favicon as a real <img> (no CSS inheritance, like a browser tab does)
// and confirm it is visible in both colour schemes.
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const raw = readFileSync("client/public/favicon-cube.svg");
const URL = `data:image/svg+xml;base64,${raw.toString("base64")}`;
const SIZES = [16, 32, 48];
const ZOOM = 8;

const browser = await chromium.launch({ executablePath: CHROME });
const shots = {};

for (const scheme of ["light", "dark"]) {
  const page = await browser.newPage({
    viewport: { width: 200, height: 200 },
    deviceScaleFactor: 1,
    colorScheme: scheme,
  });
  for (const s of SIZES) {
    await page.setContent(
      `<!doctype html><style>
         body{margin:0;background:${scheme === "dark" ? "#18181b" : "#f4f4f5"}}
         img{width:${s}px;height:${s}px;display:block}
       </style><img id="m" src="${URL}">`,
    );
    await page.waitForFunction(() => {
      const i = document.getElementById("m");
      return i.complete && i.naturalWidth > 0;
    });
    shots[`${scheme}:${s}`] = (await page.locator("#m").screenshot()).toString("base64");
  }
  await page.close();
}

const page = await browser.newPage({ viewport: { width: 700, height: 400 } });
const html = `<!doctype html><style>
  body{margin:0;padding:20px;background:#27272a;color:#a1a1aa;
       font:12px ui-sans-serif,system-ui,sans-serif}
  h1{font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.55;margin:0 0 14px}
  .grid{display:grid;grid-template-columns:repeat(${SIZES.length},max-content);gap:8px 16px}
  .cap{text-align:center;font-weight:600}
  img{image-rendering:pixelated;display:block;border:1px solid #3f3f46}
</style>
<h1>favicon-cube.svg loaded as &lt;img&gt;, magnified ${ZOOM}x</h1>
<div class="grid">
  ${SIZES.map((s) => `<div class="cap">${s}px</div>`).join("")}
  ${["light", "dark"]
    .map((sc) =>
      SIZES.map(
        (s) =>
          `<img src="data:image/png;base64,${shots[`${sc}:${s}`]}" style="width:${s * ZOOM}px;height:${s * ZOOM}px">`,
      ).join(""),
    )
    .join("")}
</div>`;
await page.setContent(html);
await page.waitForTimeout(250);
await page.screenshot({ path: ".tmp-cube-svg/out/favicon-check.png", fullPage: true });
await browser.close();
console.log("wrote .tmp-cube-svg/out/favicon-check.png");
