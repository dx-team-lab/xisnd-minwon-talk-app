
'use client';

import { useState, useEffect, useRef } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Edit2, PlusCircle, RotateCcw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { FILTER_OPTIONS, TYPE_BADGE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

export default function ResponseGuideSection() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    region: '',
    phase: '',
    type: [] as string[],
    cause: '',
    action: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const guidesQuery = useMemoFirebase(() => query(collection(db, 'responseGuides'), orderBy('createdAt', 'desc')), [db]);
  const { data: guides, isLoading } = useCollection(guidesQuery);

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

  const handleReset = () => {
    setFormData({ region: '', phase: '', type: [], cause: '', action: '' });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { region, phase, type, cause, action } = formData;
    
    if (!region || !phase || !type.length || !cause || !action) {
      toast({ title: "입력 오류", description: "필수 항목을 모두 입력해주세요.", variant: "destructive" });
      return;
    }

    const payload = {
      ...formData,
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid
    };

    if (editingId) {
      updateDocumentNonBlocking(doc(db, 'responseGuides', editingId), payload);
      toast({ title: "성공", description: "대응 방안이 수정되었습니다." });
    } else {
      addDocumentNonBlocking(collection(db, 'responseGuides'), {
        ...payload,
        createdAt: serverTimestamp(),
        createdBy: user?.uid
      });
      toast({ title: "성공", description: "대응 방안이 등록되었습니다." });
    }
    handleReset();
  };

  const handleEdit = (guide: any) => {
    setFormData({
      region: guide.region,
      phase: guide.phase,
      type: Array.isArray(guide.type) ? guide.type : [guide.type],
      cause: guide.cause,
      action: guide.action
    });
    setEditingId(guide.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteDocumentNonBlocking(doc(db, 'responseGuides', deleteConfirmId));
      toast({ title: "삭제 완료", description: "대응 방안이 삭제되었습니다." });
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

          // 지역명 매핑: '상업지역' → '상업'
          const mapRegion = (raw: string) => {
            if (!raw) return '';
            if (raw.includes('공업')) return '공업';
            if (raw.includes('민감')) return '민감';
            if (raw.includes('상업')) return '상업';
            if (raw.includes('주거')) return '주거';
            return raw.replace('지역', '').trim();
          };

          let successCount = 0;
          for (const row of data as any[]) {
            try {
              // 유형: 콤마 기준 배열 변환 + 띄어쓰기 완전 제거
              const rawType = row['유형'] || '';
              const cleanType = rawType
                ? String(rawType).split(',').map((t: string) => t.replace(/\s+/g, ''))
                : [];

              const payload = {
                region: mapRegion(String(row['지역'] || '')),
                phase: String(row['단계'] || ''),
                type: cleanType,
                cause: String(row['원인'] || ''),
                action: String(row['조치방안'] || ''),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: user?.uid || 'system'
              };
              addDocumentNonBlocking(collection(db, 'responseGuides'), payload);
              successCount++;
            } catch (rowError) {
              console.error(`행 ${successCount + 1} 처리 중 오류:`, rowError, '행 데이터:', row);
            }
          }
          toast({ title: "임포트 완료", description: `${successCount}개의 데이터가 Firestore에 등록되었습니다.` });
        } catch (error) {
          console.error("Parse error inside onload:", error, "error message:", (error as Error)?.message, "stack:", (error as Error)?.stack);
          toast({ title: "임포트 실패", description: `엑셀 데이터 파싱 오류: ${(error as Error)?.message || '알 수 없는 오류'}`, variant: "destructive" });
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
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

  const handleDeleteAllConfirm = async () => {
    setIsDeletingAll(true);
    try {
      let count = 0;
      for (const g of guides || []) {
        deleteDocumentNonBlocking(doc(db, 'responseGuides', g.id));
        count++;
      }
      toast({ title: "삭제 완료", description: "모든 대응 방안이 삭제되었습니다." });
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
            대응 방안 {editingId ? '수정' : '신규 등록'}
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
              onClick={handleExcelImportClick} 
              disabled={isImporting}
              className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            >
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              엑셀 데이터 가져오기
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">지역 *</label>
                    <Select value={formData.region} onValueChange={(val) => handleInputChange('region', val)}>
                      <SelectTrigger><SelectValue placeholder="지역 선택" /></SelectTrigger>
                      <SelectContent>
                        {FILTER_OPTIONS.region.options.filter(o => o !== '전체').map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">단계 *</label>
                    <Select value={formData.phase} onValueChange={(val) => handleInputChange('phase', val)}>
                      <SelectTrigger><SelectValue placeholder="단계 선택" /></SelectTrigger>
                      <SelectContent>
                        {FILTER_OPTIONS.phase.options.filter(o => o !== '전체').map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">유형 * (복수 선택 가능)</label>
                  <div className="flex flex-wrap gap-4 p-3 bg-slate-50 rounded-lg border">
                    {FILTER_OPTIONS.type.options.filter(o => o !== '전체').map(o => (
                      <div key={o} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`type-guide-${o}`} 
                          checked={formData.type.includes(o)}
                          onCheckedChange={() => toggleType(o)}
                        />
                        <Label htmlFor={`type-guide-${o}`} className="text-sm cursor-pointer">{o}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">원인 *</label>
                  <Textarea 
                    placeholder="민원 발생 원인을 상세히 입력하세요" 
                    value={formData.cause}
                    onChange={(e) => handleInputChange('cause', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">조치사항 *</label>
                  <Textarea 
                    placeholder="대응 조치사항을 입력하세요" 
                    value={formData.action}
                    onChange={(e) => handleInputChange('action', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
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
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg">대응 방안 목록</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[100px]">지역</TableHead>
                  <TableHead className="w-[100px]">단계</TableHead>
                  <TableHead className="w-[150px]">유형</TableHead>
                  <TableHead>원인</TableHead>
                  <TableHead>조치사항</TableHead>
                  <TableHead className="text-right w-[120px]">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guides && guides.length > 0 ? (
                  guides.map((g) => (
                    <TableRow key={g.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{g.region}</TableCell>
                      <TableCell>{g.phase}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(g.type) ? g.type.map((t: string) => (
                            <Badge 
                              key={t} 
                              variant="outline" 
                              className={cn("text-xs font-bold", TYPE_BADGE_COLORS[t] || "bg-secondary text-secondary-foreground")}
                            >
                              {t}
                            </Badge>
                          )) : (
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs font-bold", TYPE_BADGE_COLORS[g.type] || "bg-secondary text-secondary-foreground")}
                            >
                              {g.type}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{g.cause}</TableCell>
                      <TableCell className="max-w-xs truncate">{g.action}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(g)} className="text-slate-400 hover:text-primary">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(g.id)} className="text-slate-400 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-400">등록된 대응 방안이 없습니다.</TableCell>
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
        title="대응 방안 삭제"
        description="정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      />

      <ConfirmModal
        isOpen={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        onConfirm={handleDeleteAllConfirm}
        title="대응 방안 전체 삭제"
        description="정말 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      />
    </div>
  );
}
