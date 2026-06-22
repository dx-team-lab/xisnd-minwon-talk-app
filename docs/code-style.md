# 코드 스타일 가이드

> 이 문서는 프론트엔드 코드를 직접 분석하여 도출한 **실제 적용 중인 규칙**입니다.
> 신규 코드 작성 시 이 규칙을 반드시 따라야 합니다.

---

## 1. 파일명 네이밍 규칙

| 종류 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 파일 | PascalCase | `CaseExampleSection.tsx`, `FilterBar.tsx` |
| 커스텀 훅 파일 | camelCase, `use` 접두사 | `useCaseExampleForm.ts`, `useAdminStatus.ts` |
| 유틸리티/라이브러리 | camelCase | `activity-logs.ts`, `utils.ts` |
| Next.js 라우팅 파일 | 소문자 + kebab-case | `page.tsx`, `layout.tsx`, `forgot-password/` |
| 타입 정의 파일 | camelCase | `types.ts`, `constants.ts` |
| 배럴 익스포트 파일 | 소문자 | `index.ts` |

---

## 2. 컴포넌트 분리 패턴 (표준)

### 기본 원칙
- **1 컴포넌트 = 1 책임**: 한 파일이 여러 역할을 동시에 맡지 않는다.
- **오케스트레이터 → 순수 UI 컴포넌트** 방향으로 props를 내려준다.
- **비즈니스 로직은 커스텀 훅으로 분리**한다.

### ✅ 표준 패턴: `CaseExample` 폴더 구조

```
src/components/settings/CaseExample/
  ├── CaseExampleSection.tsx   ← 오케스트레이터 (데이터 조회 + 훅 조합)
  ├── CaseExampleForm.tsx      ← 순수 UI 컴포넌트 (props만 받음, 로직 없음)
  ├── CaseExampleTable.tsx     ← 순수 UI 컴포넌트 (렌더링만 담당)
  ├── hooks/
  │   ├── useCaseExampleForm.ts   ← 폼 상태 + CRUD 로직
  │   └── useCaseExampleExcel.ts  ← 엑셀 기능 로직
  └── index.ts                ← 배럴 익스포트 (외부에서 import 경로 단순화)
```

### 각 파일의 역할 요약

| 파일 | 역할 | 포함해야 할 것 | 포함하면 안 되는 것 |
|------|------|----------------|---------------------|
| `*Section.tsx` | 오케스트레이터 | 데이터 조회, 훅 조합, 하위 컴포넌트 조립 | 직접적인 UI 스타일 코드 |
| `*Form.tsx` | 순수 UI | JSX, props 기반 렌더링 | API 호출, 상태 관리 로직 |
| `*Table.tsx` | 순수 UI | JSX, 목록 렌더링 | API 호출, 상태 관리 로직 |
| `use*.ts` | 커스텀 훅 | useState, API 호출, 비즈니스 로직 | JSX, 직접적인 렌더링 |
| `index.ts` | 배럴 익스포트 | `export { default } from './XxxSection'` | 로직, JSX |

---

## 3. 타입(Type) 관리 규칙

- **공통 타입**은 반드시 `src/lib/types.ts`에서 정의하고 import해서 사용한다.
- **특정 컴포넌트 전용 타입**(props 인터페이스 등)은 해당 파일 내부에서 정의한다.
- `any` 타입 사용을 최소화하고, 타입을 명확히 정의한다.

```typescript
// ✅ 좋은 예: types.ts에서 정의된 공통 타입 사용
import { UserProfile } from '@/lib/types';

// ❌ 나쁜 예: 컴포넌트 내부에서 any 남발
const handleEdit = (item: any) => { ... }  // 가능하면 구체적 타입으로 교체
```

---

## 4. 상수(Constants) 관리 규칙

- **화면에서 반복되는 선택지/옵션**은 `src/lib/constants.ts`에 정의한다.
- 컴포넌트 안에 문자열 배열을 직접 작성하지 않는다.

```typescript
// ✅ 좋은 예: constants.ts에서 import
import { FILTER_OPTIONS, PROGRESS_OPTIONS } from '@/lib/constants';

// ❌ 나쁜 예: 컴포넌트 내부에 하드코딩
const options = ['접수', '진행', '종결'];
```

---

## 5. 폴더 구조 규칙

```
src/
  app/               ← Next.js 라우팅 (페이지 파일만, 로직 최소화)
  components/
    common/          ← 전체 앱에서 재사용되는 공통 컴포넌트
    dashboard/       ← 대시보드 전용 컴포넌트
    home/            ← 홈 화면 전용 컴포넌트
    references/      ← 참고 자료 전용 컴포넌트
    settings/        ← 설정 페이지 컴포넌트 (도메인별 하위 폴더 구성 권장)
    ui/              ← shadcn/ui 기반 기본 UI 원자 컴포넌트 (직접 수정 금지)
  firebase/          ← Firebase 연동 유틸리티 (백엔드 전환 후 대체 예정)
  hooks/             ← 전역으로 재사용되는 커스텀 훅
  lib/               ← 타입, 상수, 유틸리티 함수
```

> **백엔드 전환 후 추가 예정**: `src/services/` (API 통신 레이어), `src/stores/` (전역 상태)

---

## 6. 코드 작성 규칙

### 함수형 컴포넌트
- 반드시 함수형 컴포넌트를 사용한다. Class 컴포넌트 사용 금지.
- `'use client'` 지시어는 클라이언트 상태/이벤트가 필요한 파일 최상단에 선언한다.

### Props 인터페이스
- 컴포넌트 props는 반드시 인터페이스로 정의한다.
- 인터페이스 이름은 `컴포넌트명Props` 형식을 사용한다.

```typescript
interface CaseExampleFormProps {
  formData: FormData;
  editingId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  // ...
}
```

### 이벤트 핸들러 네이밍
- 이벤트 핸들러는 `handle` 접두사를 사용한다: `handleSubmit`, `handleDelete`, `handleEdit`
- props로 내려줄 때는 `on` 접두사를 사용한다: `onSubmit`, `onDelete`, `onEdit`

### Tailwind CSS
- 스타일은 Tailwind 클래스를 사용한다. 인라인 style 속성 사용을 지양한다.
- 조건부 클래스는 `cn()` 유틸리티(`src/lib/utils.ts`)를 사용한다.

```typescript
// ✅ 좋은 예
className={cn("text-sm font-bold", isActive && "text-blue-600")}

// ❌ 나쁜 예
style={{ color: isActive ? '#2563eb' : 'inherit' }}
```

---

## 7. API 통신 규칙 (백엔드 전환 후 적용)

현재는 Firebase SDK를 직접 호출하지만, Spring Boot 백엔드 전환 후에는 아래 규칙을 따른다.

- **API 호출은 `src/services/` 폴더**에서 Axios 기반 서비스 함수로 분리한다.
- 컴포넌트나 훅에서 직접 `fetch`/`axios`를 호출하지 않는다.
- 커스텀 훅(`use*`)에서 서비스 함수를 호출하는 형태를 유지한다.

```
컴포넌트 → 커스텀 훅 → 서비스(src/services/) → API(Spring Boot)
```
