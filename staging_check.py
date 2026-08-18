#!/usr/bin/env python3
"""STAGING DRIFT DETECTOR — re-derives director.tsx's head anchors from explainer.tsx's figure
call sites and HALTS when the two disagree.  Run by gate.py; also runnable on its own:

    python3 staging_check.py            # prints every anchor it checked, exits 1 on drift

WHY THIS EXISTS.  `src/director.tsx` STAGING publishes, per template, where that template's people's
heads are, in frame fractions.  Three layers read it and none of them can see the frame: the balloon
planner places a lozenge clear of every head and solves a TAIL to point at the speaker's, `noteCorner`
picks the emptiest corner for the number card, and `panels.tsx` re-centres a half-width crop on
`panelX`.  The numbers were MEASURED off the figure call sites by hand.

That makes it a registry, not a publication — the weakness the work order that built it wrote down
itself: if a template later moves a figure, the anchor goes stale SILENTLY and a balloon tail points
at nothing again.  Nothing else in this project can see it.  Flat fill, camera lock and the colour
checks all passed on the shipped frame where two men were decapitated by their own balloons; it took
a frame-by-frame watch by eye to find, twice.  QA rated that CRITICAL, so it must not be able to come
back unnoticed.

WHAT MAKES A CHEAP CHECK POSSIBLE.  `figure.tsx` places the head by a fixed rig, so a figure's head
centre is not a matter of taste — it is arithmetic on the call site:

    headC = (x + sin(lean)*(SEG.spine + SEG.neck + SEG.head)*scale*facing,
             y - cos(lean)*(SEG.spine + SEG.neck + SEG.head)*scale)

i.e. the head centre lies on a circle of radius `R = (spine + neck + head) * scale` about the figure's
own staged (x, y), a little off vertical by the pose's spine lean.  The drawn head box is
`2*HEAD_HW*SEG.head*scale` by `2*HEAD_HH*SEG.head*scale` — also pure arithmetic on `scale`.

So every anchor can be re-derived and compared without rendering anything.  Measured across the whole
current registry, the declared anchors sit on that circle to under ONE unit, which is why the radius
tolerance below can be 3 units: this is a re-derivation, not a heuristic, and a figure that moves by
more than a couple of pixels fails it.

WHAT IT CANNOT CHECK, stated plainly.  Some anchors are deliberately not one figure:
`extraHeads` gives a whole seated row as ONE band (documented as such in director.tsx), and two
SPEAKERS are bands too — a figure inside a `.map()` whose x is a loop variable, and a figure whose x
is a function of the frame because it walks.  Those are listed in `UNVERIFIED` with a reason and
reported as a WARN on every run, so the list is visible rather than forgotten, and the check FAILS if
a name is added to STAGING without either being verifiable or being declared here.

WHAT A FULL FIX WOULD NEED, since this is a detector and not the end state: the template publishing
its own anchors from the call site that draws the figure — `figure.tsx` handing its computed head box
up through a context that `director.tsx` consumes — so the two cannot be separate numbers at all.
That is a render-time refactor across `figure.tsx`, all thirteen templates and three consuming layers,
which is much larger than this.  Until then, this file is what makes drift loud.
"""
import math
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))


class StagingParseError(RuntimeError):
    """The checker could not read the sources it checks. A checker that cannot parse is a HALT,
    not a pass: passing on an unreadable file is how a guard stops guarding."""

# --- tolerances -------------------------------------------------------------
# The re-derivation matches the current registry to < 1.0 unit everywhere it applies, so 3.0 units of
# slack is ~3x the observed worst case and still catches any figure move a viewer could see.
TOL_R = 3.0
# How far off vertical the pose may lean, as a fraction of R. The worst real case is `officeFloor`'s
# typing hero at 0.28 (a 17 degree lean); 0.45 is ~27 degrees, past which the anchor is not plausibly
# the same figure at all.
MAX_LEAN_FRAC = 0.45
# The head BOX must agree with the call site's `scale` to this fraction. Exact arithmetic, so tight.
TOL_SIZE = 0.02

