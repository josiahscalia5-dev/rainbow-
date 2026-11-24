using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Shared animation clock of Screen 05: water bands and waves, foam, bubbles, splash, walls, far river, throat glow,
    /// coin spin/bob and Benny's swim wobble all read it (shaders as the global <c>_RainbowTime</c>, C# as
    /// <see cref="Time"/>). It is ordinary game time - it advances by Time.deltaTime and stops while the game is paused,
    /// exactly like _Time.y / Time.time before - so the look and gameplay are unchanged. The difference: test tools can
    /// reset it (AgentScripts/screen05_hold_approved.cs does so when it restarts the run), so every still at the approved
    /// view shows the same animation phase and cycles can be compared exactly. Added 2026-11-23 (coordinator, Play Mode
    /// A/B test: before this, identical cycles differed by up to 4 points in the water areas only because of the phase).
    /// </summary>
    [DefaultExecutionOrder(-1000)]
    public sealed class Screen05Clock : MonoBehaviour
    {
        static readonly int TimeId = Shader.PropertyToID("_RainbowTime");

        /// <summary>Seconds of game time since the clock started (Play mode start) or was last reset.</summary>
        public static float Time { get; private set; }

        /// <summary>Sets the clock (and the shader global) to <paramref name="t"/> seconds.</summary>
        public static void Reset(float t = 0f)
        {
            Time = t;
            Shader.SetGlobalFloat(TimeId, t);
        }

        // "Reload Scene only" Play Mode keeps statics between Play sessions: start every session at 0.
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        static void ResetStatics() => Time = 0f;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void Boot()
        {
            var go = new GameObject("Screen05Clock");
            DontDestroyOnLoad(go);
            go.AddComponent<Screen05Clock>();
            Reset(0f);
        }

        void Update()
        {
            Time += UnityEngine.Time.deltaTime;
            Shader.SetGlobalFloat(TimeId, Time);
        }
    }
}
