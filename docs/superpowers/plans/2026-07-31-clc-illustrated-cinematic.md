# CLC Illustrated-Cinematic Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace CLC's flat SVG doodle backdrops with free illustrated stills driven by a depth-based virtual camera, behind a `visualMode` toggle with per-scene doodle fallback, so the nightly autopilot can never break.

**Architecture:** A new non-fatal build step generates one illustrated still + pseudo-depth map per scene (free Pollinations API, cached to `public/images/<slug>/`), and writes `src/photo_manifest.json`. A new Remotion `PhotoStage` component renders each still with a cinematic camera move (push-in / parallax / orbit-lite / rack-focus). `FramedScene` (in `director.tsx`) branches: photo asset present → `PhotoStage`; else the existing SVG doodle template. Default mode stays `doodle`, so with the feature off the render is byte-identical to today.

**Tech Stack:** Python 3.11 (`requests`, `Pillow`, `numpy` — all already installed), Remotion 4.x / React / TypeScript, Pollinations free image API.

## Global Constraints

- **Free:** $0 marginal cost per episode. Image source is Pollinations (keyless, free). No paid API, no paid GPU. Depth is synthesized locally with numpy/PIL — no model download in v1.
- **Deterministic:** fixed per-scene seed = `int(sha256(f"{slug}:{sid}").hexdigest()[:8], 16)`; fixed model + style suffix. Images cached and committed so cloud/Modal render is offline.
- **Unattended-safe:** the image step is NON-FATAL. Any scene that fails generation is recorded in the fallback list and renders its existing SVG doodle. Whole-episode failure is impossible-by-design.
- **Additive / non-breaking:** default `visualMode="doodle"`. With the feature off, output must be byte-identical to pre-change.
- **Minimal:** do not touch `content.py` script logic, edge-tts voice, numpy music/ducking, mastering, thumbnails, upload, or autopilot orchestration beyond the single documented `build.py` insertion.
- **Tests:** no pytest/vitest in repo. Python tests use stdlib `unittest`, run with `python3 -m unittest tests.test_<name> -v`. Visual verification uses `npx remotion still` + PIL luminance/variance (CLC's existing idiom, see `qa_sample.py`).
- **Render target dims:** stills generated at 1280×720 (16:9), upscaled by the camera in a 1920×1080 composition.

---

## File Structure

- Create `photo_style.py` — config loader with safe defaults.
- Create `ops/photo_style.json` — the single style/config file.
- Create `gen_scene_images.py` — orchestrator: per-scene prompt → fetch → depth → manifest.
- Create `depth.py` — `make_depth(img_path, depth_path)` (numpy/PIL pseudo-depth; optional real Depth Anything hook).
- Create `src/photoStage.tsx` — `PhotoStage` component + pure `cameraTransform(move, p)` helper.
- Create `src/photo_manifest.json` — generated; committed default is doodle/empty.
- Modify `src/director.tsx` — `FramedScene` gains a `photo?` prop and branches to `PhotoStage`.
- Modify `src/Video2.tsx` — import manifest, pass `photo` prop per scene.
- Modify `build.py` — insert non-fatal step 0.5 calling `gen_scene_images.py`.
- Modify `ops/routine.json` — add `"visualMode"`.
- Modify `modal_render.py` — ensure `public/images/` + `src/photo_manifest.json` are uploaded.
- Tests: `tests/test_photo_style.py`, `tests/test_gen_scene_images.py`, `tests/test_depth.py`.

---

## Task 1: Style config + loader

**Files:**
- Create: `photo_style.py`
- Create: `ops/photo_style.json`
- Test: `tests/test_photo_style.py`

**Interfaces:**
- Produces: `load_style(path=STYLE_PATH) -> dict` with keys `visualMode, model, styleSuffix, povRules, moves, width, height`. Missing/invalid file → full defaults (never raises).

- [ ] **Step 1: Write the failing test**

```python
# tests/test_photo_style.py
import json, os, tempfile, unittest
from photo_style import load_style, DEFAULTS

class TestLoadStyle(unittest.TestCase):
    def test_missing_file_returns_defaults(self):
        s = load_style("/no/such/file.json")
        self.assertEqual(s["visualMode"], "doodle")
        self.assertIn("styleSuffix", s)

    def test_invalid_json_returns_defaults(self):
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
            f.write("{not json")
            p = f.name
        self.assertEqual(load_style(p)["model"], DEFAULTS["model"])

    def test_partial_override_merges_over_defaults(self):
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
            json.dump({"visualMode": "photo", "model": "flux"}, f)
            p = f.name
        s = load_style(p)
        self.assertEqual(s["visualMode"], "photo")
        self.assertEqual(s["povRules"], DEFAULTS["povRules"])  # default preserved
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests.test_photo_style -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'photo_style'`

- [ ] **Step 3: Write minimal implementation**

```python
# photo_style.py
import json, os
ROOT = os.path.dirname(os.path.abspath(__file__))
STYLE_PATH = os.path.join(ROOT, "ops", "photo_style.json")

DEFAULTS = {
    "visualMode": "doodle",
    "model": "flux",
    "styleSuffix": ("cinematic illustrated, painterly depth, layered foreground and "
                    "background, dramatic filmic lighting, muted cinematic palette"),
    "povRules": ("first-person or over-the-shoulder view, environment seen from the "
                 "viewer's own eyes, no face-on recurring people"),
    "moves": ["pushIn", "parallaxPan", "orbitLite", "rackFocus"],
    "width": 1280,
    "height": 720,
}

def load_style(path=STYLE_PATH):
    try:
        with open(path) as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return dict(DEFAULTS)
    merged = dict(DEFAULTS)
    merged.update({k: v for k, v in data.items() if v is not None})
    return merged
```

- [ ] **Step 4: Create the committed config file**

```json
// ops/photo_style.json
{
  "visualMode": "doodle",
  "model": "flux",
  "styleSuffix": "cinematic illustrated, painterly depth, layered foreground and background, dramatic filmic lighting, muted cinematic palette",
  "povRules": "first-person or over-the-shoulder view, environment seen from the viewer's own eyes, no face-on recurring people",
  "moves": ["pushIn", "parallaxPan", "orbitLite", "rackFocus"],
  "width": 1280,
  "height": 720
}
```

Note: default `visualMode` is `doodle` so this task is inert until §Task 9 enables it.

- [ ] **Step 5: Run test to verify it passes**

Run: `python3 -m unittest tests.test_photo_style -v`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add photo_style.py ops/photo_style.json tests/test_photo_style.py
git commit -m "feat(clc-photo): style config + safe loader"
```

---

## Task 2: Prompt / seed / path helpers

**Files:**
- Create: `gen_scene_images.py` (helpers only in this task)
- Test: `tests/test_gen_scene_images.py`

**Interfaces:**
- Consumes: `load_style` (Task 1).
- Produces:
  - `build_prompt(scene: dict, style: dict) -> str`
  - `scene_seed(slug: str, sid: str) -> int`
  - `asset_paths(slug: str, sid: str) -> dict` with keys `dir, img, depth, rel_img, rel_depth` (paths under `public/images/<slug>/`; `rel_*` are Remotion `staticFile` paths, i.e. `images/<slug>/<sid>.jpg`).

- [ ] **Step 1: Write the failing test**

```python
# tests/test_gen_scene_images.py
import unittest
from gen_scene_images import build_prompt, scene_seed, asset_paths

class TestHelpers(unittest.TestCase):
    def test_build_prompt_uses_visual_then_style(self):
        style = {"styleSuffix": "STYLE", "povRules": "POV"}
        p = build_prompt({"visual": "a neon alley at night", "template": "neonAlley"}, style)
        self.assertIn("a neon alley at night", p)
        self.assertIn("POV", p)
        self.assertIn("STYLE", p)

    def test_build_prompt_falls_back_to_template(self):
        style = {"styleSuffix": "S", "povRules": "P"}
        p = build_prompt({"template": "warRoom"}, style)
        self.assertIn("warRoom", p)

    def test_scene_seed_is_deterministic(self):
        self.assertEqual(scene_seed("vc", "t01"), scene_seed("vc", "t01"))
        self.assertNotEqual(scene_seed("vc", "t01"), scene_seed("vc", "t02"))

    def test_asset_paths_shape(self):
        ap = asset_paths("vc", "t01")
        self.assertTrue(ap["img"].endswith("public/images/vc/t01.jpg"))
        self.assertEqual(ap["rel_img"], "images/vc/t01.jpg")
        self.assertEqual(ap["rel_depth"], "images/vc/t01.depth.png")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests.test_gen_scene_images -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'gen_scene_images'`

- [ ] **Step 3: Write minimal implementation**

```python
# gen_scene_images.py  (helpers section)
import hashlib, os
ROOT = os.path.dirname(os.path.abspath(__file__))

def build_prompt(scene, style):
    intent = (scene.get("visual") or scene.get("template") or "a cinematic scene").strip()
    return f"{intent}. {style['povRules']}. {style['styleSuffix']}."

def scene_seed(slug, sid):
    return int(hashlib.sha256(f"{slug}:{sid}".encode()).hexdigest()[:8], 16)

def asset_paths(slug, sid):
    base = os.path.join(ROOT, "public", "images", slug)
    return {
        "dir": base,
        "img": os.path.join(base, f"{sid}.jpg"),
        "depth": os.path.join(base, f"{sid}.depth.png"),
        "rel_img": f"images/{slug}/{sid}.jpg",
        "rel_depth": f"images/{slug}/{sid}.depth.png",
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m unittest tests.test_gen_scene_images -v`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add gen_scene_images.py tests/test_gen_scene_images.py
git commit -m "feat(clc-photo): prompt/seed/path helpers"
```

---

## Task 3: Pseudo-depth generation

**Files:**
- Create: `depth.py`
- Test: `tests/test_depth.py`

**Interfaces:**
- Produces: `make_depth(img_path: str, depth_path: str) -> str` — writes a grayscale ("L") PNG the same size as the source and returns `depth_path`. Near = brighter (bottom of frame + brighter regions), far = darker.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_depth.py
import os, tempfile, unittest
from PIL import Image
from depth import make_depth

class TestDepth(unittest.TestCase):
    def test_depth_matches_size_and_is_grayscale(self):
        d = tempfile.mkdtemp()
        src = os.path.join(d, "src.jpg")
        Image.new("RGB", (320, 180), (120, 120, 120)).save(src)
        out = make_depth(src, os.path.join(d, "src.depth.png"))
        im = Image.open(out)
        self.assertEqual(im.mode, "L")
        self.assertEqual(im.size, (320, 180))

    def test_bottom_is_nearer_than_top(self):
        import numpy as np
        d = tempfile.mkdtemp()
        src = os.path.join(d, "s.jpg")
        Image.new("RGB", (64, 64), (100, 100, 100)).save(src)
        arr = np.asarray(Image.open(make_depth(src, os.path.join(d, "s.depth.png"))))
        self.assertGreater(arr[-1].mean(), arr[0].mean())  # bottom brighter/nearer
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests.test_depth -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'depth'`

- [ ] **Step 3: Write minimal implementation**

```python
# depth.py
import numpy as np
from PIL import Image, ImageFilter

def make_depth(img_path, depth_path):
    """Fast synthesized monocular depth: vertical gradient (bottom = near) blended with
    blurred luminance (bright/large foreground reads nearer). No model download; ~ms/frame.
    Good enough for 2.5D parallax; swap for Depth Anything V2 later (see plan Task 10)."""
    im = Image.open(img_path).convert("L")
    w, h = im.size
    grad = np.tile(np.linspace(0, 255, h, dtype=np.float32)[:, None], (1, w))
    lum = np.asarray(im.filter(ImageFilter.GaussianBlur(8)), dtype=np.float32)
    depth = (0.6 * grad + 0.4 * lum).clip(0, 255).astype(np.uint8)
    Image.fromarray(depth, mode="L").save(depth_path)
    return depth_path
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m unittest tests.test_depth -v`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add depth.py tests/test_depth.py
git commit -m "feat(clc-photo): synthesized pseudo-depth maps"
```

---

## Task 4: Pollinations fetch with retry

**Files:**
- Modify: `gen_scene_images.py` (add `fetch_image`)
- Test: `tests/test_gen_scene_images.py` (add cases)

**Interfaces:**
- Consumes: `asset_paths`, `scene_seed`, `build_prompt`.
- Produces: `fetch_image(prompt: str, seed: int, style: dict, out_path: str, retries: int = 3, _get=requests.get) -> bool` — writes a JPEG to `out_path` and returns True on success; retries with exponential backoff; returns False after exhausting retries. `_get` is injectable for testing.

- [ ] **Step 1: Write the failing test**

```python
# add to tests/test_gen_scene_images.py
import os, tempfile
from unittest import mock
from gen_scene_images import fetch_image

JPEG = b"\xff\xd8\xff\xe0" + b"\x00" * 64  # JPEG magic + filler

class TestFetch(unittest.TestCase):
    def test_success_writes_file(self):
        resp = mock.Mock(status_code=200, content=JPEG)
        out = os.path.join(tempfile.mkdtemp(), "t01.jpg")
        ok = fetch_image("p", 123, {"width":1280,"height":720,"model":"flux"}, out,
                         _get=lambda *a, **k: resp)
        self.assertTrue(ok)
        self.assertTrue(os.path.exists(out))

    def test_non_jpeg_is_rejected(self):
        resp = mock.Mock(status_code=200, content=b"<html>error</html>")
        out = os.path.join(tempfile.mkdtemp(), "t01.jpg")
        ok = fetch_image("p", 1, {"width":1,"height":1,"model":"flux"}, out,
                         retries=1, _get=lambda *a, **k: resp)
        self.assertFalse(ok)
        self.assertFalse(os.path.exists(out))

    def test_retries_then_gives_up(self):
        calls = {"n": 0}
        def boom(*a, **k):
            calls["n"] += 1
            raise __import__("requests").RequestException("net")
        with mock.patch("gen_scene_images.time.sleep", lambda *_: None):
            ok = fetch_image("p", 1, {"width":1,"height":1,"model":"flux"}, "/tmp/x.jpg",
                             retries=3, _get=boom)
        self.assertFalse(ok)
        self.assertEqual(calls["n"], 3)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests.test_gen_scene_images -v`
Expected: FAIL — `ImportError: cannot import name 'fetch_image'`

- [ ] **Step 3: Write minimal implementation**

```python
# add to gen_scene_images.py
import time, urllib.parse, requests

def fetch_image(prompt, seed, style, out_path, retries=3, _get=requests.get):
    q = urllib.parse.quote(prompt, safe="")
    url = (f"https://image.pollinations.ai/prompt/{q}"
           f"?width={style['width']}&height={style['height']}"
           f"&seed={seed}&model={style['model']}&nologo=true")
    for attempt in range(retries):
        try:
            r = _get(url, timeout=90)
            if getattr(r, "status_code", 0) == 200 and r.content[:2] == b"\xff\xd8":
                os.makedirs(os.path.dirname(out_path), exist_ok=True)
                with open(out_path, "wb") as f:
                    f.write(r.content)
                return True
        except requests.RequestException:
            pass
        time.sleep(2 ** attempt)
    return False
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m unittest tests.test_gen_scene_images -v`
Expected: PASS (7 tests total)

- [ ] **Step 5: Commit**

```bash
git add gen_scene_images.py tests/test_gen_scene_images.py
git commit -m "feat(clc-photo): pollinations fetch with retry/backoff"
```

---

## Task 5: Orchestrator + manifest writer

**Files:**
- Modify: `gen_scene_images.py` (add `generate_all`, `main`)
- Test: `tests/test_gen_scene_images.py` (add integration case)

**Interfaces:**
- Consumes: `content.SCENES` (list of scene dicts with `id`, `template`, optional `visual`), `load_style`, `build_prompt`, `scene_seed`, `asset_paths`, `fetch_image`, `make_depth`.
- Produces:
  - `generate_all(scenes, slug, style, fetch=fetch_image, depth=make_depth) -> dict` — the manifest: `{"mode": style["visualMode"], "scenes": {sid: {"img": rel_img, "depth": rel_depth, "move": move}}, "fallback": [sid, ...]}`. Move is assigned deterministically: `style["moves"][i % len(moves)]`. On fetch failure a scene is added to `fallback` and omitted from `scenes`.
  - `main()` — loads `content.SCENES`, derives `slug` from `ops/episode_meta.json` `topic` (fallback `"episode"`), calls `generate_all`, writes `src/photo_manifest.json`. Exit 0 always (non-fatal).

- [ ] **Step 1: Write the failing test**

```python
# add to tests/test_gen_scene_images.py
from gen_scene_images import generate_all

class TestGenerateAll(unittest.TestCase):
    def _style(self):
        return {"visualMode":"photo","model":"flux","width":8,"height":8,
                "styleSuffix":"S","povRules":"P","moves":["pushIn","parallaxPan"]}

    def test_all_ok_builds_manifest_with_moves(self):
        scenes = [{"id":"t01","template":"a"},{"id":"t02","template":"b"},{"id":"t03","template":"c"}]
        def fake_fetch(prompt, seed, style, out, **k):
            from PIL import Image; os.makedirs(os.path.dirname(out), exist_ok=True)
            Image.new("RGB",(8,8),(50,50,50)).save(out); return True
        m = generate_all(scenes, "vc", self._style(), fetch=fake_fetch)
        self.assertEqual(m["mode"], "photo")
        self.assertEqual(set(m["scenes"]), {"t01","t02","t03"})
        self.assertEqual(m["scenes"]["t01"]["move"], "pushIn")
        self.assertEqual(m["scenes"]["t02"]["move"], "parallaxPan")
        self.assertEqual(m["scenes"]["t03"]["move"], "pushIn")  # wraps
        self.assertEqual(m["fallback"], [])

    def test_failed_scene_goes_to_fallback(self):
        scenes = [{"id":"t01","template":"a"},{"id":"t02","template":"b"}]
        def flaky(prompt, seed, style, out, **k):
            if "t02" in out:  # asset path carries sid
                return False
            from PIL import Image; os.makedirs(os.path.dirname(out), exist_ok=True)
            Image.new("RGB",(8,8),(9,9,9)).save(out); return True
        m = generate_all(scenes, "vc", self._style(), fetch=flaky)
        self.assertIn("t01", m["scenes"])
        self.assertNotIn("t02", m["scenes"])
        self.assertEqual(m["fallback"], ["t02"])
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests.test_gen_scene_images -v`
Expected: FAIL — `ImportError: cannot import name 'generate_all'`

- [ ] **Step 3: Write minimal implementation**

```python
# add to gen_scene_images.py
import json
from photo_style import load_style, STYLE_PATH
from depth import make_depth

def generate_all(scenes, slug, style, fetch=fetch_image, depth=make_depth):
    moves = style.get("moves") or ["pushIn"]
    manifest = {"mode": style.get("visualMode", "doodle"), "scenes": {}, "fallback": []}
    for i, sc in enumerate(scenes):
        sid = sc["id"]
        ap = asset_paths(slug, sid)
        prompt = build_prompt(sc, style)
        seed = scene_seed(slug, sid)
        if os.path.exists(ap["img"]) or fetch(prompt, seed, style, ap["img"]):
            if not os.path.exists(ap["depth"]):
                depth(ap["img"], ap["depth"])
            manifest["scenes"][sid] = {
                "img": ap["rel_img"], "depth": ap["rel_depth"],
                "move": moves[i % len(moves)],
            }
        else:
            manifest["fallback"].append(sid)
    return manifest

def main():
    style = load_style(STYLE_PATH)
    try:
        meta = json.load(open(os.path.join(ROOT, "ops", "episode_meta.json")))
        slug = (meta.get("topic") or "episode").strip().replace(" ", "_")
    except Exception:
        slug = "episode"
    import importlib, content  # content.py in ROOT
    importlib.reload(content)
    if style.get("visualMode") != "photo":
        manifest = {"mode": "doodle", "scenes": {}, "fallback": []}
    else:
        manifest = generate_all(content.SCENES, slug, style)
    json.dump(manifest, open(os.path.join(ROOT, "src", "photo_manifest.json"), "w"), indent=2)
    print(f"gen_scene_images: mode={manifest['mode']} "
          f"ok={len(manifest['scenes'])} fallback={len(manifest['fallback'])}")

if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m unittest tests.test_gen_scene_images -v`
Expected: PASS (9 tests total)

- [ ] **Step 5: Create the committed default manifest**

```json
// src/photo_manifest.json
{ "mode": "doodle", "scenes": {}, "fallback": [] }
```

- [ ] **Step 6: Commit**

```bash
git add gen_scene_images.py src/photo_manifest.json tests/test_gen_scene_images.py
git commit -m "feat(clc-photo): scene-image orchestrator + manifest"
```

---

## Task 6: PhotoStage Remotion component

**Files:**
- Create: `src/photoStage.tsx`

**Interfaces:**
- Produces:
  - `export type Move = 'pushIn' | 'parallaxPan' | 'orbitLite' | 'rackFocus'`
  - `export function cameraTransform(move: Move, p: number): {scale: number; tx: number; ty: number; blur: number}` — pure; `p` is progress 0→1 in a 1920×1080 space.
  - `export const PhotoStage: React.FC<{img: string; depth: string; move: Move; dur: number}>` — renders a background image layer + a depth-masked near layer, both driven by `cameraTransform`, the near layer translated extra for 2.5D parallax.

- [ ] **Step 1: Write the component + pure helper**

```tsx
// src/photoStage.tsx
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

export type Move = 'pushIn' | 'parallaxPan' | 'orbitLite' | 'rackFocus';

export function cameraTransform(move: Move, p: number) {
  switch (move) {
    case 'pushIn':      return {scale: 1.06 + 0.10 * p, tx: 0, ty: 0, blur: 0};
    case 'parallaxPan': return {scale: 1.14, tx: (0.5 - p) * 140, ty: 0, blur: 0};
    case 'orbitLite':   return {scale: 1.16, tx: Math.sin(p * Math.PI) * 90, ty: Math.cos(p * Math.PI) * 26, blur: 0};
    case 'rackFocus':   return {scale: 1.08, tx: 0, ty: 0, blur: (1 - p) * 6};
    default:            return {scale: 1.08, tx: 0, ty: 0, blur: 0};
  }
}

export const PhotoStage: React.FC<{img: string; depth: string; move: Move; dur: number}> = ({img, depth, move, dur}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, Math.max(1, dur)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c = cameraTransform(move, p);
  const base: React.CSSProperties = {
    width: '100%', height: '100%', objectFit: 'cover',
    transform: `scale(${c.scale}) translate(${c.tx}px, ${c.ty}px)`,
    filter: c.blur ? `blur(${c.blur}px)` : undefined,
  };
  // near layer: same image, masked to the BRIGHT (near) regions of the depth map, pushed further -> 2.5D parallax
  const near: React.CSSProperties = {
    ...base,
    transform: `scale(${c.scale + 0.05}) translate(${c.tx * 1.6}px, ${c.ty * 1.6}px)`,
    WebkitMaskImage: `url(${staticFile(depth)})`, maskImage: `url(${staticFile(depth)})`,
    WebkitMaskSize: 'cover', maskSize: 'cover',
  };
  return (
    <AbsoluteFill style={{backgroundColor: '#0b0b0d', overflow: 'hidden'}}>
      <Img src={staticFile(img)} style={base} />
      <Img src={staticFile(img)} style={near} />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors referencing `photoStage.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/photoStage.tsx
git commit -m "feat(clc-photo): PhotoStage 2.5D camera component"
```

---

## Task 7: Wire PhotoStage into the render (with SVG fallback)

**Files:**
- Modify: `src/director.tsx` (`FramedScene`)
- Modify: `src/Video2.tsx`
- Test (visual): `npx remotion still` + PIL

**Interfaces:**
- `FramedScene` (director.tsx) currently: `({template, type, focus, dur}) => ...`. Add optional prop `photo?: {img: string; depth: string; move: Move}`. When `photo` is present, render `<PhotoStage img depth move dur={dur} />` instead of the SVG template; otherwise render exactly as today.
- `Video2.tsx` imports the manifest and passes `photo` per scene.

- [ ] **Step 1: Read the current FramedScene**

Run: `grep -n "FramedScene" src/director.tsx` then read its body. Confirm its exact prop destructuring and the SVG render path before editing.

- [ ] **Step 2: Edit `director.tsx`**

At the top imports add:
```tsx
import {PhotoStage, Move} from './photoStage';
```
Extend the `FramedScene` prop type and add the branch as the FIRST thing it returns:
```tsx
// props: add  photo?: {img: string; depth: string; move: Move}
if (photo) {
  return <PhotoStage img={photo.img} depth={photo.depth} move={photo.move} dur={dur} />;
}
// ...existing SVG template rendering unchanged below...
```

- [ ] **Step 3: Edit `Video2.tsx`**

Add import near the other imports:
```tsx
import PHOTO from './photo_manifest.json';
```
Where the scene renders `<FramedScene template={scene.template} .../>` (line ~143), compute and pass the photo prop:
```tsx
const photo = PHOTO.mode === 'photo' && PHOTO.scenes[scene.id]
  ? PHOTO.scenes[scene.id] as {img: string; depth: string; move: Move}
  : undefined;
// ...
<FramedScene template={scene.template} type={sh.type} focus={focus} dur={sh.dur} photo={photo} />
```
Ensure `tsconfig.json` has `"resolveJsonModule": true` (add if missing).

- [ ] **Step 4: Regression — doodle mode unchanged**

With committed `photo_manifest.json` (`mode:"doodle"`), render two stills and confirm the render still works and is doodle:
```bash
npx remotion still EveryLevelLawyer out/_reg_0.png --frame=0 --timeout=120000
npx remotion still EveryLevelLawyer out/_reg_1.png --frame=6000 --timeout=120000
```
Expected: PASS, images render (this is the byte-identical-behavior guard — no PhotoStage path taken).

- [ ] **Step 5: Photo-mode smoke test**

Create a temporary manifest + one test image to exercise the PhotoStage branch:
```bash
python3 - <<'PY'
import json, os
from PIL import Image
os.makedirs("public/images/_smoke", exist_ok=True)
Image.new("RGB",(1280,720),(40,60,90)).save("public/images/_smoke/t01.jpg")
from depth import make_depth
make_depth("public/images/_smoke/t01.jpg","public/images/_smoke/t01.depth.png")
# find first scene id from timeline
tl=json.load(open("src/timeline.json")); sid=tl["scenes"][0]["id"]
json.dump({"mode":"photo","scenes":{sid:{"img":"images/_smoke/t01.jpg","depth":"images/_smoke/t01.depth.png","move":"pushIn"}},"fallback":[]}, open("src/photo_manifest.json","w"))
print("smoke manifest for", sid)
PY
npx remotion still EveryLevelLawyer out/_photo_smoke.png --frame=30 --timeout=120000
python3 - <<'PY'
from PIL import Image
import numpy as np
a=np.asarray(Image.open("out/_photo_smoke.png").convert("L"))
print("mean",a.mean(),"std",a.std())
assert a.std() > 5, "frame looks blank/flat"
print("PHOTO SMOKE OK")
PY
```
Expected: `PHOTO SMOKE OK` (frame is non-blank, PhotoStage rendered).

- [ ] **Step 6: Restore the committed doodle manifest**

```bash
git checkout src/photo_manifest.json
rm -rf public/images/_smoke out/_photo_smoke.png out/_reg_*.png
```

- [ ] **Step 7: Commit**

```bash
git add src/director.tsx src/Video2.tsx tsconfig.json
git commit -m "feat(clc-photo): render PhotoStage when manifest present, SVG fallback otherwise"
```

---

## Task 8: build.py step + routine toggle + render inputs

**Files:**
- Modify: `build.py`
- Modify: `ops/routine.json`
- Modify: `modal_render.py`

**Interfaces:**
- `build.py` gains a non-fatal step 0.5 between the `content.py` syntax gate and the VO step, running `python3 gen_scene_images.py`.
- `ops/routine.json` gains `"visualMode": "doodle"`.

- [ ] **Step 1: Add step 0.5 to build.py**

After the `episode_meta.json` sync line (`json.dump({"thumb": ...}, ...)`, ~line 38) and before `# 1) VO + music`, insert:
```python
# 0.5) SCENE IMAGES (photo visual mode) — NON-FATAL: any failure falls back to doodle per scene,
# and visualMode="doodle" makes this a no-op. Must run before the smoke render consumes assets.
run("python3 gen_scene_images.py")
```
(Uses the existing `run()` helper; its non-zero return is intentionally ignored — the manifest itself encodes fallbacks.)

- [ ] **Step 2: Add visualMode to routine.json**

Add `"visualMode": "doodle"` to `ops/routine.json`. (Note: `photo_style.json` is the authority the code reads; this key documents intent at the routine level and is the single switch the operator flips during the §Task 9 pilot. If you want routine.json to be authoritative, have `gen_scene_images.main()` prefer `routine.json`'s `visualMode` over `photo_style.json` — implement that override in `main()` and add a unit test mirroring Task 1's merge test.)

- [ ] **Step 3: Ensure Modal ships the assets**

In `modal_render.py`, confirm the uploaded project data includes `public/` (images) and `src/photo_manifest.json`. If the upload is a filtered list, add `public/images` and `src/photo_manifest.json`. Verify by reading the upload/volume-push section.

- [ ] **Step 4: Verify build stays green in doodle mode**

Run: `python3 build.py`
Expected: prints `gen_scene_images: mode=doodle ok=0 fallback=0`, then `BUILD OK — gate + smoke passed`. Exit 0. (Confirms the new step is inert and non-breaking.)

- [ ] **Step 5: Commit**

```bash
git add build.py ops/routine.json modal_render.py
git commit -m "feat(clc-photo): non-fatal image step in build + visualMode toggle"
```

---

## Task 9: Photo-mode dry run (operator gate — no code)

**Files:** none (verification only).

- [ ] **Step 1:** Set `ops/photo_style.json` `visualMode` to `"photo"` locally (do NOT commit).
- [ ] **Step 2:** Run `python3 gen_scene_images.py`; confirm `public/images/<slug>/` fills with stills + depth maps and `src/photo_manifest.json` shows `mode=photo` with few/no fallbacks.
- [ ] **Step 3:** Eyeball 3–4 generated stills for the target look; if flat, iterate `styleSuffix` in `photo_style.json` and re-run (cached images for unchanged prompts are reused; delete `public/images/<slug>/` to force regen).
- [ ] **Step 4:** `python3 build.py` then a full local or Modal render; run `python3 qa_watch.py out/episode.mp4` and review sampled frames for blank/flat scenes and readable parallax.
- [ ] **Step 5:** Revert `visualMode` to `doodle` until you decide to flip the channel for real. Decision + retention comparison is owner-run per spec §6.

---

## Task 10 (OPTIONAL enhancement): real Depth Anything V2

**Files:** Modify `depth.py`.

- [ ] Add a `make_depth_model(img_path, depth_path)` that uses `transformers` `pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf")` on MPS, and have `make_depth` try it first, falling back to the synthesized version on any ImportError/runtime error. Gate behind a `photo_style.json` flag `"depthModel": true` (default false). Only pursue if pseudo-depth parallax looks insufficient after Task 9. Keep the synthesized path as the guaranteed fallback so the build never blocks on a model download.

---

## Self-Review

**Spec coverage:**
- §2 Image gen → Tasks 1,2,4,5 ✓
- §3 Depth + camera → Tasks 3,6 ✓
- §4 Style system → Task 1 (`ops/photo_style.json`) ✓
- §5 Autopilot safety (build step, toggle, offline render, fallback) → Tasks 5,7,8 ✓; QA integration → Task 9 uses existing `qa_watch.py` ✓
- §6 Rollout → Task 9 (operator gate) ✓
- §7 Future (photoreal / hero video) → out of scope, unchanged ✓; Depth Anything future → Task 10 ✓

**Placeholder scan:** No TBD/TODO; all code steps contain runnable code. Two intentional operator-judgment points (style-suffix tuning in Task 9, optional depth model in Task 10) are explicitly scoped, not hidden placeholders.

**Type consistency:** `Move` type shared between `photoStage.tsx` (Task 6) and consumed in `director.tsx`/`Video2.tsx` (Task 7). Manifest shape `{mode, scenes:{sid:{img,depth,move}}, fallback:[]}` is identical in Task 5 (writer) and Task 7 (reader). `asset_paths` keys (`img/depth/rel_img/rel_depth`) used consistently in Tasks 2,4,5. `load_style` keys used consistently across Tasks 1,2,4,5,6-config.
