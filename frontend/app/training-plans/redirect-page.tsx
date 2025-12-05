'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TrainingPlansRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/capacitaciones');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        <p className="mt-4 text-muted-foreground">Redirigiendo al módulo unificado de capacitaciones...</p>
      </div>
    </div>
  );
}
