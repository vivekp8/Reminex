$pages = @('Trash','Timeline','Tasks','Support','Settings','Search','Reminders','Projects','Profile','Performance','Notifications','NotFound','Home','Dashboard','Calendar','About','Capture')
foreach ($p in $pages) {
    $path = "C:\Users\Vivek Potnuru\Downloads\Reminex\src\pages\$p.tsx"
    if (Test-Path $path) {
        $c = Get-Content $path -Raw
        $c = $c -replace 'max-w-\d+xl ', ''
        $c = $c -replace 'max-w-sm ', ''
        $c = $c -replace 'max-w-xs ', ''
        $c = $c -replace ' mx-auto', ''
        Set-Content $path $c -NoNewline
        Write-Host "Updated $p"
    }
}
