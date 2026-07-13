import { localDateString } from "@/lib/date";

interface DotStripProps {
  history: string[];
  days?: number;
}

export default function DotStrip({ history, days = 7 }: DotStripProps) {
  const historySet = new Set(history);
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
          <div key={date} className="flex flex-col items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full transition-transform hover:scale-110"
              style={{ background: done ? "var(--accent)" : "var(--muted)" }}
              title={date}
            />
            <span
              className="text-[10px] text-muted-foreground/60"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
