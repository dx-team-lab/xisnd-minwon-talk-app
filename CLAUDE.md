# 자이S&D 시스템 개발 스펙 가이드라인 (전역 적용)
 
> 이 문서는 모든 프로젝트에 공통 적용되는 팀 표준 기술 스택 및 코드 작성 규칙입니다.
> 프로젝트마다 맥락이 다르므로, 아래 스펙은 **기본 권장 기준**이며 실제 사용 여부는 프로젝트 요구사항에 따라 판단하여 적용합니다.
> 프로젝트 루트에 별도 `CLAUDE.md`가 있을 경우, 해당 프로젝트의 지침이 이 전역 지침보다 우선합니다.
 
---
 
## 📌 공통 원칙
 
1. 명시된 기술 스택과 버전은 **기본 권장 기준**으로 사용한다.
2. 프로젝트 생성 시점의 **안정 LTS 또는 최신 안정 버전**을 우선 검토한다.
3. 회사 표준 또는 프로젝트별 `CLAUDE.md`에 별도 버전이 명시된 경우 해당 지침을 우선한다.
4. 불필요한 의존성은 추가하지 않는다.
5. 각 레이어(Frontend / Backend / AI / DB / Infra)는 독립적으로 운영 가능하도록 설계한다.
6. 코드는 **유지보수성, 가독성, 일관성**을 최우선으로 작성한다.
7. **보안, 성능, 확장성, 운영 안정성**을 항상 고려한다.
8. 사용자가 명시하지 않은 대규모 구조 변경은 임의로 수행하지 않는다.
9. 답변과 코드 주석은 기본적으로 한국어로 작성한다.
10. 코드 내 변수명, 함수명, 클래스명, 파일명은 프로젝트 관례를 따르되 기본적으로 영어를 사용한다.
11. 라이브러리는 상용(유료) 라이선스이거나 사용량, 호출 횟수, 사용자 수 등 운영에 영향을 주는 제약이 있는 경우 사용을 지양한다.
    무료로 사용 가능해야 하며, 사용량 제한이 충분히 높거나 운영 환경에서 안정적으로 활용 가능한 라이브러리를 우선 검토한다.
 
---
 
## 🧭 Claude Code 작업 원칙
 
1. 작업 전 먼저 현재 프로젝트 구조, 기존 코드 스타일, 사용 중인 라이브러리, 설정 파일을 확인한다.
2. 기존 구현 방식이 있을 경우 새 방식을 임의로 도입하지 않고 기존 패턴을 우선 따른다.
3. 코드를 수정하기 전 변경 범위와 영향도를 간단히 설명한다.
4. 한 번에 너무 많은 파일을 수정하지 않고, 기능 단위로 작게 나누어 작업한다.
5. 사용자가 요청하지 않은 기능 추가, 디자인 변경, 폴더 구조 변경은 하지 않는다.
6. 불확실한 요구사항은 임의로 확정하지 않고 합리적인 기본값을 적용하되, 적용한 가정을 명시한다.
7. 작업 완료 후 변경 파일, 주요 변경 내용, 실행/검증 방법을 요약한다.
8. 오류가 발생하면 원인, 수정 방법, 재발 방지 방안을 함께 설명한다.
9. 기존 테스트, 타입 체크, 린트 규칙이 있다면 이를 우회하지 않고 준수한다.
10. 프로젝트별 `README.md`, `CLAUDE.md`, 환경 설정 파일, 패키지 파일을 우선 확인한다.
 
---
 
## 🚫 금지 사항
 
- 기존 코드를 대규모로 재작성하지 않는다.
- 사용자가 요청하지 않은 리팩터링을 임의로 수행하지 않는다.
- 기존 폴더 구조, 네이밍 규칙, 상태관리 방식을 임의로 변경하지 않는다.
- 사용하지 않는 의존성을 추가하지 않는다.
- 새 라이브러리 설치 전 반드시 필요성과 대안을 설명한다.
- 보안키, API Key, Token, Password, 개인정보를 코드에 하드코딩하지 않는다.
- `.env`, 인증서, 키 파일, 운영 설정 파일을 임의로 생성하거나 노출하지 않는다.
- 임시 해결을 위해 `any`, `// @ts-ignore`, 빈 `catch` 블록을 남발하지 않는다.
- 테스트 없이 핵심 비즈니스 로직을 변경하지 않는다.
- 운영 환경 기준의 설정을 개발 편의 목적으로 약화하지 않는다.
- 프로젝트별 `CLAUDE.md` 또는 README의 지침과 충돌하는 작업을 하지 않는다.
 
