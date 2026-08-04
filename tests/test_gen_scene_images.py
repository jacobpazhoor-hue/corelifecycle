import unittest
from gen_scene_images import build_prompt, scene_seed, asset_paths

class TestHelpers(unittest.TestCase):
    def test_build_prompt_uses_visual_then_style(self):
        style = {"styleSuffix": "STYLE", "povRules": "POV"}
        p = build_prompt({"visual": "a neon alley at night", "template": "neonAlley"}, style)
        self.assertIn("a neon alley at night", p)
        self.assertIn("POV", p)
        self.assertIn("STYLE", p)

    def test_build_prompt_falls_back_to_template(self):
        style = {"styleSuffix": "S", "povRules": "P"}
        p = build_prompt({"template": "warRoom"}, style)
        self.assertIn("warRoom", p)

    def test_scene_seed_is_deterministic(self):
        self.assertEqual(scene_seed("vc", "t01"), scene_seed("vc", "t01"))
        self.assertNotEqual(scene_seed("vc", "t01"), scene_seed("vc", "t02"))

    def test_asset_paths_shape(self):
        ap = asset_paths("vc", "t01")
        self.assertTrue(ap["img"].endswith("public/images/vc/t01.jpg"))
        self.assertEqual(ap["rel_img"], "images/vc/t01.jpg")
        self.assertEqual(ap["rel_depth"], "images/vc/t01.depth.png")
