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

# --- LOCK LIVENESS (2026-08-13): PID REUSE defeated the old `kill -0 $holder` check. A run died
#     holding runs/.lock as pid 1231; macOS recycled 1231 to an unrelated app, so `kill -0 1231`
#     succeeded FOREVER, the lock was never stolen, and every scheduled run from 11:04 to 21:04
#     HALTed with "held by LIVE pid 1231" — the channel published NOTHING that day. A pid on its own
#     does not identify a process. We now also require that the holder process STARTED BEFORE the
#     lock was created (a process that began after the lock cannot be the one that took it) and,
#     when recorded, that its command name still matches. If liveness cannot be determined we STEAL
#     and log loudly: a day of silence is far worse than a rare double run, and the step-1b new-topic
#     guard already blocks re-posting stale content. A genuinely live holder is still never stolen
#     from — that is what keeps the cross-project queue on /tmp/video_autopilot.lock working. ---
_proc_start() {  # $1 = pid -> epoch seconds at which that process started ('' if undeterminable).
                 # ps -o etime= ([[dd-]hh:]mm:ss) is locale-independent, unlike lstart.
  _ps_e="$(ps -p "$1" -o etime= 2>/dev/null | tr -d '[:space:]')"
  [ -n "$_ps_e" ] || return 1
  _ps_d=0; _ps_h=0
  case "$_ps_e" in *-*) _ps_d="${_ps_e%%-*}"; _ps_e="${_ps_e#*-}" ;; esac
  case "$_ps_e" in *:*:*) _ps_h="${_ps_e%%:*}"; _ps_e="${_ps_e#*:}" ;; esac
  case "$_ps_e" in *:*) _ps_m="${_ps_e%%:*}"; _ps_s="${_ps_e#*:}" ;; *) return 1 ;; esac
  case "${_ps_d}${_ps_h}${_ps_m}${_ps_s}" in ''|*[!0-9]*) return 1 ;; esac
  # 10# = force base 10; ps zero-pads and a bare 08/09 is an invalid octal literal in shell math.
  echo $(( $(date +%s) - (10#$_ps_d * 86400 + 10#$_ps_h * 3600 + 10#$_ps_m * 60 + 10#$_ps_s) ))
}
LOCK_WHY=""
_lock_stale() {  # $1 = lock dir. TRUE (0) = no live holder, steal it. Sets LOCK_WHY either way.
  _lk="$1"
  _lk_pid="$(cat "$_lk/holder" 2>/dev/null | tr -d '[:space:]')"
  _lk_mt="$(stat -f %m "$_lk" 2>/dev/null || echo 0)"
  _lk_age=$(( $(date +%s) - _lk_mt ))
  if [ -z "$_lk_pid" ]; then   # legacy pid-less lock: keep the original >3h age rule
    LOCK_WHY="legacy pid-less lock, age ${_lk_age}s"
    [ "$_lk_age" -gt 10800 ]; return $?
  fi
  case "$_lk_pid" in *[!0-9]*) LOCK_WHY="holder '$_lk_pid' is not a pid"; return 0 ;; esac
  if ! kill -0 "$_lk_pid" 2>/dev/null; then LOCK_WHY="holder pid $_lk_pid is DEAD"; return 0; fi
  if [ "$_lk_mt" -le 0 ]; then
    LOCK_WHY="cannot stat $_lk, so pid $_lk_pid cannot be verified — failing toward steal"; return 0
  fi
  _lk_st="$(_proc_start "$_lk_pid")"
  if [ -z "$_lk_st" ]; then
    LOCK_WHY="ps reported no start time for pid $_lk_pid — cannot verify, failing toward steal"; return 0
  fi
  if [ "$_lk_st" -gt $(( _lk_mt + 120 )) ]; then
    LOCK_WHY="pid $_lk_pid ($(ps -p "$_lk_pid" -o comm= 2>/dev/null)) started $(( _lk_st - _lk_mt ))s AFTER the lock was created — RECYCLED PID, not the holder"
    return 0
  fi
  _lk_cmd="$(cat "$_lk/holder_cmd" 2>/dev/null)"
  if [ -n "$_lk_cmd" ]; then
    _lk_now="$(ps -p "$_lk_pid" -o comm= 2>/dev/null)"
    if [ -n "$_lk_now" ] && [ "$_lk_now" != "$_lk_cmd" ]; then
      LOCK_WHY="pid $_lk_pid is now '$_lk_now' but the lock was taken by '$_lk_cmd' — RECYCLED PID"
      return 0
    fi
  fi
  LOCK_WHY="pid $_lk_pid is LIVE (started $(( _lk_mt - _lk_st ))s before the lock, age ${_lk_age}s)"
  return 1
}

# SHARED machine-wide video lock (daily_autopilot.sh + Sammy use the same one) — WAIT, never overlap a render
SHARED_LOCK="/tmp/video_autopilot.lock"; _w=0; GOT_SHARED=""
while ! mkdir "$SHARED_LOCK" 2>/dev/null; do
  _h="$(cat "$SHARED_LOCK/holder" 2>/dev/null)"
  _age=$(( $(date +%s) - $(stat -f %m "$SHARED_LOCK" 2>/dev/null || echo 0) ))
  if [ "$_age" -gt 10800 ]; then _steal=1; LOCK_WHY="lock age ${_age}s > 3h"
  elif _lock_stale "$SHARED_LOCK"; then _steal=1
  else _steal=0; fi
  if [ "$_steal" = 1 ]; then
    echo "stealing stale $SHARED_LOCK (holder=${_h:-none}: $LOCK_WHY)"
    echo "$(date '+%F %H:%M') STALE LOCK stolen $SHARED_LOCK (holder=${_h:-none}: $LOCK_WHY)" >> runs/autopilot/ALERTS.log
    rm -rf "$SHARED_LOCK"; continue
  fi
  [ "$_w" -ge 3600 ] && { echo "shared video lock held >1h — skip today"; exit 0; }
  echo "waiting on shared video lock ($LOCK_WHY) ${_w}s"; sleep 120; _w=$(( _w + 120 ))
done
echo $$ > "$SHARED_LOCK/holder"; ps -p $$ -o comm= > "$SHARED_LOCK/holder_cmd" 2>/dev/null; GOT_SHARED=1

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
