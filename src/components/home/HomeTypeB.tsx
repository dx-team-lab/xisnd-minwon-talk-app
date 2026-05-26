'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Image from 'next/image';

import card1Img from '../../../public/card1.png';
import card2Img from '../../../public/card2.png';
import card3Img from '../../../public/card3.png';

export default function HomeTypeB() {
  const router = useRouter();

  const cards = [
    {
      title: "민원 진행 현황",
      description: "접수부터 종결까지 한눈에",
      imgSrc: card1Img,
      href: "/dashboard/status",
      bgColor: "bg-[#F9F9F8]", // Assuming backgrounds are part of images or we just use white/gray
    },
    {
      title: "유사사례",
      description: "당사 사례, 분쟁조정위원회 사례등",
      imgSrc: card2Img,
      href: "/dashboard/guides",
      bgColor: "bg-[#F9F9F8]",
    },
    {
      title: "참고자료",
      description: "관련 문서 서식, 주요 기관Link",
      imgSrc: card3Img,
      href: "/dashboard/references",
      bgColor: "bg-[#F9F9F8]",
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center">
        {/* Header Area */}
        <div className="text-center max-w-3xl mb-16 space-y-6">
          <h1 className="text-5xl font-black text-[#1B4332] tracking-tight leading-tight">
            민원 대응,<br />혼자 고민하지 마세요.
          </h1>
          <div className="space-y-3">
            <p className="text-xl font-bold text-slate-800">
              현장에서 발생한 민원에 대해 바로 적용할 수 있는 대응 방법을 알려드립니다.
            </p>
            <p className="text-slate-500 font-medium">
              예방부터 단계별 해결절차, 유사사례, 관련 법령까지 한 곳에서 확인하세요
            </p>
          </div>
        </div>

        {/* 3-Card Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-6xl">
          {cards.map((card, index) => (
            <div 
              key={index}
              onClick={() => router.push(card.href)}
              className="group cursor-pointer rounded-[32px] bg-[#F9F9F8] p-10 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 transform hover:-translate-y-2 border border-slate-100 flex flex-col items-center text-center space-y-8"
            >
              {/* Image/Icon Area */}
              <div className="w-full flex justify-center w-full mb-4">
                 <Image
                    src={card.imgSrc}
                    alt={card.title}
                    width={200}
                    height={200}
                    className="w-full h-40 object-contain group-hover:scale-[1.02] transition-transform"
                    unoptimized
                 />
              </div>

              {/* Text Content */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-12 border-t mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium">
            © MinwonTalk. All Rights Reserved. Designed & Developed by DX Team.
          </p>
        </div>
      </footer>
    </div>
  );
}
