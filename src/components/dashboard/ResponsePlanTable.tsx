
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ResponsePlanTable() {
  const data = [
    {
      preWork: {
        num: "①",
        title: "주변 환경 조사",
        items: ["거주자 조사(BM)", "예상 소음도 조사(공사)", "사전 건물 조사(공사)"]
      },
      intake: {
        num: "①",
        title: "민원 접수(최초 대면자)",
        items: ["대표번호, 지자체, 방문 등", "초기 기록 : 일시, 민원인 정보", "긴급도 판단 : BM"]
      },
      response: {
        num: "①",
        title: "내부 보고(접수자 → CM)",
        items: []
      },
      strategy: {
        num: "①",
        title: "보상 방안 결정(CM)",
        items: ["공법 및 작업시간 협상(공사)", "시설보수 범위 협상(공무)", "현금보상 범위 협상(BM)", "분쟁조정 및 소송(BM)"]
      },
      settlement: {
        num: "①",
        title: "합의서 작성(BM)",
        items: []
      }
    },
    {
      preWork: {
        num: "②",
        title: "환경 인허가(공무)",
        items: ["비산먼지 발생사업 신고", "특정공사 사전 신고"]
      },
      intake: {
        num: "②",
        title: "민원 분석 및 보고(BM)",
        items: ["민원인 면담 및 현장확인", "원인 파악 및 CM 현황보고"]
      },
      response: {
        num: "②",
        title: "공사협의(공사)",
        items: ["소음민원 대응", "분진민원 대응", "진동민원 대응"]
      },
      strategy: {
        num: "②",
        title: "보험접수(BM)",
        items: []
      },
      settlement: {
        num: "②",
        title: "민원 보상 품의(공무)",
        items: []
      }
    },
    {
      preWork: {
        num: "③",
        title: "사전업무 진행절차(CM, 공무)",
        items: ["민원 보상 예산비용", "소음, 비산먼지 대책 수립", "환경 인허가 신청 및 착공"]
      },
      intake: {
        num: "③",
        title: "민원 분류 및 담당자 지정(CM)",
        items: ["일반민원", "특이민원"]
      },
      response: {
        num: "③",
        title: "기관협의(공무)",
        items: ["조치계획서", "환경인허가 변경"],
        extra: [
          { num: "④", title: "노조/언론 협의(공무, CM)" },
          { num: "⑤", title: "지역 거주민 협의(BM)" },
          { num: "⑥", title: "민원일지 관리(BM)" }
        ]
      },
      strategy: {
        num: "③",
        title: "회계처리 / 집행(BM)",
        items: []
      },
      settlement: null
    }
  ];

  return (
    <Card className="rounded-xl border-slate-200 overflow-hidden shadow-sm">
      <CardHeader className="bg-white border-b py-4">
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <div className="h-5 w-1 bg-primary rounded-full" />
          대응 방안
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="border-collapse">
          <TableHeader className="bg-slate-50 border-b">
            <TableRow>
              <TableHead className="font-bold border-r text-slate-700 text-center">사전업무</TableHead>
              <TableHead className="font-bold border-r text-slate-700 text-center">민원접수</TableHead>
              <TableHead className="font-bold border-r text-slate-700 text-center">민원대응</TableHead>
              <TableHead className="font-bold border-r text-slate-700 text-center">협상 전략</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">보상협의</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-slate-50/50">
                <Cell data={row.preWork} isBorder />
                <Cell data={row.intake} isBorder />
                <Cell data={row.response} isBorder />
                <Cell data={row.strategy} isBorder />
                <Cell data={row.settlement} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Cell({ data, isBorder }: { data: any, isBorder?: boolean }) {
  if (!data) return <TableCell className={isBorder ? "border-r" : ""} />;
  
  return (
    <TableCell className={`align-top p-3 text-sm ${isBorder ? "border-r" : ""}`}>
      <div className="space-y-1">
        <div className="flex items-start gap-1">
          <span className="font-bold text-primary">{data.num}</span>
          <span className="font-bold leading-tight">{data.title}</span>
        </div>
        {data.items.length > 0 && (
          <ul className="pl-4 space-y-0.5 list-disc text-slate-600">
            {data.items.map((item: string, i: number) => {
              const matches = item.match(/(.*)\((.*)\)/);
              if (matches) {
                return (
                  <li key={i} className="text-[13px]">
                    {matches[1]}
                    <span className="text-slate-400 font-medium ml-1">({matches[2]})</span>
                  </li>
                );
              }
              return <li key={i} className="text-[13px]">{item}</li>;
            })}
          </ul>
        )}
        {data.extra && data.extra.map((ex: any, i: number) => (
          <div key={i} className="flex items-start gap-1 pt-2">
            <span className="font-bold text-primary">{ex.num}</span>
            <span className="font-bold leading-tight">{ex.title}</span>
          </div>
        ))}
      </div>
    </TableCell>
  );
}
