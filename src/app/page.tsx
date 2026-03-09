
import Header from '@/components/common/Header';
import HeroBanner from '@/components/dashboard/HeroBanner';
import FilterBar from '@/components/dashboard/FilterBar';
import ResponsePlanTable from '@/components/dashboard/ResponsePlanTable';
import CaseTable from '@/components/dashboard/CaseTable';
import AIAssistantDialog from '@/components/dashboard/AIAssistantDialog';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <HeroBanner />
        
        <div className="container mx-auto px-4 py-12 space-y-12">
          {/* Search Section */}
          <section id="search">
            <FilterBar />
          </section>

          {/* Main Content Section */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-4">
              <ResponsePlanTable />
            </div>
            <div className="space-y-4">
              <CaseTable />
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-white border-t py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-200 text-slate-600 font-bold text-xs">M</div>
              <span className="text-sm font-headline font-bold text-slate-400">민원 커뮤니티</span>
            </div>
            <p className="text-xs text-slate-400">
              © 2024 MinwonTalk. All rights reserved. 건설 현장의 체계적인 민원 관리를 위해 노력합니다.
            </p>
            <div className="flex gap-6 text-xs text-slate-400 font-medium">
              <a href="#" className="hover:text-primary transition-colors">이용약관</a>
              <a href="#" className="hover:text-primary transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-primary transition-colors">고객지원</a>
            </div>
          </div>
        </div>
      </footer>

      <AIAssistantDialog />
    </div>
  );
}
