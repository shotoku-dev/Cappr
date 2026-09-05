// Mirrors client/src/landing/IsoDottedCube.tsx geometry 1:1.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const SIZE = 32;
const DIVISIONS = 5;
const CX = 100;
const CY = 84;
const CUBE_Z_OFFSET = 0.55;

const isoProject = (x, y, z, size = SIZE, cx = CX, cy = CY) => ({
  x: cx + (x - y) * size * 0.866,
  y: cy + (x + y) * size * 0.5 - z * size,
});

const project = (x, y, z) => isoProject(x, y, z);

function cubeGridLines(divisions, zOffset) {
  const lines = [];
  const seen = new Set();

  const add = (x1, y1, z1, x2, y2, z2) => {
    const key = [
      [x1, y1, z1 + zOffset],
      [x2, y2, z2 + zOffset],
    ]
      .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
      .flat()
      .join(",");

    if (seen.has(key)) return;
    seen.add(key);
    lines.push([x1, y1, z1 + zOffset, x2, y2, z2 + zOffset]);
  };

  for (let i = 0; i <= divisions; i++) {
    const u = i / divisions;
    for (let j = 0; j <= divisions; j++) {
      const v = j / divisions;
      add(0, u, v, 1, u, v);
      add(u, 0, v, u, 1, v);
      add(u, v, 0, u, v, 1);
    }
  }

  return lines;
}

function cubeSolidFaces(zOffset) {
  const z0 = zOffset;
  const z1 = 1 + zOffset;
  return [
    [
      [1, 0, z0],
      [1, 1, z0],
      [1, 1, z1],
      [1, 0, z1],
    ],
    [
      [0, 1, z0],
      [1, 1, z0],
      [1, 1, z1],
      [0, 1, z1],
    ],
    [
      [0, 0, z1],
      [1, 0, z1],
      [1, 1, z1],
      [0, 1, z1],
    ],
  ];
}

const SLAB = { pad: 0.55, zTop: -0.22, zBottom: -0.42 };
const CUBE_FOOTPRINT = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };

function faceFrameWithCutout(z, outer, hole) {
  const lines = [];
  const { xMin: ox0, xMax: ox1, yMin: oy0, yMax: oy1 } = outer;
  const { xMin: hx0, xMax: hx1, yMin: hy0, yMax: hy1 } = hole;

  if (oy0 < hy0) lines.push([ox0, oy0, z, hx0, oy0, z], [hx1, oy0, z, ox1, oy0, z]);
  if (oy1 > hy1) lines.push([ox0, oy1, z, hx0, oy1, z], [hx1, oy1, z, ox1, oy1, z]);
  if (ox0 < hx0) lines.push([ox0, oy0, z, ox0, hy0, z], [ox0, hy1, z, ox0, oy1, z]);
  if (ox1 > hx1) lines.push([ox1, oy0, z, ox1, hy0, z], [ox1, hy1, z, ox1, oy1, z]);

  return lines;
}

function slabCutoutWalls(zTop, zBottom, hole) {
  const { xMin, xMax, yMin, yMax } = hole;
  return [
    [xMin, yMin, zTop, xMax, yMin, zTop],
    [xMax, yMin, zTop, xMax, yMax, zTop],
    [xMax, yMax, zTop, xMin, yMax, zTop],
    [xMin, yMax, zTop, xMin, yMin, zTop],
    [xMin, yMin, zBottom, xMax, yMin, zBottom],
    [xMax, yMin, zBottom, xMax, yMax, zBottom],
    [xMax, yMax, zBottom, xMin, yMax, zBottom],
    [xMin, yMax, zBottom, xMin, yMin, zBottom],
    [xMin, yMin, zTop, xMin, yMin, zBottom],
    [xMax, yMin, zTop, xMax, yMin, zBottom],
    [xMax, yMax, zTop, xMax, yMax, zBottom],
    [xMin, yMax, zTop, xMin, yMax, zBottom],
  ];
}

function groundSlabOutline() {
  const { pad, zTop, zBottom } = SLAB;
  const outer = { xMin: -pad, xMax: 1 + pad, yMin: -pad, yMax: 1 + pad };

  const sides = [
    [outer.xMin, outer.yMin, zTop, outer.xMin, outer.yMin, zBottom],
    [outer.xMax, outer.yMin, zTop, outer.xMax, outer.yMin, zBottom],
    [outer.xMax, outer.yMax, zTop, outer.xMax, outer.yMax, zBottom],
    [outer.xMin, outer.yMax, zTop, outer.xMin, outer.yMax, zBottom],
  ];

  return [
    ...faceFrameWithCutout(zTop, outer, CUBE_FOOTPRINT),
    ...faceFrameWithCutout(zBottom, outer, CUBE_FOOTPRINT),
    ...slabCutoutWalls(zTop, zBottom, CUBE_FOOTPRINT),
    ...sides,
  ];
}

