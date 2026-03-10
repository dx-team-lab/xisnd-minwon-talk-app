'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import Header from '@/components/common/Header';
import HeroBanner from '@/components/dashboard/HeroBanner';
import FilterBar from '@/components/dashboard/FilterBar';
import ResponsePlanTable from '@/components/dashboard/ResponsePlanTable';
import CaseTable from '@/components/dashboard/CaseTable';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const [filters, setFilters] = useState<Record<string, string[]>>({
    region: [],
    phase: [],
    type: [],
    compensation: []
  });

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  // Firestore Data Fetching - Only fetch when user is authenticated
  const guidesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'responseGuides'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const casesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'caseExamples'), orderBy('createdAt', 'desc'));
  }, [db, user]);
  
  const { data: rawGuides, isLoading: isGuidesLoading } = useCollection(guidesQuery);
  const { data: rawCases, isLoading: isCasesLoading } = useCollection(casesQuery);

  // Filter Logic
  const filteredGuides = useMemo(() => {
    if (!rawGuides) return [];
    return rawGuides.filter(g => {
      const matchRegion = filters.region.length === 0 || filters.region.includes(g.region);
      const matchPhase = filters.phase.length === 0 || filters.phase.includes(g.phase);
      const matchType = filters.type.length === 0 || 
        (Array.isArray(g.type) 
          ? g.type.some(t => filters.type.includes(t))
          : filters.type.includes(g.type));
      return matchRegion && matchPhase && matchType;
    });
  }, [rawGuides, filters]);

  const filteredCases = useMemo(() => {
    if (!rawCases) return [];
    return rawCases.filter(c => {
      const matchRegion = filters.region.length === 0 || filters.region.includes(c.region);
      const matchPhase = filters.phase.length === 0 || filters.phase.includes(c.phase);
      const matchType = filters.type.length === 0 || 
        (Array.isArray(c.type) 
          ? c.type.some(t => filters.type.includes(t))
          : filters.type.includes(c.type));
      
      const matchComp = filters.compensation.length === 0 || 
        (Array.isArray(c.requestType) 
          ? c.requestType.some(rt => filters.compensation.includes(rt))
          : filters.compensation.includes(c.requestType));
          
      return matchRegion && matchPhase && matchType && matchComp;
    });
  }, [rawCases, filters]);

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
    setFilters({ region: [], phase: [], type: [], compensation: [] });
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user && userProfile && !userProfile.approved) {
    return (
      <div className="min-h-screen bg-[#F0F4FF] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
            <Lock className="h-10 w-10 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">승인 대기 중</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              회원가입이 완료되었습니다. 대시보드 접근을 위해서는 관리자의 승인이 필요합니다. 관리자에게 승인을 요청해 주세요.
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => window.location.reload()}>
              상태 새로고침
            </Button>
            <Button variant="ghost" className="w-full h-12 text-slate-500" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>
        <p className="mt-8 text-slate-400 text-xs">관리자 문의: jin38@xisnd.com</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <Header />
      <HeroBanner />
      <main className="container mx-auto px-4 py-8 space-y-12">
        <FilterBar 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onRemoveFilter={removeFilter} 
          onReset={resetFilters}
          resultCount={filteredGuides.length + filteredCases.length}
        />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <ResponsePlanTable data={filteredGuides} isLoading={isGuidesLoading} />
          <CaseTable data={filteredCases} isLoading={isCasesLoading} />
        </div>
      </main>
    </div>
  );
}
