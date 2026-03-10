'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useMemoFirebase, 
  useCollection, 
  useUser, 
  useFirestore,
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import Header from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Shield, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UserManagementPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const usersQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const adminsQuery = useMemoFirebase(() => collection(db, 'roles_admin'), [db]);

  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery);
  const { data: admins } = useCollection(adminsQuery);

  const isAdmin = (userId: string) => admins?.some(a => a.id === userId);
  
  const isCurrentUserAdmin = user ? isAdmin(user.uid) : false;

  const toggleApproval = (userId: string, currentStatus: boolean) => {
    if (!isCurrentUserAdmin && user?.uid !== userId) {
      toast({
        title: "권한 부족",
        description: "승인 상태를 변경하려면 관리자 권한이 필요합니다.",
        variant: "destructive"
      });
      return;
    }
    const userRef = doc(db, 'users', userId);
    updateDocumentNonBlocking(userRef, { approved: !currentStatus });
  };

  const toggleAdmin = (userId: string, current: boolean) => {
    if (!isCurrentUserAdmin && user?.uid !== userId) {
      toast({
        title: "권한 부족",
        description: "관리자 권한을 변경하려면 관리자 권한이 필요합니다.",
        variant: "destructive"
      });
      return;
    }
    const roleRef = doc(db, 'roles_admin', userId);
    if (current) {
      deleteDocumentNonBlocking(roleRef);
    } else {
      setDocumentNonBlocking(roleRef, { assignedAt: new Date().toISOString() }, { merge: true });
    }
  };

  if (isUserLoading || isUsersLoading) {
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-slate-900">사용자 관리</h1>
            <p className="text-slate-500 text-sm">시스템의 사용자 승인 및 권한을 설정합니다.</p>
          </div>
          {!isCurrentUserAdmin && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 text-sm font-medium">
              <AlertCircle className="h-4 w-4" />
              현재 테스트 모드: 본인의 권한만 직접 제어할 수 있습니다.
            </div>
          )}
        </div>

        <Card className="rounded-xl border-slate-200 overflow-hidden shadow-sm">
          <CardHeader className="bg-white border-b py-4">
            <CardTitle className="text-xl font-headline flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              사용자 승인 및 권한 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50 border-b">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">사용자 정보</TableHead>
                  <TableHead className="font-bold text-slate-700">이메일</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center">승인 상태</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center">관리자 권한</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((u) => (
                    <TableRow key={u.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User className="h-4 w-4" />
                          </div>
                          <span>{u.displayName || '이름 없음'} {u.id === user?.uid && '(나)'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{u.email}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Switch 
                            checked={!!u.approved} 
                            onCheckedChange={() => toggleApproval(u.id, !!u.approved)}
                            disabled={!isCurrentUserAdmin && u.id !== user?.uid}
                          />
                          <span className="text-[10px] font-bold">
                            {u.approved ? <span className="text-green-600">승인됨</span> : <span className="text-amber-600">대기중</span>}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch 
                            checked={isAdmin(u.id)} 
                            onCheckedChange={() => toggleAdmin(u.id, !!isAdmin(u.id))}
                            disabled={!isCurrentUserAdmin && u.id !== user?.uid}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                      등록된 사용자가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
