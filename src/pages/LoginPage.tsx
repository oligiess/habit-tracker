import { useState, type FormEvent } from "react";
import { Anchor } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error, needsConfirmation } = await signUp(email, password);
      if (error) {
        setError(error);
      } else if (needsConfirmation) {
        setInfo("Account created — check your email to confirm, then log in.");
        setMode("login");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
            <Anchor size={16} className="text-primary-foreground" />
          </div>
          <span
            className="text-lg tracking-tight text-foreground"
            style={{ fontFamily: "'Libre Baskerville', serif" }}
          >
            HabitDeck
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card px-6 py-6">
          <h1
            className="text-lg mb-1 text-card-foreground"
            style={{ fontFamily: "'Libre Baskerville', serif" }}
          >
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mb-5">
            {mode === "login" ? "Log in to keep your streaks going." : "Start tracking your habits."}
          </p>

          {error && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent-foreground">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={submitting} className="mt-1">
              {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-5 text-center">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
                setInfo(null);
              }}
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
