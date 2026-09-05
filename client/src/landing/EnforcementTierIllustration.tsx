import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BorderBeam } from "border-beam";
import {
  IconArrowRight,
  IconBellRinging,
  IconClockPause,
  IconCornerDownRight,
  IconEye,
  IconShieldX,
} from "@tabler/icons-react";
import SingleAgentIcon from "../assets/icons/Single Agent Icon.svg?react";
import { shortName } from "../app/overview/agents";
import "./enforcement-tier-illus.css";

export type EnforcementTierId = "observe" | "nudge" | "approve" | "block";

export type TierDemoProps = {
  reduceMotion: boolean;
  /** Bump when tier becomes active to restart the sequence. */
  playKey: string | number;
  onStampVisibleChange?: (visible: boolean) => void;
  onDemoComplete?: () => void;
};

/** @deprecated Use TierDemoProps */
export type ObserveDemoProps = TierDemoProps;

const AGENT_ID = "atlas-researcher";
const OWNER = { name: "Yusuf Adeyemi", color: "var(--color-green-500)" } as const;
const AMOUNT = "€512.00";
const ACTION = "embeddings batch #47";

const AGENT_ICON_SIZE = 16;
const EYE_BEACON_SIZE = 22;

/** Matches --resize-ease / --landing-ease-out */
const STORY_EASE = [0.22, 1, 0.36, 1] as const;
const META_ENTER_DUR = 0.28;
const SCAN_MOVE_DUR = 0.78;
const SCAN_MOVE_EASE = [0.77, 0, 0.175, 1] as const;
const BEACON_ENTER_DUR = 0.28;
const STAMP_ENTER_DUR = 0.28;
const BRANCH_ENTER_DUR = 0.36;
const BRANCH_STAGGER = 0.12;
/** Height expand before branch labels fade in. */
const BRANCH_EXPAND_DUR = 0.48;
/** Wait for the notify/eye icon to finish entering before expanding for branches. */
const BRANCH_AFTER_ICON_MS = 520;

const WATCHED_INDEX = 3;
const LAST_INDEX = 5;

const SHAKE_DUR = 0.42;

/** One-shot observe demo — land on dispatch → wait → shake → eye → finish. */
const OBSERVE_CYCLE = {
  scan0: 400,
  scan1: 1500,
  scan2: 2600,
  /** Highlight starts moving onto Dispatch. */
  scan3: 3700,
  /**
   * Pause after the scan settles (scan3 + SCAN_MOVE_DUR + beat), then shake.
   * 3700 + 780 + 650 ≈ 5130
   */
  shake: 5130,
  /** Eye + stamp after shake finishes: 5130 + 420. */
  blue: 5550,
  /** Leave the blue beat by moving to the next line (color changes during the move). */
  scan4: 7350,
  scan5: 8450,
  complete: 9550,
} as const;

/** One-shot nudge demo — land on dispatch → wait → shake → notify + stamp → finish.
 * Land → shake → blue offsets match observe (settle + beat, then SHAKE_DUR). */
const NUDGE_WATCHED_INDEX = 2;
const NUDGE_LAST_INDEX = 3;
const NUDGE_CYCLE = {
  scan0: 400,
  scan1: 1500,
  /** Highlight starts moving onto Dispatch. */
  scan2: 2600,
  /** 2600 + 780 + 650 — same settle+beat as observe after land. */
  shake: 4030,
  /** 4030 + 420 — blue + notify after shake, matching observe. */
  notify: 4450,
  /** After icon settles — expand the row for branch labels. */
  branches: 4450 + BRANCH_AFTER_ICON_MS,
  /** Leave after expand + label reveal have settled. */
  scan3: 7200,
  complete: 8800,
} as const;

/** One-shot approve demo — halt on dispatch with approve/deny prompt.
 * Land → shake → blue offsets match observe. */
const APPROVE_WATCHED_INDEX = 2;
const APPROVE_SHAKE_DUR = 0.58;
const APPROVE_CYCLE = {
  scan0: 400,
  scan1: 1500,
  scan2: 2600,
  /** Same land → shake gap as observe/nudge. */
  shake: 4030,
  /** Same shake → blue gap as observe (color flips with the notify). */
  notify: 4450,
  branches: 4450 + BRANCH_AFTER_ICON_MS,
  complete: 8600,
} as const;

/** One-shot block demo — land on dispatch, halt; later lines shown as skipped. */
const BLOCK_WATCHED_INDEX = 2;
const BLOCK_SHAKE_DUR = 0.58;
const BLOCK_CYCLE = {
  scan0: 400,
  scan1: 1500,
  scan2: 2600,
  shake: 4030,
  /** Same shake → blue gap as observe. */
  notify: 4450,
  branches: 4450 + BRANCH_AFTER_ICON_MS,
  skipped: 7200,
  complete: 9000,
} as const;

const AGENT_LINES = [
  {
    time: "13:58",
    text: "Policy check · daily budget €2,000 remaining",
    watched: false,
  },
  {
    time: "14:00",
    text: "Queued embeddings batch #47 · estimate €512",
    watched: false,
  },
  {
    time: "14:02",
    text: "Retry embeddings batch #46 — rate limit cleared",
    watched: false,
  },
  {
    time: "14:02",
    text: `Dispatch ${ACTION}`,
    watched: true,
  },
  {
    time: "14:02",
    text: "Shadow verdict logged (threshold exceeded)",
    watched: false,
  },
  {
    time: "14:03",
    text: `Provider ack · ${AMOUNT}`,
    watched: false,
  },
] as const;

