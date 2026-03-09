
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FILTER_OPTIONS } from '@/lib/constants';
import { Search, RotateCcw, Download, Grid, Table as TableIcon, MapPin, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function FilterBar() {
  const [filters, setFilters] = useState<Record<string, string[]>>({
    region: [],
    phase: [],
    type: [],
    compensation: []
  });

  const handleSelect = (key: string, value: string) => {
    if (value === '전체') {
      setFilters(prev => ({ ...prev, [key]: [] }));
      return;
    }
    if (!filters[key].includes(value)) {
      setFilters(prev => ({
        ...prev,
        [key]: [...prev[key], value]
      }));
    }
  };

  const removeFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].filter(v => v !== value)
    }));
  };

  const resetFilters = () => {
    setFilters({
      region: [],
      phase: [],
      type: [],
      compensation: []
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-primary font-bold">
          <Search className="h-5 w-5" />
          <h2 className="font-headline">검색조건</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {Object.entries(FILTER_OPTIONS).map(([key, config]) => (
            <div key={key} className="min-w-[160px]">
              <Select onValueChange={(val) => handleSelect(key, val)}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder={config.label} />
                </SelectTrigger>
                <SelectContent>
                  {config.options.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          <div className="flex items-center gap-2 ml-auto">
            <Button size="icon" className="bg-primary hover:bg-primary/90 rounded-lg">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={resetFilters} className="rounded-lg">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-lg">
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
                <button onClick={() => removeFilter(key, val)}>
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
            <span className="text-lg font-bold">검색결과 <span className="text-primary">101건</span></span>
          </div>
          <p className="text-sm text-muted-foreground">
            진행 단계와 발생 건수 및 관계가 가장 많은 진행중 프로젝트를 가장 먼저 보여주며...
          </p>
        </div>
        
        <div className="flex items-center bg-white border rounded-lg p-1">
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 bg-slate-100 font-bold">
            <TableIcon className="h-4 w-4" />
            표
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 hover:bg-slate-100">
            <Grid className="h-4 w-4" />
            갤러리
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 hover:bg-slate-100">
            <MapPin className="h-4 w-4" />
            지도
          </Button>
        </div>
      </div>
    </div>
  );
}
