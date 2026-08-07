$ErrorActionPreference = "Stop"

$siteRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$nodePath = (Get-Command node).Source
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$tempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$browserProfile = Join-Path $tempRoot ("amplify-photo-assets-" + [guid]::NewGuid().ToString("N"))

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

try {
  $serverReady = $false
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 200
    try {
      $response = Invoke-WebRequest -Uri "http://127.0.0.1:4173/" -UseBasicParsing -TimeoutSec 1
      if ($response.StatusCode -eq 200) {
        $serverReady = $true
        break
      }
    } catch {}
  }

  if (-not $serverReady) {
    throw "Local preview did not become ready"
  }

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
    "http://127.0.0.1:4173/"
  )

  $edgeProcess = Start-Process `
    -FilePath $edgePath `
    -ArgumentList $edgeArguments `
    -WindowStyle Hidden `
    -PassThru

  try {
    $browserReady = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
      Start-Sleep -Milliseconds 250
      try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:$debugPort/json" -UseBasicParsing -TimeoutSec 1
        if ($response.StatusCode -eq 200) {
          $browserReady = $true
          break
        }
      } catch {}
    }

    if (-not $browserReady) {
      throw "Browser debugging endpoint did not become ready"
    }

    Push-Location $siteRoot
    try {
      & $nodePath tests/generate-photo-rail-assets.mjs $debugPort
      if ($LASTEXITCODE -ne 0) {
        throw "Photo asset generation failed with exit code $LASTEXITCODE"
      }
    } finally {
      Pop-Location
    }
  } finally {
    if (-not $edgeProcess.HasExited) {
      Stop-Process -Id $edgeProcess.Id -Force
    }
  }
} finally {
  if (-not $serverProcess.HasExited) {
    Stop-Process -Id $serverProcess.Id -Force
  }

  $resolvedProfile = [System.IO.Path]::GetFullPath($browserProfile)
  if ($resolvedProfile.StartsWith($tempRoot, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedProfile)) {
    Remove-Item -LiteralPath $resolvedProfile -Recurse -Force
  }
}
