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

        void LateUpdate()
        {
            Action<int> handler = LateFrame;
            if (handler != null) handler(Time.frameCount);
        }
    }
}