# Anchors that are a BAND rather than one figure's head, with the reason. Every one of these is
# reported as a WARN on every run: they are the part of the registry this file cannot defend, and the
# list must stay short and visible. A speaker in STAGING that is neither verifiable nor listed here
# is a FAILURE, so the hole cannot be widened silently.
UNVERIFIED = {
    ("boardroom", "guest"):
        "the far side of the table is drawn by a .map() over seated directors, so the figure's x is a "
        "loop variable; the anchor is a band across the seat the visitor speaks from",
    ("officeFloor", "colleague"):
        "the colleague WALKS — `aisleX = 1000 + sin(f * 0.01353) * 128` is a function of the frame, so "
        "the head has no single position; the anchor is a band across the crossing",
}

# ---------------------------------------------------------------------------
# a very small TSX reader — enough for `const NAME = <number>`, an object literal and a JSX attribute
# ---------------------------------------------------------------------------
# ONE alternation, not two passes. gate.py strips block comments first and line comments second, which
# is wrong in exactly the case this codebase contains: `// ... docs/research/crayon/frames/*, ...` — a
# glob inside a LINE comment opens a block comment that then swallows real code (it ate `const SEG`).
# Scanned left to right with both forms in one pattern, whichever opens first wins, which is what a
# tokenizer would do. The `(?<![:\w])` guard keeps `https://` inside a string from starting a comment.
_COMMENT = re.compile(r"/\*.*?\*/|(?<![:\w])//[^\n]*", re.S)


def _strip(s):
    return _COMMENT.sub("", s)


def _close(s, i, open_c, close_c):
    """Index of the bracket closing the one at `i`, or -1."""
    depth = 0
    while i < len(s):
        if s[i] == open_c:
            depth += 1
        elif s[i] == close_c:
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return -1


def _read(name):
    return _strip(open(os.path.join(ROOT, "src", name)).read())


# ---------------------------------------------------------------------------
# the rig, read from figure.tsx rather than copied — a guard with its own stale copy of the
# geometry would be the same defect one level up
# ---------------------------------------------------------------------------
def _rig(fig_src):
    m = re.search(r"\bconst\s+SEG\s*=\s*\{([^}]*)\}", fig_src)
    if not m:
        raise StagingParseError("STAGING: cannot find `const SEG` in src/figure.tsx")
    seg = {k: float(v) for k, v in re.findall(r"(\w+)\s*:\s*(-?[\d.]+)", m.group(1))}
    for key in ("spine", "neck", "head"):
        if key not in seg:
            raise StagingParseError(f"STAGING: src/figure.tsx SEG has no `{key}`")
    hw = re.search(r"\bconst\s+HEAD_HW\s*=\s*([\d.]+)", fig_src)
    hh = re.search(r"\bconst\s+HEAD_HH\s*=\s*([\d.]+)", fig_src)
    if not (hw and hh):
        raise StagingParseError("STAGING: cannot find HEAD_HW / HEAD_HH in src/figure.tsx")
    return (seg["spine"] + seg["neck"] + seg["head"],          # hip -> head centre, per unit scale
            2 * float(hw.group(1)) * seg["head"],              # head box width,  per unit scale
            2 * float(hh.group(1)) * seg["head"])              # head box height, per unit scale


# ---------------------------------------------------------------------------
# figure call sites, per template
# ---------------------------------------------------------------------------
# The take's own jitter is what a template varies BETWEEN scenes; the registry is per TEMPLATE, so
# every anchor was measured at the take's centre. Zero the jitter calls to get back to that centre.
# ONLY the two that return a NUMBER of units. `v.rung` returns a tone step and `v.one` returns an
# arbitrary member of a list; zeroing either would invent a coordinate. Anything else in an x/y/
# scale expression leaves it unevaluable, which surfaces as an anchor this file refuses to pass
# rather than as a number it made up.
_JITTER = re.compile(r"\bv\.(?:off|pick)\s*\(")
_NUMERIC = re.compile(r"[-+*/(). 0-9e]+")


def _eval(expr, consts):
    """The expression's value at the take centre, or None if it is not a constant."""
    e = expr.strip()
    while True:
        m = _JITTER.search(e)
        if not m:
            break
        j = _close(e, m.end() - 1, "(", ")")
        if j < 0:
            return None
        e = e[:m.start()] + "0" + e[j + 1:]
    for _ in range(4):                                  # resolve consts that name other consts
        before = e
        for name, val in consts.items():
            e = re.sub(r"\b" + re.escape(name) + r"\b", repr(val), e)
        if e == before:
            break
    if not _NUMERIC.fullmatch(e):
        return None
    try:
        return float(eval(e, {"__builtins__": {}}, {}))   # noqa: S307 — digits and operators only
    except Exception:
        return None


