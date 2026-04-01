'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LegalBackButtonProps {
  fallbackHref?: string;
}

export function LegalBackButton({ fallbackHref = '/login' }: LegalBackButtonProps) {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };

  return (
    <Button type="button" variant="ghost" onClick={handleGoBack} className="w-fit">
      <ArrowLeft className="h-4 w-4 mr-2" />
      Volver
    </Button>
  );
}
