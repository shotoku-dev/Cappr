import { Dithering } from "@paper-design/shaders-react";
import { LANDING_DITHER, useLandingShaderColors, useReducedMotion } from "./landingShader";

/** One shader canvas — hero side gutters + section band share a single non-symmetric field. */
export function LandingDitherField() {
  const reduceMotion = useReducedMotion();
  const { back, front } = useLandingShaderColors();

  return (
    <div className="landing-dither-sync__shader" aria-hidden>
      <Dithering
        width="100%"
        height="100%"
        colorBack={back}
        colorFront={front}
        shape={LANDING_DITHER.shape}
        type={LANDING_DITHER.type}
        size={LANDING_DITHER.size}
        scale={LANDING_DITHER.scale}
        fit={LANDING_DITHER.fit}
        offsetX={LANDING_DITHER.offsetX}
        offsetY={LANDING_DITHER.offsetY}
        speed={reduceMotion ? 0 : LANDING_DITHER.speed}
      />
    </div>
  );
}
