// Isometric cube mark builder. Geometry mirrors
// client/src/landing/IsoDottedCube.tsx isoProject().
//
// Design constraints learned from earlier rounds:
//  - butt caps only; round caps add strokeWidth/2 of ink per dash end, which
//    swallows the gaps and fuses dashes into blobs where lines meet;
//  - dash length should be ~2-4x stroke width, or dashes render as squares;
//  - dashes sit between grid intersections ("mid" phase), because three lines
//    cross at every intersection and centring dashes there triples the ink.

const VIEW = 24;

const makeProject = (fill) => {
  const s = (VIEW * fill) / 2; // hexagon silhouette is 1.732s wide by 2s tall
  return {
    s,
    project: (x, y, z) => ({
      x: VIEW / 2 + (x - y) * s * 0.866,
      y: VIEW / 2 + (x + y) * s * 0.5 - z * s,
    }),
  };
};

const n = (v) => {
  const r = Number(v.toFixed(2));
  return Object.is(r, -0) ? 0 : r;
};

const key = (a, b) =>
  [a, b].sort((p, q) => p[0] - q[0] || p[1] - q[1] || p[2] - q[2]).flat().join(",");

/** Six outer corners of the projected cube, walked around the hexagon. */
const HULL_VERTS = [
  [0, 0, 1],
  [1, 0, 1],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
  [0, 1, 1],
];

/** The near corner (1,1,1) projects to the centre; three edges radiate from it. */
const CENTRE = [1, 1, 1];
const SPOKE_TIPS = [
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 0],
];

const HULL_KEYS = new Set(
  HULL_VERTS.map((v, i) => key(v, HULL_VERTS[(i + 1) % HULL_VERTS.length])),
);
const SPOKE_KEYS = new Set(SPOKE_TIPS.map((t) => key(CENTRE, t)));

/** Grid lines on the three camera-facing faces (x=1, y=1, z=1) only. */
function visibleFaceLines(divisions) {
  const lines = [];
  const seen = new Set();

  const add = (a, b) => {
    const k = key(a, b);
    if (seen.has(k)) return;
    seen.add(k);
    const kind = HULL_KEYS.has(k) ? "hull" : SPOKE_KEYS.has(k) ? "spoke" : "interior";
    lines.push({ a, b, kind });
  };

  for (let i = 0; i <= divisions; i++) {
    const u = i / divisions;
    add([1, u, 0], [1, u, 1]); // +X face
    add([1, 0, u], [1, 1, u]);
    add([u, 1, 0], [u, 1, 1]); // +Y face
    add([0, 1, u], [1, 1, u]);
    add([u, 0, 1], [u, 1, 1]); // +Z face (top)
    add([0, u, 1], [1, u, 1]);
  }

  return lines;
}

/**
 * A "mid" dash centred at (k+0.5)/marks that coincides with a grid line at
 * j/divisions stacks three crossing dashes on one node, rendering as a plus
 * sign. Reject those combinations rather than emit the artifact.
 */
function assertNoNodeCollision(marks, divisions) {
  for (let k = 0; k < marks; k++) {
    for (let j = 0; j <= divisions; j++) {
      if (Math.abs((k + 0.5) / marks - j / divisions) < 1e-9) {
        throw new Error(
          `marks=${marks} collides with divisions=${divisions}: dash ${k} lands on ` +
            `grid line ${j}. Use marks as a multiple of divisions.`,
        );
      }
    }
  }
}

/**
 * @param divisions   grid steps per cube edge
 * @param marks       dashes per edge (must be a multiple of `divisions`)
 * @param dashRatio   dash length as a fraction of the dash+gap step
 * @param hull        "dashed" | "solid" -- the 6 outer silhouette edges
 * @param spokes      "dashed" | "solid" -- the 3 edges meeting at the centre
 * @param interior    "dashed" | "solid" | "none" -- the remaining grid lines
 * @param cornerTicks draw a mitred tick at each of the 6 outer corners
 * @param fill        fraction of the square viewBox the silhouette occupies
 */
function buildMark({
  divisions,
  marks,
  dashRatio = 0.45,
  strokeWidth,
  hullWidth,
  hull = "dashed",
  spokes = "dashed",
  interior = "dashed",
  cornerTicks = false,
  fill = 0.84,
}) {
  assertNoNodeCollision(marks, divisions);

  const { s, project } = makeProject(fill);
  const step = s / marks;
  const dash = step * dashRatio;

  const p2 = (v) => project(v[0], v[1], v[2]);
  const fmt = (q) => `${n(q.x)} ${n(q.y)}`;
  const at = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

  const treatment = { hull, spoke: spokes, interior };
  const lines = visibleFaceLines(divisions).filter((l) => treatment[l.kind] !== "none");

  // Dashes are baked into explicit segments so the mark needs no dasharray or
  // dashoffset support from the renderer. Figma's importer drops dashoffset,
  // which would otherwise slide the pattern back onto the nodes.
  const dashed = [];
  const solid = [];

  for (const l of lines) {
    // A solid hull is emitted once as a closed ring below, so skip its edges
    // here; matching them by string afterwards misses the ones the grid
    // generator happens to produce with reversed endpoints.
    if (l.kind === "hull" && hull === "solid") continue;

    const a = p2(l.a);
    const b = p2(l.b);
    if (treatment[l.kind] === "solid") {
      solid.push(`M${fmt(a)}L${fmt(b)}`);
      continue;
    }
    for (let k = 0; k < marks; k++) {
      const c = (k + 0.5) * step;
      dashed.push(`M${fmt(at(a, b, (c - dash / 2) / s))}L${fmt(at(a, b, (c + dash / 2) / s))}`);
    }
  }

  // A solid hull is emitted as one closed subpath so its corners are mitred
  // joins; butted line ends would leave a wedge notch at each vertex.
  const ring = hull === "solid" ? `M${HULL_VERTS.map((v) => fmt(p2(v))).join("L")}Z` : "";
  const solidPath = ring + solid.join("");

  let ticks = "";
  if (cornerTicks) {
    ticks = HULL_VERTS.map((v, i) => {
      const prev = HULL_VERTS[(i + 5) % 6];
      const next = HULL_VERTS[(i + 1) % 6];
      const c = p2(v);
      // Each tick has two arms, so full-length arms read twice as heavy as a
      // plain dash. Shorten them to keep the corner in step with the field.
      const t = (dash * 0.65) / s;
      return `M${fmt(at(c, p2(prev), t))}L${fmt(c)}L${fmt(at(c, p2(next), t))}`;
    }).join("");
  }

  const paths = [
    solidPath && `<path d="${solidPath}"${hullWidth ? ` stroke-width="${hullWidth}"` : ""}/>`,
    dashed.length && `<path d="${dashed.join("")}"/>`,
    ticks && `<path d="${ticks}"/>`,
  ].filter(Boolean);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" fill="none"` +
    ` stroke="currentColor" stroke-width="${strokeWidth}" stroke-linejoin="miter">` +
    paths.join("") +
    `</svg>`;

  return {
    svg,
    step,
    dash,
    dashCount: dashed.length,
    solidCount: solid.length,
    ratio: dash / strokeWidth,
  };
}

export { buildMark, VIEW };
