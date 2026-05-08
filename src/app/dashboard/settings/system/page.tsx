'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function SystemSettingsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

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

        <Tabs defaultValue="site" className="w-full">
          <TabsList className="bg-white border w-full md:w-auto grid grid-cols-2 lg:flex rounded-xl p-1 h-auto">
            <TabsTrigger value="site" className="rounded-lg py-3 px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              현장 관리
            </TabsTrigger>
            <TabsTrigger value="mainImage" className="rounded-lg py-3 px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              메인 이미지
            </TabsTrigger>
            <TabsTrigger value="procedure" className="rounded-lg py-3 px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              민원 대응 절차 관리
            </TabsTrigger>
            <TabsTrigger value="references" className="rounded-lg py-3 px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              참고자료 관리
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="rounded-lg py-3 px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              문의/요청 관리
            </TabsTrigger>
            <TabsTrigger value="response" className="rounded-lg py-3 px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              대응 방안
            </TabsTrigger>
            <TabsTrigger value="case" className="rounded-lg py-3 px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              사례
            </TabsTrigger>
            <TabsTrigger value="actionLinks" className="rounded-lg py-3 px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              조치방안(링크)
            </TabsTrigger>
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
