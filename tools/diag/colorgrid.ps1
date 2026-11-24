param([string]$Unity, [string]$Approved = 'C:\RainbowUnity\references\05_flow_into_the_current.png', [int]$Cell = 96, [string]$Boxes = '')
# Read-only diagnostic: coarse colour grid (approved vs Unity, same pixel positions). Prints deltaE per cell,
# and for -Boxes "name:x,y,w,h;..." the mean sRGB + luminance percentiles of each box in both images.
Add-Type -AssemblyName System.Drawing
if (-not ('Rb05Grid' -as [type])) {
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing; using System.Drawing.Imaging; using System.Runtime.InteropServices;
public static class Rb05Grid {
  public static byte[] Load(string p, out int w, out int h) {
    using (var b = new Bitmap(p)) { w = b.Width; h = b.Height;
      var d = b.LockBits(new Rectangle(0,0,w,h), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
      var a = new byte[d.Stride*h]; Marshal.Copy(d.Scan0, a, 0, a.Length); b.UnlockBits(d);
      var o = new byte[w*h*3]; for (int y=0;y<h;y++) for (int x=0;x<w;x++) { int s=y*d.Stride+x*3, t=(y*w+x)*3; o[t]=a[s+2]; o[t+1]=a[s+1]; o[t+2]=a[s]; } return o; } }
  static double Lin(double c){ c/=255.0; return c<=0.04045? c/12.92 : Math.Pow((c+0.055)/1.055,2.4); }
  static double F(double t){ return t>0.008856? Math.Pow(t,1.0/3) : 7.787*t+16.0/116; }
  public static double[] Lab(double r,double g,double b){ double R=Lin(r),G=Lin(g),B=Lin(b);
    double X=(0.4124*R+0.3576*G+0.1805*B)/0.95047, Y=0.2126*R+0.7152*G+0.0722*B, Z=(0.0193*R+0.1192*G+0.9505*B)/1.08883;
    return new double[]{116*F(Y)-16, 500*(F(X)-F(Y)), 200*(F(Y)-F(Z))}; }
  public static double[] Mean(byte[] p,int w,int x0,int y0,int bw,int bh){ double r=0,g=0,b=0; int n=0;
    for(int y=y0;y<y0+bh;y++) for(int x=x0;x<x0+bw;x++){ int i=(y*w+x)*3; r+=p[i]; g+=p[i+1]; b+=p[i+2]; n++; }
    return new double[]{r/n,g/n,b/n}; }
  public static double[] LumPct(byte[] p,int w,int x0,int y0,int bw,int bh){ var l=new double[bw*bh]; int k=0;
    for(int y=y0;y<y0+bh;y++) for(int x=x0;x<x0+bw;x++){ int i=(y*w+x)*3; l[k++]=0.2126*p[i]+0.7152*p[i+1]+0.0722*p[i+2]; }
    Array.Sort(l); return new double[]{ l[(int)(0.1*(l.Length-1))], l[(int)(0.5*(l.Length-1))], l[(int)(0.9*(l.Length-1))] }; }
}
'@
}
$aw = 0; $ah = 0; $uw = 0; $uh = 0
$A = [Rb05Grid]::Load($Approved, [ref]$aw, [ref]$ah)
$U = [Rb05Grid]::Load($Unity, [ref]$uw, [ref]$uh)
if ($aw -ne $uw -or $ah -ne $uh) { throw "size mismatch $aw x $ah vs $uw x $uh" }
"deltaE per ${Cell}px cell (rows top->bottom, cols left->right); approved vs $(Split-Path $Unity -Leaf)"
$tot = 0; $n = 0
for ($y = 0; $y + $Cell -le $ah; $y += $Cell) {
  $row = @()
  for ($x = 0; $x + $Cell -le $aw; $x += $Cell) {
    $ma = [Rb05Grid]::Mean($A, $aw, $x, $y, $Cell, $Cell); $mu = [Rb05Grid]::Mean($U, $uw, $x, $y, $Cell, $Cell)
    $la = [Rb05Grid]::Lab($ma[0], $ma[1], $ma[2]); $lu = [Rb05Grid]::Lab($mu[0], $mu[1], $mu[2])
    $de = [Math]::Sqrt(($la[0]-$lu[0])*($la[0]-$lu[0]) + ($la[1]-$lu[1])*($la[1]-$lu[1]) + ($la[2]-$lu[2])*($la[2]-$lu[2]))
    $row += ('{0,3:0}' -f $de); $tot += $de; $n++
  }
  ('y{0,4}: ' -f $y) + ($row -join ' ')
}
'mean cell deltaE = {0:0.0}' -f ($tot / $n)
if ($Boxes) {
  foreach ($b in $Boxes -split ';') {
    $nm, $r = $b -split ':'; $v = [int[]]($r -split ',')
    $ma = [Rb05Grid]::Mean($A, $aw, $v[0], $v[1], $v[2], $v[3]); $mu = [Rb05Grid]::Mean($U, $uw, $v[0], $v[1], $v[2], $v[3])
    $pa = [Rb05Grid]::LumPct($A, $aw, $v[0], $v[1], $v[2], $v[3]); $pu = [Rb05Grid]::LumPct($U, $uw, $v[0], $v[1], $v[2], $v[3])
    '{0,-12} approved rgb({1:0},{2:0},{3:0}) lum p10/50/90 {4:0}/{5:0}/{6:0} | unity rgb({7:0},{8:0},{9:0}) lum {10:0}/{11:0}/{12:0}' -f $nm, $ma[0], $ma[1], $ma[2], $pa[0], $pa[1], $pa[2], $mu[0], $mu[1], $mu[2], $pu[0], $pu[1], $pu[2]
  }
}
