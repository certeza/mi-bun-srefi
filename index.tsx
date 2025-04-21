// pages/index.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6 bg-white text-gray-900">
      <h1 className="text-3xl font-bold text-center">Welkom bij Mi Bun Srefi</h1>
      <p className="text-center text-gray-600 max-w-xl">
        Een digitaal platform voor het zichtbaar maken van talenten en het verbinden van mensen met kansen in hun buurt.
      </p>
      <div className="space-x-4">
        <Link href="/deelnemer">
          <Button variant="default">Voor deelnemers</Button>
        </Link>
        <Link href="/admin">
          <Button variant="outline">Voor beheerders</Button>
        </Link>
      </div>
    </main>
  );
}

