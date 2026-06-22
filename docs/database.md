# 데이터베이스 설계 규칙

> 이 문서는 현재 Firebase(Firestore) 데이터 구조를 **MySQL 8.x 관계형 데이터베이스**로
> 전환하기 위한 **설계 규칙**을 정의합니다.
>
> ※ 실제 테이블 스키마(CREATE TABLE 명세)는 다음 단계에서 별도로 작성합니다.
> 이 문서는 '무엇을 어떻게 설계해야 하는가'에 대한 기준만 정의합니다.

---

## 1. Firebase → MySQL 전환 기본 원칙

### Firebase(Firestore)와 MySQL의 핵심 차이
| 항목 | Firebase (현재) | MySQL (목표) |
|------|----------------|------------|
| 데이터 단위 | 컬렉션(Collection) → 문서(Document) | 테이블(Table) → 행(Row) |
| 고유 ID | Firebase 자동 생성 문자열 (`abc123xyz`) | `BIGINT AUTO_INCREMENT` 정수 |
| 시간 타입 | `Timestamp` (Firestore 전용) | `DATETIME` 또는 `TIMESTAMP` |
| 배열/중첩 | JSON처럼 배열·중첩 문서 허용 | 별도 테이블로 분리 (정규화) |
| 관계 표현 | 없음 (각 문서가 독립) | 외래 키(FK) 또는 논리적 참조 |

### 전환 규칙 요약
1. Firestore 컬렉션 1개 = MySQL 테이블 1개 (기본 원칙)
2. 문서 내 배열 필드는 별도 테이블로 분리 (정규화)
3. Firebase 자동 생성 문자열 ID → `BIGINT AUTO_INCREMENT` PK로 교체
4. `Timestamp` → `DATETIME NOT NULL` 으로 교체

---

## 2. 현재 Firebase 컬렉션 목록 및 MySQL 테이블 전환 방향

| Firebase 컬렉션 | 역할 | MySQL 테이블 전환 방향 |
|----------------|------|----------------------|
| `caseExamples` | 민원 사례 데이터 | `case_example` 테이블 |
| `sites` | 현장 정보 | `site` 테이블 |
| `sites/{id}/complaints` | 현장별 민원 (서브컬렉션) | `site_complaint` 테이블 (FK: site_id) |
| `sites/{id}/siteImages` | 현장 이미지 (서브컬렉션) | `site_image` 테이블 (FK: site_id) |
| `users` | 사용자 계정 + 역할 | `user_master`, `user_role` 테이블 |
| `roles_admin` | 관리자 역할 목록 | `user_role` 테이블로 통합 |
| `roles_manager` | 매니저 역할 목록 | `user_role` 테이블로 통합 |
| `responseGuides` | 대응 가이드 | `response_guide` 테이블 |
| `actionPlanLinks` | 대응 방안 링크 | `action_plan` 테이블 |
| `settings` | 시스템 설정 | `system_setting` 테이블 |
| `references` | 참고 자료 | `reference` 테이블 |
| `activity_logs` | 활동 로그 | `activity_log` 테이블 |
| `inquiries` | 문의 내용 | `inquiry` 테이블 |

---

## 3. 정규화 규칙

### 왜 정규화가 필요한가?
Firestore는 한 문서 안에 배열을 자유롭게 넣을 수 있습니다.
MySQL은 배열을 지원하지 않으므로, 배열 데이터는 별도 테이블로 분리해야 합니다.

### 정규화가 필요한 필드 예시

**`caseExamples` 문서의 배열 필드**
```json
{
  "type": ["소음", "진동"],         ← 배열 → case_example_type 테이블로 분리
  "requestContent": ["보상", "조정"] ← 배열 → case_example_request 테이블로 분리
}
```

**`sites` 문서의 배열 필드**
```json
{
  "phase": ["착공전", "토공"]  ← 배열 → site_phase 테이블로 분리
}
```

### 정규화 판단 기준
| 상황 | 처리 방법 |
|------|---------|
| 값이 2개 이상 선택 가능한 배열 | 별도 테이블로 분리 |
| 코드성 데이터 (유형, 지역, 단계 등) | `code_master`, `code_detail` 테이블로 관리 |
| 단순 1:1 관계인 단일 값 | 동일 테이블 컬럼으로 유지 |
| 서브컬렉션 (하위 문서) | 반드시 별도 테이블 + FK로 연결 |

---

## 4. PK / FK 규칙

### PK 규칙
- 모든 테이블의 PK는 `BIGINT AUTO_INCREMENT`를 사용한다.
- PK 컬럼명은 `테이블명_id` 형식으로 통일한다.
  - 예: `case_example` → `case_example_id`
  - 예: `site` → `site_id`
- Firebase의 문자열 ID(`abc123xyz`)는 마이그레이션 시 정수 PK로 대체하며, 필요 시 `firebase_id VARCHAR(100)` 컬럼으로 별도 보관한다.

### FK 규칙
- FK 컬럼명은 참조 대상 PK명과 동일하게 작성한다.
  - 예: `site_complaint.site_id` → `site.site_id` 참조
- 실제 DB FK 제약조건(`FOREIGN KEY`) 적용 여부는 **개발자가 운영 정책에 따라 결정**한다.
  - 데이터 이관·배치가 많은 경우: 논리적 FK만 사용 (제약조건 없음)
  - 데이터 정합성이 중요한 경우: DB 레벨 FK 제약조건 적용

---

## 5. 공통 감사 컬럼 (모든 테이블 필수)

모든 업무 테이블에는 아래 컬럼을 반드시 포함한다.

```sql
created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP   -- 생성일시
updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- 수정일시
created_by  VARCHAR(100)   -- 생성자 (사용자 이메일 또는 user_id)
updated_by  VARCHAR(100)   -- 수정자 (사용자 이메일 또는 user_id)
```

