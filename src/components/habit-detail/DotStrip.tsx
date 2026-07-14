import { localDateString } from "@/lib/date";
import type { CompletionTime } from "@/lib/types";
import DayHoverCard from "./DayHoverCard";

interface DotStripProps {
  history: string[];
  completionTimes?: CompletionTime[];
  days?: number;
}

export default function DotStrip({ history, completionTimes = [], days = 7 }: DotStripProps) {
  const historySet = new Set(history);
  const timesByDate = new Map(completionTimes.map((c) => [c.date, c.completed_at]));
  const today = new Date();
  const entries = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    return { date: localDateString(d), label: d.toLocaleDateString("en-US", { weekday: "narrow" }) };
  });

  return (
    <div className="flex items-center justify-between gap-2">
      {entries.map(({ date, label }) => {
        const done = historySet.has(date);
        return (
          <DayHoverCard key={date} date={date} completedAt={timesByDate.get(date) ?? null}>
            <div className="flex flex-col items-center gap-1.5 cursor-pointer">
              <div
                className="w-4 h-4 rounded-full transition-transform hover:scale-110"
                style={{ background: done ? "var(--accent)" : "var(--muted)" }}
              />
              <span
                className="text-[10px] text-muted-foreground/60"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {label}
              </span>
            </div>
          </DayHoverCard>
        );
      })}
    </div>
  );
}
