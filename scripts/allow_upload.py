#!/usr/bin/env python3
"""One-time: add the narrow YouTube-upload permission to ~/.claude/settings.local.json
so the autopilot can publish unattended. Run: python3 scripts/allow_upload.py"""
import json, os

p = os.path.expanduser("~/.claude/settings.local.json")
d = json.load(open(p))
allow = d.setdefault("permissions", {}).setdefault("allow", [])
rule = "Bash(python3 scripts/yt_upload.py:*)"
if rule in allow:
    print("already present — upload allowed: True")
else:
    allow.insert(0, rule)
    json.dump(d, open(p, "w"), indent=2)
    print("added:", rule, "| upload allowed: True")
