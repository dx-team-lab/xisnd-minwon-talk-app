
'use client';

import { useState, useRef } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { logActivity } from '@/lib/activity-logs';
import { useDoc } from '@/firebase';
import { UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Trash2, Edit2, PlusCircle, RotateCcw, Save, ExternalLink, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import * as XLSX from 'xlsx';

const COLLECTION_NAME = 'responsePlansV2';

export default function ResponsePlanV2Section() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    category: '',
    content: '',
    sharePointUrl: '',
    region: '전체',
    stage: '전체',
    type: [] as string[]
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const plansQuery = useMemoFirebase(() => query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc')), [db]);
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: plans, isLoading } = useCollection(plansQuery);
  const { data: userProfile } = useDoc(userProfileRef);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeToggle = (typeValue: string) => {
    setFormData(prev => ({
      ...prev,
      type: prev.type.includes(typeValue)
        ? prev.type.filter(t => t !== typeValue)
        : [...prev.type, typeValue]
    }));
  };

  const handleReset = () => {
    setFormData({ category: '', content: '', sharePointUrl: '', region: '전체', stage: '전체', type: [] });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { category, content } = formData;

    if (!category || !content) {
      toast({ title: "입력 오류", description: "'구 분'과 '주요 내용'은 필수 항목입니다.", variant: "destructive" });
      return;
    }

    const payload = {
      category: formData.category,
      content: formData.content,
      sharePointUrl: formData.sharePointUrl,
      region: formData.region,
      stage: formData.stage,
      type: formData.type,
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid
    };

    const actorName = (userProfile as UserProfile)?.name || user?.displayName || user?.email?.split('@')[0] || 'Unknown';

    if (editingId) {
      updateDocumentNonBlocking(doc(db, COLLECTION_NAME, editingId), payload);
      toast({ title: "성공", description: "대응 방안(신규)이 수정되었습니다." });
    } else {
      addDocumentNonBlocking(collection(db, COLLECTION_NAME), {
        ...payload,
        createdAt: serverTimestamp(),
        createdBy: user?.uid
      });
      toast({ title: "성공", description: "대응 방안(신규)이 등록되었습니다." });
    }

    // Activity log
    if (user) {
      await logActivity(db, {
        actorEmail: user.email || '',
        actorName: actorName,
        action: editingId ? 'UPDATE' : 'CREATE',
        targetSiteName: '대응 방안 (신규)',
        targetId: editingId || 'new_plan_v2',
        details: `대응 방안(신규) ${editingId ? '수정' : '추가'}: ${formData.category}`
      });
    }

    handleReset();
  };

  const handleEdit = (plan: any) => {
    setFormData({
      category: plan.category || '',
      content: plan.content || '',
      sharePointUrl: plan.sharePointUrl || '',
      region: plan.region || '전체',
      stage: plan.stage || '전체',
      type: Array.isArray(plan.type) ? plan.type : []
    });
    setEditingId(plan.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId) {
      const planToDelete = plans?.find(p => p.id === deleteConfirmId);
      deleteDocumentNonBlocking(doc(db, COLLECTION_NAME, deleteConfirmId));
      toast({ title: "삭제 완료", description: "대응 방안(신규)이 삭제되었습니다." });

      if (user) {
        const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: actorName,
          action: 'DELETE',
          targetSiteName: '대응 방안 (신규)',
          targetId: deleteConfirmId,
          details: `대응 방안(신규) 삭제: ${planToDelete?.category || 'Unknown'}`
        });
      }
      setDeleteConfirmId(null);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExcelImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet);

          let successCount = 0;
          for (const row of data as any[]) {
            try {
              const typeValue = row['유형'] || row['type'] || '';
              const typeArray = typeValue
                ? String(typeValue).split(',').map((t: string) => t.trim()).filter((t: string) => t)
                : [];

              const payload = {
                category: String(row['구 분'] || row['구분'] || row['category'] || ''),
                content: String(row['주요 내용'] || row['주요내용'] || row['content'] || ''),
                sharePointUrl: String(row['문서 링크'] || row['문서링크'] || row['sharePointUrl'] || row['url'] || ''),
                region: String(row['지역/지구'] || row['지역'] || row['region'] || '전체'),
                stage: String(row['단계'] || row['stage'] || '전체'),
                type: typeArray.length > 0 ? typeArray : [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: user?.uid || 'system'
              };
              if (payload.category || payload.content) {
                addDocumentNonBlocking(collection(db, COLLECTION_NAME), payload);
                successCount++;
              }
            } catch (rowError) {
              console.error(`행 처리 중 오류:`, rowError);
            }
          }
          toast({ title: "임포트 완료", description: `${successCount}개의 데이터가 등록되었습니다.` });

          if (user) {
            await logActivity(db, {
              actorEmail: user.email || '',
              actorName: user.displayName || user.email?.split('@')[0] || 'Unknown',
              action: 'CREATE',
              targetSiteName: '대응 방안 (신규)',
              targetId: 'excel_import',
              details: `대응 방안(신규) 엑셀 임포트: ${successCount}건`
            });
          }
        } catch (error) {
          console.error("Parse error:", error);
          toast({ title: "임포트 실패", description: `엑셀 데이터 파싱 오류: ${(error as Error)?.message || '알 수 없는 오류'}`, variant: "destructive" });
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };

      reader.onerror = () => {
        toast({ title: "임포트 실패", description: "엑셀 파일을 읽는 중 오류가 발생했습니다.", variant: "destructive" });
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: "임포트 실패", description: "엑셀 파일을 처리하는 중 오류가 발생했습니다.", variant: "destructive" });
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExcelDownload = () => {
    if (!plans || plans.length === 0) {
      toast({ title: "다운로드 실패", description: "다운로드할 데이터가 없습니다.", variant: "destructive" });
      return;
    }

    try {
      const excelData = plans.map(p => ({
        '구 분': p.category || '',
        '주요 내용': p.content || '',
        '문서 링크': p.sharePointUrl || '',
        '지역/지구': p.region || '',
        '단계': p.stage || '',
        '유형': Array.isArray(p.type) ? p.type.join(', ') : p.type || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "대응방안(신규)");

      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const excelBase64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBase64}`;
      link.download = `대응방안_신규_데이터_${dateStr}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "다운로드 완료", description: "대응 방안(신규) 데이터가 엑셀로 저장되었습니다." });
    } catch (error) {
      console.error('Download error:', error);
      toast({ title: "다운로드 실패", description: "엑셀 파일 생성 중 오류가 발생했습니다.", variant: "destructive" });
    }
  };

  const handleDeleteAllConfirm = async () => {
    setIsDeletingAll(true);
    try {
      let count = 0;
      for (const p of plans || []) {
        deleteDocumentNonBlocking(doc(db, COLLECTION_NAME, p.id));
        count++;
      }
      toast({ title: "삭제 완료", description: "모든 대응 방안(신규)이 삭제되었습니다." });

      if (user) {
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: user.displayName || user.email?.split('@')[0] || 'Unknown',
          action: 'DELETE',
          targetSiteName: '대응 방안 (신규)',
          targetId: 'clear_all',
          details: `대응 방안(신규) 전체 삭제: ${count}건`
        });
      }
    } catch (error) {
      console.error('Clear error:', error);
      toast({ title: "삭제 실패", description: "데이터 삭제 중 오류가 발생했습니다.", variant: "destructive" });
    } finally {
      setIsDeletingAll(false);
      setShowDeleteAllConfirm(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {editingId ? <Edit2 className="h-5 w-5 text-amber-500" /> : <PlusCircle className="h-5 w-5 text-primary" />}
            대응 방안 (신규) {editingId ? '수정' : '등록'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx, .xls"
              onChange={handleExcelImport}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExcelDownload}
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              <Download className="h-4 w-4 mr-2" />
              엑셀 다운로드
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExcelImportClick}
              disabled={isImporting}
              className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            >
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              엑셀 가져오기
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteAllConfirm(true)}
              disabled={isImporting || isDeletingAll}
              className="text-slate-400 hover:text-destructive"
            >
              전체 삭제
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">구 분 *</label>
                <Input
                  placeholder="예: 현장 확인 피해 사실 기록"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">문서 링크 (선택)</label>
                <Input
                  placeholder="SharePoint URL을 입력하세요 (선택 사항)"
                  value={formData.sharePointUrl}
                  onChange={(e) => handleInputChange('sharePointUrl', e.target.value)}
                  type="url"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">지역/지구</label>
                <Select value={formData.region} onValueChange={(val) => handleInputChange('region', val)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="전체">전체</SelectItem>
                    <SelectItem value="공업">공업</SelectItem>
                    <SelectItem value="주거">주거</SelectItem>
                    <SelectItem value="민감">민감</SelectItem>
                    <SelectItem value="상업">상업</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">단계</label>
                <Select value={formData.stage} onValueChange={(val) => handleInputChange('stage', val)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="전체">전체</SelectItem>
                    <SelectItem value="착공전(철거)">착공전(철거)</SelectItem>
                    <SelectItem value="토공">토공</SelectItem>
                    <SelectItem value="골조">골조</SelectItem>
                    <SelectItem value="마감">마감</SelectItem>
                    <SelectItem value="준공">준공</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3 space-y-3">
                <label className="text-sm font-bold text-slate-600">유형 (다중 선택 가능)</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['교통', '낙진', '냄새', '분진', '빛', '소음', '일반', '진동', '파손'].map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={formData.type.includes(type)}
                        onCheckedChange={() => handleTypeToggle(type)}
                      />
                      <label htmlFor={`type-${type}`} className="text-sm font-medium cursor-pointer">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">주요 내용 *</label>
              <Textarea
                placeholder="주요 내용을 입력하세요 (여러 줄 입력 가능)"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" /> 초기화
              </Button>
              <Button type="submit" className="gap-2 px-8">
                {editingId ? <><Save className="h-4 w-4" /> 저장</> : <><PlusCircle className="h-4 w-4" /> 등록</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table List */}
      <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-white py-4">
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <div className="h-5 w-1 bg-primary rounded-full" />
            대응 방안 (신규) 목록
            {plans && <span className="text-sm font-normal text-slate-400 ml-2">총 {plans.length}건</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table className="border-collapse min-w-[600px]">
              <TableHeader className="bg-slate-50 border-b">
                <TableRow>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[150px] text-sm whitespace-nowrap">구 분</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[100px] text-sm whitespace-nowrap">지역/지구</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[100px] text-sm whitespace-nowrap">단계</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[120px] text-sm whitespace-nowrap">유형</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-sm min-w-[250px]">주요 내용</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[130px] text-sm whitespace-nowrap">문서 링크</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-sm text-center w-[90px]">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans && plans.length > 0 ? (
                  plans.map((p) => (
                    <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="border-r text-center align-top p-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                        {p.category}
                      </TableCell>
                      <TableCell className="border-r text-center align-top p-4 text-sm text-slate-600 whitespace-nowrap">
                        {p.region || '-'}
                      </TableCell>
                      <TableCell className="border-r text-center align-top p-4 text-sm text-slate-600 whitespace-nowrap">
                        {p.stage || '-'}
                      </TableCell>
                      <TableCell className="border-r text-center align-top p-4 text-sm text-slate-600 whitespace-nowrap">
                        {Array.isArray(p.type) && p.type.length > 0 ? p.type.join(', ') : '-'}
                      </TableCell>
                      <TableCell className="border-r align-top p-4 text-sm leading-relaxed text-slate-600">
                        <span className="whitespace-pre-wrap">{p.content}</span>
                      </TableCell>
                      <TableCell className="border-r align-top p-4 text-center w-[130px] whitespace-nowrap">
                        {p.sharePointUrl ? (
                          <a
                            href={p.sharePointUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center justify-center gap-0.5 text-sm font-semibold"
                          >
                            [문서 보기] <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-slate-300 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="align-top p-4 text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="text-slate-400 hover:text-primary">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(p.id)} className="text-slate-400 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-20 text-slate-400">
                      등록된 대응 방안(신규)이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title="대응 방안(신규) 삭제"
        description="정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      />

      <ConfirmModal
        isOpen={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        onConfirm={handleDeleteAllConfirm}
        title="대응 방안(신규) 전체 삭제"
        description="정말 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      />
    </div>
  );
}
