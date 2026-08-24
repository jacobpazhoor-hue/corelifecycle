"""Proofs for the pre-publish audit (scripts/prepublish_audit.py + its enforcement in upload_guard).

THE ACCEPTANCE TEST IS `TestT169Regression`. On 2026-08-24 scene t169 asserted that Gary Wang and
Nishad Singh were "still waiting on their own sentences". Both were sentenced in late 2024 and
docs/research/ftx.md never supported it; only the reviewer's own diligence caught it. That exact
sentence is reconstructed here and the audit must HALT on it — against the REAL research file, not
a fixture written to make the check look good.

Every other case is built in a throwaway ROOT and driven through the real CLI, so what is proved is
the behaviour an operator gets, not the behaviour of a function called with friendly arguments.
Each check is proved TWICE: it FIRES on a constructed bad input and it PASSES on a good one. A
check only proved in one direction is a check that might be halting the channel for nothing.
"""
import json
import os
import shutil
import struct
import subprocess
import sys
import tempfile
import time
import unittest
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import prepublish_audit as audit_mod   # noqa: E402
import upload_guard                    # noqa: E402

FPS = 30

RESEARCH = """# Research: Widget Corp — verified facts, figures, quotes

Sources: SEC litigation release (Mar 4 2019); DOJ press release (Nov 12 2021); Reuters and AP
trial coverage. Every date and figure below is cross-confirmed across at least two of these.

## Timeline

- **2016**: Dana Fairweather founds Widget Corp in Akron, Ohio, with co-founder Roy Salazar.
- **2018**: Widget Corp raises a round valuing the company at **$4 billion**.
- **Mar 4, 2019**: The SEC charges Dana Fairweather with securities fraud. Roy Salazar pleads
  guilty and agrees to cooperate with prosecutors.
- **Nov 12, 2021**: Dana Fairweather is convicted on all four counts and sentenced to 9 years.

## Quotations (verbatim, sourced above)

1. Dana Fairweather, investor call, 2018: "We have never missed a quarter and we never will."

## Cut / unverified — NOT used in the script

- A precise peak headcount figure could not be verified and is not used.
"""


def _png(path, w=1280, h=720):
    """A real, minimal PNG — the audit reads the IHDR for dimensions, so it must parse."""
    def chunk(kind, data):
        return (struct.pack(">I", len(data)) + kind + data
                + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF))
    raw = b"".join(b"\x00" + b"\xff\xff\xff" * w for _ in range(h))
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(raw, 1))
           + chunk(b"IEND", b""))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as fh:
        fh.write(png)
    return path


def _mp4(path, seconds):
    """An mp4 with a readable mvhd — enough for the duration check, no encoder required."""
    def box(kind, payload):
        return struct.pack(">I", len(payload) + 8) + kind + payload
    mvhd = box(b"mvhd", struct.pack(">B3s", 0, b"\0\0\0")
               + struct.pack(">IIII", 0, 0, 1000, int(round(seconds * 1000)))
               + b"\x00" * 80)
    data = box(b"ftyp", b"isom" + b"\x00" * 8) + box(b"moov", mvhd)
    data += box(b"mdat", b"\x00" * 2048)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as fh:
        fh.write(data)
    return path


