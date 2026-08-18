"""director.tsx's head anchors must still describe explainer.tsx's figures.

The same check `gate.py` runs before publishing, exposed to pytest so it fails in CI as well as in
the nightly gate. It renders nothing and reads no audio, so it is fast and runs anywhere.

See `staging_check.py` for the geometry, for the two anchors it deliberately cannot verify, and for
what a full fix (the template publishing its own anchors from the call site) would need.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import staging_check  # noqa: E402


def test_staging_anchors_still_describe_the_figures():
    fails, _ = staging_check.check()
    assert not fails, "\n".join(fails)


def test_every_unverified_anchor_still_exists():
    """The escape hatch must not outlive the thing it excuses.

    `UNVERIFIED` is how a band-shaped anchor is allowed through. If a role is renamed or its template
    is deleted, a stale entry there would silently keep excusing an anchor that no longer exists —
    and the next real band would be waved through under its name.
    """
    staged = staging_check._staging()
    for tmpl, role in staging_check.UNVERIFIED:
        assert tmpl in staged, f"UNVERIFIED names template '{tmpl}', which is no longer in STAGING"
        roles = [r for r, *_ in staged[tmpl]]
        assert role in roles, (
            f"UNVERIFIED names '{tmpl}.{role}', but that template's speakers are {roles} — "
            f"drop the entry or fix the name")
