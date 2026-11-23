using System;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>One entry of the autopilot program: from course distance fromS on, use mode (until the next entry).</summary>
    [Serializable]
    public struct Screen05AutopilotSegment
    {
        [Tooltip("Course distance s (= Benny's world Z) where this segment starts.")]
        public float fromS;

        [Tooltip("Steering behaviour from fromS until the next segment.")]
        public Screen05AutopilotMode mode;

        public Screen05AutopilotSegment(float fromS, Screen05AutopilotMode mode)
        {
            this.fromS = fromS;
            this.mode = mode;
        }
    }
}
