// PLAY MODE (best while paused with screen05_hold_approved.cs). Unity Frame Debugger snapshot of one Game-view frame:
// how many events, and which objects / effects are drawn (to find missing, hidden or wrongly blended effects).
// Writes the full event list to Recordings/Screen05/framedebug_<time>.txt, returns a summary, and switches the Frame Debugger off again.
var flags = System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static | System.Reflection.BindingFlags.Instance;
var asm = typeof(UnityEditor.Editor).Assembly;
var util = asm.GetType("UnityEditorInternal.FrameDebuggerInternal.FrameDebuggerUtility");
var winType = asm.GetType("UnityEditor.FrameDebuggerWindow");
if (util == null || winType == null) return "Frame Debugger API not found in this Unity version";
var countProp = util.GetProperty("count", flags);
var nameM = util.GetMethod("GetFrameEventInfoName", flags);
var objM = util.GetMethod("GetFrameEventObject", flags);
var eventsM = util.GetMethod("GetFrameEvents", flags);
var openM = winType.GetMethod("OpenWindow", flags);
var toggleM = winType.GetMethod("ToggleFrameDebuggerEnabled", flags);
var win = openM.Invoke(null, null);
if ((int)countProp.GetValue(null) == 0) toggleM.Invoke(toggleM.IsStatic ? null : win, null);
await Wait.Until(() => (int)countProp.GetValue(null) > 0, timeoutMs: 20000, because: "the Frame Debugger did not capture a frame");
double t0 = EditorApplication.timeSinceStartup; // give it a moment to fill every event (works while paused)
await Wait.Until(() => EditorApplication.timeSinceStartup > t0 + 1.5, timeoutMs: 10000, because: "settle");
int n = (int)countProp.GetValue(null);
var evs = (System.Array)eventsM.Invoke(null, null);
var sb = new System.Text.StringBuilder();
var perObj = new System.Collections.Generic.Dictionary<string, int>();
for (int i = 0; i < n; i++)
{
    string name = (string)nameM.Invoke(null, new object[] { i });
    var obj = objM.Invoke(null, new object[] { i }) as UnityEngine.Object;
    string type = "";
    if (evs != null && i < evs.Length) { var ev = evs.GetValue(i); var tf = ev.GetType().GetField("m_Type", flags); if (tf != null) type = tf.GetValue(ev).ToString(); }
    string on = obj != null ? obj.name : "-";
    sb.AppendLine(i.ToString("000") + "  " + type + "  " + name + "  [" + on + "]");
    if (obj != null) { int c; perObj.TryGetValue(on, out c); perObj[on] = c + 1; }
}
toggleM.Invoke(toggleM.IsStatic ? null : win, null); // off again
string dir = System.IO.Path.GetFullPath("Recordings/Screen05");
System.IO.Directory.CreateDirectory(dir);
string file = System.IO.Path.Combine(dir, "framedebug_" + System.DateTime.Now.ToString("yyyyMMdd_HHmmss") + ".txt");
System.IO.File.WriteAllText(file, sb.ToString());
var summary = new System.Text.StringBuilder();
summary.AppendLine(n + " frame events -> " + file);
foreach (var kv in perObj.OrderByDescending(k => k.Value).Take(40)) summary.Append(kv.Key + " x" + kv.Value + "; ");
return summary.ToString();
