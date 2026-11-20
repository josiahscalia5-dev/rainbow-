# Screen 04 tunnel bands — session 5a3a0996-c88f-53c3-8888-e587e3601a8b

### 🧑 User — 2026-11-20T00:52:18.234Z

Make sure that the branch, the GitHub branch, I just put it on the session. Make sure all the servers, the plugins, the tools, the the Marble World Labs, the Hugging Face, all the specialists, everything that's in my my GitHub or GitHub branch, I just put it in this session. Make sure everything's all enabled and working on this one.Please refine the Screen 04 tunnel bands shown in my marked close-ups. The first full image is the current game; the second is my approved reference.

Match the approved image’s softer, rounded gold rims, narrow shaded grooves, and copper surfaces with pink, violet, and blue reflections. Correct the prominent near-black boundaries and visible jagged edges in the current version. Inspect the surface joins and shading to identify the cause.

Keep the tunnel arrangement and gameplay intact. Preserve subtle groove shadows, and match the reflections without simply increasing overall brightness or glow.

Show the approved image beside the before and after views from a matching camera, plus a short moving view so I can check that the edges stay smooth while Benny swims. And the first one is my approved screen, and the second one is my current screen.

### 🤖 Claude — 2026-11-20T00:52:28.317Z

I'll start by checking the session state (branch, bootstrap, autosave) and then work on the Screen 04 tunnel bands.

### 🤖 Claude — 2026-11-20T00:52:29.322Z

> 🔧 **Bash** `{"command": "git status -sb | head -5 && git log --oneline -3 && bash scripts/claude-bootstrap.sh --status 2>&1 | tail -60", "description": "Show branch state and bootstrap status"}`

### 🤖 Claude — 2026-11-20T00:52:29.623Z

> 🔧 **Skill** `{"skill": "superpowers:systematic-debugging"}`

### 🧑 User — 2026-11-20T00:52:30.054Z

> ↩︎ result: ## ccr-68d26c2d-gwegce...origin/ccr-68d26c2d-gwegce
> 91a5688 autosave: Rainbow 2026-11-20 00:52 UTC
> 413e419 autosave: Rainbow 2026-11-20 00:39 UTC
> 3a10529 autosave: Rainbow 2026-11-20 00:33 UTC
> # Rainbow bootstrap report — BOOTSTRAP PROBLEMS
> 
> Generated 2026-11-19 23:26 UTC by `scripts/claude-bootstrap.sh` (mode `background`) on branch `ccr-681a37bb-5jqfbu`.
> The commit that contains this file is the backup itself, so its SHA is not written here; use `git log -1 -- backups/BOOTSTRAP_REPORT.md`.
> 
> | Step | Result | Details | s |
> |---|---|---|---|
> | Repository + branch | OK | josiahscalia5-dev/rainbow- on ccr-681a37bb-5jqfbu @ 0bd0ab5 (session started from ccr-d00ac5ec-gabdsh) | 0 |
> | Resume newest work | FAIL | git fetch from GitHub failed (network / GitHub connection?) | 240 |
> | Backup gap since last session | WARN | GAP: no backup ran from 2026-11-19 21:52 to 2026-11-19 23:21 UTC (1.5 h) - no Claude cloud environment with the autosave was active. Nothing can be saved while an environment is closed; the newest saved state is 0bd0ab5.; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save); 12 gap(s) > 10 min in the last 72 h of the auto …[+3045 chars]

### 🧑 User — 2026-11-20T00:52:30.091Z

> ↩︎ result: Launching skill: superpowers:systematic-debugging

### 🧑 User — 2026-11-20T00:52:30.089Z

Base directory for this skill: /root/.claude/plugins/synced/3cfed598-2f11-4199-9ad6-9e421d2ddaba_3c459f59-4e74-461e-b4e6-c52936eda7c5/6ba53849-2ee0-4cf0-957e-31c122ea1dd1/skills/systematic-debugging

# Systematic Debugging

## Overview

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

**Violating the letter of this process is violating the spirit of debugging.**

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## When to Use

