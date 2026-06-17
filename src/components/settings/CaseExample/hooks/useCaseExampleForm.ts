'use client';

import { useState } from 'react';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { logActivity } from '@/lib/activity-logs';
import { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  siteName: string;
  region: string;
  type: string[];
  complaintContent: string;
  phase: string;
  complainant: string;
  requestContent: string[];
  occurrenceDate: string;
  progress: string;
  details: string;
  compensationMethod: string;
  compensationAmount: number;
}

const initialFormData: FormData = {
  siteName: '',
  region: '',
  type: [],
  complaintContent: '',
  phase: '',
  complainant: '',
  requestContent: [],
  occurrenceDate: '',
  progress: '',
  details: '',
  compensationMethod: '',
  compensationAmount: 0
};

export function useCaseExampleForm(userProfile: UserProfile | undefined) {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState<boolean>(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleType = (val: string) => {
    setFormData(prev => {
      const current = prev.type || [];
      const next = current.includes(val)
        ? current.filter(t => t !== val)
        : [...current, val];
      return { ...prev, type: next };
    });
  };

  const toggleRequestContent = (val: string) => {
    setFormData(prev => {
      const current = prev.requestContent || [];
      const next = current.includes(val)
        ? current.filter(t => t !== val)
        : [...current, val];
      return { ...prev, requestContent: next };
    });
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { siteName, region, phase, type, complainant, requestContent, compensationMethod, occurrenceDate, progress } = formData;

    if (!siteName || !region || !phase || !type.length || !complainant || !requestContent.length || !compensationMethod || !occurrenceDate || !progress) {
      toast({ title: "입력 오류", description: "필수 항목을 모두 입력해주세요.", variant: "destructive" });
      return;
    }

    const payload = {
      ...formData,
      compensationAmount: Number(formData.compensationAmount),
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid
    };

    if (editingId) {
      updateDocumentNonBlocking(doc(db, 'caseExamples', editingId), payload);
      toast({ title: "성공", description: "사례가 수정되었습니다." });
    } else {
      addDocumentNonBlocking(collection(db, 'caseExamples'), {
        ...payload,
        createdAt: serverTimestamp(),
        createdBy: user?.uid
      });
      toast({ title: "성공", description: "사례가 등록되었습니다." });
    }

    // 활동 로그
    if (user) {
      const actorName = userProfile?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
      await logActivity(db, {
        actorEmail: user.email || '',
        actorName: actorName,
        action: editingId ? 'UPDATE' : 'CREATE',
        targetSiteName: '사례',
        targetId: editingId || 'new_case',
        details: `사례 ${editingId ? '수정' : '추가'}: ${formData.siteName} (${formData.complaintContent.substring(0, 20)}...)`
      });
    }

    handleReset();
  };

  const handleEdit = (item: any) => {
    setFormData({
      siteName: item.siteName || '',
      region: item.region || '',
      type: Array.isArray(item.type) ? item.type : (item.type ? [item.type] : []),
      complaintContent: item.complaintContent || '',
      phase: item.phase || '',
      complainant: item.complainant || '',
      requestContent: Array.isArray(item.requestContent) ? item.requestContent : (Array.isArray(item.requestType) ? item.requestType : []),
      occurrenceDate: item.occurrenceDate || '',
      progress: item.progress || '',
      details: item.details || '',
      compensationMethod: item.compensationMethod || item.compensationStatus || '',
      compensationAmount: item.compensationAmount || 0
    });
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, cases: any[] | null) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const caseToDelete = cases?.find(c => c.id === id);
        deleteDocumentNonBlocking(doc(db, 'caseExamples', id));
        toast({ title: "삭제 완료", description: "사례가 삭제되었습니다." });

        // 활동 로그
        if (user) {
          await logActivity(db, {
            actorEmail: user.email || '',
            actorName: user.displayName || user.email?.split('@')[0] || 'Unknown',
            action: 'DELETE',
            targetSiteName: '사례',
            targetId: id,
            details: `사례 삭제: ${caseToDelete?.siteName || 'Unknown'}`
          });
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast({ title: "삭제 실패", description: "삭제 중 오류가 발생했습니다.", variant: "destructive" });
      }
    }
  };

  const handleClearAllConfirm = async (cases: any[] | null) => {
    try {
      let count = 0;
      for (const c of cases || []) {
        deleteDocumentNonBlocking(doc(db, 'caseExamples', c.id));
        count++;
      }
      toast({ title: "전체 삭제 완료", description: `${count}개의 데이터를 삭제했습니다.` });

      // 활동 로그
      if (user) {
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: user.displayName || user.email?.split('@')[0] || 'Unknown',
          action: 'DELETE',
          targetSiteName: '사례',
          targetId: 'clear_all',
          details: `사례 전체 삭제: ${count}건`
        });
      }
    } catch (error) {
      console.error('Clear all error:', error);
      toast({ title: "삭제 실패", description: "데이터 삭제 중 오류가 발생했습니다.", variant: "destructive" });
    } finally {
      setShowDeleteAllConfirm(false);
    }
  };

  return {
    formData,
    editingId,
    showDeleteAllConfirm,
    handleInputChange,
    toggleType,
    toggleRequestContent,
    handleReset,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleClearAllConfirm,
    setShowDeleteAllConfirm
  };
}