function AgentPill({ live }: { live?: boolean }) {
  return (
    <div
      className={[
        "enforcement-tier-illus__agent-pill",
        live && "enforcement-tier-illus__agent-pill--live",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <SingleAgentIcon width={AGENT_ICON_SIZE} height={AGENT_ICON_SIZE} aria-hidden />
      <span>{AGENT_ID}</span>
    </div>
  );
}

type TierLogBranch = {
  id: string;
  content: ReactNode;
};

type TierLogEntry = {
  id: string;
  time: string;
  text: string;
  branches?: TierLogBranch[];
  watched?: boolean;
  skipped?: boolean;
};

function LogBranch({ children }: { children: ReactNode }) {
  return (
    <span className="enforcement-tier-illus__log-branch">
      <IconCornerDownRight
        size={12}
        stroke={1.75}
        className="enforcement-tier-illus__log-branch-arrow"
        aria-hidden
      />
      <span className="enforcement-tier-illus__log-branch-text">{children}</span>
    </span>
  );
}

/** Indented arrow rows — expand the row first, then fade labels in. */
function LogBranches({
  branches,
  show,
  reduceMotion,
}: {
  branches?: TierLogBranch[];
  show: boolean;
  reduceMotion: boolean;
}) {
  const [labelsVisible, setLabelsVisible] = useState(reduceMotion && show);

  useEffect(() => {
    if (!show) {
      setLabelsVisible(false);
      return;
    }
    if (reduceMotion) {
      setLabelsVisible(true);
      return;
    }
    setLabelsVisible(false);
    const id = window.setTimeout(
      () => setLabelsVisible(true),
      Math.round(BRANCH_EXPAND_DUR * 1000),
    );
    return () => window.clearTimeout(id);
  }, [show, reduceMotion]);

  if (!branches?.length || !show) return null;

  return (
    <motion.ul
      className="enforcement-tier-illus__log-branches"
      initial={reduceMotion ? false : { height: 0 }}
      animate={{ height: "auto" }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: BRANCH_EXPAND_DUR, ease: STORY_EASE }
      }
      style={{ overflow: "hidden" }}
    >
      {branches.map((branch, index) => (
        <motion.li
          key={branch.id}
          className="enforcement-tier-illus__log-branch-row"
          initial={false}
          animate={
            labelsVisible
              ? { opacity: 1, transform: "translateY(0px)" }
              : { opacity: 0, transform: "translateY(5px)" }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: BRANCH_ENTER_DUR,
                  delay: labelsVisible ? index * BRANCH_STAGGER : 0,
                  ease: STORY_EASE,
                }
          }
        >
          <LogBranch>{branch.content}</LogBranch>
        </motion.li>
      ))}
    </motion.ul>
  );
}

function ApproveDenyPrompt() {
  return (
    <span className="enforcement-tier-illus__decision">
      <span className="enforcement-tier-illus__decision-label">Decide</span>
      <span className="enforcement-tier-illus__decision-btn enforcement-tier-illus__decision-btn--approve">
        Approve
      </span>
      <span className="enforcement-tier-illus__decision-btn enforcement-tier-illus__decision-btn--deny">
        Deny
      </span>
    </span>
  );
}

function OwnerAvatar({ name, color }: { name: string; color: string }) {
  return (
    <span className="enforcement-tier-illus__owner">
      <span
        className="enforcement-tier-illus__owner-avatar"
        style={{ background: color }}
        aria-hidden
      >
        {name[0]}
      </span>
      <span>{shortName(name)}</span>
    </span>
  );
}

type TierStampTone = "default" | "warn" | "deny";

