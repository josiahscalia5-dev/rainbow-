using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Keeps the soft pink fill light at the main camera, like src/game/Game.ts (fill.position.copy(camera.position)).
    /// Agent 3 lighting; it only reads Camera.main, so it has no dependency on the gameplay code.
    /// </summary>
    [DefaultExecutionOrder(1000)]
    [AddComponentMenu("Rainbow/Water/Camera Fill Light")]
    public class CameraFillLight : MonoBehaviour
    {
        void LateUpdate()
        {
            Camera cam = Camera.main;
            if (cam != null) transform.position = cam.transform.position;
        }
    }
}
