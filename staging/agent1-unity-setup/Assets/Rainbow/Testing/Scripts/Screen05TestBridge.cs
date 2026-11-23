using System;
using System.Reflection;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// TEST-ONLY bridge to the gameplay hooks fixed by CONTRACT.md:
    ///   SwimInputOverride (static Active / Steer / JumpRequested),
    ///   BennyController (static Instance, S, LateralX, TeleportTo(s, lateralX)),
    ///   Screen05Events (static CoinCollected / Finished events, static BennyS).
    /// Everything is resolved by reflection (like the coordinator's Screen05SceneBuilder), so the Testing
    /// folder compiles in any integration order - even before Agent 4's Gameplay scripts exist. A hook that
    /// is missing simply reports "not available"; Describe() says which hooks were found.
    /// No per-frame allocations: boxed steer values are cached (steer is quantised to 0.01).
    /// </summary>
    public static class Screen05TestBridge
    {
        public const string OverrideTypeName = "Rainbow.Screen05.SwimInputOverride";
        public const string BennyTypeName = "Rainbow.Screen05.BennyController";
        public const string EventsTypeName = "Rainbow.Screen05.Screen05Events";

        const BindingFlags StaticFlags = BindingFlags.Public | BindingFlags.Static;
        const BindingFlags InstanceFlags = BindingFlags.Public | BindingFlags.Instance;

        static bool s_Resolved;
        static Type s_OverrideType, s_BennyType, s_EventsType;
        static MemberInfo s_Active, s_Steer, s_Jump;
        static MemberInfo s_Instance, s_S, s_LateralX;
        static MethodInfo s_Teleport;
        static EventInfo s_CoinEvent, s_FinishedEvent;
        static FieldInfo s_CoinField, s_FinishedField;
        static MemberInfo s_BennyS;

        static readonly object s_True = true;
        static readonly object s_False = false;
        static readonly object[] s_SteerBoxes = BuildSteerBoxes();

        static object[] BuildSteerBoxes()
        {
            var boxes = new object[201];
            for (int i = 0; i < boxes.Length; i++) boxes[i] = (i - 100) / 100f;
            return boxes;
        }

        /// <summary>Resolves the hook types once (call with force=true to look again).</summary>
        public static void Resolve(bool force = false)
        {
            if (s_Resolved && !force) return;
            s_Resolved = true;

            s_OverrideType = FindType(OverrideTypeName);
            s_BennyType = FindType(BennyTypeName);
            s_EventsType = FindType(EventsTypeName);

            s_Active = FindMember(s_OverrideType, "Active", StaticFlags);
            s_Steer = FindMember(s_OverrideType, "Steer", StaticFlags);
            s_Jump = FindMember(s_OverrideType, "JumpRequested", StaticFlags);

            s_Instance = FindMember(s_BennyType, "Instance", StaticFlags);
            s_S = FindMember(s_BennyType, "S", InstanceFlags);
            s_LateralX = FindMember(s_BennyType, "LateralX", InstanceFlags);
            s_Teleport = s_BennyType != null
                ? s_BennyType.GetMethod("TeleportTo", InstanceFlags, null, new[] { typeof(float), typeof(float) }, null)
                : null;

            s_CoinEvent = s_EventsType != null ? s_EventsType.GetEvent("CoinCollected", StaticFlags) : null;
            s_FinishedEvent = s_EventsType != null ? s_EventsType.GetEvent("Finished", StaticFlags) : null;
            s_CoinField = s_EventsType != null ? s_EventsType.GetField("CoinCollected", StaticFlags) : null;
            s_FinishedField = s_EventsType != null ? s_EventsType.GetField("Finished", StaticFlags) : null;
            s_BennyS = FindMember(s_EventsType, "BennyS", StaticFlags);
        }

        public static bool HasInputOverride { get { Resolve(); return s_Active != null && s_Steer != null; } }
        public static bool HasBenny { get { Resolve(); return s_Instance != null; } }
        public static bool CanTeleport { get { Resolve(); return s_Instance != null && s_Teleport != null; } }

        /// <summary>Sets SwimInputOverride.Active and .Steer (-1..1). Returns false when the hook is missing.</summary>
        public static bool SetOverride(bool active, float steer)
        {
            Resolve();
            if (s_Active == null || s_Steer == null) return false;
            int index = Mathf.Clamp(Mathf.RoundToInt(Mathf.Clamp(steer, -1f, 1f) * 100f) + 100, 0, 200);
            bool ok = SetValue(s_Steer, null, s_SteerBoxes[index]);
            ok &= SetValue(s_Active, null, active ? s_True : s_False);
            return ok;
        }

        /// <summary>Sets SwimInputOverride.JumpRequested = true (the controller consumes it).</summary>
        public static bool RequestJump()
        {
            Resolve();
            return s_Jump != null && SetValue(s_Jump, null, s_True);
        }

        /// <summary>Gives control back to keyboard/touch: Active = false, Steer = 0, JumpRequested = false.</summary>
        public static void ReleaseOverride()
        {
            Resolve();
            if (s_Steer != null) SetValue(s_Steer, null, s_SteerBoxes[100]);
            if (s_Jump != null) SetValue(s_Jump, null, s_False);
            if (s_Active != null) SetValue(s_Active, null, s_False);
        }

        /// <summary>BennyController.Instance as a Component (null when missing or destroyed).</summary>
        public static Component GetBenny()
        {
            Resolve();
            if (s_Instance == null) return null;
            var component = GetValue(s_Instance, null) as Component;
            return component != null ? component : null;
        }

        /// <summary>BennyController.S and .LateralX (falls back to the transform's world z / x).</summary>
        public static bool TryGetBennyState(out float s, out float lateralX)
        {
            s = 0f;
            lateralX = 0f;
            var benny = GetBenny();
            if (benny == null) return false;
            Vector3 p = benny.transform.position;
            object vs = GetValue(s_S, benny);
            object vx = GetValue(s_LateralX, benny);
            s = vs is float fs ? fs : p.z;
            lateralX = vx is float fx ? fx : p.x;
            return true;
        }

        /// <summary>Calls BennyController.Instance.TeleportTo(s, lateralX). Returns false when unavailable or it threw.</summary>
        public static bool TeleportBenny(float s, float lateralX)
        {
            var benny = GetBenny();
            if (benny == null || s_Teleport == null) return false;
            try
            {
                s_Teleport.Invoke(benny, new object[] { s, lateralX });
                return true;
            }
            catch (TargetInvocationException e)
            {
                Debug.LogException(e.InnerException ?? e);
                return false;
            }
        }

        /// <summary>Screen05Events.BennyS, when available.</summary>
        public static bool TryGetEventsBennyS(out float s)
        {
            Resolve();
            s = 0f;
            object v = GetValue(s_BennyS, null);
            if (v is float f) { s = f; return true; }
            return false;
        }

        public static bool AddCoinCollectedHandler(Action<Vector3> handler)
        {
            Resolve();
            return AddHandler(s_CoinEvent, s_CoinField, handler);
        }

        public static void RemoveCoinCollectedHandler(Action<Vector3> handler)
        {
            Resolve();
            RemoveHandler(s_CoinEvent, s_CoinField, handler);
        }

        public static bool AddFinishedHandler(Action handler)
        {
            Resolve();
            return AddHandler(s_FinishedEvent, s_FinishedField, handler);
        }

        public static void RemoveFinishedHandler(Action handler)
        {
            Resolve();
            RemoveHandler(s_FinishedEvent, s_FinishedField, handler);
        }

        /// <summary>One line saying which contract hooks were found (written into every capture log).</summary>
        public static string Describe()
        {
            Resolve();
            return "SwimInputOverride " + Found(s_OverrideType) + " (Active " + Found(s_Active) + ", Steer " + Found(s_Steer)
                + ", JumpRequested " + Found(s_Jump) + "); BennyController " + Found(s_BennyType) + " (Instance " + Found(s_Instance)
                + ", S " + Found(s_S) + ", LateralX " + Found(s_LateralX) + ", TeleportTo(float,float) " + Found(s_Teleport)
                + "); Screen05Events " + Found(s_EventsType) + " (CoinCollected " + Found((object)s_CoinEvent ?? s_CoinField)
                + ", Finished " + Found((object)s_FinishedEvent ?? s_FinishedField) + ", BennyS " + Found(s_BennyS) + ")";
        }

        // ---------------------------------------------------------------------------------------------

        static string Found(object o) => o != null ? "ok" : "MISSING";

        static Type FindType(string fullName)
        {
            foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
            {
                Type t = null;
                try { t = assembly.GetType(fullName, false); }
                catch (Exception) { t = null; }
                if (t != null) return t;
            }
            return null;
        }

        static MemberInfo FindMember(Type type, string name, BindingFlags flags)
        {
            if (type == null) return null;
            PropertyInfo property = type.GetProperty(name, flags);
            if (property != null) return property;
            return type.GetField(name, flags);
        }

        static object GetValue(MemberInfo member, object target)
        {
            if (member is PropertyInfo property)
                return property.GetGetMethod(true) != null ? property.GetValue(target, null) : null;
            if (member is FieldInfo field)
                return field.GetValue(target);
            return null;
        }

        static bool SetValue(MemberInfo member, object target, object value)
        {
            if (member is PropertyInfo property)
            {
                if (property.GetSetMethod(true) == null) return false;
                property.SetValue(target, value, null);
                return true;
            }
            if (member is FieldInfo field)
            {
                if (field.IsInitOnly || field.IsLiteral) return false;
                field.SetValue(target, value);
                return true;
            }
            return false;
        }

        static bool AddHandler(EventInfo ev, FieldInfo field, Delegate handler)
        {
            if (handler == null) return false;
            if (ev != null && ev.EventHandlerType == handler.GetType())
            {
                ev.AddEventHandler(null, handler);
                return true;
            }
            if (field != null && field.FieldType == handler.GetType())
            {
                field.SetValue(null, Delegate.Combine(field.GetValue(null) as Delegate, handler));
                return true;
            }
            return false;
        }

        static void RemoveHandler(EventInfo ev, FieldInfo field, Delegate handler)
        {
            if (handler == null) return;
            if (ev != null && ev.EventHandlerType == handler.GetType())
                ev.RemoveEventHandler(null, handler);
            else if (field != null && field.FieldType == handler.GetType())
                field.SetValue(null, Delegate.Remove(field.GetValue(null) as Delegate, handler));
        }
    }
}
