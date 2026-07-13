import type { Habit } from "@/lib/types";
import { localDateString } from "@/lib/date";
import HabitRow from "./HabitRow";

interface HabitListProps {
  habits: Habit[];
  onMarkDone: (id: number) => void;
  onEdit: (habit: Habit) => void;
}

export default function HabitList({ habits, onMarkDone, onEdit }: HabitListProps) {
  const today = localDateString();
  const completedCount = habits.filter((h) => h.history.includes(today)).length;
  const totalCount = habits.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="px-6 pt-5 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base text-card-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Today's Habits
          </h2>
          <span className="text-xs font-medium text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: progressPct === 100 ? "var(--accent)" : "var(--primary)",
            }}
          />
        </div>
        <p className="text-xs mt-2 text-muted-foreground">
          {totalCount === 0
            ? "No habits yet — add your first one."
            : progressPct === 100
              ? "All habits complete — great work!"
              : `${progressPct}% complete · ${totalCount - completedCount} remaining`}
        </p>
      </div>

      <ul className="divide-y divide-border/60">
        {habits.map((habit) => (
          <HabitRow key={habit.id} habit={habit} onMarkDone={onMarkDone} onEdit={onEdit} />
        ))}
      </ul>
    </div>
  );
}
