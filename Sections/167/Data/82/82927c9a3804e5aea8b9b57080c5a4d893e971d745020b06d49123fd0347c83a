#!/usr/bin/env python3
"""Sanitized export of the Rainbow project's Claude Code session transcripts.

Reads the JSONL transcripts that Claude Code keeps locally for THIS project
(~/.claude/projects/-home-user-rainbow-*), and writes, per session:

  backups/claude-sessions/<session-id>/transcript.sanitized.jsonl
  backups/claude-sessions/<session-id>/transcript.md          (readable)
  backups/claude-sessions/<session-id>/subagents/<agent>.sanitized.jsonl / .md

plus backups/CONVERSATION_INDEX.md.

Sanitizing rules (applied before anything touches the repo):
  * hidden model reasoning ("thinking"/"redacted_thinking" blocks, signatures) is dropped
  * base64 image payloads are replaced with a placeholder (the images themselves
    are preserved byte-for-byte under references/ and screenshots/)
  * e-mail addresses, tokens, API keys, private keys, bearer/basic auth,
    JWTs and `key=value` style secrets are redacted
Files are rewritten in place (same path every run) so git stores small deltas.
Only accessible local transcripts are exported; nothing is invented.
"""
from __future__ import annotations

import datetime as _dt
import glob
import json
import os
import re
import sys
from pathlib import Path

REDACTIONS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----.*?-----END [A-Z ]*PRIVATE KEY-----", re.S), "[REDACTED-PRIVATE-KEY]"),
    (re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b"), "[REDACTED-GITHUB-TOKEN]"),
    (re.compile(r"\bgithub_pat_[A-Za-z0-9_]{20,}\b"), "[REDACTED-GITHUB-TOKEN]"),
    (re.compile(r"\bsk-ant-[A-Za-z0-9_\-]{10,}"), "[REDACTED-ANTHROPIC-KEY]"),
    (re.compile(r"\bsk-[A-Za-z0-9]{20,}\b"), "[REDACTED-API-KEY]"),
    (re.compile(r"\bmsy_[A-Za-z0-9_\-]{10,}"), "[REDACTED-MESHY-KEY]"),
    (re.compile(r"\bAKIA[0-9A-Z]{16}\b"), "[REDACTED-AWS-KEY]"),
    (re.compile(r"\bxox[abposr]-[A-Za-z0-9\-]{10,}"), "[REDACTED-SLACK-TOKEN]"),
    (re.compile(r"\bAIza[0-9A-Za-z_\-]{30,}"), "[REDACTED-GOOGLE-KEY]"),
    (re.compile(r"\beyJ[A-Za-z0-9_\-]{8,}\.eyJ[A-Za-z0-9_\-]{8,}\.[A-Za-z0-9_\-]{8,}"), "[REDACTED-JWT]"),
    (re.compile(r"(?i)\b(bearer|basic)\s+[A-Za-z0-9._~+/=\-]{16,}"), r"\1 [REDACTED]"),
    (re.compile(r"(?i)((?:api[_-]?key|secret|token|passw(?:or)?d|client[_-]?secret|access[_-]?key)[\"']?\s*[:=]\s*[\"']?)([^\s\"',}]{8,})"), r"\1[REDACTED]"),
    (re.compile(r"(https?://)[^/\s:@]+:[^/\s@]+@"), r"\1[REDACTED-CREDENTIALS]@"),
    (re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}"), "[REDACTED-EMAIL]"),
]
# commit trailer address is public & harmless; keep it readable
KEEP_EMAILS = {"noreply@anthropic.com"}

# Optional private redaction terms (names, e-mail local parts, …) kept OUTSIDE the repo,
# one per line, so the redaction list itself is never published.
_PRIVATE_TERMS_FILE = os.path.expanduser("~/.rainbow-autosave.private-terms")
PRIVATE_TERMS: list[str] = []
if os.path.exists(_PRIVATE_TERMS_FILE):
    with open(_PRIVATE_TERMS_FILE, encoding="utf-8") as _fh:
        PRIVATE_TERMS = sorted({t.strip() for t in _fh if len(t.strip()) >= 4}, key=len, reverse=True)


