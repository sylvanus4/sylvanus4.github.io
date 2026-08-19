#!/usr/bin/env python3
"""2i tech.html 의 기술 카탈로그를 포트폴리오로 이식한다.

내용은 그대로 두고 색만 바꾼다. 148KB 를 손으로 다시 쓰지 않는다:
  1) <main> 에서 카탈로그 본문만 뽑고 (2i 히어로/네비/푸터는 버린다)
  2) 그 본문이 쓰는 CSS 규칙만 2i styles.css 에서 추출해
  3) .tech2i 아래로 스코프하고 토큰을 포트폴리오 다크 팔레트로 갈아끼운다

재실행하면 소스 변경분이 그대로 반영된다.
"""

import json
import re
from pathlib import Path

SRC = Path.home() / "thaki/2icorp-work/site"
DST = Path(__file__).resolve().parents[1]
EXTRA_JSON = DST / "assets/tech-extra.json"

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
/* ⛔ grid blowout 방어 — 생성기가 소유해야 한다. `.fam` 은 컬럼이 명시되지 않은 grid라
   트랙이 auto 이고, auto 트랙은 min-content 아래로 못 줄어든다. 고유 너비 1920px 인
   <video> 를 자식으로 넣으면 트랙이 부풀어 헤더까지 끌려가 375px 에서 544px 넘친다.
   2026-08-06: 이 규칙을 tech.css 에 손으로 덧붙였다가 port_tech.py 재실행에 통째로
   날아갔다. 생성 파일에 append 하지 말 것 — 여기 PATCH 에 둬야 살아남는다. */
.tech2i .fam { grid-template-columns: minmax(0, 1fr); }
.tech2i .fam__reel { margin: 1.25rem 0 1.75rem; min-width: 0; }
.tech2i .fam__v {
  display: block; width: 100%; height: auto; aspect-ratio: 16/9;
  max-width: min(880px, 100%); border-radius: 12px; background: #05070d;
  border: 1px solid var(--line);
  border-top: 2px solid color-mix(in oklab, var(--pal, var(--cy)) 55%, transparent);
}
.tech2i .fam__reel[data-pal="cyan"]    { --pal: var(--cy); }
.tech2i .fam__reel[data-pal="violet"]  { --pal: var(--vi); }
.tech2i .fam__reel[data-pal="azure"]   { --pal: oklch(74% .13 250); }
.tech2i .fam__reel[data-pal="emerald"] { --pal: var(--ok); }
.tech2i .fam__reel[data-pal="teal"]    { --pal: oklch(76% .11 185); }
.tech2i .fam__reel[data-pal="amber"]   { --pal: var(--am); }
.tech2i .fam__reel[data-pal="crimson"] { --pal: oklch(70% .16 20); }
.tech2i .fam__reel[data-pal="indigo"]  { --pal: oklch(68% .15 275); }
.tech2i .fam__vslot {
  display: grid; place-items: center;
  background: repeating-linear-gradient(-45deg, transparent 0 14px,
    color-mix(in oklab, var(--line) 40%, transparent) 14px 15px), var(--bg-2);
}
.tech2i .fam__vslot span {
  font-size: .78rem; font-weight: 600; letter-spacing: .14em; color: var(--fg-3);
  padding: .45rem .95rem; border: 1px solid var(--line); border-radius: 999px;
  background: var(--bg);
}
.tech2i .fam__vcap {
  max-width: 880px; margin: .7rem 0 0;
  font-size: .88rem; line-height: 1.6; color: var(--fg-3);
}
.tech2i .fam__vcap em { font-style: normal; color: var(--fg-4); }

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


