// FOAM agent (read-only): foam bank waterlines (FoamBank.BankEdges) along the course, the open channel width, the foam
// shelf width to each wall, and the generated puff statistics.
var sb = new System.Text.StringBuilder();
float wall = Rainbow.Screen05.FoamBank.WallX;
for (float s = 4f; s <= 70f; s += 2f)
{
    float d = Rainbow.Screen05.RiverPath.Meander(s);
    Vector2 e = Rainbow.Screen05.FoamBank.BankEdges(s);
    float xl = d + e.x, xr = d + e.y;
    sb.AppendLine(string.Format("s {0,5:F1} d {1,6:F2} waterL {2,6:F2} waterR {3,6:F2} open {4,5:F2} shelfL {5,5:F2} shelfR {6,5:F2}",
        s, d, xl, xr, xr - xl, xl + wall, wall - xr));
}
var puffs = Rainbow.Screen05.FoamBank.GeneratePuffs();
int n = puffs.Count, small = 0, mid = 0, big = 0;
float maxTop = 0f;
foreach (var p in puffs)
{
    if (p.radius < 0.1f) small++; else if (p.radius < 0.25f) mid++; else big++;
    maxTop = Mathf.Max(maxTop, p.centre.y + p.radius);
}
sb.AppendLine(string.Format("puffs {0}: r<0.1 {1}, 0.1-0.25 {2}, >=0.25 {3}; highest top {4:F2}", n, small, mid, big, maxTop));
return sb.ToString();
