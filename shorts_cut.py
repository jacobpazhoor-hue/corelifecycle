#!/usr/bin/env python3
"""Auto-cut a vertical YouTube Short from the finished episode (CoreLifecycle growth lever).

Native 1080x1920 (NOT a 16:9 crop) — reuses the episode's scene art + REAL per-scene VO so it
sounds natural. Picks the most shareable beats: the HOOK (scene 1) + the CLIMAX (the biggest-$
beat), greedily adding an escalation beat or two while staying under ~58s. Writes src/short.json
(read by the Short composition). Then: npx remotion render Short out/short.mp4.
"""
import os, re, json

ROOT = os.path.dirname(os.path.abspath(__file__))
tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
fps = tl["fps"]
MAX_SEC = 58

try:
    meta = json.load(open(os.path.join(ROOT, "ops", "episode_meta.json")))
    thumb = meta.get("thumb", {})
    brand = dict(kicker=thumb.get("kicker", "EVERY LEVEL OF A"),
                 line1=thumb.get("line1", ""), line2=thumb.get("line2", ""),
                 tag=thumb.get("tag", ""))
    topic = meta.get("topic", "")
except Exception:
    brand, topic = dict(kicker="EVERY LEVEL", line1="", line2="", tag=""), ""

def dollars(big):
    if not big:
        return -1
    m = re.search(r"\$\s*([\d,]+(?:\.\d+)?)\s*([kKmMbB]?)", big)
    if not m:
        return -1
    val = float(m.group(1).replace(",", ""))
    return val * {"k": 1e3, "m": 1e6, "b": 1e9, "": 1}[m.group(2).lower()]

scenes = tl["scenes"]
hook = scenes[0]
# climax = beat with the largest $ overlay
moneyed = [(dollars((s.get("overlay") or {}).get("big")), s) for s in scenes[1:]]
moneyed = sorted([(v, s) for v, s in moneyed if v > 0], key=lambda x: x[0], reverse=True)
climax = moneyed[0][1] if moneyed else scenes[-1]

# build selection: hook -> (a mid escalation beat if room) -> climax, in original order
def secs(s):
    return s["durationInFrames"] / fps

chosen_ids = {hook["id"], climax["id"]}
# try to slot ONE mid-ladder beat (median $) for a sense of climbing, if it fits
budget = MAX_SEC - secs(hook) - secs(climax)
if moneyed and len(moneyed) > 2 and budget > 6:
    mid = moneyed[len(moneyed) // 2][1]
    if mid["id"] not in chosen_ids and secs(mid) <= budget:
        chosen_ids.add(mid["id"])

order = [s for s in scenes if s["id"] in chosen_ids]
# enforce the cap (drop from the middle if needed, always keep hook + climax)
while sum(secs(s) for s in order) > MAX_SEC and len(order) > 2:
    order.pop(1)

start = 0
out_scenes = []
for s in order:
    out_scenes.append(dict(
        id=s["id"], template=s["template"], level=s.get("level"),
        overlay=s.get("overlay"), audio=s["audio"], audioStartFrame=s.get("audioStartFrame", 0),
        durationInFrames=s["durationInFrames"], startFrame=start))
    start += s["durationInFrames"]

short = dict(fps=fps, width=1080, height=1920, totalFrames=start,
             topic=topic, brand=brand, scenes=out_scenes)
json.dump(short, open(os.path.join(ROOT, "src", "short.json"), "w"), indent=2)
print(f"short: {len(out_scenes)} beats, {start/fps:.1f}s -> src/short.json")
for s in out_scenes:
    print(f"   {s['id']:>4}  {s['durationInFrames']/fps:>4.1f}s  {(s.get('overlay') or {}).get('big') or ''}")
