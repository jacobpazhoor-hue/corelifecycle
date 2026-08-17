#!/bin/zsh
# CoreLifecycle daily autopilot (launchd @ 2AM). Split for reliability:
#   - Claude agents do the CREATIVE + REVIEW work (no long renders inside an agent command)
#   - this SHELL runs the heavy deterministic steps (build, render, upload)
# Pipeline: creative -> build+gate+smoke -> render -> REVIEWER -> fix-loop -> publish.
# Gate-gated AND review-gated: nothing publishes unless gate passes AND the reviewer approves.
cd /Users/jacobpazhoor/CoreLifecycle || exit 1
setopt NO_NOMATCH 2>/dev/null  # don't abort on globs that match nothing (e.g. the /tmp/remotion-* cleanup)
# launchd runs with a minimal PATH (only /usr/bin:/bin...), so `python3` would resolve to the
# system interpreter WITHOUT our packages (numpy/edge_tts/scipy/google) and node/npx/modal would be
# missing — this is exactly what HALTed the 2026-06-22 run. Pin the full toolchain PATH for every
# child process (build.py's subprocess python3 calls, npx remotion, modal).
export PATH="/Library/Frameworks/Python.framework/Versions/3.12/bin:/usr/local/bin:/Users/jacobpazhoor/.local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
mkdir -p runs/autopilot
LOG="runs/autopilot/$(date +%Y%m%d_%H%M).log"
exec >> "$LOG" 2>&1
echo "=== autopilot start $(date) ==="
if grep -q '"enabled": *false' ops/routine.json; then echo "disabled — exit"; exit 0; fi

# --- already-posted-today guard: lets the catchup job fire safely every 2h (does nothing if a
#     video already went out today). Cleared implicitly each new day. ---
TODAY=$(date +%F)
if [ "$(cat runs/last_post.txt 2>/dev/null)" = "$TODAY" ]; then echo "already posted today ($TODAY) — exit"; exit 0; fi

# --- daily build-attempt budget (2026-07-15, token budget): a failed night + 2h catchups can burn
#     several FULL creative+review attempts in one day. Cap them; FORCE_RUN=1 overrides. ---
ATT_FILE="runs/autopilot_attempts.json"
ATT_COUNT="$(python3 -c "import json,os; d=json.load(open('$ATT_FILE')) if os.path.exists('$ATT_FILE') else {}; print(d.get('count',0) if d.get('date')=='$TODAY' else 0)" 2>/dev/null)"
if [ "${ATT_COUNT:-0}" -ge "${MAX_BUILDS_PER_DAY:-2}" ] && [ "${FORCE_RUN:-0}" != "1" ]; then
  echo "$ATT_COUNT full attempts already today — budget cap (MAX_BUILDS_PER_DAY=${MAX_BUILDS_PER_DAY:-2}). FORCE_RUN=1 to override."
  exit 0
fi

# --- KEEP THE MAC AWAKE for the ENTIRE run (lock wait + creative + render + publish). The
#     2026-06-23 local render was SIGKILLed at 71% because the Mac SLEPT (no caffeinate) — Sammi
#     survives on this same battery Mac precisely because it caffeinates. -w $$ ties it to this run. ---
caffeinate -dimsu -w $$ &

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

# --- run lock: never let two runs (nightly + manual) collide on out/episode.mp4 ---
LOCK="runs/.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  # --- STALE-STEAL (2026-07-19): this lock used to record only a timestamp, so a run killed
  #     mid-flight left it wedged FOREVER and every later run exited 0 in silence. That is exactly
  #     what happened 2026-07-17 20:04 (the run finished the render, died at upload) — the channel
  #     sat dark 4 days and no alert fired. We now record the holder pid and steal only when no LIVE
  #     process holds it (see _lock_stale above: dead pid, RECYCLED pid, or unverifiable), or when it
  #     is a legacy pid-less lock older than 3h. A run whose holder is VERIFIED live is never stolen
  #     from, no matter how long it has been going. ---
  _lh="$(cat "$LOCK/holder" 2>/dev/null)"
  if _lock_stale "$LOCK"; then
    echo "stealing stale $LOCK (holder=${_lh:-none}: $LOCK_WHY)"
    echo "$(date '+%F %H:%M') STALE LOCK stolen (holder=${_lh:-none}: $LOCK_WHY)" >> runs/autopilot/ALERTS.log
    rm -rf "$LOCK"; mkdir "$LOCK" 2>/dev/null || { echo "HALT: lost the race for $LOCK. Exiting."; exit 0; }
  else
    echo "HALT: another autopilot run holds $LOCK (started $(cat $LOCK/started 2>/dev/null), pid ${_lh:-?}: $LOCK_WHY). Exiting."
    echo "$(date '+%F %H:%M') HALT $LOCK held by LIVE pid ${_lh:-?} ($LOCK_WHY)" >> runs/autopilot/ALERTS.log
    exit 0
  fi
fi
date > "$LOCK/started"; echo $$ > "$LOCK/holder"; ps -p $$ -o comm= > "$LOCK/holder_cmd" 2>/dev/null

