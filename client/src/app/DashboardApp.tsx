import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Overview } from "./overview";
import type { ModuleId } from "./navigation";

/** Authenticated dashboard shell — mounted at /app. */
export function DashboardApp() {
  const [activeId, setActiveId] = useState<ModuleId>("overview");

  return (
    <div
      className="flex min-h-dvh"
      style={{
        padding: "var(--spacing-space-3)",
        gap: "var(--spacing-space-3)",
      }}
    >
      <Sidebar activeId={activeId} onSelect={setActiveId} />
      <div
        className="flex flex-1 flex-col min-w-0"
        style={{ gap: "var(--spacing-space-3)" }}
      >
        <Topbar activeId={activeId} onNavigate={setActiveId} />
        {activeId === "overview" && <Overview />}
      </div>
    </div>
  );
}