---
 
## 🖥️ Frontend 표준
 
### 기술 스택
 
- **Framework**: React 19.x 이상 또는 프로젝트 표준 버전
- **언어**: TypeScript 5.x 이상
- **JS 표준**: ES2022 이상
- **빌드 도구**: Vite 최신 안정 버전 또는 프로젝트 표준 버전
- **런타임**: Node.js Active LTS 버전 사용
- **패키지 매니저**: npm / pnpm 중 프로젝트 표준 우선
- **상태 관리**: Zustand 기본, 대규모 프로젝트는 Redux Toolkit 검토
- **UI Framework**: Tailwind CSS 최신 안정 버전 또는 프로젝트 표준 버전
- **API 통신**: Axios 또는 Fetch 기반 서비스 레이어
- **아키텍처**: Component 기반 아키텍처
- **반응형**: 모바일 / 태블릿 / PC 대응 필수
 
### 작성 규칙
 
- 함수형 컴포넌트 및 React Hooks를 사용한다.
- 컴포넌트는 **단일 책임 원칙(SRP)**을 준수한다.
- 페이지 컴포넌트와 재사용 컴포넌트를 분리한다.
- API 호출은 **커스텀 훅 또는 서비스 레이어**로 분리한다.
- 전역 상태는 Zustand 또는 Redux Toolkit으로 관리한다.
- 로컬 상태는 `useState`, `useReducer`, `useMemo`, `useCallback`을 적절히 활용한다.
- Tailwind 클래스는 가독성을 위해 정렬 및 그룹핑한다.
- 반응형은 Tailwind breakpoint(`sm` / `md` / `lg` / `xl` / `2xl`) 기준으로 구현한다.
- 폼 검증, 에러 메시지, 로딩 상태, 빈 데이터 상태를 명확히 처리한다.
- 사용자 입력값은 클라이언트와 서버 양쪽에서 검증한다.
 
### 권장 폴더 구조 예시
 
```txt
src/
  app/
  pages/
  components/
  features/
  hooks/
  services/
  stores/
  utils/
  types/
  assets/
```
 
> 기존 프로젝트 구조가 있을 경우 위 구조를 강제로 적용하지 않고 기존 구조를 우선 따른다.
 
---
 
## ☕ Backend (Java) 표준
 
### 기술 스택
 
- **언어**: Java 21 LTS
- **Framework**: Spring Boot 3.3.x 또는 3.4.x 기본 권장
- **Spring**: Spring Framework 6.x
- **빌드**: Gradle 8.x 이상 또는 프로젝트 표준
- **ORM**: Spring Data JPA / Hibernate 6.x
- **API 방식**: RESTful API
- **인증**: JWT / OAuth2.0
- **서버**: Embedded Tomcat 10.x 또는 프로젝트 표준
- **API 문서**: Swagger / OpenAPI 3.x
- **배포**: Linux / AWS EC2 / Docker
 
> 운영 서비스 기본 기준은 Spring Boot 3.3.x 또는 3.4.x로 한다. 3.5.x 이상은 충분한 검증 후 적용한다.
> Spring Boot 4.x는 신규 프로젝트 또는 마이그레이션 검토가 완료된 경우에만 사용한다.
> 기존 3.x 프로젝트를 4.x로 상향할 때는 공식 Migration Guide, 의존성 호환성, Java 버전, Jakarta EE 변경사항을 반드시 검토한다.
 
### 아키텍처 원칙
- Controller → Service → Repository 의존성만 허용한다.
- Controller에서 Repository 직접 호출 금지
- Service 간 순환 참조 금지
- Domain Entity는 다른 Domain Entity를 직접 참조하지 않는다.
- 공통 기능은 common 패키지로 분리한다.
- 외부 API 연동은 infrastructure 패키지로 분리한다.

