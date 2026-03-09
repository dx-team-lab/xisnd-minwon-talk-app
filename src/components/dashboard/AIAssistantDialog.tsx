
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { aiComplaintResponseAssistant, type AIComplaintResponseAssistantOutput } from '@/ai/flows/ai-complaint-response-assistant';

export default function AIAssistantDialog() {
  const [complaintText, setComplaintText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIComplaintResponseAssistantOutput | null>(null);

  const handleAnalyze = async () => {
    if (!complaintText) return;
    setIsLoading(true);
    try {
      const output = await aiComplaintResponseAssistant({
        description: complaintText,
        region: '주거지역', // Sample data
        phase: '골조',      // Sample data
        type: '소음'        // Sample data
      });
      setResult(output);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="fixed bottom-8 right-8 h-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 gap-2 pr-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-white">AI 대응 어시스턴트</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <Sparkles className="h-6 w-6 text-primary" />
            민원 대응 AI 분석
          </DialogTitle>
          <DialogDescription>
            민원 내용을 입력하시면 최적의 대응 프로세스와 보상 전략을 추천해 드립니다.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">민원 상세 내용</label>
              <Textarea
                placeholder="발생한 민원 상황을 상세히 입력해주세요 (예: 거주민들이 야간 타설 작업 중 발생하는 소음에 대해 항의하며 공사 중단을 요구함)"
                className="min-h-[200px]"
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
              />
            </div>
            <Button 
              className="w-full h-12 gap-2" 
              onClick={handleAnalyze} 
              disabled={isLoading || !complaintText}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  대응 방안 생성하기
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2">분석 요약</h4>
              <p className="text-sm text-blue-800 leading-relaxed">{result.summary}</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-lg">추천 대응 단계</h4>
              <div className="grid gap-4">
                {result.suggestedResponsePlan.map((plan, i) => (
                  <div key={i} className="border rounded-lg p-4 bg-slate-50/50">
                    <h5 className="font-bold text-primary mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {plan.category}
                    </h5>
                    <div className="space-y-3">
                      {plan.actions.map((action, j) => (
                        <div key={j} className="bg-white p-3 rounded border border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm">
                              {action.stepNumber}. {action.title}
                            </span>
                            <Badge variant="outline" className="text-[10px] h-5">
                              담당: {action.responsible}
                            </Badge>
                          </div>
                          {action.details.length > 0 && (
                            <ul className="text-xs text-slate-500 list-disc pl-4 space-y-1 mt-2">
                              {action.details.map((detail, k) => (
                                <li key={k}>{detail}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setResult(null)}>다시 입력하기</Button>
              <Button>대응 일지에 저장</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
