// ../.tmp-cube-svg/compare.mjs
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

// src/landing/IsoDottedCube.tsx
import { motion, useReducedMotion } from "framer-motion";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var ILLUSTRATION_SPRING = {
  type: "spring",
  stiffness: 280,
  damping: 32,
  mass: 0.82
};
var ILLUSTRATION_STAGGER = 0.1;
function isoProject(x, y, z, size, cx, cy) {
  return {
    x: cx + (x - y) * size * 0.866,
    y: cy + (x + y) * size * 0.5 - z * size
  };
}
function cubeGridLines(divisions, zOffset) {
  const lines = [];
  const seen = /* @__PURE__ */ new Set();
  const add = (x1, y1, z1, x2, y2, z2) => {
    const key = [
      [x1, y1, z1 + zOffset],
      [x2, y2, z2 + zOffset]
    ].sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]).flat().join(",");
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
    // +X
    [
      [1, 0, z0],
      [1, 1, z0],
      [1, 1, z1],
      [1, 0, z1]
    ],
    // +Y
    [
      [0, 1, z0],
      [1, 1, z0],
      [1, 1, z1],
      [0, 1, z1]
    ],
    // +Z (top)
    [
      [0, 0, z1],
      [1, 0, z1],
      [1, 1, z1],
      [0, 1, z1]
    ]
  ];
}
function CubeSolidFaces({
  zOffset,
  project
}) {
  return /* @__PURE__ */ jsx(Fragment, { children: cubeSolidFaces(zOffset).map((corners, i) => {
    const points = corners.map(([x, y, z]) => {
      const p = project(x, y, z);
      return `${p.x},${p.y}`;
    });
    return /* @__PURE__ */ jsx("polygon", { points: points.join(" ") }, i);
  }) });
}
var SLAB = {
  pad: 0.55,
  zTop: -0.22,
  zBottom: -0.42
};
var CUBE_FOOTPRINT = {
  xMin: 0,
  xMax: 1,
  yMin: 0,
  yMax: 1
};
function faceFrameWithCutout(z, outer, hole) {
  const lines = [];
  const { xMin: ox0, xMax: ox1, yMin: oy0, yMax: oy1 } = outer;
  const { xMin: hx0, xMax: hx1, yMin: hy0, yMax: hy1 } = hole;
  if (oy0 < hy0) {
    lines.push([ox0, oy0, z, hx0, oy0, z], [hx1, oy0, z, ox1, oy0, z]);
  }
  if (oy1 > hy1) {
    lines.push([ox0, oy1, z, hx0, oy1, z], [hx1, oy1, z, ox1, oy1, z]);
  }
  if (ox0 < hx0) {
    lines.push([ox0, oy0, z, ox0, hy0, z], [ox0, hy1, z, ox0, oy1, z]);
  }
  if (ox1 > hx1) {
    lines.push([ox1, oy0, z, ox1, hy0, z], [ox1, hy1, z, ox1, oy1, z]);
  }
  return lines;
}
function slabCutoutWalls(zTop, zBottom, hole) {
  const { xMin, xMax, yMin, yMax } = hole;
  const top = [
    [xMin, yMin, zTop, xMax, yMin, zTop],
    [xMax, yMin, zTop, xMax, yMax, zTop],
    [xMax, yMax, zTop, xMin, yMax, zTop],
    [xMin, yMax, zTop, xMin, yMin, zTop]
  ];
  const bottom = [
    [xMin, yMin, zBottom, xMax, yMin, zBottom],
    [xMax, yMin, zBottom, xMax, yMax, zBottom],
    [xMax, yMax, zBottom, xMin, yMax, zBottom],
    [xMin, yMax, zBottom, xMin, yMin, zBottom]
  ];
  const walls = [
    [xMin, yMin, zTop, xMin, yMin, zBottom],
    [xMax, yMin, zTop, xMax, yMin, zBottom],
    [xMax, yMax, zTop, xMax, yMax, zBottom],
    [xMin, yMax, zTop, xMin, yMax, zBottom]
  ];
  return [...top, ...bottom, ...walls];
}
function groundSlabOutline() {
  const { pad, zTop, zBottom } = SLAB;
  const outer = {
    xMin: -pad,
    xMax: 1 + pad,
    yMin: -pad,
    yMax: 1 + pad
  };
  const sides = [
    [outer.xMin, outer.yMin, zTop, outer.xMin, outer.yMin, zBottom],
    [outer.xMax, outer.yMin, zTop, outer.xMax, outer.yMin, zBottom],
    [outer.xMax, outer.yMax, zTop, outer.xMax, outer.yMax, zBottom],
    [outer.xMin, outer.yMax, zTop, outer.xMin, outer.yMax, zBottom]
  ];
  return [
    ...faceFrameWithCutout(zTop, outer, CUBE_FOOTPRINT),
    ...faceFrameWithCutout(zBottom, outer, CUBE_FOOTPRINT),
    ...slabCutoutWalls(zTop, zBottom, CUBE_FOOTPRINT),
    ...sides
  ];
}
var PILLAR = {
  halfSize: 0.11,
  gapBelowSlab: 0.85,
  height: 1.02,
  edgeInset: 0.28
};
function slabPillarPositions() {
  const pad = SLAB.pad;
  const inset = PILLAR.edgeInset;
  const xMin = -pad;
  const xMax = 1 + pad;
  const yMin = -pad;
  const yMax = 1 + pad;
  return [
    { ox: xMin + inset, oy: yMax - inset },
    { ox: xMax - inset, oy: yMin + inset }
  ];
}
function boxWireframe(ox, oy, half, zTop, zBottom) {
  const x0 = ox - half;
  const x1 = ox + half;
  const y0 = oy - half;
  const y1 = oy + half;
  const top = [
    [x0, y0, zTop, x1, y0, zTop],
    [x1, y0, zTop, x1, y1, zTop],
    [x1, y1, zTop, x0, y1, zTop],
    [x0, y1, zTop, x0, y0, zTop]
  ];
  const bottom = [
    [x0, y0, zBottom, x1, y0, zBottom],
    [x1, y0, zBottom, x1, y1, zBottom],
    [x1, y1, zBottom, x0, y1, zBottom],
    [x0, y1, zBottom, x0, y0, zBottom]
  ];
  const walls = [
    [x0, y0, zTop, x0, y0, zBottom],
    [x1, y0, zTop, x1, y0, zBottom],
    [x1, y1, zTop, x1, y1, zBottom],
    [x0, y1, zTop, x0, y1, zBottom]
  ];
  return [...top, ...bottom, ...walls];
}
function pillarTopZ() {
  return SLAB.zBottom - PILLAR.gapBelowSlab;
}
function slabPillarLinesAt(ox, oy) {
  const zTop = pillarTopZ();
  const zBottom = zTop - PILLAR.height;
  return boxWireframe(ox, oy, PILLAR.halfSize, zTop, zBottom);
}
function pillarOrigin(ox, oy, size, cx, cy) {
  const zTop = pillarTopZ();
  const zBottom = zTop - PILLAR.height;
  const zMid = (zTop + zBottom) / 2;
  return isoProject(ox, oy, zMid, size, cx, cy);
}
function slabOrigin(size, cx, cy) {
  const zMid = (SLAB.zTop + SLAB.zBottom) / 2;
  return isoProject(0.5, 0.5, zMid, size, cx, cy);
}
function IllustrationShapeGroup({
  origin,
  compactY,
  delay,
  className,
  reduceMotion,
  children
}) {
  const compactOffsetY = compactY - origin.y;
  return /* @__PURE__ */ jsx(
    motion.g,
    {
      className,
      initial: reduceMotion ? false : { y: compactOffsetY },
      animate: { y: 0 },
      transition: {
        ...ILLUSTRATION_SPRING,
        delay: reduceMotion ? 0 : delay
      },
      children
    }
  );
}
function DottedLines({
  lines,
  project
}) {
  return /* @__PURE__ */ jsx(Fragment, { children: lines.map(([x1, y1, z1, x2, y2, z2]) => {
    const a = project(x1, y1, z1);
    const b = project(x2, y2, z2);
    return /* @__PURE__ */ jsx(
      "line",
      {
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y
      },
      `${x1}${y1}${z1}-${x2}${y2}${z2}`
    );
  }) });
}
function IsoDottedCube({ size = 32, divisions = 5, className }) {
  const reduceMotion = useReducedMotion() ?? false;
  const cx = 100;
  const cy = 84;
  const cubeZOffset = 0.55;
  const project = (x, y, z) => isoProject(x, y, z, size, cx, cy);
  const cubeOrigin = project(0.5, 0.5, cubeZOffset + 0.5);
  const planeOrigin = slabOrigin(size, cx, cy);
  const pillars = slabPillarPositions();
  const pillarOrigins = pillars.map(({ ox, oy }) => pillarOrigin(ox, oy, size, cx, cy));
  const pillarsOrigin = {
    x: pillarOrigins.reduce((sum, point) => sum + point.x, 0) / pillarOrigins.length,
    y: pillarOrigins.reduce((sum, point) => sum + point.y, 0) / pillarOrigins.length
  };
  const compactY = (cubeOrigin.y + planeOrigin.y + pillarsOrigin.y) / 3;
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      viewBox: "0 0 200 378",
      className,
      "aria-hidden": true,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "0.625",
      strokeDasharray: "1 2.25",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx(
          IllustrationShapeGroup,
          {
            origin: pillarsOrigin,
            compactY,
            delay: 0,
            reduceMotion,
            children: pillars.map(({ ox, oy }) => /* @__PURE__ */ jsx("g", { className: "landing-hero__cylinder", children: /* @__PURE__ */ jsx(DottedLines, { lines: slabPillarLinesAt(ox, oy), project }) }, `pillar-${ox}-${oy}`))
          }
        ),
        /* @__PURE__ */ jsx(
          IllustrationShapeGroup,
          {
            className: "landing-hero__plane",
            origin: planeOrigin,
            compactY,
            delay: ILLUSTRATION_STAGGER,
            reduceMotion,
            children: /* @__PURE__ */ jsx(DottedLines, { lines: groundSlabOutline(), project })
          }
        ),
        /* @__PURE__ */ jsxs(
          IllustrationShapeGroup,
          {
            className: "landing-hero__cube",
            origin: cubeOrigin,
            compactY,
            delay: ILLUSTRATION_STAGGER * 2,
            reduceMotion,
            children: [
              /* @__PURE__ */ jsx("g", { className: "landing-hero__cube-fill", children: /* @__PURE__ */ jsx(CubeSolidFaces, { zOffset: cubeZOffset, project }) }),
              /* @__PURE__ */ jsx("g", { className: "landing-hero__cube-mesh", children: /* @__PURE__ */ jsx(DottedLines, { lines: cubeGridLines(divisions, cubeZOffset), project }) })
            ]
          }
        )
      ]
    }
  );
}

