-- [변경] 기존 tb_user_role.role_code 직접 저장 방식 제거
-- [변경] 역할 확장성을 위해 tb_role_master 신규 추가
CREATE TABLE tb_role_master (
  role_id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PK',
  role_code VARCHAR(50) NOT NULL COMMENT '역할 코드: SUPER_ADMIN / ADMIN / MANAGER / USER',
  role_name VARCHAR(100) NOT NULL COMMENT '역할명',
  sort_order INT NOT NULL DEFAULT 0,
  use_yn CHAR(1) NOT NULL DEFAULT 'Y',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id),
  UNIQUE KEY uk_role_code (role_code)
);

-- [신규] Firebase users 컬렉션 → MySQL 전환
-- login_id: 로그인 식별자, email: 실제 로그인 수단
-- password_hash: BCrypt 단방향 해시 저장 (평문 저장 절대 금지)
CREATE TABLE tb_user_master (
  user_master_id  BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK',
  firebase_id     VARCHAR(100)  NULL     COMMENT 'Firebase UID (마이그레이션용)',
  login_id        VARCHAR(100)  NOT NULL COMMENT '로그인 식별자',
  password_hash   VARCHAR(255)  NOT NULL COMMENT 'BCrypt 해시값 (평문 저장 절대 금지)',
  email           VARCHAR(255)  NOT NULL COMMENT '이메일 (실제 로그인 수단)',
  display_name    VARCHAR(100)  NULL     COMMENT '화면 표시명 (Firebase displayName)',
  name            VARCHAR(100)  NULL     COMMENT '실명 (Firebase name)',
  approved_yn     CHAR(1)       NOT NULL DEFAULT 'N' COMMENT '관리자 승인 여부',
  use_yn          CHAR(1)       NOT NULL DEFAULT 'Y',
  deleted_yn      CHAR(1)       NOT NULL DEFAULT 'N',
  deleted_at      DATETIME      NULL,
  deleted_by      VARCHAR(100)  NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by      VARCHAR(100)  NULL,
  updated_by      VARCHAR(100)  NULL,
  PRIMARY KEY (user_master_id),
  UNIQUE KEY uk_login_id (login_id),
  INDEX idx_user_email (email),
  INDEX idx_user_approved (approved_yn),
  INDEX idx_user_deleted_use (deleted_yn, use_yn)
);

-- [변경] tb_user_role.role_code 대신 role_id FK 사용
-- [변경] FK 실제 적용
CREATE TABLE tb_user_role (
  user_role_id BIGINT NOT NULL AUTO_INCREMENT,
  user_master_id BIGINT NOT NULL COMMENT '사용자 ID',
  role_id BIGINT NOT NULL COMMENT '역할 ID',
  use_yn CHAR(1) NOT NULL DEFAULT 'Y',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_role_id),
  UNIQUE KEY uk_user_role (user_master_id, role_id),
  CONSTRAINT fk_user_role_user FOREIGN KEY (user_master_id) REFERENCES tb_user_master(user_master_id),
  CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES tb_role_master(role_id)
);

-- [변경] 한글 코드값 직접 저장 방지
-- [변경] REGION_TYPE / PHASE / STATUS 등은 tb_code_master 기준 코드값 사용
-- 예: '진행중' 저장 X → 'IN_PROGRESS' 저장 O
CREATE TABLE tb_code_master (
  code_master_id BIGINT NOT NULL AUTO_INCREMENT,
  code_group_name VARCHAR(100) NOT NULL,
  code_value VARCHAR(100) NOT NULL,
  code_name VARCHAR(100) NOT NULL,
  description VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  use_yn CHAR(1) NOT NULL DEFAULT 'Y',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (code_master_id),
  UNIQUE KEY uk_code_group_value (code_group_name, code_value),
  INDEX idx_code_group (code_group_name)
);

-- [변경] region_type → region_type_code 로 명확화
-- [변경] '주거' 같은 한글값 대신 'RESIDENTIAL' 같은 코드 저장
CREATE TABLE tb_site (
  site_id BIGINT NOT NULL AUTO_INCREMENT,
  firebase_id VARCHAR(100) NULL,
  site_name VARCHAR(200) NOT NULL,
  region VARCHAR(200) NULL,
  region_type_code VARCHAR(100) NULL COMMENT 'REGION_TYPE 코드',
  completed_count INT NOT NULL DEFAULT 0,
  in_progress_count INT NOT NULL DEFAULT 0,
  main_content TEXT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  use_yn CHAR(1) NOT NULL DEFAULT 'Y',
  deleted_yn CHAR(1) NOT NULL DEFAULT 'N',
  deleted_at DATETIME NULL,
  deleted_by VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(100) NULL,
  updated_by VARCHAR(100) NULL,
  PRIMARY KEY (site_id),
  INDEX idx_site_region_type (region_type_code),
  INDEX idx_site_deleted_use (deleted_yn, use_yn)
);

