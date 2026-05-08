'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Clock, Mail, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function InquiryManagementSection() {
  const db = useFirestore();

  const inquiriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'inquiries'),
      orderBy('createdAt', 'desc')
    );
  }, [db]);

  const { data: inquiries, isLoading } = useCollection(inquiriesQuery);
  const { toast } = useToast();

  const handleResolve = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'inquiries', id), {
        status: 'resolved',
      });
      toast({
        title: '성공',
        description: '문의가 완료 처리되었습니다.',
      });
    } catch (error) {
      console.error('Error resolving inquiry:', error);
      toast({
        title: '오류',
        description: '상태 업데이트 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
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
            {inquiries?.map((inquiry) => (
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
                        {inquiry.userName}
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                        <Mail className="h-3 w-3" />
                        {inquiry.userEmail}
                      </div>
                    </div>
                  </div>

                  {inquiry.status === 'pending' && (
                    <Button
                      onClick={() => handleResolve(inquiry.id)}
                      className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-white h-10 px-6 shrink-0 shadow-lg shadow-primary/10"
                    >
                      확인 완료
                    </Button>
                  )}
                </div>
              </div>
            ))}
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