class Fixture:
    """A throwaway CoreLifecycle tree that PASSES the audit, plus mutators to break one thing."""

    def __init__(self, root):
        self.root = root
        self.topic = "widget"
        self.scenes = [
            dict(id="s001", template="officeFloor", level=None,
                 narration="Dana Fairweather founded Widget Corp in 2016."),
            dict(id="s002", template="boardroom", level="CH 1",
                 narration="By 2018 the company was worth four billion dollars.",
                 card=dict(kind="chapter", title="The Rise", subtitle="How It Began")),
            dict(id="s003", template="courtHearing", level=None,
                 narration="Roy Salazar pleaded guilty and agreed to cooperate."),
            dict(id="s004", template="newsMontage", level=None,
                 narration="In 2021 Dana Fairweather was convicted on all four counts."),
        ]
        self.durations = [90, 300, 120, 390]      # 900 frames == 30.0s
        self.meta = {
            "topic": self.topic,
            "title": "How Widget Corp Actually Lost $4 Billion",
            "hook": "A company worth four billion dollars, and a founder who never missed a quarter.",
            "body": ("Dana Fairweather founded Widget Corp in 2016 and was convicted in 2021.\n"
                     "\nCHAPTERS\n00:00 Cold Open\n00:03 The Rise: How It Began\n"
                     "\nSOURCES: SEC litigation release; DOJ press release.\n"),
            "tags": ["widget corp", "fraud", "explained"],
            "playlist": "Explained Like You're 5",
            "thumb": {"kicker": "", "line1": "TO ZERO", "tag": "FOUR BILLION GONE",
                      "archetype": "beforeafter", "before": "$4 BILLION", "after": "9 YEARS",
                      "big": "$4B GONE", "expr": "cold", "mood": "crime", "word": "GONE"},
        }
        self.research = RESEARCH
        self.video_seconds = 30.0

    # -- construction ----------------------------------------------------------------------
    def write(self):
        r = self.root
        os.makedirs(os.path.join(r, "scripts"), exist_ok=True)
        os.makedirs(os.path.join(r, "src"), exist_ok=True)
        os.makedirs(os.path.join(r, "ops"), exist_ok=True)
        os.makedirs(os.path.join(r, "out", "review"), exist_ok=True)
        os.makedirs(os.path.join(r, "docs", "research"), exist_ok=True)
        for f in ("prepublish_audit.py", "upload_guard.py", "yt_upload.py"):
            shutil.copy(os.path.join(ROOT, "scripts", f), os.path.join(r, "scripts", f))
        shutil.copy(os.path.join(ROOT, "thumb_check.py"), os.path.join(r, "thumb_check.py"))
        shutil.copy(os.path.join(ROOT, "src", "thumbs.tsx"), os.path.join(r, "src", "thumbs.tsx"))

        with open(os.path.join(r, "content.py"), "w") as fh:
            fh.write("FPS = 30\nSCENES = " + repr(self.scenes) + "\n")

        frame, tl_scenes = 0, []
        for sc, dur in zip(self.scenes, self.durations):
            tl_scenes.append({"id": sc["id"], "level": sc.get("level"), "template": sc["template"],
                              "narration": sc["narration"], "card": sc.get("card"),
                              "startFrame": frame, "durationInFrames": dur})
            frame += dur
        with open(os.path.join(r, "src", "timeline.json"), "w") as fh:
            json.dump({"fps": FPS, "width": 1920, "height": 1080, "totalFrames": frame,
                       "scenes": tl_scenes}, fh)

        with open(os.path.join(r, "ops", "episode_meta.json"), "w") as fh:
            json.dump(self.meta, fh)
        with open(os.path.join(r, "out", "upload_kit.json"), "w") as fh:
            json.dump({"video": "out/episode.mp4", "title": self.meta["title"],
                       "description": self.meta["hook"] + "\n\n" + self.meta["body"],
                       "tags": self.meta["tags"], "thumbnail": "out/thumbnail.png",
                       "playlist": self.meta["playlist"], "privacy": "private",
                       "categoryId": "27"}, fh)
        with open(os.path.join(r, "docs", "research", f"{self.topic}.md"), "w") as fh:
            fh.write(self.research)
        _png(os.path.join(r, "out", "thumbnail.png"))
        self.video = _mp4(os.path.join(r, "out", "episode.mp4"), self.video_seconds)
        return self

    # -- running ---------------------------------------------------------------------------
    def run(self, with_video=False):
        """(returncode, output) from the real CLI in this tree."""
        cmd = [sys.executable, os.path.join(self.root, "scripts", "prepublish_audit.py")]
        if with_video:
            cmd.append(os.path.join(self.root, "out", "episode.mp4"))
        p = subprocess.run(cmd, capture_output=True, text=True, cwd=self.root, timeout=180)
        return p.returncode, p.stdout + p.stderr

    def record(self):
        with open(os.path.join(self.root, "out", "review", "prepublish_audit.json")) as fh:
            return json.load(fh)

    # -- mutators --------------------------------------------------------------------------
    def set_narration(self, sid, text):
        for sc in self.scenes:
            if sc["id"] == sid:
                sc["narration"] = text
                return self
        raise KeyError(sid)