// ../.tmp-cube-svg/compare.mjs
var react = renderToStaticMarkup(React.createElement(IsoDottedCube));
var file = readFileSync("client/src/assets/brand/iso-dotted-cube.svg", "utf8");
var nums = (s, tag, attrs) => {
  const out = [];
  const re = new RegExp(`<${tag}\\b[^>]*>`, "g");
  let m;
  while (m = re.exec(s)) {
    const el = m[0];
    const vals = attrs.map((a) => {
      const v = el.match(new RegExp(`${a}="([^"]*)"`));
      return v ? v[1] : null;
    });
    if (vals.every((v) => v !== null)) out.push(vals);
  }
  return out;
};
var round = (v) => Number(Number(v).toFixed(4));
var linesA = nums(react, "line", ["x1", "y1", "x2", "y2"]).map((r) => r.map(round));
var linesB = nums(file, "line", ["x1", "y1", "x2", "y2"]).map((r) => r.map(round));
var polyA = nums(react, "polygon", ["points"]).map(
  ([p]) => p.trim().split(/\s+/).map((pair) => pair.split(",").map(round).join(",")).join(" ")
);
var polyB = nums(file, "polygon", ["points"]).map(
  ([p]) => p.trim().split(/\s+/).map((pair) => pair.split(",").map(round).join(",")).join(" ")
);
console.log(`lines:    react=${linesA.length}  svg=${linesB.length}`);
console.log(`polygons: react=${polyA.length}  svg=${polyB.length}`);
var bad = 0;
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
console.log(bad === 0 ? "EXACT MATCH \u2014 all coordinates identical, same order." : `${bad} MISMATCHES`);
