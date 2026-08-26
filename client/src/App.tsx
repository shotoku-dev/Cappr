import { useState } from "react";
import { Sidebar } from "./app/Sidebar";
import type { ModuleId } from "./app/navigation";

export default function App() {
  // Selected module. Static-ish for now; will be driven by the router later.
  const [activeId, setActiveId] = useState<ModuleId>("overview");

  return (
    <div
      className="flex min-h-dvh"
      style={{ padding: "var(--spacing-space-3)" }} // 6 all sides
    >
      <Sidebar activeId={activeId} onSelect={setActiveId} />
    </div>
  );
}