class AuditCase(unittest.TestCase):
    def fixture(self):
        root = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, root, True)
        return Fixture(root)

    def assertFires(self, out, needle):
        fails = [ln for ln in out.splitlines() if ln.strip().startswith("FAIL:")]
        self.assertTrue(any(needle in ln for ln in fails),
                        f"no FAIL mentioning {needle!r}.\n{out}")

    def assertWarns(self, out, needle):
        warns = [ln for ln in out.splitlines() if ln.strip().startswith("WARN:")]
        self.assertTrue(any(needle in ln for ln in warns),
                        f"no WARN mentioning {needle!r}.\n{out}")


# ==================================================================================================
# THE ACCEPTANCE TEST
# ==================================================================================================

class TestT169Regression(unittest.TestCase):
    """The exact sentence that nearly shipped on 2026-08-24, against the REAL ftx research file."""

    ORIGINAL = "Gary Wang and Nishad Singh are still waiting on their own sentences."
    SHIPPED = "Gary Wang and Nishad Singh had both pleaded guilty and testified against him."

    def setUp(self):
        with open(os.path.join(ROOT, "docs", "research", "ftx.md")) as fh:
            self.research = fh.read()
        self.rwords = audit_mod.research_words(self.research)
        self.runits = audit_mod.research_units(self.research)

    def _pending_failures(self, sentence):
        """The people this sentence puts in an UNSOURCED pending legal status."""
        hit = audit_mod.PENDING_STATUS.search(sentence)
        if not hit:
            return []
        out = []
        for name, _ in audit_mod.name_candidates(sentence):
            if not audit_mod.name_is_known(name, self.rwords):
                out.append(name)
                continue
            units = audit_mod.units_mentioning(self.runits, name)
            if not any(audit_mod.PENDING_STATUS.search(u) for u in units):
                out.append(name)
        return out

    def test_the_original_wording_is_caught(self):
        self.assertEqual(self._pending_failures(self.ORIGINAL), ["Gary Wang", "Nishad Singh"],
                         "the t169 near-miss must be caught, and must name BOTH people")

    def test_the_shipped_wording_is_clean(self):
        self.assertEqual(self._pending_failures(self.SHIPPED), [],
                         "the corrected line states only what docs/research/ftx.md supports")

    def test_both_people_are_found_in_the_research_file(self):
        """The check must fail for the RIGHT reason: the file knows them, it just never said this."""
        for name in ("Gary Wang", "Nishad Singh"):
            self.assertTrue(audit_mod.name_is_known(name, self.rwords))
            self.assertTrue(audit_mod.units_mentioning(self.runits, name),
                            f"{name} should be traceable in ftx.md — the defect was the CLAIM")


class TestT169EndToEnd(AuditCase):
    """The same wording, driven through the real CLI in a constructed tree."""

    PENDING = "Dana Fairweather and Roy Salazar are still waiting on their own sentences."
    RESOLVED = "Dana Fairweather and Roy Salazar had both pleaded guilty."

    def test_pending_status_halts_the_publish(self):
        f = self.fixture()
        f.set_narration("s004", self.PENDING).write()
        rc, out = f.run()
        self.assertEqual(rc, 1, out)
        self.assertIn("AUDIT: HALT", out)
        self.assertFires(out, "Dana Fairweather")
        self.assertFires(out, "Roy Salazar")
        self.assertFires(out, "still waiting")
        self.assertEqual(f.record()["verdict"], "fail")

    def test_the_same_scene_passes_once_it_says_only_what_is_sourced(self):
        f = self.fixture()
        f.set_narration("s004", self.RESOLVED).write()
        rc, out = f.run()
        self.assertEqual(rc, 0, out)
        self.assertIn("AUDIT: PASS", out)

    def test_pending_status_is_allowed_when_the_research_file_sources_it(self):
        """PROOF THIS IS NOT JUST A BANNED-PHRASE LIST — a sourced pending status publishes."""
        f = self.fixture()
        f.research = RESEARCH.replace(
            "- **Nov 12, 2021**: Dana Fairweather is convicted on all four counts and sentenced to 9 years.",
            "- **Nov 12, 2021**: Dana Fairweather is convicted on all four counts.\n"
            "- **Dec 2021**: Roy Salazar is still awaiting sentencing; no date has been set.")
        f.set_narration("s004", "Roy Salazar is still awaiting sentencing.").write()
        rc, out = f.run()
        self.assertEqual(rc, 0, out)


