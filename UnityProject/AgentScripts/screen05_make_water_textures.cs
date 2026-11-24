// Edit mode. Makes the two textures of the flowing water (WaterTextureFactory): the procedural silk texture and the colour ramp
// (colour statistics of the approved water by streamline coordinate). Run once; WaterBuilder only assigns them.
string a = Rainbow.Screen05.EditorTools.WaterTextureFactory.MakeSilk();
string b = Rainbow.Screen05.EditorTools.WaterTextureFactory.MakeRamp(@"C:\RainbowUnity\references\05_flow_into_the_current.png");
return a + " | " + b;
