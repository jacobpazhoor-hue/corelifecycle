#!/usr/bin/env python3
"""Generate per-scene narration with edge-tts (Microsoft neural, free, more natural),
save mp3, and emit src/timeline.json. Duration derived from WordBoundary events
(no ffmpeg needed). Swap VOICE to re-render with a different narrator.
"""
import os, json, asyncio
import numpy as np
import edge_tts
import soundfile as sf
from content import SCENES, FPS

VOICE = "en-US-AndrewMultilingualNeural"  # most natural/human free voice; alts in voice_samples_v2/
RATE = "+0%"                   # measured (not the rejected slow rates); content carries length
GAP = 0.5                      # silence after each scene (breathing + gravitas)
LEAD = 0.2                     # quiet before narration starts within a scene

ROOT = os.path.dirname(os.path.abspath(__file__))
AUDIO = os.path.join(ROOT, "public", "audio")
os.makedirs(AUDIO, exist_ok=True)

async def synth_mp3(text, path, tries=5):
    """Synth one scene to mp3. edge-tts intermittently throws NoAudioReceived (transient
    server/rate-limit hiccup) — retry with backoff so one blip doesn't kill the whole build."""
    last = None
    for attempt in range(tries):
        try:
            comm = edge_tts.Communicate(text, VOICE, rate=RATE)
            data = bytearray()
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    data += chunk["data"]
            if not data:
                raise edge_tts.exceptions.NoAudioReceived("empty stream")
            with open(path, "wb") as f:
                f.write(data)
            return
        except Exception as e:                                   # transient: back off and retry
            last = e
            await asyncio.sleep(1.5 * (attempt + 1))
    raise last

def master(y, sr):
    """Voice mastering: upsample 48k, high-pass, de-mud, presence shelf, de-ess, gentle
    harmonic exciter (real 'air'), soft compression, normalize. Keeps the edge voice but crisp.
    Returns (audio, new_sr)."""
    if y.ndim > 1:
        y = y.mean(axis=1)
    y = y.astype(np.float32)
    tgt = 48000
    if sr != tgt:                                                  # upsample (no aliasing on up)
        n2 = int(len(y) * tgt / sr)
        y = np.interp(np.linspace(0, len(y) - 1, n2), np.arange(len(y)), y).astype(np.float32)
        sr = tgt
    n = len(y)
    X = np.fft.rfft(y); fr = np.fft.rfftfreq(n, 1 / sr)
    g = np.ones_like(fr)
    g *= 1.0 / (1.0 + (85.0 / np.maximum(fr, 1.0)) ** 6)          # high-pass 85Hz
    g *= 1.0 - 0.32 * np.exp(-((fr - 320.0) / 140.0) ** 2)        # de-mud dip @320Hz
    g *= 1.0 + 0.85 * (1.0 / (1.0 + np.exp(-(fr - 3200.0) / 600.0)))  # presence shelf ~+5dB
    g *= 1.0 - 0.5 * np.exp(-((fr - 7200.0) / 700.0) ** 2)        # de-ess notch @7.2k
    y_eq = np.fft.irfft(X * g, n=n).astype(np.float32)
    # subtle harmonic exciter -> perceived air (NOT noise: harmonics of existing presence band)
    hp = np.fft.irfft(X * (fr > 3000), n=n).astype(np.float32)
    harm = np.tanh(hp * 2.4).astype(np.float32)
    H = np.fft.rfft(harm); band = ((fr > 5000) & (fr < 12500)).astype(np.float32)
    air = np.fft.irfft(H * band, n=n).astype(np.float32)
    out = y_eq + air * 0.14                                        # modest -> crisp, never fizzy
    out = np.tanh(out * 1.45) / np.tanh(1.45)                      # gentle compression
    out = out / (np.max(np.abs(out)) + 1e-9) * 0.97
    return out.astype(np.float32), sr

async def main():
    scenes_out = []
    cursor = 0
    for sc in SCENES:
        mp3 = os.path.join(AUDIO, f"{sc['id']}.mp3")
        await synth_mp3(sc["narration"], mp3)
        y, sr = sf.read(mp3, dtype="float32")
        y, sr = master(y, sr)
        wav = os.path.join(AUDIO, f"{sc['id']}.wav")
        sf.write(wav, y, sr)
        speech = len(y) / sr
        total = LEAD + speech + GAP
        dur_f = max(1, round(total * FPS))
        scenes_out.append({
            "id": sc["id"], "level": sc["level"], "overlay": sc["overlay"],
            "template": sc.get("template", sc["id"]),
            "audio": f"audio/{sc['id']}.wav", "audioStartFrame": round(LEAD * FPS),
            "startFrame": cursor, "durationInFrames": dur_f,
        })
        print(f"{sc['id']}: speech {speech:5.2f}s -> scene {total:5.2f}s ({dur_f}f)")
        cursor += dur_f
        await asyncio.sleep(0.25)                                 # gentle pacing -> fewer rate-limit blips

    timeline = {"fps": FPS, "width": 1920, "height": 1080, "totalFrames": cursor, "voice": VOICE, "scenes": scenes_out}
    out = os.path.join(ROOT, "src", "timeline.json")
    json.dump(timeline, open(out, "w"), indent=2)
    print(f"\nTOTAL: {cursor} frames = {cursor/FPS:.1f}s  (voice={VOICE}) -> {out}")

asyncio.run(main())