### 작성 규칙
- **레이어드 아키텍처**를 준수한다: `Controller → Service → Repository`
- Controller는 요청/응답 처리에 집중하고, 비즈니스 로직은 Service에 둔다.
- DTO / Entity를 명확히 분리한다.
- Entity를 API 응답으로 직접 반환하지 않는다.
- MapStruct 등 매핑 도구는 필요 시 사용할 수 있다.
- 예외는 `GlobalExceptionHandler`로 일관 처리한다.
- 트랜잭션 범위는 **Service 레이어**에서 관리한다.
- JPA N+1 문제를 방지한다. 필요 시 FetchJoin, EntityGraph, QueryDSL 등을 검토한다.
- Swagger/OpenAPI 어노테이션으로 API 명세를 자동화한다.
- 인증/인가 로직은 공통 필터 또는 보안 설정으로 분리한다.
- 비밀번호와 민감 정보는 반드시 암호화 또는 해시 처리한다.
@NotBlank
@NotNull
@Size(max = 100)
@Email
@Pattern
- Request DTO는 Validation 필수
- Controller 진입 전에 검증
- Service에서 null 체크 남발 금지

### 권장 패키지 구조 예시
기본 구조는 도메인 중심 구조를 권장합니다.
com.company.project

* common

  * config
  * exception
  * response
  * security
  * util
* domain

  * user

    * controller
    * service
    * repository
    * entity
    * dto
  * code

    * controller
    * service
    * repository
    * entity
    * dto
  * file

    * controller
    * service
    * repository
    * entity
    * dto
> 기존 프로젝트 패키지 구조가 있을 경우 위 구조를 강제로 적용하지 않고 기존 구조를 우선 따른다.
 
---
 
## 🐍 Python / AI Backend 표준
 
> Python은 **AI 전용 코드 또는 데이터 처리 모듈**로 구성한다.
> 기본적으로 Java 서버와 연동하는 내부 API 또는 독립 모듈 형태를 우선 검토한다.
> 단독 서버 운영이 필요한 경우에는 프로젝트 요구사항에 따라 별도 판단한다.
 
### 기술 스택
 
- **언어**: Python 3.12.x 이상 또는 프로젝트 표준
- **웹 프레임워크**: FastAPI 최신 안정 버전
- **ASGI 서버**: Uvicorn 최신 안정 버전
- **데이터 분석**: Pandas / NumPy 최신 안정 버전
- **머신러닝**: Scikit-learn / CatBoost / XGBoost 등 프로젝트 필요 시 적용
- **딥러닝**: PyTorch 등 프로젝트 필요 시 적용
- **패키지 관리**: Poetry 또는 pip
- **API 문서**: OpenAPI(Swagger) 자동 생성
- **로그**: Loguru 또는 Python logging
- **스케줄링**: APScheduler 필요 시 적용
- **운영**: Docker / Linux / AWS
 
### 작성 규칙
 
- Java 서버의 요청을 받아 처리하는 **내부 API** 형태를 기본으로 고려한다.
- FastAPI 라우터는 기능 단위로 모듈화한다.
- 모델 학습/추론 코드는 서비스 레이어로 분리한다.
- 데이터 전처리, 학습, 추론, 평가 코드는 역할별로 분리한다.
- 환경변수는 `.env`와 `pydantic BaseSettings` 또는 프로젝트 표준 방식으로 관리한다.
- 로그는 구조화된 형태로 출력한다.
- 모델 파일, 학습 데이터, 결과 파일은 경로와 버전 관리를 명확히 한다.
- 무거운 연산은 동기 API에 직접 넣지 않고 비동기 처리, 배치, 큐 구조를 검토한다.
- LLM 호출은 Service 계층에서 관리
- Prompt 하드코딩 금지
- Prompt 파일 분리
- Model 버전 관리
- Token 사용량 로그 저장
- 응답 캐싱 검토
- 개인정보 Prompt 전송 금지
---
 
## 🗄️ Database 표준
 
### 기술 스택
 
- **DB**: MySQL 8.4 LTS 또는 프로젝트 표준 DB
- **문자셋**: utf8mb4
- **스토리지 엔진**: InnoDB
- **커넥션 풀**: HikariCP
- **마이그레이션**: Flyway 또는 프로젝트 표준 도구
- **백업/이중화**: AWS RDS 또는 Replication 구조
 
