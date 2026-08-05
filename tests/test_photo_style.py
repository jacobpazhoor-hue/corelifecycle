import json, os, tempfile, unittest
from photo_style import load_style, DEFAULTS

class TestLoadStyle(unittest.TestCase):
    def test_missing_file_returns_defaults(self):
        s = load_style("/no/such/file.json")
        self.assertEqual(s["visualMode"], "doodle")
        self.assertIn("styleSuffix", s)

    def test_invalid_json_returns_defaults(self):
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
            f.write("{not json")
            p = f.name
        self.assertEqual(load_style(p)["model"], DEFAULTS["model"])

    def test_partial_override_merges_over_defaults(self):
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
            json.dump({"visualMode": "photo", "model": "flux"}, f)
            p = f.name
        s = load_style(p)
        self.assertEqual(s["visualMode"], "photo")
        self.assertEqual(s["povRules"], DEFAULTS["povRules"])  # default preserved

    def test_non_object_json_returns_defaults(self):
        import tempfile, json as _j
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
            _j.dump([1, 2, 3], f); p = f.name
        self.assertEqual(load_style(p)["visualMode"], "doodle")
