#!/usr/bin/env python3
"""Modal-GPU FLUX.1-schnell image generation for the CoreLifecycle photo pipeline.
Batches all scene prompts into ONE GPU container invocation (amortizes cold start + model load).
Model weights cached in a Modal Volume so only the first run downloads ~24GB.
FLUX.1-schnell is Apache-2.0 and ungated (no HF token needed)."""
import modal

MODEL = "black-forest-labs/FLUX.1-schnell"
app = modal.App("corelifecycle-flux")
flux_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("torch", "diffusers>=0.31.0", "transformers", "accelerate",
                 "sentencepiece", "protobuf", "Pillow", "huggingface_hub")
)
model_vol = modal.Volume.from_name("corelifecycle-flux-cache", create_if_missing=True)

@app.function(image=flux_image, gpu="A100", volumes={"/cache": model_vol}, timeout=1800)
def flux_generate(jobs, width=1280, height=720, steps=4):
    """jobs: list of {"sid": str, "prompt": str, "seed": int}. Returns {sid: jpeg_bytes}."""
    import os, io, torch
    os.environ["HF_HOME"] = "/cache/hf"
    from diffusers import FluxPipeline
    pipe = FluxPipeline.from_pretrained(MODEL, torch_dtype=torch.bfloat16, cache_dir="/cache/hf")
    pipe.enable_model_cpu_offload()  # fit FLUX on a single 40GB GPU safely
    out = {}
    for j in jobs:
        gen = torch.Generator("cpu").manual_seed(int(j["seed"]) % (2**32))
        img = pipe(j["prompt"], width=width, height=height, num_inference_steps=steps,
                   guidance_scale=0.0, max_sequence_length=256, generator=gen).images[0]
        buf = io.BytesIO(); img.save(buf, format="JPEG", quality=92)
        out[j["sid"]] = buf.getvalue()
    model_vol.commit()
    return out

def run_flux(jobs, width=1280, height=720, steps=4):
    """Local entrypoint: run the Modal app ephemerally and return {sid: jpeg_bytes}. [] jobs -> {}."""
    if not jobs:
        return {}
    with app.run():
        return flux_generate.remote(jobs, width=width, height=height, steps=steps)
