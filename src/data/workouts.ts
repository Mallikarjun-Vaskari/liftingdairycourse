import db from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function createWorkout(userId: string, name: string, startedAt: Date) {
  return db.insert(workouts).values({ userId, name, startedAt }).returning();
}

export async function getWorkoutById(userId: string, workoutId: number) {
  const rows = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  return rows[0] ?? null;
}

export async function updateWorkout(userId: string, workoutId: number, name: string, startedAt: Date) {
  return db
    .update(workouts)
    .set({ name, startedAt })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
}
