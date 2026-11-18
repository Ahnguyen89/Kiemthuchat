param(
    [ValidateSet('all', 'hoi-dap', 'tom-tat', 'genai')]
    [string]$Feature = 'all'
)
# Chạy từ thư mục bất kỳ; mọi kết quả nằm trong results của bộ test này.
$apiDirectory = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$jestExecutable = Join-Path $apiDirectory '../../node_modules/.bin/jest.cmd'
$arguments = @('--config', (Join-Path $PSScriptRoot 'jest.config.cjs'), '--runInBand', '--coverage', '--json', '--outputFile', (Join-Path $PSScriptRoot 'results/jest-results.json'))
if ($Feature -ne 'all') { $arguments += @('--testPathPattern', $Feature) }
Push-Location $apiDirectory
try {
    & $jestExecutable @arguments
    $testExitCode = $LASTEXITCODE
} finally {
    Pop-Location
}
exit $testExitCode
