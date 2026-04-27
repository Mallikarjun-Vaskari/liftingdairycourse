"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
});

type CreateWorkoutParams = z.infer<typeof CreateWorkoutSchema>;

type CreateWorkoutResult =
  | { success: true; redirectTo: string }
  | { success: false; error: Record<string, string[]> };

export async function createWorkoutAction(
  params: CreateWorkoutParams
): Promise<CreateWorkoutResult> {
  const parsed = CreateWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const { name, date, time } = parsed.data;
  const startedAt = new Date(`${date}T${time}:00`);

  await createWorkout(userId, name, startedAt);
  return { success: true, redirectTo: `/dashboard?date=${date}` };
}
