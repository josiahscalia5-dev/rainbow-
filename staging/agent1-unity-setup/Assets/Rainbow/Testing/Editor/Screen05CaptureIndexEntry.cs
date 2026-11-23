using System;
using UnityEngine;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>One still of a moving-view series (an item of index.json).</summary>
    [Serializable]
    public class Screen05CaptureIndexEntry
    {
        public string file;
        public string label;
        /// <summary>Requested course distance s and lateral world X (TeleportTo arguments before lead compensation).</summary>
        public float sRequested;
        public float xRequested;
        /// <summary>Where TeleportTo actually placed Benny (s minus the measured settle advance).</summary>
        public float sTeleported;
        /// <summary>Benny's world position at the moment of capture (s = z, lateral = x).</summary>
        public float bennyWorldX;
        public float bennyWorldY;
        public float bennyWorldZ;
        public bool hasController;
        public float controllerS;
        public float controllerLateralX;
        public int frame;
        public float time;
        public string utc;
        public Vector3 cameraPosition;
        public Vector3 cameraEuler;
        public float cameraFieldOfView;
        public int hudCanvases;
    }
}
