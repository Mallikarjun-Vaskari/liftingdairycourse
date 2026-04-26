'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function DatePicker({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', e.target.value);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <input
      type="date"
      value={value}
      onChange={handleChange}
      className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
    />
  );
}