### 작성 규칙
 
- 모든 테이블은 `utf8mb4` 문자셋을 적용한다.
- 스키마 변경은 가능한 한 Flyway 마이그레이션 스크립트로 관리한다.
- 인덱스는 실제 조회 패턴 기반으로 설계한다.
- 무분별한 인덱스 추가를 피한다.
- 민감 데이터는 암호화 또는 해시 처리한다.
- Soft Delete 적용 여부는 프로젝트 정책에 따른다.
- 날짜/시간 컬럼은 타임존 정책을 명확히 한다.
- 생성일/수정일 컬럼은 공통 감사 필드로 관리한다.
- 외래키 제약조건 적용 여부는 운영 정책과 성능을 함께 고려한다.

### SQL 작성 기준

- SELECT * 금지
- 필요한 컬럼만 조회
- N+1 발생 여부 확인
- OFFSET 페이징 최소화
- 대용량 조회 시 Cursor 검토
- 인덱스 없는 LIKE '%검색%' 지양

### 공통 코드 정책

상태값 하드코딩 금지

예

USER_STATUS

ACTIVE
INACTIVE
LOCKED

코드 테이블 관리

code_group
code_detail
 
### 기본 컬럼 예시
 
1. 테이블 네이밍

* 테이블명은 소문자와 언더스코어를 사용합니다.
* 업무 도메인 기준으로 명확하게 작성합니다.
* 예시:

  * user_master
  * user_detail
  * user_role
  * user_login_history
  * menu_master
  * code_master
  * code_detail
  * file_master
  * api_call_history

2. Master Detail 구조
   사용자 정보는 기본 정보와 상세 정보를 분리합니다.

user_master

* 사용자 계정의 핵심 정보를 관리합니다.
* 로그인, 상태, 권한 연결 등 인증과 식별에 필요한 정보를 저장합니다.

예시 컬럼:

* user_id BIGINT PK AUTO_INCREMENT
* login_id VARCHAR(100) NOT NULL UNIQUE
* password VARCHAR(255) NOT NULL
* user_name VARCHAR(100) NOT NULL
* email VARCHAR(255)
* mobile_no VARCHAR(50)
* user_status VARCHAR(30) NOT NULL
* last_login_at DATETIME
* use_yn CHAR(1) NOT NULL DEFAULT 'Y'
* created_at DATETIME NOT NULL
* updated_at DATETIME NOT NULL
* created_by VARCHAR(100)
* updated_by VARCHAR(100)

user_detail

* 사용자 부가 정보를 관리합니다.
* 조직, 직급, 부서, 프로필, 업무 설정 등 확장 가능한 상세 정보를 저장합니다.

예시 컬럼:

* user_detail_id BIGINT PK AUTO_INCREMENT
* user_id BIGINT NOT NULL
* company_code VARCHAR(50)
* department_code VARCHAR(50)
* position_code VARCHAR(50)
* job_title VARCHAR(100)
* profile_image_url VARCHAR(500)
* address VARCHAR(500)
* memo TEXT
* created_at DATETIME NOT NULL
* updated_at DATETIME NOT NULL
* created_by VARCHAR(100)
* updated_by VARCHAR(100)

3. 공통 컬럼
   모든 업무 테이블에는 아래 공통 컬럼을 기본 포함합니다.

created_at DATETIME NOT NULL
updated_at DATETIME NOT NULL
created_by VARCHAR(100)
updated_by VARCHAR(100)

삭제가 필요한 테이블은 물리 삭제보다 논리 삭제를 우선합니다.

use_yn CHAR(1) NOT NULL DEFAULT 'Y'
deleted_yn CHAR(1) NOT NULL DEFAULT 'N'
deleted_at DATETIME NULL
deleted_by VARCHAR(100) NULL

4. PK/FK 기준

* PK는 BIGINT AUTO_INCREMENT를 기본으로 사용합니다.
* FK 컬럼명은 참조 대상 PK명과 동일하게 작성합니다.
* 예시:

  * user_master.user_id
  * user_detail.user_id
* 실제 FK 제약조건은 프로젝트 운영 정책에 따라 적용 여부를 결정합니다.
* 운영 중 데이터 이관과 배치 처리가 많은 시스템은 논리적 FK만 사용할 수 있습니다.

