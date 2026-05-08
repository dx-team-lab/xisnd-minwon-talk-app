'use client';

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InquiryModal({ isOpen, onClose }: InquiryModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: '입력 오류',
        description: '문의 내용을 입력해 주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (!db || !user) {
      toast({
        title: '인증 오류',
        description: '로그인이 필요합니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        content: content.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || '익명 사용자',
      });

      toast({
        title: '성공',
        description: '문의가 성공적으로 접수되었습니다.',
      });
      setContent('');
      onClose();
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast({
        title: '접수 실패',
        description: '문의 접수 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[24px] border-none shadow-2xl p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-black text-slate-800">
            자료 요청 및 문의
          </DialogTitle>
          <p className="text-sm text-slate-500 font-medium">
            현장에 필요한 양식이나 구매팀에 문의하실 사항을 남겨주세요.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="필요한 양식이나 문의 사항을 자유롭게 적어주세요."
            className="min-h-[180px] rounded-2xl border-2 border-slate-100 focus:border-primary/20 focus:ring-0 resize-none p-4 text-slate-700 placeholder:text-slate-300 transition-all font-medium"
          />
        </div>

        <DialogFooter className="mt-8 flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl font-bold text-slate-500 hover:bg-slate-50"
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 h-12 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                보내기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
