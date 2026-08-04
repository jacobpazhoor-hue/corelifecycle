import os, tempfile, unittest
from PIL import Image
from depth import make_depth

class TestDepth(unittest.TestCase):
    def test_depth_matches_size_and_is_grayscale(self):
        d = tempfile.mkdtemp()
        src = os.path.join(d, "src.jpg")
        Image.new("RGB", (320, 180), (120, 120, 120)).save(src)
        out = make_depth(src, os.path.join(d, "src.depth.png"))
        im = Image.open(out)
        self.assertEqual(im.mode, "L")
        self.assertEqual(im.size, (320, 180))

    def test_bottom_is_nearer_than_top(self):
        import numpy as np
        d = tempfile.mkdtemp()
        src = os.path.join(d, "s.jpg")
        Image.new("RGB", (64, 64), (100, 100, 100)).save(src)
        arr = np.asarray(Image.open(make_depth(src, os.path.join(d, "s.depth.png"))))
        self.assertGreater(arr[-1].mean(), arr[0].mean())  # bottom brighter/nearer
