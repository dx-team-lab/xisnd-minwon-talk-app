Write-Host "========================================"
Write-Host " 민원 대응 지식 플랫폼 - 백엔드 서버 시작"
Write-Host "========================================"

# .env 파일 존재 확인
if (-not (Test-Path ".env")) {
    Write-Host "[오류] .env 파일이 없습니다."
    Write-Host ".env.example 파일을 복사해서 .env 파일을 만들고 DB 정보를 입력해주세요."
    Read-Host "엔터를 눌러 종료"
    exit 1
}

# .env 파일 읽어서 환경변수 설정
Write-Host ".env 파일 설정 불러오는 중..."
Get-Content ".env" | Where-Object { $_ -notmatch "^#" -and $_ -match "=" } | ForEach-Object {
    $parts = $_ -split "=", 2
    if ($parts.Length -eq 2 -and $parts[0].Trim() -ne "") {
        $key = $parts[0].Trim()
        $value = $parts[1].Trim()
        [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
        Write-Host "  설정됨: $key"
    }
}

$port = [System.Environment]::GetEnvironmentVariable("SERVER_PORT", "Process")
if (-not $port) { $port = "8080" }

Write-Host ""
Write-Host "서버를 시작합니다 (처음 실행 시 라이브러리 다운로드로 3-5분 걸릴 수 있습니다)..."
Write-Host "서버 주소:  http://localhost:$port"
Write-Host "헬스체크:  http://localhost:$port/api/health"
Write-Host ""
Write-Host "서버를 멈추려면 Ctrl+C 를 누르세요."
Write-Host ""

# 서버 실행
& .\gradlew.bat bootRun
