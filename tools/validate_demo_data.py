#!/usr/bin/env python3
"""데모 데이터 계약 검사. 위젯이 읽기 전에 형태를 코드가 판정한다.

조회표가 비거나 조합이 빠지면 화면에서는 "값 없음"이 조용히 뜬다. 그건 방문자에게
고장으로 보이므로, 조합 곱과 runs 개수가 맞는지까지 여기서 센다.

사용: python3 tools/validate_demo_data.py [디렉터리]
exit 0 = 통과 · 1 = 위반
"""
from __future__ import annotations

import json
import re
import sys
from itertools import product as iproduct
from pathlib import Path

BANNED = re.compile(
    r"thakicloud|\btkai-|\bmlp-[a-z]|inf-s3|objects3|bm-b200-|\bcr2\.|kubectl|hyojung",
    re.IGNORECASE,
)
BILINGUAL = ("ko", "en")
# 사람이 읽는 문장에서만 본다. provenance.command 의 `--flag` 는 정당하다.
PROSE_DASH = re.compile(r"[\u2014\u2013]|(?<![-\w])--(?!\w)")


def bad(errs: list[str], f: str, msg: str) -> None:
    errs.append(f"{f}: {msg}")


def check_bilingual(errs, f, where, obj):
    if not isinstance(obj, dict) or not all(obj.get(k) for k in BILINGUAL):
        bad(errs, f, f"{where}: ko/en 둘 다 있어야 한다 → {obj!r}")


def check(path: Path) -> list[str]:
    errs: list[str] = []
    f = path.name
    try:
        d = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        return [f"{f}: JSON 파싱 실패 — {e}"]

    for key in ("id", "product", "howto", "controls", "outputs", "runs", "verdict", "provenance"):
        if key not in d:
            bad(errs, f, f"필수 키 없음: {key}")
    if errs:
        return errs

    if d["id"] != path.stem:
        bad(errs, f, f"id({d['id']}) 와 파일명({path.stem}) 불일치")

    for k in ("product", "howto", "verdict"):
        check_bilingual(errs, f, k, d[k])

    controls = d["controls"]
    if not 1 <= len(controls) <= 3:
        bad(errs, f, f"controls 는 1~3개여야 한다 (지금 {len(controls)})")
    axes = []
    for c in controls:
        check_bilingual(errs, f, f"control[{c.get('key')}].label", c.get("label", {}))
        opts = c.get("options") or []
        if len(opts) < 2:
            bad(errs, f, f"control {c.get('key')}: 선택지가 2개 미만이면 조작이 아니다")
        for o in opts:
            check_bilingual(errs, f, f"option {c.get('key')}={o.get('value')}", o.get("label", {}))
        axes.append([o.get("value") for o in opts])

    outs = d["outputs"]
    if not 2 <= len(outs) <= 5:
        bad(errs, f, f"outputs 는 2~5개여야 한다 (지금 {len(outs)})")
    for o in outs:
        check_bilingual(errs, f, f"output[{o.get('key')}].label", o.get("label", {}))

    runs = d["runs"]
    expected = 1
    for a in axes:
        expected *= max(len(a), 1)
    if len(runs) != expected:
        bad(errs, f, f"조합 {expected}개인데 runs 는 {len(runs)}개 — 조회표에 구멍이 있다")
    if not 8 <= len(runs) <= 96:
        bad(errs, f, f"runs 개수 {len(runs)} — 8~96 밖이면 조작감이 없거나 너무 무겁다")

    keys = [c.get("key") for c in controls]
    seen = set()
    for r in runs:
        sig = tuple(str(r.get("in", {}).get(k)) for k in keys)
        if sig in seen:
            bad(errs, f, f"중복 조합: {sig}")
        seen.add(sig)
        for o in outs:
            if o["key"] not in (r.get("out") or {}):
                bad(errs, f, f"조합 {sig}: 출력 {o['key']} 누락")
    for combo in iproduct(*axes):
        if tuple(str(c) for c in combo) not in seen:
            bad(errs, f, f"빠진 조합: {combo}")
            break

    prov = d["provenance"]
    for k in ("backend", "command", "generated"):
        if not prov.get(k):
            bad(errs, f, f"provenance.{k} 가 비었다 — 재현 경로 없는 수치는 싣지 않는다")

    prose = []
    for k in ("product", "howto", "verdict"):
        prose += [d[k].get(lang, "") for lang in BILINGUAL]
    for r in runs:
        if r.get("note"):
            prose += [r["note"].get(lang, "") for lang in BILINGUAL]
    for c in controls:
        prose += [c["label"].get(lang, "") for lang in BILINGUAL]
        for o in (c.get("options") or []):
            prose += [o.get("label", {}).get(lang, "") for lang in BILINGUAL]
    dashed = [t for t in prose if t and PROSE_DASH.search(t)]
    if dashed:
        bad(errs, f, f"본문에 대시 {len(dashed)}건 (하우스 스타일: em/en 대시와 -- 금지) 예: {dashed[0][:60]!r}")

    hit = BANNED.search(json.dumps(d, ensure_ascii=False))
    if hit:
        bad(errs, f, f"사내 식별자 누출: {hit.group(0)!r}")
    return errs


def main(argv: list[str]) -> int:
    root = Path(argv[1] if len(argv) > 1 else "demos/flagship/data")
    files = sorted(root.glob("*.json"))
    if not files:
        print(f"  ✗ 데이터 파일이 없다: {root}")
        return 1
    all_errs: list[str] = []
    for p in files:
        e = check(p)
        all_errs += e
        print(("  ✓ " if not e else "  ✗ ") + p.name + (f"  ({len(json.loads(p.read_text(encoding='utf-8')).get('runs', []))} runs)" if not e else ""))
        for msg in e:
            print("      " + msg)
    print()
    if all_errs:
        print(f"FAIL {len(all_errs)}건 · 파일 {len(files)}개")
        return 1
    print(f"PASS · 파일 {len(files)}개")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