def card_html(c: dict) -> str:
    """원본 카드와 같은 구조로 찍는다. 클래스가 다르면 스타일이 안 먹는다.

    `url` 이 없으면 <a> 가 아니라 <div> 로 찍고 "GitHub →" 도 떼어 낸다.
    비공개 저장소에 GitHub 링크를 달면 방문자에게는 404 이고, 카드가 열리지도
    않으면서 열릴 것처럼 보인다. 2i 에서 넘어온 링크 없는 카드 77장이 이미
    이 형태라 렌더러·검색·게이트가 `.pcard` 로 둘 다 본다(2026-08-09).
    """
    slug = (c.get("key") or c["repo"]).replace("/", "__")
    tags = "".join(f"<span>{t}</span>" for t in c.get("tags", []))
    url = c.get("url")
    go = '<span class="pcard__go">GitHub →</span>' if url else ""
    open_tag = (
        f'<a class="pcard reveal" href="{url}" target="_blank" rel="noopener"'
        if url else '<div class="pcard reveal"'
    )
    close_tag = "</a>" if url else "</div>"
    return (
        f'\n      {open_tag} data-cat="{c["fam"].replace("tech-", "")}"'
        f' data-q="{c.get("q", "")} {c.get("key") or c["repo"]} {c["title"]}">\n'
        f'        <div class="pcard__thumb"><img src="tech/thumb/{slug}.png" alt="" loading="lazy"'
        f' width="880" height="495"></div>\n'
        f'        <div class="pcard__body">\n'
        f'          <div class="pcard__meta">'
        f'<span class="pcard__cat">{"비공개" if c.get("private") else "공개"}</span>'
        f'<span class="pcard__rt">{c["lang"]}</span>'
        f'<span class="pcard__date">{c["date"]}</span></div>\n'
        f'          <h3 class="pcard__title">{c["title"]}</h3>\n'
        f'          <p class="pcard__excerpt">{c["excerpt"]}</p>\n'
        f'          <div class="pcard__tags"><span>{c.get("key") or c["repo"]}</span>{tags}{go}\n'
        f'        </div>\n'
        f'        </div>\n'
        f'      {close_tag}'
    )



def _match_end(text: str, pos: int, tag: str) -> int:
    """`pos` 시점에 열려 있는 `tag` 의 닫는 태그 끝 위치. 중첩을 센다.

    카드 안에 같은 태그가 들어 있어서 필요하다(pcard 안의 pcard__tags 가 둘 다 div).
    닫히지 않으면 -1 을 돌려 호출부가 그 카드를 건너뛴다.
    """
    depth = 1
    scan = re.compile(rf"<(/?){tag}\b", re.I)
    for m in scan.finditer(text, pos):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            close = text.find(">", m.end())
            return close + 1 if close != -1 else -1
    return -1


def retaxonomy(body: str, cfg: dict) -> str:
    """카드를 영상 카테고리와 같은 축으로 다시 담는다.

    2i 원본의 계열 구조를 그대로 두면 영상 15편과 축이 어긋난다. 카드는 하나도 버리지 않고
    버킷만 옮기며, 규칙은 위에서부터 첫 매치가 이긴다. 원본이 갱신돼도 이 재분류가 살아남도록
    생성기가 소유한다(생성 파일을 손으로 고치면 다음 재생성 때 날아간다).
    """
    tax = cfg.get("taxonomy")
    if not tax:
        return body

    # 계열별 카드 수확.
    #
    # 카드는 <a class="pcard"> 이거나 <div class="pcard"> 다. 원래 전부 <a> 였는데, 2i 쪽
    # 보안 스크럽이 개인 계정 귀속 링크를 지우면서 링크가 없어진 카드 77장이 <div> 로 바뀌었다.
    # <a> 만 보던 정규식은 그 77장을 조용히 흘려보냈고, 재분류가 남은 것만 다시 담아 본문이
    # 128장에서 52장으로 줄었다. 카드가 0장이면 경고하고 원본을 지키지만 52장은 "찾긴 찾았다"라
    # 경고도 안 떴다.
    #
    # 태그별로 처리가 갈리는 이유: <a> 는 중첩되지 않아 non-greedy 로 끝나지만 <div> 안에는
    # <div class="pcard__tags"> 가 들어 있어 첫 </div> 에서 끊으면 카드가 반토막 난다.
    cards = []
    open_re = re.compile(r'\n?[ \t]*<(a|div) class="pcard[ "]')
    for sec in re.finditer(r'<section class="fam" id="(tech-[a-z]+)".*?</section>', body, re.S):
        fam = sec.group(1).replace("tech-", "")
        chunk = sec.group(0)
        for m in open_re.finditer(chunk):
            tag = m.group(1)
            end = (_match_end(chunk, m.end(), tag) if tag == "div"
                   else chunk.find("</a>", m.end()) + len("</a>"))
            if end <= 0:
                continue
            cards.append({"fam": fam, "html": chunk[m.start():end]})
    if not cards:
        print("  ⚠ 재분류: 카드를 찾지 못해 원본 유지")
        return body

    def bucket(c):
        q = c["html"].lower()
        for t in tax:
            if c["fam"] not in t.get("from", []):
                continue
            keys = t.get("any") or []
            if not keys or any(k.lower() in q for k in keys):
                return t["id"]
        return "tech-misc"

    buckets = {t["id"]: [] for t in tax}
    for c in cards:
        buckets.setdefault(bucket(c), []).append(c["html"])

    out = []
    for t in tax:
        items = buckets.get(t["id"], [])
        if not items:
            continue
        short = t["id"].replace("tech-", "")
        reel = (f'\n        <div class="fam__reel" data-reel="{t["reel"]}"></div>'
                if t.get("reel") else "")
        out.append(
            f'<section class="fam" id="{t["id"]}" aria-labelledby="techt-{short}">\n'
            f'        <header class="fam__head">\n'
            f'          <h2 class="fam__t" id="techt-{short}">{t["title"]}'
            f'<span class="fam__n">{len(items)}개</span></h2>\n'
            f'          <p class="fam__d">{t["desc"]}</p>\n'
            f'        </header>'
            f'{reel}\n'
            f'        <div class="pboard">' + "".join(items) + "\n        </div>\n      </section>"
        )

    nav = ['<nav class="famnav" aria-label="분류로 바로가기"><span class="famnav__k">분류</span>']
    for t in tax:
        n = len(buckets.get(t["id"], []))
        if n:
            nav.append(f'<a class="famnav__chip" href="#{t["id"]}">{t["title"]}'
                       f'<span class="famnav__n">{n}</span></a>')
    nav.append("</nav>")

    first = re.search(r'<section class="fam" id="tech-[a-z]+"', body)
    last = None
    for m in re.finditer(r'</section>', body):
        last = m
    head = body[: first.start()]
    tail = body[last.end():]
    head = re.sub(r'<nav class="famnav".*?</nav>', "".join(nav), head, flags=re.S)
    total = sum(len(v) for v in buckets.values())
    print(f"  재분류: {len(cards)}장 -> {sum(1 for t in tax if buckets.get(t['id']))}개 분류 (합계 {total})")
    return head + "\n      ".join(out) + tail


