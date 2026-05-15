import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { getWorkoutById } from "@/data/workouts";
import EditWorkoutForm from "./EditWorkoutForm";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId: workoutIdStr } = await params;
  const workoutId = parseInt(workoutIdStr, 10);

  if (isNaN(workoutId)) notFound();

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const workout = await getWorkoutById(userId, workoutId);
  if (!workout) notFound();

  const formattedDate = format(workout.startedAt, "do MMM yyyy");

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-zinc-950 min-h-full">
      <main className="mx-auto w-full max-w-lg px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Edit Workout
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            {formattedDate}
          </p>
        </div>

        <EditWorkoutForm
          workoutId={workout.id}
          initialName={workout.name ?? ""}
          initialStartedAt={workout.startedAt}
        />
      </main>
    </div>
  );
}
