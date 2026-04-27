
'use client';

import { useState } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy, deleteDoc, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Trash2, Edit2, PlusCircle, RotateCcw, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Site, SiteImage, SiteComplaint, UserProfile } from '@/lib/types';
import { compressImageToBase64 } from '@/lib/imageUtils';
import { logActivity } from '@/lib/activity-logs';
import { useDoc } from '@/firebase';


const REGION_OPTIONS = [
  '서울', '경기도', '인천', '대전', '대구', '부산', '울산', '광주', '세종', 
  '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주도'
];

const PHASE_OPTIONS = ['착공전', '토공', '골조', '마감', '준공'];
const REGION_TYPE_OPTIONS = ['주거', '상업', '공업', '민감'];

export default function SiteManagementSection() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: userProfile } = useDoc(userProfileRef);
  const actorName = (userProfile as UserProfile)?.name || user?.displayName || user?.email || 'Unknown';
  const actorEmail = user?.email || 'Unknown';


  const [formData, setFormData] = useState<Partial<Site>>({
    region: '',
    regionType: '주거',
    siteName: '',
    phase: [],
    completedCount: 0,
    inProgressCount: 0,
    mainContent: '',
    order: 0
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [images, setImages] = useState<{fileName: string, base64: string}[]>([]);
  const [existingImages, setExistingImages] = useState<SiteImage[]>([]);
  const [complaints, setComplaints] = useState<Partial<SiteComplaint>[]>([]);
  const [existingComplaints, setExistingComplaints] = useState<SiteComplaint[]>([]);
  const [expandedComplaints, setExpandedComplaints] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const toggleComplaintExpanded = (idx: number) => {
    setExpandedComplaints(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const linksQuery = useMemoFirebase(() => query(collection(db, 'actionPlanLinks'), orderBy('createdAt', 'desc')), [db]);
  const { data: links } = useCollection(linksQuery);

  const sitesQuery = useMemoFirebase(() => query(collection(db, 'sites'), orderBy('order', 'asc')), [db]);
  const { data: sites, isLoading } = useCollection(sitesQuery);

  const handleInputChange = (field: keyof Site, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData({
      region: '',
      regionType: '주거',
      siteName: '',
      phase: [],
      completedCount: 0,
      inProgressCount: 0,
      mainContent: '',
      order: sites ? sites.length : 0
    });
    setEditingId(null);
    setImages([]);
    setExistingImages([]);
    setComplaints([]);
    setExistingComplaints([]);
    setExpandedComplaints([]);
  };

  const addComplaint = () => {
    setComplaints([...complaints, { 
      number: complaints.length + 1, 
      complainant: '', 
      usage: '', 
      owner: '', 
      status: '진행중', 
      order: complaints.length, 
      stage: '민원 발생', 
      stageDetails: {},
      responsePlans: [],
      similarCases: []
    }]);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const remainingQuota = 5 - existingImages.length - images.length;
      const filesToProcess = newFiles.slice(0, remainingQuota);
      
      setIsUploading(true);
      try {
        const compressed = await Promise.all(
          filesToProcess.map(async file => {
            const base64 = await compressImageToBase64(file);
            return { fileName: file.name, base64 };
          })
        );
        setImages(prev => [...prev, ...compressed]);
      } catch (e) {
        console.error(e);
        toast({ title: '오류', description: '이미지 압축 중 오류가 발생했습니다.', variant: 'destructive' });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeNewImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = async (imageId: string) => {
    if (!editingId) return;
    try {
      await deleteDoc(doc(db, `sites/${editingId}/siteImages`, imageId));
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast({ title: '이미지 삭제', description: '기존 이미지가 삭제되었습니다.' });
    } catch (e) {
      console.error(e);
      toast({ title: '오류', description: '이미지 삭제에 실패했습니다.', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { region, siteName, phase, completedCount = 0, inProgressCount = 0 } = formData;

    if (!region || !siteName || !phase || (Array.isArray(phase) && phase.length === 0)) {
      toast({ title: "입력 오류", description: "필수 항목을 모두 입력해 주세요.", variant: "destructive" });
      return;
    }

    if (Number(completedCount) < 0 || Number(inProgressCount) < 0) {
      toast({ title: "입력 오류", description: "건수는 0 이상의 숫자여야 합니다.", variant: "destructive" });
      return;
    }

    // Validate complaints
    const numSet = new Set();
    for (const c of complaints) {
      if (!c.complainant?.trim() || !c.usage?.trim() || !c.owner?.trim() || c.number === undefined) {
        toast({ title: "입력 오류", description: "민원인 상세 정보의 빈 칸을 모두 채워주세요.", variant: "destructive" });
        return;
      }
      if (!c.stage) {
        toast({ title: "입력 오류", description: "민원인 상세 정보에서 현재 진행 단계를 선택해 주세요.", variant: "destructive" });
        return;
      }
      if (numSet.has(c.number)) {
        toast({ title: "입력 오류", description: `순번 ${c.number}이(가) 중복되었습니다. 서로 다른 번호를 입력해 주세요.`, variant: "destructive" });
        return;
      }
      numSet.add(c.number);
    }

    setIsUploading(true);

    const payload = {
      ...formData,
      completedCount: Number(completedCount),
      inProgressCount: Number(inProgressCount),
      order: Number(formData.order || 0),
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid
    };

    try {
      let targetSiteId = editingId;
      if (editingId) {
        updateDocumentNonBlocking(doc(db, 'sites', editingId), payload);
        toast({ title: "성공", description: "현장 정보가 수정되었습니다." });
        
        await logActivity(db, {
          actorEmail,
          actorName,
          action: 'UPDATE',
          targetSiteName: payload.siteName || 'Unknown',
          targetId: editingId,
          details: `현장 정보 수정: ${payload.siteName}`
        });
      } else {
        const docRef = await addDoc(collection(db, 'sites'), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user?.uid
        });
        targetSiteId = docRef.id;
        toast({ title: "성공", description: "현장 정보가 등록되었습니다." });

        await logActivity(db, {
          actorEmail,
          actorName,
          action: 'CREATE',
          targetSiteName: payload.siteName || 'Unknown',
          targetId: targetSiteId,
          details: `새 현장 등록: ${payload.siteName}`
        });
      }

      
      // Handle new subcollection images
      if (targetSiteId && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await addDoc(collection(db, `sites/${targetSiteId}/siteImages`), {
            base64: images[i].base64,
            fileName: images[i].fileName,
            order: existingImages.length + i,
            createdAt: serverTimestamp()
          });
        }
      }

      // Handle Complaints Save
      if (targetSiteId) {
        // Find deleted complaints
        const existingIds = existingComplaints.map(ec => ec.id);
        const currentIds = complaints.map(c => c.id).filter(id => id); // Get defined IDs
        const deletedIds = existingIds.filter(id => !currentIds.includes(id as string));
        
        for (const deletedId of deletedIds) {
          const deletedComp = existingComplaints.find(ec => ec.id === deletedId);
          await deleteDoc(doc(db, `sites/${targetSiteId}/complaints`, deletedId as string));
          
          await logActivity(db, {
            actorEmail,
            actorName,
            action: 'DELETE',
            targetSiteName: siteName as string,
            targetId: deletedId as string,
            details: `민원인 삭제: ${deletedComp?.complainant || deletedId}`
          });
        }


        // Add or Update
        for (let i = 0; i < complaints.length; i++) {
          const c = complaints[i];
          const cPayload = {
            complainant: c.complainant,
            usage: c.usage,
            owner: c.owner,
            status: c.status,
            number: Number(c.number || i + 1),
            order: Number(c.order || i),
            stage: c.stage,
            stageDetails: c.stageDetails || {},
            responsePlans: c.responsePlans || [],
            similarCases: c.similarCases || []
          };
          if (c.id) {
            await updateDoc(doc(db, `sites/${targetSiteId}/complaints`, c.id), cPayload);
            
            // Check if status changed or just general update
            const oldComp = existingComplaints.find(oc => oc.id === c.id);
            const statusChanged = oldComp && oldComp.status !== c.status;
            
            await logActivity(db, {
              actorEmail,
              actorName,
              action: 'UPDATE',
              targetSiteName: siteName as string,
              targetId: c.id,
              details: statusChanged 
                ? `민원 상태 변경: ${c.complainant} (${oldComp.status} -> ${c.status})`
                : `민원 정보 수정: ${c.complainant}`
            });
          } else {
            const newDoc = await addDoc(collection(db, `sites/${targetSiteId}/complaints`), { ...cPayload, createdAt: serverTimestamp() });
            
            await logActivity(db, {
              actorEmail,
              actorName,
              action: 'CREATE',
              targetSiteName: siteName as string,
              targetId: newDoc.id,
              details: `새 민원 등록: ${c.complainant}`
            });
          }
        }

      }
      
      setIsUploading(false);
      handleReset();
    } catch (e) {
      console.error(e);
      toast({ title: '오류', description: '현장 정보를 저장하는 중 오류가 발생했습니다.', variant: 'destructive' });
      setIsUploading(false);
    }
  };

  const handleEdit = async (site: Site) => {
    setFormData({
      region: site.region,
      regionType: site.regionType,
      siteName: site.siteName,
      phase: site.phase,
      completedCount: site.completedCount,
      inProgressCount: site.inProgressCount,
      mainContent: site.mainContent,
      order: site.order
    });
    setEditingId(site.id);
    setImages([]);
    setComplaints([]);
    setExistingComplaints([]);
    setExpandedComplaints([]);
    
    // Fetch existing images from subcollection
    const imagesQuery = query(collection(db, `sites/${site.id}/siteImages`), orderBy('order', 'asc'));
    getDocs(imagesQuery).then(snap => {
      setExistingImages(snap.docs.map(d => ({ id: d.id, ...d.data() } as SiteImage)));
    });

    const compsQuery = query(collection(db, `sites/${site.id}/complaints`), orderBy('order', 'asc'));
    getDocs(compsQuery).then(snap => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as SiteComplaint));
      setExistingComplaints(fetched);
      setComplaints(fetched);
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId) {
      try {
        // Cascade delete subcollection images
        const imagesQuery = query(collection(db, `sites/${deleteConfirmId}/siteImages`));
        const imgSnap = await getDocs(imagesQuery);
        for (const docSnap of imgSnap.docs) {
          await deleteDoc(docSnap.ref);
        }

        // Cascade delete subcollection complaints
        const cpQuery = query(collection(db, `sites/${deleteConfirmId}/complaints`));
        const cpSnap = await getDocs(cpQuery);
        for (const cSnap of cpSnap.docs) {
          await deleteDoc(cSnap.ref);
        }
      } catch (e) {
        console.warn('Failed to cascade delete subcollections', e);
      }
      
      const targetSite = sites?.find(s => s.id === deleteConfirmId);
      const targetSiteName = targetSite?.siteName || 'Unknown';

      deleteDocumentNonBlocking(doc(db, 'sites', deleteConfirmId));
      toast({ title: "삭제 완료", description: "현장 정보가 삭제되었습니다." });

      await logActivity(db, {
        actorEmail,
        actorName,
        action: 'DELETE',
        targetSiteName,
        targetId: deleteConfirmId,
        details: `현장 삭제: ${targetSiteName}`
      });

      setDeleteConfirmId(null);

    }
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {editingId ? <Edit2 className="h-5 w-5 text-amber-500" /> : <PlusCircle className="h-5 w-5 text-primary" />}
            현장 {editingId ? '수정' : '신규 추가'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">지역 *</label>
                <Select value={formData.region} onValueChange={(val) => handleInputChange('region', val)}>
                  <SelectTrigger><SelectValue placeholder="지역 선택" /></SelectTrigger>
                  <SelectContent>
                    {REGION_OPTIONS.map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">지역 유형 *</label>
                <Select value={formData.regionType} onValueChange={(val) => handleInputChange('regionType', val)}>
                  <SelectTrigger><SelectValue placeholder="유형 선택" /></SelectTrigger>
                  <SelectContent>
                    {REGION_TYPE_OPTIONS.map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">현장명 *</label>
                <Input
                  placeholder="현장명 입력 (예: 강릉자이르네 디오션)"
                  value={formData.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600">단계 (복수 선택) *</label>
                <div className="flex flex-wrap gap-4 pt-1">
                  {PHASE_OPTIONS.map(o => (
                    <div key={o} className="flex items-center space-x-2">
                      <Checkbox
                        id={`phase-${o}`}
                        checked={Array.isArray(formData.phase) ? formData.phase.includes(o) : formData.phase === o}
                        onCheckedChange={(checked) => {
                          const currentPhase = Array.isArray(formData.phase) ? formData.phase : (formData.phase ? [formData.phase] : []);
                          if (checked) {
                            handleInputChange('phase', [...currentPhase, o]);
                          } else {
                            handleInputChange('phase', currentPhase.filter(p => p !== o));
                          }
                        }}
                      />
                      <label htmlFor={`phase-${o}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                        {o}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">완료 건수</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.completedCount}
                  onChange={(e) => handleInputChange('completedCount', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">진행중 건수</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.inProgressCount}
                  onChange={(e) => handleInputChange('inProgressCount', e.target.value)}
                />
              </div>

              <div className="space-y-4 lg:col-span-3 pb-2 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-600 block">민원인 상세 목록</label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addComplaint}
                    className="gap-1 h-8"
                  >
                    <PlusCircle className="h-4 w-4" /> 민원인 추가
                  </Button>
                </div>
                
                {complaints.length > 0 && (
                  <div className="space-y-3">
                    {complaints.map((c, idx) => (
                      <div key={idx} className="flex flex-col gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                          <Input 
                            className="w-full sm:w-[60px]" 
                            placeholder="순번" 
                            type="number" 
                            value={c.number || ''} 
                            onChange={(e) => {
                              const newArr = [...complaints];
                              newArr[idx] = { ...newArr[idx], number: parseInt(e.target.value) };
                              setComplaints(newArr);
                            }} 
                          />
                          <Input 
                            className="w-full sm:flex-1 h-auto py-2" 
                            placeholder="민원인 (예: 팔송길 32)" 
                            value={c.complainant || ''} 
                            onChange={(e) => {
                              const newArr = [...complaints];
                              newArr[idx] = { ...newArr[idx], complainant: e.target.value };
                              setComplaints(newArr);
                            }} 
                          />
                          <Textarea 
                            rows={2}
                            className="w-full sm:flex-1 min-h-[50px] py-2 resize-y" 
                            placeholder="용도 (예: 1F~5F(15년) / 8세대)" 
                            value={c.usage || ''} 
                            onChange={(e) => {
                              const newArr = [...complaints];
                              newArr[idx] = { ...newArr[idx], usage: e.target.value };
                              setComplaints(newArr);
                            }} 
                          />
                          <Textarea 
                            rows={2}
                            className="w-full sm:flex-1 min-h-[50px] py-2 resize-y" 
                            placeholder="소유주 (예: 공용주택)" 
                            value={c.owner || ''} 
                            onChange={(e) => {
                              const newArr = [...complaints];
                              newArr[idx] = { ...newArr[idx], owner: e.target.value };
                              setComplaints(newArr);
                            }} 
                          />
                          <Select 
                            value={c.status || '진행중'} 
                            onValueChange={(val) => {
                              const newArr = [...complaints];
                              newArr[idx] = { ...newArr[idx], status: val as '완료' | '진행중' };
                              setComplaints(newArr);
                            }}
                          >
                            <SelectTrigger className="w-full sm:w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="진행중">진행중</SelectItem>
                              <SelectItem value="완료">완료</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 rounded-full" onClick={() => setComplaints(comp => comp.filter((_, i) => i !== idx))}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200"
                          onClick={() => toggleComplaintExpanded(idx)}
                        >
                          {expandedComplaints.includes(idx) ? '상세 입력 닫기 ▲' : '상세 입력 열기 ▼'}
                        </Button>
                        {expandedComplaints.includes(idx) && (
                          <div className="pt-4 mt-2 border-t border-slate-200 space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-600">현재 진행 단계 *</label>
                              <Select 
                                value={c.stage || ''} 
                                onValueChange={(val) => {
                                  const newArr = [...complaints];
                                  newArr[idx] = { ...newArr[idx], stage: val as any };
                                  setComplaints(newArr);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="진행 단계 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="민원 발생">민원 발생</SelectItem>
                                  <SelectItem value="민원 대응">민원 대응</SelectItem>
                                  <SelectItem value="보상 협상">보상 협상</SelectItem>
                                  <SelectItem value="합의 및 집행">합의 및 집행</SelectItem>
                                  <SelectItem value="완료">완료</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-600">민원 발생 내용</label>
                              <Textarea 
                                className="resize-y min-h-[60px]"
                                placeholder="예) 2025.09.17 현장 앞 현수막 게시(소음, 진동 등 정신적 피해 주장)"
                                value={c.stageDetails?.occurrence || ''}
                                onChange={(e) => {
                                  const newArr = [...complaints];
                                  newArr[idx] = { ...newArr[idx], stageDetails: { ...newArr[idx].stageDetails, occurrence: e.target.value } };
                                  setComplaints(newArr);
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-600">민원 대응 내용</label>
                              <Textarea 
                                className="resize-y min-h-[60px]"
                                placeholder="예) 2025.10.17 1차 주민 간담회(상황 설명 및 양해 요청 안내)"
                                value={c.stageDetails?.response || ''}
                                onChange={(e) => {
                                  const newArr = [...complaints];
                                  newArr[idx] = { ...newArr[idx], stageDetails: { ...newArr[idx].stageDetails, response: e.target.value } };
                                  setComplaints(newArr);
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-600">보상 협상 내용</label>
                              <Textarea 
                                className="resize-y min-h-[60px]"
                                placeholder="예) 2025.11.24 시의원 참석 및 의견 청취"
                                value={c.stageDetails?.negotiation || ''}
                                onChange={(e) => {
                                  const newArr = [...complaints];
                                  newArr[idx] = { ...newArr[idx], stageDetails: { ...newArr[idx].stageDetails, negotiation: e.target.value } };
                                  setComplaints(newArr);
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-600">합의 및 집행 내용</label>
                              <Textarea 
                                className="resize-y min-h-[60px]"
                                placeholder="예) 2026.04.03 민원처리비 집행 계획 품의"
                                value={c.stageDetails?.agreement || ''}
                                onChange={(e) => {
                                  const newArr = [...complaints];
                                  newArr[idx] = { ...newArr[idx], stageDetails: { ...newArr[idx].stageDetails, agreement: e.target.value } };
                                  setComplaints(newArr);
                                }}
                              />
                            </div>
                            
                            {/* 대응 방안 (Multi-select) */}
                            <div className="space-y-3 pt-4 border-t border-slate-200">
                              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Save className="h-4 w-4" /> 대응 방안 (중복 선택 가능)
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-lg border">
                                {links && links.length > 0 ? links.map(link => (
                                  <div key={link.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                      id={`complaint-${idx}-plan-${link.id}`}
                                      checked={c.responsePlans?.includes(link.title)}
                                      onCheckedChange={(checked) => {
                                        const newArr = [...complaints];
                                        const currentPlans = newArr[idx].responsePlans || [];
                                        if (checked) {
                                          newArr[idx] = { ...newArr[idx], responsePlans: [...currentPlans, link.title] };
                                        } else {
                                          newArr[idx] = { ...newArr[idx], responsePlans: currentPlans.filter(p => p !== link.title) };
                                        }
                                        setComplaints(newArr);
                                      }}
                                    />
                                    <label htmlFor={`complaint-${idx}-plan-${link.id}`} className="text-sm cursor-pointer truncate" title={link.title}>
                                      {link.title}
                                    </label>
                                  </div>
                                )) : (
                                  <p className="text-xs text-slate-400 col-span-2 text-center py-2">등록된 조치방안이 없습니다.</p>
                                )}
                              </div>
                            </div>

                            {/* 유사 사례 (Dynamic Rows) */}
                            <div className="space-y-3 pt-4 border-t border-slate-200">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                  <RotateCcw className="h-4 w-4" /> 유사 사례 (직접 입력)
                                </label>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 text-xs gap-1"
                                  onClick={() => {
                                    const newArr = [...complaints];
                                    newArr[idx] = { 
                                      ...newArr[idx], 
                                      similarCases: [...(newArr[idx].similarCases || []), { text: '', url: '' }] 
                                    };
                                    setComplaints(newArr);
                                  }}
                                >
                                  <PlusCircle className="h-3 w-3" /> 행 추가
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {(c.similarCases || []).length > 0 ? (c.similarCases || []).map((caseItem, caseIdx) => (
                                  <div key={caseIdx} className="flex gap-2 items-center">
                                    <span className="text-sm font-bold text-slate-400 shrink-0 w-5">{caseIdx + 1})</span>
                                    <div className="flex-1 flex gap-2">
                                      <Input 
                                        placeholder="사례 내용 (예: 동백-죽전간 도로 소음 민원 사례)" 
                                        value={caseItem.text}
                                        className="flex-1 h-8 text-sm"
                                        onChange={(e) => {
                                          const newArr = [...complaints];
                                          const cases = [...(newArr[idx].similarCases || [])];
                                          cases[caseIdx] = { ...cases[caseIdx], text: e.target.value };
                                          newArr[idx] = { ...newArr[idx], similarCases: cases };
                                          setComplaints(newArr);
                                        }}
                                      />
                                      <Input 
                                        placeholder="참조 URL (https://...)" 
                                        value={caseItem.url}
                                        className="flex-1 h-8 text-sm"
                                        onChange={(e) => {
                                          const newArr = [...complaints];
                                          const cases = [...(newArr[idx].similarCases || [])];
                                          cases[caseIdx] = { ...cases[caseIdx], url: e.target.value };
                                          newArr[idx] = { ...newArr[idx], similarCases: cases };
                                          setComplaints(newArr);
                                        }}
                                      />
                                    </div>
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 shrink-0 text-slate-300 hover:text-red-500 hover:bg-red-50"
                                      onClick={() => {
                                        const newArr = [...complaints];
                                        const cases = (newArr[idx].similarCases || []).filter((_, i) => i !== caseIdx);
                                        newArr[idx] = { ...newArr[idx], similarCases: cases };
                                        setComplaints(newArr);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )) : (
                                  <p className="text-xs text-slate-400 text-center py-2 bg-white rounded border border-dashed">추가된 유사 사례가 없습니다.</p>
                                )}
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {complaints.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-sm border hover:bg-slate-50 transition-colors border-dashed rounded-lg border-slate-300">
                    상단의 [민원인 추가] 버튼을 눌러 목록을 구성하세요.<br/>(등록된 민원을 기반으로 완료/진행중 건수가 자동 계산됩니다.)
                  </div>
                )}
              </div>

              <div className="space-y-2 lg:col-span-2 text-sm">
                <label className="font-bold text-slate-600">주요 내용</label>
                <Textarea
                  placeholder="주요 내용을 입력하세요"
                  value={formData.mainContent}
                  onChange={(e) => handleInputChange('mainContent', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2 lg:col-span-3 pb-2 z-10 w-full relative h-[border-box]">
                <label className="text-sm font-bold text-slate-600 block">관련 이미지 첨부 (최대 5장)</label>
                <div className="border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl p-6 text-center cursor-pointer relative">
                  <Input type="file" multiple accept="image/jpeg, image/png, image/gif, image/webp" onChange={handleImageChange} disabled={isUploading || (images.length + existingImages.length) >= 5} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <p className="text-sm text-slate-600">이미지를 드래그하여 놓거나 클릭하여 선택하세요 (최대 5장, JPG/PNG 형식만)</p>
                </div>
                {(images.length > 0 || existingImages.length > 0) && (
                  <div className="flex flex-wrap gap-4 mt-4 p-4 border rounded-lg bg-slate-50 relative">
                    {existingImages.map((img, idx) => (
                      <div key={`existing-${img.id || idx}`} className="relative group w-24 h-24 border rounded shadow-sm bg-white overflow-hidden">
                        <img src={img.base64} alt={`기존 첨부 ${idx}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {images.map((img, idx) => (
                      <div key={`new-${idx}`} className="relative group w-24 h-24 border rounded shadow-sm bg-white overflow-hidden flex items-center justify-center">
                        <img src={img.base64} alt={`새 첨부 ${idx}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">표시 순서</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2" disabled={isUploading}>
                <RotateCcw className="h-4 w-4" /> 초기화
              </Button>
              <Button type="submit" className="gap-2 px-8" disabled={isUploading}>
                {isUploading ? <><Loader2 className="h-4 w-4 animate-spin" /> 업로드 중...</> : editingId ? <><Save className="h-4 w-4" /> 저장</> : <><PlusCircle className="h-4 w-4" /> 등록</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-white py-4">
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <div className="h-5 w-1 bg-primary rounded-full" />
            현장 목록
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table className="border-collapse min-w-[800px]">
              <TableHeader className="bg-slate-50 border-b">
                <TableRow>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[60px] text-sm">순서</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 w-[180px] text-sm">지역</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-sm">현장명</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[160px] text-sm">단계</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[160px] text-sm">민원 건수(완료/진행)</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-sm text-center w-[120px]">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites && sites.length > 0 ? (
                  sites.map((site) => (
                    <TableRow key={site.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="border-r text-center text-sm text-slate-500">{site.order}</TableCell>
                      <TableCell className="border-r p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-900">{site.region}</span>
                          <span className="text-xs text-slate-500">{site.regionType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="border-r p-4 font-medium text-slate-800">
                        {site.siteName}
                      </TableCell>
                      <TableCell className="border-r text-center p-4">
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {(Array.isArray(site.phase) ? site.phase : [site.phase]).filter(Boolean).map((p: string) => (
                            <Badge key={p} variant="outline" className="rounded-full bg-slate-50 border-slate-200">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="border-r text-center p-4">
                        <div className="flex justify-center gap-2 text-xs font-bold">
                          <span className="text-emerald-600">{site.completedCount}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-blue-600">{site.inProgressCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(site as Site)} className="text-slate-400 hover:text-primary">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(site.id)} className="text-slate-400 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-slate-400">
                      등록된 현장 정보가 없습니다.
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
        title="현장 정보 삭제"
        description="정말 이 현장 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      />
    </div>
  );
}
