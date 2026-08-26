import { useState } from "react";
import { Sidebar } from "./app/Sidebar";
import { Topbar } from "./app/Topbar";
import { Overview } from "./app/overview";
import type { ModuleId } from "./app/navigation";

export default function App() {
  // Selected module. Static-ish for now; will be driven by the router later.
  const [activeId, setActiveId] = useState<ModuleId>("overview");

  return (
    <div
      className="flex min-h-dvh"
      style={{
        padding: "var(--spacing-space-3)", // 6 all sides
        gap: "var(--spacing-space-3)", // 6 between rail and content column
      }}
    >
      <Sidebar activeId={activeId} onSelect={setActiveId} />
      <div
        className="flex flex-1 flex-col min-w-0"
        style={{ gap: "var(--spacing-space-3)" }} // 6 between topbar and content
      >
        <Topbar activeId={activeId} onNavigate={setActiveId} />
        {/* Module content mounts here. */}
        {activeId === "overview" && <Overview />}
      </div>
    </div>
  );
}
