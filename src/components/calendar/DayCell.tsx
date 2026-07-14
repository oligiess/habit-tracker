import { HEAT_COLORS } from "@/lib/heatColors";
import DayCompletionHoverCard from "./DayCompletionHoverCard";
import type { CalendarDayEntry, Habit } from "@/lib/types";

interface DayCellProps {
  entry: CalendarDayEntry;
  habitsById: Map<number, Habit>;
}

export default function DayCell({ entry, habitsById }: DayCellProps) {
  const dayNumber = new Date(entry.date + "T00:00:00").getDate();
  const cell = (
    <div
      className="aspect-square rounded-md transition-transform hover:scale-105 flex items-center justify-center text-[11px]"
      style={{ background: HEAT_COLORS[entry.level], fontFamily: "'DM Mono', monospace" }}
    >
      {dayNumber}
    </div>
  );

  return (
    <DayCompletionHoverCard entry={entry} habitsById={habitsById}>
      {cell}
    </DayCompletionHoverCard>
  );
}
