import { IconArrowRight } from "@tabler/icons-react";
import { BorderBeam } from "border-beam";

export const EARLY_ACCESS_HREF = "#early-access";

const CTA_ARROW_SIZE = 14;

type LandingCtasProps = {
  className?: string;
};

export function LandingCtas({ className }: LandingCtasProps) {
  return (
    <div className={["landing-ctas", className].filter(Boolean).join(" ")}>
      <BorderBeam
        size="sm"
        colorVariant="ocean"
        theme="dark"
        strength={0.65}
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
