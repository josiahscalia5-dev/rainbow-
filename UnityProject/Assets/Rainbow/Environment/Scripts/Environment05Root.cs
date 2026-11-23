using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Marker on the root GameObject created by EnvironmentBuilder (Agent 2). Lets the builder find and replace its own
    /// objects (idempotent rebuild) and exposes the verified layout for other tools (read-only information).
    /// </summary>
    [DisallowMultipleComponent]
    public class Environment05Root : MonoBehaviour
    {
        [Tooltip("Tunnel radius used for this build (m).")] public float radius = DrumLayout05.Radius;
        [Tooltip("Tube bottom below the water (m); the axis is radius - floorDepth above the water.")] public float floorDepth = DrumLayout05.FloorDepth;
        [Tooltip("s of the far throat cap (m).")] public float throatS = DrumLayout05.ThroatS;
        [Tooltip("Gold ring positions (s, m).")] public float[] ringS = new float[0];
        [Tooltip("Paddle pair positions (s, m).")] public float[] paddleS = new float[0];
    }
}
