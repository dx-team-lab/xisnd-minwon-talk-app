
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TYPE_BADGE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

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
}

export default function ResponsePlanTable({ data, isLoading, isFilterActive }: ResponsePlanTableProps) {
  const displayData = data && data.length > 0 ? data : [];

  return (
    <Card className="rounded-xl border-slate-200 overflow-hidden shadow-sm h-full">
      <CardHeader className="bg-white border-b py-4">
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <div className="h-5 w-1 bg-primary rounded-full" />
          대응 방안
        </CardTitle>
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
                <TableHead className="h-12 font-bold border-r text-slate-700 text-sm w-[250px]">원인</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 text-sm min-w-[300px]">조치방안(번호형)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length > 0 ? (
                displayData.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="border-r text-center align-top p-4">
                      <Badge 
                        variant="outline" 
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold whitespace-nowrap"
                      >
                        {row.region}
                      </Badge>
                    </TableCell>
                    <TableCell className="border-r text-center align-top p-4">
                      <Badge 
                        variant="outline" 
                        className="bg-orange-50 text-orange-700 border-orange-200 text-xs font-bold whitespace-nowrap"
                      >
                        {row.phase}
                      </Badge>
                    </TableCell>
                    <TableCell className="border-r text-center align-top p-4">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {Array.isArray(row.type) ? row.type.map((t: string) => (
                          <Badge 
                            key={t} 
                            variant="outline" 
                            className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold whitespace-nowrap"
                          >
                            {t}
                          </Badge>
                        )) : (
                          <Badge 
                            variant="outline" 
                            className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold whitespace-nowrap"
                          >
                            {row.type}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border-r align-top p-4 text-sm leading-relaxed text-slate-700">
                      {row.cause}
                    </TableCell>
                    <TableCell className="align-top p-4 text-sm leading-relaxed text-slate-600">
                      <div className="whitespace-pre-wrap">
                        {row.action}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-24 text-slate-400">
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
