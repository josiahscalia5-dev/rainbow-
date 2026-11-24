# Screen 05 ERROR MAP (read-only diagnostics; never used for the reported scores).
# Uses the EXACT algorithm of tools\screen05-measure.ps1 (its embedded C# class is loaded from there) and shows where the OVERALL
# visual score loses its points: per block of the picture the points lost to brightness structure (SSIM part) and to colour (deltaE part).
#   -Still <png>            Unity still (864x1536)
#   -BlockX / -BlockY       block size in px (default 96 x 96)
#   -Oracle                 also prints "what if" gains: the OVERALL visual/layout if a named region were perfect. ANALYSIS ONLY
#                           (tells which region is worth work); such numbers must never be reported as a score.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\diag\errormap.ps1 -Still <png> [-Oracle] [-Heat <out.jpg>]
param(
  [Parameter(Mandatory = $true)][string]$Still,
  [string]$Approved = 'C:\RainbowUnity\references\05_flow_into_the_current.png',
  [int]$BlockX = 96, [int]$BlockY = 96,
  [string]$Heat = '',
  [switch]$Oracle
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$src = [System.IO.File]::ReadAllText('C:\RainbowUnity\tools\screen05-measure.ps1')
$i0 = $src.IndexOf("-TypeDefinition @'") + "-TypeDefinition @'".Length
$i1 = $src.IndexOf("`n'@", $i0)
$cs = $src.Substring($i0, $i1 - $i0)
$cs = $cs.Replace('public static class Rb05Measure2 {', 'public static partial class Rb05Err {')
$cs = $cs -replace "(?m)^  static ", "  public static "
$extra = @'
public static partial class Rb05Err {
  // lost points of the OVERALL visual score per cell: [0] = SSIM part on the 54x96 grid, [1] = deltaE part on the 27x48 grid
  public static float[][] Loss(float[] A0, float[] U0) {
    float[] A = BlurRgb(A0, 8.0), U = BlurRgb(U0, 8.0);
    int w16 = W / 16, h16 = H / 16, n16 = w16 * h16;
    float[] ss = Ssim(Luma(Down(A, 16), n16), Luma(Down(U, 16), n16), w16, h16);
    float[] l0 = new float[n16];
    for (int i = 0; i < n16; i++) l0[i] = (float)((1.0 - ss[i]) / 3.0 * 100.0 / n16);
    int w32 = W / 32, h32 = H / 32, n32 = w32 * h32;
    float[][] ca = Lab(Down(A, 32), n32), cu = Lab(Down(U, 32), n32);
    for (int c = 0; c < 3; c++) { ca[c] = Blur(ca[c], w32, h32, 1.0); cu[c] = Blur(cu[c], w32, h32, 1.0); }
    float[] l1 = new float[n32];
    for (int i = 0; i < n32; i++) {
      double dl = ca[0][i] - cu[0][i], da = ca[1][i] - cu[1][i], db = ca[2][i] - cu[2][i];
      l1[i] = (float)(Math.Sqrt(dl * dl + da * da + db * db) / 50.0 / 3.0 * 100.0 / n32);
    }
    return new float[][] { l0, l1 };
  }
  public static double[] Score(float[] A, float[] U) {
    int[] r = new int[] { 0, 0, W, H };
    double[] l = CompareLoose(A, U, r); double[] s = Compare(A, U, r);
    return new double[] {
      100.0 * (Math.Max(0, l[0]) + Math.Max(0, 1 - l[1] / 50.0) + l[2]) / 3.0,
      100.0 * (Math.Max(0, s[0]) + Math.Max(0, 1 - s[1] / 50.0) + Math.Max(0, s[2])) / 3.0, l[0], l[1], l[2] };
  }
  // polygon mask (even-odd), xy pairs
  public static float[] Patch(float[] A, float[] U, int[] poly) {
    float[] o = (float[])U.Clone(); int n = poly.Length / 2;
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
      bool inside = false;
      for (int i = 0, j = n - 1; i < n; j = i++) {
        double yi = poly[i * 2 + 1], yj = poly[j * 2 + 1], xi = poly[i * 2], xj = poly[j * 2];
        if ((yi > y) != (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
      }
      if (inside) { int k = (y * W + x) * 3; o[k] = A[k]; o[k + 1] = A[k + 1]; o[k + 2] = A[k + 2]; }
    }
    return o;
  }
  public static void HeatJpg(float[] A, float[] U, float[][] loss, string outPath) {
    int w16 = W / 16, w32 = W / 32;
    float m0 = 0, m1 = 0; foreach (float v in loss[0]) m0 = Math.Max(m0, v); foreach (float v in loss[1]) m1 = Math.Max(m1, v);
    using (Bitmap bmp = new Bitmap(W * 2 + 8, H, PixelFormat.Format24bppRgb)) {
      BitmapData d = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.WriteOnly, PixelFormat.Format24bppRgb);
      byte[] row = new byte[d.Stride];
      for (int y = 0; y < H; y++) {
        for (int x = 0; x < W; x++) {
          float a = loss[0][(y / 16) * w16 + x / 16] / m0, b = loss[1][Math.Min(H / 32 - 1, y / 32) * w32 + x / 32] / m1;
          int i = (y * W + x) * 3; float lu = (0.299f * U[i] + 0.587f * U[i + 1] + 0.114f * U[i + 2]) * 0.35f;
          row[x * 3 + 2] = (byte)Math.Min(255, lu + a * 255); row[x * 3 + 1] = (byte)Math.Min(255, lu * (1 - a)); row[x * 3] = (byte)Math.Min(255, lu * (1 - a));
          int x2 = W + 8 + x;
          row[x2 * 3 + 2] = (byte)Math.Min(255, lu * (1 - b)); row[x2 * 3 + 1] = (byte)Math.Min(255, lu + b * 255); row[x2 * 3] = (byte)Math.Min(255, lu * (1 - b));
        }
        Marshal.Copy(row, 0, new IntPtr(d.Scan0.ToInt64() + (long)y * d.Stride), d.Stride);
      }
      bmp.UnlockBits(d);
      ImageCodecInfo jpg = null; foreach (ImageCodecInfo c in ImageCodecInfo.GetImageEncoders()) if (c.MimeType == "image/jpeg") jpg = c;
      EncoderParameters ep = new EncoderParameters(1); ep.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, 80L);
      bmp.Save(outPath, jpg, ep);
    }
  }
}
'@
if (-not ('Rb05Err' -as [type])) { Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition ($cs + "`n" + $extra) }
$imgA = [Rb05Err]::LoadRgb($Approved); $imgU = [Rb05Err]::LoadRgb($Still)
$s = [Rb05Err]::Score($imgA, $imgU)
"OVERALL visual {0:N1} layout {1:N1} | v_shape {2:N3} v_dE {3:N1} v_colours {4:N3}" -f $s[0], $s[1], $s[2], $s[3], $s[4]
$loss = [Rb05Err]::Loss($imgA, $imgU)
$bx = [int][Math]::Ceiling(864 / $BlockX); $by = [int][Math]::Ceiling(1536 / $BlockY)
$tot0 = ($loss[0] | Measure-Object -Sum).Sum; $tot1 = ($loss[1] | Measure-Object -Sum).Sum
"points lost: structure(SSIM) {0:N1}, colour(dE) {1:N1}, colour histogram {2:N1}" -f $tot0, $tot1, (100 * (1 - $s[4]) / 3)
"BLOCKS ({0}x{1} px): points lost to structure / colour (x100)" -f $BlockX, $BlockY
$hdr = '  y\x  '; for ($i = 0; $i -lt $bx; $i++) { $hdr += ('{0,9}' -f ($i * $BlockX)) }; $hdr
for ($j = 0; $j -lt $by; $j++) {
  $line = '{0,5}  ' -f ($j * $BlockY)
  for ($i = 0; $i -lt $bx; $i++) {
    $a = 0.0; $b = 0.0
    for ($y = $j * $BlockY; $y -lt [Math]::Min(1536, ($j + 1) * $BlockY); $y += 16) { for ($x = $i * $BlockX; $x -lt [Math]::Min(864, ($i + 1) * $BlockX); $x += 16) { $a += $loss[0][[int]($y / 16) * 54 + [int]($x / 16)] } }
    for ($y = $j * $BlockY; $y -lt [Math]::Min(1536, ($j + 1) * $BlockY); $y += 32) { for ($x = $i * $BlockX; $x -lt [Math]::Min(864, ($i + 1) * $BlockX); $x += 32) { $b += $loss[1][[int]($y / 32) * 27 + [int]($x / 32)] } }
    $line += ('{0,5:N0}/{1,-3:N0}' -f ($a * 100), ($b * 100))
  }
  $line
}
if ($Heat) { [Rb05Err]::HeatJpg($imgA, $imgU, $loss, $Heat); "HEAT $Heat (left red = structure loss, right green = colour loss)" }
if ($Oracle) {
  'ORACLE (analysis only - OVERALL if ONLY this region were perfect):'
  $R = [ordered]@{
    'HUD bars (y 0-190)'          = @(0, 0, 864, 0, 864, 190, 0, 190)
    'walls+rings upper (190-480)' = @(0, 190, 864, 190, 864, 480, 0, 480)
    'left wall+foam (480-800)'    = @(0, 480, 400, 480, 230, 640, 290, 700, 0, 800)
    'right wall+foam (480-960)'   = @(560, 480, 864, 480, 864, 960, 700, 860, 840, 700, 680, 600)
    'river mid (480-800)'         = @(400, 480, 560, 480, 680, 600, 840, 700, 700, 800, 0, 800, 290, 700, 230, 640)
    'water left 800-1200'         = @(0, 800, 300, 800, 230, 1200, 0, 1200)
    'water right 800-1200'        = @(560, 800, 864, 800, 864, 1200, 620, 1200)
    'benny box'                   = @(225, 765, 620, 765, 620, 1195, 225, 1195)
    'splash+near (1100-1536)'     = @(0, 1195, 864, 1195, 864, 1536, 0, 1536)
    'bottom corners+arc'          = @(0, 1200, 160, 1390, 90, 1536, 430, 1456, 770, 1536, 690, 1390, 864, 1200, 864, 1536, 0, 1536)
    'ring A + near ring (190-480)' = @(0, 190, 240, 190, 260, 480, 0, 480)
  }
  foreach ($k in $R.Keys) {
    $p = [Rb05Err]::Patch($imgA, $imgU, [int[]]$R[$k]); $q = [Rb05Err]::Score($imgA, $p)
    '  {0,-32} visual {1:N1} ({2:+0.0;-0.0})  layout {3:N1} ({4:+0.0;-0.0})' -f $k, $q[0], ($q[0] - $s[0]), $q[1], ($q[1] - $s[1])
  }
}
