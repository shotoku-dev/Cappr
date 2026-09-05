import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BorderBeam } from "border-beam";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  EnforcementTierIllustration,
  type EnforcementTierId,
} from "./EnforcementTierIllustration";
import "./enforcement-tier-illus.css";

const TIER_LABELS: Record<EnforcementTierId, string> = {
  observe: "See what would happen. Change nothing.",
  nudge: "Warn the agent and its owner.",
  approve: "Pause for a human.",
  block: "Hard stop at the proxy.",
};

const TIER_HINTS: Record<EnforcementTierId, string> = {
  observe:
    "Shadow mode evaluates every call against policy without blocking. Calibrate before you enforce.",
  nudge: "Surface over-budget attempts without stopping the workflow. Signal before spend compounds.",
  approve: "High-value actions land in Cappr's inbox. Nothing proceeds until someone decides.",
  block: "The gateway refuses the call. The agent cannot reach the provider — regardless of its code.",
};

const TIERS = (["observe", "nudge", "approve", "block"] as const).map((id) => ({
  id,
  label: TIER_LABELS[id],
  hint: TIER_HINTS[id],
}));

/** Matches --resize-ease / --landing-ease-out */
const STORY_EASE = [0.22, 1, 0.36, 1] as const;
const ILLUS_RESIZE_DUR = 0.4;
const ILLUS_RADIUS = 6; // --radius-md
/** Log + stamp — slightly taller than 4/3. */
const ILLUS_ASPECT = 9 / 8;

function TierIllusPanel({
  tier,
  reduceMotion,
  tierDemo,
}: {
  tier: EnforcementTierId;
  reduceMotion: boolean | null;
  tierDemo?: {
    reduceMotion: boolean;
    playKey: string | number;
    onStampVisibleChange?: (visible: boolean) => void;
    onDemoComplete?: () => void;
  };
}) {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={tier}
        className="landing-enforcement__illus-panel"
        style={{ zIndex: 1 }}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={
          reduceMotion ? undefined : { opacity: 1, transition: { duration: 0 } }
        }
        transition={{ duration: 0.28, ease: STORY_EASE }}
      >
        <EnforcementTierIllustration tier={tier} tierDemo={tierDemo} />
      </motion.div>
    </AnimatePresence>
  );
}

export function LandingEnforcementSection() {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const goToTier = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const activeTier = TIERS[activeIndex];

  const handleTierDemoComplete = useCallback(() => {
    setActiveIndex((index) => (index + 1) % TIERS.length);
  }, []);

  const tierDemo = {
    reduceMotion: !!reduceMotion,
    playKey: activeIndex,
    onDemoComplete: handleTierDemoComplete,
  };

  const illusAspect = ILLUS_ASPECT;

  const prevAspectRef = useRef(illusAspect);
  const aspectIsChanging = prevAspectRef.current !== illusAspect;
  useEffect(() => {
    prevAspectRef.current = illusAspect;
  }, [illusAspect]);

  const illus = (
    <motion.div
      className="landing-enforcement__illus"
      animate={{ aspectRatio: illusAspect }}
      transition={
        reduceMotion || !aspectIsChanging
          ? { duration: 0 }
          : { duration: ILLUS_RESIZE_DUR, ease: STORY_EASE }
      }
    >
      <TierIllusPanel
        tier={activeTier.id}
        reduceMotion={reduceMotion}
        tierDemo={tierDemo}
      />
    </motion.div>
  );

  return (
    <section
      id="enforcement-ladder"
      className="landing-enforcement landing-grid"
      aria-labelledby="landing-enforcement-title"
    >
      <div className="landing-grid__gutter" aria-hidden />
      <div className="landing-enforcement__frame">
        <header className="landing-enforcement__header">
          <h2 id="landing-enforcement-title" className="landing-enforcement__title">
            Start in shadow mode.
            <br />
            Turn the dial when you&apos;re ready.
          </h2>
          <p className="landing-enforcement__lead">
            Most teams can&apos;t flip to hard blocks on day one. Cappr ratchets from observe → nudge →
            approve → block against real traffic.
          </p>
        </header>

        <div className="landing-enforcement__body">
          <div className="landing-enforcement__aside">
            <div
              id="shadow-mode"
              className="landing-enforcement__illus-wrap"
              aria-live="polite"
              aria-atomic="true"
            >
              <BorderBeam
                className="landing-enforcement__illus-beam"
                size="pulse-inner"
                colorVariant="ocean"
                theme="auto"
                strength={0.65}
                borderRadius={ILLUS_RADIUS}
              >
                {illus}
              </BorderBeam>
            </div>
          </div>

          <ol className="landing-enforcement__ladder" aria-label="Enforcement ladder">
            {TIERS.map((tier, index) => {
              const isActive = activeIndex === index;

              return (
                <li key={tier.id} className="landing-enforcement__ladder-item">
                  <button
                    type="button"
                    className={[
                      "landing-enforcement__tier",
                      isActive && "landing-enforcement__tier--active",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => goToTier(index)}
                    aria-expanded={isActive}
                    aria-pressed={isActive}
                  >
                    <span className="landing-enforcement__name">{tier.label}</span>
                    <span
                      className="landing-enforcement__tier-details"
                      aria-hidden={!isActive}
                    >
                      <span className="landing-enforcement__tier-details-inner">
                        <span className="landing-enforcement__hint">{tier.hint}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <div className="landing-grid__gutter" aria-hidden />
    </section>
  );
}
