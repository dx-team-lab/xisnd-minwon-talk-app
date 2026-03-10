
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Trash2, Edit2, PlusCircle, RotateCcw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { FILTER_OPTIONS } from '@/lib/constants';

export default function ResponseGuideSection() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    region: '',
    phase: '',
    type: '',
    cause: '',
    action: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const guidesQuery = useMemoFirebase(() => query(collection(db, 'responseGuides'), orderBy('createdAt', 'desc')), [db]);
  const { data: guides, isLoading } = useCollection(guidesQuery);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData({ region: '', phase: '', type: '', cause: '', action: '' });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { region, phase, type, cause, action } = formData;
    
    if (!region || !phase || !type || !cause || !action) {
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
      type: guide.type,
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

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            {editingId ? <Edit2 className="h-5 w-5 text-amber-500" /> : <PlusCircle className="h-5 w-5 text-primary" />}
            대응 방안 {editingId ? '수정' : '신규 등록'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">유형 *</label>
                <Select value={formData.type} onValueChange={(val) => handleInputChange('type', val)}>
                  <SelectTrigger><SelectValue placeholder="유형 선택" /></SelectTrigger>
                  <SelectContent>
                    {FILTER_OPTIONS.type.options.filter(o => o !== '전체').map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">원인 *</label>
              <Textarea 
                placeholder="민원 발생 원인을 상세히 입력하세요" 
                value={formData.cause}
                onChange={(e) => handleInputChange('cause', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">조치사항 *</label>
              <Textarea 
                placeholder="대응 조치사항을 입력하세요" 
                value={formData.action}
                onChange={(e) => handleInputChange('action', e.target.value)}
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
                  <TableHead className="w-[100px]">유형</TableHead>
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
                      <TableCell>{g.type}</TableCell>
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
    </div>
  );
}
