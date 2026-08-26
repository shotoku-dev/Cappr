import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import LoaderIcon from "../../assets/icons/LoaderIcon.svg?react";
import CheckIcon from "../../assets/icons/CheckIcon.svg?react";
import DenyIcon from "../../assets/icons/DenyIcon.svg?react";
import { IconArrowLoopRight } from "@tabler/icons-react";
import type { NudgeRequest, DecisionStatus, ValidationResult, Meter } from "@nudge/shared";
import { StatusOverlay } from "./StatusOverlay";

// Collapsed pill height; the collapsed overlay is absolutely positioned and
// vertically centered, so this is the only value that defines the collapsed look.
const COLLAPSED_HEIGHT = 44;
const EXPANDED_PAD_Y = 24;
const PAD_X = 20;

interface Props {
  request: NudgeRequest;
  status: DecisionStatus;
  isLoading: boolean;
  isActive: boolean;
  meter?: Meter;
  onClick: () => void;
  onCollapseComplete: () => void;
  pendingValue?: number;
  onApprove: () => void;
  onDeny: () => void;
  onModify: (newValue: number) => ValidationResult;
  onPendingValueChange: (value: number) => void;
}

function fmt(value: number): string {
  return value.toFixed(2);
}

// Step the value font down as the amount gets longer so large checks
// (10k, 100k…) still fit the fixed 300px card next to the summary text.
function valueFontPx(totalChars: number): number {
  if (totalChars <= 8) return 40;
  if (totalChars <= 10) return 32;
  return 26;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Open/close asymmetry: closes are quicker so dismissal gets out of the way,
// opens get slightly more time so the motion reads.
const openSpring = { type: "spring", duration: 0.6, bounce: 0 } as const;
const closeSpring = { type: "spring", duration: 0.5, bounce: 0 } as const;
// Card expansion uses the same long-tail curve as the first-load constraint reveal,
// so a click-driven expand feels identical to the default agent's container growth.
const openEase = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

function Skel({
  revealed,
  skeleton,
  children,
}: {
  revealed: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={`t-skel${revealed ? " is-revealed" : ""}`}>
      <div className="t-skel-skeleton is-pulsing">{skeleton}</div>
      <div className="t-skel-content">{children}</div>
    </div>
  );
}

export function QueueItemExpanded({
  request,
  status,
  isLoading,
  isActive,
  meter,
  onClick,
  onCollapseComplete,
  pendingValue,
  onApprove,
  onDeny,
  onModify,
  onPendingValueChange,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [cardDone, setCardDone] = useState(false);
  const [showConstraint, setShowConstraint] = useState(false);
  const [constraintDone, setConstraintDone] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  // True while a deactivated card is waiting for its bar to close (pre-collapse phase).
  // The card keeps height:"auto" during this phase so it doesn't move until the shrink starts.
  const [pendingCollapse, setPendingCollapse] = useState(false);
  // Tracks isActive across renders so transitions can be derived during render (not in an effect).
  const [prevActive, setPrevActive] = useState(isActive);
  const initialNum = pendingValue ?? request.value;
  const [inputValue, setInputValue] = useState(
    initialNum !== undefined ? fmt(initialNum) : ""
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const cardDoneRef = useRef(false);
  const isCollapsingRef = useRef(false);
  const prevIsActiveRef = useRef(isActive);
  // True only for the item that mounts already-active (page load); all subsequent
  // activations are click-driven and get a shorter constraint reveal delay.
  const mountedAsActiveRef = useRef(isActive);
  const hasBeenActivatedRef = useRef(false);

  const isResolving = status === "resolving";
  const isSuccessApproved = status === "success-approved";
  const isSuccessDenied = status === "success-denied";
  const isSuccess = isSuccessApproved || isSuccessDenied;
  const isResolved = status === "approved" || status === "denied";

  // Derived: card is at rest in its collapsed state (not animating)
  const isIdleCollapsed = !isActive && !isCollapsing && !pendingCollapse;
  // Overlay showing collapsed content — fades in while the card shrinks, stays while at rest
  const showCollapsedOverlay = isCollapsing || isIdleCollapsed;
  // Expanded content visible: hidden while collapsing, visible while active OR during bar-closing
  const contentVisible = !isCollapsing && (isActive || pendingCollapse);

  function markCardDone() {
    if (cardDoneRef.current) return;
    cardDoneRef.current = true;
    setCardDone(true);
  }

  // On first mount: short fallback for page-load where AnimatePresence initial={false}
  // skips entry animation so onAnimationComplete may never fire.
  useEffect(() => {
    if (!isActive) return;
    const t = setTimeout(markCardDone, 200);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset edit state only when the item itself changes. Depending on
  // pendingValue here kicked the user out of edit mode on every valid
  // keystroke, since typing updates pendingValue through the parent.
  useEffect(() => {
    const v = pendingValue ?? request.value;
    setInputValue(v !== undefined ? fmt(v) : "");
    setValidationError(null);
    setEditMode(false);
  }, [request.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!cardDone || isLoading || !isActive) return;
    const isPageLoad = mountedAsActiveRef.current && !hasBeenActivatedRef.current;
    hasBeenActivatedRef.current = true;
    const t = setTimeout(() => setShowConstraint(true), isPageLoad ? 500 : 80);
    return () => clearTimeout(t);
  }, [cardDone, isLoading, isActive]);

  useEffect(() => {
    if (!isActive || isResolved || isResolving || isSuccess) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setEditMode((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isActive, isResolved, isResolving, isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // Drive expand/collapse phase flags synchronously during render (React's
  // derived-state pattern: setState during render re-renders before paint).
  // Doing this in a useEffect painted one stale frame first, which caused the
  // card to dip toward collapsed on deactivate and made framer measure the
  // "auto" expand target without the constraint section.
  if (isActive !== prevActive) {
    setPrevActive(isActive);
    if (isActive) {
      // false → true: expand
      setIsExpanding(true);
      setIsCollapsing(false);
      isCollapsingRef.current = false;
      setPendingCollapse(false);
      setCardDone(false);
      cardDoneRef.current = false;
      setShowConstraint(false);
      setConstraintDone(false);
    } else {
      // true → false: collapse (bar first if showing, then card)
      setPendingCollapse(true);
      const barWasShowing = constraintDone && !isExpanding && !!meter;
      if (!barWasShowing && !isCollapsingRef.current) {
        isCollapsingRef.current = true;
        setIsCollapsing(true);
      }
      // When bar was showing: bar onAnimationComplete triggers setIsCollapsing
    }
  }

  // Fallback in case onAnimationComplete never fires (e.g. zero-distance animation);
  // must also clear isExpanding or the bar would stay closed forever.
  useEffect(() => {
    const wasActive = prevIsActiveRef.current;
    prevIsActiveRef.current = isActive;
    if (isActive && !wasActive) {
      const t = setTimeout(() => {
        markCardDone();
        setIsExpanding(false);
      }, openEase.duration * 1000 + 100);
      return () => clearTimeout(t);
    }
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // When card collapse starts, wait for the spring to settle then notify parent.
  // Timer-based so it's reliable regardless of onAnimationComplete quirks
  // (zero-distance animations or framer-motion version differences).
  useEffect(() => {
    if (!isCollapsing) return;
    const t = setTimeout(() => {
      setIsCollapsing(false);
      isCollapsingRef.current = false;
      setPendingCollapse(false);
      setIsExpanding(false);
      onCollapseComplete();
    }, closeSpring.duration * 1000 + 50);
    return () => clearTimeout(t);
  }, [isCollapsing]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayValue = pendingValue ?? request.value;
  const revealed = !isLoading;
  const displayText = displayValue !== undefined ? fmt(displayValue) : "";

  // Sync the input text to the displayed value when edit mode turns on, so the
  // span → input swap shows identical text (same derived-state-during-render
  // pattern as the expand/collapse flags above).
  const [prevEditMode, setPrevEditMode] = useState(editMode);
  if (editMode !== prevEditMode) {
    setPrevEditMode(editMode);
    if (editMode) {
      setInputValue(displayText);
      setValidationError(null);
    }
  }

  // Size from whichever is longer: what's typed, or what it will format to on
  // commit — so the font doesn't jump when "10000" becomes "10000.00" on blur.
  const parsedInput = parseFloat(inputValue);
  const valueChars =
    (request.valuePrefix?.length ?? 0) +
    (editMode
      ? Math.max(inputValue.length, isNaN(parsedInput) ? 0 : fmt(parsedInput).length)
      : displayText.length);
  const valueFontSize = valueFontPx(valueChars);

  function handleInputChange(raw: string) {
    if (raw !== "" && !/^-?\d*\.?\d*$/.test(raw)) return;
    setInputValue(raw);
    const num = parseFloat(raw);
    if (isNaN(num)) {
      setValidationError("Enter a valid number");
      return;
    }
    const result = onModify(num);
    if (!result.valid) {
      setValidationError(result.reason);
    } else {
      setValidationError(null);
      onPendingValueChange(num);
    }
  }

  function handleEditCommit() {
    if (!validationError) setEditMode(false);
  }

  const constraintSection = request.constraint && (
    <div
      data-nudge-section="value-constraint"
      className="flex flex-col mt-space-4"
      style={{ gap: "10px" }}
    >
      <div data-nudge-field="constraint" className="flex items-center justify-between pl-space-6">
        <div className="flex items-center gap-space-2">
          <IconArrowLoopRight size={14} className="text-text-muted" style={{ transform: "scaleY(-1)" }} />
          <span className="text-sm text-text-secondary">Constraint</span>
        </div>
        <span
          data-nudge-field="constraint-label"
          className="text-xs font-normal text-status-warning tabular-nums"
        >
          {request.constraint.label}: {request.valuePrefix}{fmt(request.constraint.limit)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-fit">
      {/* Progress bar collapses first on close; its onAnimationComplete triggers card resize */}
      <motion.div
        style={{ width: "85%", overflow: "hidden" }}
        animate={{ height: (isCollapsing || !isActive || !constraintDone || isExpanding || !meter) ? 0 : "auto" }}
        transition={(isCollapsing || !isActive || !constraintDone || isExpanding) ? closeSpring : openSpring}
        onAnimationComplete={() => {
          // Fires after bar animates to 0 when collapsing — now start card collapse
          if (!isActive && !isCollapsingRef.current) {
            isCollapsingRef.current = true;
            setIsCollapsing(true);
          }
        }}
      >
        {meter && (() => {
          const fillPct = Math.min(meter.value / meter.limit, 1) * 100;
          const emptyPct = 100 - fillPct;
          const prefix = meter.prefix ?? "";
          const label = `${prefix}${fmt(meter.value)}/${fmt(meter.limit)}`;
          return (
            <motion.div
              className="bg-surface-app"
              style={{ borderRadius: "12px 12px 0 0", padding: "8px", marginBottom: "-0.5px" }}
              initial={{ y: "100%" }}
              animate={{ y: (pendingCollapse || (constraintDone && isActive && !isExpanding)) ? 0 : "100%" }}
              transition={
                (constraintDone && isActive && !isExpanding && !pendingCollapse)
                  ? { type: "spring", duration: 0.8, bounce: 0.15 }
                  : { type: "spring", duration: 0.35, bounce: 0 }
              }
            >
              <div
                className="relative bg-surface-input flex items-center px-space-3"
                style={{ borderRadius: "6px", height: "18px" }}
              >
                <div className="absolute inset-y-0 left-0 bg-accent-500" style={{ width: `${fillPct}%`, borderRadius: "6px" }} />
                {/* Base label — muted, visible where fill doesn't cover */}
                <span className="relative ml-auto text-[10px] font-medium tabular-nums text-text-muted leading-none pointer-events-none">
                  {prefix}<span className="text-text-secondary">{fmt(meter.value)}</span>/{fmt(meter.limit)}
                </span>
                {/* Same label in white, clipped to the filled region for contrast */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ right: `${emptyPct}%` }}>
                  <div className="absolute inset-0 flex items-center px-space-3" style={{ width: `${(100 / fillPct) * 100}%` }}>
                    <span className="ml-auto text-[10px] font-medium tabular-nums leading-none" style={{ color: "white" }}>
                      {label}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </motion.div>

      {/* Unified card — animates between collapsed and expanded states in place.
          No component swap: the title is always rendered, just the layout changes. */}
      <motion.div
        data-nudge-item={isIdleCollapsed ? "collapsed" : "expanded"}
        data-status={status}
        className="relative bg-surface-app w-[300px]"
        style={{
          border: "0.5px solid var(--color-border-subtle)",
          overflow: "hidden",
          cursor: isIdleCollapsed ? "pointer" : "default",
          paddingLeft: PAD_X,
          paddingRight: PAD_X,
        }}
        initial={{
          height: COLLAPSED_HEIGHT,
          borderRadius: 12,
        }}
        animate={{
          height: (isCollapsing || isIdleCollapsed) ? COLLAPSED_HEIGHT : "auto",
          borderRadius: (isCollapsing || isIdleCollapsed) ? 12 : 16,
        }}
        transition={(isCollapsing || isIdleCollapsed) ? closeSpring : openEase}
        onClick={isIdleCollapsed ? onClick : undefined}
        onAnimationComplete={() => {
          if (!isCollapsingRef.current) {
            markCardDone();
            setIsExpanding(false);
          }
        }}
      >
        {/* Collapsed-content overlay — visible when card is at collapsed height */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: PAD_X,
            paddingRight: PAD_X,
            pointerEvents: "none",
          }}
          animate={{ opacity: showCollapsedOverlay ? 1 : 0 }}
          transition={
            showCollapsedOverlay
              ? { duration: 0.25, delay: 0.15, ease: "easeOut" }
              : { duration: 0 }
          }
        >
          <span className="text-base font-normal text-text-primary shrink-0">{request.requester}</span>
          <span className="text-base font-medium text-text-muted truncate ml-3 text-right">
            {displayValue !== undefined
              ? `${request.valuePrefix ?? ""}${fmt(displayValue)}`
              : request.summary}
          </span>
        </motion.div>

        {/* Expanded content — fades out fast when collapsing, fades in after card expands.
            pointerEvents disabled when invisible so the inactive card remains clickable. */}
        <motion.div
          style={{
            pointerEvents: contentVisible ? "auto" : "none",
            // Vertical padding lives here (not on the animated card) so the card's
            // "auto" height measurement is exact — animated padding skewed it.
            paddingTop: EXPANDED_PAD_Y,
            paddingBottom: EXPANDED_PAD_Y,
          }}
          animate={{ opacity: contentVisible ? 1 : 0 }}
          transition={{ duration: isCollapsing ? 0.08 : 0 }}
        >
          {/* Header */}
          <div data-nudge-section="header" className="flex flex-col gap-space-1">
            <Skel
              revealed={revealed}
              skeleton={<div className="skel-bar" style={{ width: "75px", height: "16px" }} />}
            >
              <span data-nudge-field="requester" className="text-base font-normal text-text-primary">
                {request.requester}
              </span>
            </Skel>

            <Skel
              revealed={revealed}
              skeleton={<div className="skel-bar" style={{ width: "110px", height: "10px" }} />}
            >
              <span data-nudge-field="requested-at" className="text-[10px] text-text-secondary">
                Requested {relativeTime(request.requestedAt)}
              </span>
            </Skel>
          </div>

          {/* Value + Summary */}
          {displayValue !== undefined && (
            <div className="mt-space-6">
              <Skel
                revealed={revealed}
                skeleton={
                  <div className="flex items-center gap-space-4">
                    <div className="skel-bar" style={{ width: "130px", height: "40px", borderRadius: "6px" }} />
                    <div className="skel-bar" style={{ width: "90px", height: "16px" }} />
                  </div>
                }
              >
                {/* flex-wrap: worst-case amounts push the summary to its own
                    line instead of clipping against the card's overflow:hidden */}
                <div className="flex flex-wrap items-center gap-space-4">
                  <div className="flex items-center">
                    <span
                      className="font-medium text-text-primary leading-none tabular-nums"
                      style={{ fontSize: valueFontSize }}
                    >
                      {request.valuePrefix}
                    </span>
                    {editMode ? (
                      // Mirror-sized input: a hidden replica of the text sets the
                      // width, so the input is always exactly as wide as its
                      // content. ch-based sizing overshot (1ch = digit width, but
                      // "." is narrower), which shoved the summary on every toggle.
                      <span
                        className="font-medium text-text-primary leading-none tabular-nums"
                        // -1px cancels the replica's caret reserve so the box is
                        // exactly as wide as the static span it replaces
                        style={{ display: "inline-grid", fontSize: valueFontSize, marginRight: -1 }}
                      >
                        <span
                          aria-hidden
                          style={{
                            gridArea: "1 / 1",
                            visibility: "hidden",
                            whiteSpace: "pre",
                            // reserve room so the end-of-text caret isn't clipped
                            paddingRight: "1px",
                          }}
                        >
                          {inputValue || "0"}
                        </span>
                        <input
                          autoFocus
                          type="text"
                          // size=1 keeps the input's intrinsic width out of the
                          // grid track sizing — the hidden replica alone sets it
                          size={1}
                          inputMode="decimal"
                          value={inputValue}
                          onChange={(e) => handleInputChange(e.target.value)}
                          onBlur={handleEditCommit}
                          onKeyDown={(e) => e.key === "Enter" && handleEditCommit()}
                          data-nudge-field="value"
                          style={{
                            gridArea: "1 / 1",
                            width: "100%",
                            minWidth: 0,
                            font: "inherit",
                            color: "inherit",
                            background: "none",
                            border: "none",
                            outline: "none",
                            padding: 0,
                            caretColor: "var(--color-accent-500)",
                          }}
                        />
                      </span>
                    ) : (
                      <span
                        data-nudge-field="value"
                        className="font-medium text-text-primary leading-none tabular-nums"
                        style={{ fontSize: valueFontSize, cursor: isResolved ? "default" : "text" }}
                        onClick={() => { if (!isResolved) setEditMode(true); }}
                      >
                        {displayText}
                      </span>
                    )}
                  </div>
                  <span data-nudge-field="summary" className="text-base font-medium text-text-secondary">
                    {request.summary}
                  </span>
                </div>
                {validationError && (
                  <p data-nudge-field="validation-error" className="mt-space-2 text-xs text-status-danger">
                    {validationError}
                  </p>
                )}
              </Skel>
            </div>
          )}

          {/* Detail */}
          {request.detail && (
            <div className="mt-space-5">
              <Skel
                revealed={revealed}
                skeleton={<div className="skel-bar" style={{ width: "100%", height: "14px" }} />}
              >
                <p data-nudge-field="detail" className="text-sm font-normal text-text-secondary">
                  {request.detail}
                </p>
              </Skel>
            </div>
          )}

          {/* Policy + Payment rail — animated wrapper only for the first-load staged
              reveal; once revealed it renders static (no inline height) so the card's
              "auto" height measurement includes it during click-driven expands */}
          {constraintSection && (constraintDone ? (
            constraintSection
          ) : (
            <motion.div
              key="constraint"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: showConstraint ? "auto" : 0, opacity: showConstraint ? 1 : 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
              onAnimationComplete={() => showConstraint && setConstraintDone(true)}
            >
              {constraintSection}
            </motion.div>
          ))}

          {/* Action buttons */}
          {!isResolved && !isResolving && !isSuccess && (
            <div data-nudge-section="actions" className="mt-space-8 flex items-center gap-space-3">
              {[
                { action: "approve", label: "Approve", kbd: "A", onClick: onApprove },
                { action: "modify",  label: "Modify",  kbd: "M", onClick: () => setEditMode(v => !v) },
                { action: "deny",    label: "Deny",    kbd: "D", onClick: onDeny },
              ].map(({ action, label, kbd, onClick: onBtnClick }) => (
                <motion.button
                  key={action}
                  data-nudge-action={action}
                  onClick={onBtnClick}
                  className="flex items-center bg-surface-panel rounded-md cursor-pointer select-none"
                  style={{
                    gap: "6px",
                    padding: "4px 6px",
                    border: "0.5px solid var(--color-border-subtle)",
                  }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", duration: 0.15, bounce: 0 }}
                >
                  <span className="text-[12px] font-normal text-text-primary">{label}</span>
                  <kbd
                    className="flex items-center justify-center bg-surface-hover rounded-xs"
                    style={{
                      width: "14px",
                      height: "14px",
                      fontSize: "10px",
                      fontWeight: 400,
                      color: "var(--color-text-primary)",
                      fontFamily: "inherit",
                    }}
                  >
                    {kbd}
                  </kbd>
                </motion.button>
              ))}
            </div>
          )}

          {/* Resolving spinner / success check — replaces action buttons while resolving */}
          {(isResolving || isSuccess) && (
            <motion.div
              data-nudge-section="resolving"
              className="mt-space-8 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <div className="t-icon-swap" data-state={isResolving ? "a" : "b"}>
                <span className="t-icon" data-icon="a">
                  <LoaderIcon
                    role="status"
                    aria-label="Loading"
                    className="animate-spin"
                    width={20}
                    height={20}
                    style={{ color: "var(--color-text-muted)" }}
                  />
                </span>
                <span className="t-icon" data-icon="b">
                  {isSuccessApproved ? (
                    <CheckIcon
                      width={20}
                      height={20}
                      style={{ color: "var(--color-green-500)" }}
                    />
                  ) : (
                    <DenyIcon
                      width={20}
                      height={20}
                      style={{ color: "var(--color-red-500)" }}
                    />
                  )}
                </span>
              </div>
            </motion.div>
          )}

          {isResolved && <StatusOverlay status={status} />}
        </motion.div>
      </motion.div>
    </div>
  );
}
