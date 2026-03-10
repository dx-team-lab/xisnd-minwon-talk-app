
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CASE_BADGE_COLORS, METHOD_BADGE_COLORS, TYPE_BADGE_COLORS } from '@/lib/constants';

interface CaseTableProps {
  data: any[] | null;
  isLoading: boolean;
}

export default function CaseTable({ data, isLoading }: CaseTableProps) {
  return (
    <Card className="rounded-xl border-slate-200 overflow-hidden shadow-sm h-full">
      <CardHeader className="bg-white border-b py-4">
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <div className="h-5 w-1 bg-accent rounded-full" />
          사례
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50 border-b">
              <TableRow>
                <TableHead className="h-12 font-bold text-slate-700 text-center w-[70px] border-r text-sm">지역</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 text-center w-[70px] border-r text-sm">단계</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 text-center w-[100px] border-r text-sm">유형</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 w-[180px] border-r text-sm">민원인</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 border-r text-sm">요구사항</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 border-r text-sm">보상방식</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 text-right whitespace-nowrap text-sm">보상금액(원)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.length > 0 ? (
                data.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="p-4 text-center text-xs font-bold text-slate-500 whitespace-nowrap border-r">
                      {item.region}
                    </TableCell>
                    <TableCell className="p-4 text-center text-sm font-bold text-primary whitespace-nowrap border-r">
                      {item.phase}
                    </TableCell>
                    <TableCell className="p-4 border-r">
                      <div className="flex flex-col items-center gap-1.5">
                        {Array.isArray(item.type) ? item.type.map((t: string) => (
                          <Badge 
                            key={t} 
                            variant="outline" 
                            className={cn("text-xs whitespace-nowrap font-bold", TYPE_BADGE_COLORS[t] || "bg-secondary text-secondary-foreground")}
                          >
                            {t}
                          </Badge>
                        )) : (
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs whitespace-nowrap font-bold", TYPE_BADGE_COLORS[item.type] || "bg-secondary text-secondary-foreground")}
                          >
                            {item.type}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-4 text-sm font-bold text-slate-700 border-r">
                      {item.complainant}
                    </TableCell>
                    <TableCell className="p-4 border-r">
                      <div className="flex flex-col gap-1.5">
                        {Array.isArray(item.requestType) ? item.requestType.map((rt: string) => (
                          <Badge key={rt} variant="outline" className={cn("whitespace-nowrap font-bold w-fit text-xs", CASE_BADGE_COLORS[rt] || "")}>
                            {rt}
                          </Badge>
                        )) : (
                          <Badge variant="outline" className={cn("whitespace-nowrap font-bold w-fit text-xs", CASE_BADGE_COLORS[item.requestType] || "")}>
                            {item.requestType}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-4 border-r text-center">
                      <Badge variant="outline" className={cn("whitespace-nowrap font-bold text-xs", METHOD_BADGE_COLORS[item.compensationStatus] || "")}>
                        {item.compensationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      {item.compensationAmount?.toLocaleString() || '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-24 text-slate-400">
                    등록된 보상 사례 데이터가 없습니다.
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
