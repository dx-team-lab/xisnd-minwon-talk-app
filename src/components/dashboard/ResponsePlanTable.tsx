
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ExternalLink, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ResponsePlanV2Item {
  id?: string;
  category: string;
  content: string;
  sharePointUrl?: string;
}

interface ResponsePlanTableProps {
  data: ResponsePlanV2Item[] | null;
  isLoading: boolean;
}

export default function ResponsePlanTable({ data, isLoading }: ResponsePlanTableProps) {
  const [rowsPerPage, setRowsPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data && data.length > 0 ? data : [];

  // Reset to first page when data or rowsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data, rowsPerPage]);

  const itemsPerPage = rowsPerPage === 'all' ? filteredData.length : parseInt(rowsPerPage, 10);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  
  const displayData = rowsPerPage === 'all' 
    ? filteredData 
    : filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
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
          <div className="h-5 w-1 bg-primary rounded-full" />
          대응 방안
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">표시 개수</span>
          <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
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
      <CardContent className="p-0 overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <Table className="border-collapse min-w-[400px]">
            <TableHeader className="bg-slate-50 border-b">
              <TableRow>
                <TableHead className="h-10 font-bold border-r text-slate-700 text-center w-[180px] text-xs whitespace-nowrap">구 분</TableHead>
                <TableHead className="h-10 font-bold text-slate-700 text-xs min-w-[250px]">주요 내용</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length > 0 ? (
                displayData.map((row, idx) => (
                  <TableRow key={row.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="border-r text-center align-top px-2 py-3 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {row.category}
                    </TableCell>
                    <TableCell className="align-top px-2 py-3 text-xs leading-relaxed text-slate-600">
                      <div className="flex flex-col gap-1">
                        <span className="whitespace-pre-wrap">{row.content}</span>
                        {row.sharePointUrl && (
                          <a
                            href={row.sharePointUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-0.5 text-xs font-semibold mt-1 w-fit"
                          >
                            [문서 보기] <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <SearchX className="h-12 w-12 text-slate-300 mb-4" />
                      <p className="text-slate-600 font-medium">등록된 대응 방안이 없습니다.</p>
                      <p className="text-slate-400 text-sm mt-1">관리자 설정에서 대응 방안을 등록해 주세요.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {rowsPerPage !== 'all' && totalPages > 1 && (
        <CardFooter className="py-6 border-t flex justify-center items-center bg-slate-50/30">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md border-slate-200 text-slate-600 disabled:opacity-30"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 mx-2">
              {getPageNumbers().map((page, i) => (
                typeof page === 'number' ? (
                  <Button
                    key={i}
                    variant={currentPage === page ? "default" : "outline"}
                    className={cn(
                      "h-8 min-w-[32px] px-2 rounded-md text-sm font-medium transition-all",
                      currentPage === page 
                        ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600" 
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                    onClick={() => setCurrentPage(page)}
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
