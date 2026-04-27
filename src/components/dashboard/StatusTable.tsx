
'use client';

import React, { useState, useEffect } from 'react';
import { Site, SiteImage, SiteComplaint } from '@/lib/types';
import { Loader2, SearchX, X, Check, Hourglass, Circle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StatusTableProps {
  data: Site[] | null;
  isLoading: boolean;
}

const getCircledNumber = (num: number) => {
  if (num >= 1 && num <= 20) {
    return String.fromCharCode(0x245F + num);
  }
  return `(${num})`;
};

const STAGES = ['민원 발생', '민원 대응', '보상 협상', '합의 및 집행', '완료'];

const ComplaintDetailsModal = ({ 
  siteName, 
  complaint, 
  links,
  onClose 
}: { 
  siteName: string;
  complaint: SiteComplaint;
  links: any[] | null;
  onClose: () => void;
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc, true);
    return () => {
      document.removeEventListener('keydown', handleEsc, true);
    };
  }, [onClose]);

  const currentStageIndex = STAGES.indexOf(complaint.stage || '민원 발생');

  const getStageStatus = (idx: number) => {
    if (currentStageIndex === 4) return 'completed';
    if (idx < currentStageIndex) return 'completed';
    if (idx === currentStageIndex) return 'current';
    return 'pending';
  };

  const getStageContent = (stageName: string) => {
    if (!complaint.stageDetails) return null;
    switch(stageName) {
      case '민원 발생': return complaint.stageDetails.occurrence;
      case '민원 대응': return complaint.stageDetails.response;
      case '보상 협상': return complaint.stageDetails.negotiation;
      case '합의 및 집행': return complaint.stageDetails.agreement;
      default: return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[12px] shadow-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── 헤더 : 항상 고정 ── */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div>
             <h2 className="text-xl font-bold text-slate-800">{siteName}</h2>
             <p className="text-sm text-slate-500 mt-1">민원인 : {complaint.complainant}({complaint.usage})</p>
          </div>
          <div className="flex items-center gap-4">
            {complaint.status === '완료' ? (
              <span className="inline-flex items-center gap-1.5 text-blue-700 font-bold bg-blue-100 px-3 py-1 rounded-full text-sm">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                완료
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-700 font-bold bg-red-100 px-3 py-1 rounded-full text-sm">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                진행중
              </span>
            )}
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* ── 스텝퍼 : 헤더 바로 아래 고정 ── */}
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-slate-100 bg-white">
          <div className="flex items-start justify-between w-full max-w-[700px] mx-auto px-4">
            {STAGES.slice(0, 4).map((stage, idx) => {
              const status = getStageStatus(idx);
              const isLast = idx === 3;
              return (
                <React.Fragment key={stage}>
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    {status === 'completed' ? (
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center z-10 border-2 border-blue-600">
                        <Check className="w-5 h-5" />
                      </div>
                    ) : status === 'current' ? (
                      <div className="w-9 h-9 rounded-full bg-white text-blue-600 border-2 border-blue-600 flex items-center justify-center z-10 shadow-[0_0_0_3px_rgba(37,99,235,0.2)]">
                        <Hourglass className="w-4 h-4 animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white text-slate-300 border-2 border-slate-300 flex items-center justify-center z-10">
                        <Circle className="w-3 h-3 fill-slate-200" />
                      </div>
                    )}
                    <span className={`text-xs font-bold text-center whitespace-nowrap ${status === 'pending' ? 'text-slate-400' : 'text-slate-700'}`}>
                      {stage}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={`flex-1 h-[2px] mt-[18px] mx-2 ${idx < currentStageIndex && currentStageIndex > 0 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── 테이블 : 이 영역만 스크롤 ── */}
        <div className="modal-scroll-area flex-1 overflow-y-auto p-6">
          <div className="border border-slate-200 rounded-lg overflow-hidden">
             <Table className="border-collapse w-full">
               <TableBody>
                 {STAGES.slice(0, 4).map((stage) => {
                   const content = getStageContent(stage);
                   return (
                     <TableRow key={stage} className="hover:bg-transparent border-b border-slate-200 last:border-0">
                       <TableCell className="w-[150px] bg-slate-50 text-center font-bold text-slate-700 border-r border-slate-200 p-4 align-top">
                         {stage}
                       </TableCell>
                       <TableCell className="p-4 align-top">
                         {content ? (
                           <div className="whitespace-pre-wrap text-slate-700 break-words leading-relaxed">
                             {content}
                           </div>
                         ) : (
                           <span className="text-slate-400">입력된 내용 없음</span>
                         )}
                       </TableCell>
                     </TableRow>
                   )
                 })}
                  
                  {/* 대응 방안 */}
                  <TableRow className="hover:bg-transparent border-b border-slate-200">
                    <TableCell className="w-[150px] bg-slate-50 text-center font-bold text-slate-700 border-r border-slate-200 p-4 align-top">
                      대응 방안
                    </TableCell>
                    <TableCell className="p-4 align-top">
                      {complaint.responsePlans && complaint.responsePlans.length > 0 ? (
                        <ul className="space-y-1.5 list-none">
                          {complaint.responsePlans.map((planTitle, idx) => {
                            const linkInfo = links?.find(l => l.title === planTitle);
                            return (
                              <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                                <span className="font-medium">{idx + 1}) {planTitle}</span>
                                {linkInfo?.url && (
                                  <a 
                                    href={linkInfo.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-blue-600 hover:underline text-xs flex items-center gap-0.5 ml-1"
                                  >
                                    [문서 보기]
                                  </a>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <span className="text-slate-400">등록된 항목 없음</span>
                      )}
                    </TableCell>
                  </TableRow>

                  {/* 유사 사례 */}
                  <TableRow className="hover:bg-transparent border-b border-slate-200 last:border-0">
                    <TableCell className="w-[150px] bg-slate-50 text-center font-bold text-slate-700 border-r border-slate-200 p-4 align-top">
                      유사 사례
                    </TableCell>
                    <TableCell className="p-4 align-top">
                      {complaint.similarCases && complaint.similarCases.length > 0 ? (
                        <ul className="space-y-2 list-none">
                          {complaint.similarCases.map((caseItem, idx) => (
                            <li key={idx} className="text-sm text-slate-700">
                              <div className="flex items-start gap-2">
                                <span className="font-medium shrink-0">{idx + 1})</span>
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-2">
                                    <span>{caseItem.text}</span>
                                    {caseItem.url && (
                                      <a 
                                        href={caseItem.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-blue-600 hover:underline text-xs"
                                      >
                                        [문서 보기]
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-400">등록된 항목 없음</span>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
             </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageModal = ({ siteName, images, onClose }: { siteName: string, images: SiteImage[], onClose: () => void }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[12px] shadow-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ maxWidth: '90vw', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-lg font-bold text-slate-800">{siteName} 이미지</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-auto flex flex-col gap-4">
          {images.map((img, idx) => (
            <img 
              key={img.id || idx} 
              src={img.base64} 
              alt={`${siteName} 이미지 ${idx + 1}`} 
              className="w-full h-auto max-w-full rounded border shadow-sm object-contain cursor-zoom-in hover:opacity-95 transition-opacity" 
              onClick={() => {
                const w = window.open('', '_blank');
                if (w) {
                  w.document.write(`<html><head><title>${siteName} 이미지</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;min-height:100vh;"><img src="${img.base64}" style="max-width:100%;max-height:100%;" /></body></html>`);
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ComplaintModal = ({ 
  siteName, 
  completedCount, 
  inProgressCount, 
  complaints, 
  links,
  onClose 
}: { 
  siteName: string;
  completedCount: number;
  inProgressCount: number;
  complaints: SiteComplaint[];
  links: any[] | null;
  onClose: () => void;
}) => {
  const [selectedComplaint, setSelectedComplaint] = useState<SiteComplaint | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (selectedComplaint) return; // let nested modal handle it
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[12px] shadow-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ width: '100%', maxWidth: '800px', maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-lg font-bold text-slate-800">{siteName} - 민원 처리 현황</h2>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 mr-2">
              <span className="flex items-center gap-1.5 text-[#2E7D32] font-bold text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]" />
                완료 {completedCount}건
              </span>
              <span className="flex items-center gap-1.5 text-[#1565C0] font-bold text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1565C0]" />
                진행중 {inProgressCount}건
              </span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-auto">
          <Table className="table-fixed border-collapse mx-auto w-[600px] border border-slate-200">
            <TableHeader className="bg-[#E8F0FE] border-b border-slate-200">
              <TableRow>
                <TableHead className="h-10 text-black font-bold text-center border-slate-200 text-[13px] w-[140px]">민원인</TableHead>
                <TableHead className="h-10 text-black font-bold text-center border-l border-slate-200 text-[13px] w-[180px]">용도</TableHead>
                <TableHead className="h-10 text-black font-bold text-center border-l border-slate-200 text-[13px] w-[180px]">소유주</TableHead>
                <TableHead className="h-10 text-black font-bold text-center border-l border-slate-200 text-[13px] w-[100px]">진행</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((c) => (
                <TableRow 
                  key={c.id || c.order} 
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedComplaint(c)}
                >
                  <TableCell className="text-center align-middle p-3 text-[13px] border-b border-slate-100">
                    <span className="font-medium text-slate-700 break-words">{getCircledNumber(c.number)} {c.complainant}</span>
                  </TableCell>
                  <TableCell className="align-middle p-3 text-[13px] border-b border-l border-slate-100 text-slate-600">
                    <span className="whitespace-pre-wrap break-words">{c.usage}</span>
                  </TableCell>
                  <TableCell className="text-center align-middle p-3 text-[13px] border-b border-l border-slate-100 text-slate-600">
                    <span className="whitespace-pre-wrap break-words">{c.owner}</span>
                  </TableCell>
                  <TableCell className="text-center align-middle p-3 text-[13px] border-b border-l border-slate-100">
                    {c.status === '완료' ? (
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700 font-medium whitespace-nowrap">완료</span>
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2.5 py-0.5 text-red-700 font-medium whitespace-nowrap">진행중</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {selectedComplaint && (
        <ComplaintDetailsModal
          siteName={siteName}
          complaint={selectedComplaint}
          links={links}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
};

export default function StatusTable({ data, isLoading }: StatusTableProps) {
  const [modalData, setModalData] = useState<{siteName: string, images: SiteImage[]} | null>(null);
  const [complaintModalData, setComplaintModalData] = useState<{
    siteName: string;
    completedCount: number;
    inProgressCount: number;
    complaints: SiteComplaint[];
  } | null>(null);
  const [isFetchingImages, setIsFetchingImages] = useState(false);
  const [isFetchingComplaints, setIsFetchingComplaints] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();

  const linksQuery = React.useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'actionPlanLinks'), orderBy('createdAt', 'desc'));
  }, [db]);
  const [links, setLinks] = useState<any[] | null>(null);

  useEffect(() => {
    if (linksQuery) {
      getDocs(linksQuery).then(snap => {
        setLinks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }
  }, [linksQuery]);

  const handleRowClick = async (siteId: string, siteName: string) => {
    if (isFetchingImages || !db) return;
    setIsFetchingImages(true);
    try {
      const q = query(collection(db, `sites/${siteId}/siteImages`), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      const fetchedImages = snap.docs.map(d => ({ id: d.id, ...d.data() } as SiteImage));

      if (fetchedImages.length === 0) {
        toast({ title: '이미지 없음', description: '등록된 이미지가 없습니다. [설정] > [현장 관리]에서 이미지를 추가해 주세요.' });
      } else {
        setModalData({ siteName, images: fetchedImages });
      }
    } catch (e) {
      console.error(e);
      toast({ title: '오류', description: '이미지를 불러오는 중 오류가 발생했습니다.', variant: 'destructive' });
    } finally {
      setIsFetchingImages(false);
    }
  };

  const handleComplaintCellClick = async (site: Site, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFetchingComplaints || !db) return;
    setIsFetchingComplaints(true);
    try {
      const q = query(collection(db, `sites/${site.id}/complaints`), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      const fetchedComplaints = snap.docs.map(d => ({ id: d.id, ...d.data() } as SiteComplaint));

      if (fetchedComplaints.length === 0) {
        toast({ title: '민원인 없음', description: '등록된 민원인 정보가 없습니다. [설정] > [현장 관리]에서 등록해 주세요.' });
      } else {
        setComplaintModalData({
          siteName: site.siteName,
          completedCount: site.completedCount || 0,
          inProgressCount: site.inProgressCount || 0,
          complaints: fetchedComplaints
        });
      }
    } catch (error) {
      console.error(error);
      toast({ title: '오류', description: '민원인 정보를 불러오는 중 오류가 발생했습니다.', variant: 'destructive' });
    } finally {
      setIsFetchingComplaints(false);
    }
  };

  return (
    <Card className="rounded-[24px] border-slate-200 overflow-hidden shadow-sm h-full">
      <CardContent className="p-0 overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <Table className="border-collapse min-w-[1000px]">
            <TableHeader className="bg-slate-50 border-b">
              <TableRow>
                <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[180px] text-sm">지역</TableHead>
                <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[200px] text-sm">현장명</TableHead>
                <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[200px] text-sm">단계</TableHead>
                <TableHead className="h-12 font-bold border-r text-slate-700 w-[240px] text-sm text-center">민원 처리 현황</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 text-sm text-center">주요 내용</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.length > 0 ? (
                data.map((site) => (
                  <React.Fragment key={site.id}>
                    <TableRow 
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(site.id, site.siteName)}
                    >
                      <TableCell className="border-r text-center align-middle p-4 font-bold text-slate-700 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <span>{site.region}</span>
                          <CategoryBadge category="regionType">{site.regionType?.replace('지역', '')}</CategoryBadge>
                        </div>
                      </TableCell>
                      <TableCell className="border-r text-center align-middle p-4 font-bold text-slate-900 text-sm">
                        {site.siteName}
                      </TableCell>
                      <TableCell className="border-r text-center align-middle p-4 text-sm">
                        <div className="flex flex-row flex-wrap justify-center gap-1.5">
                          {(Array.isArray(site.phase) ? site.phase : [site.phase]).filter(Boolean).map((p: string) => (
                            <CategoryBadge key={p} category="phase">{p}</CategoryBadge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell 
                        onClick={(e) => handleComplaintCellClick(site, e)}
                        className={`border-r align-middle p-4 text-sm cursor-pointer hover:bg-slate-100 transition-colors`}
                      >
                        <div className="flex items-center justify-center gap-4">
                          <span className="flex items-center gap-1.5 text-[#2E7D32] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]" />
                            완료 {site.completedCount}건
                          </span>
                          <span className="flex items-center gap-1.5 text-[#1565C0] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#1565C0]" />
                            진행중 {site.inProgressCount}건
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="align-middle p-4 pl-6 text-sm text-slate-600">
                        <div className="flex items-center justify-between gap-4">
                          <span className="leading-relaxed max-w-[400px] whitespace-pre-wrap break-words">
                            {site.mainContent || '-'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>

                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <SearchX className="h-12 w-12 text-slate-300 mb-4" />
                      <p className="text-slate-600 font-bold text-lg">등록된 현장 정보가 없습니다.</p>
                      <p className="text-slate-500 text-sm mt-1">[설정] 메뉴에서 현장을 추가해 주세요.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {modalData && (
        <ImageModal
          siteName={modalData.siteName}
          images={modalData.images}
          onClose={() => setModalData(null)}
        />
      )}
      {complaintModalData && (
        <ComplaintModal
          siteName={complaintModalData.siteName}
          completedCount={complaintModalData.completedCount}
          inProgressCount={complaintModalData.inProgressCount}
          complaints={complaintModalData.complaints}
          links={links}
          onClose={() => setComplaintModalData(null)}
        />
      )}
    </Card>
  );
}
