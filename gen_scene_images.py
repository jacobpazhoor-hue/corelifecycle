import hashlib, os, time, urllib.parse, requests, json
from photo_style import load_style, STYLE_PATH
from depth import make_depth

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
        json.dump(manifest, open(os.path.join(ROOT, "src", "photo_manifest.json"), "w"), indent=2)
    except Exception as e:
        print(f"gen_scene_images: could not write manifest: {e}")
    print(f"gen_scene_images: mode={manifest['mode']} "
          f"ok={len(manifest['scenes'])} fallback={len(manifest['fallback'])}")

if __name__ == "__main__":
    main()
