'use server';
/**
 * @fileOverview An AI assistant that analyzes civil complaint details and suggests optimal response actions.
 *
 * - aiComplaintResponseAssistant - A function that handles the AI-powered response suggestion process.
 * - AIComplaintResponseAssistantInput - The input type for the aiComplaintResponseAssistant function.
 * - AIComplaintResponseAssistantOutput - The return type for the aiComplaintResponseAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIComplaintResponseAssistantInputSchema = z.object({
  description: z.string().describe('The detailed description of the civil complaint.'),
  region: z.enum(['주거지역', '상업지역', '공업지역']).describe('The region or district where the complaint occurred.').optional(),
  phase: z.enum(['착수전', '토공', '골조', '마감']).describe('The current construction phase when the complaint occurred.').optional(),
  type: z.enum(['소음', '분진', '진동', '교통', '언론']).describe('The type of the complaint (e.g., noise, dust, vibration).').optional(),
});
export type AIComplaintResponseAssistantInput = z.infer<typeof AIComplaintResponseAssistantInputSchema>;

const ResponseActionSchema = z.object({
  stepNumber: z.number().int().describe('The step number within the category (e.g., 1, 2, 3).'),
  title: z.string().describe('The title of the action item.'),
  details: z.array(z.string()).describe('Detailed sub-items for the action.'),
  responsible: z.enum(['BM', 'CM', '공사', '공무']).describe('The role responsible for this action.')
});

const AIComplaintResponseAssistantOutputSchema = z.object({
  summary: z.string().describe('A summary of the suggested response plan based on the complaint details.'),
  suggestedResponsePlan: z.array(
    z.object({
      category: z.enum(['사전업무', '민원접수', '민원대응', '협상전략', '보상협의']).describe('The category of the response action.'),
      actions: z.array(ResponseActionSchema).describe('A list of specific actions within this category relevant to the complaint.')
    })
  ).describe('A suggested response plan categorized by type of action.')
});
export type AIComplaintResponseAssistantOutput = z.infer<typeof AIComplaintResponseAssistantOutputSchema>;

// Sample response actions data, simulating a fetch from Firestore
const responseKnowledgeBaseData = [
  {
    "category": "사전업무",
    "stepNumber": 1,
    "title": "주변 환경 조사",
    "details": ["거주자 조사(BM)", "예상 소음도 조사(공사)", "사전 건물 조사(공사)"],
    "responsible": "BM",
    "order": 1
  },
  {
    "category": "민원접수",
    "stepNumber": 1,
    "title": "민원 접수(최초 대면자)",
    "details": ["대표번호, 지자체, 방문 등", "초기 기록 : 일시, 민원인 정보", "긴급도 판단 : BM"],
    "responsible": "BM",
    "order": 1
  },
  {
    "category": "민원대응",
    "stepNumber": 1,
    "title": "내부 보고(접수자 → CM)",
    "details": [],
    "responsible": "CM",
    "order": 1
  },
  {
    "category": "협상전략",
    "stepNumber": 1,
    "title": "보상 방안 결정(CM)",
    "details": ["공법 및 작업시간 협상(공사)", "시설보수 범위 협상(공무)", "현금보상 범위 협상(BM)", "분쟁조정 및 소송(BM)"],
    "responsible": "CM",
    "order": 1
  },
  {
    "category": "보상협의",
    "stepNumber": 1,
    "title": "합의서 작성(BM)",
    "details": [],
    "responsible": "BM",
    "order": 1
  },
  {
    "category": "사전업무",
    "stepNumber": 2,
    "title": "환경 인허가(공무)",
    "details": ["비산먼지 발생사업 신고", "특정공사 사전 신고"],
    "responsible": "공무",
    "order": 2
  },
  {
    "category": "민원접수",
    "stepNumber": 2,
    "title": "민원 분석 및 보고(BM)",
    "details": ["민원인 면담 및 현장확인", "원인 파악 및 CM 현황보고"],
    "responsible": "BM",
    "order": 2
  },
  {
    "category": "민원대응",
    "stepNumber": 2,
    "title": "공사협의(공사)",
    "details": ["소음민원 대응", "분진민원 대응", "진동민원 대응"],
    "responsible": "공사",
    "order": 2
  },
  {
    "category": "협상전략",
    "stepNumber": 2,
    "title": "보험접수(BM)",
    "details": [],
    "responsible": "BM",
    "order": 2
  },
  {
    "category": "보상협의",
    "stepNumber": 2,
    "title": "민원 보상 품의(공무)",
    "details": [],
    "responsible": "공무",
    "order": 2
  },
  {
    "category": "사전업무",
    "stepNumber": 3,
    "title": "사전업무 진행절차(CM, 공무)",
    "details": ["민원 보상 예산비용", "소음, 비산먼지 대책 수립", "환경 인허가 신청 및 착공"],
    "responsible": "CM",
    "order": 3
  },
  {
    "category": "민원접수",
    "stepNumber": 3,
    "title": "민원 분류 및 담당자 지정(CM)",
    "details": ["일반민원", "특이민원"],
    "responsible": "CM",
    "order": 3
  },
  {
    "category": "민원대응",
    "stepNumber": 3,
    "title": "기관협의(공무)",
    "details": ["조치계획서", "환경인허가 변경"],
    "responsible": "공무",
    "order": 3
  },
  {
    "category": "민원대응",
    "stepNumber": 4,
    "title": "노조/언론 협의(공무, CM)",
    "details": [],
    "responsible": "공무",
    "order": 4
  },
  {
    "category": "민원대응",
    "stepNumber": 5,
    "title": "지역 거주민 협의(BM)",
    "details": [],
    "responsible": "BM",
    "order": 5
  },
  {
    "category": "민원대응",
    "stepNumber": 6,
    "title": "민원일지 관리(BM)",
    "details": [],
    "responsible": "BM",
    "order": 6
  },
  {
    "category": "협상전략",
    "stepNumber": 3,
    "title": "회계처리 / 집행(BM)",
    "details": [],
    "responsible": "BM",
    "order": 3
  }
];

const aiComplaintResponsePrompt = ai.definePrompt({
  name: 'aiComplaintResponsePrompt',
  input: { schema: AIComplaintResponseAssistantInputSchema.extend({
    responseKnowledgeBase: z.string().describe('A JSON string of available response actions from the system knowledge base.'),
  })},
  output: { schema: AIComplaintResponseAssistantOutputSchema },
  prompt: `You are an AI assistant helping project managers formulate effective response plans for civil complaints.
Analyze the provided civil complaint details and the available response actions from the knowledge base.

Based on the complaint's description, region, phase, and type, identify the most optimal and relevant response actions from the 'Available Response Knowledge Base'.
Structure your suggestions by category (e.g., 사전업무, 민원접수, 민원대응, 협상전략, 보상협의) and include the step number, title, detailed sub-items, and responsible party for each action.
Provide a concise summary explaining your suggested plan.

Complaint Details:
Description: {{{description}}}
Region: {{{region}}}
Phase: {{{phase}}}
Type: {{{type}}}

Available Response Knowledge Base (JSON format):
{{{responseKnowledgeBase}}}

Your output MUST be a JSON object conforming to the AIComplaintResponseAssistantOutputSchema.`,
});

const aiComplaintResponseFlow = ai.defineFlow(
  {
    name: 'aiComplaintResponseFlow',
    inputSchema: AIComplaintResponseAssistantInputSchema,
    outputSchema: AIComplaintResponseAssistantOutputSchema,
  },
  async (input) => {
    // In a real application, this data would be fetched from Firestore.
    const responseKnowledgeBaseJson = JSON.stringify(responseKnowledgeBaseData);

    const { output } = await aiComplaintResponsePrompt({
      ...input,
      responseKnowledgeBase: responseKnowledgeBaseJson,
    });
    return output!;
  }
);

export async function aiComplaintResponseAssistant(
  input: AIComplaintResponseAssistantInput
): Promise<AIComplaintResponseAssistantOutput> {
  return aiComplaintResponseFlow(input);
}
