#!/usr/bin/env python3
"""Convert ops/improvements.json (the autopilot's learning backlog) into a Ralph prd.json.
Each backlog item -> one user story. A story stays passed if it is in improvements.json "done"
OR was already marked passed in an existing prd.json, so re-running never regresses completed work.
See docs/superpowers/specs/2026-07-12-autonomous-improvement-loop-design.md."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMP = os.path.join(ROOT, "ops", "improvements.json")
PRD = os.path.join(ROOT, "ralph", "prd.json")
IMPACT_RANK = {"high": 1, "med": 2, "medium": 2, "low": 3}

RULES = (
    "You are improving the CoreLifecycle video pipeline. HARD RULES (never violate, even though "
    "permissions are off): (1) NEVER publish, unlist, upload, or touch any live video or the YouTube "
    "API. (2) NEVER read, write, move, or commit anything under secrets/. (3) NEVER edit "
    "scripts/yt_upload.py or any publish path, and NEVER write runs/last_post.txt or "
    "ops/produced_topics.json. (4) One story per iteration. (5) VERIFY GATE before marking a story "
    "passed: run `python3 build.py` and it MUST exit 0 (quality gate + 1-frame smoke render); also run "
    "`git diff --name-only` and confirm it touches nothing under secrets/ and no publish path. "
    "(6) If build.py fails OR the diff is out of bounds: run `git checkout -- .` to DISCARD the code "
    "change, write the blocker into the story's notes and progress.txt, do NOT set passes:true, do NOT "
    "commit the code change, and stop. (7) Keep progress.txt notes TERSE (caveman-brief), facts only. "
    "(8) `build.py` rewrites src/episode_meta.json, src/timeline.json, and out/ as a side effect — before "
    "committing your passing story, run `git checkout -- src/episode_meta.json src/timeline.json` so your "
    "commit contains ONLY your improvement, not stale last-render churn."
)

def build_prd():
    d = json.load(open(IMP))
    backlog = d.get("backlog", []) if isinstance(d, dict) else (d if isinstance(d, list) else [])
    done = d.get("done", []) if isinstance(d, dict) else []
    done_ids = {x["id"] for x in done}
    if os.path.exists(PRD):
        try:
            done_ids |= {s["id"] for s in json.load(open(PRD)).get("userStories", []) if s.get("passes")}
        except (json.JSONDecodeError, OSError, KeyError):
            pass
    stories = []
    for i, item in enumerate(backlog):
        rank = IMPACT_RANK.get(str(item.get("impact", "med")).lower(), 2)
        note = item.get("note", "")
        stories.append({
            "id": item["id"],
            "title": item["id"].replace("-", " "),
            "priority": rank * 1000 + i,
            "passes": item["id"] in done_ids,
            "notes": note,
            "acceptanceCriteria": [
                f"The improvement described in notes is implemented: {note[:400]}",
                "`python3 build.py` exits 0 (quality gate + 1-frame smoke render still pass).",
                "`git diff --name-only` touches nothing under secrets/ and no publish path "
                "(scripts/yt_upload.py, ops/produced_topics.json, runs/last_post.txt).",
            ],
        })
    stories.sort(key=lambda s: s["priority"])
    prd = {"branchName": "main", "rules": RULES, "userStories": stories}
    os.makedirs(os.path.dirname(PRD), exist_ok=True)
    json.dump(prd, open(PRD, "w"), indent=2)
    return prd

if __name__ == "__main__":
    p = build_prd()
    npass = sum(1 for s in p["userStories"] if s["passes"])
    print(f"prd.json: {len(p['userStories'])} stories ({npass} already passed) -> {PRD}")
