'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { logActivity } from '@/lib/activity-logs';
import { useToast } from '@/hooks/use-toast';

export function useCaseExampleExcel() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isImporting, setIsImporting] = useState(false);

  const handleExcelImportClick = () => {
    fileInputRef.current?.click();
  };

  const mapRegion = (raw: string) => {
    if (!raw) return '';
    if (raw.includes('공업')) return '공업';
    if (raw.includes('민감')) return '민감';
    if (raw.includes('상업')) return '상업';
    if (raw.includes('주거')) return '주거';
    return raw.replace('지역', '').trim();
  };

  const mapPhase = (raw: string) => {
    if (!raw) return '';
    if (raw.includes('착수') || raw.includes('착공전')) return '착공전';
    if (raw.includes('철거') || raw.includes('토공')) return '토공';
    if (raw.includes('골조')) return '골조';
    if (raw.includes('마감')) return '마감';
    if (raw.includes('준공')) return '준공';
    return raw;
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet);

          let successCount = 0;
          for (const row of data as any[]) {
            // 날짜 형식 변환
            const rawOccurrenceDate = row['발생 일시'] || '';
            let formattedDate = '';
            if (rawOccurrenceDate) {
              if (typeof rawOccurrenceDate === 'number') {
                const date = new Date((rawOccurrenceDate - (25567 + 2)) * 86400 * 1000);
                formattedDate = date.toISOString().split('T')[0];
              } else {
                formattedDate = String(rawOccurrenceDate).replace(/\./g, '-');
              }
            }

            // 현장명 앞의 숫자와 점 제거
            const rawSiteName = row['현장명'] || '';
            const cleanSiteName = rawSiteName.replace(/^\d+\.\s*/, '').trim();

            // 금액의 콤마 제거
            const rawAmount = String(row['보상금액'] || row['보상금액(원)'] || '0').replace(/,/g, '');
            const cleanAmount = Number(rawAmount) || 0;

            // 요구사항/유형의 띄어쓰기 제거
            const cleanRequestContent = row['요구사항']
              ? String(row['요구사항']).split(',').map(t => t.replace(/\s+/g, ''))
              : [];
            const cleanType = row['유형']
              ? String(row['유형']).split(',').map(t => t.replace(/\s+/g, ''))
              : [];

            const payload = {
              siteName: cleanSiteName,
              region: mapRegion(row['지역'] || ''),
              phase: mapPhase(row['발생시점'] || row['단계'] || ''),
              type: cleanType,
              complaintContent: row['민원 내용'] || '내용 없음',
              complainant: row['신청인'] || row['민원인'] || '-',
              requestContent: cleanRequestContent,
              occurrenceDate: formattedDate,
              progress: row['진행경과'] || '접수',
              compensationMethod: row['보상방식'] || '미보상',
              compensationAmount: cleanAmount,
              details: row['상세내용'] || '',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              createdBy: user?.uid || 'system'
            };

            addDocumentNonBlocking(collection(db, 'caseExamples'), payload);
            successCount++;
          }

          toast({ title: "임포트 완료", description: `${successCount}개의 데이터가 성공적으로 등록되었습니다.` });

          // 활동 로그
          if (user) {
            await logActivity(db, {
              actorEmail: user.email || '',
              actorName: user.displayName || user.email?.split('@')[0] || 'Unknown',
              action: 'CREATE',
              targetSiteName: '사례',
              targetId: 'excel_import',
              details: `사례 엑셀 임포트: ${successCount}건`
            });
          }
        } catch (error) {
          console.error("Parse error inside onload:", error);
          toast({ title: "임포트 실패", description: "데이터 변환 중 오류가 발생했습니다.", variant: "destructive" });
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        toast({ title: "임포트 실패", description: "엑셀 파일을 읽는 중 오류가 발생했습니다.", variant: "destructive" });
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: "임포트 실패", description: "엑셀 파일을 처리하는 중 오류가 발생했습니다.", variant: "destructive" });
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExcelDownload = async (cases: any[] | null) => {
    if (!cases || cases.length === 0) {
      toast({ title: "다운로드 실패", description: "다운로드할 데이터가 없습니다.", variant: "destructive" });
      return;
    }

    try {
      const excelData = cases.map(c => ({
        '현장명': c.siteName || '',
        '지역': c.region || '',
        '발생시점': c.phase || '',
        '유형': Array.isArray(c.type) ? c.type.join(',') : (c.type || ''),
        '민원 내용': c.complaintContent || '',
        '신청인': c.complainant || '',
        '요구사항': Array.isArray(c.requestContent) ? c.requestContent.join(',') : (c.requestContent || ''),
        '발생 일시': c.occurrenceDate || '',
        '진행경과': c.progress || '',
        '보상방식': c.compensationMethod || c.compensationStatus || '',
        '보상금액': c.compensationAmount || 0,
        '상세내용': c.details || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "사례");

      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const excelBase64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBase64}`;
      link.download = `사례_데이터_${dateStr}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "다운로드 완료", description: "사례 데이터가 엑셀로 저장되었습니다." });

      // 활동 로그
      if (user) {
        await logActivity(db, {
          actorEmail: user.email || '',
          actorName: user.displayName || user.email?.split('@')[0] || 'Unknown',
          action: 'CREATE',
          targetSiteName: '사례',
          targetId: 'excel_export',
          details: `사례 엑셀 다운로드: ${excelData.length}건`
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({ title: "다운로드 실패", description: "엑셀 파일 생성 중 오류가 발생했습니다.", variant: "destructive" });
    }
  };

  return {
    isImporting,
    fileInputRef,
    handleExcelImportClick,
    handleExcelImport,
    handleExcelDownload
  };
}
