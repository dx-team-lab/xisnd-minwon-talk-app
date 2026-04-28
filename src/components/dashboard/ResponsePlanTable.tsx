
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ExternalLink, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { TYPE_BADGE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Sample data as requested
const SAMPLE_RESPONSE_DATA = [
  { region: '공업', phase: '착공전', type: '일반', cause: '공사 기간·시간 안내 불명확', action: '1) 관리사무소+세대/상가 이중 고지\n2) 캘린더 1상 요약 재배포\n3) 민감시설 개별 안내(식통번호)\n4) 변경관리(버전/일시/담당)·재공지' },
  { region: '공업', phase: '착공전', type: '일반', cause: '인접건물 사전조사 부재중으로 일정 지연', action: '1) 출입/동의 확보(위임·신분 확인)\n2) 촬영범위+자료공유 합의\n3) 일정 재조정' },
  { region: '공업', phase: '착공전', type: '일반', cause: '인접건물 사전조사 출입 거부', action: '1) 출입/동의 확보(위임·신분 확인)\n2) 촬영범위+자료공유 합의\n3) 일정 재조정' },
  { region: '공업', phase: '착공전', type: '교통', cause: '보행 동선과 차량 동선 충돌', action: '1) 통제원 배치\n2) 보행 동선 분리·가설 펜스 정비\n3) 표지판/야간 식별 강화' },
  { region: '공업', phase: '착공전', type: '교통', cause: '자재 반입 차량 동시 진입 혼잡', action: '1) 통제원 배치\n2) 외곽 대기 유도' },
  { region: '공업', phase: '착공전', type: '교통', cause: '주차장 출구 점유', action: '1) 통제원 배치\n2) 외곽 대기 유도' },
  { region: '공업', phase: '착공전', type: '소음', cause: '발전기 시동 소음(야간·이른 아침)', action: '1) 엔진룸 방음\n2) 이동식 방음커버/벽\n3) 강도↓·동시가동 분리\n4) 소음측정(기록)' },
  { region: '공업', phase: '착공전', type: '소음', cause: '장비 점검·시운전 소음', action: '1) 엔진룸 방음\n2) 이동식 방음커버/벽\n3) 강도↓·동시가동 분리\n4) 소음측정(기록)' },
  { region: '공업', phase: '착공전', type: '분진', cause: '가설 설치 중 분진 발생', action: '1) 살수\n2) 세륜 강화\n3) 방진망/방진벽 설치' },
  { region: '공업', phase: '착공전', type: '분진', cause: '차량 이동으로 도로 오염', action: '1) 세륜 강화(측면살수 포함)\n2) 출입구 도로 청소\n3) 적재 덮개 준수' },
  { region: '공업', phase: '토공', type: '교통', cause: '반출 대기열 도로 점유', action: '1) 경적·공회전 금지 교육\n2) 대기장소 분산·외곽 유도\n3) 진출입 동선 분리' },
  { region: '공업', phase: '토공', type: '교통', cause: '진출입구 병목 현상', action: '1) 경적·공회전 금지 교육\n2) 대기장소 분산·외곽 유도\n3) 진출입 동선 분리' },
  { region: '공업', phase: '토공', type: '소음', cause: 'PRD 천공 타격 소음', action: '1) 해당 구간 소음측정(기록 유지)\n2) 이동식 방음벽/커버 설치\n4) 강도↓·동시가동 분리\n5) 특정공사 시간 준수' },
  { region: '공업', phase: '토공', type: '소음', cause: '덤프트럭 상·하차 소음', action: '1) 경적·공회전 금지 교육\n2) 외곽 대기 유도\n3) 신호수 유도 이동\n4) 상·하차 속도 관리' },
];

interface ResponsePlanTableProps {
  data: any[] | null;
  isLoading: boolean;
  isFilterActive: boolean;
  actionLinkDict?: Record<string, string>;
}

// Parse action text like "1) 통제원 배치\n2) 외곽 대기 유도" into array of items
function parseActionItems(action: string): string[] {
  if (!action) return [];
  // Split by newline or by numbered pattern like "1) ", "2) "
  const items = action.split(/\n/).flatMap(line => {
    // Further split if multiple numbered items on same line
    return line.split(/(?=\d+\))/).map(s => s.trim()).filter(Boolean);
  });
  return items;
}

