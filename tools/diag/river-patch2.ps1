# One-time helper (2026-11-24, round 8): puts the new flowing-silk section into RainbowRiver.hlsl / .shader and the builder. Safe to re-run
# (does nothing when the new section is already there). Function names must never be PowerShell aliases (rd = Remove-Item!).
$ErrorActionPreference = 'Stop'
$root = 'C:\RainbowUnity\UnityProject\Assets\Rainbow\Water'
$work = 'C:\RainbowUnity\UnityProject\Recordings\Screen05\work'
function Read-SourceText([string]$Path) { ([System.IO.File]::ReadAllText($Path)) -replace "`r`n", "`n" }
function Save-SourceText([string]$Path, [string]$Text) {
  if ($Text.Length -lt 500) { throw "refusing to write a tiny file: $Path" }
  [System.IO.File]::WriteAllText($Path, $Text, (New-Object System.Text.UTF8Encoding($false)))
}

$h = Read-SourceText "$root\Shaders\RainbowRiver.hlsl"
if ($h -notmatch 'RBW_Silk') {
  $mid = Read-SourceText "$work\river_new_mid.txt"; $help = Read-SourceText "$work\river_new_help.txt"
  $a = $h.IndexOf('    // ---- streamline coordinate q: -3 WL'); $b = $h.IndexOf('    // ---- outside the waterlines: a narrow strip')
  if ($a -lt 0 -or $b -lt $a) { throw 'markers not found' }
  $h = $h.Substring(0, $a) + $mid + $h.Substring($b)
  $c = $h.IndexOf('// vertex swell (waterRibbon.ts VERT')
  if ($c -lt 0) { throw 'helper marker not found' }
  $h = $h.Substring(0, $c) + $help + $h.Substring($c)
  Save-SourceText "$root\Shaders\RainbowRiver.hlsl" $h
  'river hlsl patched'
}
$s = Read-SourceText "$root\Shaders\RainbowRiver.shader"
if ($s -notmatch '_SilkTex') {
  $s = $s -replace '(        _RiverGrade \("Cyan water grade[^\n]*\n)', ('$1' + "        [NoScaleOffset] _SilkTex (""Silk (R value, G glints, BA ripple normal)"", 2D) = ""gray"" {}`n        [NoScaleOffset] _RiverRamp (""Colour ramp (q, silk value)"", 2D) = ""white"" {}`n        _SilkLook (""Edge streakiness, edge drift, ripple normal, ripple emboss"", Vector) = (0.3, 0.25, 0.35, 0.3)`n        _GlintLook (""Glint mix, glint glow, -, -"", Vector) = (0.75, 0.9, 0, 0)`n")
  $s = $s -replace '(            float4 _W4Band;\n)(\s*CBUFFER_END)', ('$1' + "            float4 _SilkLook;`n            float4 _GlintLook;`n" + '$2')
  Save-SourceText "$root\Shaders\RainbowRiver.shader" $s
  'river shader patched'
}
$w = Read-SourceText "$root\Editor\WaterBuilder.cs"
if ($w -notmatch 'SilkLook') {
  $w = $w.Replace('public static readonly Vector4 RiverGrade = new Vector4(0.55f, 0.70f, 0.93f, 1f);',
    "public static readonly Vector4 RiverGrade = new Vector4(0.55f, 0.70f, 0.93f, 0f);   // round 8: off (the colour ramp is measured)`n        /// <summary>Round 8 water (RainbowRiver.hlsl): edge streakiness, edge drift, ripple normal, ripple emboss; glint mix, glow.</summary>`n        public static readonly Vector4 SilkLook = new Vector4(0.3f, 0.25f, 0.35f, 0.3f), GlintLook = new Vector4(0.75f, 0.9f, 0f, 0f);")
  $w = $w.Replace('mat.SetVector("_W4Look", RiverLook);',
    "Texture2D silk = AssetDatabase.LoadAssetAtPath<Texture2D>(WaterTextureFactory.SilkPath), ramp = AssetDatabase.LoadAssetAtPath<Texture2D>(WaterTextureFactory.RampPath);`n            if (silk == null || ramp == null) Debug.LogError(Tag + ""water textures missing: run AgentScripts/screen05_make_water_textures.cs"");`n            mat.SetTexture(""_SilkTex"", silk);`n            mat.SetTexture(""_RiverRamp"", ramp);`n            mat.SetVector(""_SilkLook"", SilkLook);`n            mat.SetVector(""_GlintLook"", GlintLook);`n            mat.SetVector(""_W4Look"", RiverLook);")
  $w = $w.Replace('gm.SetFloat("_Drift", 7.5f);', 'gm.SetFloat("_Drift", RiverSurface.FlowSpeed);')
  Save-SourceText "$root\Editor\WaterBuilder.cs" $w
  'builder patched'
}
$r = Read-SourceText "$root\Scripts\RiverSurface.cs"
if ($r -match 'FlowSpeed = 14\.3f;') {
  $r = $r.Replace('public const float FlowSpeed = 14.3f;', 'public const float FlowSpeed = 6.5f;   // master direction 2026-11-24: he swims (11 u/s) through a current of 6.5 u/s; 14.3 made the pattern run away from him')
  Save-SourceText "$root\Scripts\RiverSurface.cs" $r
  'flow speed patched'
}
Get-ChildItem "$root\Shaders\RainbowRiver.*", "$root\Editor\WaterBuilder.cs", "$root\Scripts\RiverSurface.cs" | Select-Object Name, Length
