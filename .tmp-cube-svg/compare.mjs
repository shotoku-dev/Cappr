// Server-render the real React component and diff its geometry against the generated SVG.
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { IsoDottedCube } from "../client/src/landing/IsoDottedCube.tsx";

const react = renderToStaticMarkup(React.createElement(IsoDottedCube));
const file = readFileSync("client/src/assets/brand/iso-dotted-cube.svg", "utf8");

const nums = (s, tag, attrs) => {
  const out = [];
  const re = new RegExp(`<${tag}\\b[^>]*>`, "g");
  let m;
  while ((m = re.exec(s))) {
    const el = m[0];
    const vals = attrs.map((a) => {
      const v = el.match(new RegExp(`${a}="([^"]*)"`));
      return v ? v[1] : null;
    });
    if (vals.every((v) => v !== null)) out.push(vals);
  }
  return out;
};

const round = (v) => Number(Number(v).toFixed(4));

const linesA = nums(react, "line", ["x1", "y1", "x2", "y2"]).map((r) => r.map(round));
const linesB = nums(file, "line", ["x1", "y1", "x2", "y2"]).map((r) => r.map(round));
const polyA = nums(react, "polygon", ["points"]).map(([p]) =>
  p.trim().split(/\s+/).map((pair) => pair.split(",").map(round).join(",")).join(" "),
);
const polyB = nums(file, "polygon", ["points"]).map(([p]) =>
  p.trim().split(/\s+/).map((pair) => pair.split(",").map(round).join(",")).join(" "),
);

console.log(`lines:    react=${linesA.length}  svg=${linesB.length}`);
console.log(`polygons: react=${polyA.length}  svg=${polyB.length}`);

let bad = 0;
for (let i = 0; i < Math.max(linesA.length, linesB.length); i++) {
  const a = JSON.stringify(linesA[i]);
  const b = JSON.stringify(linesB[i]);
  if (a !== b) {
    if (bad < 10) console.log(`  line[${i}] MISMATCH react=${a} svg=${b}`);
    bad++;
  }
}
for (let i = 0; i < Math.max(polyA.length, polyB.length); i++) {
  if (polyA[i] !== polyB[i]) {
    if (bad < 10) console.log(`  poly[${i}] MISMATCH react=${polyA[i]} svg=${polyB[i]}`);
    bad++;
  }
}

console.log(bad === 0 ? "EXACT MATCH — all coordinates identical, same order." : `${bad} MISMATCHES`);
