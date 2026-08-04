import numpy as np
from PIL import Image, ImageFilter

def make_depth(img_path, depth_path):
    """Fast synthesized monocular depth: vertical gradient (bottom = near) blended with
    blurred luminance (bright/large foreground reads nearer). No model download; ~ms/frame.
    Good enough for 2.5D parallax; swap for Depth Anything V2 later (see plan Task 10)."""
    im = Image.open(img_path).convert("L")
    w, h = im.size
    grad = np.tile(np.linspace(0, 255, h, dtype=np.float32)[:, None], (1, w))
    lum = np.asarray(im.filter(ImageFilter.GaussianBlur(8)), dtype=np.float32)
    depth = (0.6 * grad + 0.4 * lum).clip(0, 255).astype(np.uint8)
    Image.fromarray(depth, mode="L").save(depth_path)
    return depth_path
