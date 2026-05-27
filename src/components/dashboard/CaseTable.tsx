'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CategoryBadge } from '@/components/common/CategoryBadge';
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
            <Table className="w-full">
              <TableHeader className="bg-slate-50 border-b">
                <TableRow>
                  <TableHead className="h-10 font-bold text-slate-700 text-center border-r text-xs">민원 내용</TableHead>
                  <TableHead className="h-10 font-bold text-slate-700 text-center w-20 border-r text-xs whitespace-nowrap">발생시점</TableHead>
                  <TableHead className="h-10 font-bold text-slate-700 text-center w-24 border-r text-xs whitespace-nowrap">유형</TableHead>
                  <TableHead className="h-10 font-bold text-slate-700 text-center w-20 border-r text-xs whitespace-nowrap">신청인</TableHead>
                  <TableHead className="h-10 font-bold text-slate-700 text-center w-24 text-xs whitespace-nowrap">보상금액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slicedData.length > 0 ? (
                  slicedData.map((item, idx) => (
                    <TableRow
                      key={idx}
                      className={cn(
                        "transition-colors",
                        item.details?.startsWith('http') && "cursor-pointer hover:bg-slate-50"
                      )}
                      onClick={() => {
                        if (item.details?.startsWith('http')) {
                          window.open(item.details, '_blank');
                        }
                      }}
                    >
                      <TableCell className="border-r align-top px-2 py-3 text-xs text-slate-600 leading-relaxed text-left whitespace-normal font-semibold">
                        {item.complaintContent}
                      </TableCell>
                      <TableCell className="border-r text-center align-top px-2 py-3 text-xs whitespace-nowrap font-semibold">
                        {item.phase}
                      </TableCell>
                      <TableCell className="border-r text-center align-top px-2 py-3 text-xs whitespace-nowrap font-semibold">
                        {Array.isArray(item.type) ? item.type.join(', ') : item.type}
                      </TableCell>
                      <TableCell className="border-r text-center align-top px-2 py-3 text-xs font-bold text-slate-700 whitespace-nowrap">
                        {item.complainant}
                      </TableCell>
                      <TableCell className="text-right align-top px-2 py-3 pr-4 text-xs font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {item.compensationAmount?.toLocaleString() || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center">
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
