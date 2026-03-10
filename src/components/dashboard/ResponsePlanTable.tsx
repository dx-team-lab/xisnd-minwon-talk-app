
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

interface ResponsePlanTableProps {
  data: any[] | null;
  isLoading: boolean;
}

export default function ResponsePlanTable({ data, isLoading }: ResponsePlanTableProps) {
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
                <TableHead className="font-bold border-r text-slate-700 text-center w-[120px]">지역/단계/유형</TableHead>
                <TableHead className="font-bold border-r text-slate-700 text-center">원인</TableHead>
                <TableHead className="font-bold text-slate-700 text-center">조치사항</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.length > 0 ? (
                data.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50/50">
                    <TableCell className="border-r text-center align-top p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-400">{row.region}</span>
                        <span className="text-sm font-bold text-primary">{row.phase}</span>
                        <span className="text-xs font-bold text-slate-400">{row.type}</span>
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
                  <TableCell colSpan={3} className="text-center py-24 text-slate-400">
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
