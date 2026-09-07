import { useEffect, useState } from "react";
import { useReducedMotion } from "./landingShader";
import { EnforceAuditIllustration } from "./EnforceAuditIllustration";
import { RouteTrafficIllustration } from "./RouteTrafficIllustration";
import { SetPolicyIllustration } from "./SetPolicyIllustration";
import "./enforce-audit-illus.css";
import "./route-traffic-illus.css";

const STEPS = [
  {
    verb: "routes",
    rest: "every agent call through one proxy,",
    subtitle: "01 · Route traffic",
    sentence:
      "Point agents at Shotoku's proxy. Every provider call — models, tools, payments — goes through Cappr.",
  },
  {
    verb: "sets",
    rest: "budgets and approval rules per fleet, and",
    subtitle: "02 · Set policy",
    sentence:
      "Budgets, allowlists, and approval thresholds per agent or fleet. Start in observe-only; ratchet when ready.",
  },
  {
    verb: "enforces",
    rest: "spend with a full audit trail.",
    subtitle: "03 · Enforce & audit",
    sentence:
      "Spend over threshold lands in your inbox. Approve or deny — every decision recorded.",
  },
] as const;

const CYCLE_MS = 2800;

export function LandingProcessSection() {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % STEPS.length);
    }, CYCLE_MS);

    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <section id="how-it-works" className="landing-process landing-grid" aria-label="How Cappr works">
      <div className="landing-grid__gutter" aria-hidden />
      <div className="landing-process__frame">
        <div className="landing-process__lines">
          {STEPS.map((step, index) => {
            const isActive = reduceMotion || activeIndex === index;

            return (
              <p
                key={step.verb}
                className={`landing-process__line${isActive ? " landing-process__line--active" : ""}`}
              >
                {index === 0 ? (
                  <>
                    Cappr <span className="landing-process__verb">{step.verb}</span> {step.rest}
                  </>
                ) : (
                  <>
                    <span className="landing-process__verb">{step.verb}</span> {step.rest}
                  </>
                )}
              </p>
            );
          })}
        </div>

        <div className="landing-process__cards">
          {STEPS.map((step, index) => {
            const isActive = reduceMotion || activeIndex === index;

            return (
              <article
                key={step.subtitle}
                className={`landing-process__card${isActive ? " landing-process__card--active" : ""}`}
              >
                <p className="landing-process__card-subtitle">{step.subtitle}</p>
                <p className="landing-process__card-sentence">
                  {index === 0 ? (
                    <>
                      Point agents at{" "}
                      <a
                        href="https://shotoku.dev"
                        className="landing-process__shotoku-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Shotoku
                      </a>
                      &apos;s proxy. Every provider call — models, tools, payments — goes through Cappr.
                    </>
                  ) : (
                    step.sentence
                  )}
                </p>
                <div className="landing-process__illus-wrap" aria-hidden={!isActive}>
                  <div className="landing-process__illus">
                    {index === 0 ? (
                      <RouteTrafficIllustration />
                    ) : index === 1 ? (
                      <SetPolicyIllustration />
                    ) : index === 2 ? (
                      <EnforceAuditIllustration />
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div className="landing-grid__gutter" aria-hidden />
    </section>
  );
}