# --- SHARED machine-wide lock (cross-project) ---
# This 8GB Mac also runs the Sammi the Sloth video autopilot at 2am. Two heavy TTS+render pipelines
# at once swap-death BOTH. Only ONE video autopilot does heavy work at a time — WAIT for the other
# to finish (not skip), so both channels still produce, just serialized. (sammy-sloth-video's
# daily_autopilot.sh holds the same /tmp/video_autopilot.lock.) Released in finish().
SHARED_LOCK="/tmp/video_autopilot.lock"; _w=0
while ! mkdir "$SHARED_LOCK" 2>/dev/null; do
  _h="$(cat "$SHARED_LOCK/holder" 2>/dev/null)"
  _age=$(( $(date +%s) - $(stat -f %m "$SHARED_LOCK" 2>/dev/null || echo 0) ))
  # Steal only a lock nobody live holds (dead holder, RECYCLED pid, unverifiable) or one >3h old.
  # A live holder from the other project is left alone — the whole point of this lock is to QUEUE.
  if [ "$_age" -gt 10800 ]; then _steal=1; LOCK_WHY="lock age ${_age}s > 3h"
  elif _lock_stale "$SHARED_LOCK"; then _steal=1
  else _steal=0; fi
  if [ "$_steal" = 1 ]; then
    echo "stealing stale $SHARED_LOCK (holder=${_h:-none}: $LOCK_WHY)"
    echo "$(date '+%F %H:%M') STALE LOCK stolen $SHARED_LOCK (holder=${_h:-none}: $LOCK_WHY)" >> runs/autopilot/ALERTS.log
    rm -rf "$SHARED_LOCK"; continue
  fi
  [ "$_w" -ge 14400 ] && { echo "shared video lock held >4h — exiting."; exit 0; }
  echo "waiting on shared video lock ($LOCK_WHY) … ${_w}s"; sleep 120; _w=$(( _w + 120 ))
done
echo $$ > "$SHARED_LOCK/holder"; ps -p $$ -o comm= > "$SHARED_LOCK/holder_cmd" 2>/dev/null; GOT_SHARED=1

CLAUDE=/Users/jacobpazhoor/.local/bin/claude
STATUS="UNKNOWN"; STATUS_MSG=""

