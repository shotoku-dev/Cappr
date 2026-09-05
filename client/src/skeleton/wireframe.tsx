import type { CSSProperties, ReactNode } from "react";

/** Wireframe primitives — structure and copy direction, not final visual design. */

export function Section({
  id,
  label,
  children,
  fullBleed,
  variant = "default",
}: {
  id: string;
  label: string;
  children: ReactNode;
  fullBleed?: boolean;
  variant?: "default" | "inset" | "accent";
}) {
  return (
    <section
      id={id}
      data-section={id}
      className={["wf-section", variant !== "default" && `wf-section--${variant}`].filter(Boolean).join(" ")}
      style={fullBleed ? { paddingInline: 0 } : undefined}
    >
      <div className="wf-section__label">{label}</div>
      <div className={fullBleed ? undefined : "wf-container"}>{children}</div>
    </section>
  );
}

export function Block({
  label,
  children,
  height,
  minHeight,
  className,
  span,
}: {
  label?: string;
  children?: ReactNode;
  height?: number | string;
  minHeight?: number | string;
  className?: string;
  span?: 1 | 2 | 3;
}) {
  return (
    <div
      className={["wf-block", span && `wf-block--span-${span}`, className].filter(Boolean).join(" ")}
      style={{ height, minHeight } as CSSProperties}
    >
      {label && <span className="wf-block__label">{label}</span>}
      {children}
    </div>
  );
}

export function Row({
  label,
  children,
  cols = 1,
}: {
  label?: string;
  children: ReactNode;
  cols?: number;
}) {
  return (
    <div className="wf-row" data-cols={cols}>
      {label && <span className="wf-row__label">{label}</span>}
      {children}
    </div>
  );
}

export function Split({
  label,
  children,
  ratio = "1-1",
  reverse,
}: {
  label?: string;
  children: ReactNode;
  ratio?: "1-1" | "3-2" | "2-3" | "5-7";
  reverse?: boolean;
}) {
  return (
    <div
      className={["wf-split", reverse && "wf-split--reverse"].filter(Boolean).join(" ")}
      data-ratio={ratio}
    >
      {label && <span className="wf-split__label">{label}</span>}
      {children}
    </div>
  );
}

export function SplitPane({ children }: { children: ReactNode }) {
  return <div className="wf-split__pane">{children}</div>;
}

export function Bento({
  label,
  children,
  cols = 3,
}: {
  label?: string;
  children: ReactNode;
  cols?: 2 | 3;
}) {
  return (
    <div className="wf-bento" data-cols={cols}>
      {label && <span className="wf-bento__label">{label}</span>}
      {children}
    </div>
  );
}

export function Ladder({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="wf-ladder">
      {label && <span className="wf-ladder__label">{label}</span>}
      {children}
    </div>
  );
}

export function LadderStep({
  tier,
  title,
  body,
  scenario,
  active,
}: {
  tier: string;
  title: string;
  body: string;
  scenario: string;
  active?: boolean;
}) {
  return (
    <div className={["wf-ladder__step", active && "wf-ladder__step--active"].filter(Boolean).join(" ")}>
      <div className="wf-ladder__tier">{tier}</div>
      <div className="wf-ladder__content">
        <strong className="wf-ladder__title">{title}</strong>
        <p className="wf-text wf-text--body">{body}</p>
        <p className="wf-ladder__scenario">{scenario}</p>
      </div>
    </div>
  );
}

export function Callout({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="wf-callout">
      {label && <span className="wf-callout__label">{label}</span>}
      {children}
    </div>
  );
}

export function Col({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="wf-col">
      {label && <span className="wf-col__label">{label}</span>}
      {children}
    </div>
  );
}

export function Text({
  as: Tag = "p",
  variant = "body",
  children,
  style,
  className,
}: {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  variant?: "eyebrow" | "h1" | "h2" | "h3" | "body" | "caption" | "lead";
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <Tag className={["wf-text", `wf-text--${variant}`, className].filter(Boolean).join(" ")} style={style}>
      {children}
    </Tag>
  );
}

export function Placeholder({
  label,
  aspect = "16/9",
  tall,
  compact,
}: {
  label: string;
  aspect?: string;
  tall?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={["wf-placeholder", compact && "wf-placeholder--compact"].filter(Boolean).join(" ")}
      data-aspect={aspect}
      style={tall ? { minHeight: 420 } : compact ? { minHeight: 80 } : undefined}
    >
      {label}
    </div>
  );
}

export function Diagram({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="wf-diagram">
      <span className="wf-diagram__label">{label}</span>
      <div className="wf-diagram__body">{children}</div>
    </div>
  );
}

export function FlowNode({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "gate" | "danger" }) {
  return <div className={`wf-flow-node wf-flow-node--${variant}`}>{children}</div>;
}

export function FlowArrow() {
  return <div className="wf-flow-arrow" aria-hidden>→</div>;
}

/** Incident-style dossier with timeline events. */
export function IncidentDossier({
  label,
  meta,
  children,
  status,
}: {
  label?: string;
  meta: { agent: string; window: string };
  children: ReactNode;
  status?: "runaway" | "bypass" | "gap";
}) {
  return (
    <div className={["wf-incident", status && `wf-incident--${status}`].filter(Boolean).join(" ")}>
      {label && <span className="wf-incident__label">{label}</span>}
      <div className="wf-incident__header">
        <div className="wf-incident__meta">
          <span className="wf-incident__agent">{meta.agent}</span>
          <span className="wf-incident__window">{meta.window}</span>
        </div>
        {status && <span className="wf-incident__status">{status}</span>}
      </div>
      <div className="wf-incident__timeline">{children}</div>
    </div>
  );
}

export function IncidentEvent({
  time,
  children,
  severity = "default",
}: {
  time: string;
  children: ReactNode;
  severity?: "default" | "warn" | "critical";
}) {
  return (
    <div className={["wf-incident__event", `wf-incident__event--${severity}`].join(" ")}>
      <time className="wf-incident__time">{time}</time>
      <div className="wf-incident__detail">{children}</div>
    </div>
  );
}

/** Side-by-side: what you see vs what actually happened. */
export function Contrast({
  label,
  left,
  right,
}: {
  label?: string;
  left: { heading: string; children: ReactNode };
  right: { heading: string; children: ReactNode };
}) {
  return (
    <div className="wf-contrast">
      {label && <span className="wf-contrast__label">{label}</span>}
      <div className="wf-contrast__panel wf-contrast__panel--dim">
        <span className="wf-contrast__heading">{left.heading}</span>
        {left.children}
      </div>
      <div className="wf-contrast__divider" aria-hidden>
        vs
      </div>
      <div className="wf-contrast__panel wf-contrast__panel--sharp">
        <span className="wf-contrast__heading">{right.heading}</span>
        {right.children}
      </div>
    </div>
  );
}

/** Numbered fracture strip — systemic gaps, not equal cards. */
export function FractureStrip({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="wf-fracture-strip">
      {label && <span className="wf-fracture-strip__label">{label}</span>}
      <div className="wf-fracture-strip__track">{children}</div>
    </div>
  );
}

export function Fracture({
  index,
  title,
  hook,
  detail,
}: {
  index: string;
  title: string;
  hook: string;
  detail: string;
}) {
  return (
    <div className="wf-fracture">
      <span className="wf-fracture__index">{index}</span>
      <div className="wf-fracture__body">
        <strong className="wf-fracture__title">{title}</strong>
        <p className="wf-fracture__hook">{hook}</p>
        <p className="wf-fracture__detail">{detail}</p>
      </div>
    </div>
  );
}
