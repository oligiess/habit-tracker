import { HEAT_COLORS } from "@/lib/heatColors";
import { localDateString } from "@/lib/date";

interface HistoryCalendarProps {
  history: string[];
}

export default function HistoryCalendar({ history }: HistoryCalendarProps) {
  const historySet = new Set(history);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = new Date(year, month, 1).getDay();
  const cells = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

  return (
    <div className="max-w-2xl">
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-xs text-muted-foreground/40"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {d}
          </div>
        ))}
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {cells.map((date) => {
          const dateStr = localDateString(date);
          const isFuture = date > today;
          const done = historySet.has(dateStr);
          return (
            <div
              key={dateStr}
              className="aspect-square rounded-sm flex items-center justify-center text-xs transition-transform hover:scale-110"
              style={{
                background: isFuture ? "var(--muted)" : done ? HEAT_COLORS[4] : HEAT_COLORS[0],
                opacity: isFuture ? 0.35 : 1,
                color: isFuture ? "var(--muted-foreground)" : done ? "white" : "var(--muted-foreground)",
                fontFamily: "'DM Mono', monospace",
              }}
              title={dateStr}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
