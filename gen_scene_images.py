import hashlib, os, time, urllib.parse, requests

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
