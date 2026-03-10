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
    options: ['전체', '정신적피해보상', '영업배상', '분쟁조정']
  }
};

export const BADGE_COLORS = {
  demandType: {
    '재산 피해 보상': { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    '정신적 피해 보상': { bg: 'bg-blue-100 text-blue-700 border-blue-200' },
    '영업 피해 보상': { bg: 'bg-amber-100 text-amber-700 border-amber-200' }
  },
  compensationMethod: {
    '과태료': { bg: 'bg-rose-50 text-rose-600 border-rose-200' },
    '시설보수': { bg: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    '현물보상': { bg: 'bg-sky-50 text-sky-600 border-sky-200' }
  }
} as const;

export type DemandType = keyof typeof BADGE_COLORS.demandType;
export type CompensationMethod = keyof typeof BADGE_COLORS.compensationMethod;