Use for ANY technical issue:
- Test failures
- Bugs in production
- Unexpected behavior
- Performance problems
- Build failures
- Integration issues

**Use this ESPECIALLY when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

**Don't skip when:**
- Issue seems simple (simple bugs have root causes too)
- You're in a hurry (rushing guarantees rework)
- Manager wants it fixed NOW (systematic is faster than thrashing)

## The Four Phases

You MUST complete each phase before proceeding to the next.

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully**
   - Don't skip past errors or warnings
   - They often contain the exact solution
   - Read stack traces completely
   - Note line numbers, file paths, error codes

2. **Reproduce Consistently**
   - Can you trigger it reliably?
   - What are the exact steps?
   - Does it happen every time?
   - If not reproducible → gather more data, don't guess

3. **Check Recent Changes**
   - What changed that could cause this?
   - Git diff, recent commits
   - New dependencies, config changes
   - Environmental differences

4. **Gather Evidence in Multi-Component Systems**

   **WHEN system has multiple components (CI → build → signing, API → service → database):**

   **BEFORE proposing fixes, add diagnostic instrumentation:**
   ```
   For EACH component boundary:
     - Log what data enters component
     - Log what data exits component
     - Verify environment/config propagation
     - Check state at each layer

   Run once to gather evidence showing WHERE it breaks
   THEN analyze evidence to identify failing component
   THEN investigate that specific component
   ```

   **Example (multi-layer system):**
   ```bash
   # Layer 1: Workflow
   echo "=== Secrets available in workflow: ==="
   echo "IDENTITY: $([ -n "${IDENTITY:-}" ] && echo SET || echo UNSET)"

   # Layer 2: Build script
   echo "=== Env vars in build script: ==="
   printenv IDENTITY >/dev/null 2>&1 && echo "IDENTITY in environment" || echo "IDENTITY not in environment"

   # Layer 3: Signing script
   echo "=== Keychain state: ==="
   security list-keychains
   security find-identity -v

   # Layer 4: Actual signing
   codesign --sign "$IDENTITY" --verbose=4 "$APP"
   ```

   **This reveals:** Which layer fails (secrets → workflow ✓, workflow → build ✗)

5. **Trace Data Flow**

   **WHEN error is deep in call stack:**

   See `root-cause-tracing.md` in this directory for the complete backward tracing technique.

   **Quick version:**
   - Where does bad value originate?
   - What called this with bad value?
   - Keep tracing up until you find the source
   - Fix at source, not at symptom

### Phase 2: Pattern Analysis

**Find the pattern before fixing:**

1. **Find Working Examples**
   - Locate similar working code in same codebase
   - What works that's similar to what's broken?

2. **Compare Against References**
   - If implementing pattern, read reference implementation COMPLETELY
   - Don't skim - read every line
   - Understand the pattern fully before applying

3. **Identify Differences**
   - What's different between working and broken?
   - List every difference, however small
   - Don't assume "that can't matter"

4. **Understand Dependencies**
   - What other components does this need?
   - What settings, config, environment?
   - What assumptions does it make?

### Phase 3: Hypothesis and Testing

**Scientific method:**

1. **Form Single Hypothesis**
   - State clearly: "I think X is the root cause because Y"
   - Write it down
   - Be specific, not vague

2. **Test Minimally**
   - Make the SMALLEST possible change to test hypothesis
   - One variable at a time
   - Don't fix multiple things at once

3. **Verify Before Continuing**
   - Did it work? Yes → Phase 4
   - Didn't work? Form NEW hypothesis
   - DON'T add more fixes on top

4. **When You Don't Know**
   - Say "I don't understand X"
   - Don't pretend to know
   - Ask for help
   - Research more

### Phase 4: Implementation

**Fix the root cause, not the symptom:**

1. **Create Failing Test Case**
   - Simplest possible reproduction
   - Automated test if possible
   - One-off test script if no framework
   - MUST have before fixing
   - Use the `superpowers:test-driven-development` skill for writing proper failing tests