5. 컬럼 네이밍

* 날짜: created_at, updated_at, deleted_at, started_at, ended_at
* 여부: use_yn, delete_yn, approve_yn
* 코드: company_code, department_code, status_code
* 이름: user_name, company_name
* 금액: amount, total_amount
* 수량: count, total_count

6. 상태값 관리
   상태값은 문자열 하드코딩을 지양하고 code_master, code_detail 테이블로 관리합니다.

code_master 예시:

* code_group_id
* code_group_name
* description
* use_yn
* created_at
* updated_at

code_detail 예시:

* code_id
* code_group_id
* code_value
* code_name
* sort_order
* use_yn
* created_at
* updated_at
 
---

## 성능 기준

API 응답 목표

- 일반 조회 1초 이내
- 목록 조회 3초 이내
- 배치 제외

DB

- Explain 확인
- Full Scan 최소화
- Index 설계 검토

## 모니터링

필수

- Health Check
- Metrics
- Logging
- Tracing

권장

- Prometheus
- Grafana
- OpenTelemetry

## Message Queue

사용 대상

- 이메일 발송
- 문자 발송
- AI 분석
- 외부 API 연동

권장

- RabbitMQ
- Kafka

## API 버전 정책

기본

/api/v1/...

신규 기능

/api/v2/...

기존 API 수정 시

- 기존 응답 필드 삭제 금지
- 하위 호환성 유지
- Deprecated 표시

## API 개발 기준

1. URL 규칙

* 복수형 리소스 사용
* 업무 도메인 기준 작성

예시:
GET /api/v1/users
GET /api/v1/users/{userId}
POST /api/v1/users
PUT /api/v1/users/{userId}
DELETE /api/v1/users/{userId}

2. 응답 형식
   모든 API는 공통 응답 포맷을 사용합니다.

{
"success": true,
"code": "OK",
"message": "요청이 정상 처리되었습니다.",
"data": {}
}

3. 에러 응답
   {
   "success": false,
   "code": "USER_NOT_FOUND",
   "message": "사용자를 찾을 수 없습니다.",
   "data": null
   }

4. Controller 기준

* Controller는 요청과 응답만 담당합니다.
* 비즈니스 로직은 Service에 작성합니다.
* Entity를 직접 반환하지 않고 Response DTO를 반환합니다.

5. Service 기준

* 핵심 비즈니스 로직을 담당합니다.
* 트랜잭션 기준을 명확히 합니다.
* 등록, 수정, 삭제 시 created_by, updated_by 값을 반드시 처리합니다.

6. Repository 기준

* DB 접근만 담당합니다.
* 복잡한 조회는 QueryDSL, MyBatis XML, 또는 별도 QueryRepository로 분리합니다.

DTO 기준

Request DTO:

* API 요청 값을 받는 객체입니다.
* Validation 어노테이션을 적용합니다.

Response DTO:

* API 응답 전용 객체입니다.
* Entity를 그대로 반환하지 않습니다.

예시:
UserCreateRequest
UserUpdateRequest
UserSearchRequest
UserResponse
UserDetailResponse

엔티티 기준

* Entity는 DB 테이블 구조와 매핑합니다.
* Setter 사용은 최소화합니다.
* 생성과 변경은 의미 있는 메서드로 처리합니다.

예시:
createUser()
updateUserInfo()
changeStatus()
deleteUser()

## Redis 사용 기준

사용 가능 목적

- 캐싱
- 세션
- 분산락
- Rate Limit
- Queue

사용 금지

- 영구 데이터 저장
- 관계형 데이터 대체

## 로그 정책

- System.out.println 사용 금지
- Slf4j(Logback) 사용
- INFO : 업무 흐름
- WARN : 비정상 상황
- ERROR : 예외 발생

로그 출력 금지 항목

- 비밀번호
- Access Token
- Refresh Token
- 주민번호
- 개인정보

## ⚙️ Infra / DevOps 표준
 
### 기술 스택
 
