using System;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Cross-area runtime hooks for Screen 05 (CONTRACT.md). Other areas subscribe with += / -= and may read BennyS.
    /// Raised only by the gameplay code (Agent 4) through the Raise* helpers.
    /// </summary>
    public static class Screen05Events
    {
        /// <summary>A coin was picked up at this world position.</summary>
        public static event Action<Vector3> CoinCollected;
        /// <summary>Benny reached RiverPath.FinishS (end screen shown).</summary>
        public static event Action Finished;
        /// <summary>The run was restarted from the start.</summary>
        public static event Action Restarted;

        /// <summary>Benny's current s (RiverPath distance along the tunnel line = world Z of his route point).</summary>
        public static float BennyS = RiverPath.StartS;

        public static void RaiseCoinCollected(Vector3 worldPos) { CoinCollected?.Invoke(worldPos); }
        public static void RaiseFinished() { Finished?.Invoke(); }
        public static void RaiseRestarted() { Restarted?.Invoke(); }

        // Static state survives Play-mode entry when "Enter Play Mode Options / no domain reload" is used: reset it.
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        static void ResetStatics()
        {
            CoinCollected = null;
            Finished = null;
            Restarted = null;
            BennyS = RiverPath.StartS;
        }
    }
}
