
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TYPE_BADGE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ResponsePlanTableProps {
  data: any[] | null;
  isLoading: boolean;
  isFilterActive: boolean;
}

export default function ResponsePlanTable({ data, isLoading, isFilterActive }: ResponsePlanTableProps) {
  // --- Render Search Result View ---
  if (isFilterActive) {
    return (
      <Card className="rounded-xl border-slate-200 overflow-hidden shadow-sm h-full">
        <CardHeader className="bg-white border-b py-4">
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <div className="h-5 w-1 bg-primary rounded-full" />
            대응 방안
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table className="border-collapse">
              <TableHeader className="bg-slate-50 border-b">
                <TableRow>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[100px] text-sm">지역</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[100px] text-sm">단계</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[150px] text-sm">유형</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-center text-sm">원인</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-center text-sm">조치사항</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? (
                  data.map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50">
                      <TableCell className="border-r text-center align-top p-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                        {row.region}
                      </TableCell>
                      <TableCell className="border-r text-center align-top p-4 text-sm font-bold text-primary whitespace-nowrap">
                        {row.phase}
                      </TableCell>
                      <TableCell className="border-r text-center align-top p-4">
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {Array.isArray(row.type) ? row.type.map((t: string) => (
                            <Badge 
                              key={t} 
                              variant="outline" 
                              className={cn("text-xs font-bold whitespace-nowrap", TYPE_BADGE_COLORS[t] || "bg-secondary text-secondary-foreground")}
                            >
                              {t}
                            </Badge>
                          )) : (
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs font-bold whitespace-nowrap", TYPE_BADGE_COLORS[row.type] || "bg-secondary text-secondary-foreground")}
                            >
                              {row.type}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="border-r align-top p-4 text-sm leading-relaxed">
                        {row.cause}
                      </TableCell>
                      <TableCell className="align-top p-4 text-sm leading-relaxed">
                        {row.action}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-24 text-slate-400">
                      등록된 대응 방안 데이터가 없습니다.
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

  // --- Render Default Process Flow View ---
  return (
    <Card className="rounded-xl border-slate-200 overflow-hidden shadow-sm h-full">
      <CardHeader className="bg-white border-b py-4">
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <div className="h-5 w-1 bg-primary rounded-full" />
          민원 대응 프로세스
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full border-collapse table-fixed min-w-[650px]">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="h-12 p-2 text-center text-sm font-bold border-r text-slate-700 w-[20%]">사전업무</th>
              <th className="h-12 p-2 text-center text-sm font-bold border-r text-slate-700 w-[20%]">민원접수</th>
              <th className="h-12 p-2 text-center text-sm font-bold border-r text-slate-700 w-[20%]">민원대응</th>
              <th className="h-12 p-2 text-center text-sm font-bold border-r text-slate-700 w-[20%]">협상 전략</th>
              <th className="h-12 p-2 text-center text-sm font-bold text-slate-700 w-[20%]">보상협의</th>
            </tr>
          </thead>
          <tbody>
            <tr className="align-top">
              {/* 사전업무 */}
              <td className="p-3 border-r">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <p className="text-[12px] font-bold leading-normal">① 주변 환경 조사</p>
                    <ul className="text-[11px] text-slate-600 space-y-2 pl-1 leading-normal">
                      <li>• 거주자 조사 <span className="text-[#6B7280]">(BM)</span></li>
                      <li>• 예상 소음도 <span className="text-[#6B7280]">(공사)</span></li>
                      <li>• 사전 건물 조사 <span className="text-[#6B7280]">(공사)</span></li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[12px] font-bold leading-normal">② 환경 인허가<span className="text-[#6B7280]">(공무)</span></p>
                    <ul className="text-[11px] text-slate-600 space-y-2 pl-1 leading-normal">
                      <li>• 비산먼지 신고</li>
                      <li>• 특정공사 신고</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[12px] font-bold leading-normal">③ 진행절차 <span className="text-[#6B7280]">(CM, 공무)</span></p>
                    <ul className="text-[11px] text-slate-600 space-y-2 pl-1 leading-normal">
                      <li>• 민원 보상 예산</li>
                      <li>• 환경 대책 수립</li>
                      <li>• 착공 및 인허가</li>
                    </ul>
                  </div>
                </div>
              </td>
              
              {/* 민원접수 */}
              <td className="p-3 border-r">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <p className="text-[12px] font-bold leading-normal">① 민원 접수<span className="text-[#6B7280]">(최초)</span></p>
                    <ul className="text-[11px] text-slate-600 space-y-2 pl-1 leading-normal">
                      <li>• 대표번호, 지자체</li>
                      <li>• 초기 기록</li>
                      <li>• 긴급도 판단 <span className="text-[#6B7280]">(BM)</span></li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[12px] font-bold leading-normal">② 분석 및 보고<span className="text-[#6B7280]">(BM)</span></p>
                    <ul className="text-[11px] text-slate-600 space-y-2 pl-1 leading-normal">
                      <li>• 면담 및 확인</li>
                      <li>• 원인 파악/보고</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[12px] font-bold leading-normal">③ 분류 및 지정<span className="text-[#6B7280]">(CM)</span></p>
                    <ul className="text-[11px] text-slate-600 space-y-2 pl-1 leading-normal">
                      <li>• 일반/특이민원</li>
                    </ul>
                  </div>
                </div>
              </td>

              {/* 민원대응 */}
              <td className="p-3 border-r">
                <div className="space-y-4">
                  <p className="text-[12px] font-bold leading-normal">① 내부 보고<span className="text-[#6B7280]">(→ CM)</span></p>
                  <div className="space-y-3">
                    <p className="text-[12px] font-bold leading-normal">② 공사협의<span className="text-[#6B7280]">(공사)</span></p>
                    <ul className="text-[11px] text-slate-600 space-y-2 pl-1 leading-normal">
                      <li>• 소음/먼지 대응</li>
                      <li>• 진동 민원 대응</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[12px] font-bold leading-normal">③ 기관협의<span className="text-[#6B7280]">(공무)</span></p>
                    <ul className="text-[11px] text-slate-600 space-y-2 pl-1 leading-normal">
                      <li>• 조치계획서</li>
                    </ul>
                  </div>
                  <p className="text-[12px] font-bold leading-normal mb-4">④ 노조/언론 <span className="text-[#6B7280]">(공무/CM)</span></p>
                  <p className="text-[12px] font-bold leading-normal mb-4">⑤ 거주민 협의 <span className="text-[#6B7280]">(BM)</span></p>
                  <p className="text-[12px] font-bold leading-normal mb-4">⑥ 일지 관리 <span className="text-[#6B7280]">(BM)</span></p>
                </div>
              </td>

              {/* 협상 전략 */}
              <td className="p-3 border-r">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <p className="text-[12px] font-bold leading-normal">① 방안 결정<span className="text-[#6B7280]">(CM)</span></p>
                    <ul className="text-[11px] text-slate-600 space-y-2 pl-1 leading-normal">
                      <li>• 작업시간 협상</li>
                      <li>• 시설보수 협상</li>
                      <li>• 현금보상 협상</li>
                      <li>• 분쟁/소송 <span className="text-[#6B7280]">(BM)</span></li>
                    </ul>
                  </div>
                  <p className="text-[12px] font-bold leading-normal mb-4">② 보험접수<span className="text-[#6B7280]">(BM)</span></p>
                  <p className="text-[12px] font-bold leading-normal mb-4">③ 회계처리<span className="text-[#6B7280]">(BM)</span></p>
                </div>
              </td>

              {/* 보상협의 */}
              <td className="p-3">
                <div className="space-y-5">
                  <p className="text-[12px] font-bold leading-normal mb-4">① 합의서 작성<span className="text-[#6B7280]">(BM)</span></p>
                  <p className="text-[12px] font-bold leading-normal mb-4">② 보상 품의<span className="text-[#6B7280]">(공무)</span></p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
