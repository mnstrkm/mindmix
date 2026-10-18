"""Reproduce the repository's own MindMix mark as local PNG app icons."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent.parent / 'public'
for size in (192, 512):
    scale = 4
    canvas = Image.new('RGB', (512 * scale, 512 * scale), '#182c2d')
    draw = ImageDraw.Draw(canvas)
    draw.line([(133 * scale, 355 * scale), (133 * scale, 154 * scale), (256 * scale, 290 * scale), (379 * scale, 154 * scale), (379 * scale, 355 * scale)], fill='#91dec3', width=42 * scale, joint='curve')
    canvas.resize((size, size), Image.Resampling.LANCZOS).save(root / f'icon-{size}.png')
