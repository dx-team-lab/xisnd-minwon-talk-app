# MinwonTalk (민원 대응 지식 플랫폼)

**MinwonTalk**은 건설 현장의 민원 데이터를 체계적으로 관리하고, 과거 사례 및 법적 대응 방안을 기반으로 스마트한 해결책을 제시하는 **민원 대응 지식 플랫폼**입니다.

## 🌟 프로젝트 개요
현장에서 발생하는 소음, 분진, 진동 등 다양한 민원 데이터를 수집하고 분석하여, 담당자가 신속하고 정확하게 대응할 수 있도록 지원합니다. 엑셀 기반의 데이터 분석 기능을 제공하여 업무 효율성을 극대화합니다.

## 🚀 주요 기능 (Key Features)

*   **로그인 및 인증 화면**
    *   **사용자 인증**: 이메일/비밀번호 기반의 보안 로그인 및 회원가입 기능.
    *   **접근 제어**: 신규 가입 시 관리자 승인 전까지 대시보드 접근이 제한되는 보안 체계 적용.
    *   **계정 복구**: 사용자 비밀번호 재설정 메일 발송 및 비밀번호 변경 링크 제공.
    *   **편의 기능**: 로그인 시 "이메일 기억하기" 기능을 통한 재접속 편의성 강화.

*   **통합 민원 대시보드**
    *   **스마트 통합 검색**: 키워드 입력만으로 대응 방안과 유사 사례를 동시에 탐색하는 통합 검색 엔진.
    *   **멀티 필터 시스템**: 지역, 공정 단계, 민원 유형 등 복합 조건을 조합한 정밀 데이터 필터링.
    *   **대응 지식 큐레이션**: 유형별 컬러 배지와 페이지네이션이 적용된 가독성 높은 대응 가이드 테이블.
    *   **유사 사례 분석**: 과거 민원인 요구사항, 조치 결과, 보상 방식 및 금액 등 상세 이력 조회.
    *   **데이터 익스포트**: 화면에 필터링된 검색 결과를 엑셀(`.xlsx`) 파일로 즉시 다운로드하여 활용.

*   **시스템 설정 (관리자/매니저 전용)**
    *   **마스터 데이터 관리**: 대응 가이드, 유사 사례, 증빙 문서 링크 데이터의 등록, 수정, 삭제(CRUD).
    *   **대량 데이터 처리**: 엑셀 업로드(Import) 기능을 활용한 대규모 마스터 데이터 일괄 등록.
    *   **증빙 문서 연동**: 대응 방안 항목과 실제 원본 문서를 링크로 매핑하여 대시보드에서 즉시 열람 가능.
    *   **데이터 백업**: 시스템에 등록된 전체 마스터 데이터를 엑셀 파일로 백업(Export)하는 기능.

*   **사용자 관리 화면 (관리자 전용)**
    *   **권한 승인 관리**: 신규 가입 사용자의 이용 권한을 실시간으로 승인 또는 대기 상태로 전환.
    *   **권한 범위 설정**: 사용자별 관리자(Admin) 권한 부여 및 회수를 통한 시스템 운영 보안 유지.
    *   **계정 유지보수**: 사용자 닉네임 인라인 수정 및 퇴사자 등에 대한 계정 삭제 기능.

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
