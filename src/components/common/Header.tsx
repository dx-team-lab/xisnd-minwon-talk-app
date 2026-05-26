'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logoImg from '../../../public/logo.png';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, Settings, Loader2, Users, SlidersHorizontal, ChevronDown, History, Bell } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { collection, doc, query, where } from 'firebase/firestore';
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { NotificationBell } from './NotificationBell';

// NotificationBell has been moved to its own file NotificationBell.tsx

export default function Header() {
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { isAdmin, isManager, isRoleLoading } = useAdminStatus();
  const router = useRouter();
  const pathname = usePathname();

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: userProfile } = useDoc(userProfileRef);

  const systemSettingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'system');
  }, [db]);

  const { data: systemSettings } = useDoc(systemSettingsRef);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { name: '민원 진행 현황', href: '/dashboard/status' },
    ...(systemSettings?.isProcessMenuEnabled 
        ? [{ name: '민원 대응 절차', href: '/dashboard/process' }] 
        : []),
    { name: '유사사례', href: '/dashboard/guides' },
    { name: '참고자료', href: '/dashboard/references' },
  ];

  const isSettingsActive = pathname.startsWith('/dashboard/users') || pathname.startsWith('/dashboard/settings') || pathname.startsWith('/admin/logs');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center gap-3 mr-10 hover:opacity-80 transition-opacity">
            <Image
              src={logoImg}
              alt="MinwonTalk Logo"
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
            />
            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              민원 대응 지식 플랫폼
            </span>
          </Link>
        </div>

        {/* Center: Global Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => {
            let isActive = false;
            if (item.href === '/dashboard') {
              isActive = pathname === '/dashboard' || pathname === '/dashboard/';
            } else {
              isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-all relative py-2 border-b-2 ${isActive
                  ? 'text-blue-600 border-blue-600 font-semibold'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
              >
                {item.name}
              </Link>
            );
          })}

          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger className={`text-sm transition-all relative py-2 outline-none border-b-2 ${isSettingsActive
                ? 'text-blue-600 border-blue-600 font-semibold'
                : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}>
                설정
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 p-1">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/users" className="flex w-full items-center gap-2 cursor-pointer p-2">
                    <Users className="h-4 w-4" />
                    사용자 관리
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings/system" className="flex w-full items-center gap-2 cursor-pointer p-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    시스템 설정
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/logs" className="flex w-full items-center gap-2 cursor-pointer p-2">
                    <History className="h-4 w-4" />
                    시스템 로그
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Right: User Info & Logout */}
        <div className="flex items-center gap-4">
            <NotificationBell />
            {/* 내 문의 내역 버튼 제거됨 (시스템 단순화) */}

            {isUserLoading || isRoleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-800">
                      {userProfile?.name || userProfile?.displayName || user?.displayName || '사용자'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {user?.email}
                    </span>
                  </div>

                  {isAdmin && (
                    <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-primary/20">
                      관리자
                    </span>
                  )}
                  {isManager && !isAdmin && (
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-slate-200">
                      매니저
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 border-l pl-4 h-8">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-8 w-8 rounded-full text-red-500 hover:text-red-100 hover:bg-red-50 transition-colors"
                    title="로그아웃"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">로그인</Link>
              </Button>
            )}
        </div>
      </div>
    </header>
  );
}
