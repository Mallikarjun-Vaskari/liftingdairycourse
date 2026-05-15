"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) {
    return null;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950">
      <div className="text-center space-y-6 max-w-md px-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Lifting Diary
        </h1>
        <p className="text-gray-500 dark:text-zinc-400">
          Track your workouts, monitor your progress, and stay consistent.
        </p>
        <SignInButton mode="redirect">
          <button className={buttonVariants({ variant: "default" })}>
            Sign in to get started
          </button>
        </SignInButton>
      </div>
    </main>
  );
}