notify() {  # $1 = short status, $2 = detail. Records + best-effort desktop ping (harmless if headless).
  STATUS="$1"; STATUS_MSG="$2"
  echo "$(date '+%Y-%m-%d %H:%M') $1 — $2" >> runs/autopilot/status.log
  osascript -e "display notification \"$2\" with title \"CoreLifecycle: $1\"" 2>/dev/null
}
finish() {  # always runs (trap): release lock + record outcome + health/alert
  echo "FINAL: $STATUS — $STATUS_MSG"
  # --- CHANNEL HEALTH + SAME-DAY ALERT ---------------------------------------------------------
  # The 5-day silent outage happened because the ONLY failure signal was a 2am desktop notification
  # nobody saw. Track days-dark and ESCALATE (sound + ALERTS.log + glanceable status file) whenever
  # a run ends without publishing while the channel is already >=1 day dark. The every-2h catchup
  # job means this fires during waking hours, so an outage surfaces same-day instead of days later.
  local LASTPOST DARK
  LASTPOST=$(cat runs/last_post.txt 2>/dev/null || echo never)
  DARK=$(python3 -c "import datetime,sys
try: print((datetime.date.today()-datetime.date.fromisoformat(sys.argv[1])).days)
except Exception: print(999)" "$LASTPOST" 2>/dev/null || echo 999)
  {
    echo "CoreLifecycle channel health — updated $(date '+%Y-%m-%d %H:%M')"
    echo "last publish : $LASTPOST  (${DARK} day(s) ago)"
    echo "last run     : $STATUS — $STATUS_MSG"
    echo "last log     : $LOG"
  } > runs/CHANNEL_STATUS.txt 2>/dev/null
  if [ "$STATUS" != "PUBLISHED" ] && [ "${DARK:-999}" -ge 1 ] 2>/dev/null; then
    local MSG="CoreLifecycle DARK ${DARK}d — last run $STATUS: $STATUS_MSG"
    echo "$(date '+%Y-%m-%d %H:%M') ALERT $MSG (see $LOG)" >> runs/autopilot/ALERTS.log
    osascript -e "display notification \"$MSG\" with title \"⚠️ CoreLifecycle needs attention\" sound name \"Basso\"" 2>/dev/null
  fi
  rm -rf "$LOCK" 2>/dev/null  # rm -rf, not rmdir: the lock dir holds a 'started' file (rmdir leaks it)
  [ -n "${GOT_SHARED:-}" ] && rm -rf "$SHARED_LOCK" 2>/dev/null  # release shared lock only if WE hold it
  echo "=== autopilot end $(date) ==="
}
trap finish EXIT

render() {  # FREE CLOUD (GitHub Actions) -> Modal -> local. VERIFY by file size.
  rm -f out/episode.mp4 out/short.mp4
  CLOUD_OK=0   # global: step 7 reuses the cloud-rendered Short + skips a double audio master
  # 1) FREE CLOUD RENDER — keeps the heavy render off the 8GB Mac (which thrashes on full episodes).
  #    Requires secrets/gh.env (GH_OWNER/GH_REPO/GH_TOKEN). cloud_render.py pushes -> triggers the
  #    Action -> downloads out/episode.mp4 + out/short.mp4 + kits (already -14 LUFS). See docs/CLOUD_RENDER.md.
  if [ -f secrets/gh.env ] && python3 scripts/cloud_render.py "$NEWTOPIC"; then
    echo "rendered on GitHub Actions (cloud) — artifact already mastered + includes the Short"
    CLOUD_OK=1
  elif grep -q '"useModal": *true' ops/routine.json && python3 modal_render.py; then
    echo "rendered on Modal (parallel shards)"
  else
    echo "rendering LOCALLY (no cloud config / Modal disabled or failed)"
    # --gl=angle = stable headless GL; concurrency 4 (proven on this Mac by Sammi); --log=error keeps
    # the log small; caffeinate belt-and-suspenders. Retry once after purging caches on failure.
    _local_render() { caffeinate -dimsu npx remotion render EveryLevelLawyer out/episode.mp4 --gl=angle --concurrency="${1:-2}" --log=error --timeout=180000; }
    if ! _local_render 2; then
      # 14:55 fail was a seekToFrame/waitForReady hang = memory pressure (8GB, Sammi concurrent).
      # Purge caches and RETRY AT CONCURRENCY 1 (minimal memory -> survives the stall).
      echo "local render failed — purging caches + retrying at concurrency 1 (lower memory)"
      rm -rf node_modules/.cache 2>/dev/null; rm -rf "${TMPDIR:-/tmp}"remotion-* 2>/dev/null; rm -rf /tmp/remotion-* 2>/dev/null
      _local_render 1 || return 1
    fi
  fi
  [ -f out/episode.mp4 ] || { echo "render produced no file"; return 1; }
  local sz=$(stat -f%z out/episode.mp4 2>/dev/null || stat -c%s out/episode.mp4)
  [ "$sz" -gt 50000000 ] || { echo "render file too small: ${sz} bytes"; return 1; }
  echo "render verified: ${sz} bytes"
  # Final loudness master to -14 LUFS — SKIP if the cloud already did it (avoids a double AAC encode).
  [ "$CLOUD_OK" = 1 ] || python3 audio_master.py out/episode.mp4 || echo "audio_master failed (non-fatal)"
}
package() {  # thumbnail still + upload_kit.json — MUST run before every review so the reviewer judges
             # the packaging that matches the CURRENT episode on disk, not a stale one from the last run.
  npx remotion still Thumbnail out/thumbnail.png --timeout=60000
  # gen_packaging.py is no longer advisory. It now reconciles the description's chapter list against
  # the chapter CARDS actually drawn on screen (see its header for the fork it closes) and exits
  # non-zero when the two cannot be aligned — a real authoring defect. This script has no `set -e`,
  # so the old unchecked call would have swallowed that: out/upload_kit.json would keep the PREVIOUS
  # episode's title, description and chapters, and step 6 would publish them against tonight's video.
  # A dark night is recoverable; publishing last night's description on tonight's episode is not.
  if ! python3 gen_packaging.py; then
    notify "HALT" "gen_packaging failed — the description's chapters could not be reconciled with the on-screen chapter cards, and out/upload_kit.json would be STALE. NOT publishing. See $LOG"
    exit 0
  fi
}
review() {
  # --- STALE-FRAME PRUNE (token audit 2026-08-15, TOKEN_AUDIT §5.5) — THIS IS A CORRECTNESS FIX, ---
  # not housekeeping. out/review/ was still holding 16 source stills from 2026-06-21 — a RETIRED
  # POV/doodle-format episode — and REVIEW_PROMPT.txt names out/review/*.png as the fallback for when
  # out/review/watch/ is empty. qa_watch.py only ever clears its own watch/ dir; qa_sample.py does
  # clear the root stills but had not run in weeks (it is only the fallback). So a single qa_watch
  # failure would have handed the reviewer a TWO-MONTH-OLD video from the retired format and it would
  # have approved or rejected the wrong episode. Delete every frame the previous episode left behind
  # BEFORE sampling this one, so the reviewer can only ever see stills this run just produced.
  # check_watch/ is an orphaned 2026-07-20 sample dir that nothing regenerates; short_watch/ is from
  # the disabled Shorts path and qa_watch recreates it from scratch when that path runs.
  rm -f out/review/*.png 2>/dev/null
  rm -rf out/review/watch out/review/check_watch out/review/short_watch 2>/dev/null
  python3 qa_watch.py out/episode.mp4 || python3 qa_sample.py
  # HARD ASSERT — fail LOUDLY rather than review nothing. With the prune above, zero frames means
  # qa_watch AND qa_sample both failed, and the reviewer would be judging an empty directory. A
  # reviewer with no frames cannot see a black frame, a clipped overlay or a broken limb, and its
  # failure mode is silent APPROVAL — which publishes the defect. A dark night is recoverable; a bad
  # public post is not. The catchup job retries in 2h.
  local NFRAMES
  NFRAMES=$(ls out/review/watch/*.png out/review/*.png 2>/dev/null | wc -l | tr -d '[:space:]')
  if [ "${NFRAMES:-0}" -lt 1 ]; then
    notify "HALT" "no review frames produced (qa_watch AND qa_sample both failed) — refusing to run the reviewer blind. See $LOG"
    exit 0
  fi
  echo "review frames: ${NFRAMES} (all from THIS render)"
  # --- BIND THE VERDICT TO THESE BYTES (2026-08-17) --------------------------------------------
  # The frames above came from the file at out/episode.mp4 as it is RIGHT NOW, and that is the
  # only render this reviewer's verdict can honestly speak for. Record its sha256 so
  # scripts/upload_guard.py can refuse to publish any other bytes under this approval — including
  # a later re-render, and including a hand-run upload while this loop is still revising.
  python3 scripts/upload_guard.py stamp out/episode.mp4 \
    || echo "review stamp FAILED — upload will be blocked by the review guard until this is fixed"
  python3 qa_audio.py || echo "qa_audio failed (non-fatal)"
  # --- PRECOMPUTED FACTS (token audit §7 S7) — emit the deterministic statistics the reviewer used
  # to re-derive by hand with ad-hoc python one-liners (measured: 39 Bash turns in one session,
  # ~2.6M context tokens of pure arithmetic). It ADDS information and removes none: the reviewer
  # still reads every frame and every file, and REVIEW_PROMPT.txt tells it to re-measure anything it
  # doubts. Non-fatal by design — without facts.json the reviewer simply measures by hand as before.
  python3 scripts/review_facts.py || echo "review_facts failed (non-fatal) — reviewer will measure by hand"
  "$CLAUDE" --print --model sonnet "$(cat docs/REVIEW_PROMPT.txt)"
}
decision() { python3 -c "import json;print(json.load(open('out/review/verdict.json')).get('decision','reject'))" 2>/dev/null || echo reject; }

# 0) ANALYTICS — refresh performance data so the showrunner can learn from what landed
echo "--- analytics refresh ---"
python3 scripts/yt_analytics.py || echo "analytics refresh failed (non-fatal)"

# --- DAILY BUDGET ACCOUNTING (token audit §4, 2026-08-15) ------------------------------------------
# THE RULE: an attempt is counted if the creative agent CONSUMED REAL WORK — i.e. it changed
# content.py, ops/episode_meta.json, or docs/research/ — whether or not it went on to succeed.
#
# WHY, precisely. The 2026-07-24 fix moved the increment to AFTER the step-1b new-topic guard so that
# two transient creative failures producing NOTHING could not burn the whole day's budget and dark
# the channel. That intent is right and is preserved below: an agent that dies instantly (the 401, or
# the 2026-08-13 rate-limit that returned in 1 turn at $0.00) touches no file, so it still costs
# nothing. But counting ONLY successes left the opposite hole wide open: an agent that researched the
# topic and half-wrote the script before dying was never counted either, so the 2-hourly catchup
# could spend up to TWELVE full creative sessions in a day against MAX_BUILDS_PER_DAY=2. That is not
# hypothetical — 2026-08-14 ran THREE creative sessions ($17.64 + $0.80 + $1.68) against a cap of 2.
# A file fingerprint separates the two cases exactly: no work done, no charge; work done, charged.
_work_fingerprint() {  # hash of everything a creative pass would have written
  { cat content.py ops/episode_meta.json 2>/dev/null; ls -l docs/research 2>/dev/null; } | shasum | cut -d' ' -f1
}
ATT_COUNTED=0
count_attempt() {  # idempotent — the same run must never burn two of the day's attempts
  [ "$ATT_COUNTED" = 1 ] && return 0
  ATT_COUNTED=1
  python3 -c "import json,os; f='$ATT_FILE'; d=json.load(open(f)) if os.path.exists(f) else {}; c=d.get('count',0) if d.get('date')=='$TODAY' else 0; json.dump({'date':'$TODAY','count':c+1}, open(f,'w'))" 2>/dev/null || true
  echo "counted a build attempt against MAX_BUILDS_PER_DAY=${MAX_BUILDS_PER_DAY:-2} — $1"
}

# --- WRITE-BY-DEFAULT: WHO DECIDES "REUSE vs WRITE", AND WHAT CATCHES A SHORT-CIRCUIT ------------
# (2026-08-15. The failure this closes happened on the FIRST live post-merge run.)
#
# WHAT WENT WRONG. content.py and ops/episode_meta.json always still hold the PREVIOUS run's episode
# when the creative agent starts. AUTOPILOT_PROMPT step 0 (WO-32) asked the AGENT to decide whether
# that episode was owed to the channel (REUSE) or already shipped (WRITE A NEW ONE), using one test:
# "is the topic on disk in produced_topics.json?". On the first live run the repo happened to hold
# the merged `lehman_brothers` SAMPLE — never published, therefore not in produced_topics — so the
# agent took REUSE, spent its whole pass VALIDATING the episode it found, and wrote nothing new.
# The step-1b anti-duplicate guard waved it through because the topic was genuinely unpublished.
# THAT GUARD DID NOT SAVE US; IT AGREED WITH THE BUG. A silent reuse that happens to pass the
# duplicate check is exactly how a channel republishes stale work.
#
# WHY THE AGENT COULD NOT GET IT RIGHT. "Unpublished topic on disk" does not mean "owed episode". It
# also means: a sample someone merged, a half-written draft from a crashed run, or an episode the
# reviewer REJECTED. The agent cannot tell those apart from the files alone — the information simply
# is not there. So we stop asking it.
#
# THE RUNNER DECIDES, AND WRITING IS THE DEFAULT. An episode is "owed" only if THIS SCRIPT built it,
# committed to publishing it, and then failed at render or upload. That is a fact only the runner
# knows, so the runner records it in runs/owed_episode.txt (written after BUILD OK; cleared on a
# successful publish, on a non-approve verdict, and on a final-gate failure — a rejected episode is
# to be rewritten, not re-shipped). REUSE is authorised ONLY when that marker names the exact topic
# sitting on disk. Every other state — including "unpublished topic, no marker", the case that broke
# — is WRITE A NEW ONE. The decision is prepended to the prompt as a runner directive so the agent
# is told which branch it is on rather than inferring it.
#
# AND IF THE AGENT SHORT-CIRCUITS ANYWAY, WE CATCH IT. A pass that was ordered to WRITE and came
# back with the SAME topic it started with AND no new or changed research file did not write an
# episode — whatever it says it did. That is a FAILED creative pass, not a night's work, and it
# HALTs. Both conditions are required: a genuine new episode always changes the topic, and a genuine
# new episode always writes docs/research/<slug>.md (prompt step 2, "BEFORE writing a line of
# script"). Requiring both is what keeps a legitimate rewrite of an already-researched subject from
# tripping it.
_topic_on_disk() { python3 -c "import json;print(json.load(open('ops/episode_meta.json')).get('topic',''))" 2>/dev/null; }
_research_fp() {   # CONTENT hash, not `ls -l`: a rewrite within the same minute at the same size is
                   # invisible to a timestamp listing, and that is precisely a re-researched topic.
  find docs/research -type f -name '*.md' -exec shasum {} + 2>/dev/null | sort | shasum | cut -d' ' -f1
}
OWED_FILE="runs/owed_episode.txt"
PRE_TOPIC="$(_topic_on_disk)"
PRE_RESEARCH="$(_research_fp)"
OWED_TOPIC="$(cat "$OWED_FILE" 2>/dev/null)"
REUSE_OK=0
if [ -n "$PRE_TOPIC" ] && [ "$OWED_TOPIC" = "$PRE_TOPIC" ] && \
   python3 -c "import json,sys;t='$PRE_TOPIC';p=[x['topic'] for x in json.load(open('ops/produced_topics.json'))['produced']];sys.exit(0 if t not in p else 1)" 2>/dev/null; then
  REUSE_OK=1
fi

if [ "$REUSE_OK" = 1 ]; then
  echo "step 0 decided by the runner: REUSE — '$PRE_TOPIC' was built by a previous run and never published (runs/owed_episode.txt)"
  REUSE_DIRECTIVE="RUNNER DIRECTIVE — STEP 0 IS ALREADY DECIDED, DO NOT RE-DECIDE IT: **REUSE**.
The runner built the episode now on disk (topic '$PRE_TOPIC') on an earlier run and it failed at render or upload, so it is still owed to the channel. Do NOT rewrite it and do NOT change the topic. Verify docs/research/<slug>.md exists and is sourced, run the step-5 self-checks, get a BUILD OK, then STOP. Skip steps 1-4. Ignore the REUSE/WRITE test in step 0 below — this directive overrides it."
else
  echo "step 0 decided by the runner: WRITE A NEW ONE (no owed-episode marker for '$PRE_TOPIC')"
  REUSE_DIRECTIVE="RUNNER DIRECTIVE — STEP 0 IS ALREADY DECIDED, DO NOT RE-DECIDE IT: **WRITE A NEW ONE**.
The episode on disk (topic '$PRE_TOPIC') is NOT owed to the channel. It is a shape reference and nothing more. Ignore the REUSE/WRITE test in step 0 below — this directive overrides it, and REUSE is not available to you on this run.
You MUST do steps 1-6 in full: pick a NEW subject, write docs/research/<slug>.md for it, and overwrite content.py and ops/episode_meta.json so the topic is NOT '$PRE_TOPIC'.
Validating, checking or repairing the episode already on disk is NOT this run's work. The runner detects it — if the topic is unchanged and no research file was written, it treats the pass as FAILED and HALTs the night. Writing a fresh episode is the job."
fi

# 1) CREATIVE — pick topic, research, write content.py + ops/episode_meta.json (per AUTOPILOT_PROMPT)
echo "--- creative agent ---"
PRE_FP="$(_work_fingerprint)"
rm -f runs/build_attempts.txt   # fresh bounded-build budget for this agent (scripts/build_capped.sh)
"$CLAUDE" --print --model sonnet "$REUSE_DIRECTIVE

$(cat docs/AUTOPILOT_PROMPT.txt)"
POST_FP="$(_work_fingerprint)"
if [ "$POST_FP" != "$PRE_FP" ]; then
  count_attempt "creative agent wrote to content.py / episode_meta.json / docs/research"
else
  echo "creative agent changed no file — transient no-op, NOT counted against the daily budget"
fi
echo "creative agent used $(cat runs/build_attempts.txt 2>/dev/null || echo 0) of ${MAX_BUILD_RERUNS:-4} bounded build attempts"

# 1a) SHORT-CIRCUIT DETECTION — see the block above. Ordered AFTER the budget accounting on purpose:
#     an agent that burned a real session still burns the day's attempt even though we reject its work.
POST_TOPIC="$(_topic_on_disk)"
POST_RESEARCH="$(_research_fp)"
if [ "$REUSE_OK" != 1 ] && [ "$POST_TOPIC" = "$PRE_TOPIC" ] && [ "$POST_RESEARCH" = "$PRE_RESEARCH" ]; then
  notify "HALT" "creative agent SHORT-CIRCUITED: it was told to WRITE A NEW ONE but came back on the same topic ('$POST_TOPIC') with no new or changed research file — it validated the episode already on disk instead of writing one. Treating this as a FAILED creative pass; NOT rendering or publishing stale work. Catchup retries in 2h. See $LOG"
  exit 0
fi

# 1b) GUARD — the creative agent MUST have advanced to a NEW (unproduced) topic. If it failed (e.g.
#     the transient claude 401 on 2026-06-24), episode_meta is left on the PREVIOUS topic and we would
#     re-render + re-post the SAME video (that caused the founder DUPLICATE). HALT instead — the catchup
#     job retries in 2h with a working agent. Bulletproof anti-duplicate gate.
NEWTOPIC=$(python3 -c "import json;print(json.load(open('ops/episode_meta.json')).get('topic',''))" 2>/dev/null)
if ! python3 -c "import json,sys;t='$NEWTOPIC';p=[x['topic'] for x in json.load(open('ops/produced_topics.json'))['produced']];sys.exit(0 if (t and t not in p) else 1)"; then
  notify "HALT" "creative agent did not advance to a new topic (got '$NEWTOPIC'; already produced/empty) — likely agent failure. NOT re-posting stale content. Catchup will retry."
  exit 0
fi
echo "creative agent advanced to NEW topic: $NEWTOPIC"
# Belt-and-braces: a successful pass always rewrites episode_meta.json, so the fingerprint above has
# already counted it. count_attempt is idempotent, so this can never double-charge the day.
count_attempt "creative agent advanced to a new topic — committing to build+render+review"

# 2) BUILD + GATE + SMOKE (crisp VO + music + quality gate + 1-frame render check). HALT if it fails.
# --- ONE BOUNDED GATE REPAIR (WO-32) --------------------------------------------------------------
# Measured, not hypothetical: across four cold runs of the creative step on the crayon format, the
# agent NEVER got to see its own build result. A new script means ~200 VO clips to synthesise, which
# is longer than one foreground command it is allowed to run, so it backgrounds build.py and — being
# headless — dies the moment it stops to wait. AUTOPILOT_PROMPT.txt now tells it to run the build in
# the foreground and simply re-run on timeout (the VO cache resumes), but the writer only gets ONE
# look at the gate either way, and the two numbers it most often lands wrong (WPM runtime-inclusive
# and scene count) are only knowable AFTER the build. One cold run left a well-formed 220-scene
# episode at 136.4 WPM — a hard HALT the writer could have fixed in one pass by adding words.
# So: on a failed build, hand the gate's own output back for ONE repair attempt and rebuild once.
# Still fully gate-gated (a second failure HALTs exactly as before) and topic-locked (the repair
# agent may not change the subject, so the step-1b anti-duplicate guard above still holds).
# REVERT: delete this block and restore the single `if ! python3 build.py; then notify …` line.
echo "--- build + gate + smoke ---"
BUILD_OUT="runs/autopilot/build_$(date +%H%M%S).txt"
python3 build.py 2>&1 | tee "$BUILD_OUT"; BUILD_RC=${pipestatus[1]}
if [ "${BUILD_RC:-1}" != 0 ]; then
  echo "--- build failed — ONE gate-repair pass ---"
  rm -f runs/build_attempts.txt   # the repair agent gets its own fresh bounded-build budget
  "$CLAUDE" --print --model sonnet "You are the production team on the CoreLifecycle crayon explainer pipeline. \`python3 build.py\` HALTED. Its output ends:

$(tail -40 "$BUILD_OUT")

Fix ONLY what made it HALT, in content.py and/or ops/episode_meta.json, and keep the SAME TOPIC — the runner has already committed to it and changing it re-posts stale content. Read docs/BIBLE.md §3 and §3a before you touch anything; the bands ARE the format. The usual causes and their ONLY correct fixes: WPM runtime-inclusive too LOW -> USE SHORTER WORDS, and do NOT add words or scenes. This is measured (WO-32): the voice speaks at a constant ~241 syllables/minute, so WPM runtime is set by SYLLABLES PER WORD and nothing else — WPM ≈ 215 / (syllables per word), accurate to ~1 WPM across two finished episodes (1.422 syll/word = 152.5 WPM, 1.559 = 138.1). Count syllables/word across all narration, then rewrite Latinate words as short concrete ones ('lab' not 'laboratory', 'about' not 'approximately', 'he lied' not 'he misrepresented the situation') until it is 1.42-1.45. Adding words raises the runtime with the word count and barely moves the ratio; removing commas makes it SLOWER, not faster (a period pauses longer than a comma). WPM too HIGH -> SPLIT MORE SCENES (measured: same script, 141 scenes = 154.2 WPM, 196 scenes = 152.7 WPM); runtime over 21 min -> cut scenes AND their words; \`template 'None' not in registry\` -> that scene has no \`template=\`, and EVERY scene needs one from the thirteen explainer environments even when a full-screen \`card=\` covers it; a template name not in the registry -> replace it with one of the thirteen (officeFloor, boardroom, exchangeFloor, cityStreet, domesticInterior, newsMontage, bankExterior, courtHearing, factoryFloor, broadcastDesk, crowdQueue, closeUpPortrait, chartBoard); missing/silent audio -> the scene text, not the audio. Do NOT edit gate.py, build.py, gen_voice_edge.py or docs/CRAYON_BIBLE.md, and never widen a band to pass. Then run \`scripts/build_capped.sh\` in the FOREGROUND — it wraps \`python3 build.py\` and is the ONLY build command you may use. It may time out on a big VO re-synth; if it does, run the SAME command again, because every clip already made is cached and each re-run resumes. YOU GET AT MOST ${MAX_BUILD_RERUNS:-4} ATTEMPTS: the wrapper counts them in runs/build_attempts.txt and REFUSES to start another build once they are gone. Stop the moment it prints BUILD OK, or on a failure you cannot act on. If the cap is reached without a BUILD OK, STOP and say plainly that the build did not complete and what the last failure was — do not look for another way to run it. Then STOP."
  python3 build.py 2>&1 | tee -a "$BUILD_OUT"; BUILD_RC=${pipestatus[1]}
fi
if [ "${BUILD_RC:-1}" != 0 ]; then notify "HALT" "build/gate/smoke failed after 1 repair pass — not rendering. See $LOG"; exit 0; fi
echo "gate-repair used $(cat runs/build_attempts.txt 2>/dev/null || echo 0) of ${MAX_BUILD_RERUNS:-4} bounded build attempts"

# --- OWED-EPISODE MARKER (see the write-by-default block above) ---------------------------------
# From here the runner is committed to shipping THIS episode: it is built and gate-passed. If the
# night now dies in render or upload, tomorrow's run is entitled to REUSE it instead of throwing a
# good episode away — and this file is the only place that fact is recorded. It is CLEARED on a
# successful publish, on a non-approve verdict, and on a final-gate failure, because an episode the
# reviewer refused is to be rewritten, not re-shipped.
_topic_on_disk > "$OWED_FILE"

# 3) RENDER (verified)
echo "--- render ---"
render || { notify "FAIL" "render failed/unverified. See $LOG"; exit 1; }

# 4) PACKAGE (thumbnail still + upload_kit.json) so the reviewer judges packaging that matches
#    THIS episode, then REVIEWER (acts as a human creative director) + fix-loop (max 2 revisions)
echo "--- package + reviewer ---"
package
review
DEC=$(decision)
echo "reviewer decision: $DEC"
tries=0
while [ "$DEC" = "revise" ] && [ $tries -lt 2 ]; do
  echo "--- reviewer requested revisions (pass $((tries + 1))) ---"
  # WO-32: this prompt used to say "keep the same topic + DOODLE style" and pointed at the LEGACY
  # template files (src/scenes.tsx, src/stage.tsx). On a CRAYON episode that actively pushes the
  # video back toward the retired POV/doodle format and edits files the thirteen explainer
  # environments do not live in. The format is third-person crayon (docs/BIBLE.md +
  # docs/CRAYON_BIBLE.md); the art lives in src/explainer.tsx and its helpers.
  "$CLAUDE" --print --model sonnet "You are the production team. Read out/review/verdict.json (the reviewer's notes) and apply its 'fixes' PRECISELY. READ AND EDIT IN BATCHES: issue 8-12 tool calls in a SINGLE message rather than one per message. Every round-trip re-sends your whole accumulated context, so serial single-call turns cost quadratically — measured, this step runs 101-123 turns at ONE tool call each, which is the most wasteful shape in the pipeline. Batching changes nothing about what you read or edit; open the verdict, content.py, ops/episode_meta.json and the .tsx files you need in one message, and group independent edits together too. FORMAT: this channel is a THIRD-PERSON, PAST-TENSE crayon-style explainer about a real subject — docs/BIBLE.md is the writer canon and docs/CRAYON_BIBLE.md is the measured style spec. Keep the same topic and the same crayon style: never reintroduce the retired second-person POV / doodle format (line art on warm paper, 'Every Level', level ladders, present tense), and never emit a legacy template name from docs/TEMPLATES.md — the episode uses ONLY the thirteen explainer environments (officeFloor, boardroom, exchangeFloor, cityStreet, domesticInterior, newsMontage, bankExterior, courtHearing, factoryFloor, broadcastDesk, crowdQueue, closeUpPortrait, chartBoard). You MAY edit any of: content.py + ops/episode_meta.json (script, scene fields card=/bubbles=/panels=/foreground=/period=, packaging copy), src/explainer.tsx (the thirteen environments), src/setdressing.tsx + src/crayonStyle.ts (shared props, palette, ink), src/textcard.tsx (full-screen cards), src/bubble.tsx (speech balloons / floating dialogue), src/panels.tsx (multi-panel splits), src/director.tsx + src/Video2.tsx (shot framing + overlay layout), src/thumbs.tsx (thumbnail). Do NOT edit gate.py or docs/CRAYON_BIBLE.md, and do not weaken a rule to make the episode fit it. Apply EVERY actionable fix in the verdict (do not skip a fix because of file scope). Then STOP; the runner will rebuild, re-render, and re-review."
  if ! python3 build.py; then notify "HALT" "build failed after revision. See $LOG"; exit 0; fi
  render || { notify "FAIL" "render failed after revision. See $LOG"; exit 1; }
  package
  review
  DEC=$(decision)
  echo "reviewer decision (pass $((tries + 1))): $DEC"
  tries=$((tries + 1))
done

if [ "$DEC" != "approve" ]; then
  # The reviewer refused this episode: it is NOT owed to the channel. Drop the marker so tomorrow's
  # run writes a fresh one instead of REUSING work that was judged not good enough.
  rm -f "$OWED_FILE"
  notify "HALT" "reviewer decision='$DEC' after $tries fix pass(es). NOT publishing — left for human."
  exit 0
fi
echo "reviewer APPROVED ✅"

# 5) FINAL FILE GATE — packaging (thumbnail + upload_kit.json) already matches the approved episode
python3 gate.py out/episode.mp4 || { rm -f "$OWED_FILE"; notify "HALT" "final gate failed — not publishing. See $LOG"; exit 0; }

# 6) PUBLISH
if grep -q '"autoUpload": *true' ops/routine.json; then
  echo "--- upload ---"
  # NO --force (2026-07-20): --force bypasses yt_upload's title_live duplicate guard, and that is
  # how this channel keeps getting twins. A large upload can finish server-side and STILL raise a
  # client-side TimeoutError while awaiting the response — YouTube has the video, we think we
  # failed, and the next attempt uploads it again. That produced the duplicate special_forces
  # (molUoFUlmso / MiXTy6PUdDk) and again the startup_unicorn pair on 2026-07-20.
  # Without --force the guard sees the existing title and exits 0 instead of publishing a twin.
  # ---------------------------------------------------------------------------------------------
  # >>> FIRST-RUN SAFETY (WO-32) — RECOMMENDED FOR THE FIRST UNATTENDED **CRAYON** NIGHT ONLY <<<
  # Tonight is the first time the autopilot writes AND publishes a new-format episode with no human
  # in the loop: the creative agent has only ever been exercised by hand on this format, and the
  # reviewer is judging against freshly-rewritten canon. Everything downstream of the gate is
  # unproven END TO END. To de-risk exactly one night, comment out the `--privacy public` line
  # below and uncomment the `--privacy unlisted` one: the run still produces, gates, reviews and
  # UPLOADS, so a failure shows up as a real video you can watch — it simply is not pushed to subs
  # or the feed, and flipping it to public in YouTube Studio is one click. Nothing else changes
  # (produced_topics + last_post are still written, so the duplicate guards keep working).
  # REVERT: put the two lines back the way they are now. Do not leave unlisted on past one night —
  # an unlisted episode earns no impressions and the channel reads as dark.
  #   if python3 scripts/yt_upload.py --privacy unlisted; then   # <-- first crayon night only
  if python3 scripts/yt_upload.py --privacy public; then
  # ---------------------------------------------------------------------------------------------
    notify "PUBLISHED" "$(python3 -c "import json;print(json.load(open('ops/episode_meta.json'))['title'])" 2>/dev/null)"
    # mark the topic produced ONLY now (on a real publish) so a failed render never orphans it
    python3 -c "
import json, os, datetime
m=json.load(open('ops/episode_meta.json')); t=m.get('topic')
p=json.load(open('ops/produced_topics.json'))
if t and t not in [x.get('topic') for x in p['produced']]:
    url=json.load(open('out/uploads.json'))[-1].get('url','') if os.path.exists('out/uploads.json') else ''
    p['produced'].append({'topic':t,'title':m.get('title'),'url':url,'date':datetime.date.today().isoformat()})
    json.dump(p, open('ops/produced_topics.json','w'), indent=2); print('marked produced:', t)
" || echo "produced_topics update failed (non-fatal)"
    date +%F > runs/last_post.txt
    rm -f "$OWED_FILE"   # published — nothing is owed to the channel any more, so the next run WRITES
    # 7) SHORT — auto-cut a vertical Short, WATCH + gate + review it, then publish (growth; non-fatal)
    # Gated on routine.json autoShorts (default OFF since 2026-07-19 — see _autoShorts_note there).
    # Skipping saves a FULL extra Remotion render + a reviewer agent call on every episode.
    # WO-32: KEEP IT OFF ON THE CRAYON FORMAT. The Short path is still entirely POV/doodle-era —
    # src/Short.tsx renders black-ink-on-paper with a "WATCH THE FULL CLIMB" CTA, shorts_cut.py
    # defaults its kicker to "EVERY LEVEL OF A", and gen_short_packaging.py mints
    # "Every Level of a <profession>" titles off a topic slug that is now a company or a scandal.
    # Turning autoShorts on today would post old-format branding under new-format episodes.
    if ! grep -q '"autoShorts": *true' ops/routine.json; then
      echo "--- short: SKIPPED (autoShorts off in ops/routine.json) ---"
    else
    echo "--- short ---"
    # reuse the cloud-rendered Short if we have it; else cut + render it locally
    if { [ "$CLOUD_OK" = 1 ] && [ -f out/short.mp4 ]; } || { python3 shorts_cut.py && npx remotion render Short out/short.mp4 --timeout=120000; }; then
      [ "$CLOUD_OK" = 1 ] || python3 audio_master.py out/short.mp4 || echo "short audio_master failed (non-fatal)"
      python3 qa_watch.py out/short.mp4 out/review/short_watch || echo "short qa_watch failed (non-fatal)"
      # same binding as the episode: the Short's approval covers these exact bytes and no others
      python3 scripts/upload_guard.py stamp out/short.mp4 \
        || echo "short review stamp FAILED — the review guard will block the Short upload"
      if python3 short_gate.py out/short.mp4; then
        "$CLAUDE" --print --model sonnet "$(cat docs/SHORT_REVIEW_PROMPT.txt)"
        SDEC=$(python3 -c "import json;print(json.load(open('out/review/short_verdict.json')).get('decision','reject'))" 2>/dev/null || echo reject)
        echo "short reviewer: $SDEC"
        if [ "$SDEC" = approve ] && python3 gen_short_packaging.py && python3 scripts/yt_upload.py --kit out/short_kit.json --force; then
          echo "short posted ✅"
        else
          echo "short NOT posted (reviewer='$SDEC' or upload issue) — full video already live. See out/review/short_verdict.json"
        fi
      else
        echo "short HALT: short_gate failed (length/file/audio) — not posting. Full video already live."
      fi
    else
      echo "short render failed (non-fatal) — full video already published"
    fi
    fi  # end autoShorts gate
  else
    notify "FAIL" "upload step failed. Video built + approved but not published. See $LOG"
  fi
else
  notify "BUILT" "autoUpload off — approved, not published. out/episode.mp4 ready."
fi
