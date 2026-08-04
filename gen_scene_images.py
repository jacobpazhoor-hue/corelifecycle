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