2. **Implement Single Fix**
   - Address the root cause identified
   - ONE change at a time
   - No "while I'm here" improvements
   - No bundled refactoring

3. **Verify Fix**
   - Test passes now?
   - No other tests broken?
   - Issue actually resolved?
   - Use the `superpowers:verification-before-completion` skill before claiming success

4. **If Fix Doesn't Work**
   - STOP
   - Count: How many fixes have you tried?
   - If < 3: Return to Phase 1, re-analyze with new information
   - **If ≥ 3: STOP and question the architecture (step 5 below)**
   - DON'T attempt Fix #4 without architectural discussion

5. **If 3+ Fixes Failed: Question Architecture**

   **Pattern indicating architectural problem:**
   - Each fix reveals new shared state/coupling/problem in different place
   - Fixes require "massive refactoring" to implement
   - Each fix creates new symptoms elsewhere

   **STOP and question fundamentals:**
   - Is this pattern fundamentally sound?
   - Are we "sticking with it through sheer inertia"?
   - Should we refactor architecture vs. continue fixing symptoms?

   **Discuss with your human partner before attempting more fixes**

   This is NOT a failed hypothesis - this is a wrong architecture.

## Red Flags - STOP and Follow Process

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "Skip the test, I'll manually verify"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "Pattern says X but I'll adapt it differently"
- "Here are the main problems: [lists fixes without investigation]"
- Proposing solutions before tracing data flow
- **"One more fix attempt" (when already tried 2+)**
- **Each fix reveals new problem in different place**

**ALL of these mean: STOP. Return to Phase 1.**

**If 3+ fixes failed:** Question the architecture (see Phase 4.5)

## your human partner's Signals You're Doing It Wrong

**Watch for these redirections:**
- "Is that not happening?" - You assumed without verifying
- "Will it show us...?" - You should have added evidence gathering
- "Stop guessing" - You're proposing fixes without understanding
- "Ultra-think this" - Question fundamentals, not just symptoms
- "We're stuck?" (frustrated) - Your approach isn't working

**When you see these:** STOP. Return to Phase 1.

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is FASTER than guess-and-check thrashing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from the start. |
| "I'll write test after confirming fix works" | Untested fixes don't stick. Test first proves it. |
| "Multiple fixes at once saves time" | Can't isolate what worked. Causes new bugs. |
| "Reference too long, I'll adapt the pattern" | Partial understanding guarantees bugs. Read it completely. |
| "I see the problem, let me fix it" | Seeing symptoms ≠ understanding root cause. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. Question pattern, don't fix again. |

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or new hypothesis |
| **4. Implementation** | Create test, fix, verify | Bug resolved, tests pass |

## When Process Reveals "No Root Cause"

If systematic investigation reveals issue is truly environmental, timing-dependent, or external:

1. You've completed the process
2. Document what you investigated
3. Implement appropriate handling (retry, timeout, error message)
4. Add monitoring/logging for future investigation

**But:** 95% of "no root cause" cases are incomplete investigation.

## Supporting Techniques

These techniques are part of systematic debugging and available in this directory:

- **`root-cause-tracing.md`** - Trace bugs backward through call stack to find original trigger
- **`defense-in-depth.md`** - Add validation at multiple layers after finding root cause
- **`condition-based-waiting.md`** - Replace arbitrary timeouts with condition polling

### 🤖 Claude — 2026-11-20T00:52:33.704Z

Using systematic-debugging to find the root cause of the dark band boundaries before changing anything. First, let me check the setup items in parallel.

### 🤖 Claude — 2026-11-20T00:52:34.913Z

> 🔧 **Bash** `{"command": "tail -30 backups/.live/bootstrap.log 2>/dev/null; echo ---; timeout 60 git fetch origin 2>&1 | tail -5; echo \"fetch exit $?\"; git branch -r | wc -l", "description": "Check live bootstrap log and retry git fetch"}`

### 🤖 Claude — 2026-11-20T00:52:35.718Z

> 🔧 **Bash** `{"command": "sed -n 1,80p docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md", "description": "Read top of new-account handoff"}`