### 논리 삭제(Soft Delete) 컬럼 (삭제가 필요한 테이블)

물리 삭제(실제 행 제거) 대신 논리 삭제를 우선 적용한다.

```sql
deleted_yn  CHAR(1)  NOT NULL DEFAULT 'N'  -- 삭제 여부 (Y/N)
deleted_at  DATETIME NULL                  -- 삭제 일시
deleted_by  VARCHAR(100) NULL              -- 삭제자
```

> **현재 Firebase에서는 문서를 물리 삭제하고 있습니다.**
> MySQL 전환 후에는 논리 삭제 방식을 기본으로 채택합니다.

---

## 6. 문자셋 및 스토리지 규칙

- **문자셋**: 모든 테이블 `utf8mb4` (한글, 이모지 포함 처리 가능)
- **정렬**: `utf8mb4_unicode_ci`
- **스토리지 엔진**: `InnoDB` (트랜잭션 지원, FK 지원)
- **날짜/시간**: `DATETIME` 사용, 타임존은 `Asia/Seoul(KST)` 기준으로 통일

```sql
-- 테이블 생성 시 기본 선언 형식
CREATE TABLE table_name (
  ...
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 7. 테이블 네이밍 규칙

- 테이블명은 **소문자 + 언더스코어(snake_case)** 를 사용한다.
- 복수형 대신 단수형을 사용한다.
  - ✅ `case_example` / ❌ `caseExamples`, `case_examples`
- 연결 테이블(다대다 관계)은 두 테이블명을 조합한다.
  - 예: `case_example_type` (case_example + type의 연결)

---

## 8. 코드성 데이터 관리 규칙

현재 프론트엔드 `constants.ts`에 하드코딩된 선택지들은 DB에서 관리한다.

| 현재 상수 | 항목 예시 | DB 관리 방법 |
|----------|---------|------------|
| `FILTER_OPTIONS.region` | 공업, 주거, 민감, 상업 | `code_detail` 테이블 |
| `FILTER_OPTIONS.phase` | 착공전, 토공, 골조... | `code_detail` 테이블 |
| `FILTER_OPTIONS.type` | 소음, 진동, 교통... | `code_detail` 테이블 |
| `PROGRESS_OPTIONS` | 접수, 진행, 종결 | `code_detail` 테이블 |
| `COMPENSATION_STATUS_OPTIONS` | 미보상, 과태료... | `code_detail` 테이블 |
| `REQUEST_TYPE_OPTIONS` | 정신적피해보상... | `code_detail` 테이블 |

### 코드 테이블 구조 (예시)
```
code_master: 코드 그룹 관리
  code_master_id | code_group_name | description

code_detail: 코드 항목 관리
  code_detail_id | code_master_id | code_value | code_name | sort_order
```

---

## 9. 사용자 테이블(user_master) 마이그레이션 주의사항

### 비밀번호 컬럼 설계
- 비밀번호 저장 컬럼명은 `password_hash`로 지정하여 **해시값을 담는 컬럼**임을 명확히 한다.
- 해시 알고리즘(BCrypt 등)이 생성하는 문자열은 길이가 충분히 확보되어야 하므로 `VARCHAR(255)`로 설계한다.
- 이 컬럼에는 절대 평문 비밀번호를 저장하지 않는다. (보안 규칙 `docs/security.md` 6번 항목 참조)

```sql
-- 예시: user_master 테이블의 비밀번호 컬럼
password_hash  VARCHAR(255) NOT NULL   -- BCrypt 등 단방향 해시값 저장
```

### Firebase 사용자 비밀번호 이관 불가 문제

> ⚠️ **이 항목은 마이그레이션 전에 반드시 팀 내 협의가 필요합니다.**

Firebase Authentication은 보안 정책상 **기존 사용자의 비밀번호 해시값을 외부로 내보내는 것을 허용하지 않습니다.**
이로 인해 Firebase → Spring Boot 전환 시 기존 사용자의 비밀번호를 그대로 MySQL에 이관하는 것이 불가능합니다.

따라서 전환 시점에 아래와 같은 초기 비밀번호 정책이 필요합니다.

| 정책 옵션 | 내용 | 결정 주체 |
|----------|------|---------|
| 전체 비밀번호 초기화 | 전환 시 모든 사용자의 비밀번호를 초기값으로 설정 후 강제 재설정 안내 | 개발자 + 팀장 협의 |
| 임시 비밀번호 발급 | 개인별 임시 비밀번호를 생성하여 이메일 발송 | 개발자 + 팀장 협의 |
| 기타 방식 | 프로젝트 상황에 따라 별도 결정 | 개발자 + 팀장 협의 |

**구체적인 초기 비밀번호 정책 방식은 이 문서에서 단정하지 않으며, 개발자 및 팀장과 협의하여 결정한다.**

---

## 10. 인덱스 설계 원칙

- 자주 조회되는 컬럼(검색 필터 대상)에 인덱스를 설계한다.
- 인덱스는 반드시 실제 조회 패턴을 확인한 후 추가한다 (남발 금지).
- `EXPLAIN` 키워드로 쿼리 실행 계획을 확인하여 Full Scan을 최소화한다.

### 인덱스 예상 대상 컬럼
| 테이블 | 인덱스 대상 컬럼 | 이유 |
|--------|----------------|------|
| `case_example` | `region`, `phase`, `progress` | 필터 검색 대상 |
| `case_example` | `created_at` | 최신순 정렬 |
| `site_complaint` | `site_id` | FK 조회 |
| `activity_log` | `created_at`, `actor_email` | 로그 조회 |
| `user_master` | `login_id` | 로그인 조회 |
