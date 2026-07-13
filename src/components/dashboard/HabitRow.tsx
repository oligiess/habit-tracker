import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, Flame, ChevronRight, Pencil } from "lucide-react";
import type { Habit } from "@/lib/types";
import { habitIcon } from "@/lib/habitIcon";
import { localDateString } from "@/lib/date";

interface HabitRowProps {
  habit: Habit;
  onMarkDone: (id: number) => void;
  onEdit: (habit: Habit) => void;
}

export default function HabitRow({ habit, onMarkDone, onEdit }: HabitRowProps) {
  const navigate = useNavigate();
  const Icon = habitIcon(habit.category);
  const isDone = habit.history.includes(localDateString());
  const isWeekly = habit.target_per_week !== null && habit.week_progress !== null;

  return (
    <li
      className="flex items-center gap-4 px-6 py-3.5 cursor-pointer transition-colors hover:bg-muted/40 group"
      onClick={() => navigate(`/habits/${habit.id}`)}
    >
      <button
        className="flex-shrink-0 transition-transform active:scale-90 disabled:cursor-default"
        disabled={isDone}
        onClick={(e) => {
          e.stopPropagation();
          if (!isDone) onMarkDone(habit.id);
        }}
        aria-label={isDone ? "Already marked done today" : "Mark done"}
      >
        {isDone ? (
          <CheckCircle2 size={20} className="text-accent" />
        ) : (
          <Circle size={20} className="text-muted-foreground/40" />
        )}
      </button>

      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: isDone ? "color-mix(in srgb, var(--accent) 15%, transparent)" : "var(--muted)" }}
      >
        <Icon size={14} className={isDone ? "text-accent" : "text-muted-foreground"} />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-tight truncate transition-colors ${
            isDone ? "text-muted-foreground line-through" : "text-foreground"
          }`}
        >
          {habit.name}
        </p>
        <p className="text-xs mt-0.5 text-muted-foreground/70">
          {[habit.target, habit.category].filter(Boolean).join(" · ") || " "}
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {isWeekly ? (
          <span
            className="text-xs"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {habit.week_progress!.completed}/{habit.week_progress!.target} this week
          </span>
        ) : (
          <>
            <Flame size={12} className={habit.current_streak >= 10 ? "text-primary" : "text-muted-foreground/40"} />
            <span
              className="text-xs"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {habit.current_streak}d
            </span>
          </>
        )}
      </div>
      <button
        className="flex-shrink-0 p-1 rounded-md text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground hover:bg-muted"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(habit);
        }}
        aria-label="Edit habit"
      >
        <Pencil size={14} />
      </button>
      <ChevronRight
        size={14}
        className="text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </li>
  );
}
