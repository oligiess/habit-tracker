import { useState } from "react";
import { Anchor } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AVATAR_ICONS } from "@/lib/avatarIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const { updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = displayName.trim().length > 0 && selectedIcon !== null;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const { error } = await updateProfile({
      display_name: displayName.trim(),
      avatar_icon: selectedIcon!,
      onboarded: true,
    });
    setSubmitting(false);
    if (error) setError(error);
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
            Set up your account
          </h1>
          <p className="text-sm text-muted-foreground mb-5">
            Pick a display name and an icon so it feels like yours.
          </p>

          {error && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                maxLength={100}
                autoFocus
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Avatar icon</Label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_ICONS.map(({ id, icon: Icon, color }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedIcon(id)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105"
                    style={{
                      background: color,
                      outline: selectedIcon === id ? "2px solid var(--ring)" : "none",
                      outlineOffset: "2px",
                    }}
                    aria-label={id}
                    aria-pressed={selectedIcon === id}
                  >
                    <Icon size={16} className="text-white" />
                  </button>
                ))}
              </div>
            </div>

            <Button type="button" disabled={!canSubmit || submitting} onClick={handleSubmit} className="mt-1">
              {submitting ? "Saving..." : "Get started"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
