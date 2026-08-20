#!/usr/bin/env python3
"""사이트 전역 검색 인덱스를 만든다 → assets/search-index.json

왜 직접 만드나
--------------
2026 정본은 Pagefind 다. 빌드된 HTML 을 훑어 인덱스를 굽고, 청크를 지연 로드하며,
CJK 토크나이즈까지 한다. 그런데 이 사이트는 **네 페이지가 전부 빈 껍데기**이고 본문은
data.js / demos.json / tech-body.html 을 브라우저가 받아 그린다. Pagefind 는 자바스크립트를
실행하지 않으므로 여기서는 빈 페이지 네 장을 색인하게 된다 — 품질 문제가 아니라 구조가
안 맞는다. Lunr 은 한국어 토크나이저·스테머가 없어서 어절+조사를 못 다루고, Fuse 는
한글 퍼지 점수가 시끄러운 데다 "의존성 0" 을 내세우는 사이트에 의존성을 하나 들인다.

그래서 Pagefind 의 **모양**만 가져왔다: 원천 데이터에서 빌드타임에 인덱스를 굽고, 정적
JSON 으로 싣고, 클라이언트는 조회만 한다. 다른 점은 색인 대상이 렌더된 HTML 이 아니라
**정본 데이터 파일**이라는 것뿐이다.

한국어
------
띄어쓰기를 지운 compact 형을 같이 실어 조사와 띄어쓰기 흔들림을 substring 으로 흡수하고
("양자화" 가 "양자화를" 에 걸린다), 초성 문자열을 미리 뽑아 "ㅇㅈㅎ" 로도 찾게 한다.
영문은 같은 compact 형이 접두·부분 일치를 함께 처리한다.

실행: python3 tools/build_search_index.py
"""
import json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/search-index.json"

CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"
BODY_CAP = 220


def choseong(s: str) -> str:
    """한글 음절에서 초성만 뽑는다. 음절이 아니면 그대로 둔다.

    한글 음절은 0xAC00 + 초성*588 + 중성*28 + 종성 으로 배열돼 있어서 588 로 나눈
    몫이 곧 초성 인덱스다. 흔히 인용되는 587 은 자음 간 간격이지 나눗수가 아니다.
    """
    out = []
    for ch in s:
        c = ord(ch)
        if 0xAC00 <= c <= 0xD7A3:
            out.append(CHO[(c - 0xAC00) // 588])
        elif ch.strip():
            out.append(ch)
    return "".join(out)


def compact(s: str) -> str:
    """소문자 + 공백·구두점 제거. 조사와 띄어쓰기 차이를 substring 이 흡수하게 한다."""
    return re.sub(r"[^0-9a-z가-힣ㄱ-ㅎ]+", "", (s or "").lower())


def squeeze(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "")).strip()


def strip_tags(s: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s or "")).strip()


def node_json(module: str, expr: str):
    """ES 모듈에서 값을 뽑는다. data.js 는 JSON 이 아니라 모듈이라 node 를 거친다."""
    js = f"import('./{module}').then(m=>process.stdout.write(JSON.stringify({expr})))"
    r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True, text=True, timeout=60)
    if r.returncode != 0:
        raise RuntimeError(f"{module}: {r.stderr.strip()[:200]}")
    return json.loads(r.stdout)


def doc(kind, url, title_ko, title_en, body_ko="", body_en="", tags=(), meta=""):
    """표시용 필드 + 추가 검색어만 싣는다.

    compact·초성 정규화는 **클라이언트가 로드 시 한 번** 계산한다. 여기서 미리 구우면
    같은 텍스트가 세 벌로 불어나 인덱스가 729KB 까지 갔다. 298건 정규화는 브라우저에서
    10ms 도 안 걸리므로, 전송 바이트를 줄이는 쪽이 명백히 낫다.
    """
    tags = [t for t in tags if t]
    title_en = title_en or title_ko
    extra = " ".join([" ".join(tags), meta]).strip()
    d = {
        "k": kind, "u": url, "t": title_ko,
        "b": squeeze(body_ko)[:BODY_CAP],
        "g": tags,
    }
    if title_en != title_ko:
        d["te"] = title_en
    be = squeeze(body_en)[:BODY_CAP]
    if be and be != d["b"]:
        d["be"] = be
    if extra:
        d["s"] = extra
    return d


def catalog_docs():
    """생성된 카탈로그 본문에서 173장을 읽는다. tech-extra + 2i 원본이 이미 합쳐진 정본."""
    html = (ROOT / "assets/tech-body.html").read_text(encoding="utf-8")
    en = json.loads((ROOT / "assets/tech-en.json").read_text(encoding="utf-8")).get("cards", {})
    cards = re.findall(
        r'<(?:a|div) class="pcard[^"]*"(?:\s+href="([^"]*)")?[^>]*data-cat="([^"]*)"'
        r'[^>]*data-q="([^"]*)"[\s\S]*?pcard__title">([^<]*)</h3>\s*'
        r'<p class="pcard__excerpt">([\s\S]*?)</p>\s*'
        r'<div class="pcard__tags">([\s\S]*?)</div>', html)
    out = []
    for href, cat, q, title, excerpt, tagblock in cards:
        title = strip_tags(title)
        tags = [strip_tags(x) for x in re.findall(r"<span>([\s\S]*?)</span>", tagblock)]
        e = en.get(title, {})
        out.append(doc("catalog", f"tech.html?q={title}", title, e.get("t", ""),
                       strip_tags(excerpt), e.get("e", ""),
                       tags + (e.get("g") or []), f"{cat} {strip_tags(q)}"))
    return out


