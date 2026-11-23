namespace Rainbow.Screen05
{
    /// <summary>What the test autopilot does on one stretch of the course.</summary>
    public enum Screen05AutopilotMode
    {
        /// <summary>Follow the coin line: target x = RiverPath.Meander(s + lookAhead).</summary>
        CoinLine = 0,
        /// <summary>Full left steering (Steer = -1) until the next segment.</summary>
        HardLeft = 1,
        /// <summary>Full right steering (Steer = +1) until the next segment.</summary>
        HardRight = 2,
    }
}
