---
name: resume-rainbow
description: Resume the user's existing Rainbow Unity Screen 05 work in C:\RainbowUnity after an account switch or in a new session - check the real project, Git, GitHub, autosave and Unity, give a short plain status, then continue the next unfinished task from UNITY_RAINBOW_HANDOFF.md. Use when the user says "Resume Rainbow", "continue Rainbow", "I'm back" or similar.
---

# Resume Rainbow

Follow `C:\RainbowUnity\CLAUDE.md`. This is an existing project: never start over, never reinstall Unity, never create
another Unity project, never rebuild finished work.

1. Status (read-only). If the "RAINBOW STATUS" block from the SessionStart hook is not in this conversation, run:
   `powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\session-start.ps1 -Text`
2. Read `C:\RainbowUnity\UNITY_RAINBOW_HANDOFF.md` - "NEXT UNFINISHED TASK" and "CURRENT STATE" first.
3. Check reality before acting, with Git at `C:\Users\josia\PortableGit\cmd\git.exe`: `status`, newest local commit,
   newest GitHub commit (`ls-remote origin refs/heads/unity/screen05-dev`), the files in `staging/agent1..4` and
   `UnityProject/Assets/Rainbow`, and `unity status --project-path C:\RainbowUnity\UnityProject`.
4. If GitHub has commits this laptop lacks, fetch and merge them without losing local work (ask the user if anything
   conflicts). Never reset, clean, force-push or delete. Keep uncommitted and unpushed work.
5. Tell the user in 3-5 short plain lines: what is saved, what is unfinished, and what you will do next.
6. Continue the NEXT UNFINISHED TASK one step at a time. Ask before deleting files, installing anything or restarting.
7. After each finished step and before credits run low: update the handoff (keep the `NEXT-TASK:START` / `NEXT-TASK:END`
   markers), then save now with `powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\autosave.ps1`
   and confirm the push in `.git\autosave.log`.
