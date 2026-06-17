'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseExampleTableProps {
  data: any[] | null;
  isLoading: boolean;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

export function CaseExampleTable({ data: cases, isLoading, onEdit, onDelete }: CaseExampleTableProps) {
  return (
    <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="border-b bg-white py-4">
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <div className="h-5 w-1 bg-accent rounded-full" />
          사례 목록
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <Table className="border-collapse min-w-[1500px]">
            <TableHeader className="bg-slate-50 border-b">
              <TableRow>
                <TableHead className="h-12 font-bold text-slate-700 border-r text-sm px-4">현장명</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 text-center w-[100px] border-r text-sm">지역</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 text-center w-[100px] border-r text-sm">발생시점</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 text-center w-[120px] border-r text-sm">유형</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 border-r text-sm px-4 min-w-[200px]">민원 내용</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 text-center border-r text-sm w-[120px]">발생 일시</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 text-center w-[100px] border-r text-sm">진행</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 border-r text-sm px-4 w-[120px]">신청인</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 border-r text-sm px-4 min-w-[150px]">상세내용</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 text-center w-[120px] border-r text-sm">보상방식</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 text-right w-[140px] border-r text-sm px-4">보상금액</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 text-center w-[120px] text-sm">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases && cases.length > 0 ? (
                cases.map((c) => (
                  <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="border-r align-top p-4 font-bold text-slate-700">
                      {c.siteName}
                    </TableCell>
                    <TableCell className="border-r text-center align-top p-4">
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-none rounded-full text-sm font-bold whitespace-nowrap px-3 py-1"
                      >
                        {c.region}
                      </Badge>
                    </TableCell>
                    <TableCell className="border-r text-center align-top p-4">
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-none rounded-full text-sm font-bold whitespace-nowrap px-3 py-1"
                      >
                        {c.phase}
                      </Badge>
                    </TableCell>
                    <TableCell className="border-r text-center align-top p-4">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {Array.isArray(c.type) ? c.type.map((t: string) => (
                          <Badge
                            key={t}
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-none rounded-full text-sm font-bold whitespace-nowrap px-3 py-1"
                          >
                            {t}
                          </Badge>
                        )) : (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-none rounded-full text-sm font-bold whitespace-nowrap px-3 py-1"
                          >
                            {c.type}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border-r align-top p-4 text-xs text-slate-600 leading-relaxed">
                      {c.complaintContent}
                    </TableCell>
                    <TableCell className="border-r text-center align-top p-4 text-xs text-slate-600 whitespace-nowrap">
                      {c.occurrenceDate}
                    </TableCell>
                    <TableCell className="border-r text-center align-top p-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-sm font-bold border-none rounded-full px-3 py-1 whitespace-nowrap",
                          c.progress === '종결' ? "bg-slate-100 text-slate-600" :
                          c.progress === '진행' ? "bg-blue-50 text-blue-600" :
                          "bg-amber-50 text-amber-600"
                        )}
                      >
                        {c.progress}
                      </Badge>
                    </TableCell>
                    <TableCell className="border-r align-top p-4 text-xs font-bold text-slate-700">
                      {c.complainant}
                    </TableCell>
                    <TableCell className="border-r align-top p-4 text-xs text-slate-600 leading-relaxed">
                      {c.details?.startsWith('http') ? (
                        <a
                          href={c.details}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          문서 보기 <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : (
                        c.details
                      )}
                    </TableCell>
                    <TableCell className="border-r text-center align-top p-4">
                      <Badge variant="outline" className="bg-teal-50 text-teal-600 border-none rounded-full text-sm font-bold whitespace-nowrap px-3 py-1">
                        {c.compensationMethod || c.compensationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="border-r align-top p-4 text-right tabular-nums text-sm font-semibold text-slate-900 whitespace-nowrap">
                      {c.compensationAmount?.toLocaleString() || '0'} 원
                    </TableCell>
                    <TableCell className="align-top p-4 text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(c)} className="text-slate-400 hover:text-primary">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(c.id)} className="text-slate-400 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-20 text-slate-400">
                    등록된 사례가 없습니다.
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
