#!/usr/bin/env python3
"""raw/ 의 항목별 채점 결과를 조회표로 굽는다.

⛔ 손 전사 금지. raw/*.jsonl 은 실험 저장소의 채점 바이너리가
`adf grade --per-item` 으로 낸 것이고(실 SQLite 실행 + 동치 판정),
이 스크립트는 그것을 세기만 한다. 숫자를 여기서 만들지 않는다.

  python3 build.py     # → data/gate-vs-data.json
"""
import json, pathlib, collections

HERE = pathlib.Path(__file__).parent
RAW, OUT = HERE / "raw", HERE / "data" / "gate-vs-data.json"
RUNAWAY = 600  # 자 이상이면 폭주(중첩 서브쿼리 무한 반복)로 센다

ARMS = [
    ("base",      {"ko": "미학습",            "en": "Untrained base"}),
    ("gated",     {"ko": "게이트 통과분 80건", "en": "Gated, 80 items"}),
    ("control",   {"ko": "안 거른 99건",       "en": "Ungated, 99 items"}),
    ("control80", {"ko": "안 거른 80건",       "en": "Ungated, size matched"}),
]
SEEDS = ["1", "2", "3", "4", "5"]


def load(name):
    p = RAW / f"{name}.jsonl"
    if not p.exists():
        return None
    return [json.loads(l) for l in p.read_text().splitlines() if l.strip()]


def measure(rows):
    return {
        "pass": sum(1 for r in rows if r["ok"]),
        "runaway": sum(1 for r in rows if len(r.get("answer") or "") > RUNAWAY),
        "empty": sum(1 for r in rows if r.get("empty")),
    }


runs = []
for arm, _ in ARMS:
    for seed in SEEDS:
        # 미학습 팔은 시드가 없다 — 다섯 칸이 **구성상** 같은 값이고, 그게 요점이다.
        rows = load("base" if arm == "base" else f"{arm}-s{seed}")
        if rows is None:
            raise SystemExit(f"raw 누락: {arm} seed {seed}")
        runs.append({"in": {"arm": arm, "seed": seed}, "out": measure(rows)})

doc = {
    "id": "gate-vs-data",
    "product": {
        "ko": "검증 게이트를 통과한 데이터로 학습하면 학생 모델이 더 좋아지는가. 팔과 시드를 골라 실제 채점 결과를 본다.",
        "en": "Does training on gate-verified data make the student better? Pick an arm and a seed to see the real graded result.",
    },
    "howto": {
        "ko": "팔과 시드를 고르면 44문항 채점 결과가 바뀐다. 미학습 팔은 시드가 없어 다섯 칸이 같은 값이다. 폭주는 답이 600자를 넘긴 문항 수로, 중첩 서브쿼리를 무한 반복한 생성이다.",
        "en": "Pick an arm and a seed to change the graded result over 44 items. The untrained arm has no seed, so its five cells are identical by construction. Runaway counts answers longer than 600 characters, where generation looped on nested subqueries.",
    },
    "controls": [
        {"key": "arm", "label": {"ko": "학습 데이터", "en": "Training data"}, "type": "select",
         "default_index": 1,
         "options": [{"value": a, "label": l} for a, l in ARMS]},
        {"key": "seed", "label": {"ko": "시드", "en": "Seed"}, "type": "select",
         "default_index": 0,
         "options": [{"value": s, "label": {"ko": s, "en": s}} for s in SEEDS]},
    ],
    "outputs": [
        {"key": "pass", "label": {"ko": "통과 문항", "en": "Items passed"}, "unit": "/44"},
        {"key": "runaway", "label": {"ko": "폭주 생성", "en": "Runaway generations"}, "unit": "/44"},
        {"key": "empty", "label": {"ko": "빈 답", "en": "Empty answers"}, "unit": "/44"},
    ],
    "runs": runs,
    "verdict": {
        "ko": "게이트가 데이터를 걸러 준 팔이 안 거른 팔을 이기지 못했다. 다섯 시드 어디서도 그렇고, 미학습 모델이 학습한 모든 팔보다 폭주가 적다. 즉 이 규모의 학습은 SQL 을 가르치기 전에 횡설수설을 가르쳤다. 앞선 단일 시드 실행에서는 게이트 쪽이 이겼는데 그것은 이상치였고, 다중 시드와 짝지은 검정을 붙였기 때문에 잡혔다. 게이트가 무엇을 왜 거르는지는 측정됐지만, 그것이 학생을 개선하는지는 아직 미검증이다.",
        "en": "The gated arm did not beat the ungated one. Not in any of the five seeds, and the untrained model produces fewer runaway generations than every trained arm, meaning training at this scale taught rambling before it taught SQL. An earlier single-seed run favoured the gated arm, but that was an outlier, caught only because multi-seed and a paired test were in place. What the gate rejects and why is measured. Whether that improves the student is not.",
    },
    "provenance": {
        "backend": "Rust 채점기 + 샌드박스 SQLite 실행. LoRA SFT 는 단일 GPU, 생성은 vLLM.",
        "command": "adf grade --per-item --evalset corpus/demo-retail/evalset.jsonl --schema corpus/demo-retail/schema.sql",
        "generated": "2026-08",
    },
}

OUT.parent.mkdir(exist_ok=True)
OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n")
print(f"구움 {OUT.name} · 조합 {len(runs)} · 팔 {len(ARMS)} × 시드 {len(SEEDS)}")
