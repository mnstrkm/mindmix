"""Reproduce the repository's own MindMix mark as local PNG app icons."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent.parent / 'public'
for size in (192, 512):
    scale = 4
    canvas = Image.new('RGB', (512 * scale, 512 * scale), '#173e37')
    draw = ImageDraw.Draw(canvas)
    draw.line([(138 * scale, 355 * scale), (138 * scale, 170 * scale), (256 * scale, 288 * scale), (374 * scale, 170 * scale), (374 * scale, 355 * scale)], fill='#f6f5f0', width=40 * scale, joint='curve')
    draw.ellipse((328 * scale, 76 * scale, 402 * scale, 150 * scale), fill='#e7b872')
    canvas.resize((size, size), Image.Resampling.LANCZOS).save(root / f'icon-{size}.png')
