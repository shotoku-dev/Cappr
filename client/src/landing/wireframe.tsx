import type { CSSProperties, ReactNode } from "react";

/** Wireframe primitives — structure only, no product design. */

export function Section({
  id,
  label,
  children,
  fullBleed,
}: {
  id: string;
  label: string;
  children: ReactNode;
  fullBleed?: boolean;
}) {
  return (
    <section
      id={id}
      data-section={id}
      className="wf-section"
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
}: {
  label?: string;
  children?: ReactNode;
  height?: number | string;
  minHeight?: number | string;
  className?: string;
}) {
  return (
    <div
      className={["wf-block", className].filter(Boolean).join(" ")}
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
  variant?: "eyebrow" | "h1" | "h2" | "h3" | "body" | "caption";
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
}: {
  label: string;
  aspect?: string;
  tall?: boolean;
}) {
  return (
    <div
      className="wf-placeholder"
      data-aspect={aspect}
      style={tall ? { minHeight: 420 } : undefined}
    >
      {label}
    </div>
  );
}
