// Final confirmation render of the two shipped standalone marks.
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FILES = [
  { name: "cappr-cube.svg", note: "variant 03 · 2×2 grid, 4 dashes per edge · 1,462 B" },
  { name: "cappr-cube-fine.svg", note: "variant 05 · 3×3 grid, 6 dashes per edge · 2,918 B" },
].map((f) => ({ ...f, svg: readFileSync(`client/src/assets/brand/${f.name}`, "utf8") }));

const BIG = 250;
const sheet = (theme) => `<div class="sheet ${theme}">
  <h2>${theme}</h2>
  <div class="row">${FILES.map(
    (f) => `<div>
      <div class="frame" style="width:${BIG}px;height:${BIG}px">${f.svg}</div>
      <b>${f.name}</b><span>${f.note}</span>
    </div>`,
  ).join("")}</div>
</div>`;

const html = `<!doctype html><meta charset="utf-8"><style>
  * { box-sizing:border-box; }
  body { margin:0; font:12px/1.4 ui-sans-serif,system-ui,sans-serif; }
  .sheet { padding:24px; background:oklch(0.145 0.002 286.0); color:oklch(0.94 0.004 286); }
  .sheet.light { background:oklch(0.980 0.002 286.0); color:oklch(0.16 0.006 286); }
  h2 { font-size:10px; text-transform:uppercase; letter-spacing:.1em; opacity:.45;
       margin:0 0 14px; font-weight:600; }
  .row { display:grid; grid-template-columns:repeat(2,max-content); gap:22px; }
  .frame { border:1px dashed color-mix(in oklch, currentColor 20%, transparent); }
  .frame svg { width:100%; height:100%; display:block; }
  b { font-size:12.5px; display:block; margin-top:8px; }
  span { font-size:11px; opacity:.55; }
</style>${sheet("dark")}${sheet("light")}`;

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 2 * BIG + 90, height: 400 }, deviceScaleFactor: 2 });
await page.setContent(html);
await page.waitForTimeout(250);
await page.screenshot({ path: ".tmp-cube-svg/out/shipped.png", fullPage: true });
await browser.close();
console.log("wrote .tmp-cube-svg/out/shipped.png");
