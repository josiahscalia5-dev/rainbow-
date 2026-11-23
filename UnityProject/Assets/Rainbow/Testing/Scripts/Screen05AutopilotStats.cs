using System;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>What happened during one autopilot run (written into the recording log by the capture tools).</summary>
    [Serializable]
    public class Screen05AutopilotStats
    {
        public int frames;
        public float seconds;
        public bool hasSample;
        public float startS;
        public float endS;
        public float minLateralX;
        public float maxLateralX;
        public int coinsCollected;
        public int jumpsRequested;
        public int hardLeftFrames;
        public int hardRightFrames;
        public bool finishedEvent;
        public string hooks = "";

        /// <summary>Records one frame of Benny's world position (s = z, lateral = x).</summary>
        public void Sample(float s, float lateralX, float deltaTime)
        {
            frames++;
            seconds += deltaTime;
            if (!hasSample)
            {
                hasSample = true;
                startS = s;
                minLateralX = lateralX;
                maxLateralX = lateralX;
            }
            endS = s;
            minLateralX = Mathf.Min(minLateralX, lateralX);
            maxLateralX = Mathf.Max(maxLateralX, lateralX);
        }
    }
}
