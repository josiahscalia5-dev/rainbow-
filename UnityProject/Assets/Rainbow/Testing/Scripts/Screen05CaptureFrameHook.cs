using System;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// TEST-ONLY helper created by the gameplay recorder (Assets/Rainbow/Testing/Editor). It raises LateFrame once
    /// per player frame, AFTER every other LateUpdate (Cinemachine's brain included), so the recorder grabs
    /// exactly one video frame per game frame with the camera already in place.
    /// </summary>
    [DefaultExecutionOrder(30000)]
    [AddComponentMenu("")]
    public class Screen05CaptureFrameHook : MonoBehaviour
    {
        /// <summary>Raised from LateUpdate with Time.frameCount.</summary>
        public static event Action<int> LateFrame;

        // Faster Play Mode ("Reload Scene only", no domain reload): drop handlers left over from an earlier Play
        // session at the start of every Play session, exactly as the domain reload used to.
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        static void ResetStatics() { LateFrame = null; }

        void LateUpdate()
        {
            Action<int> handler = LateFrame;
            if (handler != null) handler(Time.frameCount);
        }
    }
}
