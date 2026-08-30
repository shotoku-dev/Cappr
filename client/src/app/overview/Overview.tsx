import { useState } from "react";
import { MonthToDateCard } from "./MonthToDateCard";
import { AgentsCard } from "./AgentsCard";
import { ActivityCard } from "./ActivityCard";
import { AgentDetailPanel } from "../../components/agent-detail";
import type { AgentRow } from "./agents";

/** Overview module — the dashboard's landing view. */
export function Overview() {
  // Agent whose detail drawer is open; null when the drawer is closed.
  const [selected, setSelected] = useState<AgentRow | null>(null);

  return (
    // Left column: the Month-to-Date summary with the activity feed stacked
    // directly beneath it (both narrow); the Agents table fills the rest of the
    // width. `flex-1` makes the module fill the content column down to the
    // sidebar's bottom; the row stretches (default align-items) so the left
    // column takes that full height and the feed grows down to fill it.
    <div className="flex flex-1 min-h-0" style={{ gap: "var(--spacing-space-3)" }}>
      <div className="flex flex-col min-h-0" style={{ gap: "var(--spacing-space-3)" }}>
        <MonthToDateCard />
        <ActivityCard />
      </div>
      <AgentsCard selectedName={selected?.name ?? null} onSelect={setSelected} />

      <AgentDetailPanel agent={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
