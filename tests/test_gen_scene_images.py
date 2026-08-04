import os, tempfile, unittest, json
from unittest import mock
from gen_scene_images import build_prompt, scene_seed, asset_paths, fetch_image, generate_all

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

class TestGenerateAll(unittest.TestCase):
    def _style(self):
        return {"visualMode":"photo","model":"flux","width":8,"height":8,
                "styleSuffix":"S","povRules":"P","moves":["pushIn","parallaxPan"]}

    def tearDown(self):
        import shutil
        base = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "images", "vc")
        if os.path.exists(base):
            shutil.rmtree(base)

    def test_all_ok_builds_manifest_with_moves(self):
        scenes = [{"id":"t01","template":"a"},{"id":"t02","template":"b"},{"id":"t03","template":"c"}]
        def fake_fetch(prompt, seed, style, out, **k):
            from PIL import Image; os.makedirs(os.path.dirname(out), exist_ok=True)
            Image.new("RGB",(8,8),(50,50,50)).save(out); return True
        m = generate_all(scenes, "vc", self._style(), fetch=fake_fetch)
        self.assertEqual(m["mode"], "photo")
        self.assertEqual(set(m["scenes"]), {"t01","t02","t03"})
        self.assertEqual(m["scenes"]["t01"]["move"], "pushIn")
        self.assertEqual(m["scenes"]["t02"]["move"], "parallaxPan")
        self.assertEqual(m["scenes"]["t03"]["move"], "pushIn")  # wraps
        self.assertEqual(m["fallback"], [])

    def test_failed_scene_goes_to_fallback(self):
        scenes = [{"id":"t01","template":"a"},{"id":"t02","template":"b"}]
        def flaky(prompt, seed, style, out, **k):
            if "t02" in out:  # asset path carries sid
                return False
            from PIL import Image; os.makedirs(os.path.dirname(out), exist_ok=True)
            Image.new("RGB",(8,8),(9,9,9)).save(out); return True
        m = generate_all(scenes, "vc", self._style(), fetch=flaky)
        self.assertIn("t01", m["scenes"])
        self.assertNotIn("t02", m["scenes"])
        self.assertEqual(m["fallback"], ["t02"])

class TestMainNonFatal(unittest.TestCase):
    def test_main_does_not_raise_and_writes_safe_manifest_on_error(self):
        import gen_scene_images as g
        mpath = os.path.join(g.ROOT, "src", "photo_manifest.json")
        backup = open(mpath).read() if os.path.exists(mpath) else None
        try:
            with mock.patch.object(g, "load_style", return_value={
                     "visualMode": "photo", "model": "flux", "width": 8, "height": 8,
                     "styleSuffix": "S", "povRules": "P", "moves": ["pushIn"]}), \
                 mock.patch.object(g, "generate_all", side_effect=RuntimeError("boom")):
                g.main()  # must NOT raise
            m = json.load(open(mpath))
            self.assertEqual(m, {"mode": "doodle", "scenes": {}, "fallback": []})
        finally:
            if backup is not None:
                open(mpath, "w").write(backup)
