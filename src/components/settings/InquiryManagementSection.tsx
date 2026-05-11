'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { logActivity } from '@/lib/activity-logs';
import { useDoc } from '@/firebase';
import { ActivityLog, UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Clock, Mail, User, MessageSquare, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function InquiryManagementSection() {
  const db = useFirestore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { user, isUserLoading } = useUser();
  const { isAdmin, isManager, isRoleLoading } = useAdminStatus();

  const inquiriesQuery = useMemoFirebase(() => {
    // 1. 유저 인증 로딩 중이면 차단
    if (isUserLoading) return null;
    // 2. 권한 정보 로딩 중이면 차단
    if (isRoleLoading) return null;
    // 3. 로그인하지 않았거나 db가 없으면 차단
    if (!user?.uid || !db) return null;
    // 4. 관리자나 매니저가 아니면 차단
    if (!isAdmin && !isManager) return null;

    console.log('[InquiryManagementSection] Guard passed. Running admin inquiry query.');
    return query(
      collection(db, 'inquiries'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid, isUserLoading, isAdmin, isManager, isRoleLoading]);

  const usersQuery = useMemoFirebase(() => {
    if (isUserLoading || isRoleLoading || !db || (!isAdmin && !isManager)) return null;
    return collection(db, 'users');
  }, [db, isUserLoading, isRoleLoading, isAdmin, isManager]);

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: usersData } = useCollection(usersQuery);
  const { data: userProfile } = useDoc(userProfileRef);
  const { data: inquiries, isLoading } = useCollection(inquiriesQuery);
  const isInitialLoading = isLoading || isRoleLoading;

  const handleMarkAsResolved = async (inquiryId: string) => {
    if (!db) return;
    
    setUpdatingId(inquiryId);
    try {
      const inquiryRef = doc(db, 'inquiries', inquiryId);
      await updateDoc(inquiryRef, {
        status: 'resolved',
        updatedAt: serverTimestamp()
      });
      
      toast({
        title: '처리 완료',
        description: '문의가 성공적으로 확인 완료 처리되었습니다.',
      });

      // Activity log
      if (user) {
        const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: actorName,
          action: 'UPDATE',
          targetSiteName: '문의 관리',
          targetId: inquiryId,
          details: `문의 상태 변경: 확인 완료`
        });
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast({
        title: '처리 실패',
        description: '상태 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm rounded-[24px] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            문의/요청 관리
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50">
            {inquiries?.map((inquiry) => {
              const matchedUser = usersData?.find(u => u.id === inquiry.userId);
              const displayName = matchedUser?.name || matchedUser?.displayName || inquiry.userName || '알 수 없는 사용자';
              const displayEmail = matchedUser?.email || inquiry.userEmail || '';

              return (
                <div key={inquiry.id} className="p-6 hover:bg-slate-50/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                      <Badge 
                        variant={inquiry.status === 'resolved' ? 'secondary' : 'default'}
                        className={inquiry.status === 'resolved' 
                          ? "bg-slate-100 text-slate-500 border-none" 
                          : "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-none"
                        }
                      >
                        {inquiry.status === 'resolved' ? (
                          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 완료</span>
                        ) : (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 대기중</span>
                        )}
                      </Badge>
                      <span className="text-xs font-medium text-slate-400">
                        {inquiry.createdAt?.toDate ? format(inquiry.createdAt.toDate(), 'yyyy. MM. dd. HH:mm', { locale: ko }) : '시간 정보 없음'}
                      </span>
                    </div>

                    <p className="text-slate-700 font-medium leading-relaxed break-all">
                      {inquiry.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                        <User className="h-3 w-3" />
                        {displayName}
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                        <Mail className="h-3 w-3" />
                        {displayEmail}
                      </div>
                    </div>

                    {inquiry.status === 'pending' && (
                      <div className="flex justify-end pt-2">
                        <Button
                          onClick={() => handleMarkAsResolved(inquiry.id)}
                          disabled={updatingId === inquiry.id}
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white font-bold gap-1.5 h-9"
                        >
                          {updatingId === inquiry.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          확인 완료
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
            {inquiries?.length === 0 && (
              <div className="py-20 text-center space-y-3">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-medium">아직 접수된 문의가 없습니다.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