def demo_docs():
    demos = json.loads((ROOT / "assets/demos.json").read_text(encoding="utf-8"))
    return [doc("demo", f"demos.html#{d['slug']}", d.get("title", ""), d.get("title_en", ""),
                d.get("blurb", ""), d.get("blurb_en", ""),
                (d.get("tech") or []) + (d.get("tech_en") or []), d["slug"])
            for d in demos]


def portfolio_docs():
    ko = node_json("assets/js/data.js", "{work:m.work,reels:m.reels,layers:m.layers,timeline:m.timeline}")
    try:
        en = node_json("assets/js/data.en.js", "{work:m.work,reels:m.reels,layers:m.layers,timeline:m.timeline}")
    except Exception:
        en = {}
    def pair(key, i):
        arr = (en or {}).get(key) or []
        return arr[i] if i < len(arr) else {}
    out = []
    for i, w in enumerate(ko["work"]):
        e = pair("work", i)
        body = " ".join(filter(None, [w.get("summary"), w.get("problem"), w.get("approach"), w.get("result")]))
        ebody = " ".join(filter(None, [e.get("summary"), e.get("problem"), e.get("approach"), e.get("result")]))
        out.append(doc("case", f"index.html#work", w.get("title", ""), e.get("title", ""),
                       body, ebody, (w.get("tags") or []) + (w.get("stack") or []),
                       f"{w.get('org','')} {w.get('era','')}"))
    for i, r in enumerate(ko["reels"]):
        e = pair("reels", i)
        # hook 은 대표 영상 한 편에만 있다(16 중 1). 나머지는 분류명이 제목 노릇을 한다.
        out.append(doc("reel", f"index.html#reels",
                       r.get("hook") or r.get("cat", ""), e.get("hook") or e.get("cat") or r.get("cat", ""),
                       r.get("blurb", ""), e.get("blurb", ""), [r.get("cat", "")], r.get("slug", "")))
    for i, l in enumerate(ko["layers"]):
        e = pair("layers", i)
        out.append(doc("layer", f"index.html#stack", l.get("title", ""), e.get("title", ""),
                       " ".join(filter(None, [l.get("line"), l.get("body")])),
                       " ".join(filter(None, [e.get("line"), e.get("body")])), l.get("keys") or []))
    for i, tl in enumerate(ko["timeline"]):
        e = pair("timeline", i)
        out.append(doc("career", f"index.html#timeline",
                       f"{tl.get('org','')} · {tl.get('role','')}",
                       f"{e.get('org', tl.get('org',''))} · {e.get('role', tl.get('role',''))}",
                       tl.get("note", ""), e.get("note", ""), [], tl.get("period", "")))
    return out


def resume_docs():
    try:
        rd = node_json("assets/js/resume-data.js", "m.resume ?? m.default ?? m")
    except Exception as exc:
        print(f"  ⚠ resume 건너뜀: {exc}", file=sys.stderr)
        return []
    out = []
    for lang in ("ko", "en"):
        blk = rd.get(lang) if isinstance(rd, dict) else None
        if not isinstance(blk, dict):
            continue
        for key, val in blk.items():
            flat = json.dumps(val, ensure_ascii=False)
            text = strip_tags(re.sub(r'[\[\]{}",]', " ", flat))
            if len(text) < 20:
                continue
            if lang == "ko":
                out.append(doc("resume", "resume.html?lang=ko", f"이력서 · {key}", f"Resume · {key}", text, ""))
            else:
                out[-1]["be"] = text[:BODY_CAP] if out else ""
                if out:
                    out[-1]["ce"] = compact(f"resume {key} {text}")
    return out


def main():
    docs, counts = [], {}
    for name, fn in (("catalog", catalog_docs), ("demo", demo_docs),
                     ("portfolio", portfolio_docs), ("resume", resume_docs)):
        try:
            got = fn()
        except Exception as exc:
            print(f"  ⚠ {name} 실패: {exc}", file=sys.stderr)
            got = []
        docs += got
        counts[name] = len(got)
    for i, d in enumerate(docs):
        d["i"] = i
    OUT.write_text(json.dumps({"v": 1, "docs": docs}, ensure_ascii=False, separators=(",", ":")) + "\n",
                   encoding="utf-8")
    kb = OUT.stat().st_size / 1024
    print("  " + " · ".join(f"{k} {v}" for k, v in counts.items()))
    print(f"  검색 인덱스 {len(docs)}건 · {kb:.0f}KB → {OUT.relative_to(ROOT)}")
    if not docs:
        raise SystemExit("인덱스가 비었다 — 원천 파싱이 깨졌다")


if __name__ == "__main__":
    main()
