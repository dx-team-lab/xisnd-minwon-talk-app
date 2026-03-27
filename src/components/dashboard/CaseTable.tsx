'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CASE_BADGE_COLORS, METHOD_BADGE_COLORS, TYPE_BADGE_COLORS } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface CaseTableProps {
  data: any[] | null;
  isLoading: boolean;
}

export default function CaseTable({ data, isLoading }: CaseTableProps) {
  const [displayCount, setDisplayCount] = useState<number | 'all'>(10);

  const displayData = data || [];
  const slicedData = displayCount === 'all' ? displayData : displayData.slice(0, displayCount);

  return (
    <Card className="rounded-xl border-slate-200 overflow-hidden shadow-sm h-full">
      <CardHeader className="bg-white border-b py-4 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <div className="h-5 w-1 bg-accent rounded-full" />
          유사 사례
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">표시 개수</span>
          <Select 
            value={String(displayCount)} 
            onValueChange={(val) => setDisplayCount(val === 'all' ? 'all' : Number(val))}
          >
            <SelectTrigger className="w-[100px] h-9">
              <SelectValue placeholder="표시 개수" />
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
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[1500px]">
              <TableHeader className="bg-slate-50 border-b">
                <TableRow>
                  <TableHead className="h-12 font-bold text-slate-700 text-center w-[100px] border-r text-sm">지역</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-center w-[100px] border-r text-sm">단계</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-center w-[120px] border-r text-sm">유형</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 w-[120px] border-r text-xs">민원인</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 w-[150px] border-r text-xs">요구사항</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-center w-[80px] border-r text-xs">진행경과</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-center w-[100px] border-r text-xs">보상방식</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-right w-[120px] border-r text-xs">보상금액(원)</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 w-[120px] text-xs">상세내용</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slicedData.length > 0 ? (
                  slicedData.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="border-r text-center align-top p-4">
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-none rounded-full text-xs font-bold whitespace-nowrap px-2.5 py-0.5"
                        >
                          {item.region}
                        </Badge>
                      </TableCell>
                      <TableCell className="border-r text-center align-top p-4">
                        <Badge
                          variant="outline"
                          className="bg-orange-50 text-orange-700 border-none rounded-full text-xs font-bold whitespace-nowrap px-2.5 py-0.5"
                        >
                          {item.phase}
                        </Badge>
                      </TableCell>
                      <TableCell className="border-r text-center align-top p-4">
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {Array.isArray(item.type) ? item.type.map((t: string) => (
                            <Badge
                              key={t}
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-none rounded-full text-xs font-bold whitespace-nowrap px-2.5 py-0.5"
                            >
                              {t}
                            </Badge>
                          )) : (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-none rounded-full text-xs font-bold whitespace-nowrap px-2.5 py-0.5"
                            >
                              {item.type}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top p-4 text-xs font-bold text-slate-700 border-r">
                        {item.complainant}
                      </TableCell>
                      <TableCell className="align-top p-4 border-r">
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(item.requestContent) ? item.requestContent.map((rt: string) => (
                            <Badge key={rt} variant="outline" className="bg-rose-50 text-rose-600 border-none rounded-full text-xs font-bold whitespace-nowrap px-2.5 py-0.5">
                              {rt}
                            </Badge>
                          )) : (
                            <Badge variant="outline" className="bg-rose-50 text-rose-600 border-none rounded-full text-xs font-bold whitespace-nowrap px-2.5 py-0.5">
                              {item.requestContent}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top p-4 text-center border-r">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs font-bold border-none rounded-full px-2.5 py-0.5 whitespace-nowrap",
                            item.progress === '종결' ? "bg-slate-100 text-slate-600" :
                            item.progress === '진행' ? "bg-blue-50 text-blue-600" :
                            "bg-amber-50 text-amber-600"
                          )}
                        >
                          {item.progress}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top p-4 border-r text-center">
                        <Badge variant="outline" className="bg-teal-50 text-teal-600 border-none rounded-full text-xs font-bold whitespace-nowrap px-2.5 py-0.5">
                          {item.compensationMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top p-4 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap text-xs border-r">
                        {item.compensationAmount?.toLocaleString() || '-'}
                      </TableCell>
                      <TableCell className="align-top p-4 text-xs text-slate-600 leading-relaxed max-w-[120px]">
                        {item.details?.startsWith('http') ? (
                          <a 
                            href={item.details} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            문서 보기 <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          item.details
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-24 text-slate-400">
                      등록된 보상 사례 데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
