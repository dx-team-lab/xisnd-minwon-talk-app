'use client';

import { useState, useRef } from 'react';
import { useFirestore, useStorage, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, FileText, Globe, Plus, Trash2, ExternalLink, FileDown, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  forms?: ReferenceFile[]; // 다중 양식 파일
  examples?: ReferenceFile[]; // 다중 예시 파일
};

type SiteReference = {
  id: string;
  title: string;
  url: string;
};

const DEFAULT_CATEGORIES: DocumentCategory[] = [
  { id: 'diary', title: '민원 일지', when: '민원 접수 즉시', who: '민원 접수자', why: '분쟁 발생 시 사실기록 증빙' },
  { id: 'agreement', title: '민원 합의서', when: '보상 합의 시', who: 'BM', why: '보상금액의 근거' },
  { id: 'blasting', title: '발파 계획서 및 계측일지', when: '보상 합의 시', who: 'BM', why: '보상금액의 근거' },
  { id: 'noise', title: '소음 측정 일지', when: '소음, 진동 공정 진행 중 수시', who: '해당 공정 관리자', why: '분쟁 발생 시 근거자료' },
  { id: 'permit', title: '환경 인허가', when: '착공전, 공사 중 수시', who: '공무', why: '행정처분 대응 근거' },
  { id: 'pledge', title: '환경 서약서 및 교육일지', when: '소음, 진동 민원 접수 시', who: '해당 공정 관리자', why: '분쟁 발생 시 근거자료' },
  { id: 'operation', title: '살수차, 세륜기 운영 일지', when: '살수차, 세륜기 운영 시', who: 'BM', why: '분쟁 발생 시 근거자료' },
];

export default function ReferenceManagementSection() {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'references');
  }, [db]);

  const { data: references, isLoading: isReferencesLoading } = useDoc(settingsRef);
  
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'form' | 'example' | null>(null);
  
  const [newSite, setNewSite] = useState({ title: '', url: '' });
  const [isAddingSite, setIsAddingSite] = useState(false);

  const categories = references?.documents || DEFAULT_CATEGORIES;
  const sites = references?.sites || [];

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
      
      const updatedCategories = categories.map((cat: DocumentCategory) => {
        if (cat.id === categoryId) {
          const existingFiles = cat[type] || [];
          return {
            ...cat,
            [type]: [...existingFiles, ...newFiles]
          };
        }
        return cat;
      });
      
      await setDoc(doc(db, 'settings', 'references'), {
        documents: updatedCategories,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      toast({ title: '파일 업로드 완료', description: `${newFiles.length}개의 파일이 저장되었습니다.` });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ title: '업로드 실패', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingDocId(null);
      setUploadType(null);
    }
  };

  const handleDeleteFile = async (categoryId: string, type: 'forms' | 'examples', fileIndex: number) => {
    if (!db) return;

    try {
      const updatedCategories = categories.map((cat: DocumentCategory) => {
        if (cat.id === categoryId) {
          const files = [...(cat[type] || [])];
          files.splice(fileIndex, 1);
          return {
            ...cat,
            [type]: files
          };
        }
        return cat;
      });

      await setDoc(doc(db, 'settings', 'references'), {
        documents: updatedCategories,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ title: '파일 삭제 완료' });
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
    <div className="space-y-8">
      {/* Documents Section */}
      <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">문서 자료 관리</CardTitle>
              <CardDescription>각 카테고리별 양식 및 예시 파일을 업로드합니다.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat: DocumentCategory) => (
              <div key={cat.id} className="p-5 border rounded-2xl bg-white shadow-sm space-y-4 hover:border-primary/30 transition-colors">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{cat.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-slate-600">대상:</span> {cat.who} | 
                    <span className="font-semibold text-slate-600 ml-2">시기:</span> {cat.when}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-slate-500">양식 파일</Label>
                    <div className="space-y-2">
                      <Button 
                        variant="secondary"
                        size="sm"
                        className="w-full h-10 rounded-xl relative overflow-hidden"
                        asChild
                      >
                        <label className="cursor-pointer">
                          {uploadingDocId === cat.id && uploadType === 'form' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              파일 추가
                            </>
                          )}
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
                      
                      {/* Form Files List */}
                      <div className="space-y-1">
                        {cat.forms && cat.forms.length > 0 ? (
                          cat.forms.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 pl-3 bg-slate-50 rounded-lg group">
                              <span className="text-xs text-slate-600 truncate max-w-[150px]">{file.name}</span>
                              <div className="flex items-center gap-1">
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1 text-slate-400 hover:text-primary">
                                  <FileDown className="h-3.5 w-3.5" />
                                </a>
                                <button 
                                  onClick={() => handleDeleteFile(cat.id, 'forms', idx)}
                                  className="p-1 text-slate-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-[10px] text-slate-400 text-center py-2 border border-dashed rounded-lg bg-slate-50/50">
                            등록된 파일이 없습니다.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-slate-500">예시 파일</Label>
                    <div className="space-y-2">
                      <Button 
                        variant="secondary"
                        size="sm"
                        className="w-full h-10 rounded-xl relative overflow-hidden"
                        asChild
                      >
                        <label className="cursor-pointer">
                          {uploadingDocId === cat.id && uploadType === 'example' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              파일 추가
                            </>
                          )}
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

                      {/* Example Files List */}
                      <div className="space-y-1">
                        {cat.examples && cat.examples.length > 0 ? (
                          cat.examples.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 pl-3 bg-slate-50 rounded-lg group">
                              <span className="text-xs text-slate-600 truncate max-w-[150px]">{file.name}</span>
                              <div className="flex items-center gap-1">
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1 text-slate-400 hover:text-primary">
                                  <Eye className="h-3.5 w-3.5" />
                                </a>
                                <button 
                                  onClick={() => handleDeleteFile(cat.id, 'examples', idx)}
                                  className="p-1 text-slate-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-[10px] text-slate-400 text-center py-2 border border-dashed rounded-lg bg-slate-50/50">
                            등록된 파일이 없습니다.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
          <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
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
              <div key={site.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="font-bold text-slate-700">{site.title}</p>
                    <p className="text-xs text-slate-400 font-mono">{site.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-full text-slate-400 hover:text-primary">
                    <a href={site.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteSite(site.id)}
                    className="h-9 w-9 rounded-full text-slate-400 hover:text-red-500"
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
    </div>
  );
}
