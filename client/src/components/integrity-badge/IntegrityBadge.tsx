import { useState } from "react";
import { motion } from "framer-motion";
import { IconShieldCheck, IconShieldX, IconLink } from "@tabler/icons-react";
import type { AuditEntry } from "@cappr/shared";
import { verifyChain, hashEntry, GENESIS } from "@cappr/shared";

const PAD_X = 20;
const COLLAPSED_HEIGHT = 44;
const openSpring  = { type: "spring", duration: 0.5, bounce: 0 } as const;
const closeSpring = { type: "spring", duration: 0.4, bounce: 0 } as const;

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

// Displays a hash as two groups of 8 for readability: "a1b2c3d4 e5f6a7b8"
function HashLabel({ hash, valid }: { hash: string; valid: boolean }) {
  const a = hash.slice(0, 8);
  const b = hash.slice(8, 16);
  return (
    <span
      className="font-mono tabular-nums text-[10px]"
      style={{ color: valid ? "var(--color-text-disabled)" : "var(--color-red-500)", letterSpacing: "0.02em" }}
    >
      {a} {b}
    </span>
  );
}

interface Props {
  entries: AuditEntry[];
}

export function IntegrityBadge({ entries }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Oldest-first for chain display and verification
  const chain = [...entries].reverse();
  const result = verifyChain(entries);
  const isEmpty = entries.length === 0;

  const statusColor = isEmpty
    ? "var(--color-text-muted)"
    : result.valid
    ? "var(--color-green-500)"
    : "var(--color-red-500)";

  const StatusIcon = result.valid ? IconShieldCheck : IconShieldX;

  const label = isEmpty
    ? "No records"
    : result.valid
    ? `${entries.length} record${entries.length !== 1 ? "s" : ""} verified`
    : "Chain compromised";

  return (
    <motion.div
      className="bg-surface-app relative"
      style={{
        width: 300,
        border: "0.5px solid var(--color-border-subtle)",
        overflow: "hidden",
        cursor: isOpen ? "default" : "pointer",
      }}
      animate={{
        height: isOpen ? "auto" : COLLAPSED_HEIGHT,
        borderRadius: isOpen ? 16 : 12,
      }}
      transition={isOpen ? openSpring : closeSpring}
      onClick={isOpen ? undefined : () => setIsOpen(true)}
    >
      {/* Collapsed overlay */}
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
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={isOpen ? { duration: 0 } : { duration: 0.2, delay: 0.1 }}
      >
        <div className="flex items-center" style={{ gap: 8 }}>
          <IconLink size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
          <span className="text-sm font-normal text-text-primary">Integrity</span>
        </div>
        <div className="flex items-center" style={{ gap: 5 }}>
          <StatusIcon size={13} style={{ color: statusColor }} />
          <span className="text-[11px]" style={{ color: statusColor }}>{label}</span>
        </div>
      </motion.div>

      {/* Expanded content */}
      <motion.div
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: isOpen ? 0 : 0.08 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ padding: `14px ${PAD_X}px 12px`, cursor: "pointer" }}
          onClick={() => setIsOpen(false)}
        >
          <div className="flex items-center" style={{ gap: 8 }}>
            <IconLink size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
            <span className="text-sm font-normal text-text-primary">Integrity</span>
          </div>
          <div className="flex items-center" style={{ gap: 5 }}>
            <StatusIcon size={13} style={{ color: statusColor }} />
            <span className="text-[11px]" style={{ color: statusColor }}>{label}</span>
          </div>
        </div>

        {/* Chain */}
        {isEmpty ? (
          <div
            className="flex items-center justify-center"
            style={{ padding: `8px ${PAD_X}px 16px` }}
          >
            <span className="text-xs text-text-disabled">Approve or deny requests to start the chain.</span>
          </div>
        ) : (
          <div style={{ padding: `0 ${PAD_X}px 16px` }}>
            {chain.map((entry, i) => {
              const prevHash = i === 0 ? GENESIS : chain[i - 1].hash ?? GENESIS;
              const expected = hashEntry(entry, prevHash);
              const entryValid = entry.hash === expected;
              const isLast = i === chain.length - 1;
              const isApproved = entry.status === "approved";

              return (
                <div key={entry.request.id}>
                  <div className="flex items-start" style={{ gap: 10 }}>
                    {/* Left: connector line + dot */}
                    <div className="flex flex-col items-center" style={{ width: 12, paddingTop: 3, flexShrink: 0 }}>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 999,
                          background: entryValid ? "var(--color-green-500)" : "var(--color-red-500)",
                          flexShrink: 0,
                        }}
                      />
                      {!isLast && (
                        <div
                          style={{
                            width: "0.5px",
                            flex: 1,
                            minHeight: 16,
                            background: "var(--color-border-subtle)",
                            marginTop: 3,
                          }}
                        />
                      )}
                    </div>

                    {/* Right: entry info */}
                    <div className="flex flex-col" style={{ gap: 2, paddingBottom: isLast ? 0 : 10 }}>
                      <div className="flex items-center justify-between" style={{ gap: 8 }}>
                        <span className="text-xs font-medium text-text-primary">
                          {entry.request.requester}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: isApproved ? "var(--color-green-500)" : "var(--color-red-500)" }}
                        >
                          {isApproved ? "approved" : "denied"}
                        </span>
                      </div>
                      <HashLabel hash={entry.hash ?? "????????????????"} valid={entryValid} />
                      <span className="text-[10px] text-text-disabled">
                        {relativeTime(entry.resolvedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
