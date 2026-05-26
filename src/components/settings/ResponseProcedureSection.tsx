'use client';

import { useState, useCallback } from 'react';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { logActivity } from '@/lib/activity-logs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/lib/types';

export default function ResponseProcedureSection() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const procedureDocRef = useMemoFirebase(() => doc(db, 'settings', 'procedure'), [db]);
  const systemSettingsRef = useMemoFirebase(() => doc(db, 'settings', 'system'), [db]);
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: procedureData, isLoading } = useDoc(procedureDocRef);
  const { data: systemSettings, isLoading: isSystemLoading } = useDoc(systemSettingsRef);
  const { data: userProfile } = useDoc(userProfileRef);

  // Image Processing Utility
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 1. Initial size check (10MB)
      if (file.size > 10 * 1024 * 1024) {
        return reject(new Error("파일 크기가 너무 큽니다 (최대 10MB)."));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // 2. Resize if width > 1920px
          const MAX_WIDTH = 1920;
          if (width > MAX_WIDTH) {
            height = (MAX_WIDTH / width) * height;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error("Canvas context를 생성할 수 없습니다."));

          ctx.drawImage(img, 0, 0, width, height);

          // 3. Compress (JPEG quality 0.8)
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          
          // 4. Size validation (< 900KB)
          // Base64 string length is approx 4/3 of the binary size
          const sizeInBytes = (base64.length * 3) / 4;
          if (sizeInBytes > 900 * 1024) {
            return reject(new Error("이미지 용량이 너무 큽니다. 더 작은 이미지를 사용해 주세요."));
          }

          resolve(base64);
        };
        img.onerror = () => reject(new Error("이미지를 로드할 수 없습니다."));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
      reader.readAsDataURL(file);
    });
  };

  const handleFileAction = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: "업로드 실패", description: "이미지 파일만 업로드 가능합니다.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const base64Data = await processImage(file);

      await setDoc(procedureDocRef, {
        imageBase64: base64Data,
        imageUrl: deleteField(), // Remove old storage URL if exists
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid || 'system'
      }, { merge: true });

      toast({ title: "업로드 성공", description: "민원 대응 절차 이미지가 등록되었습니다." });

      // Activity log
      if (user) {
        const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: actorName,
          action: 'UPDATE',
          targetSiteName: '대응 절차',
          targetId: 'procedure_image',
          details: '민원 대응 절차 내용 수정'
        });
      }
    } catch (error: any) {
      console.error("Processing/Upload error:", error);
      toast({ 
        title: "업로드 실패", 
        description: error.message || "이미지 처리 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileAction(file);
    e.target.value = '';
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileAction(file);
  }, [handleFileAction]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await updateDoc(procedureDocRef, {
        imageBase64: deleteField(),
        imageUrl: deleteField(),
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid || 'system'
      });

      toast({ title: "삭제 성공", description: "이미지가 삭제되었습니다." });

      // Activity log
      if (user) {
        const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: actorName,
          action: 'DELETE',
          targetSiteName: '대응 절차',
          targetId: 'procedure_image',
          details: '민원 대응 절차 이미지 삭제'
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "삭제 실패", description: "이미지 삭제 중 오류가 발생했습니다.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleMenu = async (checked: boolean) => {
    if (!systemSettingsRef) return;
    try {
      await setDoc(systemSettingsRef, {
        isProcessMenuEnabled: checked,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid || 'system'
      }, { merge: true });

      toast({ title: "설정 변경", description: `민원 대응 절차 메뉴가 ${checked ? '활성화' : '비활성화'}되었습니다.` });

      if (user) {
        const actorName = (userProfile as UserProfile)?.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: actorName,
          action: 'UPDATE',
          targetSiteName: '대응 절차',
          targetId: 'system_settings',
          details: `시스템 설정 변경: 민원 대응 절차 메뉴 (${checked ? '활성화' : '비활성화'})`
        });
      }
    } catch (error: any) {
      console.error("Toggle error:", error);
      toast({ title: "설정 변경 실패", description: error.message || "설정 변경 중 오류가 발생했습니다.", variant: "destructive" });
    }
  };

  if (isLoading || isSystemLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const imageBase64 = procedureData?.imageBase64;
  const imageUrl = procedureData?.imageUrl; // Fallback for transition
  const displayImage = imageBase64 || imageUrl;

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden mb-6">
        <CardHeader className="border-b bg-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <div className="h-5 w-1 bg-accent rounded-full" />
            메뉴 노출 설정
          </CardTitle>
          <div className="flex items-center gap-3">
            <Label htmlFor="menu-toggle" className="text-sm font-medium text-slate-600">
              {systemSettings?.isProcessMenuEnabled ? '활성화' : '비활성화'}
            </Label>
            <Switch 
              id="menu-toggle" 
              checked={systemSettings?.isProcessMenuEnabled || false} 
              onCheckedChange={handleToggleMenu}
              disabled={isSystemLoading}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-slate-50 text-sm text-slate-500">
          이 설정이 활성화되면 글로벌 네비게이션 바(GNB)에 '민원 대응 절차' 탭이 노출됩니다.
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-white py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <div className="h-5 w-1 bg-accent rounded-full" />
            이미지 미리보기
          </CardTitle>
          <div className="flex items-center gap-2">
            <input
              type="file"
              id="procedure-upload"
              className="hidden"
              accept="image/*"
              onChange={onFileChange}
              disabled={isProcessing}
            />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 cursor-pointer"
              disabled={isProcessing}
            >
              <label htmlFor="procedure-upload">
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                이미지 업로드
              </label>
            </Button>
            {displayImage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="text-slate-400 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                이미지 삭제
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div 
            className={cn(
              "bg-slate-50 rounded-2xl border-2 border-dashed transition-all duration-200 min-h-[400px] flex items-center justify-center overflow-hidden relative group",
              isDragging ? "border-primary bg-primary/5 shadow-inner scale-[0.99]" : "border-slate-200",
              !displayImage && "cursor-pointer hover:border-primary/50 hover:bg-slate-100/50"
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !displayImage && document.getElementById('procedure-upload')?.click()}
          >
            {isProcessing && (
              <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-primary font-bold">이미지 처리 중...</p>
              </div>
            )}

            {displayImage ? (
              <img 
                src={displayImage} 
                alt="민원 대응 절차" 
                className="max-w-full h-auto object-contain shadow-md rounded-lg"
              />
            ) : (
              <div className="text-center space-y-3 pointer-events-none">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-slate-500 font-bold text-lg">기존 등록된 이미지가 없습니다.</p>
                  <p className="text-slate-400 mt-1">
                    이미지를 여기에 드래그하여 놓거나,<br />
                    클릭하여 파일을 선택하세요.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-slate-300 text-xs">최대 10MB (자동 압축 적용)</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="이미지 삭제"
        description="정말 이 이미지를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다."
      />
    </div>
  );
}
