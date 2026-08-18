#!/usr/bin/env bash
# Make the headless-Chromium shared libraries available on a GitHub `ubuntu-latest` runner.
# Extra packages the caller genuinely needs (e.g. ffmpeg) are passed as arguments.
#
# WHY THIS IS A SCRIPT AND NOT A BARE `apt-get update` ANY MORE
# -------------------------------------------------------------
# A bare `sudo apt-get update` is what took the channel dark for two nights. apt intermittently
# cannot reach azure.archive.ubuntu.com, silently falls back to archive.ubuntu.com, fetches the
# four InRelease files -- and then blocks FOREVER with no further output and no timeout.
#
#   run 32168842212, shards 8/10/11/19 (and run 32086857638, shards 0/1/4/9/12):
#     18:16:41  Ign:2 http://azure.archive.ubuntu.com/ubuntu noble InRelease
#     18:16:41  Get:5 https://archive.ubuntu.com/ubuntu noble-security InRelease [126 kB]
#     19:26:13  ##[error]The operation was canceled.
#
# 70 minutes between those last two lines, and `npx remotion render` never started. The shards
# that hung were a different, random set each run -- it is a mirror flake, not the episode.
# The job then exceeded timeout-minutes, GitHub reported the run as `cancelled`, and the Mac
# dropped to a local render it has no disk for.
#
# The install itself was always a no-op ("0 upgraded, 0 newly installed" on every healthy shard)
# because the runner image already ships every one of these libraries. So this step is best-effort
# hardening, not a dependency install: bound it, never let a mirror stall be fatal, and then
# VERIFY what actually matters -- that the loader can resolve the libraries -- failing loudly and
# within seconds if one genuinely is missing, instead of hanging for an hour.
set -uo pipefail
export DEBIAN_FRONTEND=noninteractive

EXTRA=("$@")
PKGS=(libnss3 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2
      libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1
      libpango-1.0-0 libcairo2 libasound2t64 fonts-liberation)
# Retries+per-connection timeouts stop apt waiting on a dead mirror; `timeout` is the hard stop
# for the case apt ignores its own timeouts (which is exactly the failure above). -k SIGKILLs if
# SIGTERM is not honoured. The three budgets total 90+120+90 = 300s, deliberately UNDER the
# step's `timeout-minutes: 6` -- otherwise a triple stall would be killed by the step cap
# before reaching the verification below, and fail the job that this is meant to save.
APT=(-o Acquire::Retries=2 -o Acquire::http::Timeout=15 -o Acquire::https::Timeout=15)

sudo timeout -k 5 90 apt-get "${APT[@]}" update \
  || echo "::warning::apt-get update stalled or failed; continuing with the runner image's preinstalled packages"

sudo timeout -k 5 120 apt-get "${APT[@]}" install -y --no-install-recommends ${EXTRA[@]+"${EXTRA[@]}"} "${PKGS[@]}" \
  || sudo timeout -k 5 90 apt-get "${APT[@]}" install -y --no-install-recommends ${EXTRA[@]+"${EXTRA[@]}"} libasound2 \
  || echo "::warning::apt-get install stalled or failed; continuing with the runner image's preinstalled packages"

# Verify by SONAME, not by package name: the package names drift across Ubuntu releases
# (libasound2 -> libasound2t64, libatk1.0-0 -> libatk1.0-0t64), the sonames do not.
# Read the loader cache ONCE into a variable and match with `case`. Do NOT pipe `ldconfig -p`
# into `grep -q` per library: grep exits at the first match, ldconfig then dies of SIGPIPE (141),
# and under `set -o pipefail` that non-zero status makes the pipeline look like "not found" --
# so a perfectly healthy runner reports most libraries missing, at random, depending on how far
# ldconfig got before the pipe closed. Caught in testing; it would have failed all 22 jobs.
LDCACHE="$(ldconfig -p 2>/dev/null)" || LDCACHE=""
missing=""
for so in libnss3.so libdbus-1.so.3 libatk-1.0.so.0 libatk-bridge-2.0.so.0 libcups.so.2 \
          libdrm.so.2 libxkbcommon.so.0 libXcomposite.so.1 libXdamage.so.1 libXfixes.so.3 \
          libXrandr.so.2 libgbm.so.1 libpango-1.0.so.0 libcairo.so.2 libasound.so.2; do
  case "$LDCACHE" in *"$so"*) ;; *) missing="$missing $so" ;; esac
done
for bin in ${EXTRA[@]+"${EXTRA[@]}"}; do
  command -v "$bin" >/dev/null 2>&1 || missing="$missing $bin(binary)"
done
if [ -n "$missing" ]; then
  echo "::error::Chromium prerequisites genuinely missing and apt could not supply them:$missing"
  exit 1
fi
echo "system libs OK: all Chromium sonames resolvable${EXTRA[*]:+, extras present: ${EXTRA[*]}}"
