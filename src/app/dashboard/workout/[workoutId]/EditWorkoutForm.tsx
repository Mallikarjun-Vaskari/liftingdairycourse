"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkoutAction } from "./actions";

type Props = {
  workoutId: number;
  initialName: string;
  initialStartedAt: Date;
};

export default function EditWorkoutForm({ workoutId, initialName, initialStartedAt }: Props) {
  const router = useRouter();

  const [name, setName] = useState(initialName ?? "");
  const [date, setDate] = useState(format(initialStartedAt, "yyyy-MM-dd"));
  const [time, setTime] = useState(format(initialStartedAt, "HH:mm"));
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});

    const result = await updateWorkoutAction({ workoutId, name, date, time });
    if (result.success) {
      router.push(result.redirectTo);
    } else {
      setErrors(result.error);
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6 flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Workout Name</Label>
        <Input
          id="name"
          placeholder="e.g. Push Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={pending}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={pending}
        />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="time">Start Time</Label>
        <Input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          disabled={pending}
        />
        {errors.time && (
          <p className="text-sm text-red-500">{errors.time[0]}</p>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
