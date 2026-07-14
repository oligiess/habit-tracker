import type { ReactNode } from "react";
import { habitIcon } from "@/lib/habitIcon";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import type { CalendarDayEntry, Habit } from "@/lib/types";

type DayCompletionEntry = Pick<CalendarDayEntry, "date" | "completed_habit_ids" | "total_habit_ids">;

interface DayCompletionHoverCardProps {
  entry: DayCompletionEntry;
  habitsById: Map<number, Habit>;
  children: ReactNode;
}

export default function DayCompletionHoverCard({ entry, habitsById, children }: DayCompletionHoverCardProps) {
  if (entry.total_habit_ids.length === 0) {
    return <>{children}</>;
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
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
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
