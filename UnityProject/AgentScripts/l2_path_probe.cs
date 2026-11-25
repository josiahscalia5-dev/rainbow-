// READ-ONLY: prints the Level 2 path numbers (Rainbow.Level2.L2Path).
var sb = new System.Text.StringBuilder();
var cam = new Vector3(0f, 3f, -6.4f);
foreach (float u in new float[] { -24, -6, 0, 6, 13, 20, 28, 36, 44, 52, 60, 64, 68, 78, 90, 104, 118, 132, 146, 156, 164, 172, 184, 200, 218, 236, 254, 272, 292, 306, 320, 340, 360, 380, 400, 424 })
{
    var f = Rainbow.Level2.L2Path.At(u);
    Vector3 d = f.pos - cam;
    float az = Mathf.Atan2(d.x, d.z) * Mathf.Rad2Deg, el = Mathf.Atan2(d.y, new Vector2(d.x, d.z).magnitude) * Mathf.Rad2Deg;
    sb.AppendLine(string.Format("u {0,4:0} pos ({1,6:0.0},{2,6:0.0},{3,6:0.0}) head {4,6:0.0} slope {5,5:0.0} bank {6,5:0.0} R {7,6:0} v {8,4:0.0} | from start cam az {9,5:0.0} el {10,5:0.0}", u, f.pos.x, f.pos.y, f.pos.z, f.heading, f.slope, f.bank, Mathf.Abs(f.kappa) > 1e-4f ? 1f / f.kappa : 9999f, Rainbow.Level2.L2Path.NominalSpeed(u), az, el));
}
return sb.ToString();
