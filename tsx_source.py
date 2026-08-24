#!/usr/bin/env python3
"""SHARED TSX SOURCE READERS — the small parsers the pre-render checks build their rules out of.

WHY THIS FILE EXISTS.  `staging_check.py` and `thumb_check.py` both learned the same lesson the
expensive way: a checker that RESTATES a rule the renderer owns drifts away from it, and the drift is
invisible until a render dies.  Both derive their rules from the .tsx that enforces them instead.
`scene_check.py` needs the same trick against SEVEN source files, so the mechanical part — strip
comments, balance brackets, pull a named literal — lives here once.

NOTHING IN HERE KNOWS A SINGLE RULE.  It reads named declarations out of TypeScript source and hands
them back as Python values; every rule lives in the checker that asks for it, and every rule that can
be read is read rather than typed.  A source file that cannot be parsed raises `TsxParseError`, which
the callers turn into a HARD FAIL — never a skipped check, because a skipped check is what a stale
hardcoded copy looks like from the outside.

WHAT IT DELIBERATELY IS NOT: a TypeScript parser.  It handles the literal forms this repo's source
actually uses (a `const NAME = {...}` / `= [...]` / `= 0.42`, and the `...spread` chains scenes.tsx
builds TEMPLATES out of).  Anything it cannot read raises rather than guessing.
"""
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")


class TsxParseError(Exception):
    """A source file could not be read for the values a check is built on."""


_BLOCK_COMMENT = re.compile(r"/\*.*?\*/", re.S)
_LINE_COMMENT = re.compile(r"(?<![:\w])//[^\n]*")


def strip_comments(s):
    return _LINE_COMMENT.sub("", _BLOCK_COMMENT.sub("", s))


def match_brackets(s, i, open_c, close_c):
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


def read(name):
    """`src/<name>`, comments stripped. Raises rather than returning empty."""
    path = os.path.join(SRC, name)
    try:
        with open(path) as f:
            return strip_comments(f.read())
    except OSError as e:
        raise TsxParseError(f"cannot read src/{name}: {e}")


_ASSIGN = re.compile(r"(?<![=!<>])=(?!=|>)")


def _decl(src, name, where):
    """Index just past `const NAME` (or `export const NAME`)."""
    m = re.search(r"\bconst\s+" + re.escape(name) + r"\b", src)
    if not m:
        raise TsxParseError(f"no `const {name}` in {where}")
    return m.end()


def literal(src, name, open_c, close_c, where):
    """The text INSIDE the `{...}` / `[...]` of `const NAME ... = <bracket>`.

    The search starts at the ASSIGNMENT, not at the declaration: a type annotation can carry brackets
    of its own (`const ERAS: Era[] = [...]`, `Record<PanelsT['variant'], number>`) and starting at the
    name would read the annotation instead of the value."""
    eq = _ASSIGN.search(src, _decl(src, name, where))
    if not eq:
        raise TsxParseError(f"`const {name}` in {where} is declared but never assigned")
    i = src.find(open_c, eq.end())
    j = match_brackets(src, i, open_c, close_c) if i >= 0 else -1
    if j < 0:
        raise TsxParseError(f"`const {name}` in {where} has no balanced "
                            f"`{open_c}{close_c}` literal, so its value cannot be read")
    return src[i + 1:j]


def object_keys(src, name, where):
    """Top-level keys of `const NAME = {...}`, IN SOURCE ORDER. Nested literals are skipped."""
    body = literal(src, name, "{", "}", where)
    keys, depth = [], 0
    for tok in re.finditer(r"[{\[(]|[}\])]|([A-Za-z_$][\w$]*)\s*:", body):
        if tok.group(1) is not None:
            if depth == 0:
                keys.append(tok.group(1))
        elif tok.group(0)[0] in "{[(":
            depth += 1
        else:
            depth -= 1
    if not keys:
        raise TsxParseError(f"`const {name}` in {where} parsed as EMPTY — checker bug, "
                            f"not an episode defect")
    return keys


def object_numbers(src, name, where):
    """`{k: 2, j: 4}` -> {'k': 2, 'j': 4}. Top level only; a non-numeric value raises."""
    body = literal(src, name, "{", "}", where)
    out = {}
    for k, v in re.findall(r"([A-Za-z_$][\w$]*)\s*:\s*([-\d.]+)\s*[,}]?", body):
        out[k] = float(v) if "." in v else int(v)
    if not out:
        raise TsxParseError(f"`const {name}` in {where} parsed as EMPTY or non-numeric")
    return out


def string_array(src, name, where):
    """`const NAME ... = ['a', 'b']` -> ['a', 'b'], in source order."""
    body = literal(src, name, "[", "]", where)
    out = re.findall(r"['\"]([^'\"]*)['\"]", body)
    if not out:
        raise TsxParseError(f"`const {name}` in {where} parsed as an EMPTY string array — "
                            f"checker bug, not an episode defect")
    return out


def number(src, name, where):
    """`const NAME = 0.42;` -> 0.42 (also `const NAME: T = 7;`)."""
    eq = _ASSIGN.search(src, _decl(src, name, where))
    m = re.compile(r"\s*(-?[\d.]+)\s*;").match(src, eq.end()) if eq else None
    if not m:
        raise TsxParseError(f"no numeric `const {name}` in {where}")
    return float(m.group(1))


