
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Header from '@/components/common/Header';
import HeroBanner from '@/components/dashboard/HeroBanner';
import FilterBar from '@/components/dashboard/FilterBar';
import ResponsePlanTable from '@/components/dashboard/ResponsePlanTable';
import CaseTable from '@/components/dashboard/CaseTable';
import AIAssistantDialog from '@/components/dashboard/AIAssistantDialog';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <Header />
      <HeroBanner />
      <main className="container mx-auto px-4 py-8 space-y-12">
        <FilterBar />
        <ResponsePlanTable />
        <CaseTable />
      </main>
      <AIAssistantDialog />
    </div>
  );
}
