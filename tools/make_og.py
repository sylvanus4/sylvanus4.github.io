#!/usr/bin/env python3
"""OG 이미지 생성기. 사이트 팔레트를 그대로 쓴다.
사용: python3 tools/make_og.py  ->  assets/img/og.png (1200x630)"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "img" / "og.png"
OUT.parent.mkdir(parents=True, exist_ok=True)

W, H = 1200, 630
BG = (13, 17, 25)
CY = (127, 216, 232)
VI = (192, 142, 240)
FG = (242, 244, 248)
FG3 = (150, 158, 172)
LINE = (44, 52, 68)

FONTS = [Path.home() / "Library/Fonts", Path("/Library/Fonts"), Path("/System/Library/Fonts/Supplemental")]


def font(names, size):
    for d in FONTS:
        for n in names:
            p = d / n
            if p.exists():
                try:
                    return ImageFont.truetype(str(p), size)
                except Exception:
                    pass
    return ImageFont.load_default()


f_hero = font(["Pretendard-Bold.otf", "AppleGothic.ttf"], 72)
f_name = font(["Pretendard-SemiBold.otf", "AppleGothic.ttf"], 30)
f_body = font(["Pretendard-Regular.otf", "AppleGothic.ttf"], 25)
f_mono = font(["HackNerdFont-Regular.ttf", "D2Coding-Ver1.3.2-20180524-all.ttc"], 21)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img, "RGBA")

# 코너 글로우
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse([-260, -340, 700, 420], fill=(127, 216, 232, 26))
gd.ellipse([700, 250, 1560, 1000], fill=(192, 142, 240, 30))
glow = glow.filter(ImageFilter.GaussianBlur(110))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
d = ImageDraw.Draw(img, "RGBA")

# 스택 레이어 다섯 장 (사이트 3D 씬의 평면 은유)
for i in range(5):
    y = 168 + i * 92
    inset = 74 + i * 16
    a = 190 - i * 26
    col = (
        int(CY[0] + (VI[0] - CY[0]) * i / 4),
        int(CY[1] + (VI[1] - CY[1]) * i / 4),
        int(CY[2] + (VI[2] - CY[2]) * i / 4),
    )
    d.polygon(
        [(W - inset - 330, y), (W - inset, y - 30), (W - inset, y + 12), (W - inset - 330, y + 42)],
        outline=col + (a,),
        width=2,
    )

# 관통하는 코어 빔
d.line([(W - 246, 96), (W - 246, 560)], fill=CY + (110,), width=2)

# 텍스트
x = 78
d.text((x, 118), "HYOJUNG HAN  ·  AI SYSTEMS ENGINEER", font=f_mono, fill=CY)
d.text((x, 176), "연구에서 배포까지,", font=f_hero, fill=FG)
d.text((x, 262), "한 사람이 관통합니다", font=f_hero, fill=FG)

d.line([(x, 386), (x + 108, 386)], fill=LINE, width=2)

d.text((x, 416), "모델 · 학습/추론 인프라 · 클라우드 플랫폼 · 제품", font=f_body, fill=FG3)
d.text((x, 456), "Daum → 삼성전자 → Toss → 2i Studio → ThakiCloud", font=f_body, fill=FG3)

d.text((x, 534), "한효정", font=f_name, fill=FG)
d.text((x + 92, 540), "sylvanus4.github.io", font=f_mono, fill=CY)

img.save(OUT, "PNG", optimize=True)
print(f"wrote {OUT}  {OUT.stat().st_size // 1024}KB")
