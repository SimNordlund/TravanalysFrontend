param(
    [Parameter(Mandatory = $true)]
    [string]$OutputDirectory,
    [string]$VoiceName,
    [ValidateRange(-10, 10)]
    [int]$Rate = 0
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech

$taskGuidePath = Join-Path $PSScriptRoot '../src/data/toolWalkthrough.json'
$taskGuide = Get-Content -LiteralPath $taskGuidePath -Raw -Encoding UTF8 | ConvertFrom-Json
$taskNarrationDirectory = [System.IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Path $taskNarrationDirectory -Force | Out-Null

$taskSynthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    if ($VoiceName) {
        $taskSynthesizer.SelectVoice($VoiceName)
    } else {
        $taskSwedishVoice = $taskSynthesizer.GetInstalledVoices() |
            Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -eq 'sv-SE' } |
            Select-Object -First 1
        if (-not $taskSwedishVoice) {
            throw 'Ingen svensk röst hittades. Installera en svensk Windows-röst eller ange -VoiceName.'
        }
        $taskSynthesizer.SelectVoice($taskSwedishVoice.VoiceInfo.Name)
    }
    if ($taskSynthesizer.Voice.Culture.Name -ne 'sv-SE') {
        throw 'Videoguiden behöver en svensk röst.'
    }
    $taskSynthesizer.Rate = $Rate
    $taskSynthesizer.Volume = 100
    $taskAudioFormat = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(
        24000,
        [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,
        [System.Speech.AudioFormat.AudioChannel]::Mono
    )

    foreach ($taskChapter in $taskGuide.chapters) {
        if (-not $taskChapter.narration) {
            throw "Talmanus saknas för $($taskChapter.id)."
        }
        $taskWavePath = Join-Path $taskNarrationDirectory "$($taskChapter.id).wav"
        $taskSynthesizer.SetOutputToWaveFile($taskWavePath, $taskAudioFormat)
        $taskSynthesizer.Speak($taskChapter.narration.Replace('ROI', 'R O I'))
        $taskSynthesizer.SetOutputToNull()
        Write-Output "Skapad berättarröst: $($taskChapter.title)"
    }

    @{
        voice = $taskSynthesizer.Voice.Name
        culture = $taskSynthesizer.Voice.Culture.Name
        rate = $Rate
    } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $taskNarrationDirectory 'voice.json') -Encoding UTF8
} finally {
    $taskSynthesizer.Dispose()
}
