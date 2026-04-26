import { auth } from '@clerk/nextjs/server';
import { and, eq, gte, lt } from 'drizzle-orm';
import { Suspense } from 'react';
import db from '@/db';
import { workouts, workoutExercises, exercises, sets } from '@/db/schema';
import DatePicker from './DatePicker';

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

async function getWorkoutsForDate(userId: string, date: string) {
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

  // Group into nested structure
  const workoutMap = new Map<
    number,
    {
      id: number;
      name: string | null;
      startedAt: Date;
      completedAt: Date | null;
      exercises: Map<
        number,
        {
          id: number;
          order: number;
          name: string;
          sets: { id: number; setNumber: number; reps: number | null; weightKg: string | null; completed: boolean }[];
        }
      >;
    }
  >();

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? toDateString(new Date());

  const workoutList = userId ? await getWorkoutsForDate(userId, date) : [];

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-zinc-950 min-h-full">
      <main className="mx-auto w-full max-w-2xl px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Workouts
          </h2>
          <Suspense>
            <DatePicker value={date} />
          </Suspense>
        </div>

        {!userId && (
          <p className="text-gray-500 dark:text-zinc-400 text-sm">
            Sign in to see your workouts.
          </p>
        )}

        {userId && workoutList.length === 0 && (
          <p className="text-gray-500 dark:text-zinc-400 text-sm">
            No workouts logged for this date.
          </p>
        )}

        {workoutList.map((workout) => (
          <div
            key={workout.id}
            className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">
                {workout.name ?? 'Untitled Workout'}
              </span>
              <span className="text-xs text-gray-400 dark:text-zinc-500">
                {workout.startedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {workout.completedAt && (
                  <> – {workout.completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                )}
              </span>
            </div>

            {workout.exercises.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400 dark:text-zinc-500">No exercises recorded.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                {workout.exercises.map((ex) => (
                  <li key={ex.id} className="px-5 py-4">
                    <p className="font-medium text-gray-800 dark:text-zinc-100 mb-2">{ex.name}</p>
                    {ex.sets.length > 0 && (
                      <table className="text-sm w-full text-left text-gray-600 dark:text-zinc-400">
                        <thead>
                          <tr className="text-xs text-gray-400 dark:text-zinc-500 uppercase">
                            <th className="pr-4 pb-1 font-medium">Set</th>
                            <th className="pr-4 pb-1 font-medium">Reps</th>
                            <th className="pr-4 pb-1 font-medium">Weight (kg)</th>
                            <th className="pb-1 font-medium">Done</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ex.sets.map((s) => (
                            <tr key={s.id}>
                              <td className="pr-4 py-0.5">{s.setNumber}</td>
                              <td className="pr-4 py-0.5">{s.reps ?? '—'}</td>
                              <td className="pr-4 py-0.5">{s.weightKg ?? '—'}</td>
                              <td className="py-0.5">{s.completed ? '✓' : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
