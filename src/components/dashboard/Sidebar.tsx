import { Anchor, Flame, LayoutDashboard, LogOut } from "lucide-react";
import { pluralize } from "@/lib/utils";

interface SidebarProps {
  userEmail: string;
  activeStreak: number;
  onSignOut: () => void;
}

export default function Sidebar({ userEmail, activeStreak, onSignOut }: SidebarProps) {
  const initial = userEmail.charAt(0).toUpperCase();

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col py-8 px-5 gap-8"
      style={{ background: "var(--sidebar)", color: "var(--sidebar-foreground)" }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
          <Anchor size={16} className="text-primary-foreground" />
        </div>
        <span
          className="text-base tracking-tight"
          style={{ fontFamily: "'Libre Baskerville', serif", color: "var(--sidebar-foreground)" }}
        >
          HabitDeck
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 bg-primary text-primary-foreground"
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate" style={{ color: "var(--sidebar-foreground)" }}>
            {userEmail}
          </p>
          <button
            onClick={onSignOut}
            className="text-xs flex items-center gap-1 mt-0.5 hover:underline"
            style={{ color: "var(--sidebar-muted)" }}
          >
            <LogOut size={11} /> Log out
          </button>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
          style={{ background: "var(--sidebar-active)", color: "var(--sidebar-foreground)" }}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </div>
      </nav>

      <div className="mt-auto rounded-xl p-4" style={{ background: "var(--sidebar-active)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Flame size={14} className="text-primary" />
          <span className="text-xs font-medium" style={{ color: "var(--sidebar-muted)" }}>
            ACTIVE STREAK
          </span>
        </div>
        <p
          className="text-3xl font-bold leading-none"
          style={{ fontFamily: "'DM Mono', monospace", color: "var(--sidebar-foreground)" }}
        >
          {activeStreak}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--sidebar-muted)" }}>
          {pluralize(activeStreak, "day")} in a row
        </p>
      </div>
    </aside>
  );
}
