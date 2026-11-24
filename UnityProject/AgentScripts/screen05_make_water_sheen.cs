// Edit mode. Measures the colour ramp and the broad sheen of the approved water (WaterTextureFactory.MakeRamp, WaterSheenFactory.Make).
string p = @"C:\RainbowUnity\references\05_flow_into_the_current.png";
p = p.Replace("\\\\", "\\");
string a = Rainbow.Screen05.EditorTools.WaterTextureFactory.MakeRamp(p);
return a + " | " + Rainbow.Screen05.EditorTools.WaterSheenFactory.Make(p, Rainbow.Screen05.EditorTools.WaterTextureFactory.LastDisplayRamp);
