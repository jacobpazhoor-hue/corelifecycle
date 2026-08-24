"""thumb_check.py — the pre-render guard on `thumb.kicker` vs the archetype that will draw it.

The pair it catches killed three consecutive nightly cloud renders of the `ftx` episode, ~40 minutes
each, on a combination readable straight out of ops/episode_meta.json. These tests assert the guard
fires on that pair, stays quiet on the pairs that render, and keeps its two derived sets tied to
src/thumbs.tsx rather than to a second copy of the names.
"""
import unittest

import thumb_check


class ArchetypeSets(unittest.TestCase):
    """Both sets are READ from src/thumbs.tsx, so they cannot drift from the renderer."""

    def setUp(self):
        self.order, self.kickerless = thumb_check.arch_sets()

    def test_order_is_the_arches_map(self):
        # ORDER in thumbs.tsx is Object.keys(ARCHES); the hash fallback indexes into it, so both the
        # membership AND the order are load-bearing.
        self.assertEqual(self.order, ["band", "crash", "setting", "wordmark", "beforeafter",
                                      "poster", "number", "question", "ladder"])

    def test_exactly_two_layouts_have_no_kicker_slot(self):
        self.assertEqual(self.kickerless, {"wordmark", "beforeafter"})

    def test_kickerless_is_a_subset_of_the_archetypes(self):
        self.assertTrue(self.kickerless.issubset(set(self.order)))

    def test_source_is_parsed_not_hardcoded(self):
        # A thumbs.tsx that cannot be read must HALT, never fall through to a stale built-in list.
        real = thumb_check.THUMBS
        thumb_check.THUMBS = real + ".does-not-exist"
        try:
            with self.assertRaises(thumb_check.ThumbParseError):
                thumb_check.arch_sets()
        finally:
            thumb_check.THUMBS = real


class ResolveArchetype(unittest.TestCase):
    """A port of pickName(): declared name if it is a key of ARCHES, else a topic hash."""

    def setUp(self):
        self.order, _ = thumb_check.arch_sets()

    def test_declared_archetype_wins(self):
        meta = {"topic": "ftx", "thumb": {"archetype": "poster"}}
        self.assertEqual(thumb_check.resolve_archetype(meta, self.order), ("poster", False))

    def test_unknown_name_falls_back_to_the_topic_hash(self):
        # Cross-checked against node running thumbs.tsx's own expression:
        #   let h = 0; for (const c of topic) h = (h * 31 + c.charCodeAt(0)) >>> 0;
        # These vectors include topics whose hash exceeds 2^31, where a signed port would diverge.
        for topic, expected in [("ftx", "setting"), ("x", "wordmark"), ("theranos", "question"),
                                ("madoff", "band"), ("ENRON COLLAPSE", "number"),
                                ("zz9", "beforeafter"), ("ABCdef", "wordmark")]:
            with self.subTest(topic=topic):
                meta = {"topic": topic, "thumb": {"archetype": "notAnArchetype"}}
                self.assertEqual(thumb_check.resolve_archetype(meta, self.order), (expected, True))

    def test_missing_topic_falls_back_to_uppercased_line1(self):
        meta = {"thumb": {"line1": "to zero"}}
        by_line1 = thumb_check.resolve_archetype(meta, self.order)
        by_topic = thumb_check.resolve_archetype({"topic": "TO ZERO", "thumb": {}}, self.order)
        self.assertEqual(by_line1, by_topic)


class Check(unittest.TestCase):

    def _meta(self, archetype, kicker):
        return {"topic": "ftx", "thumb": {"archetype": archetype, "kicker": kicker,
                                          "line1": "TO ZERO", "tag": "TEN DAYS."}}

    def test_fires_on_the_pair_that_killed_three_renders(self):
        fails, _ = thumb_check.check(self._meta("beforeafter", "$32 BILLION"))
        self.assertEqual(len(fails), 1)
        self.assertIn("beforeafter", fails[0])
        self.assertIn("$32 BILLION", fails[0])
        # The message must name the fix that PRESERVES the rotation, not just "change archetype".
        self.assertIn("clear thumb.kicker", fails[0])

    def test_fires_on_wordmark_too(self):
        fails, _ = thumb_check.check(self._meta("wordmark", "ONE LINE"))
        self.assertEqual(len(fails), 1)

    def test_passes_once_the_kicker_is_cleared(self):
        for kicker in ("", "   "):
            with self.subTest(kicker=repr(kicker)):
                self.assertEqual(thumb_check.check(self._meta("beforeafter", kicker))[0], [])

    def test_a_valid_archetype_plus_kicker_pair_still_passes(self):
        order, kickerless = thumb_check.arch_sets()
        for name in [k for k in order if k not in kickerless]:
            with self.subTest(archetype=name):
                fails, warns = thumb_check.check(self._meta(name, "$32 BILLION"))
                self.assertEqual(fails, [])
                self.assertEqual(warns, [])

    def test_unknown_archetype_hashing_onto_a_kickerless_layout_is_caught(self):
        # The trap a naive `meta.thumb.archetype in KICKERLESS` check would walk straight past: the
        # declared name is not kickerless because it is not an archetype at all, and the hash lands
        # on one that is.
        meta = {"topic": "zz9", "thumb": {"archetype": "beforeAfter", "kicker": "$32 BILLION"}}
        fails, warns = thumb_check.check(meta)
        self.assertEqual(len(fails), 1)
        self.assertIn("beforeafter", fails[0])
        self.assertIn("hashed from topic", fails[0])
        self.assertEqual(len(warns), 1)          # and the broken rotation is reported separately

    def test_unknown_archetype_alone_warns_but_does_not_halt(self):
        # It renders (the hash picks a real layout); what it breaks is the rotation, not the build.
        fails, warns = thumb_check.check({"topic": "ftx", "thumb": {"archetype": "pov", "kicker": ""}})
        self.assertEqual(fails, [])
        self.assertEqual(len(warns), 1)
        self.assertIn("pov", warns[0])

    def test_the_shipping_episode_on_disk_can_render(self):
        fails, _ = thumb_check.check()
        self.assertEqual(fails, [], "ops/episode_meta.json would HALT the Thumbnail render")


if __name__ == "__main__":
    unittest.main()