# ==================================================================================================
# the current tree — the false-positive guard
# ==================================================================================================

class TestTheShippingEpisode(unittest.TestCase):
    """The corrected ftx episode must PASS. A false positive here blocks a real publish."""

    def test_current_tree_has_no_audit_failures(self):
        p = subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "prepublish_audit.py")],
                           capture_output=True, text=True, cwd=ROOT, timeout=180)
        out = p.stdout + p.stderr
        self.assertEqual(p.returncode, 0, f"the shipping episode must pass the audit:\n{out}")
        self.assertIn("AUDIT: PASS", out)

    def test_the_warnings_are_the_ones_a_human_found(self):
        """The reviewer's own untraceable-claim findings must survive as WARNs, not vanish."""
        p = subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "prepublish_audit.py")],
                           capture_output=True, text=True, cwd=ROOT, timeout=180)
        warns = " ".join(ln for ln in (p.stdout + p.stderr).splitlines()
                         if ln.strip().startswith("WARN:"))
        for needle in ("Tom Brady", "Steph Curry", "Forbes", "richest"):
            self.assertIn(needle, warns, f"{needle} should be surfaced for judgement")


# ==================================================================================================
# every other check: fires on bad input, passes on good
# ==================================================================================================

class TestCleanTreePasses(AuditCase):
    def test_the_fixture_itself_passes(self):
        rc, out = self.fixture().write().run()
        self.assertEqual(rc, 0, out)

    def test_it_also_passes_with_the_render_bound(self):
        f = self.fixture().write()
        rc, out = f.run(with_video=True)
        self.assertEqual(rc, 0, out)
        rec = f.record()
        self.assertEqual(rec["video"], "episode.mp4")
        self.assertEqual(len(rec["sha256"]), 64)
        self.assertIn("content.py", rec["sources"])
        self.assertIn("docs/research/widget.md", rec["sources"])


class TestDatesAndFigures(AuditCase):
    def test_a_year_not_in_the_research_file_halts(self):
        f = self.fixture()
        f.set_narration("s001", "Dana Fairweather founded Widget Corp in 2014.").write()
        rc, out = f.run()
        self.assertEqual(rc, 1, out)
        self.assertFires(out, "the year 2014")

    def test_a_year_in_the_research_file_passes(self):
        f = self.fixture()
        f.set_narration("s001", "Dana Fairweather founded Widget Corp in 2016.").write()
        self.assertEqual(f.run()[0], 0)

    def test_an_unsourced_figure_only_warns(self):
        """WARN, not FAIL: spelled-out number parsing is unreliable enough to go dark on."""
        f = self.fixture()
        f.set_narration("s002", "By 2018 the company was worth nine billion dollars.").write()
        rc, out = f.run()
        self.assertEqual(rc, 0, out)
        self.assertWarns(out, "$9,000,000,000")


class TestQuotations(AuditCase):
    def test_a_fabricated_quote_halts(self):
        f = self.fixture()
        f.set_narration("s004", 'Fairweather told the jury, "I have no idea where the money went '
                                'and I never did care very much."').write()
        rc, out = f.run()
        self.assertEqual(rc, 1, out)
        self.assertFires(out, "does not appear in")

    def test_the_verified_quote_passes(self):
        f = self.fixture()
        f.set_narration("s004", 'She had told investors, "We have never missed a quarter and we '
                                'never will."').write()
        self.assertEqual(f.run()[0], 0)

    def test_a_reworded_quote_only_warns(self):
        f = self.fixture()
        f.set_narration("s004", 'She had told them, "We never missed a quarter and we never '
                                'will, ever."').write()
        rc, out = f.run()
        self.assertEqual(rc, 0, out)
        self.assertWarns(out, "REWORDING")


