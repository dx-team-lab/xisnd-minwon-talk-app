'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useState } from 'react';
import Header from '@/components/common/Header';
import InquiryModal from '@/components/references/InquiryModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileDown, Eye, ExternalLink, Globe, FileText, Download, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

type ReferenceFile = {
  name: string;
  url: string;
};

type DocumentCategory = {
  id: string;
  title: string;
  when: string;
  who: string;
  why: string;
  forms?: ReferenceFile[];
  examples?: ReferenceFile[];
};

type SiteReference = {
  id: string;
  title: string;
  url: string;
};

const DEFAULT_CATEGORIES: DocumentCategory[] = [
  { id: 'diary', title: '민원 일지', when: '민원 접수 즉시', who: '민원 접수자', why: '분쟁 발생 시 사실기록 증빙' },
  { id: 'agreement', title: '민원 합의서', when: '보상 합의 시', who: 'BM', why: '보상금액의 근거' },
  { id: 'blasting', title: '발파 계획서 및 계측일지', when: '보상 합의 시', who: 'BM', why: '보상금액의 근거' },
  { id: 'noise', title: '소음 측정 일지', when: '소음, 진동 공정 진행 중 수시', who: '해당 공정 관리자', why: '분쟁 발생 시 근거자료' },
  { id: 'permit', title: '환경 인허가', when: '착공전, 공사 중 수시', who: '공무', why: '행정처분 대응 근거' },
  { id: 'pledge', title: '환경 서약서 및 교육일지', when: '소음, 진동 민원 접수 시', who: '해당 공정 관리자', why: '분쟁 발생 시 근거자료' },
  { id: 'operation', title: '살수차, 세륜기 운영 일지', when: '살수차, 세륜기 운영 시', who: 'BM', why: '분쟁 발생 시 근거자료' },
];

