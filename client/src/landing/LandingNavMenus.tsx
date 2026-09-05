import { IconChevronDown } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { NAV_MENUS, type NavMenuId } from "./navMenuLinks";

const CHEVRON_SIZE = 14;
const LINK_ICON_SIZE = 20;
const CLOSE_DELAY_MS = 120;
const CLOSE_ANIM_MS = 150;
const PANEL_EXIT_MS = 200;
const INTRO_STAGGER_MS = 400;

export function LandingNavMenus() {
  const [activeMenu, setActiveMenu] = useState<NavMenuId | null>(null);
  const [exitingMenu, setExitingMenu] = useState<NavMenuId | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [introPlay, setIntroPlay] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const clearExitTimer = () => {
    if (exitTimer.current) {
      clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }
  };

  const clearIntroTimer = () => {
    if (introTimer.current) {
      clearTimeout(introTimer.current);
      introTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearCloseTimer();
      clearExitTimer();
      clearIntroTimer();
    };
  }, []);

  const openMenu = (id: NavMenuId) => {
    clearCloseTimer();
    setIsClosing(false);

    if (activeMenu !== null && activeMenu !== id) {
      setExitingMenu(activeMenu);
      clearExitTimer();
      exitTimer.current = setTimeout(() => setExitingMenu(null), PANEL_EXIT_MS);
    } else if (activeMenu === null) {
      setIntroPlay(true);
      clearIntroTimer();
      introTimer.current = setTimeout(() => setIntroPlay(false), INTRO_STAGGER_MS);
    }

    setActiveMenu(id);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setIsClosing(true);
      setIntroPlay(false);
      closeTimer.current = setTimeout(() => {
        setActiveMenu(null);
        setExitingMenu(null);
        setIsClosing(false);
      }, CLOSE_ANIM_MS);
    }, CLOSE_DELAY_MS);
  };

  const isExpanded = activeMenu !== null && !isClosing;
  const activeConfig = NAV_MENUS.find((menu) => menu.id === activeMenu);

  return (
    <div
      className={["landing-nav__menus", isExpanded && "landing-nav__menus--open"].filter(Boolean).join(" ")}
      onMouseLeave={scheduleClose}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          scheduleClose();
        }
      }}
    >
      <div className="landing-nav__menu-triggers">
        {NAV_MENUS.map(({ id, trigger }) => {
          const isActive = activeMenu === id;
          return (
            <button
              key={id}
              type="button"
              className={[
                "landing-nav__link",
                "landing-nav__link--menu",
                "landing-nav__menu-trigger",
                isActive && isExpanded && "landing-nav__menu-trigger--active",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-expanded={isActive && isExpanded}
              aria-haspopup="true"
              onMouseEnter={() => openMenu(id)}
              onFocus={() => openMenu(id)}
            >
              {trigger}
              <IconChevronDown
                size={CHEVRON_SIZE}
                stroke={1.75}
                className="landing-nav__chevron landing-nav__menu-chevron"
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      {activeMenu !== null && (
        <div
          className={[
            "landing-nav__popover",
            isExpanded && "landing-nav__popover--open",
            isClosing && "landing-nav__popover--closing",
          ]
            .filter(Boolean)
            .join(" ")}
          role="menu"
          aria-label={activeConfig?.ariaLabel}
          onMouseEnter={clearCloseTimer}
        >
          <div
            className={["landing-nav__popover-inner", introPlay && "landing-nav__popover-inner--intro"]
              .filter(Boolean)
              .join(" ")}
          >
            {NAV_MENUS.map(({ id, links }) => {
              const isActive = activeMenu === id;
              const isExiting = exitingMenu === id;
              const isVisible = isActive || isExiting;

              return (
                <div
                  key={id}
                  className={[
                    "landing-nav__popover-panel",
                    isActive && "landing-nav__popover-panel--active",
                    isExiting && "landing-nav__popover-panel--exiting",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden={!isVisible}
                >
                  {links.map(({ title, label, href, icon: LinkIcon }) => (
                    <a
                      key={href}
                      href={href}
                      className="landing-nav__popover-link"
                      role="menuitem"
                      tabIndex={isActive ? 0 : -1}
                    >
                      <span className="landing-nav__popover-icon" aria-hidden>
                        <LinkIcon size={LINK_ICON_SIZE} stroke={1.75} />
                      </span>
                      <span className="landing-nav__popover-title">{title}</span>
                      <span className="landing-nav__popover-label">{label}</span>
                    </a>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