_CONST = re.compile(r"\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*([^;{}]+?);")


def _consts(text, seed=None):
    """`const NAME = <arithmetic>;` in `text`, resolved against `seed` and against each other."""
    out = dict(seed or {})
    for _ in range(4):
        grew = False
        for m in _CONST.finditer(text):
            if m.group(1) in out:
                continue
            v = _eval(m.group(2), out)
            if v is not None:
                out[m.group(1)] = v
                grew = True
        if not grew:
            break
    return out


_ATTR = re.compile(r"\b(x|y|scale)\s*=\s*\{")


def _figures(body, consts):
    """Every `<StickFigure .../>` in `body`, as its take-centre (x, y, scale). None where the call
    site is not a constant (a loop variable, a walk driven by the frame)."""
    out = []
    for m in re.finditer(r"<StickFigure\b", body):
        end = body.find("/>", m.end())
        if end < 0:
            raise StagingParseError("STAGING: an unterminated <StickFigure ...> in src/explainer.tsx")
        seg = body[m.end():end]
        if "<" in seg:
            # `find("/>")` overran this element into the next one, so any x/y/scale below would be
            # some other figure's. Loud, because a quietly mis-read call site is a wrong anchor.
            raise StagingParseError(
                "STAGING: a <StickFigure> in src/explainer.tsx is not self-closing (or nests an "
                "element), so its call site cannot be read")
        vals = {}
        for a in _ATTR.finditer(seg):
            j = _close(seg, a.end() - 1, "{", "}")
            if j < 0:
                raise StagingParseError("STAGING: an unbalanced JSX attribute on a <StickFigure>")
            vals[a.group(1)] = _eval(seg[a.end():j], consts)
        out.append((vals.get("x"), vals.get("y"), vals.get("scale", 1.0)))
    return out


def _template_figures():
    """{template name: [(x, y, scale) ...]} for the explainer set."""
    src = _read("explainer.tsx")
    module_consts = _consts(src)
    i = src.find("EXPLAINER_TEMPLATES")
    if i < 0:
        raise StagingParseError("STAGING: no EXPLAINER_TEMPLATES map in src/explainer.tsx")
    j = src.find("{", i)
    k = _close(src, j, "{", "}")
    pairs = re.findall(r"(\w+)\s*:\s*(\w+)\s*,", src[j:k])
    if not pairs:
        raise StagingParseError(
            "STAGING: EXPLAINER_TEMPLATES parsed as EMPTY — this is a checker bug, not an episode "
            "defect, and it would make every anchor below unverifiable")
    out = {}
    for tname, comp in pairs:
        m = re.search(r"\bconst\s+" + re.escape(comp) + r"\b[^=]*=\s*\(\s*\)\s*=>\s*", src)
        if not m:
            raise StagingParseError(f"STAGING: cannot find the component `{comp}` behind template `{tname}`")
        p = src.find("{", m.end())
        q = _close(src, p, "{", "}")
        body = src[p:q + 1]
        out[tname] = _figures(body, _consts(body, module_consts))
    return out


# ---------------------------------------------------------------------------
# the declared anchors
# ---------------------------------------------------------------------------
def _staging():
    """{template: [(role, cx, cy, w, h) ...]} — SPEAKERS only. `extraHeads` are bands by design."""
    src = _read("director.tsx")
    i = src.find("STAGING")
    j = src.find("{", i)
    k = _close(src, j, "{", "}")
    body = src[j + 1:k]
    out = {}
    pos = 0
    while True:
        m = re.compile(r"(\w+)\s*:\s*\{").search(body, pos)
        if not m:
            break
        end = _close(body, m.end() - 1, "{", "}")
        entry = body[m.end():end]
        speakers = []
        for s in re.finditer(
                r"role:\s*'(\w+)'\s*,\s*head:\s*\{\s*cx:\s*([\d.]+)\s*,\s*cy:\s*([\d.]+)\s*,"
                r"\s*w:\s*([\d.]+)\s*,\s*h:\s*([\d.]+)", entry):
            speakers.append((s.group(1), float(s.group(2)), float(s.group(3)),
                             float(s.group(4)), float(s.group(5))))
        out[m.group(1)] = speakers
        pos = end + 1
    if not out:
        raise StagingParseError("STAGING: director.tsx STAGING parsed as EMPTY — checker bug")
    return out