export default function ReferencesPage() {
  const db = useFirestore();
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'references');
  }, [db]);

  const { data: references, isLoading } = useDoc(settingsRef);

  const categories = references?.documents || DEFAULT_CATEGORIES;
  const sites = references?.sites || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <Header />
      <main className="container mx-auto px-4 py-12 space-y-12">
        {/* Title Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
            민원 관련 참고자료를 <span className="text-primary italic">바로 찾아 사용하세요.</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            현장 민원 대응에 필요한 각종 양식과 가이드라인을 확인하고 다운로드할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Main Area: Document Cards */}
          <div className="flex-[5] grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat: DocumentCategory) => (
              <Card key={cat.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[32px] overflow-hidden bg-white flex flex-col h-full transform hover:-translate-y-1">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <FileText className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight break-keep">
                      {cat.title}
                    </h3>
                  </div>

                  <div className="space-y-4 flex-grow mb-8">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">언제 사용?</p>
                      <p className="text-sm font-semibold text-slate-600 leading-relaxed border-l-2 border-slate-100 pl-3 break-keep">{cat.when}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">누가 작성?</p>
                      <p className="text-sm font-semibold text-slate-600 leading-relaxed border-l-2 border-slate-100 pl-3 break-keep">{cat.who}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">중요한 이유?</p>
                      <p className="text-sm font-semibold text-slate-600 leading-relaxed border-l-2 border-slate-100 pl-3 break-keep">{cat.why}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-50">
                    <ReferenceButton 
                      title="다운로드" 
                      icon={<Download className="h-4 w-4 mr-2" />} 
                      files={cat.forms} 
                      primary
                    />
                    <ReferenceButton 
                      title="작성 예시" 
                      icon={<Eye className="h-4 w-4 mr-2" />} 
                      files={cat.examples} 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar Area: Site References */}
          <aside className="flex-[2] w-full lg:min-w-[340px] space-y-6 lg:sticky lg:top-28">
            <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
              <div className="bg-primary p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">참고 사이트</h3>
                    <p className="text-xs text-white/70">관련 기관 및 유용한 링크</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {sites.map((site: SiteReference) => (
                    <a
                      key={site.id}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-50 hover:border-primary/20 hover:bg-primary/5 transition-all group"
                    >
                      <span className="font-bold text-slate-700 group-hover:text-primary transition-colors break-keep">{site.title}</span>
                      <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary/50 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all flex-shrink-0 ml-2" />
                    </a>
                  ))}
                  {sites.length === 0 && (
                    <div className="text-center py-12 text-slate-300">
                      <p className="text-sm">등록된 사이트가 없습니다.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="p-8 rounded-[32px] bg-indigo-600 text-white space-y-4 shadow-lg shadow-indigo-200">
              <h4 className="font-bold text-lg leading-snug">도움이 필요하신가요?</h4>
              <p className="text-sm text-indigo-100 leading-relaxed">
                자료를 찾을 수 없거나 새로운 양식이 필요하다면 구매팀으로 문의해 주세요.
              </p>
              <Button 
                variant="secondary" 
                className="w-full rounded-xl font-bold bg-white text-indigo-600 hover:bg-slate-50 border-none"
                onClick={() => setIsInquiryModalOpen(true)}
              >
                구매팀으로 문의하기
              </Button>
            </div>
          </aside>
        </div>
      </main>

      <InquiryModal 
        isOpen={isInquiryModalOpen} 
        onClose={() => setIsInquiryModalOpen(false)} 
      />
    </div>
  );
}
function ReferenceButton({ 
  title, 
  icon, 
  files, 
  primary = false 
}: { 
  title: string; 
  icon: React.ReactNode; 
  files?: ReferenceFile[]; 
  primary?: boolean;
}) {
  const { toast } = useToast();
  const [isZipping, setIsZipping] = useState(false);
  
  // 실제 사용 가능한 파일 목록
  const availableFiles = files && files.length > 0 ? files : [];

  const handleDownloadAll = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (availableFiles.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();

      const fetchPromises = availableFiles.map(async (file) => {
        try {
          const response = await fetch(file.url);
          if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
          const blob = await response.blob();
          zip.file(file.name, blob);
        } catch (err) {
          console.error(`Failed to download ${file.name}:`, err);
        }
      });

      await Promise.all(fetchPromises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${title || '참고자료'}_첨부파일.zip`);
      
      toast({
        title: "다운로드 완료",
        description: "모든 파일이 ZIP으로 압축되어 다운로드되었습니다.",
      });
    } catch (error) {
      console.error('ZIP generation failed:', error);
      toast({
        title: "다운로드 실패",
        description: "파일 압축 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsZipping(false);
    }
  };

  const hasFiles = availableFiles.length > 0;

  const handleClick = () => {
    if (!hasFiles) {
      toast({
        title: "파일 없음",
        description: `등록된 ${title} 파일이 없습니다.`,
        variant: "destructive"
      });
    }
  };

  if (!hasFiles) {
    return (
      <Button
        variant="outline"
        onClick={handleClick}
        className="flex-1 h-12 rounded-2xl font-bold border-2 border-slate-100 text-slate-300 cursor-not-allowed"
      >
        {icon}{title}
      </Button>
    );
  }

  // 파일이 1개면 바로 이동
  if (availableFiles.length === 1) {
    return (
      <Button
        variant="outline"
        asChild
        className={cn(
          "flex-1 h-12 rounded-2xl font-bold border-2 transition-all",
          primary 
            ? "border-primary/10 text-primary hover:bg-primary hover:text-white hover:border-primary"
            : "border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
        )}
      >
        <a href={availableFiles[0].url} target="_blank" rel="noopener noreferrer">
          {icon}{title}
        </a>
      </Button>
    )
  }

  // 파일이 여러 개면 드롭다운
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex-1 h-12 rounded-2xl font-bold border-2 transition-all",
            primary 
              ? "border-primary/10 text-primary hover:bg-primary hover:text-white hover:border-primary"
              : "border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
          )}
        >
          {icon}{title}
          <ChevronDown className="h-3 w-3 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 min-w-[320px] rounded-2xl p-2 shadow-xl border-slate-100 overflow-hidden">
        <div className="px-2 py-1.5 text-xs font-bold text-slate-400 border-b border-slate-50 mb-1">파일 선택 ({availableFiles.length})</div>
        
        {availableFiles.length > 1 && (
          <>
            <DropdownMenuItem 
              onClick={handleDownloadAll}
              disabled={isZipping}
              className="rounded-xl cursor-pointer focus:bg-primary focus:text-white font-bold text-primary flex items-center gap-2"
            >
              {isZipping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isZipping ? '압축 중...' : '전체 파일 다운로드 (ZIP)'}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-slate-50" />
          </>
        )}

        {availableFiles.map((file, idx) => (
          <DropdownMenuItem key={idx} asChild className="rounded-xl cursor-pointer focus:bg-primary/5 focus:text-primary py-3">
            <a 
              href={file.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-start w-full gap-2 px-1"
              title={file.name}
            >
              <FileText className="h-4 w-4 mt-0.5 opacity-50 shrink-0" />
              <span className="text-sm font-medium text-slate-700 whitespace-normal break-words line-clamp-2 flex-1 leading-snug">
                {file.name}
              </span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
