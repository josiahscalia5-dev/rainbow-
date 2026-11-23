// READ-ONLY. Lists the (internal) Frame Debugger API of this Unity version, so the evidence scripts can enable it
// and read the draw-call list. Nothing is changed.
var sb = new System.Text.StringBuilder();
foreach (var asm in System.AppDomain.CurrentDomain.GetAssemblies())
{
    System.Type[] types;
    try { types = asm.GetTypes(); } catch { continue; }
    foreach (var t in types)
    {
        if (t.Name != "FrameDebuggerUtility" && t.Name != "FrameDebuggerEvent" && t.Name != "FrameDebuggerEventData" && t.Name != "FrameDebuggerWindow") continue;
        sb.AppendLine("== " + t.FullName + " (" + asm.GetName().Name + ")");
        foreach (var m in t.GetMembers(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.DeclaredOnly))
        {
            if (m.MemberType == System.Reflection.MemberTypes.Method && ((System.Reflection.MethodInfo)m).IsSpecialName) continue;
            sb.AppendLine("   " + m.MemberType + " " + m.ToString());
        }
    }
}
return sb.ToString();
