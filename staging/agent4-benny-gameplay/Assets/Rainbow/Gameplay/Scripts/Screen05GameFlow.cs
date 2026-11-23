using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Game flow of the Screen 05 test section: start -> swim (coins +10 each, 5 hearts, foam-bank bumps cost a heart,
    /// 0 hearts = restart with full hearts) -> finish at RiverPath.FinishS (end panel) -> Restart.
    /// Pause button / Esc / P toggles Time.timeScale. Score starts at the approved picture's 1,420 (course.ts refCoins 05).
    /// </summary>
    [DefaultExecutionOrder(-40)]
    public class Screen05GameFlow : MonoBehaviour
    {
        public enum State { Swimming, Finished }

        public BennyController benny;
        public CoinTrail coins;
        public Screen05Hud hud;
        public int startCoins = 1420;
        public int coinValue = 10;
        public int maxHearts = 5;
        public float finishS = RiverPath.FinishS;
        public string hint = "Drag or hold left / right to steer • swipe up to jump";

        public State Current { get; private set; }
        public int Score { get; private set; }
        public int Hearts { get; private set; }
        public bool Paused { get; private set; }

        void Awake()
        {
            if (benny == null) benny = FindAnyObjectByType<BennyController>();
            if (coins == null) coins = FindAnyObjectByType<CoinTrail>();
            if (hud == null) hud = FindAnyObjectByType<Screen05Hud>();
        }

        void OnEnable()
        {
            Screen05Events.CoinCollected += OnCoin;
            if (benny != null) benny.BankBumped += OnBankBump;
        }

        void OnDisable()
        {
            Screen05Events.CoinCollected -= OnCoin;
            if (benny != null) benny.BankBumped -= OnBankBump;
            if (Paused) Time.timeScale = 1f;
        }

        void Start()
        {
            if (hud != null)
            {
                if (hud.pauseButton != null) hud.pauseButton.onClick.AddListener(TogglePause);
                if (hud.restartButton != null) hud.restartButton.onClick.AddListener(Restart);
            }
            StartRun(false);
        }

        void StartRun(bool raiseRestart)
        {
            Time.timeScale = 1f;
            Paused = false;
            Current = State.Swimming;
            Score = startCoins;
            Hearts = maxHearts;
            if (benny != null) benny.BeginRun(benny.startS);
            if (hud != null)
            {
                hud.HideFinish();
                hud.SetPaused(false);
                hud.SetHearts(Hearts, maxHearts);
                hud.SetCoins(Score, false);
                hud.ShowHint(hint, 3.5f);
            }
            if (raiseRestart) Screen05Events.RaiseRestarted();
        }

        public void Restart()
        {
            StartRun(true);
        }

        public void TogglePause()
        {
            if (Current != State.Swimming) return;
            Paused = !Paused;
            Time.timeScale = Paused ? 0f : 1f;
            if (hud != null) hud.SetPaused(Paused);
        }

        void OnCoin(Vector3 pos)
        {
            Score += coinValue;
            if (hud != null) hud.SetCoins(Score, true);
        }

        void OnBankBump()
        {
            if (Current != State.Swimming) return;
            Hearts = Mathf.Max(0, Hearts - 1);
            if (hud != null) { hud.SetHearts(Hearts, maxHearts); hud.FlashHurt(); }
            if (Hearts == 0) Restart();
        }

        void Update()
        {
            BennyInput input = benny != null ? benny.input : null;
            if (input != null && input.ConsumePause())
            {
                if (Current == State.Finished) Restart(); else TogglePause();
            }
            if (Current == State.Swimming && !Paused && benny != null && benny.S >= finishS)
            {
                Current = State.Finished;
                benny.StopSwimming();
                int collected = coins != null ? coins.CollectedCount : 0;
                int total = coins != null ? coins.PlayableCount : 0;
                if (hud != null) hud.ShowFinish(collected, total, Score);
                Screen05Events.RaiseFinished();
            }
        }
    }
}
