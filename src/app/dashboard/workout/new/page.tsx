"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkoutAction } from "./actions";

function NewWorkoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = format(new Date(), "yyyy-MM-dd");
  const now = format(new Date(), "HH:mm");

  const [name, setName] = useState("");
  const [date, setDate] = useState(searchParams.get("date") ?? today);
  const [time, setTime] = useState(now);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});

    const result = await createWorkoutAction({ name, date, time });
    if (result.success) {
      router.push(result.redirectTo);
    } else {
      setErrors(result.error);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-zinc-950 min-h-full">
      <main className="mx-auto w-full max-w-lg px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            New Workout
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Log a new workout session.
          </p>
        </div>

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
              {pending ? "Saving…" : "Create Workout"}
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
      </main>
    </div>
  );
}

export default function NewWorkoutPage() {
  return (
    <Suspense>
      <NewWorkoutForm />
    </Suspense>
  );
}
