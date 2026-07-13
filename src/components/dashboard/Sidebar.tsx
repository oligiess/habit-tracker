import { NavLink } from "react-router-dom";
import { Anchor, Calendar, Flame, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useHabits } from "@/context/HabitsContext";
import { avatarIcon } from "@/lib/avatarIcons";
import { pluralize } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/calendar", label: "Calendar", icon: Calendar, end: false },
  { to: "/settings", label: "Settings", icon: Settings, end: false },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { summary } = useHabits();

  const userEmail = user?.email ?? "";
  const displayName = (user?.user_metadata?.display_name as string | undefined) || userEmail;
  const initial = userEmail.charAt(0).toUpperCase();
  const icon = avatarIcon(user?.user_metadata?.avatar_icon as string | undefined);

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
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 text-primary-foreground"
          style={{ background: icon?.color ?? "var(--primary)" }}
        >
          {icon ? <icon.icon size={16} /> : initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate" style={{ color: "var(--sidebar-foreground)" }}>
            {displayName}
          </p>
          <button
            onClick={signOut}
            className="text-xs flex items-center gap-1 mt-0.5 hover:underline"
            style={{ color: "var(--sidebar-muted)" }}
          >
            <LogOut size={11} /> Log out
          </button>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? "" : "hover:bg-white/5"
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? "var(--sidebar-active)" : "transparent",
              color: "var(--sidebar-foreground)",
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
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
          {summary.active_streak}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--sidebar-muted)" }}>
          {pluralize(summary.active_streak, "day")} in a row
        </p>
      </div>
    </aside>
  );
}
