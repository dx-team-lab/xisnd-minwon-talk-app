# ================================================
# 민원플랫폼 백엔드 로컬 실행 스크립트 (run-dev.ps1)
# 사용법: backend 폴더에서  ./run-dev.ps1  실행
# 하는 일: .env 주입 → JWT_SECRET 별도 주입 → 확인 → 서버 기동
# ================================================

Write-Host "[1/4] .env 환경변수 로드 중..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    Write-Host "  .env 파일이 없습니다. backend 폴더에서 실행했는지 확인하세요." -ForegroundColor Red
    exit 1
}
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim())
    }
}

Write-Host "[2/4] JWT_SECRET 별도 주입 중... (= 포함 값 보정)" -ForegroundColor Cyan
$line = Get-Content .env | Where-Object { $_ -match '^JWT_SECRET=' }
if ($line) {
    [System.Environment]::SetEnvironmentVariable('JWT_SECRET', ($line -replace '^JWT_SECRET=', ''))
}

Write-Host "[3/4] 환경변수 확인:" -ForegroundColor Cyan
Write-Host ("      DB_USERNAME = " + $env:DB_USERNAME)
Write-Host ("      JWT_SECRET 길이 = " + $env:JWT_SECRET.Length)

if ([string]::IsNullOrEmpty($env:DB_USERNAME) -or $env:JWT_SECRET.Length -eq 0) {
    Write-Host "  환경변수 주입 실패. .env 내용을 확인하세요." -ForegroundColor Red
    exit 1
}

# 8080 포트를 이미 쓰는 이전 서버가 있으면 정리
$busy = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if ($busy) {
    Write-Host "  포트 8080 사용 중 → 이전 서버 종료" -ForegroundColor Yellow
    $busy | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
}

Write-Host "[4/4] 서버 기동: ./gradlew clean bootRun" -ForegroundColor Green
./gradlew clean bootRun
