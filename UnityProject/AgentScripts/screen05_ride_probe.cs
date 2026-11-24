// PLAY MODE paused at the hold: prints Benny's floating state (calibration of BennyController.RideRef) and bone poses.
var b = Rainbow.Screen05.BennyController.Instance;
System.Func<string, float> f = (n) => (float)typeof(Rainbow.Screen05.BennyController).GetField(n, System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance).GetValue(b);
var a = b.swimAnimator;
return "y " + b.transform.position.y.ToString("0.0000") + " waterSm " + f("waterSm").ToString("0.0000") + " ride " + f("ride").ToString("0.0000") + " heading " + b.HeadingDeg.ToString("0.00")
  + " | bob " + a.bob.localPosition.ToString("F4") + " " + a.bob.localEulerAngles.ToString("F2") + " squash " + a.squash.localScale.ToString("F3") + " lean " + a.lean.localEulerAngles.ToString("F2")
  + " armL " + a.armL.localEulerAngles.ToString("F1") + " armR " + a.armR.localEulerAngles.ToString("F1") + " visual " + b.visual.localEulerAngles.ToString("F2") + b.visual.localPosition.ToString("F3");
