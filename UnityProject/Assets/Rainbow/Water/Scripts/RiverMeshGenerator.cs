using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Builds the river surface mesh (Agent 3): one continuous grid over the tunnel floor chord from
    /// RiverPath.TunnelStart to RiverPath.TunnelLength, x in [-MeshHalfWidth, +MeshHalfWidth] (the part beyond the
    /// wall chord stays hidden inside the wall). Static shape = RiverSurface.BaseHeight (raised stream edges + foam
    /// shelf), the swell is animated in the vertex shader.
    /// Vertex data: UV0 = (world x, s), UV1 = (stream centre, stream half width, core shift, drum wall half chord at the
    /// water = FoamBank.WallChord) - read by RainbowRiver.
    /// </summary>
    public static class RiverMeshGenerator
    {
        public static Mesh Build(float rowSpacing = 0.35f, int columns = 46)
        {
            float s0 = RiverPath.TunnelStart;
            float s1 = RiverPath.TunnelLength;
            float hwMesh = RiverSurface.MeshHalfWidth;
            int rows = Mathf.CeilToInt((s1 - s0) / rowSpacing) + 1;
            int cols = Mathf.Max(4, columns);
            int vpr = cols + 1;
            int n = rows * vpr;

            var pos = new Vector3[n];
            var nor = new Vector3[n];
            var uv0 = new Vector2[n];
            var uv1 = new List<Vector4>(n);
            var uv2 = new List<Vector4>(n);
            var uv3 = new List<Vector4>(n);
            for (int i = 0; i < n; i++) { uv1.Add(Vector4.zero); uv2.Add(Vector4.zero); uv3.Add(Vector4.zero); }

            const float e = 0.05f;
            for (int i = 0; i < rows; i++)
            {
                float s = Mathf.Min(s1, s0 + i * rowSpacing);
                float d = RiverPath.Meander(s);
                float hw = RiverSurface.StreamHalfWidth(s);
                float shift = RiverSurface.CoreShift(s);
                float wall = FoamBank.WallChord(s);       // river round 2026-11-23: drum wall half chord (UV1.w)
                // river round 4b: the layout table per row (RiverLayout05): UV2 = (WL, LO, LI, RI), UV3 = (RO, WR, rope width L, R)
                var e2 = new Vector4(RiverLayout05.X(0, s), RiverLayout05.X(1, s), RiverLayout05.X(2, s), RiverLayout05.X(3, s));
                var e3 = new Vector4(RiverLayout05.X(4, s), RiverLayout05.X(5, s), RiverLayout05.Rope(s, -1).x, RiverLayout05.Rope(s, 1).x);
                for (int j = 0; j <= cols; j++)
                {
                    float x = -hwMesh + 2f * hwMesh * j / cols;
                    int k = i * vpr + j;
                    float y = RiverPath.WaterY + RiverSurface.BaseHeight(x, s);
                    pos[k] = new Vector3(x, y, s);
                    float dydx = (RiverSurface.BaseHeight(x + e, s) - RiverSurface.BaseHeight(x - e, s)) / (2f * e);
                    float dydz = (RiverSurface.BaseHeight(x, s + e) - RiverSurface.BaseHeight(x, s - e)) / (2f * e);
                    nor[k] = new Vector3(-dydx, 1f, -dydz).normalized;
                    uv0[k] = new Vector2(x, s);
                    uv1[k] = new Vector4(d, hw, shift, wall);
                    uv2[k] = e2;
                    uv3[k] = e3;
                }
            }

            var idx = new int[(rows - 1) * cols * 6];
            int t = 0;
            for (int i = 0; i < rows - 1; i++)
            {
                for (int j = 0; j < cols; j++)
                {
                    int a = i * vpr + j, b = a + 1, c = a + vpr, dd = c + 1;
                    // clockwise seen from above (+Y): front face up
                    idx[t++] = a; idx[t++] = c; idx[t++] = b;
                    idx[t++] = b; idx[t++] = c; idx[t++] = dd;
                }
            }

            var mesh = new Mesh { name = "RiverSurface05" };
            mesh.indexFormat = n > 65000 ? IndexFormat.UInt32 : IndexFormat.UInt16;
            mesh.vertices = pos;
            mesh.normals = nor;
            mesh.uv = uv0;
            mesh.SetUVs(1, uv1);
            mesh.SetUVs(2, uv2);
            mesh.SetUVs(3, uv3);
            mesh.triangles = idx;
            mesh.RecalculateBounds();
            var bnd = mesh.bounds;
            bnd.Expand(new Vector3(0.2f, 2f * RiverSurface.WaveAmp + 0.2f, 0.2f));
            mesh.bounds = bnd;
            return mesh;
        }
    }
}
