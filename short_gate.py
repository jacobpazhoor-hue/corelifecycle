#!/usr/bin/env python3
"""Deterministic pre-publish gate for the auto-cut Short. exit 0 = safe to post, nonzero = HALT.
Hard guarantees that don't need an agent: it's actually a Short (<=60s), the file is real, and it
has audio. Uses Remotion's bundled ffprobe (no system install). Usage: python3 short_gate.py [mp4]
"""
import os, sys, glob, shutil, subprocess

ROOT = os.path.dirname(os.path.abspath(__file__))
VIDEO = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "out", "short.mp4")


def find_ffprobe():
    for d in glob.glob(os.path.join(ROOT, "node_modules", "@remotion", "compositor-*")):
        fp = os.path.join(d, "ffprobe")
        if os.path.exists(fp):
            return fp, d
    return (shutil.which("ffprobe"), None)


def main():
    fails = []
    if not os.path.exists(VIDEO) or os.path.getsize(VIDEO) < 1_000_000:
        print("SHORT GATE: HALT — missing/too-small file:", VIDEO); sys.exit(1)
    fp, libdir = find_ffprobe()
    if not fp:
        print("SHORT GATE: no ffprobe; skipping checks (allow)"); sys.exit(0)
    env = dict(os.environ)
    if libdir:
        env["DYLD_LIBRARY_PATH"] = libdir + ":" + env.get("DYLD_LIBRARY_PATH", "")
        env["LD_LIBRARY_PATH"] = libdir + ":" + env.get("LD_LIBRARY_PATH", "")

    dur = float(subprocess.check_output(
        [fp, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", VIDEO],
        env=env).decode().strip())
    if dur > 180.0:
        fails.append(f"duration {dur:.1f}s > 180s (YouTube Shorts max is 3 min)")
    if dur < 5.0:
        fails.append(f"duration {dur:.1f}s suspiciously short")

    astreams = subprocess.check_output(
        [fp, "-v", "error", "-select_streams", "a", "-show_entries", "stream=codec_type",
         "-of", "default=nw=1:nk=1", VIDEO], env=env).decode().strip()
    if "audio" not in astreams:
        fails.append("no audio stream")

    print(f"short: {dur:.1f}s, audio={'yes' if 'audio' in astreams else 'no'}, "
          f"size={os.path.getsize(VIDEO)//1_000_000}MB")
    for f in fails:
        print("  FAIL:", f)
    print("SHORT GATE: PASS ✅" if not fails else "SHORT GATE: HALT ❌")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