def check(width=1920, height=1080, verbose=False):
    """(fails, warns). `fails` non-empty = an anchor no longer describes the frame."""
    fails, warns = [], []
    R_PER, W_PER, H_PER = _rig(_read("figure.tsx"))
    figs = _template_figures()
    staging = _staging()

    for tmpl in sorted(staging):
        if tmpl not in figs:
            # A legacy scenes.tsx/stage.tsx template may legitimately carry staging; it just cannot be
            # re-derived from explainer.tsx. Say so rather than passing it in silence.
            warns.append(f"staging: '{tmpl}' is not an explainer template, so its anchors cannot be "
                         f"re-derived from a figure call site")
            continue
        for role, cx, cy, w, h in staging[tmpl]:
            if (tmpl, role) in UNVERIFIED:
                warns.append(f"staging: {tmpl}.{role} is UNVERIFIED — {UNVERIFIED[(tmpl, role)]}")
                continue
            hx, hy = cx * width, cy * height
            best = None
            for x, y, s in figs[tmpl]:
                if x is None or y is None or s is None:
                    continue
                dx, dy = hx - x, y - hy
                r = math.hypot(dx, dy)
                err = abs(r - R_PER * s)
                if best is None or err < best[0]:
                    best = (err, dx, dy, r, s)
            if best is None:
                fails.append(
                    f"staging: {tmpl}.{role} cannot be checked — no <StickFigure> in '{tmpl}' has a "
                    f"constant x/y/scale, so this anchor is not derived from anything. Either give the "
                    f"figure a constant mark or declare the anchor in staging_check.UNVERIFIED with a "
                    f"reason.")
                continue
            err, dx, dy, r, s = best
            if err > TOL_R or dy <= 0 or abs(dx) > MAX_LEAN_FRAC * R_PER * s:
                fails.append(
                    f"staging: {tmpl}.{role} anchor has DRIFTED — the nearest figure puts its head "
                    f"{r:.1f} units from the mark but the rig puts it at {R_PER * s:.1f} "
                    f"(scale {s:g}, off-vertical {dx:+.1f}). A balloon tail on '{tmpl}' now points at "
                    f"nothing. Re-measure director.tsx STAGING['{tmpl}'] against explainer.tsx's "
                    f"figure call sites: head centre = (x + sin(lean)*{R_PER:g}*scale*facing, "
                    f"y - cos(lean)*{R_PER:g}*scale).")
                continue
            want_w, want_h = W_PER * s / width, H_PER * s / height
            if abs(h - want_h) > TOL_SIZE * want_h:
                fails.append(
                    f"staging: {tmpl}.{role} head SIZE has drifted — declared h={h:.4f} but scale "
                    f"{s:g} draws h={want_h:.4f} ({H_PER:g}*scale/{height}). The balloon planner "
                    f"clears a box of the wrong size.")
                continue
            if abs(w - want_w) > TOL_SIZE * want_w:
                warns.append(f"staging: {tmpl}.{role} head w={w:.4f} is wider than one head "
                             f"({want_w:.4f}) — a deliberate band, or a stale measurement?")
            if verbose:
                print(f"  staging OK {tmpl}.{role}: r {r:.1f} vs {R_PER * s:.1f}, "
                      f"lean {dx:+.1f}, scale {s:g}")
    return fails, warns


if __name__ == "__main__":
    import sys
    try:
        f, w = check(verbose=True)
    except StagingParseError as e:
        print("  FAIL:", e)
        print("STAGING: DRIFT")
        sys.exit(1)
    for x in w:
        print("  WARN:", x)
    for x in f:
        print("  FAIL:", x)
    print("STAGING: PASS" if not f else "STAGING: DRIFT")
    sys.exit(1 if f else 0)
