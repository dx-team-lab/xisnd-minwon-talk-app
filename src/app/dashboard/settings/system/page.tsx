'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import Header from '@/components/common/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Settings2 } from 'lucide-react';
import ResponseGuideSection from '@/components/settings/ResponseGuideSection';
import CaseExampleSection from '@/components/settings/CaseExampleSection';
import ActionPlanLinkSection from '@/components/settings/ActionPlanLinkSection';
import ResponseProcedureSection from '@/components/settings/ResponseProcedureSection';
import SiteManagementSection from '@/components/settings/SiteManagementSection';
import MainImageSettingsSection from '@/components/settings/MainImageSettingsSection';
import ReferenceManagementSection from '@/components/settings/ReferenceManagementSection';
import InquiryManagementSection from '@/components/settings/InquiryManagementSection';

const TAB_GROUPS = [
  {
    category: '홈페이지 메인',
    tabs: [
      { id: 'mainImage', label: '메인 이미지' },
    ]
  },
  {
    category: '민원 현황',
    tabs: [
      { id: 'site', label: '현장 관리' },
    ]
  },
  {
    category: '민원 대응 절차',
    tabs: [
      { id: 'procedure', label: '민원 대응 절차 관리' },
    ]
  },
  {
    category: '대응 방안 / 유사 사례',
    tabs: [
      { id: 'response', label: '대응 방안' },
      { id: 'case', label: '사례' },
      { id: 'actionLinks', label: '조치방안(링크)' },
    ]
  },
  {
    category: '참고자료 / 문의',
    tabs: [
      { id: 'references', label: '참고자료 관리' },
      { id: 'inquiries', label: '문의/요청 관리' },
    ]
  }
];

export default function SystemSettingsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'mainImage');


  const adminsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'roles_admin');
  }, [db, user]);

  const managersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'roles_manager');
  }, [db, user]);

  const { data: admins, isLoading: isAdminLoading } = useCollection(adminsQuery);
  const { data: managers, isLoading: isManagerLoading } = useCollection(managersQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
      return;
    }

    if (!isUserLoading && !isAdminLoading && !isManagerLoading && admins && managers) {
      const isAdmin = admins.some(a => a.id === user?.uid);
      const isManager = managers.some(m => m.id === user?.uid);
      if (!isAdmin && !isManager) {
        router.push('/dashboard/status');
      }
    }
  }, [user, isUserLoading, admins, managers, isAdminLoading, isManagerLoading, router]);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  if (isUserLoading || isAdminLoading || isManagerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <Header />
      <main className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
            <Settings2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold text-slate-900">시스템 설정</h1>
            <p className="text-slate-500 text-sm">대응 방안 및 보상 사례 마스터 데이터를 관리합니다.</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-0 w-full h-auto flex flex-wrap items-end gap-x-6 gap-y-6 p-0">
            {TAB_GROUPS.map((group) => (
              <div key={group.category} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 ml-1">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">{group.category}</span>
                </div>
                <div className="flex items-center bg-white p-1 rounded-[16px] border border-slate-200 shadow-sm gap-1">
                  {group.tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="rounded-[12px] py-2.5 px-6 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all whitespace-nowrap"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </div>
              </div>
            ))}
          </TabsList>
          
          <div className="mt-8">
            <TabsContent value="site">
              <SiteManagementSection />
            </TabsContent>
            <TabsContent value="mainImage">
              <MainImageSettingsSection />
            </TabsContent>
            <TabsContent value="procedure">
              <ResponseProcedureSection />
            </TabsContent>
            <TabsContent value="references">
              <ReferenceManagementSection />
            </TabsContent>
            <TabsContent value="inquiries">
              <InquiryManagementSection />
            </TabsContent>
            <TabsContent value="response">
              <ResponseGuideSection />
            </TabsContent>
            <TabsContent value="case">
              <CaseExampleSection />
            </TabsContent>
            <TabsContent value="actionLinks">
              <ActionPlanLinkSection />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
