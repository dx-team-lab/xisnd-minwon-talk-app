export const FILTER_OPTIONS = {
  region: {
    label: '지역/지구',
    options: ['전체', '주거지역', '상업지역', '공업지역']
  },
  phase: {
    label: '단계',
    options: ['전체', '착수전', '토공', '골조', '마감']
  },
  type: {
    label: '유형',
    options: ['전체', '소음', '분진', '진동', '교통', '언론']
  },
  compensation: {
    label: '보상 사례',
    options: ['전체', '정신적피해보상', '영업배상', '재산피해보상', '분쟁조정']
  }
};

export const CASE_BADGE_COLORS: Record<string, string> = {
  '정신적피해보상': 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
  '영업배상': 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]',
  '재산피해보상': 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
  '분쟁조정': 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]'
};

export const METHOD_BADGE_COLORS: Record<string, string> = {
  '과태료': 'bg-rose-50 text-rose-600 border-rose-200',
  '시설보수': 'bg-indigo-50 text-indigo-600 border-indigo-200',
  '현물보상': 'bg-sky-50 text-sky-600 border-sky-200',
  '보상': 'bg-green-50 text-green-600 border-green-200',
  '미보상': 'bg-slate-50 text-slate-600 border-slate-200'
};

export const BADGE_COLORS = {
  demandType: CASE_BADGE_COLORS,
  compensationMethod: METHOD_BADGE_COLORS
} as const;
