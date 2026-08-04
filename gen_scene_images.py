import hashlib, os, time, urllib.parse, requests, json
from photo_style import load_style, STYLE_PATH
from depth import make_depth

ROOT = os.path.dirname(os.path.abspath(__file__))
ROUTINE_PATH = os.path.join(ROOT, "ops", "routine.json")

def effective_mode(style, routine_path=ROUTINE_PATH):
    """visualMode authority: ops/routine.json wins if it sets one, else photo_style.json's value."""
    try:
        rm = json.load(open(routine_path)).get("visualMode")
        if rm:
            return rm
    except Exception:
        pass
    return style.get("visualMode", "doodle")

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
        if attempt < retries - 1:
            time.sleep(2 ** attempt)
    return False

def modal_flux_backend(jobs, style):
    """jobs: [{"sid","prompt","seed","out"}]. Generates via Modal FLUX, writes JPEGs to each 'out'.
    Returns {sid: bool}."""
    from gen_images_modal import run_flux
    payload = [{"sid": j["sid"], "prompt": j["prompt"], "seed": j["seed"]} for j in jobs]
    results = run_flux(payload, width=style.get("width", 1280), height=style.get("height", 720))
    ok = {}
    for j in jobs:
        data = results.get(j["sid"])
        if data:
            os.makedirs(os.path.dirname(j["out"]), exist_ok=True)
            with open(j["out"], "wb") as f:
                f.write(data)
            ok[j["sid"]] = True
        else:
            ok[j["sid"]] = False
    return ok

def _pollinations_backend(jobs, style):
    """Adapter: loops the legacy per-scene fetch_image so the old path still works."""
    ok = {}
    for j in jobs:
        ok[j["sid"]] = fetch_image(j["prompt"], j["seed"], style, j["out"])
    return ok

def generate_all(scenes, slug, style, backend=None, depth=make_depth):
    if backend is None:
        backend = modal_flux_backend if style.get("backend") == "modal_flux" else _pollinations_backend
    moves = style.get("moves") or ["pushIn"]
    manifest = {"mode": style.get("visualMode", "doodle"), "scenes": {}, "fallback": []}

    paths = {sc["id"]: asset_paths(slug, sc["id"]) for sc in scenes}
    jobs = []
    for sc in scenes:
        sid = sc["id"]
        ap = paths[sid]
        if not os.path.exists(ap["img"]):
            jobs.append({
                "sid": sid, "prompt": build_prompt(sc, style),
                "seed": scene_seed(slug, sid), "out": ap["img"],
            })

    if jobs:
        try:
            backend(jobs, style)
        except Exception as e:
            print(f"gen_scene_images: NON-FATAL backend error, "
                  f"sending {len(jobs)} scene(s) to fallback: {e}")

    for i, sc in enumerate(scenes):
        sid = sc["id"]
        ap = paths[sid]
        if os.path.exists(ap["img"]):
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
    style = {**style, "visualMode": effective_mode(style)}
    manifest = {"mode": "doodle", "scenes": {}, "fallback": []}
    try:
        meta = json.load(open(os.path.join(ROOT, "ops", "episode_meta.json")))
        slug = (meta.get("topic") or "episode").strip().replace(" ", "_")
    except Exception:
        slug = "episode"
    try:
        if style.get("visualMode") == "photo":
            import importlib, content  # only imported in photo mode
            importlib.reload(content)
            manifest = generate_all(content.SCENES, slug, style)
    except Exception as e:
        print(f"gen_scene_images: NON-FATAL error, falling back to doodle manifest: {e}")
        manifest = {"mode": "doodle", "scenes": {}, "fallback": []}
    try:
        dest = os.path.join(ROOT, "src", "photo_manifest.json")
        tmp = dest + ".tmp"
        with open(tmp, "w") as f:
            json.dump(manifest, f, indent=2)
        os.replace(tmp, dest)
    except Exception as e:
        print(f"gen_scene_images: could not write manifest: {e}")
    print(f"gen_scene_images: mode={manifest['mode']} "
          f"ok={len(manifest['scenes'])} fallback={len(manifest['fallback'])}")

if __name__ == "__main__":
    main()
