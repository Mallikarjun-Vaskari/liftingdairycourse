import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateLabel(date: Date): string {
  const formatted = format(date, 'do MMM yyyy');
  return isToday(date) ? `Today — ${formatted}` : formatted;
}