-- [변경] site_id FK 실제 적용
CREATE TABLE tb_site_phase (
  site_phase_id BIGINT NOT NULL AUTO_INCREMENT,
  site_id BIGINT NOT NULL,
  phase_code VARCHAR(100) NOT NULL COMMENT 'PHASE 코드',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (site_phase_id),
  UNIQUE KEY uk_site_phase (site_id, phase_code),
  CONSTRAINT fk_site_phase_site FOREIGN KEY (site_id) REFERENCES tb_site(site_id)
);

-- [변경] image_data MEDIUMTEXT 제거
-- [변경] Base64 DB 저장 제거, image_url 백엔드 파일 스토리지 방식으로 변경
-- [변경] file_size, mime_type 추가
CREATE TABLE tb_site_image (
  site_image_id BIGINT NOT NULL AUTO_INCREMENT,
  firebase_id VARCHAR(100) NULL,
  site_id BIGINT NOT NULL,
  image_url VARCHAR(2000) NOT NULL COMMENT 'S3 또는 백엔드 파일 스토리지 URL',
  file_name VARCHAR(500) NOT NULL,
  file_size BIGINT NULL,
  mime_type VARCHAR(100) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (site_image_id),
  INDEX idx_site_image_site (site_id),
  CONSTRAINT fk_site_image_site FOREIGN KEY (site_id) REFERENCES tb_site(site_id)
);

-- [변경] complaint_number INT → VARCHAR(50)
-- [변경] 현장별 민원번호 형식 지원: SITE001-0001 등
-- [변경] status_code 기본값 '진행중' → 'IN_PROGRESS'
-- [변경] site_id FK 실제 적용
CREATE TABLE tb_site_complaint (
  site_complaint_id BIGINT NOT NULL AUTO_INCREMENT,
  firebase_id VARCHAR(100) NULL,
  site_id BIGINT NOT NULL,
  complaint_number VARCHAR(50) NOT NULL COMMENT '현장별 민원번호',
  complainant VARCHAR(500) NOT NULL,
  usage_info TEXT NULL,
  owner_info TEXT NULL,
  status_code VARCHAR(100) NOT NULL DEFAULT 'IN_PROGRESS' COMMENT 'COMPLAINT_STATUS 코드',
  stage_code VARCHAR(100) NULL,
  stage_occurrence TEXT NULL,
  stage_response TEXT NULL,
  stage_negotiation TEXT NULL,
  stage_agreement TEXT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  deleted_yn CHAR(1) NOT NULL DEFAULT 'N',
  deleted_at DATETIME NULL,
  deleted_by VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (site_complaint_id),
  UNIQUE KEY uk_site_complaint_number (site_id, complaint_number),
  INDEX idx_site_complaint_site_status (site_id, status_code),
  INDEX idx_site_complaint_stage (stage_code),
  CONSTRAINT fk_site_complaint_site FOREIGN KEY (site_id) REFERENCES tb_site(site_id)
);

-- [신규] Firebase actionPlanLinks 컬렉션 → MySQL 전환
-- 유형(다중)은 tb_action_plan_type으로 정규화, 지역/단계는 tb_response_plan_v2에 있음
-- tb_site_complaint_response_plan, tb_action_plan_type의 FK 참조 대상
CREATE TABLE tb_action_plan (
  action_plan_id  BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK',
  firebase_id     VARCHAR(100)  NULL     COMMENT 'Firebase 문서 ID (마이그레이션용)',
  plan_title      VARCHAR(500)  NOT NULL COMMENT '조치방안명',
  share_point_url VARCHAR(2000) NULL     COMMENT 'SharePoint 문서 링크',
  use_yn          CHAR(1)       NOT NULL DEFAULT 'Y',
  deleted_yn      CHAR(1)       NOT NULL DEFAULT 'N',
  deleted_at      DATETIME      NULL,
  deleted_by      VARCHAR(100)  NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by      VARCHAR(100)  NULL,
  updated_by      VARCHAR(100)  NULL,
  PRIMARY KEY (action_plan_id),
  INDEX idx_action_plan_deleted_use (deleted_yn, use_yn)
);

