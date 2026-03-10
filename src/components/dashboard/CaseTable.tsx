
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CASE_BADGE_COLORS } from '@/lib/constants';

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
                <TableHead className="font-bold text-slate-700">지역/단계/유형</TableHead>
                <TableHead className="font-bold text-slate-700">민원인</TableHead>
                <TableHead className="font-bold text-slate-700">요구사항</TableHead>
                <TableHead className="font-bold text-slate-700">보상유무</TableHead>
                <TableHead className="font-bold text-slate-700 text-right">보상금액(원)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.length > 0 ? (
                data.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-bold">{item.region} · {item.phase}</span>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(item.type) ? item.type.map((t: string) => (
                            <Badge key={t} variant="outline" className="text-[9px] h-4 px-1">{t}</Badge>
                          )) : <Badge variant="outline" className="text-[9px] h-4 px-1">{item.type}</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 text-sm font-bold text-slate-700">
                      {item.complainant}
                    </TableCell>
                    <TableCell className="p-4">
                      <Badge variant="outline" className={cn("whitespace-nowrap font-bold", CASE_BADGE_COLORS[item.requestType] || "")}>
                        {item.requestType}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-4 text-slate-600 font-medium">{item.compensationStatus}</TableCell>
                    <TableCell className="p-4 text-right font-semibold text-slate-900 tabular-nums">
                      {item.compensationAmount?.toLocaleString() || '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-24 text-slate-400">
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
