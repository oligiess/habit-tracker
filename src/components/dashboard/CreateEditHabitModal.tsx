import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Habit, HabitCreateInput, HabitPatchInput } from "@/lib/types";
import { ApiError } from "@/lib/api";

interface FormValues {
  name: string;
  category: string;
  target: string;
  cadence: "daily" | "weekly";
  targetPerWeek: string;
}

interface CreateEditHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit | null;
  onCreate: (input: HabitCreateInput) => Promise<void>;
  onUpdate: (id: number, patch: HabitPatchInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function toFormValues(habit: Habit | null): FormValues {
  if (!habit) {
    return { name: "", category: "", target: "", cadence: "daily", targetPerWeek: "3" };
  }
  return {
    name: habit.name,
    category: habit.category ?? "",
    target: habit.target ?? "",
    cadence: habit.target_per_week ? "weekly" : "daily",
    targetPerWeek: String(habit.target_per_week ?? 3),
  };
}

export default function CreateEditHabitModal({
  open,
  onOpenChange,
  habit,
  onCreate,
  onUpdate,
  onDelete,
}: CreateEditHabitModalProps) {
  const isEdit = habit !== null;
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const { register, handleSubmit, control, watch, reset } = useForm<FormValues>({
    defaultValues: toFormValues(habit),
  });

  useEffect(() => {
    reset(toFormValues(habit));
    setError(null);
  }, [habit, open, reset]);

  const cadence = watch("cadence");

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const targetPerWeek = values.cadence === "weekly" ? Number(values.targetPerWeek) || 1 : null;
      const payload = {
        name: values.name.trim(),
        category: values.category.trim() || null,
        target: values.target.trim() || null,
        target_per_week: targetPerWeek,
      };
      if (isEdit) {
        await onUpdate(habit.id, payload);
      } else {
        await onCreate(payload);
      }
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveToggle = async () => {
    if (!habit) return;
    setSubmitting(true);
    try {
      await onUpdate(habit.id, { archived: !habit.archived });
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!habit) return;
    setConfirmDeleteOpen(false);
    setSubmitting(true);
    try {
      await onDelete(habit.id);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit habit" : "New habit"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details for this habit." : "Add a habit to track daily or weekly."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required maxLength={100} {...register("name", { required: true })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="e.g. Health" maxLength={100} {...register("category")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="target">Target</Label>
              <Input id="target" placeholder="e.g. 10 min" maxLength={100} {...register("target")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <Label>Frequency</Label>
              <Controller
                name="cadence"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {cadence === "weekly" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="targetPerWeek">Times / week</Label>
                <Input
                  id="targetPerWeek"
                  type="number"
                  min={1}
                  max={7}
                  {...register("targetPerWeek")}
                />
              </div>
            )}
          </div>

          <DialogFooter className="mt-2">
            {isEdit && (
              <div className="flex gap-2 sm:mr-auto">
                <Button type="button" variant="outline" size="sm" onClick={handleArchiveToggle} disabled={submitting}>
                  {habit.archived ? "Unarchive" : "Archive"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={submitting}
                >
                  Delete
                </Button>
              </div>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {habit && (
        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          title="Delete habit?"
          description={`Delete "${habit.name}"? This removes all of its history too. This can't be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          destructive
          submitting={submitting}
        />
      )}
    </Dialog>
  );
}
