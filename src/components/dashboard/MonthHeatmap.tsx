import { useHabits } from "@/context/HabitsContext";
import { HEAT_COLORS } from "@/lib/heatColors";
import DayCell from "@/components/calendar/DayCell";
import type { CalendarDayEntry } from "@/lib/types";

export default function MonthHeatmap() {
  const { habits, calendarMonth } = useHabits();
  const today = new Date();
  const monthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDate = calendarMonth.length ? new Date(calendarMonth[0].date + "T00:00:00") : today;
  const leadingBlanks = firstDate.getDay();
  const cells: (CalendarDayEntry | null)[] = [...Array(leadingBlanks).fill(null), ...calendarMonth];

  const habitsById = new Map(habits.map((h) => [h.id, h]));

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
            <DayCell key={entry.date} entry={entry} habitsById={habitsById} />
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
