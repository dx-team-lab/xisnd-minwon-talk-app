
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
    '재산 피해 보상': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    '정신적 피해 보상': { bg: 'bg-blue-100', text: 'text-blue-700' },
    '영업 피해 보상': { bg: 'bg-amber-100', text: 'text-amber-700' }
  },
  compensationMethod: {
    '근태로': { bg: 'bg-rose-100', text: 'text-rose-700' },
    '시설보수': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    '현물보상': { bg: 'bg-teal-100', text: 'text-teal-700' }
  }
} as const;

export type DemandType = keyof typeof BADGE_COLORS.demandType;
export type CompensationMethod = keyof typeof BADGE_COLORS.compensationMethod;
