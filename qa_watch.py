#!/usr/bin/env python3
"""Let the reviewer WATCH the actual rendered video (inspired by bradautomates/claude-video):
sample frames from the ENCODED MP4 across the whole runtime so the reviewer sees motion AND any
encode/concat/shard-boundary/audio-sync defects that source-stills (qa_sample) can't catch.

Uses Remotion's BUNDLED ffmpeg/ffprobe (minimal build → seek per frame, no filters). No system
install, no brew, fully free. Frame budget is kept modest (the reviewer re-runs in the fix-loop,
so this cost is paid up to 3x/night) but still 2-3x richer than the old 16 source stills.

Usage:  python3 qa_watch.py [video=out/episode.mp4] [outdir=out/review/watch]
Env:    QA_FRAMES to override the auto budget.
"""
import os, sys, json, glob, shutil, subprocess

ROOT = os.path.dirname(os.path.abspath(__file__))
VIDEO = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "out", "episode.mp4")
OUTDIR = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "out", "review", "watch")


def find_ff():
    for d in glob.glob(os.path.join(ROOT, "node_modules", "@remotion", "compositor-*")):
        ff, fp = os.path.join(d, "ffmpeg"), os.path.join(d, "ffprobe")
        if os.path.exists(ff) and os.path.exists(fp):
            return ff, fp, d
    if shutil.which("ffmpeg") and shutil.which("ffprobe"):
        return shutil.which("ffmpeg"), shutil.which("ffprobe"), None
    return None, None, None


def main():
    if not os.path.exists(VIDEO):
        print(f"qa_watch: no video at {VIDEO}"); sys.exit(1)
    ffmpeg, ffprobe, libdir = find_ff()
    if not ffmpeg:
        print("qa_watch: no ffmpeg available"); sys.exit(1)
    env = dict(os.environ)
    if libdir:
        env["DYLD_LIBRARY_PATH"] = libdir + ":" + env.get("DYLD_LIBRARY_PATH", "")
        env["LD_LIBRARY_PATH"] = libdir + ":" + env.get("LD_LIBRARY_PATH", "")

    dur = float(subprocess.check_output(
        [ffprobe, "-v", "error", "-show_entries", "format=duration", "-of",
         "default=nw=1:nk=1", VIDEO], env=env).decode().strip())

    # modest adaptive budget (~ every 13-17s for a feature; denser for shorts)
    n = int(os.environ.get("QA_FRAMES") or
            (16 if dur <= 30 else 20 if dur <= 60 else 28 if dur <= 180 else 36 if dur <= 600 else 48))

    if os.path.isdir(OUTDIR):
        shutil.rmtree(OUTDIR)
    os.makedirs(OUTDIR, exist_ok=True)

    made = 0
    for i in range(n):
        t = dur * (i + 0.5) / n  # centered, evenly spaced
        out = os.path.join(OUTDIR, f"f_{i:03d}.png")
        r = subprocess.run([ffmpeg, "-y", "-ss", f"{t:.3f}", "-i", VIDEO, "-frames:v", "1",
                            "-update", "1", out], env=env,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if r.returncode == 0 and os.path.exists(out):
            made += 1

    json.dump({"video": os.path.relpath(VIDEO, ROOT), "duration_sec": round(dur, 1),
               "frames": made, "note": "frames sampled from the ACTUAL encoded render"},
              open(os.path.join(OUTDIR, "_meta.json"), "w"), indent=2)
    print(f"qa_watch: {made}/{n} frames from {os.path.basename(VIDEO)} ({dur:.1f}s) -> {os.path.relpath(OUTDIR, ROOT)}")
    if made == 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
