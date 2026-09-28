# Shrinks oversized images carried over from Wix, in place or into small copies.
#   -Icons: 96 px (longest side) PNG copies of the listed icons into public/images/icon/,
#           for the 24-34 px icon slots. The full-size files stay for any other use.
#   -Photos: re-encodes the listed JPEGs in place at most -MaxSide px, JPEG quality -Quality.
# The Wix originals are kept in the adicot-export folder, so nothing is lost.
param(
  [string[]]$Icons = @(),
  [string[]]$Photos = @(),
  [int]$IconSide = 96,
  [int]$MaxSide = 2400,
  [int]$Quality = 82
)
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot

function Resize([System.Drawing.Image]$img, [int]$side) {
  $k = [Math]::Min(1.0, $side / [Math]::Max($img.Width, $img.Height))
  $w = [Math]::Max(1, [int][Math]::Round($img.Width * $k)); $h = [Math]::Max(1, [int][Math]::Round($img.Height * $k))
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $attr = New-Object System.Drawing.Imaging.ImageAttributes
  $attr.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), 0, 0, $img.Width, $img.Height, [System.Drawing.GraphicsUnit]::Pixel, $attr)
  $g.Dispose()
  return $bmp
}

$iconDir = Join-Path $root 'public/images/icon'
if ($Icons.Count) { New-Item -ItemType Directory -Force $iconDir | Out-Null }
foreach ($url in $Icons) {
  $src = Join-Path $root ('public' + $url)
  $img = [System.Drawing.Image]::FromFile($src)
  $bmp = Resize $img $IconSide
  $img.Dispose()
  $out = Join-Path $iconDir ([IO.Path]::GetFileNameWithoutExtension($src) + '.png')
  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
  '{0,9:N0} -> {1,7:N0}  {2}' -f (Get-Item $src).Length, (Get-Item $out).Length, $url
}

$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$Quality)
foreach ($url in $Photos) {
  $src = Join-Path $root ('public' + $url)
  $before = (Get-Item $src).Length
  $img = [System.Drawing.Image]::FromFile($src)
  # Honour the EXIF orientation, which the re-encode would otherwise drop.
  if ($img.PropertyIdList -contains 0x0112) {
    $o = $img.GetPropertyItem(0x0112).Value[0]
    $flip = @{ 2 = 'RotateNoneFlipX'; 3 = 'Rotate180FlipNone'; 4 = 'Rotate180FlipX'; 5 = 'Rotate90FlipX'; 6 = 'Rotate90FlipNone'; 7 = 'Rotate270FlipX'; 8 = 'Rotate270FlipNone' }[[int]$o]
    if ($flip) { $img.RotateFlip([System.Drawing.RotateFlipType]::$flip) }
  }
  $bmp = Resize $img $MaxSide
  $img.Dispose()
  $tmp = $src + '.tmp'
  $bmp.Save($tmp, $jpeg, $params); $bmp.Dispose()
  if ((Get-Item $tmp).Length -lt $before) { Move-Item -Force $tmp $src } else { Remove-Item $tmp }
  '{0,11:N0} -> {1,9:N0}  {2}' -f $before, (Get-Item $src).Length, $url
}
