"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BADGE_COLORS, type DemandType, type CompensationMethod } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function CaseTable() {
  const cases = [
    { demands: ['재산 피해 보상'], date: '2019-05-29', progress: '종결', method: '과태료', amount: 1493590 },
    { demands: ['재산 피해 보상'], date: '2020-01-16', progress: '종결', method: '시설보수', amount: 2420000 },
    { demands: ['정신적 피해 보상'], date: '2021-10-29', progress: '종결', method: '현물보상', amount: 50000000 },
    { demands: ['정신적 피해 보상'], date: '2022-07-12', progress: '종결', method: '시설보수', amount: 3718000 },
    { demands: ['정신적 피해 보상', '영업 피해 보상'], date: '2020-09-16', progress: '종결', method: '현물보상', amount: 11128440 },
    { demands: ['정신적 피해 보상'], date: '2021-04-07', progress: '종결', method: '현물보상', amount: 15384600 },
    { demands: ['정신적 피해 보상', '영업 피해 보상'], date: '2023-05-31', progress: '종결', method: '현물보상', amount: 12820510 },
  ];

  const formatAmount = (num: number) => {
    if (num === 0) return '-';
    return num.toLocaleString('ko-KR');
  };

  return (
    <Card className="rounded-xl border-slate-200 overflow-hidden shadow-sm h-full">
      <CardHeader className="bg-white border-b py-4">
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <div className="h-5 w-1 bg-accent rounded-full" />
          사례
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50 border-b">
            <TableRow>
              <TableHead className="font-bold text-slate-700">요구사항</TableHead>
              <TableHead className="font-bold text-slate-700">발생 일시</TableHead>
              <TableHead className="font-bold text-slate-700">진행경과</TableHead>
              <TableHead className="font-bold text-slate-700">상세내용</TableHead>
              <TableHead className="font-bold text-slate-700">보상방식</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">보상금액(원)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((item, idx) => (
              <TableRow key={idx} className="hover:bg-slate-50 transition-colors">
                <TableCell>
                  <div className="flex flex-wrap gap-1.5 min-w-[140px]">
                    {item.demands.map((demand) => (
                      <Badge 
                        key={demand}
                        variant="outline"
                        className={cn(
                          "shadow-none py-1 px-2.5 whitespace-nowrap font-bold text-[11px] border",
                          BADGE_COLORS.demandType[demand as DemandType]?.bg || "bg-slate-100 text-slate-700 border-slate-200"
                        )}
                      >
                        {demand}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 tabular-nums whitespace-nowrap">{item.date}</TableCell>
                <TableCell className="text-slate-600">{item.progress}</TableCell>
                <TableCell>
                  <button className="text-primary underline hover:text-primary/80 font-medium decoration-primary/30 underline-offset-4">
                    결과
                  </button>
                </TableCell>
                <TableCell>
                  {item.method !== '-' && (
                    <Badge 
                      variant="outline"
                      className={cn(
                        "shadow-none font-bold py-1 px-3 border whitespace-nowrap",
                        BADGE_COLORS.compensationMethod[item.method as CompensationMethod]?.bg || "bg-slate-50 text-slate-600 border-slate-200"
                      )}
                    >
                      {item.method}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold text-slate-900 tabular-nums">
                  {formatAmount(item.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
