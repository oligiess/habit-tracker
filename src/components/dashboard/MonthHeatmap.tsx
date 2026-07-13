import type { HeatmapEntry } from "@/lib/types";
import { HEAT_COLORS } from "@/lib/heatColors";

interface MonthHeatmapProps {
  data: HeatmapEntry[];
}

export default function MonthHeatmap({ data }: MonthHeatmapProps) {
  const today = new Date();
  const monthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDate = data.length ? new Date(data[0].date + "T00:00:00") : today;
  const leadingBlanks = firstDate.getDay();
  const cells: (HeatmapEntry | null)[] = [...Array(leadingBlanks).fill(null), ...data];

  return (
    <div className="rounded-xl border border-border bg-card px-5 pt-5 pb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm text-card-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
          {monthLabel}
        </h2>
        <span className="text-xs text-muted-foreground/70">consistency</span>
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-xs text-muted-foreground/40"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {d}
          </div>
        ))}
        {cells.map((entry, i) =>
          entry ? (
            <div
              key={entry.date}
              className="aspect-square rounded-sm transition-transform hover:scale-110"
              style={{ background: HEAT_COLORS[entry.level] }}
              title={`${entry.date}: ${entry.level * 25}% complete`}
            />
          ) : (
            <div key={`blank-${i}`} />
          )
        )}
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-muted-foreground/70">Less</span>
        <div className="flex items-center gap-1">
          {HEAT_COLORS.map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground/70">More</span>
      </div>
    </div>
  );
}