- **OS**: Amazon Linux 2023 / Ubuntu LTS
- **웹 서버**: Nginx 최신 안정 버전
- **컨테이너**: Docker Engine 최신 안정 버전 또는 회사 표준 버전
- **CI/CD**: GitHub Actions
- **형상관리**: Git / DX팀 private 저장소
- **프로세스 관리**: systemd 기본, Node.js 운영 시 PM2 검토
- **SSL**: Let's Encrypt / Certbot 또는 회사 표준 인증서
 
### 작성 규칙
 
- Dockerfile은 가능하면 **multi-stage build**를 적용하여 이미지 크기를 줄인다.
- Nginx는 리버스 프록시 및 SSL 터미네이션 역할로 사용한다.
- GitHub Actions 워크플로우는 환경별(`dev` / `staging` / `prod`)로 분리한다.
- 환경 변수 및 시크릿은 GitHub Secrets, AWS Parameter Store, Secret Manager 등으로 관리한다.
- 운영 로그, 에러 로그, 접근 로그 위치를 명확히 한다.
- 배포 스크립트는 재실행 가능하도록 작성한다.
- 운영 배포 전 빌드, 테스트, 린트, 타입 체크를 수행한다.
 
---
 
## 🔐 보안 기준
 
1. 인증과 인가는 반드시 서버에서 검증한다.
2. 클라이언트 검증은 사용자 경험 개선 목적이며 보안 수단으로 간주하지 않는다.
3. 비밀번호는 평문 저장하지 않는다.
4. API Key, Token, Secret은 코드와 저장소에 포함하지 않는다.
5. CORS 설정은 필요한 Origin만 허용한다.
6. SQL Injection, XSS, CSRF 등 기본 취약점을 고려한다.
7. 파일 업로드 기능은 확장자, MIME 타입, 크기 제한을 적용한다.
8. 개인정보는 최소 수집, 최소 보관 원칙을 따른다.
9. 로그에 개인정보, 인증 토큰, 비밀번호가 남지 않도록 한다.
10. 운영 환경의 디버그 모드는 비활성화한다.
 
---
 
## 🧪 테스트 기준
 
### Frontend
 
- 핵심 컴포넌트와 유틸 함수는 테스트를 작성한다.
- 사용자 입력, 폼 검증, API 에러 상태를 테스트한다.
- 화면 변경 시 반응형 레이아웃을 확인한다.
 
### Backend
 
- Service 레이어의 핵심 비즈니스 로직은 단위 테스트를 작성한다.
- Controller는 필요 시 통합 테스트 또는 API 테스트를 작성한다.
- Repository는 복잡한 쿼리 중심으로 테스트한다.
- 인증/인가가 필요한 API는 권한별 테스트를 고려한다.
 
### 공통
 
- 수정한 기능과 직접 관련된 테스트를 우선 실행한다.
- 테스트가 없는 프로젝트에서는 최소한 실행 방법과 수동 검증 절차를 제시한다.
- 테스트 실패 시 실패 원인과 수정 방향을 설명한다.
 
---
 
## 🧾 코드 품질 기준
 
1. 중복 코드를 줄이고 공통 로직은 적절히 분리한다.
2. 함수와 메서드는 하나의 역할에 집중한다.
3. 이름만 보고 역할을 이해할 수 있도록 명확하게 작성한다.
4. 복잡한 조건문은 별도 함수로 분리한다.
5. 매직 넘버와 하드코딩된 문자열은 상수화한다.
6. 주석은 "무엇"보다 "왜"를 설명하는 용도로 사용한다.
7. 예외 처리는 사용자 메시지와 개발자 로그를 구분한다.
8. 성능 개선은 실제 병목 또는 합리적 근거가 있을 때 적용한다.
 
---
 
## ✅ 프로젝트별 적용 판단 기준
 
프로젝트 맥락에 따라 아래 항목은 포함 여부를 결정한다.
 
| 항목 | 포함 조건 |
|------|----------|
| Python/AI Backend | AI 기능, 데이터 분석, ML 추론/학습이 필요한 경우 |
| Redux Toolkit | 복잡한 전역 상태 관리가 필요한 대규모 프로젝트 |
| OAuth2.0 | 소셜 로그인 또는 외부 인증 연동이 필요한 경우 |
| APScheduler | 배치 작업 또는 주기적 태스크가 필요한 경우 |
| Flyway | DB 스키마 변경이 빈번하거나 다수 환경 관리가 필요한 경우 |
| PM2 | Node.js 기반 프로세스 운영이 필요한 경우 |
| Docker | 배포 환경 통일, 로컬 개발 환경 표준화가 필요한 경우 |
| QueryDSL | 복잡한 동적 쿼리가 많은 경우 |
| Redis | 캐싱, 세션, 분산락, 큐성 처리가 필요한 경우 — 중요도 높음, 도입 시 별도 섹션으로 관리 권장 |
| Message Queue | 비동기 작업, 대량 처리, 외부 연동 안정성이 필요한 경우 |
 
