import { useEffect, useLayoutEffect, useRef, useState } from "react";
import SelectIcon from "../assets/icons/Select Icon.svg?react";
import CheckIcon from "../assets/icons/CheckIcon.svg?react";
import "./organization-switcher.css";

const CHEVRON_SIZE = 16;
const CHECK_SIZE = 16;

type Role = "Owner" | "Approver" | "Viewer";

interface Member {
  id: string;
  name: string;
  role: Role;
  color: string;
}

interface Organization {
  id: string;
  name: string;
  members: Member[];
}

// Static until orgs are wired up.
const ORGANIZATIONS: readonly Organization[] = [
  {
    id: "acme",
    name: "Acme Labs",
    members: [
      { id: "julius", name: "Julius Peschard", role: "Owner", color: "var(--color-accent-500)" },
      { id: "yusuf", name: "Yusuf Adeyemi", role: "Approver", color: "var(--color-green-500)" },
      { id: "ines", name: "Ines Ferrand", role: "Approver", color: "var(--color-amber-500)" },
      { id: "tomas", name: "Tomas Weiss", role: "Viewer", color: "var(--color-red-500)" },
    ],
  },
];
const ACTIVE_ORG_ID = "acme";
const CURRENT_USER_ID = "julius";

/**
 * Workspace/organization switcher: the "Acme Labs" label + chevron in the
 * topbar breadcrumb. Clicking opens a popup (org list, new-org action, and the
 * member roster with roles) anchored below and left-aligned to the chevron.
 */
export function OrganizationSwitcher() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLSpanElement>(null);
  // Left offset of the chevron within the trigger — the popup aligns to it.
  const [popupLeft, setPopupLeft] = useState(0);
  const active =
    ORGANIZATIONS.find((org) => org.id === ACTIVE_ORG_ID) ?? ORGANIZATIONS[0];

  useLayoutEffect(() => {
    if (open && chevronRef.current) {
      setPopupLeft(chevronRef.current.offsetLeft);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="org-root">
      <button
        type="button"
        className="org-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
          {active.name}
        </span>
        <span ref={chevronRef} className="org-chevron">
          <SelectIcon width={CHEVRON_SIZE} height={CHEVRON_SIZE} aria-hidden />
        </span>
      </button>

      {open && (
        <div className="org-popup" role="menu" style={{ left: popupLeft }}>
          <div className="org-list">
            {ORGANIZATIONS.map((org) => {
              const selected = org.id === ACTIVE_ORG_ID;
              return (
                <button
                  key={org.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  data-selected={selected}
                  className="org-item"
                >
                  <span className="org-item-text">
                    <span className="org-item-name">{org.name}</span>
                    <span className="org-item-members">
                      {org.members.map((member) => (
                        <span
                          key={member.id}
                          className="org-member-avatar"
                          style={{ background: member.color }}
                          title={member.name}
                        >
                          {member.name[0]}
                        </span>
                      ))}
                    </span>
                  </span>
                  {selected && (
                    <CheckIcon
                      width={CHECK_SIZE}
                      height={CHECK_SIZE}
                      aria-hidden
                      className="org-item-check"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button type="button" className="org-new">
            + New organization
          </button>

          <div className="org-divider" />

          <div className="org-members">
            <span className="org-members-title">Members</span>
            {active.members.map((member) => (
              <div key={member.id} className="org-member-card">
                {member.id === CURRENT_USER_ID ? (
                  // Dotted ring marks "you", echoing the topbar avatar.
                  <span className="org-you-ring">
                    <span
                      className="org-you-inner"
                      style={{ background: member.color }}
                      aria-hidden
                    >
                      {member.name[0]}
                    </span>
                  </span>
                ) : (
                  <span
                    className="org-member-card-avatar"
                    style={{ background: member.color }}
                    aria-hidden
                  >
                    {member.name[0]}
                  </span>
                )}
                <span className="org-member-card-name">{member.name}</span>
                <span className="org-role" data-role={member.role}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>

          <p className="org-note">
            Only Approvers can resolve items in the Inbox. Roles are set by the
            Owner.
          </p>
        </div>
      )}
    </div>
  );
}