def string_const(src, name, where):
    """`const NAME = '#000000';` -> '#000000'."""
    eq = _ASSIGN.search(src, _decl(src, name, where))
    m = re.compile(r"\s*['\"]([^'\"]*)['\"]\s*;").match(src, eq.end()) if eq else None
    if not m:
        raise TsxParseError(f"no string `const {name}` in {where}")
    return m.group(1)


def array_length(src, name, where):
    """How many top-level entries `const NAME ... = [ {...}, {...} ]` holds."""
    body = literal(src, name, "[", "]", where)
    n, depth = 0, 0
    for ch in body:
        if ch in "{[(":
            if depth == 0:
                n += 1
            depth += 1
        elif ch in "}])":
            depth -= 1
    if n == 0:
        raise TsxParseError(f"`const {name}` in {where} parsed as an EMPTY array — checker bug")
    return n


def type_union(src, type_name, field, where):
    """The string alternatives of `field: 'a' | 'b';` inside `type TYPE_NAME = {...}`."""
    m = re.search(r"\btype\s+" + re.escape(type_name) + r"\b", src)
    if not m:
        raise TsxParseError(f"no `type {type_name}` in {where}")
    i = src.find("{", m.end())
    j = match_brackets(src, i, "{", "}") if i >= 0 else -1
    if j < 0:
        raise TsxParseError(f"`type {type_name}` in {where} has no balanced body")
    body = src[i + 1:j]
    f = re.search(re.escape(field) + r"\s*\??\s*:\s*([^;]+);", body)
    if not f:
        raise TsxParseError(f"`type {type_name}` in {where} has no `{field}` member")
    out = re.findall(r"['\"]([^'\"]+)['\"]", f.group(1))
    if not out:
        raise TsxParseError(f"`{type_name}.{field}` in {where} is not a union of string literals")
    return out


# ---------------------------------------------------------------------------
# THE TEMPLATE REGISTRY — the same map gate.py derives, for the checks that need it off the gate's
# own top level (a `panels=` cell's template, `thumb.setting`). Deliberately the SAME walk: follow
# `...spread` identifiers, through relative imports, unwrapping `...keyedTemplates({...})` calls,
# because that is how src/scenes.tsx actually assembles TEMPLATES.
# ---------------------------------------------------------------------------
_MAP_TOKEN = re.compile(r"[{\[(]|[}\])]|\.\.\.\s*(\w+)|([A-Za-z_$][\w$]*)\s*:")


def _unwrap_calls(body):
    while True:
        m = re.search(r"\.\.\.\s*\w+\s*\(", body)
        if not m:
            return body
        j = match_brackets(body, m.end() - 1, "(", ")")
        if j < 0:
            raise TsxParseError("unbalanced call inside a template map")
        inner = body[m.end():j].strip()
        if inner.startswith("{") and match_brackets(inner, 0, "{", "}") == len(inner) - 1:
            inner = inner[1:-1]
        body = body[:m.start()] + inner + body[j + 1:]


def _top_level(body):
    keys, spreads, depth = [], [], 0
    for m in _MAP_TOKEN.finditer(body):
        if m.group(1) is not None:
            if depth == 0:
                spreads.append(m.group(1))
        elif m.group(2) is not None:
            if depth == 0:
                keys.append(m.group(2))
        elif m.group(0)[0] in "{[(":
            depth += 1
        else:
            depth -= 1
    return keys, spreads


def _imported_from(src):
    out = {}
    for m in re.finditer(r"import\s*\{([^}]*)\}\s*from\s*['\"]([^'\"]+)['\"]", src):
        for part in m.group(1).split(","):
            nm = part.strip().split(" as ")[-1].strip()
            if nm:
                out[nm] = m.group(2)
    return out


def _collect(path, name, seen, keys):
    if (path, name) in seen:
        return
    seen.add((path, name))
    try:
        with open(path) as f:
            src = strip_comments(f.read())
    except OSError as e:
        raise TsxParseError(f"cannot read {os.path.relpath(path, ROOT)}: {e}")
    where = os.path.relpath(path, ROOT)
    body = _unwrap_calls(literal(src, name, "{", "}", where))
    ks, spreads = _top_level(body)
    keys.update(ks)
    imports = _imported_from(src)
    for ident in spreads:
        if ident in imports:
            spec = imports[ident]
            if not spec.startswith("."):
                raise TsxParseError(f"TEMPLATES spreads `{ident}` from the non-relative module "
                                    f"'{spec}'; only project source files can be followed")
            base = os.path.normpath(os.path.join(os.path.dirname(path), spec))
            target = next((base + e for e in (".tsx", ".ts") if os.path.exists(base + e)), None)
            if not target:
                raise TsxParseError(f"cannot resolve '{spec}' (spread as `{ident}` from {where})")
            _collect(target, ident, seen, keys)
        else:
            _collect(path, ident, seen, keys)


def template_registry():
    """Every name `TEMPLATES` in src/scenes.tsx resolves — the set an unknown template is judged against."""
    keys = set()
    _collect(os.path.join(SRC, "scenes.tsx"), "TEMPLATES", set(), keys)
    if not keys:
        raise TsxParseError("the template registry derived from src/scenes.tsx is EMPTY — checker bug")
    return keys
