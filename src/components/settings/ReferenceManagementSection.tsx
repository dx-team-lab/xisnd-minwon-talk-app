import { useState } from 'react';
import { useFirestore, useStorage, useCollection, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc, setDoc, addDoc, updateDoc, deleteDoc, collection, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logActivity } from '@/lib/activity-logs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, FileText, Globe, Plus, Trash2, ExternalLink, FileDown, Eye, Pencil, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ReferenceFile = {
  name: string;
  url: string;
};

type DocumentCategory = {
  id: string;
  title: string;
  when: string;
  who: string;
  why: string;
  forms?: ReferenceFile[];
  examples?: ReferenceFile[];
};

type SiteReference = {
  id: string;
  title: string;
  url: string;
};

export default function ReferenceManagementSection() {
  const db = useFirestore();
  const storage = useStorage();
  const { user } = useUser();
  const { toast } = useToast();
  
  // References Collection
  const referencesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'references'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: categories, isLoading: isReferencesLoading } = useCollection(referencesQuery);

  // Sites (stay in settings/references for now as per current structure)
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'references');
  }, [db]);
  const { data: settingsData } = useDoc(settingsRef);
  const sites = settingsData?.sites || [];

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: userProfile } = useDoc(userProfileRef);
  
  // Category CRUD State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DocumentCategory | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    when: '',
    who: '',
    why: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // File Upload State
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'form' | 'example' | null>(null);
  
  // Site State
  const [newSite, setNewSite] = useState({ title: '', url: '' });
  const [isAddingSite, setIsAddingSite] = useState(false);

  const handleOpenDialog = (category?: DocumentCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        title: category.title,
        when: category.when,
        who: category.who,
        why: category.why
      });
    } else {
      setEditingCategory(null);
      setFormData({ title: '', when: '', who: '', why: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!db || !formData.title) return;
    
    setIsSaving(true);
    try {
      if (editingCategory) {
        // Update
        await updateDoc(doc(db, 'references', editingCategory.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast({ title: '수정 완료', description: '참고자료 항목이 수정되었습니다.' });
        
        if (user) {
          const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
          await logActivity(db, {
            actorEmail: user.email || '',
            actorName: actorName,
            action: 'UPDATE',
            targetSiteName: '참고자료',
            targetId: editingCategory.id,
            details: `참고자료 수정: ${formData.title}`
          });
        }
      } else {
        // Create
        await addDoc(collection(db, 'references'), {
          ...formData,
          forms: [],
          examples: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast({ title: '추가 완료', description: '새로운 참고자료 항목이 추가되었습니다.' });

        if (user) {
          const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
          await logActivity(db, {
            actorEmail: user.email || '',
            actorName: actorName,
            action: 'CREATE',
            targetSiteName: '참고자료',
            targetId: 'new',
            details: `참고자료 추가: ${formData.title}`
          });
        }
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: '저장 실패', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, title: string) => {
    if (!db || !confirm(`'${title}' 항목을 삭제하시겠습니까?`)) return;
    
    try {
      await deleteDoc(doc(db, 'references', id));
      toast({ title: '삭제 완료' });

      if (user) {
        const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: actorName,
          action: 'DELETE',
          targetSiteName: '참고자료',
          targetId: id,
          details: `참고자료 삭제: ${title}`
        });
      }
    } catch (error: any) {
      toast({ title: '삭제 실패', description: error.message, variant: 'destructive' });
    }
  };

  const handleFileUpload = async (categoryId: string, type: 'forms' | 'examples', files: FileList) => {
    if (!storage || !db) return;
    
    setUploadingDocId(categoryId);
    setUploadType(type === 'forms' ? 'form' : 'example');
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const storageRef = ref(storage, `references/${categoryId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return { name: file.name, url };
      });

      const newFiles = await Promise.all(uploadPromises);
      
      const cat = categories?.find(c => c.id === categoryId);
      if (!cat) return;

      const existingFiles = cat[type] || [];
      await updateDoc(doc(db, 'references', categoryId), {
        [type]: [...existingFiles, ...newFiles],
        updatedAt: serverTimestamp()
      });
      
      toast({ title: '파일 업로드 완료', description: `${newFiles.length}개의 파일이 저장되었습니다.` });

      if (user) {
        const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: actorName,
          action: 'UPDATE',
          targetSiteName: '참고자료 파일',
          targetId: categoryId,
          details: `${cat.title}에 파일 추가: ${newFiles.map(f => f.name).join(', ')}`
        });
      }
    } catch (error: any) {
      toast({ title: '업로드 실패', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingDocId(null);
      setUploadType(null);
    }
  };

  const handleDeleteFile = async (categoryId: string, type: 'forms' | 'examples', fileIndex: number) => {
    if (!db) return;

    try {
      const cat = categories?.find(c => c.id === categoryId);
      if (!cat) return;

      const files = [...(cat[type] || [])];
      const fileName = files[fileIndex]?.name;
      files.splice(fileIndex, 1);

      await updateDoc(doc(db, 'references', categoryId), {
        [type]: files,
        updatedAt: serverTimestamp()
      });

      toast({ title: '파일 삭제 완료' });

      if (user) {
        const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: actorName,
          action: 'DELETE',
          targetSiteName: '참고자료 파일',
          targetId: categoryId,
          details: `${cat.title}에서 파일 삭제: ${fileName}`
        });
      }
    } catch (error: any) {
      toast({ title: '삭제 실패', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddSite = async () => {
    if (!newSite.title || !newSite.url || !db) return;
    
    setIsAddingSite(true);
    try {
      const updatedSites = [...sites, { id: crypto.randomUUID(), ...newSite }];
      await setDoc(doc(db, 'settings', 'references'), {
        sites: updatedSites,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setNewSite({ title: '', url: '' });
      toast({ title: '사이트 추가 완료' });

      if (user) {
        const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: actorName,
          action: 'CREATE',
          targetSiteName: '참고 사이트',
          targetId: 'new_site',
          details: `참고 사이트 추가: ${newSite.title}`
        });
      }
    } catch (error: any) {
      toast({ title: '사이트 추가 실패', description: error.message, variant: 'destructive' });
    } finally {
      setIsAddingSite(false);
    }
  };

  const handleDeleteSite = async (id: string) => {
    if (!db) return;
    
    try {
      const updatedSites = sites.filter((site: SiteReference) => site.id !== id);
      await setDoc(doc(db, 'settings', 'references'), {
        sites: updatedSites,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      toast({ title: '사이트 삭제 완료' });

      if (user) {
        const site = sites.find((s: any) => s.id === id);
        const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: actorName,
          action: 'DELETE',
          targetSiteName: '참고 사이트',
          targetId: id,
          details: `참고 사이트 삭제: ${site?.title || 'Unknown'}`
        });
      }
    } catch (error: any) {
      toast({ title: '삭제 실패', variant: 'destructive' });
    }
  };

  if (isReferencesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Documents Section */}
      <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">문서 자료 관리</CardTitle>
              <CardDescription>각 카테고리별 양식 및 예시 파일을 관리합니다.</CardDescription>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()} className="rounded-xl font-bold">
            <Plus className="h-4 w-4 mr-2" />
            항목 추가
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {categories?.map((cat: DocumentCategory) => (
              <div key={cat.id} className="p-6 border rounded-2xl bg-white shadow-sm hover:border-primary/30 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-lg">{cat.title}</h3>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <p><span className="font-semibold text-slate-600">언제 사용:</span> {cat.when}</p>
                      <p><span className="font-semibold text-slate-600">누가 작성:</span> {cat.who}</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-600">중요성:</span> {cat.why}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(cat)} className="rounded-lg">
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      정보 수정
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(cat.id, cat.title)} className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      삭제
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                  {/* Form Files */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">양식 파일 (템플릿)</Label>
                      <Button asChild variant="ghost" size="sm" className="h-7 text-[11px] text-primary hover:bg-primary/5">
                        <label className="cursor-pointer">
                          {uploadingDocId === cat.id && uploadType === 'form' ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Plus className="h-3 w-3 mr-1" />
                          )}
                          파일 추가
                          <input 
                            type="file" 
                            multiple
                            className="hidden" 
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) handleFileUpload(cat.id, 'forms', files);
                            }}
                          />
                        </label>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {cat.forms && cat.forms.length > 0 ? (
                        cat.forms.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white transition-colors">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="text-xs text-slate-600 truncate font-medium">{file.name}</span>
                            </div>
                            <div className="flex gap-1 shrink-0 ml-2">
                              <button 
                                onClick={() => handleDeleteFile(cat.id, 'forms', idx)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-400 text-center py-4 border border-dashed rounded-xl bg-slate-50/50">
                          등록된 양식 파일이 없습니다.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Example Files */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">작성 예시 파일</Label>
                      <Button asChild variant="ghost" size="sm" className="h-7 text-[11px] text-primary hover:bg-primary/5">
                        <label className="cursor-pointer">
                          {uploadingDocId === cat.id && uploadType === 'example' ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Plus className="h-3 w-3 mr-1" />
                          )}
                          파일 추가
                          <input 
                            type="file" 
                            multiple
                            className="hidden" 
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) handleFileUpload(cat.id, 'examples', files);
                            }}
                          />
                        </label>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {cat.examples && cat.examples.length > 0 ? (
                        cat.examples.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white transition-colors">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Eye className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="text-xs text-slate-600 truncate font-medium">{file.name}</span>
                            </div>
                            <div className="flex gap-1 shrink-0 ml-2">
                              <button 
                                onClick={() => handleDeleteFile(cat.id, 'examples', idx)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-400 text-center py-4 border border-dashed rounded-xl bg-slate-50/50">
                          등록된 예시 파일이 없습니다.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {categories?.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">등록된 참고자료 항목이 없습니다.</p>
                <Button variant="link" onClick={() => handleOpenDialog()} className="mt-2 text-primary font-bold">
                  첫 번째 항목 추가하기
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sites Section */}
      <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">참고 사이트 관리</CardTitle>
              <CardDescription>우측 사이드바에 표시될 관련 사이트 링크를 관리합니다.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex-1 space-y-2">
              <Label className="text-xs font-bold ml-1">사이트 제목</Label>
              <Input 
                placeholder="예: 국토교통부" 
                value={newSite.title}
                onChange={(e) => setNewSite(prev => ({ ...prev, title: e.target.value }))}
                className="rounded-xl border-slate-200 h-11"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-xs font-bold ml-1">URL</Label>
              <Input 
                placeholder="https://..." 
                value={newSite.url}
                onChange={(e) => setNewSite(prev => ({ ...prev, url: e.target.value }))}
                className="rounded-xl border-slate-200 h-11"
              />
            </div>
            <Button 
              onClick={handleAddSite} 
              disabled={isAddingSite || !newSite.title || !newSite.url}
              className="h-11 rounded-xl px-8 font-bold"
            >
              {isAddingSite ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              추가
            </Button>
          </div>

          <div className="space-y-3">
            {sites.map((site: SiteReference) => (
              <div key={site.id} className="flex items-center justify-between p-4 border rounded-2xl hover:border-primary/30 hover:bg-slate-50/50 transition-all group">
                <div className="flex items-center gap-4">
                  <Globe className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                  <div>
                    <p className="font-bold text-slate-700">{site.title}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{site.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-full text-slate-400 hover:text-primary hover:bg-primary/5">
                    <a href={site.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteSite(site.id)}
                    className="h-9 w-9 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {sites.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Globe className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>추가된 참고 사이트가 없습니다.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingCategory ? '참고자료 항목 수정' : '새 참고자료 항목 추가'}
            </DialogTitle>
            <DialogDescription>
              테이블에 표시될 참고자료의 기본 정보를 입력해 주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-xs font-bold ml-1">구 분 (문서 제목)</Label>
              <Input
                id="title"
                placeholder="예: 민원 일지"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="when" className="text-xs font-bold ml-1">언제 사용하나요?</Label>
              <Input
                id="when"
                placeholder="예: 민원 접수 즉시"
                value={formData.when}
                onChange={(e) => setFormData(prev => ({ ...prev, when: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="who" className="text-xs font-bold ml-1">누가 작성하나요?</Label>
              <Input
                id="who"
                placeholder="예: 민원 접수자"
                value={formData.who}
                onChange={(e) => setFormData(prev => ({ ...prev, who: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="why" className="text-xs font-bold ml-1">해당 문서는 왜 작성하나요?</Label>
              <Textarea
                id="why"
                placeholder="예: 분쟁 발생 시 사실기록 증빙을 위해"
                value={formData.why}
                onChange={(e) => setFormData(prev => ({ ...prev, why: e.target.value }))}
                className="rounded-xl min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">취소</Button>
            <Button 
              onClick={handleSaveCategory} 
              disabled={isSaving || !formData.title}
              className="rounded-xl px-8 font-bold"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              {editingCategory ? '수정 완료' : '추가 완료'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
