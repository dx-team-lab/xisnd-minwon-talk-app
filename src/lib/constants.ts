
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
    '재산 피해 보상': { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]' },
    '정신적 피해 보상': { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' },
    '영업 피해 보상': { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]' }
  },
  compensationMethod: {
    '근태로': { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]' },
    '시설보수': { bg: 'bg-[#E0E7FF]', text: 'text-[#4338CA]' },
    '현물보상': { bg: 'bg-[#CCFBF1]', text: 'text-[#0F766E]' }
  }
} as const;

export type DemandType = keyof typeof BADGE_COLORS.demandType;
export type CompensationMethod = keyof typeof BADGE_COLORS.compensationMethod;
