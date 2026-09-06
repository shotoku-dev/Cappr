import { IconArrowRight } from "@tabler/icons-react";
import { BorderBeam } from "border-beam";
import { useSyncExternalStore } from "react";

export const EARLY_ACCESS_HREF = "#early-access";

const CTA_ARROW_SIZE = 14;

function subscribeLightScheme(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getLightSchemeSnapshot() {
  return window.matchMedia("(prefers-color-scheme: light)").matches;
}

function getLightSchemeServerSnapshot() {
  return false;
}

type LandingCtasProps = {
  className?: string;
};

export function LandingCtas({ className }: LandingCtasProps) {
  const isLight = useSyncExternalStore(
    subscribeLightScheme,
    getLightSchemeSnapshot,
    getLightSchemeServerSnapshot,
  );

  return (
    <div className={["landing-ctas", className].filter(Boolean).join(" ")}>
      <BorderBeam
        size="sm"
        colorVariant="ocean"
        theme="auto"
        strength={isLight ? 1 : 0.65}
        duration={2.8}
        borderRadius={6}
      >
        <a href={EARLY_ACCESS_HREF} className="landing-cta landing-cta--primary">
          Get early access
          <IconArrowRight
            size={CTA_ARROW_SIZE}
            stroke={1.75}
            aria-hidden
            className="landing-cta__arrow"
          />
        </a>
      </BorderBeam>
    </div>
  );
}
