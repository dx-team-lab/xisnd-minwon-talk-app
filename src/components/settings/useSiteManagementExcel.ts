'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useFirestore } from '@/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Site, SiteComplaint } from '@/lib/types';

const MAX_SIMILAR_CASES = 5;

export function useSiteManagementExcel() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSiteExcelDownload = async (sites: Site[] | null | undefined) => {
    if (!sites || sites.length === 0) {
      toast({ title: "다운로드 실패", description: "다운로드할 현장 데이터가 없습니다.", variant: "destructive" });
      return;
    }

    setIsDownloading(true);
    try {
      // 모든 현장의 complaints + siteImages를 병렬 조회
      const siteDataList = await Promise.all(
        sites.map(async (site) => {
          const [complaintsSnap, imagesSnap] = await Promise.all([
            getDocs(query(collection(db, `sites/${site.id}/complaints`), orderBy('order', 'asc'))),
            getDocs(collection(db, `sites/${site.id}/siteImages`))
          ]);
          const complaints = complaintsSnap.docs.map(d => ({ id: d.id, ...d.data() } as SiteComplaint));
          const imageCount = imagesSnap.size;
          return { site, complaints, imageCount };
        })
      );

      // 시트1: 현장 (현장 1개당 1행)
      const sheet1Data = siteDataList.map(({ site, imageCount }) => ({
        '현장ID': site.id,
        '현장명': site.siteName || '',
        '지역유형': site.regionType || '',
        '공사단계': Array.isArray(site.phase) ? site.phase.join(', ') : (site.phase || ''),
        '완료건수': site.completedCount ?? 0,
        '진행중건수': site.inProgressCount ?? 0,
        '주요내용': site.mainContent || '',
        '표시순서': site.order ?? 0,
        '이미지수': imageCount,
      }));

      // 시트2: 민원인 (민원인 1명당 1행)
      const sheet2Data: Record<string, any>[] = [];

      for (const { site, complaints } of siteDataList) {
        for (const c of complaints) {
          const similarCases = c.similarCases || [];

          if (similarCases.length > MAX_SIMILAR_CASES) {
            console.warn(
              `[${site.siteName}] [${c.complainant}]: 유사사례 ${similarCases.length}개 중 ${MAX_SIMILAR_CASES}개만 반영됨, 초과분 확인 필요`
            );
          }

          const row: Record<string, any> = {
            '현장ID': site.id,
            '현장명': site.siteName || '',
            '순번': c.number ?? '',
            '민원인': c.complainant || '',
            '용도': c.usage || '',
            '소유주': c.owner || '',
            '처리상태': c.status || '',
            '현재단계': c.stage || '',
            '민원발생내용': c.stageDetails?.occurrence || '',
            '민원대응내용': c.stageDetails?.response || '',
            '보상협상내용': c.stageDetails?.negotiation || '',
            '합의및집행내용': c.stageDetails?.agreement || '',
            '조치방안': Array.isArray(c.responsePlans) ? c.responsePlans.join(', ') : '',
          };

          for (let i = 1; i <= MAX_SIMILAR_CASES; i++) {
            const sc = similarCases[i - 1];
            row[`유사사례${i}_내용`] = sc?.text || '';
            row[`유사사례${i}_URL`] = sc?.url || '';
          }

          sheet2Data.push(row);
        }
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sheet1Data), '현장');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sheet2Data), '민원인');

      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const excelBase64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBase64}`;
      link.download = `현장데이터_${dateStr}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "다운로드 완료",
        description: `현장 ${siteDataList.length}개, 민원인 ${sheet2Data.length}명의 데이터가 저장되었습니다.`
      });
    } catch (error) {
      console.error('Site Excel download error:', error);
      toast({ title: "다운로드 실패", description: "엑셀 파일 생성 중 오류가 발생했습니다.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    isDownloading,
    handleSiteExcelDownload,
  };
}