-- [확정 Q3] tb_action_plan은 tb_response_guide와 DB FK로 직접 연결하지 않음.
--          공통 유형 코드(tb_action_plan_type)로만 간접 연관. guide_id FK 없음.
-- [확정] plan_title = 조치방안명 (정식 컬럼, 유지). Firebase actionPlanLinks.title 매핑.
-- [주의] tb_action_plan이 먼저 생성되어야 FK 제약조건이 적용됩니다 (실행 순서 확인 필요)
CREATE TABLE tb_site_complaint_response_plan (
  complaint_response_plan_id BIGINT NOT NULL AUTO_INCREMENT,
  site_complaint_id BIGINT NOT NULL COMMENT 'tb_site_complaint FK',
  action_plan_id BIGINT NOT NULL COMMENT 'tb_action_plan FK (확정: ID 연결 방식)',
  plan_title VARCHAR(500) NULL COMMENT '마이그레이션 시 임시 사용, 이관 완료 후 제거 예정',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(100) NULL,
  updated_by VARCHAR(100) NULL,
  PRIMARY KEY (complaint_response_plan_id),
  UNIQUE KEY uk_complaint_response_plan (site_complaint_id, action_plan_id),
  INDEX idx_crp_action_plan (action_plan_id),
  CONSTRAINT fk_crp_complaint FOREIGN KEY (site_complaint_id) REFERENCES tb_site_complaint(site_complaint_id),
  CONSTRAINT fk_crp_action_plan FOREIGN KEY (action_plan_id) REFERENCES tb_action_plan(action_plan_id)
);

-- [변경] FK 실제 적용
CREATE TABLE tb_site_complaint_similar_case (
  similar_case_id BIGINT NOT NULL AUTO_INCREMENT,
  site_complaint_id BIGINT NOT NULL,
  case_text TEXT NOT NULL,
  case_url VARCHAR(2000) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (similar_case_id),
  INDEX idx_similar_case_complaint (site_complaint_id),
  CONSTRAINT fk_similar_case_complaint FOREIGN KEY (site_complaint_id)
    REFERENCES tb_site_complaint(site_complaint_id)
);

-- [변경] type_code 인덱스 추가
-- [변경] FK 실제 적용
CREATE TABLE tb_action_plan_type (
  action_plan_type_id BIGINT NOT NULL AUTO_INCREMENT,
  action_plan_id BIGINT NOT NULL,
  type_code VARCHAR(100) NOT NULL COMMENT 'COMPLAINT_TYPE 코드',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (action_plan_type_id),
  UNIQUE KEY uk_action_plan_type (action_plan_id, type_code),
  INDEX idx_action_plan_type_code (type_code),
  CONSTRAINT fk_action_plan_type_plan FOREIGN KEY (action_plan_id)
    REFERENCES tb_action_plan(action_plan_id)
);

-- [변경] region_code + phase_code 복합 인덱스 추가
CREATE TABLE tb_response_guide (
  response_guide_id BIGINT NOT NULL AUTO_INCREMENT,
  firebase_id VARCHAR(100) NULL,
  region_code VARCHAR(100) NOT NULL COMMENT 'REGION_TYPE 코드',
  phase_code VARCHAR(100) NOT NULL COMMENT 'PHASE 코드',
  cause_content TEXT NOT NULL,
  action_content TEXT NOT NULL,
  use_yn CHAR(1) NOT NULL DEFAULT 'Y',
  deleted_yn CHAR(1) NOT NULL DEFAULT 'N',
  deleted_at DATETIME NULL,
  deleted_by VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (response_guide_id),
  INDEX idx_response_guide_region_phase (region_code, phase_code),
  INDEX idx_response_guide_deleted_use (deleted_yn, use_yn)
);

