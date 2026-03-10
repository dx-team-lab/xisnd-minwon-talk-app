'use client';

import { useState } from 'react';
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
import { Loader2, Trash2, Edit2, PlusCircle, RotateCcw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { FILTER_OPTIONS, CASE_BADGE_COLORS, METHOD_BADGE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function CaseExampleSection() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    region: '',
    phase: '',
    type: [] as string[],
    complainant: '',
    requestType: [] as string[],
    compensationStatus: '',
    compensationAmount: 0
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const toggleRequestType = (val: string) => {
    setFormData(prev => {
      const current = prev.requestType || [];
      const next = current.includes(val)
        ? current.filter(t => t !== val)
        : [...current, val];
      return { ...prev, requestType: next };
    });
  };

  const handleReset = () => {
    setFormData({ region: '', phase: '', type: [], complainant: '', requestType: [], compensationStatus: '', compensationAmount: 0 });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { region, phase, type, complainant, requestType, compensationStatus, compensationAmount } = formData;
    
    if (!region || !phase || !type.length || !complainant || !requestType.length || !compensationStatus) {
      toast({ title: "입력 오류", description: "필수 항목을 모두 입력해주세요.", variant: "destructive" });
      return;
    }

    const isCompensated = compensationStatus !== '미보상';
    if (isCompensated && (compensationAmount === undefined || compensationAmount < 0)) {
      toast({ title: "입력 오류", description: "보상금액을 올바르게 입력해주세요.", variant: "destructive" });
      return;
    }

    const payload = {
      ...formData,
      compensationAmount: Number(compensationAmount),
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
      region: item.region,
      phase: item.phase,
      type: Array.isArray(item.type) ? item.type : [item.type],
      complainant: item.complainant,
      requestType: Array.isArray(item.requestType) ? item.requestType : [item.requestType],
      compensationStatus: item.compensationStatus,
      compensationAmount: item.compensationAmount || 0
    });
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteDocumentNonBlocking(doc(db, 'caseExamples', deleteConfirmId));
      toast({ title: "삭제 완료", description: "사례가 삭제되었습니다." });
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            {editingId ? <Edit2 className="h-5 w-5 text-amber-500" /> : <PlusCircle className="h-5 w-5 text-primary" />}
            사례 {editingId ? '수정' : '신규 등록'}
          </CardTitle>
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
                          id={`type-case-${o}`} 
                          checked={formData.type.includes(o)}
                          onCheckedChange={() => toggleType(o)}
                        />
                        <Label htmlFor={`type-case-${o}`} className="text-sm cursor-pointer">{o}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">민원인 *</label>
                    <Input 
                      placeholder="민원인 정보 입력" 
                      value={formData.complainant}
                      onChange={(e) => handleInputChange('complainant', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">보상방식 *</label>
                    <Select value={formData.compensationStatus} onValueChange={(val) => handleInputChange('compensationStatus', val)}>
                      <SelectTrigger><SelectValue placeholder="보상방식 선택" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="과태료">과태료</SelectItem>
                        <SelectItem value="시설보수">시설보수</SelectItem>
                        <SelectItem value="현물보상">현물보상</SelectItem>
                        <SelectItem value="미보상">미보상</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">요구사항 * (복수 선택 가능)</label>
                  <div className="flex flex-wrap gap-4 p-3 bg-slate-50 rounded-lg border">
                    {FILTER_OPTIONS.compensation.options.filter(o => o !== '전체').map(o => (
                      <div key={o} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`req-type-${o}`} 
                          checked={formData.requestType.includes(o)}
                          onCheckedChange={() => toggleRequestType(o)}
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
                    disabled={formData.compensationStatus === '미보상'}
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
          <CardTitle className="text-lg">사례 목록</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>지역</TableHead>
                  <TableHead>단계</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>민원인</TableHead>
                  <TableHead>요구사항</TableHead>
                  <TableHead>보상방식</TableHead>
                  <TableHead className="text-right">보상금액</TableHead>
                  <TableHead className="text-right w-[120px]">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases && cases.length > 0 ? (
                  cases.map((c) => (
                    <TableRow key={c.id} className="hover:bg-slate-50">
                      <TableCell>{c.region}</TableCell>
                      <TableCell>{c.phase}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(c.type) ? c.type.map((t: string) => (
                            <Badge key={t} variant="secondary" className="text-[10px] px-1">{t}</Badge>
                          )) : <Badge variant="secondary" className="text-[10px] px-1">{c.type}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>{c.complainant}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(c.requestType) ? c.requestType.map((t: string) => (
                            <Badge key={t} variant="outline" className={cn("font-bold", CASE_BADGE_COLORS[t] || "")}>
                              {t}
                            </Badge>
                          )) : (
                            <Badge variant="outline" className={cn("font-bold", CASE_BADGE_COLORS[c.requestType] || "")}>
                              {c.requestType}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-bold", METHOD_BADGE_COLORS[c.compensationStatus] || "")}>
                          {c.compensationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {c.compensationAmount?.toLocaleString()} 원
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} className="text-slate-400 hover:text-primary">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(c.id)} className="text-slate-400 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-400">등록된 사례가 없습니다.</TableCell>
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
        title="사례 삭제"
        description="정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      />
    </div>
  );
}
