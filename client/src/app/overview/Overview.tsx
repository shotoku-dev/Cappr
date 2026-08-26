import { MonthToDateCard } from "./MonthToDateCard";

/** Overview module — the dashboard's landing view. */
export function Overview() {
  return (
    <div className="flex flex-col" style={{ gap: "var(--spacing-space-3)" }}>
      <MonthToDateCard />
    </div>
  );
}
