"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";

const UpdateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().min(1, "Name is required").max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
});

type UpdateWorkoutParams = z.infer<typeof UpdateWorkoutSchema>;

type UpdateWorkoutResult =
  | { success: true; redirectTo: string }
  | { success: false; error: Record<string, string[]> };

export async function updateWorkoutAction(
  params: UpdateWorkoutParams
): Promise<UpdateWorkoutResult> {
  const parsed = UpdateWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const { workoutId, name, date, time } = parsed.data;
  const startedAt = new Date(`${date}T${time}:00`);

  await updateWorkout(userId, workoutId, name, startedAt);

  const dateStr = date;
  return { success: true, redirectTo: `/dashboard?date=${dateStr}` };
}