function TierStamp({
  icon,
  label,
  outcome,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  outcome: string;
  tone?: TierStampTone;
}) {
  return (
    <aside
      className={[
        "enforcement-tier-illus__stamp",
        tone !== "default" && `enforcement-tier-illus__stamp--${tone}`,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      {icon}
      <span>{label}</span>
      <IconArrowRight
        size={12}
        stroke={1.75}
        className="enforcement-tier-illus__stamp-arrow"
        aria-hidden
      />
      <strong>{outcome}</strong>
    </aside>
  );
}

function ShadowEyeBeacon() {
  return (
    <BorderBeam
      className="enforcement-tier-illus__eye-beam"
      size="sm"
      colorVariant="ocean"
      theme="auto"
      strength={0.65}
      duration={2.8}
      borderRadius={EYE_BEACON_SIZE}
    >
      <span className="enforcement-tier-illus__eye-beacon" aria-hidden>
        <IconEye size={13} stroke={1.75} />
      </span>
    </BorderBeam>
  );
}

function ObserveReveal({
  show,
  reduceMotion,
  duration,
  children,
  className,
}: {
  show: boolean;
  reduceMotion: boolean;
  duration: number;
  children: React.ReactNode;
  className?: string;
}) {
  if (!show) return null;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, transform: "translateY(4px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration, ease: STORY_EASE }}
    >
      {children}
    </motion.div>
  );
}

const NUDGE_ENTRIES: TierLogEntry[] = [
  { id: "policy", time: "13:58", text: "Policy check · daily budget €2,000 remaining" },
  { id: "queued", time: "14:00", text: "Queued embeddings batch #47 · estimate €512" },
  {
    id: "dispatch",
    time: "14:02",
    text: `Dispatch ${ACTION} · ${AMOUNT}`,
    watched: true,
    branches: [
      { id: "warning", content: "Agent warning delivered" },
      {
        id: "owner",
        content: (
          <>
            Owner notified · <OwnerAvatar name={OWNER.name} color={OWNER.color} />
          </>
        ),
      },
    ],
  },
  {
    id: "ack",
    time: "14:03",
    text: `Provider ack · ${AMOUNT}`,
  },
];

const APPROVE_ENTRIES: TierLogEntry[] = [
  { id: "policy", time: "13:58", text: "Policy check · daily budget €2,000 remaining" },
  { id: "queued", time: "14:00", text: "Queued embeddings batch #47 · estimate €512" },
  {
    id: "dispatch",
    time: "14:02",
    text: `Dispatch ${ACTION} · ${AMOUNT}`,
    watched: true,
    branches: [
      { id: "held", content: "Held at proxy" },
      {
        id: "approver",
        content: (
          <>
            Approver · <OwnerAvatar name={OWNER.name} color={OWNER.color} />
          </>
        ),
      },
      { id: "decision", content: <ApproveDenyPrompt /> },
    ],
  },
];

const BLOCK_ENTRIES: TierLogEntry[] = [
  { id: "policy", time: "13:58", text: "Policy check · daily budget €2,000 remaining" },
  { id: "queued", time: "14:00", text: "Queued embeddings batch #47 · estimate €512" },
  {
    id: "dispatch",
    time: "14:02",
    text: `Dispatch ${ACTION} · ${AMOUNT}`,
    watched: true,
    branches: [
      { id: "blocked", content: "Blocked at proxy" },
      {
        id: "owner",
        content: (
          <>
            Owner alerted · <OwnerAvatar name={OWNER.name} color={OWNER.color} />
          </>
        ),
      },
    ],
  },
  {
    id: "ack",
    time: "14:03",
    text: `Provider ack · ${AMOUNT}`,
    skipped: true,
  },
];

/** Progressive Shadow demo — scan tint moves down the log, then eye + stamp. */
function ObserveView({
  reduceMotion,
  playKey,
  onStampVisibleChange,
  onDemoComplete,
}: TierDemoProps) {
  const [showMeta, setShowMeta] = useState(reduceMotion);
  const [highlightIndex, setHighlightIndex] = useState(reduceMotion ? WATCHED_INDEX : -1);
  const [showEye, setShowEye] = useState(reduceMotion);
  const [showStamp, setShowStamp] = useState(reduceMotion);
  const [scanActive, setScanActive] = useState(false);
  const [shaking, setShaking] = useState(false);
  const onDemoCompleteRef = useRef(onDemoComplete);
  const onStampVisibleChangeRef = useRef(onStampVisibleChange);
  onDemoCompleteRef.current = onDemoComplete;
  onStampVisibleChangeRef.current = onStampVisibleChange;

  useEffect(() => {
    if (reduceMotion) {
      setShowMeta(true);
      setHighlightIndex(WATCHED_INDEX);
      setShowEye(true);
      setShowStamp(true);
      setScanActive(true);
      setShaking(false);
      onStampVisibleChangeRef.current?.(true);
      const id = window.setTimeout(() => onDemoCompleteRef.current?.(), OBSERVE_CYCLE.complete);
      return () => window.clearTimeout(id);
    }

    let cancelled = false;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) fn();
        }, ms),
      );
    };

    setShowMeta(true);
    setHighlightIndex(-1);
    setShowEye(false);
    setShowStamp(false);
    setScanActive(false);
    setShaking(false);
    onStampVisibleChangeRef.current?.(false);

    later(OBSERVE_CYCLE.scan0, () => setHighlightIndex(0));
    later(OBSERVE_CYCLE.scan1, () => setHighlightIndex(1));
    later(OBSERVE_CYCLE.scan2, () => setHighlightIndex(2));
    later(OBSERVE_CYCLE.scan3, () => {
      setHighlightIndex(WATCHED_INDEX);
      setScanActive(false);
    });
    later(OBSERVE_CYCLE.shake, () => setShaking(true));
    later(OBSERVE_CYCLE.blue, () => {
      setShaking(false);
      setShowEye(true);
      setShowStamp(true);
      setScanActive(true);
      onStampVisibleChangeRef.current?.(true);
    });
    later(OBSERVE_CYCLE.scan4, () => {
      setScanActive(false);
      setHighlightIndex(WATCHED_INDEX + 1);
    });
    later(OBSERVE_CYCLE.scan5, () => setHighlightIndex(LAST_INDEX));
    later(OBSERVE_CYCLE.complete, () => onDemoCompleteRef.current?.());

    return () => {
      cancelled = true;
      for (const id of timers) window.clearTimeout(id);
    };
  }, [playKey, reduceMotion]);

  return (
    <div className="enforcement-tier-illus__tier enforcement-tier-illus__tier--with-stamp">
      <div className="enforcement-tier-illus__tier-stage">
        <ObserveReveal show={showMeta} reduceMotion={reduceMotion} duration={META_ENTER_DUR}>
          <div className="enforcement-tier-illus__tier-meta">
            <AgentPill live />
          </div>
        </ObserveReveal>

        <ul className="enforcement-tier-illus__log enforcement-tier-illus__log--observe enforcement-tier-illus__log--animated">
          {AGENT_LINES.map((line, index) => {
            const isScanHere = highlightIndex === index;
            const isWatched = line.watched;
            const className = [
              "enforcement-tier-illus__log-line",
              isWatched && "enforcement-tier-illus__log-line--watched",
              isWatched && scanActive && "enforcement-tier-illus__log-line--watched-active",
            ]
              .filter(Boolean)
              .join(" ");

            const row = (
              <>
                {isScanHere ? (
                  <motion.div
                    layoutId={`observe-scan-${playKey}`}
                    className={[
                      "enforcement-tier-illus__log-scan",
                      scanActive && "enforcement-tier-illus__log-scan--active",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: SCAN_MOVE_DUR, ease: SCAN_MOVE_EASE }
                    }
                  />
                ) : null}
                <time className="enforcement-tier-illus__log-time">{line.time}</time>
                <span className="enforcement-tier-illus__log-text">{line.text}</span>
                {isWatched ? (
                  <span className="enforcement-tier-illus__eye-slot" aria-hidden>
                    {showEye ? (
                      reduceMotion ? (
                        <ShadowEyeBeacon />
                      ) : (
                        <motion.span
                          className="enforcement-tier-illus__eye-enter"
                          initial={{ opacity: 0, transform: "scale(0.96)" }}
                          animate={{ opacity: 1, transform: "scale(1)" }}
                          transition={{ duration: BEACON_ENTER_DUR, ease: STORY_EASE }}
                        >
                          <ShadowEyeBeacon />
                        </motion.span>
                      )
                    ) : null}
                  </span>
                ) : null}
              </>
            );

            if (isWatched && !reduceMotion) {
              return (
                <motion.li
                  key={`${line.time}-${line.text}`}
                  className={className}
                  animate={shaking ? { x: [0, -4, 4, -3, 3, -1, 0] } : { x: 0 }}
                  transition={
                    shaking
                      ? { duration: SHAKE_DUR, ease: "easeInOut" }
                      : { duration: 0 }
                  }
                >
                  {row}
                </motion.li>
              );
            }

            return (
              <li key={`${line.time}-${line.text}`} className={className}>
                {row}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="enforcement-tier-illus__stamp-row">
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: showStamp ? 1 : 0 }
              : {
                  opacity: showStamp ? 1 : 0,
                  transform: showStamp ? "translateY(0px) scale(1)" : "translateY(4px) scale(0.99)",
                }
          }
          transition={{ duration: STAMP_ENTER_DUR, ease: STORY_EASE }}
          aria-hidden={!showStamp}
        >
          <TierStamp
            icon={<IconEye size={13} stroke={1.75} aria-hidden />}
            label="Would require approval"
            outcome="Allowed"
          />
        </motion.div>
      </div>
    </div>
  );
}

function ScanHighlight({
  show,
  playKey,
  reduceMotion,
  scanActive,
  variant = "default",
}: {
  show: boolean;
  playKey: string | number;
  reduceMotion: boolean;
  scanActive?: boolean;
  variant?: "default" | "warn" | "deny";
}) {
  if (!show) return null;

  return (
    <motion.div
      layoutId={`tier-scan-${playKey}`}
      className={[
        "enforcement-tier-illus__log-scan",
        scanActive && "enforcement-tier-illus__log-scan--active",
        variant === "warn" && scanActive && "enforcement-tier-illus__log-scan--warn",
        variant === "deny" && scanActive && "enforcement-tier-illus__log-scan--deny",
      ]
        .filter(Boolean)
        .join(" ")}
      transition={
        reduceMotion ? { duration: 0 } : { duration: SCAN_MOVE_DUR, ease: SCAN_MOVE_EASE }
      }
    />
  );
}

function NotifyBeacon({ tone = "default" }: { tone?: "default" | "urgent" | "deny" }) {
  return (
    <span
      className={[
        "enforcement-tier-illus__notify-beacon",
        tone === "urgent" && "enforcement-tier-illus__notify-beacon--urgent",
        tone === "deny" && "enforcement-tier-illus__notify-beacon--deny",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      {tone === "deny" ? (
        <IconShieldX size={13} stroke={1.75} />
      ) : tone === "urgent" ? (
        <IconClockPause size={13} stroke={1.75} />
      ) : (
        <IconBellRinging size={13} stroke={1.75} />
      )}
    </span>
  );
}

function NudgeView({
  reduceMotion,
  playKey,
  onStampVisibleChange,
  onDemoComplete,
}: TierDemoProps) {
  const [showMeta, setShowMeta] = useState(reduceMotion);
  const [highlightIndex, setHighlightIndex] = useState(
    reduceMotion ? NUDGE_WATCHED_INDEX : -1,
  );
  const [showNotify, setShowNotify] = useState(reduceMotion);
  const [showStamp, setShowStamp] = useState(reduceMotion);
  const [showBranches, setShowBranches] = useState(reduceMotion);
  const [scanActive, setScanActive] = useState(false);
  const [shaking, setShaking] = useState(false);
  const onDemoCompleteRef = useRef(onDemoComplete);
  const onStampVisibleChangeRef = useRef(onStampVisibleChange);
  onDemoCompleteRef.current = onDemoComplete;
  onStampVisibleChangeRef.current = onStampVisibleChange;

  useEffect(() => {
    if (reduceMotion) {
      setShowMeta(true);
      setHighlightIndex(NUDGE_WATCHED_INDEX);
      setShowNotify(true);
      setShowStamp(true);
      setShowBranches(true);
      setScanActive(true);
      setShaking(false);
      onStampVisibleChangeRef.current?.(true);
      const id = window.setTimeout(() => onDemoCompleteRef.current?.(), NUDGE_CYCLE.complete);
      return () => window.clearTimeout(id);
    }

    let cancelled = false;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) fn();
        }, ms),
      );
    };

    setShowMeta(true);
    setHighlightIndex(-1);
    setShowNotify(false);
    setShowStamp(false);
    setShowBranches(false);
    setScanActive(false);
    setShaking(false);
    onStampVisibleChangeRef.current?.(false);

    later(NUDGE_CYCLE.scan0, () => setHighlightIndex(0));
    later(NUDGE_CYCLE.scan1, () => setHighlightIndex(1));
    later(NUDGE_CYCLE.scan2, () => {
      setHighlightIndex(NUDGE_WATCHED_INDEX);
      setScanActive(false);
    });
    later(NUDGE_CYCLE.shake, () => setShaking(true));
    later(NUDGE_CYCLE.notify, () => {
      setShaking(false);
      setShowNotify(true);
      setShowStamp(true);
      setScanActive(true);
      onStampVisibleChangeRef.current?.(true);
    });
    later(NUDGE_CYCLE.branches, () => setShowBranches(true));
    later(NUDGE_CYCLE.scan3, () => {
      setScanActive(false);
      setHighlightIndex(NUDGE_LAST_INDEX);
    });
    later(NUDGE_CYCLE.complete, () => onDemoCompleteRef.current?.());

    return () => {
      cancelled = true;
      for (const id of timers) window.clearTimeout(id);
    };
  }, [playKey, reduceMotion]);

  return (
    <div className="enforcement-tier-illus__tier enforcement-tier-illus__tier--with-stamp">
      <div className="enforcement-tier-illus__tier-stage">
        <ObserveReveal show={showMeta} reduceMotion={reduceMotion} duration={META_ENTER_DUR}>
          <div className="enforcement-tier-illus__tier-meta">
            <AgentPill live />
          </div>
        </ObserveReveal>

        <ul className="enforcement-tier-illus__log enforcement-tier-illus__log--animated">
          {NUDGE_ENTRIES.map((entry, index) => {
            const isWatched = !!entry.watched;
            const isScanHere = highlightIndex === index;
            const className = [
              "enforcement-tier-illus__log-line",
              entry.branches &&
                isWatched &&
                showBranches &&
                "enforcement-tier-illus__log-line--with-branches",
              isWatched && "enforcement-tier-illus__log-line--watched",
              isWatched && scanActive && "enforcement-tier-illus__log-line--watched-active",
            ]
              .filter(Boolean)
              .join(" ");

            const row = (
              <>
                <ScanHighlight
                  show={isScanHere}
                  playKey={playKey}
                  reduceMotion={reduceMotion}
                  scanActive={isScanHere && scanActive}
                />
                <time className="enforcement-tier-illus__log-time">{entry.time}</time>
                <div className="enforcement-tier-illus__log-body">
                  <span className="enforcement-tier-illus__log-text">{entry.text}</span>
                  <LogBranches
                    branches={entry.branches}
                    show={isWatched && showBranches}
                    reduceMotion={reduceMotion}
                  />
                </div>
                {isWatched ? (
                  <span className="enforcement-tier-illus__notify-slot" aria-hidden>
                    {showNotify ? (
                      reduceMotion ? (
                        <NotifyBeacon />
                      ) : (
                        <motion.span
                          className="enforcement-tier-illus__notify-enter"
                          initial={{ opacity: 0, transform: "scale(0.96)" }}
                          animate={{ opacity: 1, transform: "scale(1)" }}
                          transition={{ duration: BEACON_ENTER_DUR, ease: STORY_EASE }}
                        >
                          <NotifyBeacon />
                        </motion.span>
                      )
                    ) : null}
                  </span>
                ) : null}
              </>
            );

            if (isWatched && !reduceMotion) {
              return (
                <motion.li
                  key={entry.id}
                  className={className}
                  animate={shaking ? { x: [0, -4, 4, -3, 3, -1, 0] } : { x: 0 }}
                  transition={
                    shaking
                      ? { duration: SHAKE_DUR, ease: "easeInOut" }
                      : { duration: 0 }
                  }
                >
                  {row}
                </motion.li>
              );
            }

            return (
              <li key={entry.id} className={className}>
                {row}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="enforcement-tier-illus__stamp-row">
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: showStamp ? 1 : 0 }
              : {
                  opacity: showStamp ? 1 : 0,
                  transform: showStamp ? "translateY(0px) scale(1)" : "translateY(4px) scale(0.99)",
                }
          }
          transition={{ duration: STAMP_ENTER_DUR, ease: STORY_EASE }}
          aria-hidden={!showStamp}
        >
          <TierStamp
            icon={<IconBellRinging size={13} stroke={1.75} aria-hidden />}
            label="Over budget"
            outcome="Allowed"
          />
        </motion.div>
      </div>
    </div>
  );
}

function ApproveView({
  reduceMotion,
  playKey,
  onStampVisibleChange,
  onDemoComplete,
}: TierDemoProps) {
  const [showMeta, setShowMeta] = useState(reduceMotion);
  const [highlightIndex, setHighlightIndex] = useState(
    reduceMotion ? APPROVE_WATCHED_INDEX : -1,
  );
  const [showNotify, setShowNotify] = useState(reduceMotion);
  const [showStamp, setShowStamp] = useState(reduceMotion);
  const [showBranches, setShowBranches] = useState(reduceMotion);
  const [scanActive, setScanActive] = useState(false);
  const [shaking, setShaking] = useState(false);
  const onDemoCompleteRef = useRef(onDemoComplete);
  const onStampVisibleChangeRef = useRef(onStampVisibleChange);
  onDemoCompleteRef.current = onDemoComplete;
  onStampVisibleChangeRef.current = onStampVisibleChange;

  useEffect(() => {
    if (reduceMotion) {
      setShowMeta(true);
      setHighlightIndex(APPROVE_WATCHED_INDEX);
      setShowNotify(true);
      setShowStamp(true);
      setShowBranches(true);
      setScanActive(true);
      setShaking(false);
      onStampVisibleChangeRef.current?.(true);
      const id = window.setTimeout(() => onDemoCompleteRef.current?.(), APPROVE_CYCLE.complete);
      return () => window.clearTimeout(id);
    }

    let cancelled = false;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) fn();
        }, ms),
      );
    };

    setShowMeta(true);
    setHighlightIndex(-1);
    setShowNotify(false);
    setShowStamp(false);
    setShowBranches(false);
    setScanActive(false);
    setShaking(false);
    onStampVisibleChangeRef.current?.(false);

    later(APPROVE_CYCLE.scan0, () => setHighlightIndex(0));
    later(APPROVE_CYCLE.scan1, () => setHighlightIndex(1));
    later(APPROVE_CYCLE.scan2, () => {
      setHighlightIndex(APPROVE_WATCHED_INDEX);
      setScanActive(false);
    });
    later(APPROVE_CYCLE.shake, () => setShaking(true));
    later(APPROVE_CYCLE.notify, () => {
      setShaking(false);
      setShowNotify(true);
      setShowStamp(true);
      setScanActive(true);
      onStampVisibleChangeRef.current?.(true);
    });
    later(APPROVE_CYCLE.branches, () => setShowBranches(true));
    later(APPROVE_CYCLE.complete, () => onDemoCompleteRef.current?.());

    return () => {
      cancelled = true;
      for (const id of timers) window.clearTimeout(id);
    };
  }, [playKey, reduceMotion]);

  return (
    <div className="enforcement-tier-illus__tier enforcement-tier-illus__tier--with-stamp">
      <div className="enforcement-tier-illus__tier-stage">
        <ObserveReveal show={showMeta} reduceMotion={reduceMotion} duration={META_ENTER_DUR}>
          <div className="enforcement-tier-illus__tier-meta">
            <AgentPill live />
          </div>
        </ObserveReveal>

        <ul className="enforcement-tier-illus__log enforcement-tier-illus__log--animated">
          {APPROVE_ENTRIES.map((entry, index) => {
            const isWatched = !!entry.watched;
            const isScanHere = highlightIndex === index;
            const className = [
              "enforcement-tier-illus__log-line",
              entry.branches &&
                isWatched &&
                showBranches &&
                "enforcement-tier-illus__log-line--with-branches",
              isWatched && "enforcement-tier-illus__log-line--watched",
              isWatched && scanActive && "enforcement-tier-illus__log-line--watched-active",
            ]
              .filter(Boolean)
              .join(" ");

            const row = (
              <>
                <ScanHighlight
                  show={isScanHere}
                  playKey={playKey}
                  reduceMotion={reduceMotion}
                  scanActive={isScanHere && scanActive}
                  variant="warn"
                />
                <time className="enforcement-tier-illus__log-time">{entry.time}</time>
                <div className="enforcement-tier-illus__log-body">
                  <span className="enforcement-tier-illus__log-text">{entry.text}</span>
                  <LogBranches
                    branches={entry.branches}
                    show={isWatched && showBranches}
                    reduceMotion={reduceMotion}
                  />
                </div>
                {isWatched ? (
                  <span className="enforcement-tier-illus__notify-slot" aria-hidden>
                    {showNotify ? (
                      reduceMotion ? (
                        <NotifyBeacon tone="urgent" />
                      ) : (
                        <motion.span
                          className="enforcement-tier-illus__notify-enter"
                          initial={{ opacity: 0, transform: "scale(0.86)" }}
                          animate={{
                            opacity: 1,
                            transform: ["scale(0.86)", "scale(1.12)", "scale(1)"],
                          }}
                          transition={{ duration: 0.42, ease: STORY_EASE }}
                        >
                          <NotifyBeacon tone="urgent" />
                        </motion.span>
                      )
                    ) : null}
                  </span>
                ) : null}
              </>
            );

            if (isWatched && !reduceMotion) {
              return (
                <motion.li
                  key={entry.id}
                  className={className}
                  animate={
                    shaking
                      ? { x: [0, -7, 7, -6, 6, -5, 4, -3, 2, -1, 0] }
                      : { x: 0 }
                  }
                  transition={
                    shaking
                      ? { duration: APPROVE_SHAKE_DUR, ease: "easeInOut" }
                      : { duration: 0 }
                  }
                >
                  {row}
                </motion.li>
              );
            }

            return (
              <li key={entry.id} className={className}>
                {row}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="enforcement-tier-illus__stamp-row">
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: showStamp ? 1 : 0 }
              : {
                  opacity: showStamp ? 1 : 0,
                  transform: showStamp ? "translateY(0px) scale(1)" : "translateY(4px) scale(0.99)",
                }
          }
          transition={{ duration: STAMP_ENTER_DUR, ease: STORY_EASE }}
          aria-hidden={!showStamp}
        >
          <TierStamp
            icon={<IconClockPause size={13} stroke={1.75} aria-hidden />}
            label="Awaiting approval"
            outcome="Paused"
            tone="warn"
          />
        </motion.div>
      </div>
    </div>
  );
}

function BlockView({
  reduceMotion,
  playKey,
  onStampVisibleChange,
  onDemoComplete,
}: TierDemoProps) {
  const [showMeta, setShowMeta] = useState(reduceMotion);
  const [highlightIndex, setHighlightIndex] = useState(
    reduceMotion ? BLOCK_WATCHED_INDEX : -1,
  );
  const [showNotify, setShowNotify] = useState(reduceMotion);
  const [showStamp, setShowStamp] = useState(reduceMotion);
  const [showBranches, setShowBranches] = useState(reduceMotion);
  const [showSkipped, setShowSkipped] = useState(reduceMotion);
  const [scanActive, setScanActive] = useState(reduceMotion);
  const [shaking, setShaking] = useState(false);
  const onDemoCompleteRef = useRef(onDemoComplete);
  const onStampVisibleChangeRef = useRef(onStampVisibleChange);
  onDemoCompleteRef.current = onDemoComplete;
  onStampVisibleChangeRef.current = onStampVisibleChange;

  useEffect(() => {
    if (reduceMotion) {
      setShowMeta(true);
      setHighlightIndex(BLOCK_WATCHED_INDEX);
      setShowNotify(true);
      setShowStamp(true);
      setShowBranches(true);
      setShowSkipped(true);
      setScanActive(true);
      setShaking(false);
      onStampVisibleChangeRef.current?.(true);
      const id = window.setTimeout(() => onDemoCompleteRef.current?.(), BLOCK_CYCLE.complete);
      return () => window.clearTimeout(id);
    }

    let cancelled = false;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) fn();
        }, ms),
      );
    };

    setShowMeta(true);
    setHighlightIndex(-1);
    setShowNotify(false);
    setShowStamp(false);
    setShowBranches(false);
    setShowSkipped(false);
    setScanActive(false);
    setShaking(false);
    onStampVisibleChangeRef.current?.(false);

    later(BLOCK_CYCLE.scan0, () => setHighlightIndex(0));
    later(BLOCK_CYCLE.scan1, () => setHighlightIndex(1));
    later(BLOCK_CYCLE.scan2, () => {
      setHighlightIndex(BLOCK_WATCHED_INDEX);
      setScanActive(false);
    });
    later(BLOCK_CYCLE.shake, () => setShaking(true));
    later(BLOCK_CYCLE.notify, () => {
      setShaking(false);
      setShowNotify(true);
      setShowStamp(true);
      setScanActive(true);
      onStampVisibleChangeRef.current?.(true);
    });
    later(BLOCK_CYCLE.branches, () => setShowBranches(true));
    later(BLOCK_CYCLE.skipped, () => setShowSkipped(true));
    later(BLOCK_CYCLE.complete, () => onDemoCompleteRef.current?.());

    return () => {
      cancelled = true;
      for (const id of timers) window.clearTimeout(id);
    };
  }, [playKey, reduceMotion]);

  return (
    <div className="enforcement-tier-illus__tier enforcement-tier-illus__tier--with-stamp">
      <div className="enforcement-tier-illus__tier-stage">
        <ObserveReveal show={showMeta} reduceMotion={reduceMotion} duration={META_ENTER_DUR}>
          <div className="enforcement-tier-illus__tier-meta">
            <AgentPill live />
          </div>
        </ObserveReveal>

        <ul className="enforcement-tier-illus__log enforcement-tier-illus__log--animated">
          {BLOCK_ENTRIES.map((entry, index) => {
            if (entry.skipped && !showSkipped) return null;

            const isWatched = !!entry.watched;
            const isScanHere = highlightIndex === index;
            const className = [
              "enforcement-tier-illus__log-line",
              entry.branches &&
                isWatched &&
                showBranches &&
                "enforcement-tier-illus__log-line--with-branches",
              entry.skipped && "enforcement-tier-illus__log-line--skipped",
              isWatched && "enforcement-tier-illus__log-line--watched",
              isWatched && scanActive && "enforcement-tier-illus__log-line--watched-active",
            ]
              .filter(Boolean)
              .join(" ");

            const row = (
              <>
                {!entry.skipped ? (
                  <ScanHighlight
                    show={isScanHere}
                    playKey={playKey}
                    reduceMotion={reduceMotion}
                    scanActive={isScanHere && scanActive}
                    variant="deny"
                  />
                ) : null}
                <time className="enforcement-tier-illus__log-time">{entry.time}</time>
                <div className="enforcement-tier-illus__log-body">
                  <span className="enforcement-tier-illus__log-text">{entry.text}</span>
                  {entry.skipped ? (
                    <span className="enforcement-tier-illus__log-skipped-tag">Did not execute</span>
                  ) : null}
                  <LogBranches
                    branches={entry.branches}
                    show={isWatched && showBranches}
                    reduceMotion={reduceMotion}
                  />
                </div>
                {isWatched ? (
                  <span className="enforcement-tier-illus__notify-slot" aria-hidden>
                    {showNotify ? (
                      reduceMotion ? (
                        <NotifyBeacon tone="deny" />
                      ) : (
                        <motion.span
                          className="enforcement-tier-illus__notify-enter"
                          initial={{ opacity: 0, transform: "scale(0.86)" }}
                          animate={{
                            opacity: 1,
                            transform: ["scale(0.86)", "scale(1.14)", "scale(1)"],
                          }}
                          transition={{ duration: 0.42, ease: STORY_EASE }}
                        >
                          <NotifyBeacon tone="deny" />
                        </motion.span>
                      )
                    ) : null}
                  </span>
                ) : null}
              </>
            );

            if (entry.skipped && !reduceMotion) {
              return (
                <motion.li
                  key={entry.id}
                  className={className}
                  initial={{ opacity: 0, transform: "translateY(4px)" }}
                  animate={{ opacity: 0.55, transform: "translateY(0px)" }}
                  transition={{ duration: 0.28, ease: STORY_EASE }}
                >
                  {row}
                </motion.li>
              );
            }

            if (isWatched && !reduceMotion) {
              return (
                <motion.li
                  key={entry.id}
                  className={className}
                  animate={
                    shaking
                      ? { x: [0, -8, 8, -7, 6, -5, 4, -3, 2, -1, 0] }
                      : { x: 0 }
                  }
                  transition={
                    shaking
                      ? { duration: BLOCK_SHAKE_DUR, ease: "easeInOut" }
                      : { duration: 0 }
                  }
                >
                  {row}
                </motion.li>
              );
            }

            return (
              <li key={entry.id} className={className}>
                {row}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="enforcement-tier-illus__stamp-row">
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: showStamp ? 1 : 0 }
              : {
                  opacity: showStamp ? 1 : 0,
                  transform: showStamp ? "translateY(0px) scale(1)" : "translateY(4px) scale(0.99)",
                }
          }
          transition={{ duration: STAMP_ENTER_DUR, ease: STORY_EASE }}
          aria-hidden={!showStamp}
        >
          <TierStamp
            icon={<IconShieldX size={13} stroke={1.75} aria-hidden />}
            label="Provider call"
            outcome="Denied"
            tone="deny"
          />
        </motion.div>
      </div>
    </div>
  );
}

const ARIA_LABELS: Record<EnforcementTierId, string> = {
  observe: `${AGENT_ID} in shadow mode: ${ACTION} ${AMOUNT} would require approval, allowed`,
  nudge: `${AGENT_ID} nudged: ${ACTION} ${AMOUNT}, ${shortName(OWNER.name)} notified, allowed`,
  approve: `${AGENT_ID} held: ${ACTION} ${AMOUNT} awaiting ${shortName(OWNER.name)}`,
  block: `${AGENT_ID} blocked: ${ACTION} ${AMOUNT} denied at proxy`,
};

export function EnforcementTierIllustration({
  tier,
  tierDemo,
  observeDemo,
}: {
  tier: EnforcementTierId;
  tierDemo?: TierDemoProps;
  /** @deprecated Use tierDemo */
  observeDemo?: TierDemoProps;
}) {
  const demo = tierDemo ?? observeDemo;

  return (
    <div
      className="enforcement-tier-illus"
      role="img"
      aria-label={ARIA_LABELS[tier]}
    >
      {tier === "observe" ? (
        <ObserveView
          reduceMotion={demo?.reduceMotion ?? true}
          playKey={demo?.playKey ?? 0}
          onStampVisibleChange={demo?.onStampVisibleChange}
          onDemoComplete={demo?.onDemoComplete}
        />
      ) : tier === "nudge" ? (
        <NudgeView
          reduceMotion={demo?.reduceMotion ?? true}
          playKey={demo?.playKey ?? 0}
          onStampVisibleChange={demo?.onStampVisibleChange}
          onDemoComplete={demo?.onDemoComplete}
        />
      ) : tier === "approve" ? (
        <ApproveView
          reduceMotion={demo?.reduceMotion ?? true}
          playKey={demo?.playKey ?? 0}
          onStampVisibleChange={demo?.onStampVisibleChange}
          onDemoComplete={demo?.onDemoComplete}
        />
      ) : (
        <BlockView
          reduceMotion={demo?.reduceMotion ?? true}
          playKey={demo?.playKey ?? 0}
          onStampVisibleChange={demo?.onStampVisibleChange}
          onDemoComplete={demo?.onDemoComplete}
        />
      )}
    </div>
  );
}
