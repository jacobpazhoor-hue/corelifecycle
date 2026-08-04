import os, tempfile, unittest
from unittest import mock
from gen_scene_images import build_prompt, scene_seed, asset_paths, fetch_image

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

JPEG = b"\xff\xd8\xff\xe0" + b"\x00" * 64  # JPEG magic + filler

class TestFetch(unittest.TestCase):
    def test_success_writes_file(self):
        resp = mock.Mock(status_code=200, content=JPEG)
        out = os.path.join(tempfile.mkdtemp(), "t01.jpg")
        ok = fetch_image("p", 123, {"width":1280,"height":720,"model":"flux"}, out,
                         _get=lambda *a, **k: resp)
        self.assertTrue(ok)
        self.assertTrue(os.path.exists(out))

    def test_non_jpeg_is_rejected(self):
        resp = mock.Mock(status_code=200, content=b"<html>error</html>")
        out = os.path.join(tempfile.mkdtemp(), "t01.jpg")
        ok = fetch_image("p", 1, {"width":1,"height":1,"model":"flux"}, out,
                         retries=1, _get=lambda *a, **k: resp)
        self.assertFalse(ok)
        self.assertFalse(os.path.exists(out))

    def test_retries_then_gives_up(self):
        calls = {"n": 0}
        def boom(*a, **k):
            calls["n"] += 1
            raise __import__("requests").RequestException("net")
        with mock.patch("gen_scene_images.time.sleep", lambda *_: None):
            ok = fetch_image("p", 1, {"width":1,"height":1,"model":"flux"}, "/tmp/x.jpg",
                             retries=3, _get=boom)
        self.assertFalse(ok)
        self.assertEqual(calls["n"], 3)
