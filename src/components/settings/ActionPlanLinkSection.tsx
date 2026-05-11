'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useFirestore, useUser, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { logActivity } from '@/lib/activity-logs';
import { useDoc } from '@/firebase';
import { UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Edit2, PlusCircle, RotateCcw, Save, ExternalLink, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { cn } from '@/lib/utils';
import { TYPE_BADGE_COLORS } from '@/lib/constants';

const TYPE_OPTIONS = ['교통', '낙진', '냄새', '분진', '빛', '소음', '일반', '진동', '파손'];

export default function ActionPlanLinkSection() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const toggleType = (val: string) => {
    setSelectedTypes(prev =>
      prev.includes(val) ? prev.filter(t => t !== val) : [...prev, val]
    );
  };
  const [isImporting, setIsImporting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const linksQuery = useMemoFirebase(() => query(collection(db, 'actionPlanLinks'), orderBy('createdAt', 'desc')), [db]);
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: links, isLoading } = useCollection(linksQuery);
  const { data: userProfile } = useDoc(userProfileRef);

  const handleReset = () => {
    setTitle('');
    setUrl('');
    setSelectedTypes([]);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast({ title: "입력 오류", description: "제목과 URL을 모두 입력해주세요.", variant: "destructive" });
      return;
    }

    const payload = {
      title: title.trim(),
      url: url.trim(),
      types: selectedTypes,
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid || 'system'
    };

    if (editingId) {
      updateDocumentNonBlocking(doc(db, 'actionPlanLinks', editingId), payload);
      toast({ title: "성공", description: "조치방안 링크가 수정되었습니다." });
    } else {
      addDocumentNonBlocking(collection(db, 'actionPlanLinks'), {
        ...payload,
        createdAt: serverTimestamp(),
        createdBy: user?.uid || 'system'
      });
      toast({ title: "성공", description: "조치방안 링크가 등록되었습니다." });

      // Activity log
      if (user) {
        const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: actorName,
          action: editingId ? 'UPDATE' : 'CREATE',
          targetSiteName: '조치방안 링크',
          targetId: editingId || 'new_link',
          details: `조치방안 링크 ${editingId ? '수정' : '추가'}: ${title}`
        });
      }
    }
    handleReset();
  };

  const handleEdit = (link: any) => {
    setTitle(link.title || '');
    setUrl(link.url || '');
    setSelectedTypes(Array.isArray(link.types) ? link.types : []);
    setEditingId(link.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
              // 제목 앞의 번호 제거: "01. 공사 정보 주민 안내" → "공사 정보 주민 안내"
              const rawTitle = String(row['제목'] || '').trim();
              const rowTitle = rawTitle.replace(/^\d+\.\s*/, '').trim();
              const rowUrl = String(row['내용'] || '').trim();
              if (!rowTitle) continue;

              // 유형1~유형4를 배열로 합산
              const types: string[] = [];
              for (let i = 1; i <= 4; i++) {
                const val = String(row[`유형${i}`] || '').trim();
                if (val) types.push(val);
              }

              addDocumentNonBlocking(collection(db, 'actionPlanLinks'), {
                title: rowTitle,
                url: rowUrl,
                types,
                createdAt: serverTimestamp(),
                createdBy: user?.uid || 'system'
              });
              successCount++;
            } catch (rowError) {
              console.error(`행 처리 중 오류:`, rowError, '행 데이터:', row);
            }
          }
          toast({ title: "임포트 완료", description: `${successCount}개의 링크가 등록되었습니다.` });

          // Activity log
          if (user) {
            const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
            await logActivity(db, {
              actorEmail: user.email || '',
              actorName: actorName,
              action: 'CREATE',
              targetSiteName: '조치방안 링크',
              targetId: 'excel_import',
              details: `조치방안 링크 엑셀 임포트: ${successCount}건`
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

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId) {
      const linkToDelete = links?.find(l => l.id === deleteConfirmId);
      deleteDocumentNonBlocking(doc(db, 'actionPlanLinks', deleteConfirmId));
      toast({ title: "삭제 완료", description: "링크가 삭제되었습니다." });

      // Activity log
      if (user) {
        const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: actorName,
          action: 'DELETE',
          targetSiteName: '조치방안 링크',
          targetId: deleteConfirmId,
          details: `조치방안 링크 삭제: ${linkToDelete?.title || 'Unknown'}`
        });
      }
      setDeleteConfirmId(null);
    }
  };

  const handleExcelDownload = async () => {
    console.log("엑셀 다운로드 함수 실행됨");
    if (!links || links.length === 0) {
      toast({ title: "다운로드 실패", description: "다운로드할 데이터가 없습니다.", variant: "destructive" });
      return;
    }

    try {
      const excelData = links.map(l => {
        const row: any = {
          '제목': l.title || '',
          '내용': l.url || ''
        };
        const types = Array.isArray(l.types) ? l.types : [];
        for (let i = 0; i < 4; i++) {
          row[`유형${i + 1}`] = types[i] || '';
        }
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "조치방안");

      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const excelBase64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBase64}`;
      link.download = `조치방안_데이터_${dateStr}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "다운로드 완료", description: "조치방안 링크 데이터가 엑셀로 저장되었습니다." });

      // Activity log
      if (user) {
        const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: actorName,
          action: 'CREATE',
          targetSiteName: '조치방안 링크',
          targetId: 'excel_export',
          details: `조치방안 링크 엑셀 다운로드: ${excelData.length}건`
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({ title: "다운로드 실패", description: "엑셀 파일 생성 중 오류가 발생했습니다.", variant: "destructive" });
    }
  };

  const handleDeleteAllConfirm = async () => {
    setIsDeletingAll(true);
    try {
      for (const l of links || []) {
        deleteDocumentNonBlocking(doc(db, 'actionPlanLinks', l.id));
      }
      toast({ title: "삭제 완료", description: "모든 조치방안 링크가 삭제되었습니다." });

      // Activity log
      if (user) {
        const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: actorName,
          action: 'DELETE',
          targetSiteName: '조치방안 링크',
          targetId: 'clear_all',
          details: `조치방안 링크 전체 삭제: ${(links || []).length}건`
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
        <CardHeader className="border-b bg-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <div className="h-5 w-1 bg-accent rounded-full" />
            조치방안 링크 {editingId ? '수정' : '등록'}
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
              엑셀 데이터 다운로드
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExcelImportClick}
              disabled={isImporting || isDeletingAll}
              className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            >
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              엑셀 데이터 가져오기
            </Button>
            <Button
              type="button"
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">제목 (조치방안명) *</label>
                <Input
                  placeholder="예: 통제원 배치"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">URL (쉐어포인트 링크) *</label>
                <Input
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">유형 (복수 선택 가능)</label>
              <div className="flex flex-wrap gap-4 p-3 bg-slate-50 rounded-lg border">
                {TYPE_OPTIONS.map(o => (
                  <div key={o} className="flex items-center space-x-2">
                    <Checkbox
                      id={`apl-type-${o}`}
                      checked={selectedTypes.includes(o)}
                      onCheckedChange={() => toggleType(o)}
                    />
                    <Label htmlFor={`apl-type-${o}`} className="text-sm cursor-pointer">{o}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" /> 초기화
              </Button>
              <Button type="submit" className="gap-2 px-8 bg-primary hover:bg-primary/90">
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
            <div className="h-5 w-1 bg-accent rounded-full" />
            조치방안 링크 목록
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table className="border-collapse min-w-[1000px]">
              <TableHeader className="bg-slate-50 border-b">
                <TableRow>
                  <TableHead className="h-12 font-bold text-slate-700 border-r text-sm px-4 w-[250px]">제목</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-center border-r text-sm w-[180px]">유형</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 border-r text-sm px-4">URL</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-center text-sm w-[100px]">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links && links.length > 0 ? (
                  links.map((l) => (
                    <TableRow key={l.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="border-r align-top p-4 font-bold text-slate-700">{l.title}</TableCell>
                      <TableCell className="border-r text-center align-top p-4">
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {Array.isArray(l.types) && l.types.length > 0 ? l.types.map((t: string) => (
                            <Badge
                              key={t}
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-none rounded-full text-sm font-bold whitespace-nowrap px-3 py-1"
                            >
                              {t}
                            </Badge>
                          )) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="border-r align-top p-4">
                        <div className="max-w-md truncate">
                          {l.url?.startsWith('http') ? (
                            <a
                              href={l.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-medium"
                              title={l.url}
                            >
                              {l.url} <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-500 text-sm">{l.url || '-'}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top p-4 text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(l)} className="text-slate-400 hover:text-primary">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(l.id)} className="text-slate-400 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20 text-slate-400">등록된 조치방안 링크가 없습니다.</TableCell>
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
        title="링크 삭제"
        description="정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      />

      <ConfirmModal
        isOpen={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        onConfirm={handleDeleteAllConfirm}
        title="조치방안 링크 전체 삭제"
        description="정말 모든 링크 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      />
    </div>
  );
}
