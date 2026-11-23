using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Procedural meshes of the Screen 05 washer-drum tunnel (Agent 2, environment). Pure functions (no scene access):
    /// EnvironmentBuilder (editor) saves their results as .asset files. Ports of src/world/tube.ts (buildTubeGeometry,
    /// roundBandGeometry, nearFrameGeometry) and src/vfx/proj05Tunnel.ts (trayLidGeometry).
    /// Every triangle is wound so its front face matches the stored normal (Unity: front = Cross(b - a, c - a)).
    /// </summary>
    public static class DrumMeshes05
    {
        // ------------------------------------------------------------------ helpers
        sealed class MeshData
        {
            public readonly List<Vector3> pos = new List<Vector3>();
            public readonly List<Vector3> nor = new List<Vector3>();
            public readonly List<Vector2> uv0 = new List<Vector2>();
            public readonly List<Vector2> uv1 = new List<Vector2>();
            public readonly List<Color> col = new List<Color>();
            public readonly List<int> tris = new List<int>();
            public bool hasUv1, hasColor;

            public int Add(Vector3 p, Vector3 n, Vector2 uv)
            {
                pos.Add(p); nor.Add(n); uv0.Add(uv); uv1.Add(Vector2.zero); col.Add(Color.white);
                return pos.Count - 1;
            }

            public void Tri(int a, int b, int c)
            {
                Vector3 g = Vector3.Cross(pos[b] - pos[a], pos[c] - pos[a]);
                if (g.sqrMagnitude < 1e-14f) return;                     // degenerate
                if (Vector3.Dot(g, nor[a] + nor[b] + nor[c]) < 0f) { tris.Add(a); tris.Add(c); tris.Add(b); }
                else { tris.Add(a); tris.Add(b); tris.Add(c); }
            }

            public void Quad(int a, int b, int c, int d) { Tri(a, b, c); Tri(a, c, d); }

            public Mesh ToMesh(string name, bool recalcNormals = false)
            {
                var m = new Mesh { name = name };
                m.indexFormat = pos.Count > 65000 ? IndexFormat.UInt32 : IndexFormat.UInt16;
                m.SetVertices(pos);
                m.SetNormals(nor);
                m.SetUVs(0, uv0);
                if (hasUv1) m.SetUVs(1, uv1);
                if (hasColor) m.SetColors(col);
                m.SetTriangles(tris, 0, true);
                if (recalcNormals) m.RecalculateNormals();
                m.RecalculateBounds();
                return m;
            }
        }

        // ------------------------------------------------------------------ tunnel wall
        /// <summary>
        /// Inner wall of the tunnel from s0 to s1 (full circle, seam at the bottom under the water). Rows every
        /// <paramref name="stepNear"/> m before <paramref name="nearUntil"/> (where the near-floor blend bends the tube),
        /// every <paramref name="stepFar"/> m after it (straight cylinder: interpolation is exact).
        /// UV0 = (arc length from 12 o'clock in metres, + toward the rider's right; s). Normals point into the tunnel.
        /// </summary>
        public static Mesh BuildWall(float s0, float s1, int radial, float stepNear, float stepFar, float nearUntil, string name)
        {
            var rows = new List<float> { s0 };
            float s = s0;
            while (s < s1 - 1e-4f)
            {
                float step = s < nearUntil ? stepNear : stepFar;
                s = Mathf.Min(s1, s + step);
                rows.Add(s);
            }
            float R = DrumLayout05.Radius;
            var md = new MeshData();
            int cols = radial + 1;
            for (int i = 0; i < rows.Count; i++)
            {
                float si = rows[i];
                float cy = DrumLayout05.CentreY(si);
                float slope = DrumLayout05.CentreSlope(si);
                for (int j = 0; j <= radial; j++)
                {
                    float phi = -Mathf.PI + 2f * Mathf.PI * j / radial;   // 0 = top, + = rider's right, +-pi = bottom
                    float sx = Mathf.Sin(phi), cz = Mathf.Cos(phi);
                    // implicit wall x^2 + (y - c(s))^2 = R^2: outward gradient (x, y - c, -(y - c) c'), inward = minus
                    Vector3 outward = new Vector3(R * sx, R * cz, -(R * cz) * slope);
                    md.Add(new Vector3(R * sx, cy + R * cz, si), -outward.normalized, new Vector2(R * phi, si));
                }
            }
            for (int i = 0; i < rows.Count - 1; i++)
            {
                for (int j = 0; j < radial; j++)
                {
                    int a = i * cols + j, b = a + cols;
                    md.Quad(a, b, b + 1, a + 1);
                }
            }
            return md.ToMesh(name);
        }

        // ------------------------------------------------------------------ gold ring band
        struct ProfilePoint
        {
            public float rho, z;    // rho: fraction of the ring radius (1 = wall), z: metres along the ring axis
            public ProfilePoint(float rho, float z) { this.rho = rho; this.z = z; }
        }

        /// <summary>
        /// tube.ts roundBandGeometry: a thick half-round main band (far side, +z) and a thin half-round lip on the camera
        /// side (-z) separated by a narrow groove; corners duplicated for crisp facets. Lathe round local Z, centred on the
        /// ring centre; radius in metres (ring sits on the wall: Radius - RingInset). Faces point into the tunnel.
        /// </summary>
        public static Mesh BuildRing(DrumLayout05.BandProfile b, float radius, int segments, string name)
        {
            float w = b.HalfWidth;
            float yc = w - b.width * 0.5f, a = b.width * 0.5f;
            float yl = -w + b.lipWidth * 0.5f, al = b.lipWidth * 0.5f;
            var prof = new List<ProfilePoint>();
            var dupFirst = new List<bool>();   // true for the first copy of a duplicated (crisp) corner
            void P(float r, float z) { prof.Add(new ProfilePoint(r, z)); dupFirst.Add(false); }
            void Dup(float r, float z) { prof.Add(new ProfilePoint(r, z)); dupFirst.Add(true); prof.Add(new ProfilePoint(r, z)); dupFirst.Add(false); }
            P(1.03f, w);
            Dup(1.0f, w);
            for (int i = 1; i < 12; i++)
            {
                float f = i / 12f * Mathf.PI;
                P(1f - b.height * Mathf.Sin(f), yc + a * Mathf.Cos(f));
            }
            Dup(1.0f, yc - a);
            P(1.0f - b.height * 0.04f, yc - a - b.groove * 0.5f);
            Dup(1.0f, yl + al);
            for (int i = 1; i < 7; i++)
            {
                float f = i / 7f * Mathf.PI;
                P(1f - b.lipHeight * Mathf.Sin(f), yl + al * Mathf.Cos(f));
            }
            Dup(1.0f, -w);
            P(1.03f, -w);

            int n = prof.Count;
            var n2 = new Vector2[n];   // (radial, axial) normal in metres, pointing into the tunnel
            for (int i = 0; i < n; i++)
            {
                Vector2 acc = Vector2.zero;
                bool isFirstOfDup = dupFirst[i];
                bool isSecondOfDup = i > 0 && dupFirst[i - 1];
                if (i > 0 && !isSecondOfDup) acc += SegNormal(prof[i - 1], prof[i], radius);
                if (i < n - 1 && !isFirstOfDup) acc += SegNormal(prof[i], prof[i + 1], radius);
                if (acc.sqrMagnitude < 1e-12f)
                {
                    if (i > 0) acc = SegNormal(prof[i - 1], prof[i], radius);
                    if (acc.sqrMagnitude < 1e-12f && i < n - 1) acc = SegNormal(prof[i], prof[i + 1], radius);
                }
                n2[i] = acc.sqrMagnitude > 1e-12f ? acc.normalized : new Vector2(-1f, 0f);
            }

            var md = new MeshData();
            int ring = segments + 1;
            for (int i = 0; i < n; i++)
            {
                for (int k = 0; k <= segments; k++)
                {
                    float ang = 2f * Mathf.PI * k / segments;
                    float c = Mathf.Cos(ang), s = Mathf.Sin(ang);
                    float r = prof[i].rho * radius;
                    md.Add(new Vector3(r * c, r * s, prof[i].z), new Vector3(n2[i].x * c, n2[i].x * s, n2[i].y),
                        new Vector2(k / (float)segments, i / (float)(n - 1)));
                }
            }
            for (int i = 0; i < n - 1; i++)
            {
                if (Mathf.Abs(prof[i].rho - prof[i + 1].rho) < 1e-6f && Mathf.Abs(prof[i].z - prof[i + 1].z) < 1e-6f) continue;
                for (int k = 0; k < segments; k++)
                {
                    int p0 = i * ring + k, p1 = (i + 1) * ring + k;
                    md.Quad(p0, p1, p1 + 1, p0 + 1);
                }
            }
            return md.ToMesh(name);
        }

        static Vector2 SegNormal(ProfilePoint p, ProfilePoint q, float radius)
        {
            float dr = (q.rho - p.rho) * radius, dz = q.z - p.z;
            var v = new Vector2(dz, -dr);       // traversed +z -> -z: this points toward the tunnel axis on the crown
            return v.sqrMagnitude > 1e-12f ? v.normalized : Vector2.zero;
        }

        // ------------------------------------------------------------------ paddle (tray lid)
        /// <summary>
        /// proj05Tunnel.ts trayLidGeometry: a D-shaped tray, half lathe toward local +X (the straight edge of the D lies on
        /// local Z against the wall), open side facing local -Y (toward the stream / camera), closed back +Y. A flat plate
        /// closes the cut face against the wall. Scaled to <paramref name="size"/> metres (x, y) and size * stretch (z).
        /// Vertex colour rgb = region colour (linear, lid palette of materials.ts withLidShading), alpha = polish.
        /// </summary>
        public static Mesh BuildPaddleTray(float size, float h, float stretch, int segments, string name)
        {
            // profile (x = radius fraction, y = height in units of size) and region colours
            Vector2[] prof =
            {
                new Vector2(0f, 0.68f * h), new Vector2(0.78f, 0.68f * h), new Vector2(0.84f, 0.62f * h),     // floor, fillet
                new Vector2(0.855f, 0.3f * h), new Vector2(0.865f, 0.06f * h), new Vector2(0.9f, 0f),          // inner rim face -> lip
                new Vector2(0.965f, 0f), new Vector2(1.0f, 0.06f * h), new Vector2(1.025f, 0.4f * h),          // lip, outer bulge
                new Vector2(1.0f, 0.85f * h), new Vector2(0.95f, h), new Vector2(0f, h),                       // closed back
            };
            // light round 2026-11-23: the open side the rider looks into (floor + inner rim face) read as a pale cream cut
            // face / lavender board; the approved trays are copper-gold all over (peach-copper inner face, orange-gold rim,
            // one pale highlight line), so floor = copper and the inner rim gold -> pale -> gold (white only from reflections)
            Color copper = new Color(0.80f, 0.36f, 0.22f, 0.8f);        // (231,160,130)-ish peach copper
            Color gold = new Color(0.8678f, 0.4731f, 0.2587f, 1f);      // (252,165,95)
            Color pale = new Color(0.9089f, 0.6835f, 0.3326f, 1f);      // (249,205,112)
            Color orange = new Color(0.7866f, 0.2857f, 0.1249f, 0.9f);  // (250,119,38)
            Color peach = new Color(0.838f, 0.3415f, 0.2905f, 0.8f);    // (254,133,115)
            Color plum = new Color(0.298f, 0.0954f, 0.168f, 0.3f);      // (150,40,92)
            Color[] pc = { copper, copper, gold, gold, pale, gold, gold, orange, gold, peach, plum, plum };

            int n = prof.Length;
            var n2 = new Vector2[n];
            for (int i = 0; i < n; i++)
            {
                Vector2 acc = Vector2.zero;
                if (i > 0) acc += TrayNormal(prof[i - 1], prof[i]);
                if (i < n - 1) acc += TrayNormal(prof[i], prof[i + 1]);
                n2[i] = acc.sqrMagnitude > 1e-12f ? acc.normalized : Vector2.up;
            }
            var md = new MeshData { hasColor = true };
            float yOff = -h * 0.5f;
            int ring = segments + 1;
            for (int i = 0; i < n; i++)
            {
                for (int k = 0; k <= segments; k++)
                {
                    float phi = Mathf.PI * k / segments;     // half revolution: x >= 0
                    float sp = Mathf.Sin(phi), cp = Mathf.Cos(phi);
                    var p = new Vector3(prof[i].x * sp * size, (prof[i].y + yOff) * size, prof[i].x * cp * size * stretch);
                    var nn = new Vector3(n2[i].x * sp, n2[i].y, n2[i].x * cp / Mathf.Max(1e-3f, stretch)).normalized;
                    int v = md.Add(p, nn, new Vector2(k / (float)segments, i / (float)(n - 1)));
                    md.col[v] = pc[i];
                }
            }
            for (int i = 0; i < n - 1; i++)
            {
                for (int k = 0; k < segments; k++)
                {
                    int p0 = i * ring + k, p1 = (i + 1) * ring + k;
                    md.Quad(p0, p1, p1 + 1, p0 + 1);
                }
            }
            // mounting plate on the cut face (local x = 0, facing the wall)
            for (int i = 0; i < n - 1; i++)
            {
                Vector3 a0 = new Vector3(0f, (prof[i].y + yOff) * size, prof[i].x * size * stretch);
                Vector3 a1 = new Vector3(0f, (prof[i + 1].y + yOff) * size, prof[i + 1].x * size * stretch);
                Vector3 b0 = new Vector3(a0.x, a0.y, -a0.z), b1 = new Vector3(a1.x, a1.y, -a1.z);
                int ia0 = md.Add(a0, Vector3.left, new Vector2(1f, 1f));
                int ia1 = md.Add(a1, Vector3.left, new Vector2(1f, 1f));
                int ib1 = md.Add(b1, Vector3.left, new Vector2(0f, 1f));
                int ib0 = md.Add(b0, Vector3.left, new Vector2(0f, 1f));
                md.col[ia0] = plum; md.col[ia1] = plum; md.col[ib1] = plum; md.col[ib0] = plum;
                md.Quad(ia0, ia1, ib1, ib0);
            }
            return md.ToMesh(name);
        }

        static Vector2 TrayNormal(Vector2 p, Vector2 q)
        {
            float dx = q.x - p.x, dy = q.y - p.y;
            var v = new Vector2(dy, -dx);            // bottom -> top traversal: outward / open-side normals
            return v.sqrMagnitude > 1e-12f ? v.normalized : Vector2.zero;
        }

        // ------------------------------------------------------------------ near gold frame
        /// <summary>
        /// tube.ts nearFrameGeometry, one piece: reference-pixel units of the 864x1536 approved frame, origin at the frame
        /// centre, +x right, +y up, -z toward the viewer (Unity camera space). piece 0 = bottom corner, 1 = bottom lip.
        /// UV0 = (along the arc, across the band 0 = edge toward the stream), UV1.x = piece.
        /// </summary>
        public static Mesh BuildFrameStrip(int piece, float cx, float cy, float r0, float w, int dir, float th0, float th1, float z0, int nu, int nv, string name)
        {
            var md = new MeshData { hasUv1 = true };
            for (int i = 0; i <= nu; i++)
            {
                float th = (th0 + (th1 - th0) * i / nu) * Mathf.Deg2Rad;
                for (int j = 0; j <= nv; j++)
                {
                    float t = j / (float)nv;
                    float rr = r0 + dir * t * w;
                    float xs = cx + rr * Mathf.Cos(th), ys = cy - rr * Mathf.Sin(th);   // screen px (y down)
                    var p = new Vector3(xs - 432f, 768f - ys, -(z0 + w * 0.22f * Mathf.Sin(Mathf.PI * t)));
                    int v = md.Add(p, Vector3.back, new Vector2(i / (float)nu, t));
                    md.uv1[v] = new Vector2(piece, 0f);
                }
            }
            for (int i = 0; i < nu; i++)
            {
                for (int j = 0; j < nv; j++)
                {
                    int p = i * (nv + 1) + j, q = p + nv + 1;
                    md.tris.Add(p); md.tris.Add(q); md.tris.Add(p + 1);
                    md.tris.Add(q); md.tris.Add(q + 1); md.tris.Add(p + 1);
                }
            }
            return md.ToMesh(name, true);
        }

        /// <summary>Left bottom corner (inner circle centre (432,1060) r 457, band 190 px outward, theta -163..-122).</summary>
        public static Mesh BuildFrameCornerLeft() => BuildFrameStrip(0, 432f, 1060f, 457f, 190f, 1, -163f, -122f, 40f, 36, 10, "NearFrame05_CornerL");
        /// <summary>Right bottom corner (mirror, theta -17..-58).</summary>
        public static Mesh BuildFrameCornerRight() => BuildFrameStrip(0, 432f, 1060f, 457f, 190f, 1, -17f, -58f, 40f, 36, 10, "NearFrame05_CornerR");
        /// <summary>Bottom lip (circle centre (432,2121), top edge radius 655, band 130 px inward, theta 122..58).</summary>
        public static Mesh BuildFrameLip() => BuildFrameStrip(1, 432f, 2121f, 655f, 130f, -1, 122f, 58f, 0f, 48, 10, "NearFrame05_Lip");

        // ------------------------------------------------------------------ far throat
        /// <summary>Opaque end cap of the tunnel, local XY disc (radius in metres) facing -Z; UV0 = position in tube radii.</summary>
        public static Mesh BuildThroatCap(float radius, int segments, string name)
        {
            var md = new MeshData();
            float R = DrumLayout05.Radius;
            int centre = md.Add(Vector3.zero, Vector3.back, Vector2.zero);
            int rings = 6;
            for (int r = 1; r <= rings; r++)
            {
                float rr = radius * r / rings;
                for (int k = 0; k <= segments; k++)
                {
                    float a = 2f * Mathf.PI * k / segments;
                    var p = new Vector3(Mathf.Cos(a) * rr, Mathf.Sin(a) * rr, 0f);
                    md.Add(p, Vector3.back, new Vector2(p.x / R, p.y / R));
                }
            }
            int ringLen = segments + 1;
            for (int k = 0; k < segments; k++) md.Tri(centre, 1 + k, 2 + k);
            for (int r = 1; r < rings; r++)
            {
                int b0 = 1 + (r - 1) * ringLen, b1 = 1 + r * ringLen;
                for (int k = 0; k < segments; k++) md.Quad(b0 + k, b1 + k, b1 + k + 1, b0 + k + 1);
            }
            return md.ToMesh(name);
        }

        /// <summary>Far river chord at the water level from s0 to s1 (world coordinates); UV0 = (lateral x m, s m).</summary>
        public static Mesh BuildFarRiver(float s0, float s1, float halfWidth, float y, float step, int cols, string name)
        {
            var md = new MeshData();
            var rows = new List<float> { s0 };
            float s = s0;
            while (s < s1 - 1e-4f) { s = Mathf.Min(s1, s + step); rows.Add(s); }
            for (int i = 0; i < rows.Count; i++)
            {
                for (int j = 0; j <= cols; j++)
                {
                    float x = (j / (float)cols * 2f - 1f) * halfWidth;
                    md.Add(new Vector3(x, y, rows[i]), Vector3.up, new Vector2(x, rows[i]));
                }
            }
            for (int i = 0; i < rows.Count - 1; i++)
            {
                for (int j = 0; j < cols; j++)
                {
                    int a = i * (cols + 1) + j, b = a + cols + 1;
                    md.Quad(a, b, b + 1, a + 1);
                }
            }
            return md.ToMesh(name);
        }
    }
}
