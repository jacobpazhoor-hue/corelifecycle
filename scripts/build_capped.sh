#!/bin/zsh
# ==================================================================================================
# BOUNDED BUILD — the counted way for an AGENT to run `python3 build.py`
# ==================================================================================================
# WHY THIS EXISTS (docs/TOKEN_AUDIT.md §4 "Agent-internal loops (unbounded)", recommendation S9).
# Two prompts told an agent to loop on the build with no bound at all:
#
#   docs/AUTOPILOT_PROMPT.txt  — "IF THE CALL TIMES OUT, RUN THE SAME COMMAND AGAIN … Repeat until
#                                 it prints either BUILD OK or a real gate failure you can act on."
#   scripts/daily_autopilot.sh — "run `python3 build.py` in the FOREGROUND … until it prints
#                                 BUILD OK or a different failure."
#
# The INSTRUCTION IS CORRECT and is deliberately kept: a new script means ~200 VO clips to
# synthesise, that is longer than one foreground tool call is allowed to take, and gen_voice_edge
# caches every clip so each re-run genuinely resumes. What was missing is a NUMBER. "Repeat until"
# with no count is the shape of a runaway — the only thing bounding it was the CLI's own turn limit,
# and each turn re-sends the agent's whole accumulated context.
#
# A cap written only in the prompt is a request. This wrapper makes it a FACT: the ledger lives in a
# FILE, so the count survives the tool call being killed mid-build (which is the exact case the loop
# exists for) and survives the agent starting a fresh turn. Past the cap it refuses to start another
# build at all and says so loudly, so the agent stops and reports instead of grinding.
#
# HAPPY PATH IS UNCHANGED. Attempt 1 runs `python3 build.py` and passes its stdout, stderr and exit
# code straight through. A night whose build works today prints one extra header line and behaves
# identically. build.py itself is NOT touched.
#
# USAGE:  scripts/build_capped.sh            (from the repo root; extra args pass through to build.py)
# RESET:  the runner clears runs/build_attempts.txt before each agent that is allowed to loop, so
#         every agent gets its own fresh budget. `rm runs/build_attempts.txt` does it by hand.
# TUNE:   MAX_BUILD_RERUNS=N (default 4 — the audit's S9 figure).
# ==================================================================================================
cd "${0:A:h}/.." || { echo "build_capped: cannot find the repo root" >&2; exit 1; }

LEDGER="runs/build_attempts.txt"
MAX="${MAX_BUILD_RERUNS:-4}"
mkdir -p runs 2>/dev/null

USED=$(cat "$LEDGER" 2>/dev/null || echo 0)
case "$USED" in (*[!0-9]*|"") USED=0 ;; esac   # a corrupt ledger must not disable the cap

if [ "$USED" -ge "$MAX" ]; then
  # Deliberately do NOT increment here: every call past the cap reports the same honest number
  # instead of drifting ("5 of 4"), and the ledger stays a count of builds actually started.
  echo "" >&2
  echo "✖ BUILD ATTEMPT CAP REACHED — $USED of $MAX attempts already used, refusing to start another." >&2
  echo "  The build did not reach BUILD OK within its budget. STOP RE-RUNNING IT." >&2
  echo "  Say plainly in your final message that the build did not complete, and what the last" >&2
  echo "  failure was. The runner will HALT the night; the catchup job retries in 2h." >&2
  echo "  (Raise the budget only deliberately: MAX_BUILD_RERUNS=N scripts/build_capped.sh)" >&2
  echo "" >&2
  exit 9
fi

N=$(( USED + 1 ))
echo "$N" > "$LEDGER"
echo "--- build attempt $N of $MAX (scripts/build_capped.sh) ---"
python3 build.py "$@"
RC=$?
if [ "$RC" != 0 ]; then
  echo "--- build attempt $N of $MAX exited $RC — $(( MAX - N )) attempt(s) left in the budget ---" >&2
fi
exit $RC
