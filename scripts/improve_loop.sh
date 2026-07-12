#!/bin/zsh
# CoreLifecycle daytime improvement loop: regenerate the Ralph prd from ops/improvements.json,
# then run a bounded YOLO Ralph pass — clear of the 2AM video run and holding the shared video
# lock so it never overlaps a render. Spec: docs/superpowers/specs/2026-07-12-autonomous-improvement-loop-design.md
cd /Users/jacobpazhoor/CoreLifecycle || exit 1
setopt NO_NOMATCH 2>/dev/null
# launchd runs with a minimal PATH — pin the full toolchain (python3 with our packages, node/npx, jq)
export PATH="/Library/Frameworks/Python.framework/Versions/3.12/bin:/usr/local/bin:/opt/homebrew/bin:/Users/jacobpazhoor/.local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
mkdir -p runs/improve runs/autopilot
LOG="runs/improve/$(date +%Y%m%d_%H%M).log"
exec >> "$LOG" 2>&1
echo "=== improve start $(date) ==="

# SHARED machine-wide video lock (daily_autopilot.sh + Sammy use the same one) — WAIT, never overlap a render
SHARED_LOCK="/tmp/video_autopilot.lock"; _w=0; GOT_SHARED=""
while ! mkdir "$SHARED_LOCK" 2>/dev/null; do
  _h="$(cat "$SHARED_LOCK/holder" 2>/dev/null)"
  _age=$(( $(date +%s) - $(stat -f %m "$SHARED_LOCK" 2>/dev/null || echo 0) ))
  if [ "$_age" -gt 10800 ] || { [ -n "$_h" ] && ! kill -0 "$_h" 2>/dev/null; }; then rm -rf "$SHARED_LOCK"; continue; fi
  [ "$_w" -ge 3600 ] && { echo "shared video lock held >1h — skip today"; exit 0; }
  echo "waiting on shared video lock (pid ${_h:-?}) ${_w}s"; sleep 120; _w=$(( _w + 120 ))
done
echo $$ > "$SHARED_LOCK/holder"; GOT_SHARED=1

finish() { [ -n "$GOT_SHARED" ] && rm -rf "$SHARED_LOCK" 2>/dev/null; echo "=== improve end $(date) ==="; }
trap finish EXIT

# regenerate the prd from the latest backlog
python3 scripts/improvements_to_prd.py || { echo "prd regen failed"; exit 1; }

# bounded YOLO Ralph pass (user chose full YOLO; cap 4). Hard fences live in the prd rules.
export RALPH_YOLO=1
RALPH_SH="$HOME/ralph/ralph.sh"
[ -x "$RALPH_SH" ] || { echo "no $RALPH_SH"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq not found (ralph.sh needs it) — install with: brew install jq"; exit 1; }
"$RALPH_SH" /Users/jacobpazhoor/CoreLifecycle 4
RC=$?
echo "ralph exit=$RC"

if [ "$RC" -ne 0 ]; then
  echo "$(date '+%F %H:%M') IMPROVE FAIL rc=$RC (see $LOG)" >> runs/autopilot/ALERTS.log
  osascript -e "display notification \"improve loop failed rc=$RC\" with title \"CoreLifecycle improve\" sound name \"Basso\"" 2>/dev/null
fi
exit $RC