const PILLAR = { halfSize: 0.11, gapBelowSlab: 0.85, height: 1.02, edgeInset: 0.28 };

function slabPillarPositions() {
  const pad = SLAB.pad;
  const inset = PILLAR.edgeInset;
  const xMin = -pad;
  const xMax = 1 + pad;
  const yMin = -pad;
  const yMax = 1 + pad;
  return [
    { ox: xMin + inset, oy: yMax - inset },
    { ox: xMax - inset, oy: yMin + inset },
  ];
}

function boxWireframe(ox, oy, half, zTop, zBottom) {
  const x0 = ox - half;
  const x1 = ox + half;
  const y0 = oy - half;
  const y1 = oy + half;
  return [
    [x0, y0, zTop, x1, y0, zTop],
    [x1, y0, zTop, x1, y1, zTop],
    [x1, y1, zTop, x0, y1, zTop],
    [x0, y1, zTop, x0, y0, zTop],
    [x0, y0, zBottom, x1, y0, zBottom],
    [x1, y0, zBottom, x1, y1, zBottom],
    [x1, y1, zBottom, x0, y1, zBottom],
    [x0, y1, zBottom, x0, y0, zBottom],
    [x0, y0, zTop, x0, y0, zBottom],
    [x1, y0, zTop, x1, y0, zBottom],
    [x1, y1, zTop, x1, y1, zBottom],
    [x0, y1, zTop, x0, y1, zBottom],
  ];
}

const pillarTopZ = () => SLAB.zBottom - PILLAR.gapBelowSlab;

function slabPillarLinesAt(ox, oy) {
  const zTop = pillarTopZ();
  return boxWireframe(ox, oy, PILLAR.halfSize, zTop, zTop - PILLAR.height);
}

// ── emit ────────────────────────────────────────────────────
const n = (v) => {
  const r = Number(v.toFixed(4));
  return Object.is(r, -0) ? 0 : r;
};

const lineEl = (l, indent) => {
  const a = project(l[0], l[1], l[2]);
  const b = project(l[3], l[4], l[5]);
  return `${indent}<line x1="${n(a.x)}" y1="${n(a.y)}" x2="${n(b.x)}" y2="${n(b.y)}" />`;
};

const polyEl = (corners, indent) =>
  `${indent}<polygon points="${corners
    .map(([x, y, z]) => {
      const p = project(x, y, z);
      return `${n(p.x)},${n(p.y)}`;
    })
    .join(" ")}" />`;

const pillars = slabPillarPositions();

const body = [
  `  <g class="pillars">`,
  ...pillars.map(({ ox, oy }) =>
    [
      `    <g>`,
      ...slabPillarLinesAt(ox, oy).map((l) => lineEl(l, "      ")),
      `    </g>`,
    ].join("\n"),
  ),
  `  </g>`,
  `  <g class="plane">`,
  ...groundSlabOutline().map((l) => lineEl(l, "    ")),
  `  </g>`,
  `  <g class="cube">`,
  `    <g class="cube-fill">`,
  ...cubeSolidFaces(CUBE_Z_OFFSET).map((f) => polyEl(f, "      ")),
  `    </g>`,
  `    <g class="cube-mesh">`,
  ...cubeGridLines(DIVISIONS, CUBE_Z_OFFSET).map((l) => lineEl(l, "      ")),
  `    </g>`,
  `  </g>`,
].join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 378" fill="none" stroke="currentColor" stroke-width="0.5" stroke-dasharray="1 2.25" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Isometric dotted wireframe cube on a floating slab">
  <style>
    svg {
      /* --color-text-secondary */
      color: oklch(0.660 0.016 285.9);
      /* --landing-surface -&gt; --color-surface-app */
      --surface: oklch(0.145 0.002 286.0);
    }
    @media (prefers-color-scheme: light) {
      svg {
        color: oklch(0.303 0.009 285.8);
        --surface: oklch(0.980 0.002 286.0);
      }
    }
    /* --color-text-muted (theme-invariant) */
    .plane { color: oklch(0.532 0.017 285.7); opacity: 0.55; }
    .cube-fill { stroke: none; }
    .cube-fill polygon { fill: var(--surface); }
  </style>
${body}
</svg>
`;

const out = process.argv[2];
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, svg);
console.log(`wrote ${out} (${svg.length} bytes)`);
