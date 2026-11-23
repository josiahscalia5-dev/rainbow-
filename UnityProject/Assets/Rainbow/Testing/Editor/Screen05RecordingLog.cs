using System;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>The small JSON log written next to every gameplay recording (same name, .json).</summary>
    [Serializable]
    public class Screen05RecordingLog
    {
        public string mp4;
        public string firstFramePng;
        public string lastFramePng;
        public string result;
        public int width;
        public int height;
        public int fps;
        public int framesPlanned;
        public int framesWritten;
        public float secondsRecorded;
        public bool hudIncluded;
        public bool flipVertical;
        public bool teleportedToStart;

        public int coinsCollected;
        public int jumpsRequested;
        public float minLateralX;
        public float maxLateralX;
        public float startS;
        public float endS;
        public int hardLeftFrames;
        public int hardRightFrames;
        public bool finishedEventFired;
        public int ringsPassedBySpacing;
        public int ringsPassedSceneObjects;
        public int ringObjectsFound;

        public string hooks;
        public string startedUtc;
        public string finishedUtc;
        public double wallSeconds;
        public string notes;
    }
}
