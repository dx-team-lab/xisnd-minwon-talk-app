
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseTableProps {
  data: any[] | null;
  isLoading: boolean;
}

const CASE_BADGE_COLORS: Record<string, string> = {
  '정신적피해보상': 'bg-[#FEF3C7] text-[#B45309] border-none',
  '영업배상': 'bg-[#D1FAE5] text-[#065F46] border-none',
  '분쟁조정': 'bg-[#DBEAFE] text-[#1D4ED8] border-none'
};

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
                <TableHead className="font-bold text-slate-700">지역/단계/민원인</TableHead>
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
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 font-bold">{item.region} · {item.phase}</span>
                        <span className="text-sm font-bold text-slate-700">{item.complainant}</span>
                      </div>
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
                  <TableCell colSpan={4} className="text-center py-24 text-slate-400">
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
