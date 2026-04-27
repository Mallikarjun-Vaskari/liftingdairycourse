import db from '@/db';
import { workouts } from '@/db/schema';

export async function createWorkout(userId: string, name: string, startedAt: Date) {
  return db.insert(workouts).values({ userId, name, startedAt }).returning();
}
