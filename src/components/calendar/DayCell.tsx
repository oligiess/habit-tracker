import { habitIcon } from "@/lib/habitIcon";
import { HEAT_COLORS } from "@/lib/heatColors";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
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

  if (entry.total_habit_ids.length === 0) {
    return cell;
  }

  const completedIds = new Set(entry.completed_habit_ids);
  const completed = entry.total_habit_ids.filter((id) => completedIds.has(id));
  const notCompleted = entry.total_habit_ids.filter((id) => !completedIds.has(id));
  const dayLabel = new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>{cell}</HoverCardTrigger>
      <HoverCardContent>
        <p className="text-sm mb-3 text-popover-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
          {dayLabel}
        </p>
        <div className="flex flex-col gap-1.5">
          {completed.map((id) => {
            const habit = habitsById.get(id);
            const Icon = habitIcon(habit?.category ?? null);
            return (
              <div key={id} className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--primary)" }}>
                <Icon size={13} className="flex-shrink-0" style={{ color: "var(--primary)" }} />
                <span className="truncate">{habit?.name ?? "A habit no longer tracked"}</span>
              </div>
            );
          })}
          {notCompleted.map((id) => {
            const habit = habitsById.get(id);
            const Icon = habitIcon(habit?.category ?? null);
            return (
              <div key={id} className="flex items-center gap-2 text-sm text-muted-foreground/60">
                <Icon size={13} className="flex-shrink-0 text-muted-foreground/40" />
                <span className="truncate">{habit?.name ?? "A habit no longer tracked"}</span>
              </div>
            );
          })}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