-- [변경] occurrence_date VARCHAR(20) → DATE
-- [변경] compensation_amount DECIMAL(15,2) → DECIMAL(15,0)
-- [변경] 원화는 소수점 불필요
-- [변경] region_code + phase_code 복합 인덱스 추가
CREATE TABLE tb_case_example (
  case_example_id BIGINT NOT NULL AUTO_INCREMENT,
  firebase_id VARCHAR(100) NULL,
  site_name VARCHAR(200) NOT NULL,
  region_code VARCHAR(100) NOT NULL COMMENT 'REGION_TYPE 코드',
  phase_code VARCHAR(100) NOT NULL COMMENT 'PHASE 코드',
  complainant VARCHAR(500) NOT NULL,
  complaint_content TEXT NULL,
  occurrence_date DATE NULL COMMENT '민원 발생일',
  progress_code VARCHAR(100) NULL,
  details_content TEXT NULL,
  compensation_method VARCHAR(100) NULL,
  compensation_amount DECIMAL(15,0) NOT NULL DEFAULT 0 COMMENT '보상 금액 원화',
  use_yn CHAR(1) NOT NULL DEFAULT 'Y',
  deleted_yn CHAR(1) NOT NULL DEFAULT 'N',
  deleted_at DATETIME NULL,
  deleted_by VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (case_example_id),
  INDEX idx_case_example_region_phase (region_code, phase_code),
  INDEX idx_case_example_progress (progress_code),
  INDEX idx_case_example_occurrence_date (occurrence_date),
  INDEX idx_case_example_created (created_at),
  INDEX idx_case_example_deleted_use (deleted_yn, use_yn)
);

-- [변경] DEFAULT '전체' → DEFAULT 'ALL'
-- [변경] 한글 저장값 제거
-- [변경] region_code + stage_code 복합 인덱스 추가
CREATE TABLE tb_response_plan_v2 (
  response_plan_v2_id BIGINT NOT NULL AUTO_INCREMENT,
  firebase_id VARCHAR(100) NULL,
  category VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  share_point_url VARCHAR(2000) NULL,
  region_code VARCHAR(100) NOT NULL DEFAULT 'ALL',
  stage_code VARCHAR(100) NOT NULL DEFAULT 'ALL',
  use_yn CHAR(1) NOT NULL DEFAULT 'Y',
  deleted_yn CHAR(1) NOT NULL DEFAULT 'N',
  deleted_at DATETIME NULL,
  deleted_by VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (response_plan_v2_id),
  INDEX idx_response_plan_v2_region_stage (region_code, stage_code),
  INDEX idx_response_plan_v2_deleted_use (deleted_yn, use_yn)
);

-- [신규] Firebase references 컬렉션 → MySQL 전환
-- 파일(양식/예시)은 tb_reference_file(file_type: FORM/EXAMPLE)로 분리
-- when/who/why는 SQL 예약어 충돌 방지를 위해 컬럼명 변경
CREATE TABLE tb_reference (
  reference_id    BIGINT        NOT NULL AUTO_INCREMENT COMMENT 'PK',
  firebase_id     VARCHAR(100)  NULL     COMMENT 'Firebase 문서 ID (마이그레이션용)',
  title           VARCHAR(500)  NOT NULL COMMENT '구분 (문서 제목)',
  when_to_use     TEXT          NULL     COMMENT '언제 사용하나요?',
  who_writes      VARCHAR(500)  NULL     COMMENT '누가 작성하나요?',
  why_written     TEXT          NULL     COMMENT '왜 작성하나요? (중요성)',
  use_yn          CHAR(1)       NOT NULL DEFAULT 'Y',
  deleted_yn      CHAR(1)       NOT NULL DEFAULT 'N',
  deleted_at      DATETIME      NULL,
  deleted_by      VARCHAR(100)  NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by      VARCHAR(100)  NULL,
  updated_by      VARCHAR(100)  NULL,
  PRIMARY KEY (reference_id),
  INDEX idx_reference_deleted_use (deleted_yn, use_yn)
);

-- [변경] file_url NOT NULL
-- [변경] Firebase Storage/S3 URL 기준
-- [변경] file_size, mime_type 추가
-- [변경] FK 실제 적용
CREATE TABLE tb_reference_file (
  reference_file_id BIGINT NOT NULL AUTO_INCREMENT,
  reference_id BIGINT NOT NULL,
  file_type VARCHAR(20) NOT NULL COMMENT 'FORM / EXAMPLE',
  file_name VARCHAR(500) NOT NULL,
  file_url VARCHAR(2000) NOT NULL,
  file_size BIGINT NULL,
  mime_type VARCHAR(100) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  use_yn CHAR(1) NOT NULL DEFAULT 'Y',
  deleted_yn CHAR(1) NOT NULL DEFAULT 'N',
  deleted_at DATETIME NULL,
  deleted_by VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (reference_file_id),
  INDEX idx_reference_file_reference (reference_id),
  INDEX idx_reference_file_type (file_type),
  CONSTRAINT fk_reference_file_reference FOREIGN KEY (reference_id)
    REFERENCES tb_reference(reference_id)
);

