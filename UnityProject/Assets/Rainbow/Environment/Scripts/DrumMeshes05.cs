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
                    Vector3 inward = -outward.normalized;
                    Vector3 p = WallPoint(phi, si);
                    // geometry round 2026-11-24: the dented right wall foot (DrumLayout05.FootDent) gets the normal of the
                    // deformed surface (central differences; identical to the analytic one outside the dent)
                    if (sx > 0f && si > 14.5f && si < 30.5f && p.y < 2.8f)
                    {
                        const float ep = 0.004f, es = 0.05f;
                        Vector3 tP = WallPoint(phi + ep, si) - WallPoint(phi - ep, si);
                        Vector3 tS = WallPoint(phi, si + es) - WallPoint(phi, si - es);
                        Vector3 n = Vector3.Cross(tP, tS);
                        if (n.sqrMagnitude > 1e-12f)
                        {
                            n.Normalize();
                            inward = Vector3.Dot(n, inward) < 0f ? -n : n;
                        }
                    }
                    md.Add(p, inward, new Vector2(R * phi, si));
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

        /// <summary>
        /// Point of the tunnel wall at angle phi (0 = top, + = rider's right) and s: the drum circle, with the right wall
        /// foot moved toward the axis by DrumLayout05.FootDent (geometry round 2026-11-24).
        /// </summary>
        public static Vector3 WallPoint(float phi, float s)
        {
            float R = DrumLayout05.Radius;
            float x = R * Mathf.Sin(phi);
            float y = DrumLayout05.CentreY(s) + R * Mathf.Cos(phi);
            float dent = Mathf.Min(DrumLayout05.FootDent(s, x > 0f ? 1 : -1, y), 0.5f * Mathf.Abs(x));   // no fold at the bottom
            return new Vector3(DrumLayout05.AxisX + x - Mathf.Sign(x) * dent, y, s);
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
            // Tunnel round 3 (2026-11-23): a bundle of rounded strands like the approved rings (a fat main strand on the far
            // side, a middle strand, a thin lip on the camera side), separated by narrow dark grooves that sit ABOVE the
            // wall (b.baseHeight). Vertex colour per profile point: r = cavity (1 crest .. 0.3 groove), g = crest line,
            // b = strand (0 main, 0.5 middle, 1 lip): RainbowGoldMetal.hlsl RainbowRingMetal shades from it.
            float w = b.HalfWidth;
            var strands = new List<Vector3>();   // (half width m, crest height as a fraction of the radius, centre z)
            float zCursor = w;
            strands.Add(new Vector3(b.width * 0.5f, b.height, zCursor - b.width * 0.5f));
            zCursor -= b.width + b.groove;
            if (b.midWidth > 0f)
            {
                strands.Add(new Vector3(b.midWidth * 0.5f, b.midHeight, zCursor - b.midWidth * 0.5f));
                zCursor -= b.midWidth + b.groove;
            }
            strands.Add(new Vector3(b.lipWidth * 0.5f, b.lipHeight, zCursor - b.lipWidth * 0.5f));

            var prof = new List<ProfilePoint>();
            var dupFirst = new List<bool>();   // true for the first copy of a duplicated (crisp) corner
            var pcol = new List<Color>();
            void P(float r, float z, Color c) { prof.Add(new ProfilePoint(r, z)); dupFirst.Add(false); pcol.Add(c); }
            void Dup(float r, float z, Color c)
            {
                prof.Add(new ProfilePoint(r, z)); dupFirst.Add(true); pcol.Add(c);
                prof.Add(new ProfilePoint(r, z)); dupFirst.Add(false); pcol.Add(c);
            }
            var wallCol = new Color(0.3f, 0f, 0f, 1f);
            P(1.03f, w, wallCol);
            Dup(1.0f, w, wallCol);
            int ns = strands.Count;
            for (int j = 0; j < ns; j++)
            {
                float a = strands[j].x, h = strands[j].y, zc = strands[j].z;
                float sid = ns > 1 ? j / (float)(ns - 1) : 0f;
                float hFar = j == 0 ? 0f : b.baseHeight;           // the outer strand ends sit on the wall
                float hNear = j == ns - 1 ? 0f : b.baseHeight;
                int steps = j == 0 ? 14 : 10;
                for (int i = 1; i < steps; i++)
                {
                    float f = i / (float)steps * Mathf.PI;
                    float sn = Mathf.Sin(f);
                    float hb = Mathf.Lerp(hFar, hNear, i / (float)steps);
                    var c = new Color(Mathf.Lerp(0.3f, 1f, Mathf.Pow(sn, 0.7f)), Mathf.Pow(sn, 5f), sid, 1f);
                    P(1f - (hb + (h - hb) * sn), zc + a * Mathf.Cos(f), c);
                }
                float zEnd = zc - a;
                if (j < ns - 1)
                {
                    var gc = new Color(0.25f, 0f, sid, 1f);
                    Dup(1f - b.baseHeight, zEnd, gc);
                    P(1f - b.baseHeight * 0.6f, zEnd - b.groove * 0.5f, gc);
                    Dup(1f - b.baseHeight, zEnd - b.groove, gc);
                }
                else
                {
                    Dup(1.0f, -w, wallCol);
                }
            }
            P(1.03f, -w, wallCol);

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

            var md = new MeshData { hasColor = true };
            int ring = segments + 1;
            for (int i = 0; i < n; i++)
            {
                for (int k = 0; k <= segments; k++)
                {
                    float ang = 2f * Mathf.PI * k / segments;
                    float c = Mathf.Cos(ang), s = Mathf.Sin(ang);
                    float r = prof[i].rho * radius;
                    int v = md.Add(new Vector3(r * c, r * s, prof[i].z), new Vector3(n2[i].x * c, n2[i].x * s, n2[i].y),
                        new Vector2(k / (float)segments, i / (float)(n - 1)));
                    md.col[v] = pcol[i];
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
            // Tunnel round 3 (2026-11-23): the approved trays have a THICK ROUNDED polished rim (a half torus round the curved
            // edge of the D, ~1/4 of the tray's height on screen) round a smooth rose-copper dish; the old thin flared lip
            // read as a curled orange sheet. Profile (x = radius fraction, y = height in units of size, open side y = 0):
            // floor -> fillet -> rim tube (centre (0.875, 0.125), radius 0.125) from its inner side round the bottom to the
            // outside -> outer wall -> closed back at y = h.
            var pl = new List<Vector2> { new Vector2(0f, 0.2f), new Vector2(0.45f, 0.2f), new Vector2(0.7f, 0.2f), new Vector2(0.735f, 0.188f) };
            int rimStart = pl.Count;
            const float rcx = 0.875f, rcy = 0.125f, rr = 0.125f;
            for (int i = 0; i <= 8; i++)
            {
                float th = (165f + 210f * i / 8f) * Mathf.Deg2Rad;   // 165 deg (inner, upper) .. 375 deg (outer, upper)
                pl.Add(new Vector2(rcx + rr * Mathf.Cos(th), rcy + rr * Mathf.Sin(th)));
            }
            int rimEnd = pl.Count - 1;
            pl.Add(new Vector2(0.985f, Mathf.Max(0.24f, 0.62f * h)));
            pl.Add(new Vector2(0.93f, Mathf.Max(0.3f, 0.88f * h)));
            pl.Add(new Vector2(0.82f, Mathf.Max(0.32f, h)));
            pl.Add(new Vector2(0f, Mathf.Max(0.32f, h)));
            Vector2[] prof = pl.ToArray();
            // colours (linear rgb, a = polish): the dish is a smooth rose-copper mirror (it reflects the violet walls), the
            // rim orange-gold with a pale crest, the outer wall orange, the back plum (against the drum, rarely seen)
            Color dish = new Color(0.62f, 0.25f, 0.24f, 0.75f);         // (207,137,134) rose copper
            Color dishEdge = new Color(0.72f, 0.30f, 0.2f, 0.85f);
            Color gold = new Color(0.8678f, 0.4731f, 0.2587f, 1f);      // (252,165,95)
            Color pale = new Color(0.9089f, 0.6835f, 0.3326f, 1f);      // (249,205,112)
            Color orange = new Color(0.7866f, 0.2857f, 0.1249f, 0.9f);  // (250,119,38)
            Color plum = new Color(0.298f, 0.0954f, 0.168f, 0.3f);      // (150,40,92)
            var pcl = new List<Color> { dish, dish, dishEdge, gold };
            for (int i = rimStart; i <= rimEnd; i++)
            {
                float t = (i - rimStart) / (float)(rimEnd - rimStart);            // 0 inner .. 1 outer
                pcl.Add(Color.Lerp(gold, pale, Mathf.Exp(-Mathf.Pow((t - 0.45f) / 0.18f, 2f))));
            }
            pcl.Add(orange); pcl.Add(orange); pcl.Add(plum); pcl.Add(plum);
            Color[] pc = pcl.ToArray();

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
