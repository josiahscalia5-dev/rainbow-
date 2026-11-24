using System;
public static class Cam {
  public static double px, py, pz, pitch, yaw, fov = 62;
  public static double W = 864, H = 1536;
  static double F { get { return (H * 0.5) / Math.Tan(fov * 0.5 * Math.PI / 180); } }
  // Unity: rotation = Euler(pitch, yaw, 0) = Ry(yaw) * Rx(pitch); camera basis vectors in world
  static void Basis(out double[] r, out double[] u, out double[] f) {
    double a = pitch * Math.PI / 180, b = yaw * Math.PI / 180;
    // Rx(a): forward (0,0,1) -> (0, -sin a, cos a); up (0,1,0) -> (0, cos a, sin a); right (1,0,0)
    // Ry(b): (x, y, z) -> (x cos b + z sin b, y, -x sin b + z cos b)
    double[] f0 = { 0, -Math.Sin(a), Math.Cos(a) }, u0 = { 0, Math.Cos(a), Math.Sin(a) }, r0 = { 1, 0, 0 };
    Func<double[], double[]> ry = v => new double[] { v[0] * Math.Cos(b) + v[2] * Math.Sin(b), v[1], -v[0] * Math.Sin(b) + v[2] * Math.Cos(b) };
    r = ry(r0); u = ry(u0); f = ry(f0);
  }
  public static double[] Project(double x, double y, double z) {
    double[] r, u, f; Basis(out r, out u, out f);
    double dx = x - px, dy = y - py, dz = z - pz;
    double cx = dx * r[0] + dy * r[1] + dz * r[2], cy = dx * u[0] + dy * u[1] + dz * u[2], cz = dx * f[0] + dy * f[1] + dz * f[2];
    if (cz <= 0.01) return new double[] { double.NaN, double.NaN, cz };
    return new double[] { W * 0.5 + F * cx / cz, H * 0.5 - F * cy / cz, cz };
  }
  // ray through screen pixel intersected with the horizontal plane y = h
  public static double[] Unproject(double sx, double sy, double h) {
    double[] r, u, f; Basis(out r, out u, out f);
    double cx = (sx - W * 0.5) / F, cy = -(sy - H * 0.5) / F;
    double[] d = { f[0] + cx * r[0] + cy * u[0], f[1] + cx * r[1] + cy * u[1], f[2] + cx * r[2] + cy * u[2] };
    double t = (h - py) / d[1];
    return new double[] { px + t * d[0], h, pz + t * d[2], t };
  }
}
