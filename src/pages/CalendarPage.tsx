import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import * as api from "@/lib/api";
import { useHabits } from "@/context/HabitsContext";
import { HEAT_COLORS } from "@/lib/heatColors";
import DayCell from "@/components/calendar/DayCell";
import { Skeleton } from "@/components/ui/skeleton";
import type { CalendarDayEntry } from "@/lib/types";

function monthKey(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export default function CalendarPage() {
  const { habits, loading: habitsLoading } = useHabits();
  const [cursor, setCursor] = useState(() => new Date());
  const [days, setDays] = useState<CalendarDayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const month = monthKey(cursor);
  const isCurrentMonth = month === monthKey(new Date());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .getCalendarMonth(month)
      .then((data) => {
        if (cancelled) return;
        setDays(data);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Couldn't load the calendar. Try refreshing the page.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month]);

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDate = days.length ? new Date(days[0].date + "T00:00:00") : cursor;
  const leadingBlanks = firstDate.getDay();
  const cells: (CalendarDayEntry | null)[] = [...Array(leadingBlanks).fill(null), ...days];

  const goPrevMonth = () => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const goNextMonth = () => {
    if (isCurrentMonth) return;
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  };

  const habitsById = new Map(habits.map((h) => [h.id, h]));

  return (
    <div className="px-8 py-6 flex flex-col gap-6">
      <h1 className="text-xl leading-tight text-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
        Calendar
      </h1>

      <div className="rounded-xl border border-border bg-card px-6 py-5">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={goPrevMonth}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-sm text-card-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            {monthLabel}
          </h2>
          <button
            onClick={goNextMonth}
            disabled={isCurrentMonth}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground disabled:opacity-30 disabled:cursor-default"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {loading && (
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
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        )}

        {!loading && error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && !habitsLoading && habits.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <CalendarDays size={28} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No habits yet. Add one from the dashboard to start filling in your calendar.
            </p>
            <Link to="/" className="text-sm text-primary hover:underline w-fit">
              Back to dashboard
            </Link>
          </div>
        )}

        {!loading && !error && (habitsLoading || habits.length > 0) && (
          <>
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
              {cells.map((entry, i) =>
                entry ? (
                  <DayCell key={entry.date} entry={entry} habitsById={habitsById} />
                ) : (
                  <div key={`blank-${i}`} />
                )
              )}
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground/70">Less</span>
              <div className="flex items-center gap-1">
                {HEAT_COLORS.map((c, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground/70">More</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
