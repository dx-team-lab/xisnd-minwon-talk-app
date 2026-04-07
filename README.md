# MinwonTalk (민원 대응 지식 플랫폼)

**MinwonTalk**은 건설 현장의 민원 데이터를 체계적으로 관리하고, 과거 사례 및 법적 대응 방안을 기반으로 스마트한 해결책을 제시하는 **민원 대응 지식 플랫폼**입니다.

## 🌟 프로젝트 개요
현장에서 발생하는 소음, 분진, 진동 등 다양한 민원 데이터를 수집하고 분석하여, 담당자가 신속하고 정확하게 대응할 수 있도록 지원합니다. AI 기술을 활용한 대응 가이드 추천 및 엑셀 기반의 데이터 분석 기능을 제공하여 업무 효율성을 극대화합니다.

## 🚀 주요 기능

- **Firebase 기반 권한 관리**: 보안이 강화된 로그인/회원가입 기능 및 관리자 승인 체계를 통한 단계별 접근 제어.
- **다이내믹 대시보드**: 현장별 민원 발생 현황, 조치 방안, 유사 보상 사례를 한눈에 파악할 수 있는 통합 뷰어 제공.
- **지능형 검색 및 필터링**: 지역, 공정 단계, 민원 유형별 상세 필터링 및 키워드 검색을 통한 맞춤형 정보 탐색.
- **AI 대응 어시스턴트**: Google Genkit(Gemini)을 활용하여 입력된 민원 내용에 최적화된 대응 시나리오 및 관련 문서 자동 추천.
- **데이터 관리 (CRUD)**: 민원 대응 가이드 및 유사 사례 데이터의 원활한 등록, 수정, 삭제 및 관리 기능.
- **엑셀 데이터 내보내기**: 필터링된 검색 결과를 Excel 파일(`.xlsx`)로 즉시 다운로드하여 외부 보고 및 추가 분석 활용 가능.
- **반응형 웹 UI**: 데스크탑, 태블릿, 모바일에 최적화된 프리미엄 사용자 경험(UX) 제공.

## 🛠 기술 스택

- **Frontend**: `Next.js 15 (App Router)`, `TypeScript`, `Tailwind CSS`
- **UI Components**: `Shadcn UI` (Radix UI), `Lucide React`, `Embla Carousel`
- **Backend / Infrastructure**: `Firebase` (Authentication, Firestore), `Firebase App Hosting`
- **AI Framework**: `Google Genkit`, `Gemini Pro API`
- **Data Handling**: `XLSX`, `File-saver`, `React Hook Form`, `Zod`
- **State Management**: `React Hooks`, `Firebase Context`

## 📁 프로젝트 구조

```text
src/
├── ai/                # Genkit AI 로직 및 프로토콜 정의
├── app/               # Next.js App Router (페이지 및 API)
│   ├── dashboard/     # 메인 관리 대시보드 페이지
│   ├── settings/      # 시스템 설정 및 데이터 관리 페이지
│   └── layout.tsx     # 전역 레이아웃 및 프로바이더 설정
├── components/        # 재사용 가능한 UI 및 기능별 컴포넌트
│   ├── dashboard/     # 대시보드 전용 컴포넌트 (테이블, 필터바 등)
│   ├── settings/      # 설정 페이지 전용 컴포넌트
│   └── ui/            # Shadcn 기반 기초 컴포넌트
├── firebase/          # Firebase 설정, Hooks 및 클라이언트 SDK
├── hooks/             # 커스텀 React Hooks (Toast 등)
├── lib/               # 공통 유틸리티, 상수 및 타입 정의
└── public/            # 정적 에셋 (이미지, 아이콘 등)
```

## 📝 주요 파일 설명

- **`src/app/page.tsx`**: 서비스 진입점 및 Firebase 인증(로그인/회원가입) 처리 로직.
- **`src/app/dashboard/page.tsx`**: 전체 민원 현황 및 사례 데이터를 통합 관리하는 핵심 대시보드.
- **`src/components/dashboard/FilterBar.tsx`**: 실시간 멀티 필터링 및 통합 검색 엔진 UI.
- **`src/components/dashboard/ResponsePlanTable.tsx`**: 정형화된 대응 가이드 및 조치 방안을 시각화하는 테이블.
- **`src/ai/dev.ts`**: Genkit을 이용한 AI 민원 대응 추천 엔진 설정 및 실행부.
- **`firestore.rules`**: 데이터 보안 및 역할 기반 접근 제어를 위한 Firebase 보안 규칙.

## ⚙️ 설치 및 실행 방법

### 1. 환경 변수 설정
루트 디렉토리에 `.env` 파일을 생성하고 필요한 API 키를 설정합니다.
```env
GEMINI_API_KEY=your_gemini_api_key
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```
- 브라우저에서 `http://localhost:9002`로 접속합니다.

### 4. AI 서비스 실행 (Genkit)
```bash
npm run genkit:dev
```

### 5. 프로젝트 빌드 및 배포
```bash
# 정적 빌드
npm run build

# Firebase 배포
firebase deploy
```

---
© 2026 MinwonTalk. Developed by DX Team.
