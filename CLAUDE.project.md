# 민원대응 통합 플랫폼 — 프로젝트 지침 (Firebase → Spring Boot 리팩토링)

> 이 문서는 **이 프로젝트에만 적용되는 규칙**이며, 전역 `~/.claude/CLAUDE.md`보다 우선한다.
> (전역 CLAUDE.md 우선순위 규칙: 프로젝트별 CLAUDE.md > 전역 CLAUDE.md > 기본 동작)
> 전역 표준 및 `docs/`의 규칙 문서(security.md, database.md, code-style.md, testing.md)는
> 아래에서 별도로 덮어쓰지 않는 한 그대로 준수한다.

---

## 1. 프로젝트 개요

- 기존: Firebase(Firestore + Authentication) 기반 운영 서비스 (main 브랜치, 배포 중)
- 목표: Spring Boot + MySQL 백엔드로 리팩토링 (refactoring 브랜치에서 작업)
- 작업 주체: 비개발자(기획/운영) + Claude(Claude Code 보조), 개발자는 규칙 수립 및 사후 검토 담당
- 저장소: dx-team-lab 조직 / 검토·작업 대상 브랜치는 **refactoring**

---

## 2. ⚠️ 개발자 검토 방식에 대한 합의 (2026-07, 개발자 협의 결과)

**핵심: 매 단계 개발자 대면 검토는 생략한다. 단, 문서의 규칙 자체는 그대로 준수한다.**

### 배경
`docs/security.md`, `docs/testing.md`는 원래 보안·DB 항목마다
"**개발자 검토 완료 ☐**"를 PASS 필수 조건으로 규정하고 있었다.
개발자와 협의한 결과, 매 단계마다 개발자에게 대면 확인을 받는 절차는
진행 효율을 크게 떨어뜨리므로 생략하기로 했다.

### 그래서 이렇게 진행한다
1. **규칙은 그대로 지킨다.** security.md의 6개 보안 규칙(CORS, JWT, 권한, 트랜잭션,
   민감정보 마스킹, 비밀번호 해시), database.md 설계 규칙, code-style, 논리삭제,
   공통 감사 컬럼 등은 지금까지처럼 전부 준수한다. **"검토를 뺀다"는 "규칙을 뺀다"가 아니다.**
2. **"개발자 검토 완료" 항목은 AI(Claude)가 문서 기준으로 자체 검증**하고,
   그 결과를 명확히 기록한다.
3. 단, 원래 개발자 검토가 필요했던 항목은 **"검토 대기(개발자 사후 확인 필요)"로 표시**해 둔다.
   삭제하거나 "완료"로 위장하지 않는다. 운영 배포 전 또는 개발자가 시간이 날 때 **일괄 검토**한다.
4. **잘못되면 실제 피해(데이터 유출 등)로 직결되는 보안 결정**은 그냥 넘어가지 않고,
   진행 시점에 "이건 원래 개발자 검토 항목이며 이렇게 처리했다"고 명시적으로 남긴다.

### 검토를 미루지 말고 반드시 확인해야 하는 예외
아래는 효율과 무관하게, 운영 반영 전 개발자 확인을 **강하게 권장**한다.
- 민감정보 마스킹(보상금액·품의링크)의 실제 적용 (security.md 5번)
- 역할별 접근 권한(ADMIN/MANAGER) 최종 규칙
- 운영용 CORS 허용 Origin, JWT 만료·시크릿 정책
- 테스트 계정/초기 데이터의 운영 제거 여부

---

## 3. 운영 전 반드시 처리할 "보안 부채" (리팩토링 중 임시로 남겨둔 것)

