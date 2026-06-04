'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FILTER_OPTIONS } from '@/lib/constants';
import { Search, RotateCcw, Download, X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { TooltipProvider } from '@/components/ui/tooltip';
import FilterInfoTooltip from './FilterInfoTooltip';

interface FilterBarProps {
  filters: Record<string, string[]>;
  onFilterChange: (key: string, value: string) => void;
  onRemoveFilter: (key: string, value: string) => void;
  onReset: () => void;
  guideCount: number;
  caseCount: number;
  planCount: number;
  searchKeyword: string;
  onSearchChange: (val: string) => void;
  onDownload?: () => void;
}

export default function FilterBar({
  filters,
  onFilterChange,
  onRemoveFilter,
  onReset,
  guideCount,
  caseCount,
  planCount,
  searchKeyword,
  onSearchChange,
  onDownload
}: FilterBarProps) {
  const [resetKey, setResetKey] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleReset = () => {
    onReset();
    setResetKey(prev => prev + 1);
  };

  const handleCloseSearch = () => {
    onSearchChange('');
    setIsSearchOpen(false);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Compact Filter Bar - 1줄 */}
        <div className="rounded-xl border bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            {/* 검색조건 타이틀 */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">검색조건</span>
            </div>

            {/* 구분선 */}
            <div className="w-px h-4 bg-gray-300"></div>

            {/* 좌측 필터 영역 */}
            <div className="flex items-center gap-4">
              {Object.entries(FILTER_OPTIONS).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs font-bold text-slate-500 whitespace-nowrap">
                      {config.label}
                    </Label>
                    <FilterInfoTooltip type={key as any} />
                  </div>
                  <Select key={`${key}-${resetKey}`} onValueChange={(val) => onFilterChange(key, val)}>
                    <SelectTrigger className="w-32 h-9 bg-slate-50 border-slate-200 text-sm">
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      {config.options.map(opt => (
                        <SelectItem key={opt} value={opt}>
                          {opt === '착공전' ? '착공전(철거)' : opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* 우측 검색 및 초기화 영역 */}
            <div className="ml-auto flex items-center gap-2">
              {isSearchOpen ? (
                <div className="relative flex items-center">
                  <Input
                    autoFocus
                    type="text"
                    placeholder="검색어 입력..."
                    value={searchKeyword}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8 pr-8 h-9 bg-slate-50 rounded-lg border-slate-200 text-sm w-48"
                  />
                  <Search className="absolute left-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <button
                    onClick={handleCloseSearch}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="h-9 w-9 rounded-lg"
                  title="검색"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                className="h-9 w-9 rounded-lg"
                title="초기화"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Selected Filter Tags */}
        {Object.keys(filters).some(key => filters[key].length > 0) && (
          <div className="flex flex-wrap gap-2 px-2">
            {Object.entries(filters).flatMap(([key, values]) =>
              values.map(val => (
                <Badge key={`${key}-${val}`} variant="secondary" className="gap-1.5 py-1 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 rounded-full">
                  {FILTER_OPTIONS[key as keyof typeof FILTER_OPTIONS].label}: {val === '착공전' ? '착공전(철거)' : val}
                  <button onClick={() => onRemoveFilter(key, val)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                검색결과 <span className="text-slate-300 mx-2">|</span>
                유사 사례: <span className="text-primary">{caseCount}건</span> <span className="text-slate-300 mx-2">|</span>
                대응 방안: <span className="text-primary">{planCount}건</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
