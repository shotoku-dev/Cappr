// Write each candidate mark to its own file for side-by-side review in Figma.
import { mkdirSync, writeFileSync } from "node:fs";
import { buildMark } from "./logo-gen.mjs";

const OUT = "logo-variants";
mkdirSync(OUT, { recursive: true });

const F = 0.84;

const VARIANTS = [
  // ── all-dashed, varying density ─────────────────────────────
  { id: "01-grid2-dash2", divisions: 2, marks: 2, dashRatio: 0.45, strokeWidth: 1,
    desc: "2x2 grid, 2 dashes per edge (currently shipped)" },
  { id: "02-grid2-dash2-thin", divisions: 2, marks: 2, dashRatio: 0.55, strokeWidth: 0.7,
    desc: "2x2 grid, longer thinner dashes" },
  { id: "03-grid2-dash4", divisions: 2, marks: 4, dashRatio: 0.55, strokeWidth: 0.6,
    desc: "2x2 grid, 4 dashes per edge" },
  { id: "04-grid3-dash3", divisions: 3, marks: 3, dashRatio: 0.5, strokeWidth: 0.75,
    desc: "3x3 grid, 3 dashes per edge" },
  { id: "05-grid3-dash6", divisions: 3, marks: 6, dashRatio: 0.55, strokeWidth: 0.5,
    desc: "3x3 grid, 6 dashes per edge (densest, closest to the original)" },
  { id: "06-outline-dash2", divisions: 1, marks: 2, dashRatio: 0.5, strokeWidth: 1.1,
    desc: "no interior grid, 2 dashes per edge" },
  { id: "07-outline-dash3", divisions: 1, marks: 3, dashRatio: 0.55, strokeWidth: 0.9,
    desc: "no interior grid, 3 dashes per edge" },

  // ── corner ticks pin the silhouette ─────────────────────────
  { id: "08-grid2-dash2-ticks", divisions: 2, marks: 2, dashRatio: 0.45, strokeWidth: 1,
    cornerTicks: true, desc: "2x2 grid plus a mitred tick at each outer corner" },
  { id: "09-grid3-dash3-ticks", divisions: 3, marks: 3, dashRatio: 0.5, strokeWidth: 0.75,
    cornerTicks: true, desc: "3x3 grid plus corner ticks" },

  // ── solid frame, dashed interior ────────────────────────────
  { id: "10-frame-solid-grid2", divisions: 2, marks: 2, dashRatio: 0.45, strokeWidth: 0.9,
    hull: "solid", spokes: "solid", desc: "solid outline and spokes, dashed 2x2 interior" },
  { id: "11-frame-solid-grid3", divisions: 3, marks: 3, dashRatio: 0.5, strokeWidth: 0.8,
    hull: "solid", spokes: "solid", desc: "solid outline and spokes, dashed 3x3 interior" },
  { id: "12-hull-solid-spokes-dash", divisions: 2, marks: 2, dashRatio: 0.45, strokeWidth: 0.9,
    hull: "solid", spokes: "dashed", desc: "solid outline only, everything inside dashed" },

  // ── fully solid, for small sizes ────────────────────────────
  { id: "13-solid-outline", divisions: 1, marks: 2, strokeWidth: 1.5, hull: "solid",
    spokes: "solid", interior: "none", desc: "fully solid cube (16px / favicon safe)" },
];

const built = VARIANTS.map((v) => {
  const r = buildMark({ fill: F, ...v });
  writeFileSync(`${OUT}/${v.id}.svg`, r.svg + "\n");
  return { ...v, ...r };
});

for (const v of built) {
  console.log(
    `${v.id.padEnd(26)} ${String(v.svg.length).padStart(5)} B  ` +
      `dashes=${String(v.dashCount).padStart(3)} solid=${String(v.solidCount).padStart(2)}  ` +
      `dash/sw=${v.ratio.toFixed(1)}`,
  );
}

writeFileSync(`${OUT}/variants.json`, JSON.stringify(built, null, 2));
console.log(`\n${built.length} files in ${OUT}/`);

// Keep the shipped assets byte-identical to their corresponding variant so
// there is never a near-miss between what was reviewed and what is in use.
//
// The dashed marks only resolve into a cube above a certain size -- 03 from
// roughly 64px, 05 from roughly 96px -- so the solid mark covers small sizes.
const pick = (id) => built.find((v) => v.id === id).svg + "\n";

writeFileSync("client/src/assets/brand/cappr-cube.svg", pick("03-grid2-dash4"));
writeFileSync("client/src/assets/brand/cappr-cube-fine.svg", pick("05-grid3-dash6"));
writeFileSync("client/src/assets/brand/cappr-cube-solid.svg", pick("13-solid-outline"));

// A favicon has no inherited colour context, so currentColor would resolve to
// black and vanish against dark browser chrome. Hardcode both schemes.
writeFileSync(
  "client/public/favicon-cube.svg",
  pick("13-solid-outline")
    .replace('stroke="currentColor"', 'stroke="#09090b"')
    .replace("><path", "><style>@media(prefers-color-scheme:dark){path{stroke:#fafafa}}</style><path"),
);
console.log(
  "synced cappr-cube.svg (03), cappr-cube-fine.svg (05), " +
    "cappr-cube-solid.svg + favicon-cube.svg (13)",
);
