'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import Header from '@/components/common/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Info } from 'lucide-react';

export default function ResponseProcedurePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const procedureDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'settings', 'procedure');
  }, [db, user]);
  const { data: procedureData, isLoading } = useDoc(procedureDocRef);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F4FF]">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const imageBase64 = procedureData?.imageBase64;
  const imageUrl = procedureData?.imageUrl; // Fallback for transition
  const displayImage = imageBase64 || imageUrl;

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-headline font-bold text-slate-900">민원 대응 절차</h1>
          <p className="text-slate-500 text-sm mt-1.5">표준화된 민원 대응 프로세스를 확인하세요.</p>
        </div>

        <Card className="rounded-2xl border-none shadow-xl overflow-hidden bg-white">
          <CardContent className="p-4 md:p-8 flex items-center justify-center min-h-[500px]">
            {displayImage ? (
              <div className="w-full h-full flex items-center justify-center">
                <img 
                  src={displayImage} 
                  alt="민원 대응 절차 상세 이미지" 
                  className="max-w-full h-auto object-contain rounded-lg shadow-sm"
                  style={{ maxHeight: 'calc(100vh - 300px)' }}
                />
              </div>
            ) : (
              <div className="text-center space-y-4 max-w-md mx-auto">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Info className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 italic">등록된 정보가 없습니다</h3>
                  <p className="text-slate-500 mt-2">
                    등록된 민원 대응 절차가 없습니다.<br />
                    세부 사항은 관리자에게 문의해 주시기 바랍니다.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
