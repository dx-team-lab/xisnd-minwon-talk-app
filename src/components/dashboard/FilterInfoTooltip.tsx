'use client';

import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FilterInfoTooltipProps {
  type: 'region' | 'phase' | 'type';
}

export default function FilterInfoTooltip({ type }: FilterInfoTooltipProps) {
  const renderTable = () => {
    switch (type) {
      case 'region':
        return (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-2 px-2 text-center font-bold text-slate-600">구분</th>
                <th className="py-2 px-2 text-center font-bold text-slate-600">정의(주간 기준)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-2 text-center font-medium">공업</td>
                <td className="py-2 px-2 text-slate-500">공업지역(70dB)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-2 text-center font-medium">주거</td>
                <td className="py-2 px-2 text-slate-500">주거지역(65dB)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-2 text-center font-medium">민감</td>
                <td className="py-2 px-2 text-slate-500">학교, 종합병원, 공공도서관(65dB)</td>
              </tr>
              <tr>
                <td className="py-2 px-2 text-center font-medium">상업</td>
                <td className="py-2 px-2 text-slate-500">상업지역(70dB)</td>
              </tr>
            </tbody>
          </table>
        );
      case 'phase':
        return (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-2 px-2 text-center font-bold text-slate-600">구분</th>
                <th className="py-2 px-2 text-center font-bold text-slate-600">세부 공정</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-2 text-center font-medium whitespace-nowrap">착공전(철거)</td>
                <td className="py-2 px-2 text-slate-500">인허가</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-2 text-center font-medium">토공</td>
                <td className="py-2 px-2 text-slate-500">흙막이, 터파기, 되메우기</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-2 text-center font-medium">골조</td>
                <td className="py-2 px-2 text-slate-500">철근콘크리트, 철골</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 px-2 text-center font-medium">마감</td>
                <td className="py-2 px-2 text-slate-500">도장, 커튼월, 석공사</td>
              </tr>
              <tr>
                <td className="py-2 px-2 text-center font-medium">준공</td>
                <td className="py-2 px-2 text-slate-500">기반시설, 사용승인</td>
              </tr>
            </tbody>
          </table>
        );
      case 'type':
        return (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-2 px-2 text-center font-bold text-slate-600">구분</th>
                <th className="py-2 px-2 text-center font-bold text-slate-600">정의</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: '교통', desc: '공사로 인한 차량 통행 지연·혼잡' },
                { label: '낙진', desc: '작업 중 파편·토사 등이 떨어짐' },
                { label: '냄새', desc: '공사로 발생한 불쾌한 악취' },
                { label: '분진', desc: '작업 중 비산먼지 발생' },
                { label: '빛', desc: '작업 조명 등으로 인한 빛 공해' },
                { label: '소음', desc: '공사로 발생하는 시끄러운 소리' },
                { label: '일반', desc: '기타 분류되지 않는 불편' },
                { label: '진동', desc: '공사로 전달되는 흔들림' },
                { label: '파손', desc: '공사로 인한 시설·재산 손상' },
              ].map((item, idx, arr) => (
                <tr key={item.label} className={idx < arr.length - 1 ? "border-b border-slate-100" : ""}>
                  <td className="py-2 px-2 text-center font-medium whitespace-nowrap">{item.label}</td>
                  <td className="py-2 px-2 text-slate-500">{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="inline-flex items-center text-slate-400 hover:text-primary transition-colors focus:outline-none">
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="w-[360px] p-0 bg-white border-slate-200 shadow-xl overflow-hidden rounded-lg">
        <div className="p-2 px-3 bg-slate-900 text-white text-sm font-bold tracking-wider uppercase">
          {type === 'region' ? '지역/지구 안내' : type === 'phase' ? '단계 안내' : '유형 안내'}
        </div>
        <div className="p-2">
          {renderTable()}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
