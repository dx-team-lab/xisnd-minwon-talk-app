
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Header from '@/components/common/Header';
import HeroBanner from '@/components/dashboard/HeroBanner';
import FilterBar from '@/components/dashboard/FilterBar';
import ResponsePlanTable from '@/components/dashboard/ResponsePlanTable';
import CaseTable from '@/components/dashboard/CaseTable';
import AIAssistantDialog from '@/components/dashboard/AIAssistantDialog';
import { Loader2, Lock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Check for admin approval
  if (user && userProfile && !userProfile.approved) {
    return (
      <div className="min-h-screen bg-[#F0F4FF] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
            <Lock className="h-10 w-10 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">승인 대기 중</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              회원가입이 완료되었습니다. 대시보드 접근을 위해서는 관리자의 승인이 필요합니다. 관리자에게 승인을 요청해 주세요.
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => window.location.reload()}>
              상태 새로고침
            </Button>
            <Button variant="ghost" className="w-full h-12 text-slate-500" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>
        <p className="mt-8 text-slate-400 text-xs">관리자 문의: admin@minwontalk.com</p>
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
