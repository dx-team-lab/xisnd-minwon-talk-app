
export const FILTER_OPTIONS: Record<string, { label: string; options: string[] }> = {
  region: {
    label: '지역/지구',
    options: ['전체', '주거지역', '상업지역', '준공업지역', '혼합지역']
  },
  phase: {
    label: '단계',
    options: ['전체', '착수전', '철거', '토공', '골조', '마감', '준공이후']
  },
  type: {
    label: '유형',
    options: ['전체', '소음', '비산먼지', '진동', '교통', '언론', '파손', '폐기물', '야간의혹', '영업피해', '출입통제']
  },
  compensation: {
    label: '보상 사례',
    options: ['전체', '정신적피해보상', '영업피해보상', '재산피해보상', '분쟁조정', '대인피해보상', '행정처분']
  }
};

export const TYPE_BADGE_COLORS: Record<string, string> = {
  '소음': 'bg-rose-100 text-rose-700 border-rose-200',
  '비산먼지': 'bg-slate-100 text-slate-700 border-slate-200',
  '진동': 'bg-amber-100 text-amber-700 border-amber-200',
  '교통': 'bg-blue-100 text-blue-700 border-blue-200',
  '언론': 'bg-purple-100 text-purple-700 border-purple-200',
  '파손': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '폐기물': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '야간의혹': 'bg-zinc-100 text-zinc-700 border-zinc-200',
  '영업피해': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  '출입통제': 'bg-orange-100 text-orange-700 border-orange-200'
};

export const CASE_BADGE_COLORS: Record<string, string> = {
  '정신적피해보상': 'bg-blue-100 text-blue-700 border-blue-200',
  '영업피해보상': 'bg-amber-100 text-amber-700 border-amber-200',
  '재산피해보상': 'bg-green-100 text-green-700 border-green-200',
  '분쟁조정': 'bg-purple-100 text-purple-700 border-purple-200',
  '대인피해보상': 'bg-rose-100 text-rose-700 border-rose-200',
  '행정처분': 'bg-slate-100 text-slate-700 border-slate-200'
};

export const METHOD_BADGE_COLORS: Record<string, string> = {
  '과태료': 'bg-rose-50 text-rose-600 border-rose-200',
  '시설보수': 'bg-indigo-50 text-indigo-600 border-indigo-200',
  '현물보상': 'bg-sky-50 text-sky-600 border-sky-200',
  '보상': 'bg-green-50 text-green-600 border-green-200',
  '미보상': 'bg-slate-50 text-slate-600 border-slate-200',
  '안전진단': 'bg-amber-50 text-amber-600 border-amber-200',
  '예방활동': 'bg-emerald-50 text-emerald-600 border-emerald-200'
};

export const BADGE_COLORS = {
  type: TYPE_BADGE_COLORS,
  demandType: CASE_BADGE_COLORS,
  compensationMethod: METHOD_BADGE_COLORS
} as const;

export const REQUEST_TYPE_OPTIONS = ['정신적피해보상', '영업피해보상', '재산피해보상', '분쟁조정', '대인피해보상', '행정처분'];
export const COMPENSATION_STATUS_OPTIONS = ['보상', '미보상', '시설보수', '현물보상', '안전진단', '예방활동'];
export const PROGRESS_OPTIONS = ['접수', '진행', '종결'];
