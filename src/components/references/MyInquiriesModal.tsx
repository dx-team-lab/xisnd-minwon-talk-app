'use client';

import { useEffect } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { collection, query, where, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, CheckCircle2, Clock, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface MyInquiriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyInquiriesModal({ isOpen, onClose }: MyInquiriesModalProps) {
  const { user, isUserLoading } = useUser();
  const { isAdmin, isManager, isRoleLoading } = useAdminStatus();
  const db = useFirestore();

  const myInquiriesQuery = useMemoFirebase(() => {
    // 1. 유저 인증 로딩 중이면 차단
    if (isUserLoading) return null;
    // 2. 권한 정보 로딩 중이면 차단 (역할 정보가 필요 없더라도 로딩 완료 대기하는 것이 안전)
    if (isRoleLoading) return null;
    // 3. 로그인하지 않았거나 db가 없으면 차단
    if (!user?.uid || !db) return null;
    
    // 일반 사용자는 오직 자신의 문의 내역만 볼 수 있음 (Rule: resource.data.userId == request.auth.uid)
    // 🚨 반드시 where('userId', '==', user.uid) 조건이 포함되어야 list 권한 에러가 나지 않음
    console.log('[MyInquiriesModal] Guard passed. Running user-specific inquiry query.');
    return query(
      collection(db, 'inquiries'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid, isUserLoading, isRoleLoading]);

  const { data: inquiries, isLoading } = useCollection(myInquiriesQuery);

  // Mark all as read when modal is opened
  useEffect(() => {
    if (isOpen && inquiries && db) {
      const unreadInquiries = inquiries.filter(inq => inq.status === 'resolved' && inq.isUserRead === false);
      if (unreadInquiries.length > 0) {
        const markAsRead = async () => {
          const batch = writeBatch(db);
          unreadInquiries.forEach(inq => {
            const ref = doc(db, 'inquiries', inq.id);
            batch.update(ref, { isUserRead: true });
          });
          try {
            await batch.commit();
          } catch (error) {
            console.error('Error marking inquiries as read:', error);
          }
        };
        markAsRead();
      }
    }
  }, [isOpen, inquiries, db]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto rounded-[24px] border-none shadow-2xl p-0">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            내 문의 내역
          </DialogTitle>
          <p className="text-sm text-slate-500 font-medium">
            내가 남긴 문의와 관리자의 답변을 확인할 수 있습니다.
          </p>
        </DialogHeader>

        <div className="px-8 pb-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : inquiries && inquiries.length > 0 ? (
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <div key={inquiry.id} className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-primary/20 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      variant={inquiry.status === 'resolved' ? 'secondary' : 'default'}
                      className={inquiry.status === 'resolved' 
                        ? "bg-emerald-50 text-emerald-600 border-none px-2.5 py-0.5 rounded-full" 
                        : "bg-amber-50 text-amber-600 border-none px-2.5 py-0.5 rounded-full shadow-none"
                      }
                    >
                      {inquiry.status === 'resolved' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold"><CheckCircle2 className="h-3 w-3" /> 답변 완료</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold"><Clock className="h-3 w-3" /> 답변 대기중</span>
                      )}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-300">
                      {inquiry.createdAt?.toDate ? format(inquiry.createdAt.toDate(), 'yyyy. MM. dd.', { locale: ko }) : ''}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                          {inquiry.content}
                        </p>
                      </div>
                    </div>

                    {inquiry.replyContent && (
                      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100/50 relative mt-2 ml-11">
                        <div className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <ArrowRight className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] font-bold text-primary mb-1">구매팀 답변</div>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">
                              {inquiry.replyContent}
                            </p>
                            {inquiry.repliedAt && (
                              <div className="mt-2 text-[10px] text-slate-400">
                                {inquiry.repliedAt.toDate ? format(inquiry.repliedAt.toDate(), 'yyyy. MM. dd. HH:mm', { locale: ko }) : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-medium">아직 문의 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
