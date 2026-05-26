'use client';

import { useState, useRef, useCallback } from 'react';
import { useFirestore, useStorage, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logActivity } from '@/lib/activity-logs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Image as ImageIcon, CheckCircle2, AlertCircle, FileUp, X } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Palette, Layers } from 'lucide-react';

export default function MainImageSettingsSection() {
  const db = useFirestore();
  const storage = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isUserLoading: isAuthLoading } = useUser();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isThemeUpdating, setIsThemeUpdating] = useState(false);

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'system');
  }, [db]);

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: settings, isLoading: isSettingsLoading } = useDoc(settingsRef);
  const { data: userProfile } = useDoc(userProfileRef);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast({ title: '이미지 파일만 선택 가능합니다', variant: 'destructive' });
      return;
    }
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setStatus('idle');
    setErrorMsg('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: '파일이 선택되지 않았습니다', variant: 'destructive' });
      return;
    }
    if (!storage || !db) {
      toast({ title: '서버 연결 준비 중입니다', description: '잠시 후 다시 시도해 주세요.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    setStatus('idle');
    setErrorMsg('');

    try {
      const storageRef = ref(storage, 'settings/main_dashboard_image');
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      await setDoc(doc(db, 'settings', 'system'), {
        mainImageUrl: downloadUrl,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setStatus('success');
      setFile(null);
      setPreviewUrl(null);
      toast({ title: '저장 완료', description: '메인 이미지가 성공적으로 변경되었습니다.' });

      // Record activity log
      if (user) {
        const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: actorName,
          action: 'UPDATE',
          targetSiteName: '시스템 설정',
          targetId: 'main_dashboard_image',
          details: '메인 이미지 업데이트'
        });
      }
    } catch (error: any) {
      console.error("Upload error details:", error);
      setStatus('error');
      const msg = error?.message || '알 수 없는 오류가 발생했습니다.';
      setErrorMsg(msg);
      toast({ title: '저장 실패', description: msg, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    if (!db || !user || isThemeUpdating) return;

    setIsThemeUpdating(true);
    const oldTheme = settings?.mainPageTheme || 'typeA';

    try {
      await setDoc(doc(db, 'settings', 'system'), {
        mainPageTheme: newTheme,
        updatedAt: serverTimestamp()
      }, { merge: true });

      const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
      await logActivity(db, {
        actorEmail: user.email || '',
        actorName: actorName,
        action: 'UPDATE',
        targetSiteName: '시스템 설정',
        targetId: 'main_page_theme',
        details: `메인 화면 디자인 타입 변경 (Type ${oldTheme === 'typeA' ? 'A' : 'B'} -> Type ${newTheme === 'typeA' ? 'A' : 'B'})`
      });

      toast({
        title: '디자인 테마 변경 완료',
        description: `메인 화면이 Type ${newTheme === 'typeA' ? 'A' : 'B'} 디자인으로 변경되었습니다.`
      });
    } catch (error: any) {
      console.error("Theme update error:", error);
      toast({
        title: '테마 변경 실패',
        description: error.message || '알 수 없는 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsThemeUpdating(false);
    }
  };

  if (isSettingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentImageUrl = settings?.mainImageUrl;

  return (
    <>
    <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">메인 화면 이미지 설정</CardTitle>
            <CardDescription>대시보드 홈 화면에 표시될 이미지를 관리합니다.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Current Usage */}
          <div className="space-y-4">
            <Label className="text-base font-bold text-slate-700 block">현재 설정된 이미지</Label>
            <div className="relative aspect-[16/9] w-full rounded-2xl border bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner">
              {currentImageUrl ? (
                <Image 
                  src={currentImageUrl} 
                  alt="Current Main" 
                  fill 
                  className="object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <ImageIcon className="h-12 w-12" />
                  <span className="text-sm">등록된 이미지가 없습니다</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 text-center">대시보드 홈 화면의 배경 안내 이미지로 사용됩니다.</p>
          </div>

          {/* Right: Upload Area */}
          <div className="space-y-6">
            <Label className="text-base font-bold text-slate-700 block">새 이미지 업로드</Label>
            
            {/* Drag & Drop Zone */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "group relative aspect-[16/9] w-full cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-4 p-8 overflow-hidden",
                isDragging ? "border-primary bg-primary/5 scale-[0.98]" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50",
                previewUrl ? "border-solid border-primary/20" : ""
              )}
            >
              {previewUrl ? (
                <>
                  <Image 
                    src={previewUrl} 
                    alt="Current Main" 
                    fill 
                    className="object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm font-bold flex items-center gap-2">
                      <FileUp className="h-4 w-4" /> 이미지 교체하기
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className={cn(
                    "h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 transition-colors group-hover:bg-primary/10 group-hover:text-primary",
                    isDragging ? "bg-primary/20 text-primary" : ""
                  )}>
                    <Upload className="h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-600 font-bold mb-1">이미지를 여기로 끌어다 놓으세요</p>
                    <p className="text-slate-400 text-sm">또는 클릭하여 파일 선택</p>
                  </div>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex flex-col gap-4">
              <Button 
                onClick={handleUpload} 
                disabled={!file || isUploading}
                className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 rounded-xl"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    이 이미지로 적용하기
                  </>
                )}
              </Button>

              {/* Status Feedback */}
              {status === 'success' && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">변경사항이 저장되었습니다.</span>
                </div>
              )}
              {status === 'error' && (
                <div className="flex flex-col gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-bold">오류 내용:</span>
                  </div>
                  <p className="text-xs font-mono bg-white/50 p-2 rounded border border-red-200">{errorMsg}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 text-center">* 권장 비율 16:9 | 최대 용량 5MB</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden mt-8">
      <CardHeader className="bg-slate-50/50 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">메인 화면 디자인 설정</CardTitle>
            <CardDescription>홈 화면에 적용될 전체 디자인 테마를 선택합니다.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <RadioGroup 
          defaultValue={settings?.mainPageTheme || 'typeA'} 
          value={settings?.mainPageTheme || 'typeA'}
          onValueChange={handleThemeChange}
          disabled={isThemeUpdating}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="relative">
            <RadioGroupItem value="typeA" id="typeA" className="peer sr-only" />
            <Label
              htmlFor="typeA"
              className={cn(
                "flex flex-col items-center justify-between rounded-2xl border-2 border-slate-100 bg-white p-6 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all h-full",
                isThemeUpdating && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white transition-colors">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">기존 디자인 (Type A)</div>
                  <p className="text-sm text-slate-500 mt-1">심플한 이미지 중심의 대시보드 형태입니다.</p>
                </div>
              </div>
            </Label>
          </div>

          <div className="relative">
            <RadioGroupItem value="typeB" id="typeB" className="peer sr-only" />
            <Label
              htmlFor="typeB"
              className={cn(
                "flex flex-col items-center justify-between rounded-2xl border-2 border-slate-100 bg-white p-6 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all h-full",
                isThemeUpdating && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white transition-colors">
                  <Layers className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">신규 디자인 (Type B)</div>
                  <p className="text-sm text-slate-500 mt-1">세련된 그래픽과 동적 요소가 포함된 개편안입니다.</p>
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>
        
        {isThemeUpdating && (
          <div className="mt-6 flex items-center justify-center gap-2 text-primary font-medium">
            <Loader2 className="h-4 w-4 animate-spin" />
            설정을 적용 중입니다...
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
