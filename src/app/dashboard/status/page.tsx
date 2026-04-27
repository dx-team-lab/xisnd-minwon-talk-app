
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Header from '@/components/common/Header';
import StatusTable from '@/components/dashboard/StatusTable';
import { Loader2, LayoutDashboard } from 'lucide-react';
import { Site } from '@/lib/types';

export default function StatusPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const sitesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'sites'), orderBy('order', 'asc'));
  }, [db, user]);

  const { data: sites, isLoading: isSitesLoading } = useCollection(sitesQuery);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold text-slate-900">민원 현황</h1>
            <p className="text-slate-500 text-sm">발생 민원에 대한 경과 내용, 대응 방안, 유사 사례를 확인합니다.</p>
          </div>
        </div>

        <StatusTable
          data={sites as Site[]}
          isLoading={isSitesLoading}
        />
      </main>
    </div>
  );
}
