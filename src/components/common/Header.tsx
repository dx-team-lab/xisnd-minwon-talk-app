
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, Settings, Loader2, Users, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { collection, doc } from 'firebase/firestore';
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';

export default function Header() {
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: userProfile } = useDoc(userProfileRef);

  const adminsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'roles_admin');
  }, [db, user]);
  
  const managersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'roles_manager');
  }, [db, user]);
  
  const { data: admins } = useCollection(adminsQuery);
  const { data: managers } = useCollection(managersQuery);
  
  const isAdmin = !!(user && admins && admins.some(a => a.id === user.uid));
  const isManager = !!(user && managers && managers.some(m => m.id === user.uid));
  const hasSettingsAccess = isAdmin || isManager;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { name: '민원 현황', href: '/dashboard/status' },
    { name: '민원 대응 절차', href: '/dashboard/process' },
    { name: '대응 방안/유사 사례', href: '/dashboard' },
  ];

  const isSettingsActive = pathname.startsWith('/dashboard/users') || pathname.startsWith('/dashboard/settings');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/dashboard/status" className="flex items-center gap-2 mr-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">M</div>
            <span className="text-xl font-headline font-bold text-primary">민원 대응 지식 플랫폼</span>
          </Link>
        </div>

        {/* Center: Global Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-all relative py-2 ${
                  isActive 
                    ? 'text-primary font-bold' 
                    : 'text-slate-600 hover:text-primary'
                }`}
              >
                {item.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger className={`text-sm font-medium transition-all relative py-2 outline-none ${
                isSettingsActive 
                  ? 'text-primary font-bold' 
                  : 'text-slate-600 hover:text-primary'
              }`}>
                설정
                {isSettingsActive && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
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
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Right: User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            {isUserLoading ? (
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
                      관리자
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
      </div>
    </header>
  );
}
