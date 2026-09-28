# Run a list of cases through a workbook in Excel and write every answer to CSV.
# Called by gen-cases.mjs, which writes the job file. The workbook is opened
# read-only and never saved.
param([Parameter(Mandatory)] [string]$Job)
# Stop on the first error rather than write a partial answer key.
$ErrorActionPreference = "Stop"
# UTF-8 explicitly: Windows PowerShell otherwise reads the job as ANSI and
# mangles any non-ASCII input (a fluid name with a non-breaking space, a °).
$j = Get-Content $Job -Raw -Encoding UTF8 | ConvertFrom-Json
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false; $xl.DisplayAlerts = $false; $xl.AskToUpdateLinks = $false; $xl.EnableEvents = $false
$inNames = @($j.inputs.PSObject.Properties.Name)
$outNames = @($j.outputs.PSObject.Properties.Name)
$lines = @((@($inNames) + @($outNames)) -join ',')
try {
  $wb = $xl.Workbooks.Open($j.workbook, 0, $true)
  $ws = $wb.Worksheets.Item($j.sheet)
  foreach ($c in $j.cases) {
    foreach ($n in $inNames) {
      $cell = $ws.Range($j.inputs.$n)
      $v = $c.$n
      if ($null -eq $v -or [string]$v -eq '') { [void]$cell.MergeArea.ClearContents() }   # MergeArea: Excel refuses to clear part of a merged cell
      # A leading apostrophe stores text as typed: otherwise Excel turns "7/8" into a date.
      elseif ($v -is [string]) { $cell.Value2 = "'" + $v }
      # A checkbox's linked cell: TRUE/FALSE, not 1/0, which "=F18=FALSE" never equals.
      elseif ($v -is [bool]) { $cell.Formula = $(if ($v) { "TRUE" } else { "FALSE" }) }
      else { $cell.Value2 = [double]$v }
    }
    $xl.Calculate()
    # @(...) so a single-input row is still a list, not one string to append to.
    $row = @(foreach ($n in $inNames) { [string]$c.$n })
    $row += foreach ($n in $outNames) {
      $v = $ws.Range($j.outputs.$n).Value2
      # Numbers come back as doubles; an Excel error (#VALUE!, #DIV/0!) comes back as an int.
      if ($v -is [double]) { $v.ToString('R', [Globalization.CultureInfo]::InvariantCulture) }
      elseif ($v -is [int]) { '#ERROR' }
      else { [string]$v }
    }
    # Quote a field holding a comma, a quote or a line break (a message that wraps).
    $lines += ($row | ForEach-Object { if ($_ -match "[,`"`r`n]") { '"' + ($_ -replace '"', '""') + '"' } else { $_ } }) -join ','
  }
  $wb.Close($false)
} finally { $xl.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($xl) }
[IO.File]::WriteAllLines($j.out, [string[]]$lines)
"$($j.cases.Count) cases -> $($j.out)"
