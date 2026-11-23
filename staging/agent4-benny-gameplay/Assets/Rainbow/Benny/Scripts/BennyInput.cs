using UnityEngine;
#if ENABLE_INPUT_SYSTEM
using UnityEngine.InputSystem;
#endif

namespace Rainbow.Screen05
{
    /// <summary>
    /// Player input for the swim: keyboard A/D or Left/Right = steer, Space/W/Up = jump, Esc/P = pause;
    /// touch or mouse: drag left/right from where the finger went down (or hold on the left / right side) = steer,
    /// a quick swipe up = jump. New Input System when ENABLE_INPUT_SYSTEM, otherwise the legacy Input Manager.
    /// Steer is continuous (-1..1) like the Three.js QA steering; BennyController smooths it into sideways speed.
    /// </summary>
    public class BennyInput : MonoBehaviour
    {
        [Tooltip("finger travel (share of screen width) for full steering")]
        public float dragFullSteer = 0.10f;
        [Tooltip("swipe-up distance (share of screen height) that triggers a jump")]
        public float swipeUpDistance = 0.07f;
        public float swipeUpMaxTime = 0.4f;
        [Tooltip("presses that start in this top share of the screen belong to the HUD (pause button)")]
        public float hudTopShare = 0.12f;

        public float Steer { get; private set; }

        bool jumpQueued, pauseQueued;
        bool pointerDown, gestureJumped;
        Vector2 pointerStart;
        float pointerStartTime;

        public bool ConsumeJump() { bool j = jumpQueued; jumpQueued = false; return j; }
        public bool ConsumePause() { bool p = pauseQueued; pauseQueued = false; return p; }

        void OnDisable()
        {
            Steer = 0f;
            pointerDown = false;
            jumpQueued = false;
        }

        void Update()
        {
            float keySteer = 0f;
            bool jumpKey = false, pauseKey = false;
            bool pressed = false;
            Vector2 pos = Vector2.zero;

#if ENABLE_INPUT_SYSTEM
            Keyboard kb = Keyboard.current;
            if (kb != null)
            {
                if (kb.aKey.isPressed || kb.leftArrowKey.isPressed) keySteer -= 1f;
                if (kb.dKey.isPressed || kb.rightArrowKey.isPressed) keySteer += 1f;
                jumpKey = kb.spaceKey.wasPressedThisFrame || kb.wKey.wasPressedThisFrame || kb.upArrowKey.wasPressedThisFrame;
                pauseKey = kb.escapeKey.wasPressedThisFrame || kb.pKey.wasPressedThisFrame;
            }
            Touchscreen ts = Touchscreen.current;
            if (ts != null && ts.primaryTouch.press.isPressed)
            {
                pressed = true;
                pos = ts.primaryTouch.position.ReadValue();
            }
            else
            {
                Mouse mouse = Mouse.current;
                if (mouse != null && mouse.leftButton.isPressed)
                {
                    pressed = true;
                    pos = mouse.position.ReadValue();
                }
            }
#else
            if (Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.LeftArrow)) keySteer -= 1f;
            if (Input.GetKey(KeyCode.D) || Input.GetKey(KeyCode.RightArrow)) keySteer += 1f;
            jumpKey = Input.GetKeyDown(KeyCode.Space) || Input.GetKeyDown(KeyCode.W) || Input.GetKeyDown(KeyCode.UpArrow);
            pauseKey = Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown(KeyCode.P);
            if (Input.touchCount > 0)
            {
                Touch t = Input.GetTouch(0);
                if (t.phase != TouchPhase.Ended && t.phase != TouchPhase.Canceled)
                {
                    pressed = true;
                    pos = t.position;
                }
            }
            else if (Input.GetMouseButton(0))
            {
                pressed = true;
                pos = Input.mousePosition;
            }
#endif
            if (jumpKey) jumpQueued = true;
            if (pauseKey) pauseQueued = true;

            float w = Mathf.Max(1f, Screen.width), h = Mathf.Max(1f, Screen.height);
            float pointerSteer = 0f;
            if (pressed)
            {
                if (!pointerDown)
                {
                    // new gesture (ignored when it starts on the HUD bar)
                    if (pos.y < h * (1f - hudTopShare))
                    {
                        pointerDown = true;
                        gestureJumped = false;
                        pointerStart = pos;
                        pointerStartTime = Time.unscaledTime;
                    }
                }
                if (pointerDown)
                {
                    float dx = pos.x - pointerStart.x;
                    float dy = pos.y - pointerStart.y;
                    float held = Time.unscaledTime - pointerStartTime;
                    // swipe up = jump (once per gesture); afterwards the vertical reference follows the finger
                    if (!gestureJumped && dy > swipeUpDistance * h && dy > Mathf.Abs(dx) && held <= swipeUpMaxTime)
                    {
                        jumpQueued = true;
                        gestureJumped = true;
                    }
                    pointerSteer = Mathf.Clamp(dx / (dragFullSteer * w), -1f, 1f);
                    // "hold left / right": finger resting on the outer part of the screen
                    if (Mathf.Abs(dx) < 0.02f * w && held > 0.18f && !gestureJumped)
                    {
                        if (pos.x < 0.38f * w) pointerSteer = -1f;
                        else if (pos.x > 0.62f * w) pointerSteer = 1f;
                    }
                }
            }
            else
            {
                pointerDown = false;
            }

            Steer = Mathf.Clamp(keySteer + pointerSteer, -1f, 1f);
        }
    }
}
