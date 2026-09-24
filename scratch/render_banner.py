import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

# Load clean ribbon and knot
ref_path = 'scratch_clean_ref.png'
knot_path = 'scratch_gathbandhan_processed.png'

knot = Image.open(knot_path).convert('RGBA')

W, H = 1440, 460
canvas = Image.new('RGBA', (W, H), (248, 245, 240, 255)) # Warm fine art paper background

# Generate top and bottom wave curves matching reference image 1
xs = np.linspace(0, W, 240)
# Top wave centered around y=68, subtle organic ripples
top_ys = 68 + 8 * np.sin(xs * 2 * np.pi / W * 3) + 4 * np.cos(xs * 2 * np.pi / W * 5)
# Bottom wave centered around y=390, subtle organic ripples
bot_ys = 390 + 7 * np.sin(xs * 2 * np.pi / W * 3.5 + 1.2) + 5 * np.cos(xs * 2 * np.pi / W * 2)

poly_pts = []
for x, y in zip(xs, top_ys):
    poly_pts.append((float(x), float(y)))
for x, y in zip(reversed(xs), reversed(bot_ys)):
    poly_pts.append((float(x), float(y)))

ribbon_mask = Image.new('L', (W, H), 0)
poly_draw = ImageDraw.Draw(ribbon_mask)
poly_draw.polygon(poly_pts, fill=255)
ribbon_mask = ribbon_mask.filter(ImageFilter.GaussianBlur(1))

# Red ribbon layer with rich royal crimson #891212
ribbon_layer = Image.new('RGBA', (W, H), (137, 18, 18, 255))

# Subtle radial warmth highlight in center
radial = Image.new('L', (W, H), 0)
r_draw = ImageDraw.Draw(radial)
for radius in range(550, 0, -10):
    alpha = int(30 * (1 - radius / 550.0))
    r_draw.ellipse([(W//2 - int(radius*1.6), H//2 - radius), (W//2 + int(radius*1.6), H//2 + radius)], fill=alpha)
radial_glow = Image.new('RGBA', (W, H), (255, 235, 205, 0))
radial_glow.putalpha(radial)
ribbon_layer = Image.alpha_composite(ribbon_layer, radial_glow)

# Subtle shadow underneath bottom wave
shadow_mask = ribbon_mask.filter(ImageFilter.GaussianBlur(10))
shadow_layer = Image.new('RGBA', (W, H), (40, 20, 15, 55))
canvas.paste(shadow_layer, (0, 5), shadow_mask)
canvas.paste(ribbon_layer, (0, 0), ribbon_mask)

# Knot placement: width ~240px
kw = 240
kh = int(knot.height * (kw / knot.width))
k_resized = knot.resize((kw, kh), Image.Resampling.LANCZOS)

kx = (W - kw) // 2
ky = 42 # Gracefully rests over top wave

# Knot shadow
k_shadow = Image.new('RGBA', (kw + 30, kh + 30), (0, 0, 0, 0))
k_alpha = k_resized.split()[-1]
k_shadow_color = Image.new('RGBA', k_resized.size, (0, 0, 0, 140))
k_shadow.paste(k_shadow_color, (15, 18), k_alpha)
k_shadow = k_shadow.filter(ImageFilter.GaussianBlur(8))

canvas.alpha_composite(k_shadow, (kx - 15, ky - 10))
canvas.alpha_composite(k_resized, (kx, ky))

# Typography:
try:
    font_quote_mark = ImageFont.truetype('C:/Windows/Fonts/georgiai.ttf', 52)
    font_text = ImageFont.truetype('C:/Windows/Fonts/georgiai.ttf', 31)
    font_author = ImageFont.truetype('C:/Windows/Fonts/calibrib.ttf', 16)
except Exception:
    font_quote_mark = ImageFont.load_default()
    font_text = ImageFont.load_default()
    font_author = ImageFont.load_default()

c_draw = ImageDraw.Draw(canvas)

# 1. Quote mark
q_mark = '“'
qm_bbox = c_draw.textbbox((0, 0), q_mark, font=font_quote_mark)
qm_w = qm_bbox[2] - qm_bbox[0]
qm_y = ky + kh - 12
c_draw.text(((W - qm_w) // 2, qm_y), q_mark, font=font_quote_mark, fill=(255, 245, 230, 145))

# 2. Quote text
quote_text = 'Every love story deserves to be remembered, beautifully and forever.'
qt_bbox = c_draw.textbbox((0, 0), quote_text, font=font_text)
qt_w = qt_bbox[2] - qt_bbox[0]
qt_y = qm_y + 40

# Shadow
c_draw.text(((W - qt_w) // 2 + 1, qt_y + 2), quote_text, font=font_text, fill=(0, 0, 0, 120))
# Crisp luminous ivory
c_draw.text(((W - qt_w) // 2, qt_y), quote_text, font=font_text, fill=(255, 246, 235, 255))

# 3. Attribution
author_text = '—   Y O U   &   M E   A T E L I E R'
at_bbox = c_draw.textbbox((0, 0), author_text, font=font_author)
at_w = at_bbox[2] - at_bbox[0]
at_y = qt_y + 54
c_draw.text(((W - at_w) // 2, at_y), author_text, font=font_author, fill=(255, 240, 225, 215))

# 4. Heart seal at bottom wave edge
seal_x = W // 2 + 195
seal_y = int(390 + 7 * np.sin(seal_x * 2 * np.pi / W * 3.5 + 1.2) + 5 * np.cos(seal_x * 2 * np.pi / W * 2))
seal_r = 16
c_draw.ellipse([(seal_x - seal_r, seal_y - seal_r), (seal_x + seal_r, seal_y + seal_r)], fill=(250, 245, 238, 255), outline=(197, 160, 89, 200), width=1)
# Inner ring
c_draw.ellipse([(seal_x - seal_r + 2, seal_y - seal_r + 2), (seal_x + seal_r - 2, seal_y + seal_r - 2)], fill=None, outline=(197, 160, 89, 100), width=1)

# Heart symbol
try:
    font_heart = ImageFont.truetype('C:/Windows/Fonts/seguiemj.ttf', 15)
    c_draw.text((seal_x - 7, seal_y - 10), '♥', font=font_heart, fill=(137, 18, 18, 255))
except Exception:
    c_draw.ellipse([(seal_x - 4, seal_y - 4), (seal_x + 4, seal_y + 4)], fill=(137, 18, 18, 255))

out_path1 = r'C:\Users\Shreyam\.gemini\antigravity-ide\brain\6a6d17e2-a53c-4a51-9a5e-76d6a2684e91\gathbandhan_banner_preview.png'
out_path2 = r'public\assets\decorations\gathbandhan_banner_preview.png'
canvas.save(out_path1)
canvas.save(out_path2)
print('Successfully saved gathbandhan_banner_preview.png to artifacts and public assets!')
