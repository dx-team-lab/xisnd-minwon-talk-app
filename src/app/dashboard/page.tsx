'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import HomeTypeA from '@/components/home/HomeTypeA';
import HomeTypeB from '@/components/home/HomeTypeB';

export default function DashboardHomePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'system');
  }, [db]);

  const { data: settings, isLoading: isSettingsLoading } = useDoc(settingsRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isSettingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const theme = settings?.mainPageTheme || 'typeA';
  const mainImageUrl = settings?.mainImageUrl;

  if (theme === 'typeB') {
    return <HomeTypeB />;
  }

  return <HomeTypeA mainImageUrl={mainImageUrl} />;
}
