import { and, eq, gte, lt } from 'drizzle-orm';
import db from '@/db';
import { workouts, workoutExercises, exercises, sets } from '@/db/schema';

export type WorkoutSet = {
  id: number;
  setNumber: number;
  reps: number | null;
  weightKg: string | null;
  completed: boolean;
};

export type WorkoutExercise = {
  id: number;
  order: number;
  name: string;
  sets: WorkoutSet[];
};

export type WorkoutWithExercises = {
  id: number;
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  exercises: WorkoutExercise[];
};

export async function getWorkoutsForDate(
  userId: string,
  date: string,
): Promise<WorkoutWithExercises[]> {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);

  const rows = await db
    .select({
      workout: workouts,
      workoutExercise: workoutExercises,
      exercise: exercises,
      set: sets,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, start),
        lt(workouts.startedAt, end),
      ),
    )
    .orderBy(workouts.id, workoutExercises.order, sets.setNumber);

  type WorkoutAccumulator = Omit<WorkoutWithExercises, 'exercises'> & {
    exercises: Map<number, WorkoutExercise>;
  };

  const workoutMap = new Map<number, WorkoutAccumulator>();

  for (const row of rows) {
    const w = row.workout;
    if (!workoutMap.has(w.id)) {
      workoutMap.set(w.id, {
        id: w.id,
        name: w.name,
        startedAt: w.startedAt,
        completedAt: w.completedAt,
        exercises: new Map(),
      });
    }
    const workout = workoutMap.get(w.id)!;

    if (row.workoutExercise && row.exercise) {
      const we = row.workoutExercise;
      if (!workout.exercises.has(we.id)) {
        workout.exercises.set(we.id, {
          id: we.id,
          order: we.order,
          name: row.exercise.name,
          sets: [],
        });
      }
      if (row.set) {
        workout.exercises.get(we.id)!.sets.push({
          id: row.set.id,
          setNumber: row.set.setNumber,
          reps: row.set.reps,
          weightKg: row.set.weightKg,
          completed: row.set.completed,
        });
      }
    }
  }

  return [...workoutMap.values()].map((w) => ({
    ...w,
    exercises: [...w.exercises.values()].sort((a, b) => a.order - b.order),
  }));
}
