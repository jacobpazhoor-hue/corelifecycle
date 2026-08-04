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
        def fake_backend(jobs, style):
            from PIL import Image
            ok = {}
            for j in jobs:
                os.makedirs(os.path.dirname(j["out"]), exist_ok=True)
                Image.new("RGB",(8,8),(50,50,50)).save(j["out"])
                ok[j["sid"]] = True
            return ok
        m = generate_all(scenes, "vc", self._style(), backend=fake_backend)
        self.assertEqual(m["mode"], "photo")
        self.assertEqual(set(m["scenes"]), {"t01","t02","t03"})
        self.assertEqual(m["scenes"]["t01"]["move"], "pushIn")
        self.assertEqual(m["scenes"]["t02"]["move"], "parallaxPan")
        self.assertEqual(m["scenes"]["t03"]["move"], "pushIn")  # wraps
        self.assertEqual(m["fallback"], [])

    def test_failed_scene_goes_to_fallback(self):
        scenes = [{"id":"t01","template":"a"},{"id":"t02","template":"b"}]
        def flaky_backend(jobs, style):
            from PIL import Image
            ok = {}
            for j in jobs:
                if j["sid"] == "t02":
                    ok[j["sid"]] = False
                    continue
                os.makedirs(os.path.dirname(j["out"]), exist_ok=True)
                Image.new("RGB",(8,8),(9,9,9)).save(j["out"])
                ok[j["sid"]] = True
            return ok
        m = generate_all(scenes, "vc", self._style(), backend=flaky_backend)
        self.assertIn("t01", m["scenes"])
        self.assertNotIn("t02", m["scenes"])
        self.assertEqual(m["fallback"], ["t02"])

    def test_cached_skip_batches_uncached_only_and_reports_fallback(self):
        """Batched backend: a scene already cached on disk must NOT be sent as a job, moves wrap
        by scene index (not job index), and sids the backend reports False -> fallback."""
        scenes = [{"id":"t01","template":"a"},{"id":"t02","template":"b"},
                  {"id":"t03","template":"c"},{"id":"t04","template":"d"}]
        ap = asset_paths("vc", "t01")
        os.makedirs(ap["dir"], exist_ok=True)
        from PIL import Image
        Image.new("RGB",(8,8),(1,1,1)).save(ap["img"])  # pre-seed t01 as already cached

        seen_sids = []
        def fake_backend(jobs, style):
            ok = {}
            for j in jobs:
                seen_sids.append(j["sid"])
                if j["sid"] == "t04":
                    ok[j["sid"]] = False
                    continue
                os.makedirs(os.path.dirname(j["out"]), exist_ok=True)
                Image.new("RGB",(8,8),(2,2,2)).save(j["out"])
                ok[j["sid"]] = True
            return ok

        m = generate_all(scenes, "vc", self._style(), backend=fake_backend)
        self.assertNotIn("t01", seen_sids)  # cached scene never entered the batch
        self.assertEqual(set(seen_sids), {"t02", "t03", "t04"})
        self.assertEqual(set(m["scenes"]), {"t01", "t02", "t03"})
        self.assertEqual(m["fallback"], ["t04"])
        self.assertEqual(m["scenes"]["t01"]["move"], "pushIn")       # index 0
        self.assertEqual(m["scenes"]["t02"]["move"], "parallaxPan")  # index 1
        self.assertEqual(m["scenes"]["t03"]["move"], "pushIn")       # index 2 wraps

    def test_backend_raises_sends_all_uncached_to_fallback(self):
        """Total backend failure is non-fatal: it must not propagate and every uncached scene
        goes to fallback instead."""
        scenes = [{"id":"t01","template":"a"},{"id":"t02","template":"b"}]
        def boom_backend(jobs, style):
            raise RuntimeError("modal down")
        m = generate_all(scenes, "vc", self._style(), backend=boom_backend)
        self.assertEqual(m["scenes"], {})
        self.assertEqual(set(m["fallback"]), {"t01", "t02"})

class TestLocalSdxlDispatch(unittest.TestCase):
    """generate_all must dispatch to local_sdxl_backend when style['backend'] == 'local_sdxl'.
    Hermetic: patches gen_scene_images.local_sdxl_backend with a fake so no model/MPS is touched."""
    def tearDown(self):
        import shutil
        base = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "images", "vc")
        if os.path.exists(base):
            shutil.rmtree(base)

    def test_local_sdxl_backend_string_selects_local_sdxl_backend(self):
        import gen_scene_images as g
        scenes = [{"id": "t01", "template": "a"}, {"id": "t02", "template": "b"}]
        style = {"visualMode": "photo", "model": "flux", "backend": "local_sdxl",
                 "width": 8, "height": 8, "styleSuffix": "S", "povRules": "P",
                 "moves": ["pushIn"]}
        calls = []
        def fake_local_sdxl_backend(jobs, style):
            from PIL import Image
            calls.append([j["sid"] for j in jobs])
            ok = {}
            for j in jobs:
                os.makedirs(os.path.dirname(j["out"]), exist_ok=True)
                Image.new("RGB", (8, 8), (7, 7, 7)).save(j["out"])
                ok[j["sid"]] = True
            return ok
        with mock.patch.object(g, "local_sdxl_backend", fake_local_sdxl_backend):
            m = g.generate_all(scenes, "vc", style)  # backend=None -> must dispatch by style
        self.assertEqual(calls, [["t01", "t02"]])
        self.assertEqual(set(m["scenes"]), {"t01", "t02"})
        self.assertEqual(m["fallback"], [])

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

class TestEffectiveMode(unittest.TestCase):
    def test_routine_visualmode_overrides_style(self):
        import gen_scene_images as g, tempfile, json as _j
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
            _j.dump({"visualMode": "photo"}, f); p = f.name
        self.assertEqual(g.effective_mode({"visualMode": "doodle"}, routine_path=p), "photo")
    def test_falls_back_to_style_when_routine_missing(self):
        import gen_scene_images as g
        self.assertEqual(g.effective_mode({"visualMode": "doodle"}, routine_path="/no/such/file.json"), "doodle")
    def test_falls_back_when_routine_has_no_visualmode(self):
        import gen_scene_images as g, tempfile, json as _j
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
            _j.dump({"autoUpload": True}, f); p = f.name
        self.assertEqual(g.effective_mode({"visualMode": "doodle"}, routine_path=p), "doodle")
