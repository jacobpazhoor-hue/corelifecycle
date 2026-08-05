#!/usr/bin/env python3
"""Local SD-Turbo image generation (Apple Silicon / MPS) for the CoreLifecycle photo pipeline.
Guaranteed $0, offline, deterministic (seeded). Loads the pipeline ONCE, generates all jobs,
then frees GPU memory before the Remotion render runs later in the build. Model downloads once
to the HF cache on first run.

PROVEN config on 8GB M2: stabilityai/sd-turbo in float32 at 512x512. fp16 produces black images
due to an MPS NaN bug -- do NOT use fp16/variant="fp16". SDXL-Turbo swap-thrashes on 8GB unified
memory -- do NOT use SDXL. Stick to sd-turbo / fp32 / 512."""
import gc

MODEL = "stabilityai/sd-turbo"
_PIPE = None

# Resolution step-down ladder for 8GB unified memory: try the requested size first, then fall
# back on MPS OOM / RuntimeError rather than crashing the whole batch.
_RES_LADDER = [(512, 512), (448, 448), (384, 384)]

def _load():
    global _PIPE
    if _PIPE is None:
        import torch
        from diffusers import AutoPipelineForText2Image
        _PIPE = AutoPipelineForText2Image.from_pretrained(
            MODEL, torch_dtype=torch.float32, safety_checker=None
        )
        _PIPE.to("mps")
        _PIPE.enable_attention_slicing()
        try:
            _PIPE.enable_vae_slicing()
        except Exception:
            pass
        try:
            _PIPE.enable_vae_tiling()
        except Exception:
            pass
    return _PIPE

def _empty_mps_cache():
    gc.collect()
    try:
        import torch
        if torch.backends.mps.is_available():
            torch.mps.empty_cache()
    except Exception:
        pass

def release():
    """Drop the pipeline singleton and free MPS/host memory so it doesn't hold memory into the
    later Remotion render step. Safe to call even if the pipeline was never loaded."""
    global _PIPE
    _PIPE = None
    _empty_mps_cache()

# Backwards-compatible alias: gen_scene_images.local_sdxl_backend calls free().
free = release

def _ladder_from(width, height):
    ladder = [(width, height)]
    for w, h in _RES_LADDER:
        if (w, h) not in ladder:
            ladder.append((w, h))
    return ladder

def generate(jobs, width=512, height=512, steps=4):
    """jobs: [{"sid","prompt","seed"}]. Returns {sid: jpeg_bytes}.

    SD-Turbo: guidance_scale=0.0, few inference steps, deterministic per-seed CPU generator.
    Never raises out of this function: a per-image MPS OOM / RuntimeError steps down through
    the resolution ladder (512x512 -> 448x448 -> 384x384); if every resolution fails for a
    given job, that sid is simply omitted from the result dict. A total pipeline-load failure
    also returns {} rather than raising, so the caller's non-fatal fallback path handles it.
    """
    import io
    if not jobs:
        return {}
    try:
        pipe = _load()
    except Exception as e:
        print(f"gen_images_local: NON-FATAL pipeline load failure: {e}")
        return {}

    import torch
    ladder = _ladder_from(width, height)
    out = {}
    for j in jobs:
        img = None
        used_res = None
        for w, h in ladder:
            try:
                g = torch.Generator("cpu").manual_seed(int(j["seed"]) % (2**32))
                img = pipe(prompt=j["prompt"], width=w, height=h,
                           num_inference_steps=steps, guidance_scale=0.0, generator=g).images[0]
                used_res = (w, h)
                break
            except RuntimeError as e:
                print(f"gen_images_local: sid={j['sid']} RuntimeError at {w}x{h}, "
                      f"stepping down resolution: {e}")
                _empty_mps_cache()
                continue
            except Exception as e:
                print(f"gen_images_local: sid={j['sid']} NON-FATAL generation error: {e}")
                break
        if img is None:
            print(f"gen_images_local: sid={j['sid']} failed at every resolution, omitting.")
            continue
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=92)
        out[j["sid"]] = buf.getvalue()
        print(f"gen_images_local: sid={j['sid']} ok at {used_res[0]}x{used_res[1]}")
    return out
