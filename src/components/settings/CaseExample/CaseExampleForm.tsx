'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Edit2, PlusCircle, RotateCcw, Save, Download } from 'lucide-react';
import {
  FILTER_OPTIONS,
  PROGRESS_OPTIONS,
  REQUEST_TYPE_OPTIONS,
  COMPENSATION_STATUS_OPTIONS
} from '@/lib/constants';

interface FormData {
  siteName: string;
  region: string;
  type: string[];
  complaintContent: string;
  phase: string;
  complainant: string;
  requestContent: string[];
  occurrenceDate: string;
  progress: string;
  details: string;
  compensationMethod: string;
  compensationAmount: number;
}

interface CaseExampleFormProps {
  formData: FormData;
  editingId: string | null;
  isImporting: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: (field: string, value: any) => void;
  onToggleType: (value: string) => void;
  onToggleRequestContent: (value: string) => void;
  onReset: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onExcelImportClick: () => void;
  onExcelImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExcelDownload: () => void;
  onShowDeleteAll: () => void;
}

export function CaseExampleForm({
  formData,
  editingId,
  isImporting,
  fileInputRef,
  onInputChange,
  onToggleType,
  onToggleRequestContent,
  onReset,
  onSubmit,
  onExcelImportClick,
  onExcelImport,
  onExcelDownload,
  onShowDeleteAll
}: CaseExampleFormProps) {
  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          {editingId ? <Edit2 className="h-5 w-5 text-amber-500" /> : <PlusCircle className="h-5 w-5 text-primary" />}
          사례 {editingId ? '수정' : '신규 등록'}
        </CardTitle>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx, .xls"
            onChange={onExcelImport}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={onExcelDownload}
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            <Download className="h-4 w-4 mr-2" />
            엑셀 데이터 다운로드
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExcelImportClick}
            disabled={isImporting}
            className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          >
            {isImporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
            엑셀 데이터 가져오기
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onShowDeleteAll}
            disabled={isImporting}
            className="text-slate-400 hover:text-destructive"
          >
            전체 삭제
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* 왼쪽 컬럼 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">현장명 *</label>
                <Input
                  placeholder="현장 이름 입력"
                  value={formData.siteName}
                  onChange={(e) => onInputChange('siteName', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">지역 *</label>
                  <Select value={formData.region} onValueChange={(val) => onInputChange('region', val)}>
                    <SelectTrigger><SelectValue placeholder="지역 선택" /></SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.region.options.filter(o => o !== '전체').map(o => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">발생시점 *</label>
                  <Select value={formData.phase} onValueChange={(val) => onInputChange('phase', val)}>
                    <SelectTrigger><SelectValue placeholder="발생시점 선택" /></SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.phase.options.filter(o => o !== '전체').map(o => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">유형 * (복수 선택 가능)</label>
                <div className="flex flex-wrap gap-4 p-3 bg-slate-50 rounded-lg border">
                  {FILTER_OPTIONS.type.options.filter(o => o !== '전체').map(o => (
                    <div key={o} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-case-${o}`}
                        checked={formData.type.includes(o)}
                        onCheckedChange={() => onToggleType(o)}
                      />
                      <Label htmlFor={`type-case-${o}`} className="text-sm cursor-pointer">{o}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">민원 내용 *</label>
                <Textarea
                  placeholder="상세 민원 내용을 입력하세요"
                  value={formData.complaintContent}
                  onChange={(e) => onInputChange('complaintContent', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {/* 오른쪽 컬럼 */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">신청인 *</label>
                  <Input
                    placeholder="신청인 정보"
                    value={formData.complainant}
                    onChange={(e) => onInputChange('complainant', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">발생 일시 *</label>
                  <Input
                    type="date"
                    value={formData.occurrenceDate}
                    onChange={(e) => onInputChange('occurrenceDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">진행경과 *</label>
                  <Select value={formData.progress} onValueChange={(val) => onInputChange('progress', val)}>
                    <SelectTrigger><SelectValue placeholder="진행 상태" /></SelectTrigger>
                    <SelectContent>
                      {PROGRESS_OPTIONS.map(o => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">보상방식 *</label>
                  <Select value={formData.compensationMethod} onValueChange={(val) => onInputChange('compensationMethod', val)}>
                    <SelectTrigger><SelectValue placeholder="보상 방식" /></SelectTrigger>
                    <SelectContent>
                      {COMPENSATION_STATUS_OPTIONS.map(o => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">요구사항 * (복수 선택 가능)</label>
                <div className="flex flex-wrap gap-4 p-3 bg-slate-50 rounded-lg border">
                  {REQUEST_TYPE_OPTIONS.map(o => (
                    <div key={o} className="flex items-center space-x-2">
                      <Checkbox
                        id={`req-type-${o}`}
                        checked={formData.requestContent.includes(o)}
                        onCheckedChange={() => onToggleRequestContent(o)}
                      />
                      <Label htmlFor={`req-type-${o}`} className="text-sm cursor-pointer">{o}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">보상금액</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.compensationAmount}
                  onChange={(e) => onInputChange('compensationAmount', Number(e.target.value))}
                  disabled={formData.compensationMethod === '미보상'}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">상세내용 및 관련 링크</label>
            <Textarea
              placeholder="내용 입력 또는 URL 주소를 넣으면 대시보드에서 '문서 보기' 링크로 자동 변환됩니다."
              value={formData.details}
              onChange={(e) => onInputChange('details', e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onReset} className="gap-2">
              <RotateCcw className="h-4 w-4" /> 초기화
            </Button>
            <Button type="submit" className="gap-2 px-8 bg-primary hover:bg-primary/90">
              {editingId ? <><Save className="h-4 w-4" /> 수정</> : <><PlusCircle className="h-4 w-4" /> 등록</>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
