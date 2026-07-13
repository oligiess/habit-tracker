export interface WeekProgress {
  completed: number;
  target: number;
  current_streak: number;
  longest_streak: number;
}

export interface Habit {
  id: number;
  name: string;
  category: string | null;
  target: string | null;
  target_per_week: number | null;
  archived: boolean;
  created_at: string;
  current_streak: number;
  longest_streak: number;
  history: string[];
  week_progress: WeekProgress | null;
}

export interface HabitCreateInput {
  name: string;
  category?: string | null;
  target?: string | null;
  target_per_week?: number | null;
}

export interface HabitPatchInput {
  name?: string | null;
  category?: string | null;
  target?: string | null;
  target_per_week?: number | null;
  archived?: boolean | null;
}

export interface Completion {
  id: number;
  habit_id: number;
  completed_date: string;
}

export interface WeeklyStatEntry {
  day: string;
  date: string;
  completed: number;
  total: number;
}

export interface CalendarDayEntry {
  date: string;
  completed_habit_ids: number[];
  total_habit_ids: number[];
  total_habits: number;
  level: number;
}

export interface StatsSummary {
  active_streak: number;
  best_streak: number;
  month_completion_pct: number;
}