class TestUnknownPeople(AuditCase):
    def test_a_legal_claim_about_an_unresearched_person_halts(self):
        f = self.fixture()
        f.set_narration("s003", "Marcus Delgado was convicted alongside her.").write()
        rc, out = f.run()
        self.assertEqual(rc, 1, out)
        self.assertFires(out, "Marcus Delgado")

    def test_a_bare_mention_of_an_unresearched_person_only_warns(self):
        """The Brady/Bundchen/Curry shape: a name with no claim attached is a judgement call."""
        f = self.fixture()
        f.set_narration("s003", "Marcus Delgado. Priya Raghunathan. Ingrid Solheim.").write()
        rc, out = f.run()
        self.assertEqual(rc, 0, out)
        self.assertWarns(out, "Marcus Delgado")

    def test_display_copy_is_not_scanned_for_names(self):
        """ALL-CAPS labels read as names to any regex; scanning them was 20 false warnings."""
        f = self.fixture()
        f.scenes[0]["labels"] = ["ALL FOUR COUNTS", "FEDERAL PRISON"]
        f.write()
        rc, out = f.run()
        self.assertEqual(rc, 0, out)
        self.assertNotIn("ALL FOUR COUNTS", out)


class TestPossessiveSurnames(unittest.TestCase):
    """str.rstrip("'s") turns Williams into William and Soros into Soro — it reported the U.S.
    Attorney and George Soros as people the research file had never heard of."""

    def test_possessive_is_stripped_as_a_suffix_not_a_character_set(self):
        self.assertEqual(audit_mod.bare_token("Williams"), "Williams")
        self.assertEqual(audit_mod.bare_token("Soros"), "Soros")
        self.assertEqual(audit_mod.bare_token("Street's"), "Street")
        self.assertEqual(audit_mod.bare_token("J."), "J")

    def test_a_surname_ending_in_s_is_traceable(self):
        rwords = audit_mod.research_words("Damian Williams and George Soros both spoke.")
        self.assertTrue(audit_mod.name_is_known("Damian Williams", rwords))
        self.assertTrue(audit_mod.name_is_known("George Soros", rwords))


class TestPackaging(AuditCase):
    def test_a_kit_title_that_does_not_match_the_meta_halts(self):
        f = self.fixture().write()
        kit = os.path.join(f.root, "out", "upload_kit.json")
        with open(kit) as fh:
            d = json.load(fh)
        d["title"] = "Some Other Episode Entirely"
        with open(kit, "w") as fh:
            json.dump(d, fh)
        rc, out = f.run()
        self.assertEqual(rc, 1, out)
        self.assertFires(out, "packaging title")

    def test_a_description_over_the_youtube_limit_halts(self):
        f = self.fixture().write()
        kit = os.path.join(f.root, "out", "upload_kit.json")
        with open(kit) as fh:
            d = json.load(fh)
        d["description"] = d["description"] + ("x" * 5000)
        with open(kit, "w") as fh:
            json.dump(d, fh)
        rc, out = f.run()
        self.assertEqual(rc, 1, out)
        self.assertFires(out, "yt_upload.py posts only the first")

    def test_a_stale_kit_description_halts(self):
        f = self.fixture().write()
        kit = os.path.join(f.root, "out", "upload_kit.json")
        with open(kit) as fh:
            d = json.load(fh)
        d["description"] = "Last night's episode about something else.\n\n00:00 Cold Open\n"
        with open(kit, "w") as fh:
            json.dump(d, fh)
        rc, out = f.run()
        self.assertEqual(rc, 1, out)
        self.assertFires(out, "packaging description")


