import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Point = { x: number; y: number };
type Line3 = readonly [number, number, number, number, number, number];

const ILLUSTRATION_SPRING = {
  type: "spring" as const,
  stiffness: 280,
  damping: 32,
  mass: 0.82,
};

const ILLUSTRATION_STAGGER = 0.1;

function isoProject(
  x: number,
  y: number,
  z: number,
  size: number,
  cx: number,
  cy: number,
): Point {
  return {
    x: cx + (x - y) * size * 0.866,
    y: cy + (x + y) * size * 0.5 - z * size,
  };
}

/** Grid lines inside the unit cube — `divisions` steps per edge. */
function cubeGridLines(divisions: number, zOffset: number): Line3[] {
  const lines: Line3[] = [];
  const seen = new Set<string>();

  const add = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
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

type Face3 = readonly [Point3, Point3, Point3, Point3];
type Point3 = readonly [number, number, number];

/** Three outward faces of the unit cube (painter order: back → front). */
function cubeSolidFaces(zOffset: number): Face3[] {
  const z0 = zOffset;
  const z1 = 1 + zOffset;

  return [
    // +X
    [
      [1, 0, z0],
      [1, 1, z0],
      [1, 1, z1],
      [1, 0, z1],
    ],
    // +Y
    [
      [0, 1, z0],
      [1, 1, z0],
      [1, 1, z1],
      [0, 1, z1],
    ],
    // +Z (top)
    [
      [0, 0, z1],
      [1, 0, z1],
      [1, 1, z1],
      [0, 1, z1],
    ],
  ];
}

function CubeSolidFaces({
  zOffset,
  project,
}: {
  zOffset: number;
  project: (x: number, y: number, z: number) => Point;
}) {
  return (
    <>
      {cubeSolidFaces(zOffset).map((corners, i) => {
        const points = corners.map(([x, y, z]) => {
          const p = project(x, y, z);
          return `${p.x},${p.y}`;
        });
        return <polygon key={i} points={points.join(" ")} />;
      })}
    </>
  );
}

const SLAB = {
  pad: 0.55,
  zTop: -0.22,
  zBottom: -0.42,
} as const;

/** Unit-cube xy footprint — opening cut from the slab where the cube sits. */
const CUBE_FOOTPRINT = {
  xMin: 0,
  xMax: 1,
  yMin: 0,
  yMax: 1,
} as const;

type Rect2 = { xMin: number; xMax: number; yMin: number; yMax: number };

/** Outer face perimeter with rectangular hole (frame only). */
function faceFrameWithCutout(z: number, outer: Rect2, hole: Rect2): Line3[] {
  const lines: Line3[] = [];
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

/** Inner rim + vertical walls of the through-cut under the cube. */
function slabCutoutWalls(zTop: number, zBottom: number, hole: Rect2): Line3[] {
  const { xMin, xMax, yMin, yMax } = hole;
  const top: Line3[] = [
    [xMin, yMin, zTop, xMax, yMin, zTop],
    [xMax, yMin, zTop, xMax, yMax, zTop],
    [xMax, yMax, zTop, xMin, yMax, zTop],
    [xMin, yMax, zTop, xMin, yMin, zTop],
  ];
  const bottom: Line3[] = [
    [xMin, yMin, zBottom, xMax, yMin, zBottom],
    [xMax, yMin, zBottom, xMax, yMax, zBottom],
    [xMax, yMax, zBottom, xMin, yMax, zBottom],
    [xMin, yMax, zBottom, xMin, yMin, zBottom],
  ];
  const walls: Line3[] = [
    [xMin, yMin, zTop, xMin, yMin, zBottom],
    [xMax, yMin, zTop, xMax, yMin, zBottom],
    [xMax, yMax, zTop, xMax, yMax, zBottom],
    [xMin, yMax, zTop, xMin, yMax, zBottom],
  ];
  return [...top, ...bottom, ...walls];
}

/** Thin 3D slab under the cube — cutout under cube footprint. */
function groundSlabOutline(): Line3[] {
  const { pad, zTop, zBottom } = SLAB;
  const outer: Rect2 = {
    xMin: -pad,
    xMax: 1 + pad,
    yMin: -pad,
    yMax: 1 + pad,
  };

  const sides: Line3[] = [
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

const PILLAR = {
  halfSize: 0.11,
  gapBelowSlab: 0.85,
  height: 1.02,
  edgeInset: 0.28,
} as const;

function slabPillarPositions(): { ox: number; oy: number }[] {
  const pad = SLAB.pad;
  const inset = PILLAR.edgeInset;
  const xMin = -pad;
  const xMax = 1 + pad;
  const yMin = -pad;
  const yMax = 1 + pad;

  // Opposite slab corners — left/right tips in isometric view (min/max x−y).
  return [
    { ox: xMin + inset, oy: yMax - inset },
    { ox: xMax - inset, oy: yMin + inset },
  ];
}

/** Axis-aligned box wireframe centered on (ox, oy). */
function boxWireframe(ox: number, oy: number, half: number, zTop: number, zBottom: number): Line3[] {
  const x0 = ox - half;
  const x1 = ox + half;
  const y0 = oy - half;
  const y1 = oy + half;

  const top: Line3[] = [
    [x0, y0, zTop, x1, y0, zTop],
    [x1, y0, zTop, x1, y1, zTop],
    [x1, y1, zTop, x0, y1, zTop],
    [x0, y1, zTop, x0, y0, zTop],
  ];
  const bottom: Line3[] = [
    [x0, y0, zBottom, x1, y0, zBottom],
    [x1, y0, zBottom, x1, y1, zBottom],
    [x1, y1, zBottom, x0, y1, zBottom],
    [x0, y1, zBottom, x0, y0, zBottom],
  ];
  const walls: Line3[] = [
    [x0, y0, zTop, x0, y0, zBottom],
    [x1, y0, zTop, x1, y0, zBottom],
    [x1, y1, zTop, x1, y1, zBottom],
    [x0, y1, zTop, x0, y1, zBottom],
  ];

  return [...top, ...bottom, ...walls];
}

function pillarTopZ(): number {
  return SLAB.zBottom - PILLAR.gapBelowSlab;
}

function slabPillarLinesAt(ox: number, oy: number): Line3[] {
  const zTop = pillarTopZ();
  const zBottom = zTop - PILLAR.height;
  return boxWireframe(ox, oy, PILLAR.halfSize, zTop, zBottom);
}

function pillarOrigin(ox: number, oy: number, size: number, cx: number, cy: number): Point {
  const zTop = pillarTopZ();
  const zBottom = zTop - PILLAR.height;
  const zMid = (zTop + zBottom) / 2;
  return isoProject(ox, oy, zMid, size, cx, cy);
}

function slabOrigin(size: number, cx: number, cy: number): Point {
  const zMid = (SLAB.zTop + SLAB.zBottom) / 2;
  return isoProject(0.5, 0.5, zMid, size, cx, cy);
}

function IllustrationShapeGroup({
  origin,
  compactY,
  delay,
  className,
  reduceMotion,
  children,
}: {
  origin: Point;
  compactY: number;
  delay: number;
  className?: string;
  reduceMotion: boolean;
  children: ReactNode;
}) {
  const compactOffsetY = compactY - origin.y;

  return (
    <motion.g
      className={className}
      initial={reduceMotion ? false : { y: compactOffsetY }}
      animate={{ y: 0 }}
      transition={{
        ...ILLUSTRATION_SPRING,
        delay: reduceMotion ? 0 : delay,
      }}
    >
      {children}
    </motion.g>
  );
}

function DottedLines({
  lines,
  project,
}: {
  lines: Line3[];
  project: (x: number, y: number, z: number) => Point;
}) {
  return (
    <>
      {lines.map(([x1, y1, z1, x2, y2, z2]) => {
        const a = project(x1, y1, z1);
        const b = project(x2, y2, z2);
        return (
          <line
            key={`${x1}${y1}${z1}-${x2}${y2}${z2}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
          />
        );
      })}
    </>
  );
}

type IsoDottedCubeProps = {
  size?: number;
  divisions?: number;
  className?: string;
};

/** Wireframe isometric cube on a 3D ground slab — pure SVG. */
export function IsoDottedCube({ size = 32, divisions = 5, className }: IsoDottedCubeProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const cx = 100;
  const cy = 84;
  const cubeZOffset = 0.55;
  const project = (x: number, y: number, z: number) => isoProject(x, y, z, size, cx, cy);
  const cubeOrigin = project(0.5, 0.5, cubeZOffset + 0.5);
  const planeOrigin = slabOrigin(size, cx, cy);
  const pillars = slabPillarPositions();
  const pillarOrigins = pillars.map(({ ox, oy }) => pillarOrigin(ox, oy, size, cx, cy));
  const pillarsOrigin = {
    x: pillarOrigins.reduce((sum, point) => sum + point.x, 0) / pillarOrigins.length,
    y: pillarOrigins.reduce((sum, point) => sum + point.y, 0) / pillarOrigins.length,
  };
  const compactY = (cubeOrigin.y + planeOrigin.y + pillarsOrigin.y) / 3;

  return (
    <svg
      viewBox="0 0 200 378"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="0.625"
      strokeDasharray="1 2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <IllustrationShapeGroup
        origin={pillarsOrigin}
        compactY={compactY}
        delay={0}
        reduceMotion={reduceMotion}
      >
        {pillars.map(({ ox, oy }) => (
          <g key={`pillar-${ox}-${oy}`} className="landing-hero__cylinder">
            <DottedLines lines={slabPillarLinesAt(ox, oy)} project={project} />
          </g>
        ))}
      </IllustrationShapeGroup>
      <IllustrationShapeGroup
        className="landing-hero__plane"
        origin={planeOrigin}
        compactY={compactY}
        delay={ILLUSTRATION_STAGGER}
        reduceMotion={reduceMotion}
      >
        <DottedLines lines={groundSlabOutline()} project={project} />
      </IllustrationShapeGroup>
      <IllustrationShapeGroup
        className="landing-hero__cube"
        origin={cubeOrigin}
        compactY={compactY}
        delay={ILLUSTRATION_STAGGER * 2}
        reduceMotion={reduceMotion}
      >
        <g className="landing-hero__cube-fill">
          <CubeSolidFaces zOffset={cubeZOffset} project={project} />
        </g>
        <g className="landing-hero__cube-mesh">
          <DottedLines lines={cubeGridLines(divisions, cubeZOffset)} project={project} />
        </g>
      </IllustrationShapeGroup>
    </svg>
  );
}
