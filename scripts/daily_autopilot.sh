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

# --- run lock: never let two runs (nightly + manual) collide on out/episode.mp4 ---
LOCK="runs/.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  echo "HALT: another autopilot run holds $LOCK (started $(cat $LOCK/started 2>/dev/null)). Exiting."
  exit 0
fi
date > "$LOCK/started"

# --- SHARED machine-wide lock (cross-project) ---
# This 8GB Mac also runs the Sammi the Sloth video autopilot at 2am. Two heavy TTS+render pipelines
# at once swap-death BOTH. Only ONE video autopilot does heavy work at a time — WAIT for the other
# to finish (not skip), so both channels still produce, just serialized. (sammy-sloth-video's
# daily_autopilot.sh holds the same /tmp/video_autopilot.lock.) Released in finish().
SHARED_LOCK="/tmp/video_autopilot.lock"; _w=0
while ! mkdir "$SHARED_LOCK" 2>/dev/null; do
  _h="$(cat "$SHARED_LOCK/holder" 2>/dev/null)"
  _age=$(( $(date +%s) - $(stat -f %m "$SHARED_LOCK" 2>/dev/null || echo 0) ))
  if [ "$_age" -gt 10800 ] || { [ -n "$_h" ] && ! kill -0 "$_h" 2>/dev/null; }; then
    rm -rf "$SHARED_LOCK"; continue   # steal a stale (dead holder, or >3h) lock
  fi
  [ "$_w" -ge 14400 ] && { echo "shared video lock held >4h — exiting."; exit 0; }
  echo "waiting on shared video lock (held by pid ${_h:-?}) … ${_w}s"; sleep 120; _w=$(( _w + 120 ))
done
echo $$ > "$SHARED_LOCK/holder"; GOT_SHARED=1

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
  python3 gen_packaging.py
}
review() { python3 qa_watch.py out/episode.mp4 || python3 qa_sample.py; python3 qa_audio.py || echo "qa_audio failed (non-fatal)"; "$CLAUDE" --print "$(cat docs/REVIEW_PROMPT.txt)"; }
decision() { python3 -c "import json;print(json.load(open('out/review/verdict.json')).get('decision','reject'))" 2>/dev/null || echo reject; }

# 0) ANALYTICS — refresh performance data so the showrunner can learn from what landed
echo "--- analytics refresh ---"
python3 scripts/yt_analytics.py || echo "analytics refresh failed (non-fatal)"

# 1) CREATIVE — pick topic, research, write content.py + ops/episode_meta.json (per AUTOPILOT_PROMPT)
echo "--- creative agent ---"
# Count this as a full build attempt (see budget guard above)
python3 -c "import json,os; f='runs/autopilot_attempts.json'; d=json.load(open(f)) if os.path.exists(f) else {}; c=d.get('count',0) if d.get('date')=='$TODAY' else 0; json.dump({'date':'$TODAY','count':c+1}, open(f,'w'))" 2>/dev/null || true
"$CLAUDE" --print "$(cat docs/AUTOPILOT_PROMPT.txt)"

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

# 2) BUILD + GATE + SMOKE (crisp VO + music + quality gate + 1-frame render check). HALT if it fails.
echo "--- build + gate + smoke ---"
if ! python3 build.py; then notify "HALT" "build/gate/smoke failed — not rendering. See $LOG"; exit 0; fi

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
  "$CLAUDE" --print "You are the production team. Read out/review/verdict.json (the reviewer's notes) and apply its 'fixes' PRECISELY. You MAY edit any of: content.py, ops/episode_meta.json, src/scenes.tsx, src/stage.tsx (scene packs / figure positions), src/director.tsx + src/Video2.tsx (shot framing + overlay layout), src/thumbs.tsx (thumbnail). Keep the same topic + doodle style. Apply EVERY actionable fix in the verdict (do not skip a fix because of file scope — the whole src/ is in scope). Then STOP; the runner will rebuild, re-render, and re-review."
  if ! python3 build.py; then notify "HALT" "build failed after revision. See $LOG"; exit 0; fi
  render || { notify "FAIL" "render failed after revision. See $LOG"; exit 1; }
  package
  review
  DEC=$(decision)
  echo "reviewer decision (pass $((tries + 1))): $DEC"
  tries=$((tries + 1))
done

if [ "$DEC" != "approve" ]; then
  notify "HALT" "reviewer decision='$DEC' after $tries fix pass(es). NOT publishing — left for human."
  exit 0
fi
echo "reviewer APPROVED ✅"

# 5) FINAL FILE GATE — packaging (thumbnail + upload_kit.json) already matches the approved episode
python3 gate.py out/episode.mp4 || { notify "HALT" "final gate failed — not publishing. See $LOG"; exit 0; }

# 6) PUBLISH
if grep -q '"autoUpload": *true' ops/routine.json; then
  echo "--- upload ---"
  if python3 scripts/yt_upload.py --privacy public --force; then
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
    # 7) SHORT — auto-cut a vertical Short, WATCH + gate + review it, then publish (growth; non-fatal)
    echo "--- short ---"
    # reuse the cloud-rendered Short if we have it; else cut + render it locally
    if { [ "$CLOUD_OK" = 1 ] && [ -f out/short.mp4 ]; } || { python3 shorts_cut.py && npx remotion render Short out/short.mp4 --timeout=120000; }; then
      [ "$CLOUD_OK" = 1 ] || python3 audio_master.py out/short.mp4 || echo "short audio_master failed (non-fatal)"
      python3 qa_watch.py out/short.mp4 out/review/short_watch || echo "short qa_watch failed (non-fatal)"
      if python3 short_gate.py out/short.mp4; then
        "$CLAUDE" --print "$(cat docs/SHORT_REVIEW_PROMPT.txt)"
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
  else
    notify "FAIL" "upload step failed. Video built + approved but not published. See $LOG"
  fi
else
  notify "BUILT" "autoUpload off — approved, not published. out/episode.mp4 ready."
fi
