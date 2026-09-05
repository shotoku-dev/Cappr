import { Dithering } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";

/** Landing gutters — white field, accent ink, warp dither. Shader API expects hex. */
const COLOR_BACK = "#ffffff";
const COLOR_FRONT = "#3E92CC";

const DITHER = {
  shape: "warp" as const,
  type: "4x4" as const,
  size: 2.5,
  scale: 1.1,
  fit: "cover" as const,
};

type DitherGutterProps = {
  mirror?: boolean;
  variant?: "side" | "band";
  className?: string;
};

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduce;
}

export function DitherGutter({ mirror, variant = "side", className }: DitherGutterProps) {
  const reduceMotion = useReducedMotion();
  const isBand = variant === "band";

  return (
    <div
      className={["landing-dither-gutter", mirror && "landing-dither-gutter--mirror", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <Dithering
        width="100%"
        height="100%"
        colorBack={COLOR_BACK}
        colorFront={COLOR_FRONT}
        shape={DITHER.shape}
        type={DITHER.type}
        size={DITHER.size}
        scale={DITHER.scale}
        fit={DITHER.fit}
        offsetX={isBand ? 0 : -0.1}
        offsetY={isBand ? 0 : 0.12}
        speed={reduceMotion ? 0 : 0.55}
      />
    </div>
  );
}
