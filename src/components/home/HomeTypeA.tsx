'use client';

import Header from '@/components/common/Header';
import { ImageIcon } from 'lucide-react';

interface HomeTypeAProps {
  mainImageUrl?: string;
}

export default function HomeTypeA({ mainImageUrl }: HomeTypeAProps) {
  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <Header />
      <main className="container mx-auto px-4 py-12 space-y-8">
        {mainImageUrl ? (
          <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-200 p-2 md:p-4">
            <img
              src={mainImageUrl}
              alt="Dashboard Main"
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>
        ) : (
          <div className="w-full aspect-[21/9] rounded-3xl bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 space-y-4 shadow-sm">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
              <ImageIcon className="h-10 w-10" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-600">등록된 안내 이미지가 없습니다</h2>
              <p className="text-sm">관리자 설정에서 메인 화면 이미지를 등록해 주세요.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