def apply_extra(body: str) -> str:
    """내 저장소를 덧붙이고, 회사 화법으로 남은 문장을 고치고, 개수를 다시 센다."""
    if not EXTRA_JSON.exists():
        return body
    cfg = json.loads(EXTRA_JSON.read_text(encoding="utf-8"))

    for old, new in cfg.get("rewrite", []):
        if old not in body:
            print(f"  ⚠ rewrite 대상 없음: {old[:34]}…")
        body = body.replace(old, new)

    # 계열별로 카드를 그 섹션 pboard 끝에 넣는다
    for c in cfg.get("cards", []):
        sec = re.search(
            rf'(<section class="fam" id="{c["fam"]}".*?<div class="pboard">)(.*?)(\s*</div>\s*</section>)',
            body, re.S,
        )
        if not sec:
            print(f'  ⚠ 계열 없음: {c["fam"]}')
            continue
        body = body[: sec.start()] + sec.group(1) + sec.group(2) + card_html(c) + sec.group(3) + body[sec.end():]

    body = retaxonomy(body, cfg)

    for fam, label in cfg.get("rename", {}).items():
        body = re.sub(
            rf'(<h2 class="fam__t" id="techt-{fam.replace("tech-", "")}">)[^<]*',
            rf"\g<1>{label}", body,
        )
        body = re.sub(rf'(<a class="famnav__chip" href="#{fam}">)[^<]*', rf"\g<1>{label}", body)

    # 개수 재계산 (원본 숫자를 그대로 두면 카드 수와 어긋난다)
    for m in re.finditer(r'<section class="fam" id="(tech-[a-z]+)".*?</section>', body, re.S):
        fam, block = m.group(1), m.group(0)
        n = len(re.findall(r'class="pcard[ "]', block))
        body = body.replace(block, re.sub(r'(<span class="fam__n">)\d+개', rf"\g<1>{n}개", block))
        body = re.sub(rf'(<a class="famnav__chip" href="#{fam}">[^<]*<span class="famnav__n">)\d+',
                      rf"\g<1>{n}", body)
    return body


def main() -> None:
    body = apply_extra(take_main())
    css = BRIDGE + take_css() + PATCH
    (DST / "assets/css/tech.css").write_text(css, encoding="utf-8")
    (DST / "assets/tech-body.html").write_text(body, encoding="utf-8")
    cards = len(re.findall(r'class="pcard[ "]', body))
    print(f"본문 {len(body)//1024}KB · 카드 {cards}개")
    print(f"CSS {len(css)//1024}KB · 규칙 {css.count('{')}개")


if __name__ == "__main__":
    main()