class TestChapters(AuditCase):
    def test_a_chapter_name_that_differs_from_the_card_halts(self):
        f = self.fixture()
        f.meta["body"] = f.meta["body"].replace("The Rise: How It Began",
                                                "The Ascent: How It All Started")
        f.write()
        rc, out = f.run()
        self.assertEqual(rc, 1, out)
        self.assertFires(out, "the card on screen reads")

    def test_a_chapter_timestamp_that_drifts_halts(self):
        f = self.fixture()
        f.meta["body"] = f.meta["body"].replace("00:03 The Rise", "01:47 The Rise")
        f.write()
        rc, out = f.run()
        self.assertEqual(rc, 1, out)
        self.assertFires(out, "it renders at")

    def test_a_missing_chapter_list_halts(self):
        f = self.fixture()
        f.meta["body"] = "Just prose, no chapter list at all.\n"
        f.write()
        rc, out = f.run()
        self.assertEqual(rc, 1, out)
        self.assertFires(out, "NO chapter list")


class TestThumbnail(AuditCase):
    def test_non_ascii_thumbnail_copy_halts(self):
        """PRESERVED RULE: the thumbnail font is a vendored Montserrat LATIN SUBSET."""
        f = self.fixture()
        f.meta["thumb"]["big"] = "BÜNDCHEN"
        f.write()
        rc, out = f.run()
        self.assertEqual(rc, 1, out)
        self.assertFires(out, "non-ASCII")

    def test_ascii_thumbnail_copy_passes(self):
        f = self.fixture()
        f.meta["thumb"]["big"] = "BUNDCHEN"
        f.write()
        self.assertEqual(f.run()[0], 0)

    def test_a_missing_thumbnail_halts(self):
        f = self.fixture().write()
        os.remove(os.path.join(f.root, "out", "thumbnail.png"))
        rc, out = f.run()
        self.assertEqual(rc, 1, out)
        self.assertFires(out, "missing or empty")

    def test_a_thumbnail_number_the_episode_never_says_only_warns(self):
        f = self.fixture()
        f.meta["thumb"]["big"] = "$77B GONE"
        f.write()
        rc, out = f.run()
        self.assertEqual(rc, 0, out)
        self.assertWarns(out, "$77B GONE")


class TestTimelineIdentity(AuditCase):
    def test_a_scene_the_render_does_not_contain_halts(self):
        f = self.fixture().write()
        tl_path = os.path.join(f.root, "src", "timeline.json")
        with open(tl_path) as fh:
            tl = json.load(fh)
        tl["scenes"] = tl["scenes"][:-1]
        with open(tl_path, "w") as fh:
            json.dump(tl, fh)
        rc, out = f.run()
        self.assertEqual(rc, 1, out)
        self.assertFires(out, "does not render")

    def test_narration_edited_after_the_build_halts(self):
        """content.py edited after the timeline was written — the audio is of the OLD words."""
        f = self.fixture().write()
        src = os.path.join(f.root, "content.py")
        with open(src) as fh:
            body = fh.read()
        body = body.replace("Roy Salazar pleaded guilty and agreed to cooperate.",
                            "Roy Salazar pleaded guilty in 2019 and agreed to cooperate.")
        with open(src, "w") as fh:
            fh.write(body)
        rc, out = f.run()
        self.assertEqual(rc, 1, out)
        self.assertFires(out, "differs from content.py")


class TestRenderBinding(AuditCase):
    def test_a_render_of_the_wrong_length_halts(self):
        f = self.fixture()
        f.video_seconds = 95.0            # timeline says 30.0
        f.write()
        rc, out = f.run(with_video=True)
        self.assertEqual(rc, 1, out)
        self.assertFires(out, "is NOT this script")

    def test_the_matching_render_passes(self):
        f = self.fixture()
        f.video_seconds = 30.0
        f.write()
        self.assertEqual(f.run(with_video=True)[0], 0)

    def test_mvhd_duration_is_read_without_ffprobe(self):
        path = _mp4(os.path.join(tempfile.mkdtemp(), "x.mp4"), 123.5)
        self.addCleanup(shutil.rmtree, os.path.dirname(path), True)
        self.assertAlmostEqual(audit_mod.mp4_duration_seconds(path), 123.5, places=2)


