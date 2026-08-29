"""Card-shape check — every card must carry the field its OWN kind renders.

2026-08-29: three cards in one episode named a field the renderer does not read for that kind:
`{kind:'word', text:...}` (the word card reads `word`), twice, and `{kind:'objects', text:...}`
(the objects card needs an `items` list). The first blew up 100 seconds into a CLOUD render as
`TypeError: Cannot read properties of undefined (reading 'trim')` with no scene id and no stack in
the CI log; the run then fell back to a local render the disk floor refuses, and the channel stayed
dark. The field names are guessable-wrong precisely because `text` is right for the commonest kind.

Source of truth is src/Video2.tsx's dispatch and src/textcard.tsx's union — kept here as a table
because both are TSX and parsing them for this is more fragile than the table is.
"""
import ast, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
REQUIRED = {"narration": ("text",), "chapter": ("title", "subtitle"), "word": ("word",),
            "objects": ("items",)}


def check(content_path=None):
    fails, warns = [], []
    path = content_path or os.path.join(ROOT, "content.py")
    src = open(path).read()
    tree = ast.parse(src)
    scenes = None
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign) and any(
                getattr(t, "id", "") == "SCENES" for t in node.targets):
            scenes = node.value
    if scenes is None:
        fails.append("card_check: no SCENES assignment in content.py")
        return fails, warns
    for el in getattr(scenes, "elts", []):
        sid, card = None, None
        for kw in getattr(el, "keywords", []):
            if kw.arg == "id" and isinstance(kw.value, ast.Constant):
                sid = kw.value.value
            if kw.arg == "card":
                card = kw.value
        if card is None or not isinstance(card, (ast.Dict, ast.Call)):
            continue
        keys = {}
        if isinstance(card, ast.Dict):
            for k, v in zip(card.keys, card.values):
                if isinstance(k, ast.Constant):
                    keys[k.value] = v
        else:
            for kw in getattr(card, "keywords", []):
                keys[kw.arg] = kw.value
        kind = keys.get("kind")
        kind = kind.value if isinstance(kind, ast.Constant) else None
        if kind is None:
            fails.append(f"{sid}: card has no `kind` — must be one of {sorted(REQUIRED)}")
            continue
        if kind not in REQUIRED:
            fails.append(f"{sid}: card.kind {kind!r} is not rendered by anything — "
                         f"src/Video2.tsx knows {sorted(REQUIRED)}")
            continue
        for field in REQUIRED[kind]:
            v = keys.get(field)
            missing = v is None or (isinstance(v, ast.Constant) and not v.value)
            if missing:
                got = sorted(k for k in keys if k != "kind")
                fails.append(
                    f"{sid}: card.kind {kind!r} renders `{field}`, which is missing or empty "
                    f"(it carries {got}). The renderer reads a DIFFERENT field per kind: "
                    f"narration->text, word->word, chapter->title+subtitle, objects->items. "
                    f"Without this the render dies mid-flight with no scene id.")
    return fails, warns


if __name__ == "__main__":
    f, w = check()
    for m in w:
        print(f"  WARN: {m}")
    for m in f:
        print(f"  FAIL: {m}")
    print("CARDS: " + ("PASS" if not f else "HALT"))
    sys.exit(1 if f else 0)
