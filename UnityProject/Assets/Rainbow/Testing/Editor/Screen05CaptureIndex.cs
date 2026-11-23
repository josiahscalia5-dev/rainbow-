using System;
using System.Collections.Generic;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>index.json written next to a moving-view series.</summary>
    [Serializable]
    public class Screen05CaptureIndex
    {
        public string folder;
        public int width;
        public int height;
        public bool hudIncluded;
        public int settleFrames;
        public int captureFramerate;
        public string startedUtc;
        public string finishedUtc;
        public string result;
        public string hooks;
        public string notes;
        public List<Screen05CaptureIndexEntry> items = new List<Screen05CaptureIndexEntry>();
    }
}
