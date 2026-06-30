#!/usr/bin/env python3
"""Phase-2 final loudness master (QUALITY_MAX_PLAN §2.5). Run AFTER render, on out/episode.mp4
(or out/short.mp4). Two-pass EBU R128 loudnorm to YouTube's playback target so the finished mix
sounds as loud + consistent as professional uploads — the single biggest 'amateur vs pro' audio tell.

  target: I=-14 LUFS, TP=-1 dBTP, LRA=11, linear=true (one consistent gain -> crescendos survive,
          no pumping). YouTube normalizes everything to ~-14 and only turns LOUD uploads DOWN, so
          hitting -14 ourselves preserves our intended punch.

Uses the FULL ffmpeg shipped by the `imageio_ffmpeg` wheel (the Remotion-bundled ffmpeg is a minimal
build with no audio filters). Video stream is COPIED (no re-encode, fast); only audio is touched.
Non-fatal + atomic: on any problem the original file is left exactly as-is. Usage:
    python3 audio_master.py out/episode.mp4
"""
import os, sys, json, subprocess, tempfile, shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
I, TP, LRA = "-14", "-1", "11"


def ffmpeg_exe():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def measure(ff, src):
    """Pass 1: measure loudness, return the measured_* dict from loudnorm's JSON."""
    cmd = [ff, "-hide_banner", "-nostats", "-i", src,
           "-af", f"loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json", "-f", "null", "-"]
    p = subprocess.run(cmd, capture_output=True, text=True)
    err = p.stderr
    s = err.rfind("{"); e = err.rfind("}")
    if s == -1 or e == -1 or e < s:
        raise RuntimeError("could not parse loudnorm measurement")
    return json.loads(err[s:e + 1])


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "out/episode.mp4"
    src = src if os.path.isabs(src) else os.path.join(ROOT, src)
    if not os.path.exists(src):
        print("audio_master: no file", src, "(skip)"); return 0
    try:
        ff = ffmpeg_exe()
        m = measure(ff, src)
        meas = (f"loudnorm=I={I}:TP={TP}:LRA={LRA}:linear=true:"
                f"measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:"
                f"offset={m['target_offset']}")
        fd, tmp = tempfile.mkstemp(suffix=".mp4", dir=os.path.dirname(src)); os.close(fd)
        cmd = [ff, "-y", "-hide_banner", "-nostats", "-i", src,
               "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy",
               "-af", meas, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", tmp]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0 or not os.path.exists(tmp) or os.path.getsize(tmp) < 1_000_000:
            raise RuntimeError("loudnorm pass-2 failed: " + r.stderr[-300:])
        shutil.move(tmp, src)
        print(f"audio_master: {os.path.basename(src)} -> {I} LUFS / {TP} dBTP "
              f"(was {m['input_i']} LUFS, TP {m['input_tp']})")
        return 0
    except Exception as e:
        print("audio_master: non-fatal —", e, "(left original untouched)")
        try:
            if 'tmp' in dir() and os.path.exists(tmp):
                os.remove(tmp)
        except Exception:
            pass
        return 0


if __name__ == "__main__":
    sys.exit(main())
