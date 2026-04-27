import { auth } from '@clerk/nextjs/server';
import { format } from 'date-fns';
import Link from 'next/link';
import DatePicker from './DatePicker';
import { formatDateLabel } from '@/lib/utils';
import { getWorkoutsForDate } from '@/lib/workouts';
import { buttonVariants } from '@/components/ui/button';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;

  const dateParam = typeof params.date === 'string' ? params.date : format(new Date(), 'yyyy-MM-dd');
  const selectedDate = new Date(`${dateParam}T00:00:00`);
  const dateLabel = formatDateLabel(selectedDate);

  const workouts = userId ? await getWorkoutsForDate(userId, dateParam) : [];

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-zinc-950 min-h-full">
      <main className="mx-auto w-full max-w-6xl px-6 py-8">

        {/* Top: Page title */}
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
          Workout Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">

          {/* Left: Calendar */}
          <div className="md:sticky md:top-8 flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white leading-7">
              Select Date
            </h2>
            <DatePicker />
          </div>

          {/* Right: Workouts for selected date */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white leading-7">
              Workouts for {dateLabel}
            </h2>

            {workouts.length === 0 ? (
              <div className="flex flex-col gap-3">
                <p className="text-gray-500 dark:text-zinc-400 text-sm">
                  No workouts logged for this date.
                </p>
                <Link
                  href={`/dashboard/workout/new?date=${dateParam}`}
                  className={buttonVariants({ variant: 'default' }) + ' w-fit'}
                >
                  Log a new workout
                </Link>
              </div>
            ) : (
              workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {workout.name ?? 'Untitled Workout'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-zinc-500">
                      {format(workout.startedAt, 'HH:mm')}
                      {workout.completedAt && <> &ndash; {format(workout.completedAt, 'HH:mm')}</>}
                    </span>
                  </div>

                  {workout.exercises.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-gray-400 dark:text-zinc-500">
                      No exercises recorded.
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {workout.exercises.map((ex) => (
                        <li key={ex.id} className="px-5 py-4">
                          <p className="font-medium text-gray-800 dark:text-zinc-100 mb-2">
                            {ex.name}
                          </p>
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
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
