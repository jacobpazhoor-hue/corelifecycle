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