def redact_text(s: str) -> str:
    for term in PRIVATE_TERMS:
        if term in s:
            s = s.replace(term, "[REDACTED-PRIVATE]")
    keep = {}
    for i, e in enumerate(KEEP_EMAILS):
        tok = f"\u0000KEEP{i}\u0000"
        keep[tok] = e
        s = s.replace(e, tok)
    for pat, rep in REDACTIONS:
        s = pat.sub(rep, s)
    for tok, e in keep.items():
        s = s.replace(tok, e)
    return s


def scrub(obj):
    """Recursively drop hidden reasoning / image payloads and redact strings."""
    if isinstance(obj, dict):
        t = obj.get("type")
        if t in ("thinking", "redacted_thinking"):
            return {"type": t, "omitted": "hidden model reasoning not exported"}
        if t == "image":
            return {"type": "image", "omitted": "base64 image payload removed (originals live in references/ & screenshots/)"}
        out = {}
        for k, v in obj.items():
            if k in ("signature",):
                continue
            if k == "data" and isinstance(v, str) and len(v) > 2000 and re.fullmatch(r"[A-Za-z0-9+/=\s]+", v[:4000] or ""):
                out[k] = "[base64 payload removed]"
                continue
            out[k] = scrub(v)
        return out
    if isinstance(obj, list):
        return [scrub(x) for x in obj]
    if isinstance(obj, str):
        return redact_text(obj)
    return obj


def _blocks(content):
    if isinstance(content, str):
        return [{"type": "text", "text": content}]
    return content if isinstance(content, list) else []


def _short(s: str, n: int) -> str:
    s = s.strip()
    return s if len(s) <= n else s[:n] + f" …[+{len(s) - n} chars]"


def to_markdown(entries: list[dict], title: str) -> str:
    lines = [f"# {title}", ""]
    for e in entries:
        typ = e.get("type")
        ts = e.get("timestamp", "")
        if typ == "ai-title" and e.get("aiTitle"):
            continue
        msg = e.get("message")
        if not isinstance(msg, dict):
            continue
        role = msg.get("role", typ)
        parts = []
        for b in _blocks(msg.get("content")):
            if not isinstance(b, dict):
                continue
            bt = b.get("type")
            if bt == "text" and b.get("text", "").strip():
                parts.append(b["text"].strip())
            elif bt == "tool_use":
                inp = json.dumps(b.get("input", {}), ensure_ascii=False)
                parts.append(f"> 🔧 **{b.get('name')}** `{_short(inp, 600)}`")
            elif bt == "tool_result":
                c = b.get("content")
                txt = ""
                if isinstance(c, str):
                    txt = c
                elif isinstance(c, list):
                    txt = "\n".join(x.get("text", "[" + str(x.get("type")) + "]") for x in c if isinstance(x, dict))
                parts.append("> ↩︎ result: " + _short(txt, 1200).replace("\n", "\n> "))
        if not parts:
            continue
        who = {"user": "🧑 User", "assistant": "🤖 Claude"}.get(role, role)
        lines.append(f"### {who} — {ts}")
        lines.append("")
        lines.append("\n\n".join(parts))
        lines.append("")
    return "\n".join(lines) + "\n"


def load_jsonl(path: Path) -> list[dict]:
    out = []
    with path.open("r", encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                out.append(json.loads(line))
            except json.JSONDecodeError:
                out.append({"type": "unparseable-line", "text": redact_text(line[:500])})
    return out


def write_if_changed(path: Path, text: str) -> bool:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_text(encoding="utf-8", errors="replace") == text:
        return False
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)
    return True


def summarize(entries: list[dict]) -> dict:
    title = None
    first_ts = last_ts = None
    users = assistants = 0
    branch = None
    first_user = ""
    for e in entries:
        if e.get("type") == "ai-title" and e.get("aiTitle"):
            title = e["aiTitle"]
        ts = e.get("timestamp")
        if ts:
            first_ts = first_ts or ts
            last_ts = ts
        branch = e.get("gitBranch") or branch
        msg = e.get("message")
        if isinstance(msg, dict):
            if msg.get("role") == "user" and e.get("type") == "user":
                has_text = any(isinstance(b, dict) and b.get("type") == "text" for b in _blocks(msg.get("content")))
                if has_text:
                    users += 1
                    if not first_user:
                        first_user = next(b["text"] for b in _blocks(msg.get("content")) if isinstance(b, dict) and b.get("type") == "text")
            elif msg.get("role") == "assistant":
                assistants += 1
    return {"title": title, "first": first_ts, "last": last_ts, "user_msgs": users,
            "assistant_msgs": assistants, "branch": branch, "first_user": first_user}


