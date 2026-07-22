import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import LoaderIcon from "../../assets/icons/LoaderIcon.svg?react";
import CheckIcon from "../../assets/icons/CheckIcon.svg?react";
import DenyIcon from "../../assets/icons/DenyIcon.svg?react";
import { IconArrowLoopRight } from "@tabler/icons-react";
import type { NudgeRequest, DecisionStatus, ValidationResult } from "../../types";
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
  onClick: () => void;
  onCollapseComplete: () => void;
  pendingValue?: number;
  onApprove: () => void;
  onDeny: () => void;
  onModify: (newValue: number) => ValidationResult;
  onPendingValueChange: (value: number) => void;
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
  const [inputValue, setInputValue] = useState(
    String(pendingValue ?? request.value ?? "")
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const cardDoneRef = useRef(false);
  const isCollapsingRef = useRef(false);
  const prevIsActiveRef = useRef(isActive);

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

  useEffect(() => {
    setInputValue(String(pendingValue ?? request.value ?? ""));
    setValidationError(null);
    setEditMode(false);
  }, [request.id, pendingValue, request.value]);

  useEffect(() => {
    if (!cardDone || isLoading || !isActive) return;
    const t = setTimeout(() => setShowConstraint(true), 500);
    return () => clearTimeout(t);
  }, [cardDone, isLoading, isActive]);

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
      // Click-driven expands mirror collapse: the constraint is part of the card from
      // the start so the card grows once to its full height. The staged constraint
      // reveal only happens on the initial load flourish.
      setShowConstraint(true);
      setConstraintDone(true);
    } else {
      // true → false: collapse (bar first if showing, then card)
      setPendingCollapse(true);
      const barWasShowing = constraintDone && !isExpanding;
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
  const isResolving = status === "resolving";
  const isSuccessApproved = status === "success-approved";
  const isSuccessDenied = status === "success-denied";
  const isSuccess = isSuccessApproved || isSuccessDenied;
  const isResolved = status === "approved" || status === "denied";
  const revealed = !isLoading;

  function handleInputChange(raw: string) {
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
          <span className="text-sm text-text-secondary">Policy</span>
        </div>
        <span
          data-nudge-field="constraint-label"
          className="text-xs font-normal text-status-warning tabular-nums"
        >
          {request.constraint.label}: {request.valuePrefix}{request.constraint.limit}
        </span>
      </div>

      <div className="flex items-center justify-between pl-space-6">
        <div className="flex items-center gap-space-2">
          <IconArrowLoopRight size={14} className="text-text-muted" style={{ transform: "scaleY(-1)" }} />
          <span className="text-sm text-text-secondary">Payment rail</span>
        </div>
        <div className="flex items-center gap-space-2">
          <div
            style={{
              width: "18px",
              height: "11px",
              borderRadius: "1.48px",
              backgroundColor: "var(--color-text-muted)",
            }}
          />
          <span className="text-xs text-text-disabled tabular-nums">•• 4102</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-fit">
      {/* Progress bar collapses first on close; its onAnimationComplete triggers card resize */}
      <motion.div
        style={{ width: "85%", overflow: "hidden" }}
        animate={{ height: (isCollapsing || !isActive || !constraintDone || isExpanding) ? 0 : "auto" }}
        transition={(isCollapsing || !isActive || !constraintDone || isExpanding) ? closeSpring : openSpring}
        onAnimationComplete={() => {
          // Fires after bar animates to 0 when collapsing — now start card collapse
          if (!isActive && !isCollapsingRef.current) {
            isCollapsingRef.current = true;
            setIsCollapsing(true);
          }
        }}
      >
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
            <div className="absolute inset-y-0 left-0 bg-accent-500" style={{ width: "70%", borderRadius: "6px" }} />
            <span className="relative ml-auto text-[10px] font-medium tabular-nums text-text-muted leading-none">
              €<span className="text-text-secondary">756</span>/1000
            </span>
          </div>
        </motion.div>
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
              : { duration: 0.1, ease: "easeIn" }
          }
        >
          <span className="text-base font-normal text-text-primary">{request.requester}</span>
          {displayValue !== undefined && (
            <span className="text-base font-medium text-text-muted">
              {request.valuePrefix}{displayValue} {request.summary}
            </span>
          )}
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
                <div className="flex items-center gap-space-4">
                  {editMode ? (
                    <input
                      autoFocus
                      type="number"
                      value={inputValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onBlur={handleEditCommit}
                      onKeyDown={(e) => e.key === "Enter" && handleEditCommit()}
                      data-nudge-field="value"
                    />
                  ) : (
                    <span
                      data-nudge-field="value"
                      className="text-[40px] font-medium text-text-primary leading-none tabular-nums"
                    >
                      {request.valuePrefix}{displayValue}
                    </span>
                  )}
                  <span data-nudge-field="summary" className="text-base font-medium text-text-secondary">
                    {request.summary}
                  </span>
                  {!isResolved && (
                    <div data-nudge-action="edit" onClick={() => setEditMode((v) => !v)} />
                  )}
                </div>
              </Skel>
            </div>
          )}

          {validationError && (
            <p data-nudge-field="validation-error" className="mt-space-2 text-xs text-status-danger">
              {validationError}
            </p>
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
