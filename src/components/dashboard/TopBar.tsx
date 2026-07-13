import { Moon, Sun, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  greetingName: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onNewHabit: () => void;
}

export default function TopBar({ greetingName, theme, onToggleTheme, onNewHabit }: TopBarProps) {
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 border-b border-border bg-background">
      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
          {dateStr}
        </p>
        <h1
          className="text-xl mt-0.5 leading-tight text-foreground"
          style={{ fontFamily: "'Libre Baskerville', serif" }}
        >
          Good morning, {greetingName}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={onNewHabit} size="sm" className="gap-1.5">
          <Plus size={16} />
          New Habit
        </Button>
        <button
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          className="w-9 h-9 rounded-full flex items-center justify-center border border-border transition-colors hover:bg-muted text-muted-foreground"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
