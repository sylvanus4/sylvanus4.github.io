#!/usr/bin/env python3
"""tech-extra.json 카드용 썸네일을 2i 원본과 같은 청사진 스타일로 그린다.
밝은 종이 위 도면이라 사이트에서는 CSS invert 필터가 다크로 뒤집는다.
사용: python3 tools/make_thumb.py"""

import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
CFG = ROOT / "assets/tech-extra.json"
OUT = ROOT / "tech/thumb"

W, H = 880, 495
PAPER = (247, 245, 240)
GRID = (222, 219, 212)
INK = (74, 88, 110)
WARM = (214, 145, 60)


def draw(seed: str) -> Image.Image:
    rnd = int(hashlib.sha256(seed.encode()).hexdigest()[:8], 16)
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)

    for x in range(60, W - 40, 74):
        d.line([(x, 42), (x, H - 42)], fill=GRID, width=1)
    for y in range(42, H - 40, 74):
        d.line([(60, y), (W - 46, y)], fill=GRID, width=1)

    # 랭킹 막대 다섯 줄. 길이는 시드에서 뽑아 결정론적으로 나온다.
    top, gap = 116, 62
    for i in range(5):
        v = (rnd >> (i * 5)) % 100
        w = int(190 + v * 4.4)
        y = top + i * gap
        d.rectangle([150, y, 150 + w, y + 30], outline=INK, width=2)
        # 상위 두 줄만 강조해 "순위" 라는 뜻이 읽히게
        if i < 2:
            d.rectangle([152, y + 2, 152 + int(w * 0.42), y + 28], fill=WARM)
        d.rectangle([104, y + 7, 134, y + 23], outline=INK, width=2)

    d.line([(150, top - 22), (W - 90, top - 22)], fill=INK, width=2)
    return im


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    for c in cfg.get("cards", []):
        # 저장소 이름 자체가 공개면에 실리면 안 되는 카드가 있다(회사 제품명 등).
        # 그런 카드는 key 로 중립 슬러그를 준다.
        ident = c.get("key") or c["repo"]
        p = OUT / f'{ident.replace("/", "__")}.png'
        draw(ident).save(p, "PNG", optimize=True)
        print(f"  {p.name}  {p.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()
