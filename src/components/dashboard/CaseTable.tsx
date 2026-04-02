'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CASE_BADGE_COLORS, METHOD_BADGE_COLORS, TYPE_BADGE_COLORS } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CaseTableProps {
  data: any[] | null;
  isLoading: boolean;
}

export default function CaseTable({ data, isLoading }: CaseTableProps) {
  const [displayCount, setDisplayCount] = useState<number | 'all'>(10);
  const [currentCasePage, setCurrentCasePage] = useState(1);

  const displayData = data || [];

  // Reset to first page when data or displayCount changes
  useEffect(() => {
    setCurrentCasePage(1);
  }, [data, displayCount]);

  const itemsPerPage = displayCount === 'all' ? displayData.length : Number(displayCount);
  const totalPages = Math.max(1, Math.ceil(displayData.length / itemsPerPage));
  
  const slicedData = displayCount === 'all' 
    ? displayData 
    : displayData.slice((currentCasePage - 1) * itemsPerPage, currentCasePage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentCasePage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentCasePage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentCasePage - 1; i <= currentCasePage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

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
                          className="bg-emerald-50 text-emerald-700 border-none rounded-full text-sm font-bold whitespace-nowrap px-3 py-1"
                        >
                          {item.region}
                        </Badge>
                      </TableCell>
                      <TableCell className="border-r text-center align-top p-4">
                        <Badge
                          variant="outline"
                          className="bg-orange-50 text-orange-700 border-none rounded-full text-sm font-bold whitespace-nowrap px-3 py-1"
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
                              className="bg-blue-50 text-blue-700 border-none rounded-full text-sm font-bold whitespace-nowrap px-3 py-1"
                            >
                              {t}
                            </Badge>
                          )) : (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-none rounded-full text-sm font-bold whitespace-nowrap px-3 py-1"
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
                            <Badge key={rt} variant="outline" className="bg-rose-50 text-rose-600 border-none rounded-full text-sm font-bold whitespace-nowrap px-3 py-1">
                              {rt}
                            </Badge>
                          )) : (
                            <Badge variant="outline" className="bg-rose-50 text-rose-600 border-none rounded-full text-sm font-bold whitespace-nowrap px-3 py-1">
                              {item.requestContent}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top p-4 text-center border-r">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-sm font-bold border-none rounded-full px-3 py-1 whitespace-nowrap",
                            item.progress === '종결' ? "bg-slate-100 text-slate-600" :
                            item.progress === '진행' ? "bg-blue-50 text-blue-600" :
                            "bg-amber-50 text-amber-600"
                          )}
                        >
                          {item.progress}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top p-4 border-r text-center">
                        <Badge variant="outline" className="bg-teal-50 text-teal-600 border-none rounded-full text-sm font-bold whitespace-nowrap px-3 py-1">
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
                    <TableCell colSpan={12} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <SearchX className="h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-slate-600 font-medium">검색 조건에 맞는 데이터가 없습니다.</p>
                        <p className="text-slate-400 text-sm mt-1">다른 검색어를 입력하거나 필터 조건을 변경해 보세요.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {displayCount !== 'all' && totalPages > 1 && (
        <CardFooter className="py-6 border-t flex justify-center items-center bg-slate-50/30">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md border-slate-200 text-slate-600 disabled:opacity-30"
              onClick={() => setCurrentCasePage(prev => Math.max(1, prev - 1))}
              disabled={currentCasePage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 mx-2">
              {getPageNumbers().map((page, i) => (
                typeof page === 'number' ? (
                  <Button
                    key={i}
                    variant={currentCasePage === page ? "default" : "outline"}
                    className={cn(
                      "h-8 min-w-[32px] px-2 rounded-md text-sm font-medium transition-all",
                      currentCasePage === page 
                        ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600" 
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                    onClick={() => setCurrentCasePage(page)}
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={i} className="px-2 text-slate-400 font-medium">
                    {page}
                  </span>
                )
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md border-slate-200 text-slate-600 disabled:opacity-30"
              onClick={() => setCurrentCasePage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentCasePage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
