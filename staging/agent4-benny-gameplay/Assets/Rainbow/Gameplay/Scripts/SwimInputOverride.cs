using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Test / autopilot input override (CONTRACT.md). While Active, BennyController ignores keyboard / touch / mouse and uses
    /// Steer (-1 = hard left ... +1 = hard right, continuous like the Three.js QA override) and JumpRequested
    /// (set it to true for one jump; the controller consumes it = sets it back to false when the jump starts or is refused
    /// because Benny is airborne).
    /// </summary>
    public static class SwimInputOverride
    {
        public static bool Active;
        public static float Steer;
        public static bool JumpRequested;

        /// <summary>Returns the pending jump request and clears it.</summary>
        public static bool ConsumeJump()
        {
            bool j = JumpRequested;
            JumpRequested = false;
            return j;
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        static void ResetStatics()
        {
            Active = false;
            Steer = 0f;
            JumpRequested = false;
        }
    }
}
