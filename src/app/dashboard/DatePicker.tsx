'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

export default function DatePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get('date') ?? format(new Date(), 'yyyy-MM-dd');
  const value = parseISO(dateParam);

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', format(date, 'yyyy-MM-dd'));
    router.push(`?${params.toString()}`);
  }

  return (
    <Calendar
      mode="single"
      selected={value}
      onSelect={handleSelect}
      className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-4"
    />
  );
}
