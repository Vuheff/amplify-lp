param(
  [switch]$SkipCapture
)

$ErrorActionPreference = "Stop"

$siteRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$nodePath = (Get-Command node).Source
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$tempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$browserProfile = Join-Path $tempRoot ("amplify-edge-check-" + [guid]::NewGuid().ToString("N"))

if (-not (Test-Path -LiteralPath $edgePath)) {
  throw "Microsoft Edge not found at $edgePath"
}

$debugListener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
$debugListener.Start()
$debugPort = $debugListener.LocalEndpoint.Port
$debugListener.Stop()

New-Item -ItemType Directory -Path $browserProfile | Out-Null

$serverProcess = Start-Process `
  -FilePath $nodePath `
  -ArgumentList "tests/static-server.mjs" `
  -WorkingDirectory $siteRoot `
  -WindowStyle Hidden `
  -PassThru

$edgeArguments = @(
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--disable-gpu-sandbox",
  "--disable-dev-shm-usage",
  "--enable-unsafe-swiftshader",
  "--use-angle=swiftshader",
  "--remote-debugging-port=$debugPort",
  "--user-data-dir=$browserProfile",
  "about:blank"
)

$edgeProcess = Start-Process `
  -FilePath $edgePath `
  -ArgumentList $edgeArguments `
  -WindowStyle Hidden `
  -PassThru

try {
  $ready = $false

  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 250

    try {
      $response = Invoke-WebRequest `
        -Uri "http://127.0.0.1:$debugPort/json" `
        -UseBasicParsing `
        -TimeoutSec 1

      if ($response.StatusCode -eq 200) {
        $ready = $true
        break
      }
    } catch {}
  }

  if (-not $ready) {
    throw "Browser debugging endpoint did not become ready"
  }

  Push-Location $siteRoot
  try {
    if (-not $SkipCapture) {
      & $nodePath tests/capture-viewports.mjs $debugPort
      if ($LASTEXITCODE -ne 0) {
        throw "Viewport capture failed with exit code $LASTEXITCODE"
      }
    }
    & $nodePath tests/hero-browser-check.mjs $debugPort
    if ($LASTEXITCODE -ne 0) {
      throw "Hero browser check failed with exit code $LASTEXITCODE"
    }
    & $nodePath tests/motion-profile-check.mjs $debugPort
    if ($LASTEXITCODE -ne 0) {
      throw "Motion profile check failed with exit code $LASTEXITCODE"
    }
  } finally {
    Pop-Location
  }
} finally {
  if (-not $edgeProcess.HasExited) {
    Stop-Process -Id $edgeProcess.Id -Force
  }
  try { $edgeProcess.WaitForExit(5000) | Out-Null } catch {}

  if (-not $serverProcess.HasExited) {
    Stop-Process -Id $serverProcess.Id -Force
  }
  try { $serverProcess.WaitForExit(5000) | Out-Null } catch {}

  $resolvedProfile = [System.IO.Path]::GetFullPath($browserProfile)
  if ($resolvedProfile.StartsWith($tempRoot, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedProfile)) {
    for ($cleanupAttempt = 0; $cleanupAttempt -lt 5; $cleanupAttempt++) {
      try {
        Remove-Item -LiteralPath $resolvedProfile -Recurse -Force -ErrorAction Stop
        break
      } catch {
        if ($cleanupAttempt -eq 4) {
          Write-Warning "Temporary browser profile could not be fully removed: $resolvedProfile"
        } else {
          Start-Sleep -Milliseconds 250
        }
      }
    }
  }
}
