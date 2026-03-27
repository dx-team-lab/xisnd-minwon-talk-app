
'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FILTER_OPTIONS } from '@/lib/constants';
import { Search, RotateCcw, Download, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface FilterBarProps {
  filters: Record<string, string[]>;
  onFilterChange: (key: string, value: string) => void;
  onRemoveFilter: (key: string, value: string) => void;
  onReset: () => void;
  guideCount: number;
  caseCount: number;
  searchKeyword: string;
  onSearchChange: (val: string) => void;
  onDownload?: () => void;
}

export default function FilterBar({ filters, onFilterChange, onRemoveFilter, onReset, guideCount, caseCount, searchKeyword, onSearchChange, onDownload }: FilterBarProps) {
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    onReset();
    setResetKey(prev => prev + 1);
  };
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-primary font-bold">
          <Search className="h-5 w-5" />
          <h2 className="font-headline">검색조건</h2>
        </div>
        
        <div className="flex flex-wrap items-end gap-4">
          {Object.entries(FILTER_OPTIONS).map(([key, config]) => (
            <div key={key} className="min-w-[160px] space-y-2">
              <Label className="text-xs font-bold text-slate-500 ml-1">
                {config.label}
              </Label>
              <Select key={`${key}-${resetKey}`} onValueChange={(val) => onFilterChange(key, val)}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  {config.options.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          <div className="flex items-center gap-2 ml-auto pb-0.5">
            <div className="relative min-w-[280px]">
              <Input 
                placeholder="검색어를 입력해 주세요" 
                value={searchKeyword}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-10 bg-white rounded-xl border-slate-200"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
            <Button variant="outline" size="icon" onClick={handleReset} className="h-10 w-10 rounded-xl">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onDownload} className="rounded-lg h-10 w-10 hidden">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selected Filter Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(filters).flatMap(([key, values]) => 
            values.map(val => (
              <Badge key={`${key}-${val}`} variant="secondary" className="gap-1.5 py-1 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 rounded-full">
                {FILTER_OPTIONS[key as keyof typeof FILTER_OPTIONS].label}: {val}
                <button onClick={() => onRemoveFilter(key, val)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              검색결과 <span className="text-slate-300 mx-2">|</span> 
              대응 방안: <span className="text-primary">{guideCount}건</span> <span className="text-slate-300 mx-2">|</span> 
              유사 사례: <span className="text-primary">{caseCount}건</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
