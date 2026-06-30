#!/usr/bin/env python3
"""Render the episode on Modal with PARALLEL frame-sharding (CoreLifecycle cloud render).

A single Modal container is slower than the M2 (cloud vCPUs are slower per-core), so we split the
~19.5k frames across K containers that render in parallel, then ffmpeg-stitch the chunks. This
gets the render OFF the laptop AND faster (wall-clock ~ one shard, not the whole film).

node_modules + headless Chrome + ffmpeg are baked into the image; the changing project data
(src/, public/ audio+music, configs) is pushed to a Modal Volume each run.

Usage (the daily runner calls this):  python3 modal_render.py
  -> upload project -> render K shards in parallel -> concat -> download out/episode.mp4
Env: COMP (composition), SHARDS (default 12), SHARD_CPU (default 4), SHARD_CONC (default 4).
"""
import os, sys, json, math, modal

ROOT = os.path.dirname(os.path.abspath(__file__))
COMP = os.environ.get("COMP", "EveryLevelLawyer")
SHARDS = int(os.environ.get("SHARDS", "12"))
SHARD_CPU = float(os.environ.get("SHARD_CPU", "4"))
SHARD_CONC = os.environ.get("SHARD_CONC", "4")

app = modal.App("corelifecycle-render")

image = (
    modal.Image.from_registry("node:20-bookworm-slim", add_python="3.11")
    .apt_install(
        "ffmpeg",
        "libnss3", "libdbus-1-3", "libatk1.0-0", "libatk-bridge2.0-0", "libcups2", "libdrm2",
        "libxkbcommon0", "libxcomposite1", "libxdamage1", "libxfixes3", "libxrandr2", "libgbm1",
        "libasound2", "libpango-1.0-0", "libcairo2", "libxshmfence1", "fonts-liberation",
    )
    .workdir("/app")
    .add_local_file(os.path.join(ROOT, "package.json"), "/app/package.json", copy=True)
    .add_local_file(os.path.join(ROOT, "package-lock.json"), "/app/package-lock.json", copy=True)
    .run_commands("cd /app && npm ci", "cd /app && npx remotion browser ensure")
)

vol = modal.Volume.from_name("corelifecycle-data", create_if_missing=True)


def _link_project():
    """Symlink the uploaded project data into /app (which has node_modules from the image)."""
    import shutil
    vol.reload()
    for item in ("src", "public", "remotion.config.ts", "tsconfig.json"):
        dst = f"/app/{item}"
        if os.path.islink(dst) or os.path.isfile(dst):
            os.remove(dst)
        elif os.path.isdir(dst):
            shutil.rmtree(dst)
        os.symlink(f"/data/{item}", dst)


@app.function(image=image, volumes={"/data": vol}, cpu=SHARD_CPU, memory=6144, timeout=3600)
def render_shard(idx: int, total: int, comp: str):
    import subprocess
    _link_project()
    tl = json.load(open("/data/src/timeline.json"))
    n = tl["totalFrames"]
    per = math.ceil(n / total)
    start = idx * per
    end = min(n - 1, start + per - 1)
    if start > end:
        return None  # more shards than frames; nothing to do
    out = f"/data/shard_{idx:03d}.mp4"
    cmd = (f"cd /app && npx remotion render {comp} {out} "
           f"--frames={start}-{end} --concurrency={SHARD_CONC} --timeout=120000")
    print(f"shard {idx}: frames {start}-{end}", flush=True)
    subprocess.run(cmd, shell=True, check=True)
    vol.commit()
    return out


@app.function(image=image, volumes={"/data": vol}, cpu=4.0, memory=4096, timeout=1200)
def concat(shard_files):
    import subprocess
    vol.reload()
    files = [f for f in shard_files if f]
    lst = "/data/_concat.txt"
    with open(lst, "w") as fh:
        for f in files:
            fh.write(f"file '{f}'\n")
    out = "/data/episode.mp4"
    # try stream-copy concat first (fast); fall back to re-encode if copy can't stitch the chunks
    cp = subprocess.run(f"ffmpeg -y -f concat -safe 0 -i {lst} -c copy {out}", shell=True)
    if cp.returncode != 0 or not os.path.exists(out) or os.path.getsize(out) < 10_000_000:
        subprocess.run(
            f"ffmpeg -y -f concat -safe 0 -i {lst} -c:v libx264 -preset veryfast -crf 18 "
            f"-c:a aac -b:a 192k {out}", shell=True, check=True)
    vol.commit()
    return os.path.getsize(out)


def main():
    print("uploading project data to volume...", flush=True)
    with vol.batch_upload(force=True) as b:
        b.put_directory(os.path.join(ROOT, "src"), "src")
        b.put_directory(os.path.join(ROOT, "public"), "public")
        b.put_file(os.path.join(ROOT, "remotion.config.ts"), "remotion.config.ts")
        b.put_file(os.path.join(ROOT, "tsconfig.json"), "tsconfig.json")
    print(f"rendering {COMP} in {SHARDS} parallel shards ({int(SHARD_CPU)} cpu x {SHARD_CONC} each)...", flush=True)
    shard_files = list(render_shard.starmap([(i, SHARDS, COMP) for i in range(SHARDS)]))
    print("shards done, concatenating:", [s for s in shard_files if s], flush=True)
    size = concat.remote(shard_files)
    out = os.path.join(ROOT, "out", "episode.mp4")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    print(f"downloading {size} bytes -> {out}", flush=True)
    with open(out, "wb") as f:
        for chunk in vol.read_file("episode.mp4"):
            f.write(chunk)
    got = os.path.getsize(out)
    print("DONE" if got > 50_000_000 else "WARN: small file", "->", out, got, "bytes")
    return 0 if got > 50_000_000 else 1


if __name__ == "__main__":
    with app.run():
        sys.exit(main())