class TestAuditCannotRun(AuditCase):
    """Exit 2: the audit is broken, not the episode. It is still a HALT."""

    def test_a_missing_research_file_is_exit_2(self):
        f = self.fixture().write()
        os.remove(os.path.join(f.root, "docs", "research", "widget.md"))
        rc, out = f.run()
        self.assertEqual(rc, 2, out)
        self.assertIn("CANNOT RUN", out)
        self.assertIn("docs/research/widget.md", out)

    def test_a_truncated_json_is_exit_2(self):
        f = self.fixture().write()
        with open(os.path.join(f.root, "out", "upload_kit.json"), "w") as fh:
            fh.write('{"video": "out/epi')
        rc, out = f.run()
        self.assertEqual(rc, 2, out)
        self.assertIn("CANNOT RUN", out)

    def test_no_record_is_written_when_the_audit_cannot_run(self):
        """A stale PASS from a previous run must not survive a broken audit."""
        f = self.fixture().write()
        f.run()                                     # writes a passing record
        self.assertEqual(f.record()["verdict"], "pass")
        os.remove(os.path.join(f.root, "out", "review", "prepublish_audit.json"))
        os.remove(os.path.join(f.root, "docs", "research", "widget.md"))
        rc, _ = f.run()
        self.assertEqual(rc, 2)
        self.assertFalse(os.path.exists(
            os.path.join(f.root, "out", "review", "prepublish_audit.json")))


# ==================================================================================================
# ENFORCEMENT — the audit is not a step someone has to remember to call
# ==================================================================================================

class GuardEnforcementCase(unittest.TestCase):
    def setUp(self):
        self.root = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.root, True)
        self.lock = os.path.join(self.root, "runs", ".lock")
        os.makedirs(os.path.join(self.root, "out", "review"), exist_ok=True)
        self.video = os.path.join(self.root, "out", "episode.mp4")
        with open(self.video, "wb") as fh:
            fh.write(b"pretend-mp4-bytes")
        self.src = os.path.join(self.root, "content.py")
        with open(self.src, "w") as fh:
            fh.write("SCENES = []\n")
        with open(os.path.join(self.root, "out", "review", "verdict.json"), "w") as fh:
            json.dump({"decision": "approve"}, fh)
        upload_guard.stamp_review(self.video, root=self.root)

    def write_audit(self, **over):
        rec = {"verdict": "pass", "topic": "ftx", "video": "episode.mp4",
               "sha256": upload_guard.sha256_file(self.video),
               "sources": {"content.py": upload_guard.sha256_file(self.src)},
               "fails": [], "warns": []}
        rec.update(over)
        path = os.path.join(self.root, "out", "review", "prepublish_audit.json")
        with open(path, "w") as fh:
            json.dump(rec, fh)
        os.utime(path, (time.time() + 5, time.time() + 5))
        return path

    def reasons(self):
        return " ".join(upload_guard.check(self.video, root=self.root, lock=self.lock))


