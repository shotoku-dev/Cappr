import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import SingleAgentIcon from "../assets/icons/Single Agent Icon.svg?react";

const AGENT_ICON_SIZE = 22;
const STEP_INTERVAL_MS = 4500;
const STORY_EASE = [0.22, 1, 0.36, 1] as const;

type BillingField = {
  key: string;
  value: string;
  missing?: boolean;
};

type StoryStep = {
  id: string;
  time: string;
  terminal: ReactNode;
  billing: {
    explanation: string;
    metric?: { value: string; delta: string };
    fields?: BillingField[];
  };
};

const AGENT_NAME = "atlas-researcher";

const STORY_STEPS: StoryStep[] = [
  {
    id: "02:14",
    time: "02:14",
    terminal: (
      <>
        Rate limit on <strong>embeddings batch #12</strong>. Agent retries immediately — no backoff
        configured.
      </>
    ),
    billing: {
      explanation: "Spend is climbing in the provider total. Billing doesn't show retries or which agent fired them.",
      metric: { value: "—", delta: "Provider total · no agent breakdown" },
    },
  },
  {
    id: "02:17",
    time: "02:17",
    terminal: (
      <>
        Retry <strong>#47</strong>. Cumulative spend <strong>€124</strong>. SDK{" "}
        <code>authorize()</code> not in this code path.
      </>
    ),
    billing: {
      explanation: "The total keeps rising, but there's still no line item for atlas-researcher.",
      metric: { value: "—", delta: "Provider total · agent unattributed" },
      fields: [{ key: "Agent", value: "—", missing: true }],
    },
  },
  {
    id: "04:52",
    time: "04:52",
    terminal: (
      <>
        Retry <strong>#412</strong>. Cumulative spend <strong>€2,400</strong>. No policy evaluated. No
        human notified.
      </>
    ),
    billing: {
      explanation: "No policy outcome or approver on record — billing can't show what rule failed or who should have been pinged.",
      metric: { value: "—", delta: "Provider total · no enforcement context" },
      fields: [
        { key: "Agent", value: "—", missing: true },
        { key: "Policy outcome", value: "—", missing: true },
        { key: "Human decision", value: "—", missing: true },
      ],
    },
  },
  {
    id: "07:30",
    time: "07:30",
    terminal: (
      <>
        Finance opens billing dashboard: <strong>€4,280 API spend ↑340%</strong>. No agent ID. No
        workflow. No approver on record.
      </>
    ),
    billing: {
      explanation: "Finance sees the spike on the bill — not which agent ran it up, which rule should have stopped it, or who approved the exception.",
      metric: { value: "€4,280", delta: "↑ 340% vs. 7-day avg · provider total" },
      fields: [
        { key: "Broken down by", value: "—", missing: true },
        { key: "Agent", value: "—", missing: true },
        { key: "Policy outcome", value: "—", missing: true },
        { key: "Human decision", value: "—", missing: true },
      ],
    },
  },
];

function BillingPanel({ step }: { step: StoryStep }) {
  return (
    <div className="landing-incident-story__billing-inner">
      <p className="landing-incident-story__billing-heading">What billing shows</p>
      <p className="landing-incident-story__billing-explanation">{step.billing.explanation}</p>
      {step.billing.metric && (
        <div className="landing-incident-story__metric">
          <span className="landing-incident-story__metric-value">{step.billing.metric.value}</span>
          <span className="landing-incident-story__metric-delta">{step.billing.metric.delta}</span>
        </div>
      )}
      {step.billing.fields && step.billing.fields.length > 0 && (
        <ul className="landing-incident-story__fields">
          {step.billing.fields.map((field) => (
            <li key={field.key} className="landing-incident-story__field">
              <span className="landing-incident-story__field-key">{field.key}</span>
              <span
                className={[
                  "landing-incident-story__field-val",
                  field.missing && "landing-incident-story__field-val--missing",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {field.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Terminal log + billing panel — one window, synced highlights. */
export function LandingIncidentStory() {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeStep = STORY_STEPS[activeIndex];

  const goToStep = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    if (reduceMotion || paused) return;
    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % STORY_STEPS.length);
    }, STEP_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, paused]);

  return (
    <figure
      className="landing-incident-story"
      aria-label="Incident log and billing view"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="landing-incident-story__chrome">
        <div className="landing-incident-story__traffic" aria-hidden>
          <span className="landing-incident-story__dot" />
          <span className="landing-incident-story__dot" />
          <span className="landing-incident-story__dot" />
        </div>
      </div>

      <div className="landing-incident-story__content">
        <div className="landing-incident-story__terminal">
          <div className="landing-incident-story__meta">
            <span className="landing-incident-story__agent">
              <SingleAgentIcon
                width={AGENT_ICON_SIZE}
                height={AGENT_ICON_SIZE}
                className="landing-incident-story__agent-icon"
                aria-hidden
              />
              <span>{AGENT_NAME}</span>
            </span>
          </div>

          <div className="landing-incident-story__log">
            {STORY_STEPS.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  className={[
                    "landing-incident-story__line",
                    isActive && "landing-incident-story__line--active",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => goToStep(index)}
                  aria-pressed={isActive}
                >
                  <time className="landing-incident-story__time">{step.time}</time>
                  <p className="landing-incident-story__text">{step.terminal}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="landing-incident-story__billing" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeStep.id}
              className="landing-incident-story__billing-panel"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: STORY_EASE }}
            >
              <BillingPanel step={activeStep} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </figure>
  );
}
