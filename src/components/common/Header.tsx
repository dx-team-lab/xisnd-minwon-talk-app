
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown, LogOut, User, Home, FolderKanban, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">M</div>
            <span className="text-xl font-headline font-bold text-primary">민원 커뮤니티</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#" className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors">
              <FolderKanban className="h-4 w-4" />
              프로젝트
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors outline-none">
                <Settings className="h-4 w-4 mr-1" />
                설정
                <ChevronDown className="h-4 w-4 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem>시스템 설정</DropdownMenuItem>
                <DropdownMenuItem>사용자 관리</DropdownMenuItem>
                <DropdownMenuItem>알림 설정</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-sm font-semibold">홍길동 매니저</span>
            <span className="text-xs text-muted-foreground">admin@minwontalk.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 text-destructive border-destructive/20 hover:bg-destructive/5">
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
