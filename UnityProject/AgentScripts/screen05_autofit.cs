// Coordinator: run the automatic look fitter while paused at the hold (Play mode). Input: Recordings/Screen05/work/autofit_params.txt, time budget in
// Recordings/Screen05/work/autofit_seconds.txt (default 120). Output: Recordings/Screen05/work/autofit_result.txt (tuning lines) + the log.
float sec = 120f; var ci = System.Globalization.CultureInfo.InvariantCulture;
if (System.IO.File.Exists("Recordings/Screen05/work/autofit_seconds.txt")) float.TryParse(System.IO.File.ReadAllText("Recordings/Screen05/work/autofit_seconds.txt").Trim(), System.Globalization.NumberStyles.Float, ci, out sec);
string r = Rainbow.Screen05.EditorTools.Screen05AutoFit.Run("Recordings/Screen05/work/autofit_params.txt", "Recordings/Screen05/work/autofit_result.txt", sec);
System.IO.File.AppendAllText("Recordings/Screen05/work/autofit_log.txt", System.DateTime.Now.ToString("HH:mm:ss") + "\n" + r + "\n");
return r;