---
 
## 🤖 Claude에게 요청할 때 기본 동작
 
1. 위 스펙을 **기본값**으로 가정하고 코드를 작성한다.
2. 프로젝트 맥락에서 다른 스택이 명시되면 그쪽을 우선한다.
3. 사용자가 "이 프로젝트는 AI 없음", "프론트엔드만", "백엔드만" 등의 맥락을 주면 불필요한 스펙은 제외한다.
4. 명시된 버전 범위를 임의로 상향/하향 조정하지 않는다.
5. 새로운 의존성을 추가할 때는 꼭 필요한지 먼저 확인한다.
6. 기존 코드 스타일, 네이밍, 폴더 구조를 우선한다.
7. 작업 완료 후 변경 요약과 검증 방법을 제공한다.
8. 답변과 코드 주석은 한국어로 작성한다.
9. 코드 자체의 식별자는 프로젝트 관례에 맞춰 영어를 사용한다.
10. 불확실한 부분은 추측하지 않고 가정과 확인 필요 사항을 명시한다.
 
---
 
## 💬 답변 형식
 
Claude는 작업 완료 후 아래 기준에 따라 응답 형식을 결정한다.
 
**전체 형식 사용 조건**: 수정/생성 파일이 2개 이상이거나 기능 단위 작업일 때
 
```md
## 변경 요약
- ...
 
## 수정/생성된 파일
- ...
 
## 주요 구현 내용
- ...
 
## 실행 방법
\`\`\`bash
...
\`\`\`
 
## 검증 방법
\`\`\`bash
...
\`\`\`
 
## 추가 확인 사항
- ...
```
 
**간소화 형식 사용 조건**: 단순 질문, 코드 리뷰, 파일 1개 이하의 짧은 수정 요청은 핵심 내용만 간결하게 응답한다.
 
---
 
## 📝 사용 방법
 
이 파일은 아래 경로에 두면 모든 Claude Code 세션에 전역 적용된다.
 
```bash
# macOS / Linux
~/.claude/CLAUDE.md
 
# Windows
C:\Users\{사용자명}\.claude\CLAUDE.md
```
 
프로젝트별로 다른 규칙이 필요하면 해당 프로젝트 루트에 별도 `CLAUDE.md`를 둔다.
 
```bash
프로젝트루트/CLAUDE.md
```
 
우선순위는 다음과 같다.
 
```txt
프로젝트별 CLAUDE.md > 전역 CLAUDE.md > Claude 기본 동작
```
 
---

## 장애 대응

Severity 1
- 서비스 전체 장애

Severity 2
- 핵심 기능 장애

Severity 3
- 일부 기능 장애

장애 발생 시

1. 로그 확인
2. 영향도 파악
3. 롤백 가능 여부 확인
4. 장애 보고

## 아키텍처 결정 기록

주요 기술 선택 시 근거를 남긴다.

예시

- Redis 사용 이유
- MyBatis 선택 이유
- PostgreSQL 선택 이유
- OAuth2 채택 이유

## 📌 권장 운영 방식
 
전역 `CLAUDE.md`에는 다음 내용을 둔다.
 
- 작업 원칙
- 금지사항
- 기본 기술 기준
- 보안 기준
- 테스트 기준
- 답변 형식
 
프로젝트별 `CLAUDE.md`에는 다음 내용을 둔다.
 
- 실제 사용하는 기술 스택과 버전
- 프로젝트 폴더 구조
- 도메인 규칙
- API 규칙
- DB 규칙
- 화면/디자인 기준
- 배포 방식

반드시 패키지는 
프론트는 (APP-NAME)-frontend, 
백엔드는 (APP-NAME)-backend로 구성 되어야한다.