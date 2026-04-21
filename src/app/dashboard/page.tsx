'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { useUser, useFirestore, useMemoFirebase, useCollection, useAuth } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Header from '@/components/common/Header';
import FilterBar from '@/components/dashboard/FilterBar';
import ResponsePlanTable from '@/components/dashboard/ResponsePlanTable';
import CaseTable from '@/components/dashboard/CaseTable';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const [filters, setFilters] = useState<Record<string, string[]>>({
    region: [],
    phase: [],
    type: []
  });

  const [searchKeyword, setSearchKeyword] = useState('');



  // Check if response-related filters are active (Region, Phase, Type)
  const isResponseFilterActive = useMemo(() => {
    return filters.region.length > 0 || filters.phase.length > 0 || filters.type.length > 0;
  }, [filters.region, filters.phase, filters.type]);

  // Firestore Data Fetching - Only fetch when user is authenticated
  const guidesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'responseGuides'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const casesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'caseExamples'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const actionPlanLinksQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'actionPlanLinks');
  }, [db, user]);

  const { data: rawGuides, isLoading: isGuidesLoading } = useCollection(guidesQuery);
  const { data: rawCases, isLoading: isCasesLoading } = useCollection(casesQuery);
  const { data: rawActionPlanLinks } = useCollection(actionPlanLinksQuery);

  // Build dictionary: { "통제원 배치": "https://...", ... }
  const actionLinkDict = useMemo(() => {
    const dict: Record<string, string> = {};
    if (rawActionPlanLinks) {
      for (const link of rawActionPlanLinks) {
        if (link.title && link.url) {
          dict[link.title.trim()] = link.url.trim();
        }
      }
    }
    return dict;
  }, [rawActionPlanLinks]);

  // Filter Logic for Guides (Reacts only to Region, Phase, Type)
  const filteredGuides = useMemo(() => {
    if (!rawGuides) return [];
    // 필터가 없더라도 전체 데이터를 보여주도록 수정

    return rawGuides.filter(g => {
      const matchRegion = filters.region.length === 0 || filters.region.includes(g.region);
      const matchPhase = filters.phase.length === 0 || filters.phase.includes(g.phase);
      const matchType = filters.type.length === 0 ||
        (Array.isArray(g.type)
          ? g.type.some((t: string) => filters.type.includes(t))
          : filters.type.includes(g.type));

      const kw = searchKeyword.toLowerCase();
      const matchKeyword = !searchKeyword ||
        (g.region || '').toLowerCase().includes(kw) ||
        (g.phase || '').toLowerCase().includes(kw) ||
        (Array.isArray(g.type) ? g.type.some((t: string) => t.toLowerCase().includes(kw)) : (g.type || '').toLowerCase().includes(kw)) ||
        (g.cause || '').toLowerCase().includes(kw) ||
        (g.action || '').toLowerCase().includes(kw);

      return matchRegion && matchPhase && matchType && matchKeyword;
    });
  }, [rawGuides, filters.region, filters.phase, filters.type, isResponseFilterActive, searchKeyword]);

  // Filter Logic for Cases (Reacts to all 4 filters)
  const filteredCases = useMemo(() => {
    if (!rawCases) return [];
    return rawCases.filter(c => {
      const matchRegion = filters.region.length === 0 || filters.region.includes(c.region);
      const matchPhase = filters.phase.length === 0 || filters.phase.includes(c.phase);
      const matchType = filters.type.length === 0 ||
        (Array.isArray(c.type)
          ? c.type.some((t: string) => filters.type.includes(t))
          : filters.type.includes(c.type));

      const kw = searchKeyword.toLowerCase();
      const matchKeyword = !searchKeyword ||
        (c.region || '').toLowerCase().includes(kw) ||
        (c.phase || '').toLowerCase().includes(kw) ||
        (Array.isArray(c.type) ? c.type.some((t: string) => t.toLowerCase().includes(kw)) : (c.type || '').toLowerCase().includes(kw)) ||
        (c.siteName || '').toLowerCase().includes(kw) ||
        (c.complaintContent || '').toLowerCase().includes(kw) ||
        (c.complainant || '').toLowerCase().includes(kw) ||
        (c.details || '').toLowerCase().includes(kw) ||
        (c.progress || '').toLowerCase().includes(kw) ||
        (c.compensationMethod || '').toLowerCase().includes(kw) ||
        (Array.isArray(c.requestContent) ? c.requestContent.some((r: string) => r.toLowerCase().includes(kw)) : false) ||
        (c.occurrenceDate || '').toLowerCase().includes(kw);

      return matchRegion && matchPhase && matchType && matchKeyword;
    });
  }, [rawCases, filters, searchKeyword]);

  const handleDownload = () => {
    if (!filteredGuides || !filteredCases) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }

    try {
      // 1. Prepare Response Guides Sheet
      const guideSheetData = filteredGuides.map(g => ({
        '지역': g.region || '',
        '단계': g.phase || '',
        '유형': Array.isArray(g.type) ? g.type.join(', ') : g.type || '',
        '원인': g.cause || '',
        '조치방안': g.action || ''
      }));

      // 2. Prepare Similar Cases Sheet
      const caseSheetData = filteredCases.map(c => ({
        '지역': c.region || '',
        '단계': c.phase || '',
        '유형': Array.isArray(c.type) ? c.type.join(', ') : c.type || '',
        '민원인': c.complainant || '',
        '요구사항': Array.isArray(c.requestContent) ? c.requestContent.join(', ') : c.requestContent || '',
        '진행경과': c.progress || '',
        '보상방식': c.compensationMethod || '',
        '보상금액': c.compensationAmount || 0,
        '상세내용': c.details || '',
        '발생일시': c.occurrenceDate || ''
      }));

      const wb = XLSX.utils.book_new();
      const wsGuides = XLSX.utils.json_to_sheet(guideSheetData);
      const wsCases = XLSX.utils.json_to_sheet(caseSheetData);

      XLSX.utils.book_append_sheet(wb, wsGuides, '대응 방안');
      XLSX.utils.book_append_sheet(wb, wsCases, '유사 사례');

      const today = format(new Date(), 'yyyyMMdd');
      const fileName = `민원대응_지식현황판_${today}.xlsx`;

      // XLSX.writeFile 대신 보안 브라우저 대응을 위한 수동 Blob 다운로드 방식 적용
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Excel Download Error:', error);
      alert('엑셀 파일 생성 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleFilterChange = (key: string, value: string) => {
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
    setFilters({ region: [], phase: [], type: [] });
    setSearchKeyword('');
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <Header />
      <main className="container mx-auto px-4 pt-6 pb-12 space-y-12">
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onRemoveFilter={removeFilter}
          onReset={resetFilters}
          guideCount={filteredGuides.length}
          caseCount={filteredCases.length}
          searchKeyword={searchKeyword}
          onSearchChange={setSearchKeyword}
          onDownload={handleDownload}
        />
        {/* Layout Changed to Vertical Stack */}
        <div className="flex flex-col gap-8">
          <ResponsePlanTable
            data={filteredGuides}
            isLoading={isGuidesLoading}
            isFilterActive={isResponseFilterActive}
            actionLinkDict={actionLinkDict}
          />
          <CaseTable
            data={filteredCases}
            isLoading={isCasesLoading}
          />
        </div>
      </main>
    </div>
  );
}