TOPIC_WORDS = ["benny", "girl", "water", "07", "08", "plunge", "autosave", "backup", "android",
               "playwright", "blender", "meshy", "screens", "towel", "hud", "coin", "shader", "agents"]


def main(repo: Path, projects_glob: str) -> int:
    out_root = repo / "backups" / "claude-sessions"
    changed = 0
    index_rows = []
    dirs = sorted(glob.glob(os.path.expanduser(projects_glob)))
    for d in dirs:
        for main_jsonl in sorted(Path(d).glob("*.jsonl")):
            sid = main_jsonl.stem
            entries = load_jsonl(main_jsonl)
            clean = [scrub(e) for e in entries]
            sdir = out_root / sid
            jl = "\n".join(json.dumps(e, ensure_ascii=False, sort_keys=True) for e in clean) + "\n"
            info = summarize(clean)
            title = info["title"] or "Rainbow session"
            changed += write_if_changed(sdir / "transcript.sanitized.jsonl", jl)
            changed += write_if_changed(sdir / "transcript.md", to_markdown(clean, f"{title} — session {sid}"))
            # subagent transcripts (Claude Code stores them under <session-id>/subagents/)
            sub_count = 0
            for sub in sorted((Path(d) / sid).rglob("*.jsonl")):
                sub_entries = [scrub(e) for e in load_jsonl(sub)]
                name = sub.stem
                sub_count += 1
                changed += write_if_changed(sdir / "subagents" / f"{name}.sanitized.jsonl",
                                            "\n".join(json.dumps(e, ensure_ascii=False, sort_keys=True) for e in sub_entries) + "\n")
                changed += write_if_changed(sdir / "subagents" / f"{name}.md",
                                            to_markdown(sub_entries, f"Subagent {name} — session {sid}"))
            text_blob = jl.lower()
            topics = [w for w in TOPIC_WORDS if w in text_blob]
            index_rows.append((info, sid, sub_count, topics))

    lines = [
        "# Rainbow — Claude conversation index",
        "",
        "Sanitized copies of every Claude Code session transcript that is **accessible in this",
        "environment** for the Rainbow project (`~/.claude/projects/-home-user-rainbow-*`).",
        "Hidden model reasoning and base64 image payloads are omitted; secrets/e-mails are redacted.",
        "Conversations from other computers, accounts or claude.ai chats are NOT accessible here and",
        "are therefore not included.",
        "",
        "Search tip: `grep -ril \"07\" backups/claude-sessions/*/transcript.md`",
        "",
        "| Session | Title | Branch | First event (UTC) | Last event (UTC) | User msgs | Claude msgs | Subagents | Topics | Files |",
        "|---|---|---|---|---|---|---|---|---|---|",
    ]
    for info, sid, sub_count, topics in index_rows:
        lines.append(
            f"| `{sid}` | {info['title'] or '—'} | `{info['branch'] or '—'}` | {info['first'] or '—'} | {info['last'] or '—'} | "
            f"{info['user_msgs']} | {info['assistant_msgs']} | {sub_count} | {', '.join(topics) or '—'} | "
            f"[md](claude-sessions/{sid}/transcript.md) · [jsonl](claude-sessions/{sid}/transcript.sanitized.jsonl) |"
        )
    lines += ["", "## Restore / resume", "",
              "* Read `transcript.md` for the human-readable history; `transcript.sanitized.jsonl` keeps the",
              "  structured events (tool calls/results) for tooling.",
              "* A Git snapshot cannot revive a live in-memory Claude session. To continue, open the repo in",
              "  Claude Code and point it at `backups/CURRENT_STATE.md` plus the latest transcript.md.", ""]
    # index content intentionally has no timestamp of "now" to avoid no-op diffs
    changed += write_if_changed(repo / "backups" / "CONVERSATION_INDEX.md", "\n".join(lines))
    print(json.dumps({"sessions": len(index_rows), "files_changed": changed}))
    return 0


if __name__ == "__main__":
    repo_arg = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]
    glob_arg = sys.argv[2] if len(sys.argv) > 2 else "~/.claude/projects/-home-user-rainbow-*"
    sys.exit(main(repo_arg, glob_arg))
