
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
import { Input } from '@/components/ui/input';
import { Loader2, Shield, User, AlertCircle, CheckCircle, Trash2, Edit2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/common/ConfirmModal';

const PROTECTED_EMAILS = ['eom1986@xisnd.com', 'jin38@xisnd.com'];

function formatLastLoginAt(value: any): string | null {
  if (!value) return null;
  try {
    const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}`;
  } catch {
    return null;
  }
}

export default function UserManagementPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Name editing state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const usersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users');
  }, [db, user]);

  const adminsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'roles_admin');
  }, [db, user]);

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

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    
    if (!isCurrentUserAdmin) {
      toast({
        title: "권한 부족",
        description: "사용자를 삭제하려면 관리자 권한이 필요합니다.",
        variant: "destructive"
      });
      return;
    }

    const userToDeleteData = users?.find(u => u.id === userToDelete);
    if (userToDeleteData && PROTECTED_EMAILS.includes(userToDeleteData.email)) {
      toast({
        title: "삭제 불가",
        description: "보호된 계정은 삭제할 수 없습니다.",
        variant: "destructive"
      });
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      return;
    }

    try {
      // 1. Delete from users
      const userRef = doc(db, 'users', userToDelete);
      deleteDocumentNonBlocking(userRef);

      // 2. Delete from roles_admin
      const adminRef = doc(db, 'roles_admin', userToDelete);
      deleteDocumentNonBlocking(adminRef);

      // 3. Delete from roles_manager
      const managerRef = doc(db, 'roles_manager', userToDelete);
      deleteDocumentNonBlocking(managerRef);

      toast({
        title: "사용자 삭제 완료",
        description: "사용자가 시스템에서 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "삭제 실패",
        description: "사용자 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUserId(user.id);
    setTempName(user.displayName || '');
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setTempName('');
  };

  const handleSaveName = async (userId: string) => {
    if (!tempName.trim()) {
      toast({
        title: "오류",
        description: "이름을 입력해 주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      updateDocumentNonBlocking(userRef, { 
        displayName: tempName.trim(),
        name: tempName.trim() 
      });
      toast({
        title: "수정 완료",
        description: "이름이 수정되었습니다.",
      });
      setEditingUserId(null);
    } catch (error) {
      console.error("Error updating name:", error);
      toast({
        title: "오류",
        description: "이름 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, userId: string) => {
    if (e.key === 'Enter') {
      handleSaveName(userId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
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
                  <TableHead className="font-bold text-slate-700">구분</TableHead>
                  <TableHead className="font-bold text-slate-700">이름</TableHead>
                  <TableHead className="font-bold text-slate-700">이메일</TableHead>
                  <TableHead className="font-bold text-slate-700">최종 접속</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center">승인 상태</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center">관리자 권한</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((u) => (
                    <TableRow key={u.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col gap-1">
                            {u.id === user?.uid && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold w-fit">본인</span>}
                            {PROTECTED_EMAILS.includes(u.email) && (
                              <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-50 text-[10px] h-4 px-1 w-fit">
                                보호됨
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {editingUserId === u.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, u.id)}
                              className="h-8 py-1 px-2 text-sm max-w-[150px]"
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleSaveName(u.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-slate-500 hover:bg-slate-50"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <span>{u.name || u.displayName || '이름 없음'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">{u.email}</TableCell>
                      <TableCell className="text-sm">
                        {formatLastLoginAt(u.lastLoginAt)
                          ? <span className="text-slate-600">{formatLastLoginAt(u.lastLoginAt)}</span>
                          : <span className="text-slate-400">기록 없음</span>}
                      </TableCell>
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
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          {editingUserId !== u.id && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-blue-500 hover:bg-blue-50"
                              onClick={() => handleEditClick(u)}
                              disabled={!isCurrentUserAdmin}
                              title="이름 수정"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDeleteClick(u.id)}
                            disabled={editingUserId === u.id || u.id === user?.uid || !isCurrentUserAdmin || PROTECTED_EMAILS.includes(u.email)}
                            title={u.id === user?.uid ? "본인 계정은 삭제할 수 없습니다" : PROTECTED_EMAILS.includes(u.email) ? "보호된 계정입니다" : "사용자 삭제"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                      등록된 사용자가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="사용자 삭제 확인"
        description="정말 이 사용자를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다."
      />
    </div>
  );
}