| # | 항목 | 현재 상태 | 운영 전 조치 |
|---|------|-----------|-------------|
| 1 | 테스트 계정 (admin/manager, 약한 비번) | InitDataRunner 자동 생성, @Profile("!prod") | prod 프로파일 확실히 적용 + 클래스 제거 권장 |
| 2 | 회원가입 자동승인 | UserMaster.create()가 approvedYn="Y" 하드코딩 | 실제 회원가입엔 'N' + ADMIN 승인 분리 |
| 3 | 민감정보 마스킹 미적용 | 사례/응답 DTO에 TODO 주석만 | MANAGER 마스킹 실제 구현 (security.md 5번) |
| 4 | 사용자 삭제 반쪽 처리 | (기존 Firebase) 앱 삭제가 Auth 계정 미삭제 | 백엔드 삭제 API에서 인증+데이터 함께 삭제 |
| 5 | 정규화 테이블 FK 방식 | tb_case_example_type/request에 FK 제약 적용 | database.md 4번(FK 적용 여부는 개발자 결정) 사후 확인 |
| 6 | Refresh Token 부재 | Access Token(1h)만 발급 | 재로그인 UX/보안 정책 결정 |

> 이 표는 리팩토링이 진행되며 갱신한다. 항목이 해결되면 처리 일자와 함께 기록한다.

---

## 4. 진행 리듬 (매 작업 공통)

1. 작업 단위는 작게(도메인/기능 단위). 한 번에 몰아치지 않는다.
2. 각 단계: 코드 작성 → 서버 기동 → 실제 호출 검증(PowerShell/MySQL) → 커밋·푸시.
3. **커밋 전 `.env`가 스테이징에 없는지 반드시 확인**한다(`git diff --staged --name-only`).
   `.env`에는 DB 비밀번호·JWT_SECRET이 있으므로 절대 커밋 금지. (`git add .` 금지, 파일 개별 add)
4. 보안 관련 커밋 메시지에는 "검토 대기" 표기를 남긴다.
5. 새 파일(컨트롤러/엔티티 등) 추가 후 경로를 못 찾으면 `./gradlew clean bootRun`으로 재시작한다.

---

## 5. 로컬 서버 기동 절차 (환경변수 주입)

새 터미널에서 서버를 켤 때는 반드시 환경변수를 먼저 주입한다.
`JWT_SECRET`은 값에 `=`가 포함되어 일반 로드로는 잘리므로 별도 주입한다.

```powershell
cd "C:\Users\user\Documents\민원 대응 지식 플랫폼\backend"

# .env 전체 로드
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim())
    }
}
# JWT_SECRET 은 = 때문에 통째로 재주입
$line = Get-Content .env | Where-Object { $_ -match '^JWT_SECRET=' }
[System.Environment]::SetEnvironmentVariable('JWT_SECRET', ($line -replace '^JWT_SECRET=', ''))

# 확인 (둘 다 값이 나와야 함)
echo "USER: $env:DB_USERNAME"; echo "JWT_LEN: $($env:JWT_SECRET.Length)"

# 기동 (새 파일 추가 시 clean 포함)
./gradlew clean bootRun
```

- 포트 8080 사용 중 에러 시:
  `Get-NetTCPConnection -LocalPort 8080 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`
- DB 이름은 `minwontalk` (application.yml의 DB_URL 기준)

---

## 6. 리팩토링 진행 현황 (스냅샷 — 갱신 대상)

| 단계 | 내용 | 상태 |
|------|------|------|
| 3.0 | Spring Boot 토대 + DB 연결 | ✅ |
| 3.1 | 엔티티 매핑 (19개) | ✅ |
| 3.2 | 보안코어 (BCrypt / 로그인·JWT / 검증필터 / CORS·역할권한) | ✅ 코드완료, 검토 대기 |
| 3.3 | 본보기 도메인 CRUD (현장 Site) | ✅ |
| 3.4 | 도메인 복제 — 사례(CaseExample) 조회+쓰기+정규화배열 | ✅ (마스킹 미적용) |
| 3.4 | 도메인 복제 — 대응가이드(ResponseGuide) | 🟡 검증 진행 중 |
| 3.5 | 통합 검증 | ⬜ |

> 남은 도메인(참고자료, 현장민원, 시스템설정, 문의 등)은 위 패턴으로 복제한다.
> 마스킹(보안 5번)은 개발자 확인 후 일괄 적용 예정.
