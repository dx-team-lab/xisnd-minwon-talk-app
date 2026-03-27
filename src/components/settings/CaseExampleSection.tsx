'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useFirestore, useUser, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Trash2, Edit2, PlusCircle, RotateCcw, Save, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import {
  FILTER_OPTIONS,
  CASE_BADGE_COLORS,
  METHOD_BADGE_COLORS,
  TYPE_BADGE_COLORS,
  PROGRESS_OPTIONS,
  REQUEST_TYPE_OPTIONS,
  COMPENSATION_STATUS_OPTIONS
} from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function CaseExampleSection() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  // 12개 필드 상태 관리
  const [formData, setFormData] = useState({
    siteName: '',
    region: '',
    type: [] as string[],
    complaintContent: '',
    phase: '',
    complainant: '',
    requestContent: [] as string[],
    occurrenceDate: '',
    progress: '',
    details: '',
    compensationMethod: '',
    compensationAmount: 0
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const casesQuery = useMemoFirebase(() => query(collection(db, 'caseExamples'), orderBy('createdAt', 'desc')), [db]);
  const { data: cases, isLoading } = useCollection(casesQuery);

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
    setFormData({
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
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
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
          // 1. 지역명 자동 변환 ('상업지역' -> '상업')
          const mapRegion = (raw: string) => {
            if (!raw) return '';
            if (raw.includes('공업')) return '공업';
            if (raw.includes('민감')) return '민감';
            if (raw.includes('상업')) return '상업';
            if (raw.includes('주거')) return '주거';
            return raw.replace('지역', '').trim();
          };
          // 2. 단계명 자동 변환 ('준공' -> '준공이후')
          const mapPhase = (raw: string) => {
            if (!raw) return '';
            if (raw.includes('착수') || raw.includes('착공전')) return '착공전';
            if (raw.includes('철거') || raw.includes('토공')) return '토공';
            if (raw.includes('골조')) return '골조';
            if (raw.includes('마감')) return '마감';
            if (raw.includes('준공')) return '준공';
            return raw;
          };
          let successCount = 0;
          for (const row of data as any[]) {
            // 3. 날짜 형식 변환
            const rawOccurrenceDate = row['발생 일시'] || '';
            let formattedDate = '';
            if (rawOccurrenceDate) {
              if (typeof rawOccurrenceDate === 'number') {
                const date = new Date((rawOccurrenceDate - (25567 + 2)) * 86400 * 1000);
                formattedDate = date.toISOString().split('T')[0];
              } else {
                formattedDate = String(rawOccurrenceDate).replace(/\./g, '-');
              }
            }
            // 4. 현장명 앞의 숫자와 점 제거 ("26. 공덕역..." -> "공덕역...")
            const rawSiteName = row['현장명'] || '';
            const cleanSiteName = rawSiteName.replace(/^\d+\.\s*/, '').trim();
            // 5. 금액의 콤마(,) 제거 후 숫자로 변환 ("480,000" -> 480000)
            const rawAmount = String(row['보상금액(원)'] || '0').replace(/,/g, '');
            const cleanAmount = Number(rawAmount) || 0;
            // 6. 요구사항/유형의 띄어쓰기 완전 제거 ("정신적 피해 보상" -> "정신적피해보상")
            const cleanRequestContent = row['요구사항']
              ? String(row['요구사항']).split(',').map(t => t.replace(/\s+/g, ''))
              : [];
            const cleanType = row['유형']
              ? String(row['유형']).split(',').map(t => t.replace(/\s+/g, ''))
              : [];
            const payload = {
              siteName: cleanSiteName,
              region: mapRegion(row['지역'] || ''),
              phase: mapPhase(row['단계'] || ''),
              type: cleanType,
              complaintContent: row['민원 내용'] || '내용 없음',
              complainant: row['민원인'] || '-',
              requestContent: cleanRequestContent,
              occurrenceDate: formattedDate,
              progress: row['진행경과'] || '접수',
              compensationMethod: row['보상방식'] || '미보상',
              compensationAmount: cleanAmount,
              details: row['상세내용'] || '',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              createdBy: user?.uid || 'system'
            };

            // ⚠️ caseExamples 컬렉션에 저장
            addDocumentNonBlocking(collection(db, 'caseExamples'), payload);
            successCount++;
          }
          toast({ title: "임포트 완료", description: `${successCount}개의 데이터가 성공적으로 등록되었습니다.` });
        } catch (error) {
          console.error("Parse error inside onload:", error);
          toast({ title: "임포트 실패", description: "데이터 변환 중 오류가 발생했습니다.", variant: "destructive" });
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

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        deleteDocumentNonBlocking(doc(db, 'caseExamples', id));
        toast({ title: "삭제 완료", description: "사례가 삭제되었습니다." });
      } catch (error) {
        console.error('Delete error:', error);
        toast({ title: "삭제 실패", description: "삭제 중 오류가 발생했습니다.", variant: "destructive" });
      }
    }
  };

  const handleClearAllConfirm = async () => {
    setIsImporting(true);
    try {
      let count = 0;
      for (const c of cases || []) {
        deleteDocumentNonBlocking(doc(db, 'caseExamples', c.id));
        count++;
      }
      toast({ title: "전체 삭제 완료", description: `${count}개의 데이터를 삭제했습니다.` });
    } catch (error) {
      console.error('Clear all error:', error);
      toast({ title: "삭제 실패", description: "데이터 삭제 중 오류가 발생했습니다.", variant: "destructive" });
    } finally {
      setIsImporting(false);
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
            사례 {editingId ? '수정' : '신규 등록'}
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
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteAllConfirm(true)}
              disabled={isImporting}
              className="text-slate-400 hover:text-destructive"
            >
              전체 삭제
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* 왼쪽 컬럼 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">현장명 *</label>
                  <Input
                    placeholder="현장 이름 입력"
                    value={formData.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                          id={`type-case-${o}`}
                          checked={formData.type.includes(o)}
                          onCheckedChange={() => toggleType(o)}
                        />
                        <Label htmlFor={`type-case-${o}`} className="text-sm cursor-pointer">{o}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">민원 내용 *</label>
                  <Textarea
                    placeholder="상세 민원 내용을 입력하세요"
                    value={formData.complaintContent}
                    onChange={(e) => handleInputChange('complaintContent', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              {/* 오른쪽 컬럼 */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">민원인 *</label>
                    <Input
                      placeholder="민원인 정보"
                      value={formData.complainant}
                      onChange={(e) => handleInputChange('complainant', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">발생 일시 *</label>
                    <Input
                      type="date"
                      value={formData.occurrenceDate}
                      onChange={(e) => handleInputChange('occurrenceDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">진행경과 *</label>
                    <Select value={formData.progress} onValueChange={(val) => handleInputChange('progress', val)}>
                      <SelectTrigger><SelectValue placeholder="진행 상태" /></SelectTrigger>
                      <SelectContent>
                        {PROGRESS_OPTIONS.map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">보상방식 *</label>
                    <Select value={formData.compensationMethod} onValueChange={(val) => handleInputChange('compensationMethod', val)}>
                      <SelectTrigger><SelectValue placeholder="보상 방식" /></SelectTrigger>
                      <SelectContent>
                        {COMPENSATION_STATUS_OPTIONS.map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">요구사항 * (복수 선택 가능)</label>
                  <div className="flex flex-wrap gap-4 p-3 bg-slate-50 rounded-lg border">
                    {REQUEST_TYPE_OPTIONS.map(o => (
                      <div key={o} className="flex items-center space-x-2">
                        <Checkbox
                          id={`req-type-${o}`}
                          checked={formData.requestContent.includes(o)}
                          onCheckedChange={() => toggleRequestContent(o)}
                        />
                        <Label htmlFor={`req-type-${o}`} className="text-sm cursor-pointer">{o}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">보상금액 (원)</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.compensationAmount}
                    onChange={(e) => handleInputChange('compensationAmount', Number(e.target.value))}
                    disabled={formData.compensationMethod === '미보상'}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">상세내용 및 관련 링크</label>
              <Textarea
                placeholder="내용 입력 또는 URL 주소를 넣으면 대시보드에서 '문서 보기' 링크로 자동 변환됩니다."
                value={formData.details}
                onChange={(e) => handleInputChange('details', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" /> 초기화
              </Button>
              <Button type="submit" className="gap-2 px-8 bg-primary hover:bg-primary/90">
                {editingId ? <><Save className="h-4 w-4" /> 수정</> : <><PlusCircle className="h-4 w-4" /> 등록</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table List */}
      <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg">사례 목록</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[1400px]">
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>현장명</TableHead>
                    <TableHead>지역</TableHead>
                    <TableHead>단계</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>민원 내용</TableHead>
                    <TableHead>발생 일시</TableHead>
                    <TableHead>진행</TableHead>
                    <TableHead>민원인</TableHead>
                    <TableHead>상세내용</TableHead>
                    <TableHead>보상방식</TableHead>
                    <TableHead className="text-right">보상금액</TableHead>
                    <TableHead className="text-right w-[120px]">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases && cases.length > 0 ? (
                    cases.map((c) => (
                      <TableRow key={c.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-700">{c.siteName}</TableCell>
                        <TableCell>{c.region}</TableCell>
                        <TableCell>{c.phase}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(c.type) && c.type.map((t: string) => (
                              <Badge
                                key={t}
                                variant="outline"
                                className={cn("text-[10px] font-bold", TYPE_BADGE_COLORS[t] || "bg-secondary text-secondary-foreground")}
                              >
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] text-xs text-slate-600 truncate">{c.complaintContent}</TableCell>
                        <TableCell className="text-xs text-slate-600 whitespace-nowrap">{c.occurrenceDate}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] font-bold">
                            {c.progress}
                          </Badge>
                        </TableCell>
                        <TableCell>{c.complainant}</TableCell>
                        <TableCell className="max-w-[200px] text-xs text-slate-600 truncate">
                          {c.details?.startsWith('http') ? (
                            <a
                              href={c.details}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              문서 보기 <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          ) : (
                            c.details
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[10px] font-bold", METHOD_BADGE_COLORS[c.compensationMethod || c.compensationStatus] || "")}>
                            {c.compensationMethod || c.compensationStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm font-semibold">
                          {c.compensationAmount?.toLocaleString()} 원
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} className="text-slate-400 hover:text-primary">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-12 text-slate-400">등록된 사례가 없습니다.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>


      <ConfirmModal
        isOpen={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        onConfirm={handleClearAllConfirm}
        title="사례 전체 삭제"
        description="정말 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      />
    </div>
  );
}
