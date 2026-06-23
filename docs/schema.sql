-- ============================================================
-- MinwonTalk 민원 대응 지식 플랫폼
-- MySQL 테이블 설계 초안 (schema.sql)
-- 기준: docs/database.md 규칙 준수
-- 생성일: 2026-06-23
-- ============================================================
-- [주의사항]
-- 1. 이 파일은 설계 초안입니다. 실제 DB 생성 전 반드시 개발자 검토 후 적용하세요.
-- 2. FOREIGN KEY 제약조건: '[FK: 개발자 결정]' 주석으로 표시된 곳은
--    실제 적용 여부를 개발자가 운영 정책에 따라 결정합니다.
-- 3. firebase_id 컬럼: 마이그레이션 시 Firebase 문서 ID를 보관하는 임시 컬럼입니다.
--    마이그레이션 완료 후 삭제 여부를 검토하세요.
-- 4. 날짜/시간: 모든 DATETIME은 KST(Asia/Seoul) 기준으로 저장합니다.
-- 5. 금액: 반드시 DECIMAL 사용 (FLOAT/DOUBLE 절대 금지 - 계산 오차 발생)
-- ============================================================


-- ============================================================
-- 1. 사용자 계정 테이블
-- ============================================================
-- 플랫폼 로그인 사용자의 계정 정보(이메일, 이름, 승인 여부 등)를 관리하는 테이블
CREATE TABLE tb_user_master (
  user_master_id  BIGINT        NOT NULL AUTO_INCREMENT                    COMMENT 'PK',
  firebase_id     VARCHAR(100)  NULL                                       COMMENT 'Firebase UID (마이그레이션 임시 보관용)',
  login_id        VARCHAR(255)  NOT NULL                                   COMMENT '로그인 이메일',
  password_hash   VARCHAR(255)  NOT NULL                                   COMMENT 'BCrypt 등 단방향 해시값 저장 (평문 절대 금지)',
  display_name    VARCHAR(100)  NULL                                       COMMENT '화면 표시 이름',
  user_name       VARCHAR(100)  NULL                                       COMMENT '실명',
  approved_yn     CHAR(1)       NOT NULL DEFAULT 'N'                       COMMENT '승인 여부 (Y/N)',
  use_yn          CHAR(1)       NOT NULL DEFAULT 'Y'                       COMMENT '사용 여부 (Y/N)',
  deleted_yn      CHAR(1)       NOT NULL DEFAULT 'N'                       COMMENT '삭제 여부 (Y/N)',
  deleted_at      DATETIME      NULL                                       COMMENT '삭제 일시 (KST)',
  deleted_by      VARCHAR(100)  NULL                                       COMMENT '삭제자',
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP         COMMENT '생성일시 (KST)',
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP       COMMENT '수정일시 (KST)',
  created_by      VARCHAR(100)  NULL                                       COMMENT '생성자',
  updated_by      VARCHAR(100)  NULL                                       COMMENT '수정자',
  PRIMARY KEY (user_master_id),
  UNIQUE KEY uk_user_login_id (login_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='사용자 계정 (로그인/인증 정보)';


-- ============================================================
-- 2. 사용자 역할 테이블
-- ============================================================
-- 사용자별 역할(admin/manager)을 관리하는 테이블
-- Firebase roles_admin, roles_manager 컬렉션을 하나의 테이블로 통합
CREATE TABLE tb_user_role (
  user_role_id    BIGINT        NOT NULL AUTO_INCREMENT                    COMMENT 'PK',
  user_master_id  BIGINT        NOT NULL                                   COMMENT 'tb_user_master FK', -- [FK: 개발자 결정] REFERENCES tb_user_master(user_master_id)
  role_code       VARCHAR(30)   NOT NULL                                   COMMENT '역할 코드 (ADMIN / MANAGER)',
  use_yn          CHAR(1)       NOT NULL DEFAULT 'Y'                       COMMENT '사용 여부 (Y/N)',
  deleted_yn      CHAR(1)       NOT NULL DEFAULT 'N'                       COMMENT '삭제 여부 (Y/N)',
  deleted_at      DATETIME      NULL                                       COMMENT '삭제 일시 (KST)',
  deleted_by      VARCHAR(100)  NULL                                       COMMENT '삭제자',
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP         COMMENT '생성일시 (KST)',
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP       COMMENT '수정일시 (KST)',
  created_by      VARCHAR(100)  NULL                                       COMMENT '생성자',
  updated_by      VARCHAR(100)  NULL                                       COMMENT '수정자',
  PRIMARY KEY (user_role_id),
  UNIQUE KEY uk_user_role (user_master_id, role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='사용자 역할 (관리자/매니저 구분)';


-- ============================================================
-- 3. 코드 마스터 테이블
-- ============================================================
-- 지역유형/공정단계/민원유형/진행상태 등 시스템 내 모든 코드성 데이터를 통합 관리하는 테이블
-- 현재 프론트엔드 constants.ts에 하드코딩된 선택지들을 DB에서 관리
-- 예시 code_group_name: REGION_TYPE, PHASE, COMPLAINT_TYPE, PROGRESS,
--                       COMPENSATION_METHOD, REQUEST_TYPE
CREATE TABLE tb_code_master (
  code_master_id  BIGINT        NOT NULL AUTO_INCREMENT                    COMMENT 'PK',
  code_group_name VARCHAR(100)  NOT NULL                                   COMMENT '코드 그룹명 (예: REGION_TYPE)',
  description     VARCHAR(500)  NULL                                       COMMENT '그룹 설명',
  code_value      VARCHAR(100)  NOT NULL                                   COMMENT '코드 저장값 (예: RESIDENTIAL)',
  code_name       VARCHAR(100)  NOT NULL                                   COMMENT '코드 표시명 (예: 주거)',
  sort_order      INT           NOT NULL DEFAULT 0                         COMMENT '정렬 순서',
  use_yn          CHAR(1)       NOT NULL DEFAULT 'Y'                       COMMENT '사용 여부 (Y/N)',
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP         COMMENT '생성일시 (KST)',
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP       COMMENT '수정일시 (KST)',
  created_by      VARCHAR(100)  NULL                                       COMMENT '생성자',
  updated_by      VARCHAR(100)  NULL                                       COMMENT '수정자',
  PRIMARY KEY (code_master_id),
  UNIQUE KEY uk_code_group_value (code_group_name, code_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='코드 마스터 (지역유형/단계/민원유형 등 공통 코드 통합 관리)';


-- ============================================================
-- 4. 현장 테이블
-- ============================================================
-- 건설 현장의 기본 정보(현장명, 지역유형, 민원 건수 등)를 관리하는 테이블
CREATE TABLE tb_site (
  site_id           BIGINT        NOT NULL AUTO_INCREMENT                  COMMENT 'PK',
  firebase_id       VARCHAR(100)  NULL                                     COMMENT 'Firebase 문서 ID (마이그레이션 임시 보관용)',
  site_name         VARCHAR(200)  NOT NULL                                 COMMENT '현장명 (예: 강릉자이르네 디오션)',
  region            VARCHAR(200)  NULL                                     COMMENT '지역/주소 정보 (확인 필요: 1번 항목 참조)',
  region_type       VARCHAR(30)   NULL                                     COMMENT '지역 유형 (주거/상업/공업/민감)',
  completed_count   INT           NOT NULL DEFAULT 0                       COMMENT '완료 민원 건수',
  in_progress_count INT           NOT NULL DEFAULT 0                       COMMENT '진행중 민원 건수',
  main_content      TEXT          NULL                                     COMMENT '현장 주요 내용',
  sort_order        INT           NOT NULL DEFAULT 0                       COMMENT '목록 표시 순서',
  use_yn            CHAR(1)       NOT NULL DEFAULT 'Y'                     COMMENT '사용 여부 (Y/N)',
  deleted_yn        CHAR(1)       NOT NULL DEFAULT 'N'                     COMMENT '삭제 여부 (Y/N)',
  deleted_at        DATETIME      NULL                                     COMMENT '삭제 일시 (KST)',
  deleted_by        VARCHAR(100)  NULL                                     COMMENT '삭제자',
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP       COMMENT '생성일시 (KST)',
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                           ON UPDATE CURRENT_TIMESTAMP     COMMENT '수정일시 (KST)',
  created_by        VARCHAR(100)  NULL                                     COMMENT '생성자',
  updated_by        VARCHAR(100)  NULL                                     COMMENT '수정자',
  PRIMARY KEY (site_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='건설 현장 기본 정보';


-- ============================================================
-- 5. 현장 공정 단계 테이블 (배열 정규화)
-- ============================================================
-- 현장별 공정 단계를 관리하는 테이블
-- Firebase sites.phase 배열(착공전/토공/골조/마감/준공)을 별도 테이블로 분리
CREATE TABLE tb_site_phase (
  site_phase_id   BIGINT        NOT NULL AUTO_INCREMENT                    COMMENT 'PK',
  site_id         BIGINT        NOT NULL                                   COMMENT 'tb_site FK', -- [FK: 개발자 결정] REFERENCES tb_site(site_id)
  phase_code      VARCHAR(50)   NOT NULL                                   COMMENT '공정 단계 코드 (착공전/토공/골조/마감/준공)',
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP         COMMENT '생성일시 (KST)',
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP       COMMENT '수정일시 (KST)',
  created_by      VARCHAR(100)  NULL                                       COMMENT '생성자',
  updated_by      VARCHAR(100)  NULL                                       COMMENT '수정자',
  PRIMARY KEY (site_phase_id),
  UNIQUE KEY uk_site_phase (site_id, phase_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='현장별 공정 단계 (하나의 현장에 여러 단계 선택 가능)';


-- ============================================================
-- 6. 현장 이미지 테이블
-- ============================================================
-- 현장에 첨부된 이미지 파일을 관리하는 테이블
-- Firebase 서브컬렉션 sites/{id}/siteImages를 별도 테이블로 분리
-- [주의] image_data(Base64)는 용량이 매우 큼 → MySQL 전환 시 S3 등 파일 스토리지 이전 강력 권장
CREATE TABLE tb_site_image (
  site_image_id   BIGINT        NOT NULL AUTO_INCREMENT                    COMMENT 'PK',
  firebase_id     VARCHAR(100)  NULL                                       COMMENT 'Firebase 문서 ID (마이그레이션 임시 보관용)',
  site_id         BIGINT        NOT NULL                                   COMMENT 'tb_site FK', -- [FK: 개발자 결정] REFERENCES tb_site(site_id)
  image_data      MEDIUMTEXT    NULL                                       COMMENT 'Base64 인코딩 이미지 (파일 스토리지 이전 전 임시 사용, 확인 필요: 2번 항목 참조)',
  image_url       VARCHAR(1000) NULL                                       COMMENT '파일 스토리지 URL (S3 이전 후 사용)',
  file_name       VARCHAR(500)  NOT NULL                                   COMMENT '원본 파일명',
  sort_order      INT           NOT NULL DEFAULT 0                         COMMENT '표시 순서',
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP         COMMENT '생성일시 (KST)',
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP       COMMENT '수정일시 (KST)',
  created_by      VARCHAR(100)  NULL                                       COMMENT '생성자',
  updated_by      VARCHAR(100)  NULL                                       COMMENT '수정자',
  PRIMARY KEY (site_image_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='현장 첨부 이미지 (최대 5장, Base64 또는 파일 URL)';


-- ============================================================
-- 7. 현장 민원 테이블
-- ============================================================
-- 현장별 개별 민원(민원인 정보, 진행 단계, 상세 내용 등)을 관리하는 테이블
-- Firebase 서브컬렉션 sites/{id}/complaints를 별도 테이블로 분리
CREATE TABLE tb_site_complaint (
  site_complaint_id  BIGINT        NOT NULL AUTO_INCREMENT                 COMMENT 'PK',
  firebase_id        VARCHAR(100)  NULL                                    COMMENT 'Firebase 문서 ID (마이그레이션 임시 보관용)',
  site_id            BIGINT        NOT NULL                                COMMENT 'tb_site FK', -- [FK: 개발자 결정] REFERENCES tb_site(site_id)
  complaint_number   INT           NOT NULL                                COMMENT '민원 순번 (화면 표시용)',
  complainant        VARCHAR(500)  NOT NULL                                COMMENT '민원인 식별 정보 (주소 등, 예: 팔송길 32)',
  usage_info         TEXT          NULL                                    COMMENT '용도 정보 (예: 1F~5F 15년 / 8세대)',
  owner_info         TEXT          NULL                                    COMMENT '소유주 정보 (예: 공용주택)',
  status_code        VARCHAR(30)   NOT NULL DEFAULT '진행중'               COMMENT '민원 상태 (진행중/완료)',
  sort_order         INT           NOT NULL DEFAULT 0                      COMMENT '표시 순서',
  -- 진행 단계 (Firebase stageDetails 중첩 객체를 컬럼으로 분리)
  stage_code         VARCHAR(50)   NULL                                    COMMENT '현재 진행 단계 (민원발생/민원대응/보상협상/합의및집행/완료)',
  stage_occurrence   TEXT          NULL                                    COMMENT '민원 발생 내용',
  stage_response     TEXT          NULL                                    COMMENT '민원 대응 내용',
  stage_negotiation  TEXT          NULL                                    COMMENT '보상 협상 내용',
  stage_agreement    TEXT          NULL                                    COMMENT '합의 및 집행 내용',
  deleted_yn         CHAR(1)       NOT NULL DEFAULT 'N'                    COMMENT '삭제 여부 (Y/N)',
  deleted_at         DATETIME      NULL                                    COMMENT '삭제 일시 (KST)',
  deleted_by         VARCHAR(100)  NULL                                    COMMENT '삭제자',
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP      COMMENT '생성일시 (KST)',
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                            ON UPDATE CURRENT_TIMESTAMP    COMMENT '수정일시 (KST)',
  created_by         VARCHAR(100)  NULL                                    COMMENT '생성자',
  updated_by         VARCHAR(100)  NULL                                    COMMENT '수정자',
  PRIMARY KEY (site_complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='현장별 민원 내역 (민원인 정보 및 진행 단계)';


-- ============================================================
-- 8. 민원-대응방안 연결 테이블 (배열 정규화)
-- ============================================================
-- 민원 1건에 선택된 대응방안 목록을 관리하는 테이블
-- Firebase SiteComplaint.responsePlans 배열을 별도 테이블로 분리
-- [확인 필요: 5번 항목] 현재 Firebase에 제목(텍스트)으로 저장됨 → action_plan_id FK 연결 여부 결정 필요
CREATE TABLE tb_site_complaint_response_plan (
  complaint_response_plan_id  BIGINT        NOT NULL AUTO_INCREMENT        COMMENT 'PK',
  site_complaint_id           BIGINT        NOT NULL                       COMMENT 'tb_site_complaint FK', -- [FK: 개발자 결정] REFERENCES tb_site_complaint(site_complaint_id)
  action_plan_id              BIGINT        NULL                           COMMENT 'tb_action_plan FK (확인 필요: 5번 항목)', -- [FK: 개발자 결정] REFERENCES tb_action_plan(action_plan_id)
  plan_title                  VARCHAR(500)  NULL                           COMMENT '대응방안 제목 (마이그레이션 임시 보관 또는 텍스트 저장 선택 시 사용)',
  created_at                  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시 (KST)',
  updated_at                  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                     ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시 (KST)',
  created_by                  VARCHAR(100)  NULL                           COMMENT '생성자',
  updated_by                  VARCHAR(100)  NULL                           COMMENT '수정자',
  PRIMARY KEY (complaint_response_plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='민원-대응방안 연결 (민원 1건에 여러 대응방안 선택)';


-- ============================================================
-- 9. 민원 유사사례 테이블 (배열 정규화)
-- ============================================================
-- 민원 1건에 등록된 유사 사례 목록을 관리하는 테이블
-- Firebase SiteComplaint.similarCases 배열을 별도 테이블로 분리
CREATE TABLE tb_site_complaint_similar_case (
  similar_case_id    BIGINT        NOT NULL AUTO_INCREMENT                 COMMENT 'PK',
  site_complaint_id  BIGINT        NOT NULL                                COMMENT 'tb_site_complaint FK', -- [FK: 개발자 결정] REFERENCES tb_site_complaint(site_complaint_id)
  case_text          TEXT          NOT NULL                                COMMENT '유사 사례 내용',
  case_url           VARCHAR(1000) NULL                                    COMMENT '참조 URL',
  sort_order         INT           NOT NULL DEFAULT 0                      COMMENT '표시 순서',
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP      COMMENT '생성일시 (KST)',
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                            ON UPDATE CURRENT_TIMESTAMP    COMMENT '수정일시 (KST)',
  created_by         VARCHAR(100)  NULL                                    COMMENT '생성자',
  updated_by         VARCHAR(100)  NULL                                    COMMENT '수정자',
  PRIMARY KEY (similar_case_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='민원별 유사 사례 목록';


-- ============================================================
-- 10. 대응 방안 테이블
-- ============================================================
-- 민원 유형/지역/단계별 대응 지식(원인 분석 + 조치 방안)을 관리하는 테이블
-- Firebase responseGuides 컬렉션에 해당
CREATE TABLE tb_response_guide (
  response_guide_id  BIGINT        NOT NULL AUTO_INCREMENT                 COMMENT 'PK',
  firebase_id        VARCHAR(100)  NULL                                    COMMENT 'Firebase 문서 ID (마이그레이션 임시 보관용)',
  region_code        VARCHAR(50)   NOT NULL                                COMMENT '지역 코드 (공업/주거/민감/상업)',
  phase_code         VARCHAR(50)   NOT NULL                                COMMENT '공정 단계 코드 (착공전/토공/골조/마감/준공)',
  cause_content      TEXT          NOT NULL                                COMMENT '민원 상세 내용 (발생 원인)',
  action_content     TEXT          NOT NULL                                COMMENT '민원 대응 지식 (조치 방안)',
  use_yn             CHAR(1)       NOT NULL DEFAULT 'Y'                    COMMENT '사용 여부 (Y/N)',
  deleted_yn         CHAR(1)       NOT NULL DEFAULT 'N'                    COMMENT '삭제 여부 (Y/N)',
  deleted_at         DATETIME      NULL                                    COMMENT '삭제 일시 (KST)',
  deleted_by         VARCHAR(100)  NULL                                    COMMENT '삭제자',
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP      COMMENT '생성일시 (KST)',
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                            ON UPDATE CURRENT_TIMESTAMP    COMMENT '수정일시 (KST)',
  created_by         VARCHAR(100)  NULL                                    COMMENT '생성자',
  updated_by         VARCHAR(100)  NULL                                    COMMENT '수정자',
  PRIMARY KEY (response_guide_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='민원 대응 방안 지식 (지역/단계별 원인 및 조치 안내)';


-- ============================================================
-- 11. 대응 방안 유형 테이블 (배열 정규화)
-- ============================================================
-- 대응 방안 1건에 연결된 민원 유형 목록을 관리하는 테이블
-- Firebase responseGuides.type 배열을 별도 테이블로 분리
CREATE TABLE tb_response_guide_type (
  response_guide_type_id  BIGINT        NOT NULL AUTO_INCREMENT            COMMENT 'PK',
  response_guide_id       BIGINT        NOT NULL                           COMMENT 'tb_response_guide FK', -- [FK: 개발자 결정] REFERENCES tb_response_guide(response_guide_id)
  type_code               VARCHAR(50)   NOT NULL                           COMMENT '민원 유형 코드 (소음/진동/교통/낙진 등)',
  created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시 (KST)',
  updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                 ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시 (KST)',
  created_by              VARCHAR(100)  NULL                               COMMENT '생성자',
  updated_by              VARCHAR(100)  NULL                               COMMENT '수정자',
  PRIMARY KEY (response_guide_type_id),
  UNIQUE KEY uk_guide_type (response_guide_id, type_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='대응 방안별 민원 유형 (한 방안에 여러 유형 선택 가능)';


-- ============================================================
-- 12. 보상 사례 테이블
-- ============================================================
-- 과거 민원 보상 처리 사례를 관리하는 테이블
-- Firebase caseExamples 컬렉션에 해당
CREATE TABLE tb_case_example (
  case_example_id      BIGINT          NOT NULL AUTO_INCREMENT             COMMENT 'PK',
  firebase_id          VARCHAR(100)    NULL                                COMMENT 'Firebase 문서 ID (마이그레이션 임시 보관용)',
  site_name            VARCHAR(200)    NOT NULL                            COMMENT '현장명',
  region_code          VARCHAR(50)     NOT NULL                            COMMENT '지역 코드 (공업/주거/민감/상업)',
  phase_code           VARCHAR(50)     NOT NULL                            COMMENT '공정 단계 코드 (착공전/토공/골조/마감/준공)',
  complainant          VARCHAR(500)    NOT NULL                            COMMENT '민원인 정보',
  complaint_content    TEXT            NULL                                COMMENT '민원 내용',
  -- [확인 필요: 4번 항목] Firebase에서 문자열로 저장됨. DATE 변환 필요 시 데이터 정제 필요
  occurrence_date      VARCHAR(20)     NULL                                COMMENT '민원 발생일 (예: 2025-09-17, 형식 확인 필요)',
  progress_code        VARCHAR(30)     NULL                                COMMENT '진행 상태 코드 (접수/진행/종결)',
  details_content      TEXT            NULL                                COMMENT '사례 상세 내용',
  compensation_method  VARCHAR(50)     NULL                                COMMENT '보상 방법 코드 (미보상/과태료/시설보수/현물보상 등)',
  -- 금액은 DECIMAL 사용 필수 (FLOAT/DOUBLE 절대 금지 - 소수점 계산 오차 발생)
  -- [확인 필요: 8번 항목] 원화는 소수점 없음 → DECIMAL(15,0) 으로 변경 가능
  compensation_amount  DECIMAL(15, 2)  NOT NULL DEFAULT 0.00              COMMENT '보상 금액 (단위: 원)',
  use_yn               CHAR(1)         NOT NULL DEFAULT 'Y'               COMMENT '사용 여부 (Y/N)',
  deleted_yn           CHAR(1)         NOT NULL DEFAULT 'N'               COMMENT '삭제 여부 (Y/N)',
  deleted_at           DATETIME        NULL                                COMMENT '삭제 일시 (KST)',
  deleted_by           VARCHAR(100)    NULL                                COMMENT '삭제자',
  created_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시 (KST)',
  updated_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시 (KST)',
  created_by           VARCHAR(100)    NULL                                COMMENT '생성자',
  updated_by           VARCHAR(100)    NULL                                COMMENT '수정자',
  PRIMARY KEY (case_example_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='보상 사례 (과거 민원 처리 결과 사례집)';


-- ============================================================
-- 13. 보상 사례 유형 테이블 (배열 정규화)
-- ============================================================
-- 보상 사례 1건에 연결된 민원 유형 목록을 관리하는 테이블
-- Firebase caseExamples.type 배열을 별도 테이블로 분리
CREATE TABLE tb_case_example_type (
  case_example_type_id  BIGINT        NOT NULL AUTO_INCREMENT              COMMENT 'PK',
  case_example_id       BIGINT        NOT NULL                             COMMENT 'tb_case_example FK', -- [FK: 개발자 결정] REFERENCES tb_case_example(case_example_id)
  type_code             VARCHAR(50)   NOT NULL                             COMMENT '민원 유형 코드 (소음/진동/교통 등)',
  created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP   COMMENT '생성일시 (KST)',
  updated_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                               ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시 (KST)',
  created_by            VARCHAR(100)  NULL                                 COMMENT '생성자',
  updated_by            VARCHAR(100)  NULL                                 COMMENT '수정자',
  PRIMARY KEY (case_example_type_id),
  UNIQUE KEY uk_case_type (case_example_id, type_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='보상 사례별 민원 유형 (한 사례에 여러 유형 선택 가능)';


-- ============================================================
-- 14. 보상 사례 요청 유형 테이블 (배열 정규화)
-- ============================================================
-- 보상 사례 1건에 연결된 요청 유형 목록을 관리하는 테이블
-- Firebase caseExamples.requestContent 배열을 별도 테이블로 분리
-- 요청 유형 예시: 정신적피해보상, 영업피해보상, 재산피해보상, 분쟁조정, 대인피해보상, 행정처분
CREATE TABLE tb_case_example_request (
  case_example_request_id  BIGINT        NOT NULL AUTO_INCREMENT           COMMENT 'PK',
  case_example_id          BIGINT        NOT NULL                          COMMENT 'tb_case_example FK', -- [FK: 개발자 결정] REFERENCES tb_case_example(case_example_id)
  request_code             VARCHAR(100)  NOT NULL                          COMMENT '요청 유형 코드 (정신적피해보상/영업피해보상 등)',
  created_at               DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시 (KST)',
  updated_at               DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                  ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시 (KST)',
  created_by               VARCHAR(100)  NULL                              COMMENT '생성자',
  updated_by               VARCHAR(100)  NULL                              COMMENT '수정자',
  PRIMARY KEY (case_example_request_id),
  UNIQUE KEY uk_case_request (case_example_id, request_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='보상 사례별 요청 유형 (정신적피해보상/분쟁조정 등)';


-- ============================================================
-- 15. 조치방안 링크 테이블
-- ============================================================
-- 민원 조치 시 참조할 외부 링크(쉐어포인트 등)를 관리하는 테이블
-- Firebase actionPlanLinks 컬렉션에 해당
CREATE TABLE tb_action_plan (
  action_plan_id  BIGINT        NOT NULL AUTO_INCREMENT                    COMMENT 'PK',
  firebase_id     VARCHAR(100)  NULL                                       COMMENT 'Firebase 문서 ID (마이그레이션 임시 보관용)',
  plan_title      VARCHAR(500)  NOT NULL                                   COMMENT '조치방안명 (예: 통제원 배치)',
  plan_url        VARCHAR(2000) NULL                                       COMMENT '참조 URL (쉐어포인트 링크 등)',
  use_yn          CHAR(1)       NOT NULL DEFAULT 'Y'                       COMMENT '사용 여부 (Y/N)',
  deleted_yn      CHAR(1)       NOT NULL DEFAULT 'N'                       COMMENT '삭제 여부 (Y/N)',
  deleted_at      DATETIME      NULL                                       COMMENT '삭제 일시 (KST)',
  deleted_by      VARCHAR(100)  NULL                                       COMMENT '삭제자',
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP         COMMENT '생성일시 (KST)',
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP       COMMENT '수정일시 (KST)',
  created_by      VARCHAR(100)  NULL                                       COMMENT '생성자',
  updated_by      VARCHAR(100)  NULL                                       COMMENT '수정자',
  PRIMARY KEY (action_plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='조치방안 링크 (민원 대응 시 참조하는 외부 문서 링크)';


-- ============================================================
-- 16. 조치방안 유형 테이블 (배열 정규화)
-- ============================================================
-- 조치방안 1건에 연결된 민원 유형 목록을 관리하는 테이블
-- Firebase actionPlanLinks.types 배열을 별도 테이블로 분리
CREATE TABLE tb_action_plan_type (
  action_plan_type_id  BIGINT        NOT NULL AUTO_INCREMENT               COMMENT 'PK',
  action_plan_id       BIGINT        NOT NULL                              COMMENT 'tb_action_plan FK', -- [FK: 개발자 결정] REFERENCES tb_action_plan(action_plan_id)
  type_code            VARCHAR(50)   NOT NULL                              COMMENT '민원 유형 코드 (교통/소음/진동 등)',
  created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP    COMMENT '생성일시 (KST)',
  updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP  COMMENT '수정일시 (KST)',
  created_by           VARCHAR(100)  NULL                                  COMMENT '생성자',
  updated_by           VARCHAR(100)  NULL                                  COMMENT '수정자',
  PRIMARY KEY (action_plan_type_id),
  UNIQUE KEY uk_plan_type (action_plan_id, type_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='조치방안별 민원 유형 (한 조치방안에 여러 유형 선택 가능)';


-- ============================================================
-- 17. 대응방안 V2 테이블
-- ============================================================
-- 신규 버전 대응방안(카테고리/내용/쉐어포인트 URL 구조)을 관리하는 테이블
-- Firebase responsePlansV2 컬렉션에 해당
CREATE TABLE tb_response_plan_v2 (
  response_plan_v2_id  BIGINT        NOT NULL AUTO_INCREMENT               COMMENT 'PK',
  firebase_id          VARCHAR(100)  NULL                                  COMMENT 'Firebase 문서 ID (마이그레이션 임시 보관용)',
  category             VARCHAR(200)  NOT NULL                              COMMENT '구분/카테고리명',
  content              TEXT          NOT NULL                              COMMENT '주요 내용',
  share_point_url      VARCHAR(2000) NULL                                  COMMENT '쉐어포인트 URL',
  region_code          VARCHAR(50)   NOT NULL DEFAULT '전체'               COMMENT '지역 코드 (전체/공업/주거/민감/상업)',
  stage_code           VARCHAR(50)   NOT NULL DEFAULT '전체'               COMMENT '단계 코드 (전체/착공전/토공/골조/마감/준공)',
  use_yn               CHAR(1)       NOT NULL DEFAULT 'Y'                  COMMENT '사용 여부 (Y/N)',
  deleted_yn           CHAR(1)       NOT NULL DEFAULT 'N'                  COMMENT '삭제 여부 (Y/N)',
  deleted_at           DATETIME      NULL                                  COMMENT '삭제 일시 (KST)',
  deleted_by           VARCHAR(100)  NULL                                  COMMENT '삭제자',
  created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP    COMMENT '생성일시 (KST)',
  updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP  COMMENT '수정일시 (KST)',
  created_by           VARCHAR(100)  NULL                                  COMMENT '생성자',
  updated_by           VARCHAR(100)  NULL                                  COMMENT '수정자',
  PRIMARY KEY (response_plan_v2_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='대응방안 V2 (신규 버전 대응방안 관리)';


-- ============================================================
-- 18. 대응방안 V2 유형 테이블 (배열 정규화)
-- ============================================================
-- V2 대응방안 1건에 연결된 민원 유형 목록을 관리하는 테이블
-- Firebase responsePlansV2.type 배열을 별도 테이블로 분리
CREATE TABLE tb_response_plan_v2_type (
  response_plan_v2_type_id  BIGINT        NOT NULL AUTO_INCREMENT          COMMENT 'PK',
  response_plan_v2_id       BIGINT        NOT NULL                         COMMENT 'tb_response_plan_v2 FK', -- [FK: 개발자 결정] REFERENCES tb_response_plan_v2(response_plan_v2_id)
  type_code                 VARCHAR(50)   NOT NULL                         COMMENT '민원 유형 코드',
  created_at                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시 (KST)',
  updated_at                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                   ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시 (KST)',
  created_by                VARCHAR(100)  NULL                             COMMENT '생성자',
  updated_by                VARCHAR(100)  NULL                             COMMENT '수정자',
  PRIMARY KEY (response_plan_v2_type_id),
  UNIQUE KEY uk_plan_v2_type (response_plan_v2_id, type_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='V2 대응방안별 민원 유형';


-- ============================================================
-- 19. 참고자료 카테고리 테이블
-- ============================================================
-- 민원 대응 시 활용하는 문서 자료의 카테고리(구분) 정보를 관리하는 테이블
-- Firebase references 컬렉션에 해당 (언제/누가/왜 사용하는지 설명 포함)
CREATE TABLE tb_reference (
  reference_id  BIGINT        NOT NULL AUTO_INCREMENT                      COMMENT 'PK',
  firebase_id   VARCHAR(100)  NULL                                         COMMENT 'Firebase 문서 ID (마이그레이션 임시 보관용)',
  ref_title     VARCHAR(200)  NOT NULL                                     COMMENT '참고자료 제목 (문서 구분명, 예: 민원 일지)',
  use_when      TEXT          NULL                                         COMMENT '언제 사용하는지 설명 (예: 민원 접수 즉시)',
  written_by    VARCHAR(200)  NULL                                         COMMENT '누가 작성하는지 설명 (예: 민원 접수자)',
  purpose_why   TEXT          NULL                                         COMMENT '왜 작성하는지 설명 (예: 분쟁 발생 시 증빙)',
  use_yn        CHAR(1)       NOT NULL DEFAULT 'Y'                         COMMENT '사용 여부 (Y/N)',
  deleted_yn    CHAR(1)       NOT NULL DEFAULT 'N'                         COMMENT '삭제 여부 (Y/N)',
  deleted_at    DATETIME      NULL                                         COMMENT '삭제 일시 (KST)',
  deleted_by    VARCHAR(100)  NULL                                         COMMENT '삭제자',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP           COMMENT '생성일시 (KST)',
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP         COMMENT '수정일시 (KST)',
  created_by    VARCHAR(100)  NULL                                         COMMENT '생성자',
  updated_by    VARCHAR(100)  NULL                                         COMMENT '수정자',
  PRIMARY KEY (reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='참고자료 카테고리 (민원 대응용 문서 구분 및 설명)';


-- ============================================================
-- 20. 참고자료 파일 테이블 (배열 정규화)
-- ============================================================
-- 참고자료 카테고리별 양식 파일 및 예시 파일을 관리하는 테이블
-- Firebase references.forms / references.examples 배열을 별도 테이블로 분리
-- [확인 필요: 3번 항목] 현재 Firebase Storage URL 사용 중 → MySQL 전환 시 파일 스토리지 결정 필요
CREATE TABLE tb_reference_file (
  reference_file_id  BIGINT        NOT NULL AUTO_INCREMENT                 COMMENT 'PK',
  reference_id       BIGINT        NOT NULL                                COMMENT 'tb_reference FK', -- [FK: 개발자 결정] REFERENCES tb_reference(reference_id)
  file_type          VARCHAR(20)   NOT NULL                                COMMENT '파일 유형 (FORM: 양식 템플릿, EXAMPLE: 작성 예시)',
  file_name          VARCHAR(500)  NOT NULL                                COMMENT '원본 파일명',
  file_url           VARCHAR(2000) NULL                                    COMMENT '파일 URL (Firebase Storage 또는 S3 등)',
  sort_order         INT           NOT NULL DEFAULT 0                      COMMENT '표시 순서',
  use_yn             CHAR(1)       NOT NULL DEFAULT 'Y'                    COMMENT '사용 여부 (Y/N)',
  deleted_yn         CHAR(1)       NOT NULL DEFAULT 'N'                    COMMENT '삭제 여부 (Y/N)',
  deleted_at         DATETIME      NULL                                    COMMENT '삭제 일시 (KST)',
  deleted_by         VARCHAR(100)  NULL                                    COMMENT '삭제자',
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP      COMMENT '생성일시 (KST)',
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                            ON UPDATE CURRENT_TIMESTAMP    COMMENT '수정일시 (KST)',
  created_by         VARCHAR(100)  NULL                                    COMMENT '생성자',
  updated_by         VARCHAR(100)  NULL                                    COMMENT '수정자',
  PRIMARY KEY (reference_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='참고자료 파일 (양식 템플릿 및 작성 예시 파일 관리)';


-- ============================================================
-- 21. 참고 사이트 링크 테이블
-- ============================================================
-- 우측 사이드바에 표시할 외부 참고 사이트 링크를 관리하는 테이블
-- Firebase settings/references.sites 배열을 별도 테이블로 분리
CREATE TABLE tb_reference_site (
  reference_site_id  BIGINT        NOT NULL AUTO_INCREMENT                 COMMENT 'PK',
  site_title         VARCHAR(200)  NOT NULL                                COMMENT '사이트 표시명 (예: 국토교통부)',
  site_url           VARCHAR(2000) NOT NULL                                COMMENT '사이트 URL',
  sort_order         INT           NOT NULL DEFAULT 0                      COMMENT '표시 순서',
  use_yn             CHAR(1)       NOT NULL DEFAULT 'Y'                    COMMENT '사용 여부 (Y/N)',
  deleted_yn         CHAR(1)       NOT NULL DEFAULT 'N'                    COMMENT '삭제 여부 (Y/N)',
  deleted_at         DATETIME      NULL                                    COMMENT '삭제 일시 (KST)',
  deleted_by         VARCHAR(100)  NULL                                    COMMENT '삭제자',
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP      COMMENT '생성일시 (KST)',
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                            ON UPDATE CURRENT_TIMESTAMP    COMMENT '수정일시 (KST)',
  created_by         VARCHAR(100)  NULL                                    COMMENT '생성자',
  updated_by         VARCHAR(100)  NULL                                    COMMENT '수정자',
  PRIMARY KEY (reference_site_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='참고 사이트 링크 (우측 사이드바에 표시되는 외부 링크)';


-- ============================================================
-- 22. 시스템 설정 테이블
-- ============================================================
-- 시스템 전반의 운영 설정값을 키-값 구조로 관리하는 테이블
-- Firebase settings/system 문서에 해당 (예: 민원 대응 절차 메뉴 노출 여부)
CREATE TABLE tb_system_setting (
  system_setting_id  BIGINT        NOT NULL AUTO_INCREMENT                 COMMENT 'PK',
  setting_key        VARCHAR(100)  NOT NULL                                COMMENT '설정 키 (예: IS_PROCESS_MENU_ENABLED)',
  setting_value      VARCHAR(1000) NULL                                    COMMENT '설정 값 (예: true / false / 텍스트)',
  description        VARCHAR(500)  NULL                                    COMMENT '설정 항목 설명',
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP      COMMENT '생성일시 (KST)',
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                            ON UPDATE CURRENT_TIMESTAMP    COMMENT '수정일시 (KST)',
  created_by         VARCHAR(100)  NULL                                    COMMENT '생성자',
  updated_by         VARCHAR(100)  NULL                                    COMMENT '수정자',
  PRIMARY KEY (system_setting_id),
  UNIQUE KEY uk_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='시스템 설정 (메뉴 노출 여부 등 운영 설정 키-값 관리)';


-- ============================================================
-- 23. 민원 대응 절차 이미지 테이블
-- ============================================================
-- 민원 대응 절차를 설명하는 이미지를 관리하는 테이블
-- Firebase settings/procedure 문서에 해당
-- [확인 필요: 2번 항목] Base64 이미지는 용량 이슈 → S3 등 파일 스토리지 이전 강력 권장
CREATE TABLE tb_procedure_image (
  procedure_image_id  BIGINT        NOT NULL AUTO_INCREMENT                COMMENT 'PK',
  image_data          MEDIUMTEXT    NULL                                   COMMENT 'Base64 이미지 데이터 (파일 스토리지 이전 전 임시 사용)',
  image_url           VARCHAR(2000) NULL                                   COMMENT '이미지 파일 URL (파일 스토리지 이전 후 사용)',
  use_yn              CHAR(1)       NOT NULL DEFAULT 'Y'                   COMMENT '사용 여부 (Y/N)',
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP     COMMENT '생성일시 (KST)',
  updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                             ON UPDATE CURRENT_TIMESTAMP   COMMENT '수정일시 (KST)',
  created_by          VARCHAR(100)  NULL                                   COMMENT '생성자',
  updated_by          VARCHAR(100)  NULL                                   COMMENT '수정자',
  PRIMARY KEY (procedure_image_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='민원 대응 절차 이미지 (절차 안내 이미지 단건 관리)';


-- ============================================================
-- 24. 활동 로그 테이블
-- ============================================================
-- 관리자/매니저의 데이터 생성/수정/삭제 작업 이력을 기록하는 감사 로그 테이블
-- Firebase activity_logs 컬렉션에 해당 (append-only, 수정/삭제 없음)
CREATE TABLE tb_activity_log (
  activity_log_id   BIGINT        NOT NULL AUTO_INCREMENT                  COMMENT 'PK',
  actor_email       VARCHAR(255)  NOT NULL                                 COMMENT '작업자 이메일',
  actor_name        VARCHAR(100)  NOT NULL                                 COMMENT '작업자 이름',
  action_code       VARCHAR(20)   NOT NULL                                 COMMENT '작업 유형 (CREATE / UPDATE / DELETE)',
  target_site_name  VARCHAR(200)  NULL                                     COMMENT '대상 현장명 또는 기능명',
  target_id         VARCHAR(200)  NULL                                     COMMENT '대상 레코드 ID',
  detail_content    TEXT          NULL                                     COMMENT '작업 상세 내용',
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP       COMMENT '생성일시 (KST)',
  -- 감사 로그는 append-only: updated_at, created_by 등 변경 추적 컬럼 미적용
  PRIMARY KEY (activity_log_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='활동 로그 (관리자 데이터 변경 이력, append-only)';


-- ============================================================
-- 25. 문의/요청 테이블
-- ============================================================
-- 사용자가 관리자에게 보내는 자료 요청 및 문의 내용을 관리하는 테이블
-- Firebase inquiries 컬렉션에 해당
CREATE TABLE tb_inquiry (
  inquiry_id      BIGINT        NOT NULL AUTO_INCREMENT                    COMMENT 'PK',
  firebase_id     VARCHAR(100)  NULL                                       COMMENT 'Firebase 문서 ID (마이그레이션 임시 보관용)',
  user_master_id  BIGINT        NULL                                       COMMENT 'tb_user_master FK (작성자)', -- [FK: 개발자 결정] REFERENCES tb_user_master(user_master_id)
  user_email      VARCHAR(255)  NULL                                       COMMENT '작성자 이메일 (FK 없이 텍스트 보관)',
  user_name       VARCHAR(100)  NULL                                       COMMENT '작성자 이름 (FK 없이 텍스트 보관)',
  content         TEXT          NOT NULL                                   COMMENT '문의/요청 내용',
  status_code     VARCHAR(20)   NOT NULL DEFAULT 'PENDING'                 COMMENT '처리 상태 (PENDING: 대기중, RESOLVED: 완료)',
  deleted_yn      CHAR(1)       NOT NULL DEFAULT 'N'                       COMMENT '삭제 여부 (Y/N)',
  deleted_at      DATETIME      NULL                                       COMMENT '삭제 일시 (KST)',
  deleted_by      VARCHAR(100)  NULL                                       COMMENT '삭제자',
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP         COMMENT '생성일시 (KST)',
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP       COMMENT '수정일시 (KST)',
  created_by      VARCHAR(100)  NULL                                       COMMENT '생성자',
  updated_by      VARCHAR(100)  NULL                                       COMMENT '수정자',
  PRIMARY KEY (inquiry_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='문의/요청 (사용자가 관리자에게 보내는 자료 요청 및 문의)';


-- ============================================================
-- 인덱스 설계 (database.md 10번 항목 기준)
-- ============================================================
-- 실제 조회 패턴 확인 후 추가 여부를 결정합니다.

-- tb_case_example: 필터 검색 대상
CREATE INDEX idx_case_example_region   ON tb_case_example (region_code);
CREATE INDEX idx_case_example_phase    ON tb_case_example (phase_code);
CREATE INDEX idx_case_example_progress ON tb_case_example (progress_code);
CREATE INDEX idx_case_example_created  ON tb_case_example (created_at);

-- tb_site_complaint: FK 조회
CREATE INDEX idx_site_complaint_site_id ON tb_site_complaint (site_id);

-- tb_activity_log: 로그 조회
CREATE INDEX idx_activity_log_created     ON tb_activity_log (created_at);
CREATE INDEX idx_activity_log_actor_email ON tb_activity_log (actor_email);

-- tb_user_master: 로그인 조회
-- (이미 login_id에 UNIQUE KEY 설정됨 → 별도 인덱스 불필요)

-- tb_response_guide: 필터 검색 대상
CREATE INDEX idx_response_guide_region ON tb_response_guide (region_code);
CREATE INDEX idx_response_guide_phase  ON tb_response_guide (phase_code);
