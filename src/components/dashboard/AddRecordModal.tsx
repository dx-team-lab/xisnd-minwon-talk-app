'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FILTER_OPTIONS, REQUEST_TYPE_OPTIONS, COMPENSATION_STATUS_OPTIONS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddRecordModal({ isOpen, onClose }: AddRecordModalProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('guide');

  // Form states for Response Guide
  const [guideForm, setGuideForm] = useState({
    region: '',
    phase: '',
    type: '',
    cause: '',
    action: '',
  });

  // Form states for Case Example
  const [caseForm, setCaseForm] = useState({
    region: '',
    phase: '',
    type: '',
    complainant: '',
    requestType: '',
    compensationStatus: '',
    compensationAmount: '',
  });

  const handleGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'responseGuides'), {
        ...guideForm,
        type: [guideForm.type], // Store as array to match schema/filter logic
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: '대응 방안이 등록되었습니다.' });
      onClose();
      setGuideForm({ region: '', phase: '', type: '', cause: '', action: '' });
    } catch (error) {
      console.error('Error adding guide:', error);
      toast({ title: '등록 중 오류가 발생했습니다.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'caseExamples'), {
        ...caseForm,
        type: [caseForm.type],
        requestType: [caseForm.requestType],
        compensationAmount: Number(caseForm.compensationAmount) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: '보상 사례가 등록되었습니다.' });
      onClose();
      setCaseForm({
        region: '',
        phase: '',
        type: '',
        complainant: '',
        requestType: '',
        compensationStatus: '',
        compensationAmount: '',
      });
    } catch (error) {
      console.error('Error adding case:', error);
      toast({ title: '등록 중 오류가 발생했습니다.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-headline">새 데이터 등록</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guide">대응 방안</TabsTrigger>
            <TabsTrigger value="case">보상 사례</TabsTrigger>
          </TabsList>

          {/* Response Guide Form */}
          <TabsContent value="guide" className="space-y-4 pt-4">
            <form onSubmit={handleGuideSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>지역</Label>
                  <Select 
                    onValueChange={(val) => setGuideForm(prev => ({ ...prev, region: val }))}
                    value={guideForm.region}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.region.options.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>단계</Label>
                  <Select 
                    onValueChange={(val) => setGuideForm(prev => ({ ...prev, phase: val }))}
                    value={guideForm.phase}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.phase.options.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>유형</Label>
                <Select 
                    onValueChange={(val) => setGuideForm(prev => ({ ...prev, type: val }))}
                    value={guideForm.type}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.type.options.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

              <div className="space-y-2">
                <Label>원인</Label>
                <Input 
                  value={guideForm.cause}
                  onChange={(e) => setGuideForm(prev => ({ ...prev, cause: e.target.value }))}
                  placeholder="민원 발생 원인을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>조치방안</Label>
                <Textarea 
                  value={guideForm.action}
                  onChange={(e) => setGuideForm(prev => ({ ...prev, action: e.target.value }))}
                  placeholder="조치 방안을 상세히 입력하세요 (번호형)"
                  className="min-h-[120px]"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>취소</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  등록하기
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Case Example Form */}
          <TabsContent value="case" className="space-y-4 pt-4">
            <form onSubmit={handleCaseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>지역</Label>
                  <Select 
                    onValueChange={(val) => setCaseForm(prev => ({ ...prev, region: val }))}
                    value={caseForm.region}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.region.options.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>단계</Label>
                  <Select 
                    onValueChange={(val) => setCaseForm(prev => ({ ...prev, phase: val }))}
                    value={caseForm.phase}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.phase.options.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>유형</Label>
                  <Select 
                    onValueChange={(val) => setCaseForm(prev => ({ ...prev, type: val }))}
                    value={caseForm.type}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.type.options.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>민원인</Label>
                  <Input 
                    value={caseForm.complainant}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, complainant: e.target.value }))}
                    placeholder="민원인 구분 (예: 00아파트 주민)"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>요구유형</Label>
                  <Select 
                    onValueChange={(val) => setCaseForm(prev => ({ ...prev, requestType: val }))}
                    value={caseForm.requestType}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {REQUEST_TYPE_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>보상 여부</Label>
                  <Select 
                    onValueChange={(val) => setCaseForm(prev => ({ ...prev, compensationStatus: val }))}
                    value={caseForm.compensationStatus}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPENSATION_STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>보상 금액 (원)</Label>
                <Input 
                  type="number"
                  value={caseForm.compensationAmount}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, compensationAmount: e.target.value }))}
                  placeholder="숫자만 입력하세요"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>취소</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  등록하기
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
