'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CASE_BADGE_COLORS, METHOD_BADGE_COLORS, TYPE_BADGE_COLORS } from '@/lib/constants';

// 12개 필드 기준의 새로운 더미 데이터
const SAMPLE_CASE_DATA = [
  {
    siteName: '평택 지식산업센터',
    region: '준공업지역',
    type: ['소음', '진동'],
    complaintContent: '지하 터파기 공사 중 항타 작업으로 인한 인근 상가 균열 및 소음 피해 호소',
    phase: '토공',
    complainant: '인근 상가 번영회',
    requestContent: ['재산피해보상', '정신적피해보상'],
    occurrenceDate: '2026-03-10',
    progress: '종결',
    details: '피해 보상 합의 완료 및 방음벽 보강',
    compensationMethod: '현금보상',
    compensationAmount: 15000000
  },
  {
    siteName: '남양주 아파트 신축',
    region: '주거지역',
    type: ['비산먼지'],
    complaintContent: '철거 작업 시 살수 부족으로 인한 세대 내 먼지 유입 민원 발생',
    phase: '철거',
    complainant: '옆단지 입주민 대표회',
    requestContent: ['행정처분', '보상'],
    occurrenceDate: '2026-03-15',
    progress: '진행중',
    details: '살수차 증차 및 방진막 정비 대책 협의 중',
    compensationMethod: '시설보수',
    compensationAmount: 0
  }
];

interface CaseTableProps {
  data: any[] | null;
  isLoading: boolean;
}

export default function CaseTable({ data, isLoading }: CaseTableProps) {
  const displayData = data && data.length > 0 ? data : SAMPLE_CASE_DATA;

  return (
    <Card className="rounded-xl border-slate-200 overflow-hidden shadow-sm h-full">
      <CardHeader className="bg-white border-b py-4">
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <div className="h-5 w-1 bg-accent rounded-full" />
          유사 사례
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[1500px]">
              <TableHeader className="bg-slate-50 border-b">
                <TableRow>
                  <TableHead className="h-12 font-bold text-slate-700 text-center w-[220px] border-r text-xs">현장명</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-center w-[100px] border-r text-xs">지역</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-center w-[120px] border-r text-xs">유형</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 w-[200px] border-r text-xs">민원 내용</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-center w-[80px] border-r text-xs">단계</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 w-[120px] border-r text-xs">민원인</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 w-[150px] border-r text-xs">요구사항</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-center w-[100px] border-r text-xs">발생 일시</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-center w-[80px] border-r text-xs">진행경과</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 w-[120px] border-r text-xs">상세내용</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-center w-[100px] border-r text-xs">보상방식</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-right w-[120px] text-xs">보상금액(원)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.length > 0 ? (
                  displayData.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="p-3 text-sm font-medium text-slate-700 border-r whitespace-nowrap truncate max-w-[220px]">
                        {item.siteName}
                      </TableCell>
                      <TableCell className="p-3 text-center text-xs font-bold text-slate-500 whitespace-nowrap border-r">
                        {item.region}
                      </TableCell>
                      <TableCell className="p-3 border-r">
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {Array.isArray(item.type) ? item.type.map((t: string) => (
                            <Badge 
                              key={t} 
                              variant="outline" 
                              className={cn("text-[10px] px-1.5 h-5 whitespace-nowrap font-bold", TYPE_BADGE_COLORS[t] || "bg-secondary text-secondary-foreground")}
                            >
                              {t}
                            </Badge>
                          )) : (
                            <Badge 
                              variant="outline" 
                              className={cn("text-[10px] px-1.5 h-5 whitespace-nowrap font-bold", TYPE_BADGE_COLORS[item.type] || "bg-secondary text-secondary-foreground")}
                            >
                              {item.type}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-3 text-xs text-slate-600 border-r leading-relaxed">
                        {item.complaintContent}
                      </TableCell>
                      <TableCell className="p-3 text-center text-xs font-bold text-primary whitespace-nowrap border-r">
                        {item.phase}
                      </TableCell>
                      <TableCell className="p-3 text-xs font-bold text-slate-700 border-r">
                        {item.complainant}
                      </TableCell>
                      <TableCell className="p-3 border-r">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(item.requestContent) ? item.requestContent.map((rt: string) => (
                            <Badge key={rt} variant="outline" className={cn("whitespace-nowrap font-bold text-[10px] px-1.5 h-5", CASE_BADGE_COLORS[rt] || "")}>
                              {rt}
                            </Badge>
                          )) : (
                            <Badge variant="outline" className={cn("whitespace-nowrap font-bold text-[10px] px-1.5 h-5", CASE_BADGE_COLORS[item.requestContent] || "")}>
                              {item.requestContent}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-3 text-center text-[11px] text-slate-500 border-r font-mono">
                        {item.occurrenceDate}
                      </TableCell>
                      <TableCell className="p-3 text-center border-r">
                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-bold bg-slate-100 text-slate-600">
                          {item.progress}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-3 text-xs text-slate-600 border-r leading-relaxed truncate max-w-[120px]">
                        {item.details}
                      </TableCell>
                      <TableCell className="p-3 border-r text-center">
                        <Badge variant="outline" className={cn("whitespace-nowrap font-bold text-[10px] px-1.5 h-5", METHOD_BADGE_COLORS[item.compensationMethod] || "")}>
                          {item.compensationMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-3 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap text-xs">
                        {item.compensationAmount?.toLocaleString() || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-24 text-slate-400">
                      등록된 보상 사례 데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