// Strip leading number+bracket like "1) " or "2) " to get clean text
function stripNumbering(item: string): string {
  return item.replace(/^\d+\)\s*/, '').trim();
}

export default function ResponsePlanTable({ data, isLoading, isFilterActive, actionLinkDict = {} }: ResponsePlanTableProps) {
  const [rowsPerPage, setRowsPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data && data.length > 0 ? data : [];

  // Reset to first page when data or rowsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data, rowsPerPage]);

  const itemsPerPage = rowsPerPage === 'all' ? filteredData.length : parseInt(rowsPerPage, 10);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  
  const displayData = rowsPerPage === 'all' 
    ? filteredData 
    : filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <Card className="rounded-xl border-slate-200 overflow-hidden shadow-sm h-full">
      <CardHeader className="bg-white border-b py-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <div className="h-5 w-1 bg-primary rounded-full" />
          대응 방안
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">표시 개수</span>
          <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
            <SelectTrigger className="w-[100px] h-8 text-xs bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10개</SelectItem>
              <SelectItem value="20">20개</SelectItem>
              <SelectItem value="50">50개</SelectItem>
              <SelectItem value="100">100개</SelectItem>
              <SelectItem value="all">전체</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        {isLoading && isFilterActive ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <Table className="border-collapse min-w-[800px]">
            <TableHeader className="bg-slate-50 border-b">
              <TableRow>
                <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[100px] text-sm">지역</TableHead>
                <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[100px] text-sm">단계</TableHead>
                <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[120px] text-sm">유형</TableHead>
                <TableHead className="h-12 font-bold border-r text-slate-700 text-center text-sm w-[250px]">민원 상세</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 text-center text-sm min-w-[300px]">민원 대응 지식</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length > 0 ? (
                displayData.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="border-r text-center align-top p-4 text-sm">
                      <CategoryBadge category="region">{row.region}</CategoryBadge>
                    </TableCell>
                    <TableCell className="border-r text-center align-top p-4 text-sm">
                      <CategoryBadge category="phase">{row.phase}</CategoryBadge>
                    </TableCell>
                    <TableCell className="border-r text-center align-top p-4 text-sm">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {Array.isArray(row.type) ? row.type.map((t: string) => (
                          <CategoryBadge key={t} category="type">{t}</CategoryBadge>
                        )) : (
                          <CategoryBadge category="type">{row.type}</CategoryBadge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border-r align-top p-4 text-sm leading-relaxed text-slate-700 font-medium">
                      {row.cause}
                    </TableCell>
                    <TableCell className="align-top p-4 text-sm leading-relaxed text-slate-600">
                      <div className="flex flex-col gap-1">
                        {parseActionItems(row.action).map((item, i) => {
                          const cleanText = stripNumbering(item);
                          const linkUrl = actionLinkDict[cleanText];
                          return (
                            <div key={i} className="flex items-start gap-2">
                              <span className="whitespace-pre-wrap">{item}</span>
                              {linkUrl && (
                                <a
                                  href={linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center gap-0.5 shrink-0 text-sm font-semibold mt-0.5"
                                >
                                  [문서 보기] <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <SearchX className="h-12 w-12 text-slate-300 mb-4" />
                      <p className="text-slate-600 font-medium">검색 조건에 맞는 데이터가 없습니다.</p>
                      <p className="text-slate-400 text-sm mt-1">다른 검색어를 입력하거나 필터 조건을 변경해 보세요.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {rowsPerPage !== 'all' && totalPages > 1 && (
        <CardFooter className="py-6 border-t flex justify-center items-center bg-slate-50/30">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md border-slate-200 text-slate-600 disabled:opacity-30"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 mx-2">
              {getPageNumbers().map((page, i) => (
                typeof page === 'number' ? (
                  <Button
                    key={i}
                    variant={currentPage === page ? "default" : "outline"}
                    className={cn(
                      "h-8 min-w-[32px] px-2 rounded-md text-sm font-medium transition-all",
                      currentPage === page 
                        ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600" 
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={i} className="px-2 text-slate-400 font-medium">
                    {page}
                  </span>
                )
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md border-slate-200 text-slate-600 disabled:opacity-30"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
