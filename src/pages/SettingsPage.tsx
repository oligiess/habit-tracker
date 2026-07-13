import { useState } from "react";
import { useForm } from "react-hook-form";
import { Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { AVATAR_ICONS } from "@/lib/avatarIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ProfileFormValues {
  displayName: string;
}

interface PasswordFormValues {
  password: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const { user, updateProfile, updatePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [selectedIcon, setSelectedIcon] = useState<string | null>(
    (user?.user_metadata?.avatar_icon as string | undefined) ?? null
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const { register: registerProfile, handleSubmit: handleProfileSubmit } = useForm<ProfileFormValues>({
    defaultValues: { displayName: (user?.user_metadata?.display_name as string | undefined) ?? "" },
  });

  const onSaveProfile = async ({ displayName }: ProfileFormValues) => {
    setProfileSaving(true);
    setProfileError(null);
    setProfileSaved(false);
    const { error } = await updateProfile({
      display_name: displayName.trim(),
      avatar_icon: selectedIcon ?? undefined,
    });
    setProfileSaving(false);
    if (error) {
      setProfileError(error);
    } else {
      setProfileSaved(true);
    }
  };

  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>();

  const onChangePassword = async ({ password, confirmPassword }: PasswordFormValues) => {
    setPasswordError(null);
    setPasswordSaved(false);
    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }
    setPasswordSubmitting(true);
    const { error } = await updatePassword(password);
    setPasswordSubmitting(false);
    if (error) {
      setPasswordError(error);
    } else {
      setPasswordSaved(true);
      resetPasswordForm();
    }
  };

  return (
    <div className="px-8 py-6 flex flex-col gap-6 max-w-2xl">
      <h1 className="text-xl leading-tight text-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
        Settings
      </h1>

      <section className="rounded-xl border border-border bg-card px-6 py-5 flex flex-col gap-4">
        <h2 className="text-sm text-card-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
          Profile
        </h2>
        <form onSubmit={handleProfileSubmit(onSaveProfile)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" maxLength={100} {...registerProfile("displayName")} />
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

          {profileError && <p className="text-sm text-destructive">{profileError}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={profileSaving}>
              {profileSaving ? "Saving..." : "Save profile"}
            </Button>
            {profileSaved && (
              <span className="flex items-center gap-1 text-xs text-accent">
                <Check size={14} /> Saved
              </span>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-card px-6 py-5 flex flex-col gap-4">
        <h2 className="text-sm text-card-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-card-foreground">Dark mode</p>
            <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card px-6 py-5 flex flex-col gap-5">
        <h2 className="text-sm text-card-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
          Account
        </h2>

        <div className="flex flex-col gap-1.5">
          <Label>Email</Label>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        <form onSubmit={handlePasswordSubmit(onChangePassword)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                {...registerPassword("password", { required: true, minLength: 6 })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...registerPassword("confirmPassword", { required: true })}
              />
            </div>
          </div>
          {(passwordErrors.password || passwordErrors.confirmPassword) && (
            <p className="text-sm text-destructive">Enter a password of at least 6 characters in both fields.</p>
          )}
          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" variant="outline" disabled={passwordSubmitting}>
              {passwordSubmitting ? "Updating..." : "Change password"}
            </Button>
            {passwordSaved && (
              <span className="flex items-center gap-1 text-xs text-accent">
                <Check size={14} /> Password updated
              </span>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
