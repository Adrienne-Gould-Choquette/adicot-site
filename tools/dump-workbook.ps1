# Print every non-empty cell of a workbook (formula, shown value, drop-down list)
# and its user-defined names, read-only. The first step of porting a calculator:
#   powershell -File tools\dump-workbook.ps1 "G:\My Drive\5-Calculators\ACH V1.6.xlsx"
# SpreadsheetConverter's own sheets (_SSC, _Options) and names (_Ctrl, _ram,
# _dep, _options...) are skipped; each drop-down's choices are listed inline.
param([Parameter(Mandatory)] [string]$Path)
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false; $xl.DisplayAlerts = $false; $xl.AskToUpdateLinks = $false; $xl.EnableEvents = $false
try {
  $wb = $xl.Workbooks.Open($Path, 0, $true)
  foreach ($ws in $wb.Worksheets) {
    if ($ws.Name -in '_SSC', '_Options') { continue }
    $vis = @{ -1 = 'visible'; 0 = 'hidden'; 2 = 'very hidden' }[[int]$ws.Visible]
    "=== $($ws.Name) ($vis)"
    $ur = $ws.UsedRange
    foreach ($cell in $ur.Cells) {
      $f = [string]$cell.Formula
      if ($f -eq '') { continue }
      $line = '{0,-6} {1}' -f $cell.Address($false, $false), $f
      $t = [string]$cell.Text
      if ($f.StartsWith('=')) { $line += "   => $t" }
      try { if ($cell.Validation.Type -eq 3) {
        $src = $cell.Validation.Formula1
        $choices = try { @($xl.Evaluate($src).Value2) -join ' | ' } catch { $src }
        $line += "   [choices: $choices]" } } catch {}
      $line
    }
  }
  "=== names"
  foreach ($n in $wb.Names) { if ($n.Name -notmatch '^_(Ctrl|ctrl|ram|dep|ddd|options|xlfn)') { '{0} {1}' -f $n.Name, $n.RefersTo } }
  $wb.Close($false)
} finally { $xl.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($xl) }
