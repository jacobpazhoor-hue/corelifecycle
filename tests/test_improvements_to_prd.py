#!/usr/bin/env python3
"""Structural + idempotency tests for the backlog->prd converter. Run: python3 tests/test_improvements_to_prd.py"""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRD = os.path.join(ROOT, "ralph", "prd.json")

def run():
    subprocess.run([sys.executable, "scripts/improvements_to_prd.py"], cwd=ROOT, check=True)
    return json.load(open(PRD))

def test_structure():
    p = run()
    assert p["branchName"] == "main", p["branchName"]
    assert "secrets/" in p["rules"] and "build.py" in p["rules"], "rules must state the fences + gate"
    backlog = json.load(open(os.path.join(ROOT, "ops", "improvements.json")))["backlog"]
    assert len(p["userStories"]) == len(backlog), (len(p["userStories"]), len(backlog))
    prios = [s["priority"] for s in p["userStories"]]
    assert prios == sorted(prios), "stories must be priority-sorted ascending"
    for s in p["userStories"]:
        crit = " ".join(s["acceptanceCriteria"])
        assert "build.py" in crit and "secrets/" in crit, s["id"]
        assert len(s["acceptanceCriteria"]) >= 3, s["id"]

def test_idempotency_preserves_passed():
    p = run()
    first_id = p["userStories"][0]["id"]
    p["userStories"][0]["passes"] = True
    json.dump(p, open(PRD, "w"), indent=2)     # simulate the loop marking one story done
    p2 = run()                                  # re-run converter
    got = next(s for s in p2["userStories"] if s["id"] == first_id)
    assert got["passes"] is True, "re-running the converter must NOT regress a passed story"

if __name__ == "__main__":
    test_structure(); test_idempotency_preserves_passed()
    print("OK: all converter tests passed")
