
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown, LogOut, User, Settings, Loader2, Users, SlidersHorizontal } from 'lucide-react';
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { collection } from 'firebase/firestore';

export default function Header() {
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const adminsQuery = useMemoFirebase(() => collection(db, 'roles_admin'), [db]);
  const managersQuery = useMemoFirebase(() => collection(db, 'roles_manager'), [db]);
  
  const { data: admins } = useCollection(adminsQuery);
  const { data: managers } = useCollection(managersQuery);
  
  const isAdmin = user && admins ? admins.some(a => a.id === user.uid) : false;
  const isManager = user && managers ? managers.some(m => m.id === user.uid) : false;
  const hasSettingsAccess = isAdmin || isManager;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("로그아웃 되었습니다.");
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
      alert("로그아웃 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">M</div>
            <span className="text-xl font-headline font-bold text-primary">민원 대응 지식 플랫폼</span>
          </Link>
          
          {hasSettingsAccess && (
            <nav className="hidden md:flex items-center gap-6">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors outline-none">
                  <Settings className="h-4 w-4 mr-1" />
                  설정
                  <ChevronDown className="h-4 w-4 ml-0.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/users" className="flex w-full items-center gap-2 cursor-pointer">
                        <Users className="h-4 w-4" />
                        사용자 관리
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings/system" className="flex w-full items-center gap-2 cursor-pointer">
                      <SlidersHorizontal className="h-4 w-4" />
                      시스템 설정
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end text-right">
            {isUserLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <span className="text-sm font-semibold">{user?.displayName || '사용자'}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
               <Link href="/dashboard/profile">
                <User className="h-5 w-5" />
               </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-500 border-slate-200 hover:text-destructive hover:border-destructive/20 hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