class TestGuardRequiresTheAudit(GuardEnforcementCase):
    def test_an_approved_render_with_no_audit_is_blocked(self):
        self.assertIn("NO PRE-PUBLISH AUDIT", self.reasons())
        with self.assertRaises(upload_guard.GuardError):
            upload_guard.assert_publishable(self.video, root=self.root, lock=self.lock)

    def test_a_failed_audit_is_blocked_and_says_why(self):
        self.write_audit(verdict="fail",
                         fails=["t169 narration: says Gary Wang \"still waiting\" — unsourced"])
        r = self.reasons()
        self.assertIn("pre-publish audit FAILED", r)
        self.assertIn("Gary Wang", r)

    def test_an_audit_of_different_bytes_is_blocked(self):
        self.write_audit(sha256="0" * 64)
        self.assertIn("STALE AUDIT", self.reasons())

    def test_an_audit_run_without_the_render_is_blocked(self):
        self.write_audit(sha256=None)
        self.assertIn("recorded no sha256", self.reasons())

    def test_editing_the_script_after_the_audit_is_blocked(self):
        """THE 2026-08-17 SHAPE. The mp4 does not change, so the reviewer's sha-bound approval
        still holds; only the audit's source hashes catch a mid-revision script edit."""
        self.write_audit()
        self.assertEqual(self.reasons(), "", "sanity: it should start clear")
        with open(self.src, "a") as fh:
            fh.write("\n# the revision agent's fix lands here\n")
        r = self.reasons()
        self.assertIn("content.py HAS CHANGED", r)
        self.assertIn("2026-08-17", r)

    def test_an_audit_from_a_previous_run_is_blocked(self):
        path = self.write_audit()
        old = time.time() - 7200
        os.utime(path, (old, old))
        os.utime(self.video, (time.time(), time.time()))
        self.assertIn("OLDER than the render", self.reasons())

    def test_an_audit_with_no_source_hashes_is_blocked(self):
        self.write_audit(sources={})
        self.assertIn("records no source hashes", self.reasons())

    def test_an_unreadable_audit_is_blocked(self):
        with open(os.path.join(self.root, "out", "review", "prepublish_audit.json"), "w") as fh:
            fh.write("{not json")
        self.assertIn("unreadable", self.reasons())

    def test_approval_plus_a_passing_audit_publishes(self):
        self.write_audit()
        self.assertEqual(upload_guard.check(self.video, root=self.root, lock=self.lock), [])
        upload_guard.assert_publishable(self.video, root=self.root, lock=self.lock)   # no raise

    def test_the_short_is_not_asked_to_match_the_episodes_sha(self):
        """The Short is cut FROM the approved episode, so it shares sources but not bytes.
        Requiring the episode's sha256 would block the Shorts path on an impossible condition."""
        short = os.path.join(self.root, "out", "short.mp4")
        with open(short, "wb") as fh:
            fh.write(b"a-different-shorter-render")
        upload_guard.stamp_review(short, root=self.root)
        with open(os.path.join(self.root, "out", "review", "short_verdict.json"), "w") as fh:
            json.dump({"decision": "approve"}, fh)
        self.write_audit()
        reasons = upload_guard.check(short, root=self.root, lock=self.lock)
        self.assertEqual(reasons, [], f"the Short should publish on the episode's audit: {reasons}")


class TestHandRunUploadCannotSkipTheAudit(unittest.TestCase):
    """The 2026-08-17 incident was a HAND-RUN yt_upload.py. Prove the real script refuses."""

    def setUp(self):
        self.root = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.root, True)
        os.makedirs(os.path.join(self.root, "scripts"))
        os.makedirs(os.path.join(self.root, "out", "review"))
        for f in ("yt_upload.py", "upload_guard.py"):
            shutil.copy(os.path.join(ROOT, "scripts", f), os.path.join(self.root, "scripts", f))
        self.video = os.path.join(self.root, "out", "episode.mp4")
        with open(self.video, "wb") as fh:
            fh.write(b"pretend-mp4-bytes")
        subprocess.run([sys.executable, os.path.join(self.root, "scripts", "upload_guard.py"),
                        "stamp", self.video], check=True, capture_output=True, cwd=self.root)
        with open(os.path.join(self.root, "out", "review", "verdict.json"), "w") as fh:
            json.dump({"decision": "approve"}, fh)

    def test_a_hand_run_public_upload_is_refused_without_an_audit(self):
        p = subprocess.run([sys.executable, os.path.join(self.root, "scripts", "yt_upload.py"),
                            self.video, "--privacy", "public"],
                           capture_output=True, text=True, cwd=self.root, timeout=120)
        self.assertEqual(p.returncode, 3, p.stdout + p.stderr)
        self.assertIn("REFUSING TO PUBLISH", p.stdout)
        self.assertIn("NO PRE-PUBLISH AUDIT", p.stdout)
        # it never authorized, so no socket was ever opened
        self.assertNotIn("NOT AUTHORIZED", p.stdout)
        self.assertNotIn("uploading:", p.stdout)


if __name__ == "__main__":
    unittest.main()
