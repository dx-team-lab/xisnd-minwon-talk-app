'use client';

import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { useCaseExampleForm } from './hooks/useCaseExampleForm';
import { useCaseExampleExcel } from './hooks/useCaseExampleExcel';
import { CaseExampleForm } from './CaseExampleForm';
import { CaseExampleTable } from './CaseExampleTable';

export default function CaseExampleSection() {
  const db = useFirestore();
  const { user } = useUser();

  // 사례 데이터 조회
  const casesQuery = useMemoFirebase(() => query(collection(db, 'caseExamples'), orderBy('createdAt', 'desc')), [db]);
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: cases, isLoading } = useCollection(casesQuery);
  const { data: userProfile } = useDoc(userProfileRef);

  // 폼 hook
  const formHook = useCaseExampleForm(userProfile as UserProfile | undefined);

  // 엑셀 hook
  const excelHook = useCaseExampleExcel();

  // 삭제 핸들러
  const handleDelete = (id: string) => {
    formHook.handleDelete(id, cases);
  };

  const handleClearAllConfirm = async () => {
    await formHook.handleClearAllConfirm(cases);
  };

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = async () => {
    await excelHook.handleExcelDownload(cases);
  };

  return (
    <div className="space-y-8">
      <CaseExampleForm
        formData={formHook.formData}
        editingId={formHook.editingId}
        isImporting={excelHook.isImporting}
        fileInputRef={excelHook.fileInputRef}
        onInputChange={formHook.handleInputChange}
        onToggleType={formHook.toggleType}
        onToggleRequestContent={formHook.toggleRequestContent}
        onReset={formHook.handleReset}
        onSubmit={formHook.handleSubmit}
        onExcelImportClick={excelHook.handleExcelImportClick}
        onExcelImport={excelHook.handleExcelImport}
        onExcelDownload={handleExcelDownload}
        onShowDeleteAll={() => formHook.setShowDeleteAllConfirm(true)}
      />

      <CaseExampleTable
        data={cases}
        isLoading={isLoading}
        onEdit={formHook.handleEdit}
        onDelete={handleDelete}
      />

      <ConfirmModal
        isOpen={formHook.showDeleteAllConfirm}
        onClose={() => formHook.setShowDeleteAllConfirm(false)}
        onConfirm={handleClearAllConfirm}
        title="사례 전체 삭제"
        description="정말 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      />
    </div>
  );
}
