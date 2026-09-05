import { useEffect, useState } from "react";

export const LANDING_DITHER = {
  shape: "warp" as const,
  type: "4x4" as const,
  size: 2.5,
  scale: 1.1,
  fit: "cover" as const,
  offsetX: -0.1,
  offsetY: 0.12,
  speed: 0.55,
} as const;

export const LANDING_SHADER_FALLBACK = {
  back: "#f9f9fa",
  front: "#3E92CC",
} as const;

function readShaderHex(root: Element, variable: string, fallback: string): string {
  const value = getComputedStyle(root).getPropertyValue(variable).trim();
  return value.startsWith("#") ? value : fallback;
}

export function useLandingShaderColors() {
  const [colors, setColors] = useState<{ back: string; front: string }>(LANDING_SHADER_FALLBACK);

  useEffect(() => {
    const read = () => {
      const root = document.querySelector(".landing-page");
      if (!root) return;
      setColors({
        back: readShaderHex(root, "--landing-shader-back", LANDING_SHADER_FALLBACK.back),
        front: readShaderHex(root, "--landing-shader-front", LANDING_SHADER_FALLBACK.front),
      });
    };

    read();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);

  return colors;
}

export function useReducedMotion() {
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
