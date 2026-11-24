using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Keeps the swim fluid on weak GPUs: lowers URP's render scale in small steps while real frames take longer than <see cref="slowMs"/>, raises
    /// it again when there is headroom. Full resolution whenever frames are captured (Time.captureFramerate &gt; 0), so stills and recordings are
    /// never affected. The pipeline asset's own value is restored when Play ends.
    /// </summary>
    public class Screen05RenderScale : MonoBehaviour
    {
        [Range(0.5f, 1f)] public float minScale = 0.7f;
        public float slowMs = 34.5f, fastMs = 25f, interval = 1.2f;

        UniversalRenderPipelineAsset urp;
        float original = 1f, scale = 1f, sum, next;
        int n;

        void OnEnable()
        {
            urp = GraphicsSettings.currentRenderPipeline as UniversalRenderPipelineAsset;
            if (urp == null) { enabled = false; return; }
            original = urp.renderScale;
            scale = original;
            next = Time.realtimeSinceStartup + 2.5f;          // the far scenery is built during the first second
            sum = 0f; n = 0;
        }

        void OnDisable()
        {
            if (urp != null) urp.renderScale = original;
        }

        void Update()
        {
            if (Time.captureFramerate > 0)
            {
                if (urp.renderScale != original) urp.renderScale = original;
                scale = original;
                sum = 0f; n = 0; next = Time.realtimeSinceStartup + 1f;
                return;
            }
            float dt = Time.unscaledDeltaTime;
            if (dt > 0.25f) return;                           // loading / Editor hiccup
            sum += dt; n++;
            if (Time.realtimeSinceStartup < next || n < 15) return;
            float ms = 1000f * sum / n;
            sum = 0f; n = 0; next = Time.realtimeSinceStartup + interval;
            float want = scale;
            if (ms > slowMs) want = Mathf.Max(minScale, scale - 0.08f);
            else if (ms < fastMs) want = Mathf.Min(original, scale + 0.04f);
            if (Mathf.Abs(want - scale) > 0.001f) { scale = want; urp.renderScale = scale; }
        }
    }
}
