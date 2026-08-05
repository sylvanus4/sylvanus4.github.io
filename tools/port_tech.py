#!/usr/bin/env python3
"""2i tech.html 의 기술 카탈로그를 포트폴리오로 이식한다.

내용은 그대로 두고 색만 바꾼다. 148KB 를 손으로 다시 쓰지 않는다:
  1) <main> 에서 카탈로그 본문만 뽑고 (2i 히어로/네비/푸터는 버린다)
  2) 그 본문이 쓰는 CSS 규칙만 2i styles.css 에서 추출해
  3) .tech2i 아래로 스코프하고 토큰을 포트폴리오 다크 팔레트로 갈아끼운다

재실행하면 소스 변경분이 그대로 반영된다.
"""

import re
from pathlib import Path

SRC = Path.home() / "thaki/2icorp-work/site"
DST = Path(__file__).resolve().parents[1]

# 이식 대상 클래스. 내 사이트와 이름이 겹치는 것(wrap/section/btn/eyebrow/nav/brand)은 뺀다.
OWN = ("pcard", "pboard", "fam", "famnav", "techsearch", "techboard", "reveal")
# 스코프 안에서 재정의가 필요한 유틸
EXTRA = ("u", "accent")


def take_main() -> str:
    t = (SRC / "tech.html").read_text(encoding="utf-8")
    main = re.search(r"<main[^>]*>(.*)</main>", t, re.S).group(1)
    # 2i 히어로 섹션 통째로 제거 — 내 페이지 헤더로 대체한다
    main = re.sub(r'<section class="section pboard-hero">.*?</section>\s*', "", main, flags=re.S)
    # 남은 껍데기 section/wrap 을 벗겨 카탈로그 알맹이만 남긴다
    m = re.search(r'(<nav class="famnav".*?)(?:</div>\s*)*</section>\s*$', main, re.S)
    body = m.group(1) if m else main
    return body.strip()


def selector_wanted(sel: str) -> bool:
    """이 선택자가 이식 대상 클래스를 건드리는가."""
    classes = set(re.findall(r"\.([A-Za-z0-9_-]+)", sel))
    if any(c.split("__")[0].split("--")[0] in OWN for c in classes):
        return True
    return bool(classes & set(EXTRA))


def take_css() -> str:
    css = (SRC / "styles.css").read_text(encoding="utf-8")
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)

    out, i, n = [], 0, len(css)
    while i < n:
        # @media 등 at-rule 블록은 통째로 훑어 내부 규칙만 골라 담는다
        at = re.match(r"\s*(@[a-zA-Z-]+[^{]*)\{", css[i:])
        if at:
            start = i + at.end()
            depth, j = 1, start
            while j < n and depth:
                if css[j] == "{":
                    depth += 1
                elif css[j] == "}":
                    depth -= 1
                j += 1
            inner = collect(css[start : j - 1])
            if inner.strip():
                out.append(f"{at.group(1).strip()} {{\n{inner}}}\n")
            i = j
            continue
        m = re.match(r"\s*([^{}@]+)\{([^{}]*)\}", css[i:])
        if not m:
            i += 1
            continue
        if selector_wanted(m.group(1)):
            out.append(rule(m.group(1), m.group(2)))
        i += m.end()
    return "".join(out)


def collect(block: str) -> str:
    out = []
    for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", block):
        if selector_wanted(m.group(1)):
            out.append(rule(m.group(1), m.group(2)))
    return "".join(out)


def rule(sel: str, decl: str) -> str:
    sels = []
    for s in sel.split(","):
        s = s.strip()
        if not s:
            continue
        # :root 등은 스코프 대상이 아니다
        sels.append(s if s.startswith((":root", "html", "@")) else f".tech2i {s}")
    return ",\n".join(sels) + " {" + decl.rstrip() + "}\n"


