'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

/**
 * ApprovalGuard
 * 모든 대시보드 페이지를 감싸서,
 * - 비로그인 → 로그인 페이지로 리다이렉트
 * - 미승인(approved: false) → 승인 대기 화면 표시
 * - 승인된 사용자 → children 그대로 렌더링
 */
export default function ApprovalGuard({ children }: { children: React.ReactNode }) {
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

  // 로딩 중 (인증 상태 또는 프로필 로딩)
  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // 미승인 사용자
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
              회원가입이 완료되었습니다. 대시보드 접근을 위해서는 관리자의 승인이 필요합니다.{' '}
              관리자에게 승인을 요청해 주세요.
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
        <p className="mt-8 text-slate-400 text-xs">관리자 문의: jin38@xisnd.com</p>
      </div>
    );
  }

  // 승인된 사용자 또는 아직 user 없을 때(리다이렉트 진행 중)
  return <>{children}</>;
}
