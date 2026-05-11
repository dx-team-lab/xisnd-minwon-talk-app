'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useAdminStatus } from '@/hooks/useAdminStatus';

/**
 * 전용 알림 배지 컴포넌트 (Phase 2 재구축 버전)
 * - 🚨 강력한 가드: 4가지 조건을 모두 만족할 때만 쿼리 실행
 * - 관리자/매니저일 경우에만 '대기 중'인 문의 내역을 표시
 */
export function NotificationBell() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { isAdmin, isManager, isRoleLoading } = useAdminStatus();

  // 🚨 강력한 가드: 4가지 조건을 모두 만족할 때만 쿼리 실행
  const inquiryQuery = useMemoFirebase(() => {
    // 1. 유저 인증 로딩 중이면 차단
    if (isUserLoading) return null;
    // 2. 권한 정보 로딩 중이면 차단
    if (isRoleLoading) return null;
    // 3. 로그인하지 않았거나 firestore가 없으면 차단
    if (!user?.uid || !firestore) return null;
    // 4. 관리자나 매니저가 아니면 차단
    if (!isAdmin && !isManager) return null;

    console.log('[NotificationBell] Guard passed. Running inquiry query.');
    return query(
      collection(firestore, 'inquiries'),
      where('status', '==', 'pending')
    );
  }, [user?.uid, firestore, isUserLoading, isAdmin, isManager, isRoleLoading]);

  const { data: inquiries } = useCollection(inquiryQuery);

  // 권한 없으면 종 아이콘 자체를 안 보여줌
  if (!isAdmin && !isManager) return null;
  
  const count = inquiries?.length ?? 0;

  return (
    <Link
      href="/dashboard/settings/system?tab=inquiries"
      className="relative p-2 text-slate-400 hover:text-primary transition-colors group"
      title="새로운 문의/요청 (관리자)"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
