$files = Get-ChildItem -Path 'app' -Recurse -Include '*.tsx', '*.ts'

$replacements = @(
    @{ From = 'border-b border-theme'; To = 'border-b border-[#c8d8f8] dark:border-[#1a3566]' },
    @{ From = 'border-t border-theme'; To = 'border-t border-[#c8d8f8] dark:border-[#1a3566]' },
    @{ From = 'border-x border-theme'; To = 'border-x border-[#c8d8f8] dark:border-[#1a3566]' },
    @{ From = 'border-l border-theme'; To = 'border-l border-[#c8d8f8] dark:border-[#1a3566]' },
    @{ From = 'border-r border-theme'; To = 'border-r border-[#c8d8f8] dark:border-[#1a3566]' }
)

foreach ($file in $files) {
    try {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $content = [System.Text.Encoding]::UTF8.GetString($bytes)
        $changed = $false
        foreach ($r in $replacements) {
            if ($content.Contains($r.From)) {
                $content = $content.Replace($r.From, $r.To)
                $changed = $true
            }
        }
        if ($changed) {
            $newBytes = [System.Text.Encoding]::UTF8.GetBytes($content)
            [System.IO.File]::WriteAllBytes($file.FullName, $newBytes)
            Write-Host "Updated: $($file.FullName)"
        }
    } catch {
        Write-Host "Error processing $($file.FullName): $_"
    }
}

Write-Host "Done!"