# 2i 토큰 -> 포트폴리오 다크 팔레트. 값 자체를 바꾸므로 본문 마크업은 손대지 않는다.
BRIDGE = """
/* ── 2i 카탈로그 이식 레이어 ────────────────────────────────────────────
   마크업과 규칙은 원본 그대로다. 이 블록이 토큰만 갈아끼워 색을 맞춘다.
   재생성: python3 tools/port_tech.py                                   */
.tech2i {
  --paper:      var(--bg);
  --paper-2:    var(--bg-2);
  --panel:      var(--bg-2);
  --ink:        var(--fg);
  --ink-soft:   var(--fg-2);
  --ink-faint:  var(--fg-3);
  --line:       var(--line-soft);
  --line-soft:  oklch(22% 0.018 265);
  --signal:     var(--cy);
  --signal-deep: var(--cy-deep);
  --steel:      var(--vi);
  --steel-soft: oklch(60% 0.09 285);
  --tint-signal: oklch(20% 0.03 220);
  --tint-signal-line: oklch(34% 0.05 220);
  /* 원본이 쓰는 타입 토큰 이름을 내 스케일로 이어준다.
     ⚠ --sans/--mono/--gutter/--section/--ease/--dur/--ok 은 이름이 같아 그냥 상속된다.
     같은 이름으로 재선언하면 var() 자기참조 = 순환이라 값이 통째로 무효가 된다. */
  --text-hero: var(--t-hero);
  --text-h2:   var(--t-h2);
  --text-h3:   var(--t-h3);
  --text-base: var(--t-body);
  --text-sm:   var(--t-sm);
  --text-xs:   var(--t-xs);
  --radius: 6px;
  color: var(--fg-2);
}
"""

# 원본이 밝은 배경을 전제로 쓴 몇 군데를 다크에서 읽히게 잡아준다.
PATCH = """
/* 밝은 배경을 전제로 한 몇 군데 보정 */
.tech2i .pcard { background: var(--panel); border-color: var(--line-soft); }
.tech2i .pcard:hover { border-color: var(--cy); background: var(--bg-3); }
.tech2i .pcard__title { color: var(--fg); }
.tech2i .pcard__excerpt, .tech2i .pcard__tags { color: var(--fg-3); }
.tech2i .pcard__cat, .tech2i .pcard__date, .tech2i .pcard__rt { color: var(--fg-4); }
.tech2i .pcard__go { color: var(--cy); }
.tech2i .fam__t { color: var(--fg); }
.tech2i .fam__d { color: var(--fg-3); }
.tech2i .fam__n { color: var(--cy); }
.tech2i .famnav__chip {
  border-color: var(--line); color: var(--fg-2); background: var(--bg-2);
}
.tech2i .famnav__chip:hover { border-color: var(--cy); color: var(--fg); }
.tech2i .famnav__n { color: var(--cy); }
.tech2i .famnav__k { color: var(--fg-4); }
.tech2i .techsearch__i {
  background: var(--bg-2); color: var(--fg);
  border: 1px solid var(--line); border-radius: 999px;
  min-height: 46px; padding: 0 1.1rem; width: min(100%, 34rem);
}
.tech2i .techsearch__i:focus-visible { border-color: var(--cy); outline: none; }
.tech2i .techsearch__l { color: var(--fg-3); display: block; margin-bottom: .5rem; font-size: .9rem; }
.tech2i .techsearch__n { color: var(--fg-4); font-family: var(--mono); font-size: .75rem; margin-left: .7rem; }
.tech2i .reveal { opacity: 1; transform: none; }
/* 썸네일은 밝은 종이 위에 그린 도면이라 다크 배경에서 흰 박스로 튄다.
   반전 후 hue-rotate 로 선 색을 되돌리는 표준 다크모드 처리를 쓴다.
   ⚠ 부모와 자식에 동시에 걸면 두 번 뒤집혀 원래대로 돌아온다. img 에만 건다. */
.tech2i .pcard__thumb img {
  filter: invert(1) hue-rotate(180deg) saturate(0.9) brightness(0.95) contrast(0.92);
}
.tech2i .pcard__thumb { background: var(--bg-3); }
.tech2i a { color: inherit; }
"""


def main() -> None:
    body = take_main()
    css = BRIDGE + take_css() + PATCH
    (DST / "assets/css/tech.css").write_text(css, encoding="utf-8")
    (DST / "assets/tech-body.html").write_text(body, encoding="utf-8")
    cards = len(re.findall(r'class="pcard[ "]', body))
    print(f"본문 {len(body)//1024}KB · 카드 {cards}개")
    print(f"CSS {len(css)//1024}KB · 규칙 {css.count('{')}개")


if __name__ == "__main__":
    main()
