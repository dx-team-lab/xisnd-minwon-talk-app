
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
                <TableHead className="font-bold border-r text-slate-700 text-center w-[80px]">지역</TableHead>
                <TableHead className="font-bold border-r text-slate-700 text-center w-[80px]">단계</TableHead>
                <TableHead className="font-bold border-r text-slate-700 text-center w-[120px]">유형</TableHead>
                <TableHead className="font-bold border-r text-slate-700 text-center">원인</TableHead>
                <TableHead className="font-bold text-slate-700 text-center">조치사항</TableHead>
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
                      <div className="flex flex-wrap justify-center gap-1">
                        {Array.isArray(row.type) ? row.type.map((t: string) => (
                          <Badge key={t} variant="secondary" className="text-[10px] px-1 font-bold whitespace-nowrap">{t}</Badge>
                        )) : <Badge variant="secondary" className="text-[10px] px-1 font-bold whitespace-nowrap">{row.type}</Badge>}
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