-- [변경] image_data MEDIUMTEXT 제거
-- [변경] image_url 파일 스토리지 방식으로 변경
CREATE TABLE tb_procedure_image (
  procedure_image_id BIGINT NOT NULL AUTO_INCREMENT,
  image_url VARCHAR(2000) NOT NULL COMMENT 'S3 또는 파일 스토리지 URL',
  file_name VARCHAR(500) NULL,
  file_size BIGINT NULL,
  mime_type VARCHAR(100) NULL,
  use_yn CHAR(1) NOT NULL DEFAULT 'Y',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (procedure_image_id)
);

-- [변경] target_table, target_pk 추가
-- [변경] before_json, after_json 추가
-- [변경] 상세 감사 추적 가능
CREATE TABLE tb_activity_log (
  activity_log_id BIGINT NOT NULL AUTO_INCREMENT,
  actor_email VARCHAR(255) NOT NULL,
  actor_name VARCHAR(100) NOT NULL,
  action_code VARCHAR(20) NOT NULL COMMENT 'CREATE / UPDATE / DELETE / RESTORE',
  target_table VARCHAR(100) NOT NULL COMMENT '대상 테이블',
  target_pk VARCHAR(100) NULL COMMENT '대상 PK',
  target_site_name VARCHAR(200) NULL,
  target_id VARCHAR(200) NULL,
  detail_content TEXT NULL,
  before_json JSON NULL,
  after_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (activity_log_id),
  INDEX idx_activity_log_created (created_at),
  INDEX idx_activity_log_actor_email (actor_email),
  INDEX idx_activity_log_target (target_table, target_pk)
);

-- [신규 Phase 3.5-W] tb_case_example 배열 정규화 테이블
-- 유형(type)과 요청내용(request)을 정규화 분리. tb_case_example FK 실제 적용.

CREATE TABLE tb_case_example_type (
  case_example_type_id BIGINT NOT NULL AUTO_INCREMENT,
  case_example_id      BIGINT NOT NULL COMMENT 'tb_case_example FK',
  type_code            VARCHAR(100) NOT NULL COMMENT 'COMPLAINT_TYPE 코드',
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (case_example_type_id),
  UNIQUE KEY uk_case_example_type (case_example_id, type_code),
  INDEX idx_case_example_type_code (type_code),
  CONSTRAINT fk_case_example_type_case
    FOREIGN KEY (case_example_id) REFERENCES tb_case_example(case_example_id)
);

CREATE TABLE tb_case_example_request (
  case_example_request_id BIGINT NOT NULL AUTO_INCREMENT,
  case_example_id         BIGINT NOT NULL COMMENT 'tb_case_example FK',
  request_content         TEXT NOT NULL COMMENT '요청 내용',
  sort_order              INT NOT NULL DEFAULT 0 COMMENT '입력 순서',
  created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (case_example_request_id),
  INDEX idx_case_example_request_case (case_example_id),
  CONSTRAINT fk_case_example_request_case
    FOREIGN KEY (case_example_id) REFERENCES tb_case_example(case_example_id)
);
-- [신규 Phase 3.4-SS] tb_system_setting — 시스템 설정 (키-값 방식)
-- Firebase settings 컬렉션(system/procedure/references 문서의 자유 필드) → 키-값 행으로 전환
-- 예: MAIN_IMAGE_URL, MAIN_PAGE_THEME, IS_PROCESS_MENU_ENABLED
-- 접근 권한: ADMIN 전용 (security.md 3번 권한표)
CREATE TABLE tb_system_setting (
  system_setting_id BIGINT       NOT NULL AUTO_INCREMENT COMMENT 'PK',
  setting_key       VARCHAR(100) NOT NULL COMMENT '설정 키 (예: MAIN_IMAGE_URL)',
  setting_value     TEXT         NULL     COMMENT '설정 값 (URL/테마명/true·false 등 문자열 저장)',
  description       VARCHAR(500) NULL     COMMENT '설정 용도 설명',
  use_yn            CHAR(1)      NOT NULL DEFAULT 'Y',
  deleted_yn        CHAR(1)      NOT NULL DEFAULT 'N',
  deleted_at        DATETIME     NULL,
  deleted_by        VARCHAR(100) NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by        VARCHAR(100) NULL,
  updated_by        VARCHAR(100) NULL,
  PRIMARY KEY (system_setting_id),
  UNIQUE KEY uk_system_setting_key (setting_key),
  INDEX idx_system_setting_deleted_use (deleted_yn, use_yn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
