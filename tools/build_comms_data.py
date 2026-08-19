#!/usr/bin/env python3
"""통신 데모의 조회표를 원본 측정 JSON에서 기계적으로 옮긴다.

손으로 옮겨 적으면 숫자가 틀린다. 이 스크립트는 비공개 저장소의 측정 결과
파일을 읽어 demos/comms/data/*.json 을 만든다. 저장소가 없는 머신에서는
아무것도 하지 않고 그 사실을 말한다 (산출물은 커밋되어 있다).

사용: COMMSTACK_ROOT=~/thaki/commstack python3 tools/build_comms_data.py
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

SRC = Path(os.environ.get("COMMSTACK_ROOT", "~/thaki/commstack")).expanduser()
OUT = Path(__file__).resolve().parents[1] / "demos" / "comms" / "data"


def load(rel: str):
    p = SRC / rel
    if not p.exists():
        print(f"  ! 원본 없음: {rel}")
        return None
    return json.loads(p.read_text(encoding="utf-8"))


def write(name: str, doc: dict) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / f"{name}.json").write_text(
        json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
    )
    print(f"  ✓ {name}.json  ({len(doc['runs'])} runs)")


def r3(x: float) -> float:
    return round(float(x), 3)


# ---------------------------------------------------------------- amc
def build_amc() -> bool:
    d = load("sigprint-spectrum/jobs/amc-bench/amc-bench-metrics.json")
    if not d:
        return False
    snrs = d["config"]["snr_grid_db"]
    n_classes = len(d["classes"])
    chance = 1.0 / n_classes
    # 회차당 평가 표본: 클래스당 생성 수 x 클래스 수 x 테스트 비율
    n_eval = round(d["config"]["n_per_class_per_snr"] * n_classes * d["config"]["test_fraction"])
    curves = {
        "gbm": d["gbm_accuracy_vs_snr"],
        "centroid": d["nearest_centroid_accuracy_vs_snr"],
    }
    runs = []
    for clf, curve in curves.items():
        for s in snrs:
            acc = curve[str(s)]
            runs.append({
                "in": {"snr": s, "clf": clf},
                "out": {"acc": r3(acc), "vs_chance": r3(acc / chance), "n_eval": n_eval},
            })
    write("amc", {
        "id": "amc",
        "product": {
            "ko": "수신한 파형이 어떤 변조인지 판정합니다. 딥러닝 없이 6차원 누적률 특징만 쓰고, 그 특징 계산은 실제 출하 코드에서 그대로 옮겨 왔습니다. 8종 변조를 16단계 SNR에서 각각 평가했습니다.",
            "en": "Decides which modulation a received waveform is, using six cumulant features and no deep learning. The feature code is a numeric port of what actually ships. Eight modulations, evaluated at sixteen SNR levels.",
        },
        "howto": {
            "ko": "SNR 을 올려 가며 두 분류기를 비교해 보세요. 신호가 좋아질수록 나아질 것 같지만 한쪽은 그러지 않습니다.",
            "en": "Raise the SNR and compare the two classifiers. Better signal should mean better answers. One of them disagrees.",
        },
        "controls": [
            {"key": "snr", "label": {"ko": "수신 SNR", "en": "Receive SNR"}, "type": "select",
             "default_index": snrs.index(10),
             "options": [{"value": s, "label": {"ko": f"{s} dB", "en": f"{s} dB"}} for s in snrs]},
            {"key": "clf", "label": {"ko": "분류기", "en": "Classifier"}, "type": "select",
             "options": [
                 {"value": "gbm", "label": {"ko": "그래디언트 부스팅", "en": "Gradient boosting"}},
                 {"value": "centroid", "label": {"ko": "최근접 중심 (출하 기준)", "en": "Nearest centroid (shipped)"}},
             ]},
        ],
        "outputs": [
            {"key": "acc", "label": {"ko": "8종 판정 정확도", "en": "8-way accuracy"}, "unit": "", "better": "higher"},
            {"key": "vs_chance", "label": {"ko": "무작위 대비", "en": "Versus chance"}, "unit": "x", "better": "higher"},
            {"key": "n_eval", "label": {"ko": "평가 표본", "en": "Evaluated windows"}, "unit": "", "better": "higher"},
        ],
        "runs": runs,
        "verdict": {
            "ko": (
                f"출하 기준인 최근접 중심 분류기는 4 dB 에서 {curves['centroid']['4']:.3f} 로 정점을 찍고, "
                f"신호가 더 깨끗해지는 20 dB 에서 {curves['centroid']['20']:.3f} 까지 떨어집니다. "
                "누적률 공간에서 QPSK 와 8PSK, FSK, AM 이 서로 크게 겹친다는 것은 벤치가 그대로 보고하는 사실이고, "
                "겹친 자리에서는 중심까지의 거리로만 고르는 규칙이 잡음보다 그 겹침에 더 휘둘립니다. "
                "같은 특징을 쓰는 부스팅 분류기는 전 구간 "
                f"{d['gbm_overall_accuracy']:.3f} 로 그 함정을 피합니다. 특징이 아니라 결정 규칙이 문제였습니다."
            ),
            "en": (
                f"The shipped nearest-centroid rule peaks at 4 dB with {curves['centroid']['4']:.3f} and falls to "
                f"{curves['centroid']['20']:.3f} at 20 dB, where the signal is cleanest. As noise drops, the per-class "
                "cumulants converge toward each other, so a rule that only measures distance to a centroid gets less "
                f"stable, not more. Boosting on the identical features holds {d['gbm_overall_accuracy']:.3f} overall. "
                "The features were fine. The decision rule was not."
            ),
        },
        "provenance": {
            "backend": (
                "Synthetic RRC bench, not captured RF. Transmit RRC, residual timing and carrier offset, AWGN, "
                "matched receive filter, symbol-rate decimation. Features are a numeric port of the shipped Rust "
                "cumulant routine, so this measures the feature set that actually ships rather than a stronger one. "
                f"{d['config']['n_per_class_per_snr']} windows per class per SNR, seed {d['config']['seed']}, "
                f"test fraction {d['config']['test_fraction']}."
            ),
            "command": "amc-bench --snr -10:20:2 --per-class 300 --seed 1337 --out amc-bench-metrics.json",
            "generated": "2026-08",
            "measured": True,
        },
    })
    return True


# ---------------------------------------------------------------- jammer
def build_jammer() -> bool:
    d = load("sigprint-spectrum/jobs/jammer-taxonomy/jammer-taxonomy-metrics.json")
    if not d:
        return False
    c = d["classification"]
    grid = c["per_class_per_jsr_accuracy"]
    jsrs = d["jsr_grid_db"]
    names = {
        "cw_tone": ("연속파 톤", "CW tone"),
        "sweep_chirp": ("스윕 처프", "Swept chirp"),
        "partial_band_noise": ("부분대역 잡음", "Partial-band noise"),
        "barrage_noise": ("전대역 잡음", "Barrage noise"),
        "pulsed_low_duty": ("저듀티 펄스", "Pulsed low duty"),
        "fhss_jammer": ("주파수도약", "Frequency hopping"),
    }
    runs = []
    for cls in c["classes"]:
        for j in jsrs:
            cell = grid[cls][str(j)]
            runs.append({
                "in": {"cls": cls, "jsr": j},
                "out": {"acc": r3(cell["accuracy"]), "n_eval": cell["n"]},
            })
    write("jammer", {
        "id": "jammer",
        "product": {
            "ko": "무선 대역을 방해하는 신호가 어떤 종류인지 가려냅니다. 대응이 종류마다 다르기 때문에 있다 없다보다 무엇인가가 중요합니다. 여섯 종류를 JSR 아홉 단계에서 각각 평가했습니다.",
            "en": "Tells apart what kind of signal is jamming a band. The response differs by type, so the useful question is which one, not whether. Six types, evaluated across nine jam-to-signal ratios.",
        },
        "howto": {
            "ko": "재밍 종류와 세기를 바꿔 보세요. 약한 쪽 끝에서만 흔들립니다.",
            "en": "Change the jammer type and its strength. Only the weak end wobbles.",
        },
        "controls": [
            {"key": "cls", "label": {"ko": "재밍 종류", "en": "Jammer type"}, "type": "select",
             "options": [{"value": k, "label": {"ko": names[k][0], "en": names[k][1]}} for k in c["classes"]]},
            {"key": "jsr", "label": {"ko": "재밍 대 신호비", "en": "Jam-to-signal ratio"}, "type": "select",
             "default_index": jsrs.index(0.0),
             "options": [{"value": j, "label": {"ko": f"{j:g} dB", "en": f"{j:g} dB"}} for j in jsrs]},
        ],
        "outputs": [
            {"key": "acc", "label": {"ko": "이 종류를 맞힌 비율", "en": "Accuracy for this type"}, "unit": "", "better": "higher"},
            {"key": "n_eval", "label": {"ko": "이 칸의 표본", "en": "Samples in this cell"}, "unit": "", "better": "higher"},
        ],
        "runs": runs,
        "verdict": {
            "ko": (
                f"여섯 종류 전체 매크로 F1 은 {c['macro_f1']:.4f} 이고, 정확도가 0.6 아래로 무너지는 JSR 구간은 "
                "한 종류에도 없었습니다. 남은 오류는 두 곳뿐입니다. 신호가 잡음에 묻히는 -10 dB 에서 스윕 처프가 "
                "주파수도약으로, 주파수도약이 저듀티 펄스로 새는 것인데, 둘 다 시간축에서 실제로 닮은 쌍입니다. "
                "쉬운 문제라서 잘 나온 것이므로, 이 수치는 합성 대역에서만 유효하고 실제 포착 신호로는 다시 재야 합니다."
            ),
            "en": (
                f"Macro F1 across the six types is {c['macro_f1']:.4f}, and no type collapses below 0.6 at any ratio "
                "tested. Two errors remain, both at -10 dB where the jammer is buried in noise: swept chirp leaking to "
                "frequency hopping, and frequency hopping to pulsed low duty. Those pairs genuinely resemble each other "
                "in time. This is a synthetic bank, so the number says the problem is easy here, not that it is solved "
                "on captured signals."
            ),
        },
        "provenance": {
            "backend": (
                "Synthetic jammer bank, physics-motivated generators only, no captured electronic-warfare data and no "
                "real hardware signatures. Twenty-four imported features, gradient boosting, "
                f"{c['config']['n_per_class']} samples per class, seed {c['config']['seed']}, "
                f"test split {c['config']['test_size']}. A seventh reactive class was left out rather than faked, "
                "because sense-and-react behaviour needs a paired victim simulation this bench does not model."
            ),
            "command": "jammer-taxonomy --jsr -10:30:5 --per-class 540 --seed 1337 --out jammer-taxonomy-metrics.json",
            "generated": "2026-08",
            "measured": True,
        },
    })
    return True


# ---------------------------------------------------------------- ldpc
def build_ldpc() -> bool:
    d = load("telecom-lab/docs/results/p39-ldpc-raw/cuda-results.json")
    if not d:
        return False
    rows = d["correctness"]
    oracles = [
        ("boxplusphi", ("정확 합-곱", "Exact sum-product")),
        ("offsetminsum", ("오프셋 최소합 (같은 계열)", "Offset min-sum (same family)")),
    ]
    runs = []
    for okey, _ in oracles:
        for r in rows:
            runs.append({
                "in": {"ebno": r["ebno_db"], "oracle": okey},
                "out": {
                    "our_bler": r3(r["our_bler_vs_true"]),
                    "ref_bler": r3(r[f"sionna_{okey}_bler_vs_true"]),
                    "match": r3(r[f"our_exact_match_vs_{okey}_pct"]),
                    "disagree": round(r[f"mean_bit_disagreement_vs_{okey}"], 4),
                    "iters": r3(r["mean_iters_used"]),
                },
            })
    write("ldpc", {
        "id": "ldpc",
        "product": {
            "ko": (
                "5G 규격 LDPC 부호를 GPU 커널로 복호합니다. 직접 쓴 커널이 맞게 도는지를 스스로 주장하지 않고, "
                "같은 입력을 공개 레퍼런스 복호기 두 종에 통과시켜 비트 단위로 대조합니다."
            ),
            "en": (
                "Decodes a 5G LDPC code in a hand-written GPU kernel. Rather than assert the kernel is correct, the "
                "same inputs go through two public reference decoders and the outputs are compared bit by bit."
            ),
        },
        "howto": {
            "ko": "잡음을 낮춰 가며 우리 커널과 레퍼런스가 언제부터 같은 답을 내는지 보세요.",
            "en": "Lower the noise and watch where our kernel starts agreeing with the reference.",
        },
        "controls": [
            {"key": "ebno", "label": {"ko": "채널 품질 Eb/N0", "en": "Channel quality Eb/N0"}, "type": "select",
             "default_index": [r["ebno_db"] for r in rows].index(0.5),
             "options": [{"value": r["ebno_db"], "label": {"ko": f"{r['ebno_db']:g} dB", "en": f"{r['ebno_db']:g} dB"}} for r in rows]},
            {"key": "oracle", "label": {"ko": "대조할 레퍼런스", "en": "Reference to compare against"}, "type": "select",
             "options": [{"value": k, "label": {"ko": lab[0], "en": lab[1]}} for k, lab in oracles]},
        ],
        "outputs": [
            {"key": "our_bler", "label": {"ko": "우리 커널 블록오류율", "en": "Our block error rate"}, "unit": "", "better": "lower"},
            {"key": "ref_bler", "label": {"ko": "레퍼런스 블록오류율", "en": "Reference block error rate"}, "unit": "", "better": "lower"},
            {"key": "match", "label": {"ko": "출력이 완전히 같은 비율", "en": "Bit-identical outputs"}, "unit": "%", "better": "higher"},
            {"key": "disagree", "label": {"ko": "평균 비트 불일치", "en": "Mean bit disagreement"}, "unit": "", "better": "lower"},
            {"key": "iters", "label": {"ko": "평균 반복 횟수", "en": "Mean iterations used"}, "unit": "", "better": "lower"},
        ],
        "runs": runs,
        "verdict": {
            "ko": (
                "1.0 dB 위에서는 우리 커널이 두 레퍼런스와 99에서 100 퍼센트 비트까지 같은 답을 냅니다. "
                "갈라지는 곳은 폭포 구간입니다. 0.5 dB 에서 우리 블록오류율은 0.420 인데 정확 합-곱은 0.075 로, "
                "다섯 배가 넘게 벌어집니다. 다만 같은 계열인 오프셋 최소합은 0.370 이라 거의 붙습니다. "
                "즉 이 격차는 구현 결함이 아니라 최소합 근사 자체의 손실이고, 그래서 이 커널을 믿어도 되는 "
                "구간과 아닌 구간을 숫자로 말할 수 있습니다."
            ),
            "en": (
                "Above 1.0 dB our kernel returns bit-identical answers to both references, 99 to 100 percent of the "
                "time. They part company in the waterfall. At 0.5 dB our block error rate is 0.420 against 0.075 for "
                "exact sum-product, more than five times worse. Against offset min-sum, the same algorithm family, it "
                "is 0.420 against 0.370. So the gap is the min-sum approximation, not a bug, and the range where this "
                "kernel can be trusted is a number rather than an opinion."
            ),
        },
        "provenance": {
            "backend": (
                f"Base graph {d['code']['bg']}, n={d['code']['n_ldpc']}, k={d['code']['k_ldpc']}, mother rate "
                f"{d['code']['coderate_mother']:.3f}. Decoder: {d['decoder']['algorithm']}, alpha "
                f"{d['decoder']['alpha']}, up to {d['decoder']['max_iter']} iterations, LLR clipped at "
                f"{d['decoder']['llr_clip']}. 200 codewords per point on one Blackwell-class GPU "
                f"({d['device']['sm_count']} SMs). References are the two public decoders named above, both run "
                "flooding with no early termination."
            ),
            "command": "ldpc_cuda_bench --ebno -1:3 --codewords 200 --max-iter 25 --out cuda-results.json",
            "generated": "2026-08",
            "measured": True,
        },
    })
    return True


# ---------------------------------------------------------------- chanest
def build_chanest() -> bool:
    d = load("telecom-lab/docs/results/p37-raw/gpu-b200-crossover.json")
    if not d:
        return False
    rows = d["rows"]
    stages = [
        ("kernel", ("커널만", "Kernel only")),
        ("e2e", ("전송 포함 전체", "Whole pipeline")),
    ]
    runs = []
    for skey, _ in stages:
        for r in rows:
            src = r["kernel_only"] if skey == "kernel" else r["end_to_end"]
            move = r["h2d_only"]["ms"] + r["d2h_only"]["ms"]
            runs.append({
                "in": {"stage": skey, "batch": r["batch"]},
                "out": {
                    "ms": round(src["ms"], 3),
                    "mre": round(src["mre_per_s"], 1),
                    "move_ms": round(move, 3),
                },
            })
    write("chanest", {
        "id": "chanest",
        "product": {
            "ko": (
                "다중경로가 심한 조건에서 채널을 추정하는 GPU 커널입니다. 커널 하나만 재면 아주 빠른데, "
                "실제로 쓰이려면 데이터가 GPU 를 오가야 합니다. 그 둘을 같은 표에 나란히 두었습니다."
            ),
            "en": (
                "A GPU kernel that estimates the channel under severe multipath. Timed on its own it is very fast, but "
                "using it means moving data on and off the device. Both are in the same table here."
            ),
        },
        "howto": {
            "ko": "배치를 키우면서 커널만 잰 값과 전송까지 포함한 값을 번갈아 보세요.",
            "en": "Grow the batch and switch between the kernel-only timing and the whole pipeline.",
        },
        "controls": [
            {"key": "batch", "label": {"ko": "한 번에 처리하는 배치", "en": "Batch size"}, "type": "select",
             "default_index": [r["batch"] for r in rows].index(256),
             "options": [{"value": r["batch"], "label": {"ko": str(r["batch"]), "en": str(r["batch"])}} for r in rows]},
            {"key": "stage", "label": {"ko": "무엇을 재나", "en": "What is being timed"}, "type": "select",
             "options": [{"value": k, "label": {"ko": lab[0], "en": lab[1]}} for k, lab in stages]},
        ],
        "outputs": [
            {"key": "ms", "label": {"ko": "걸린 시간", "en": "Elapsed"}, "unit": "ms", "better": "lower"},
            {"key": "mre", "label": {"ko": "처리량", "en": "Throughput"}, "unit": "Mre/s", "better": "higher"},
            {"key": "move_ms", "label": {"ko": "이 배치의 전송 시간", "en": "Transfer time at this batch"}, "unit": "ms", "better": "lower"},
        ],
        "runs": runs,
        "verdict": {
            "ko": (
                "커널만 재면 배치 4096 에서 초당 67,084 Mre 까지 올라갑니다. 그런데 전송을 포함한 실제 처리량은 "
                "배치 256 에서 991 Mre 로 천장을 치고 그 뒤로는 오히려 내려갑니다. 예순여덟 배 차이입니다. "
                "커널을 더 빠르게 깎는 일은 이 지점부터 아무것도 바꾸지 못하고, 남은 개선은 전부 데이터를 "
                "옮기지 않는 쪽에 있습니다. 커널 시간만 보고했다면 정반대 결론을 냈을 것입니다."
            ),
            "en": (
                "Timed alone, the kernel reaches 67,084 Mre per second at batch 4096. Include the transfers and real "
                "throughput tops out at 991 Mre per second at batch 256, then falls. That is a factor of sixty-eight. "
                "Past this point, making the kernel faster changes nothing, and every remaining gain is in not moving "
                "the data. Reporting kernel time alone would have argued the opposite."
            ),
        },
        "provenance": {
            "backend": (
                f"Case {d['case']['name']}: {d['case']['n_used']} used subcarriers across "
                f"{d['case']['num_symbols']} symbols, {d['case']['total_re']} resource elements per batch item. "
                f"One Blackwell-class GPU ({d['device']['sm_count']} SMs). Vectors generated by the reference "
                "generator and replayed against the CPU implementation, so the GPU result is checked against a "
                "non-GPU oracle rather than trusted."
            ),
            "command": "phy_chanest_crossover_bench <vectors> multipath-severe-4096 out.json",
            "generated": "2026-08",
            "measured": True,
        },
    })
    return True


# ---------------------------------------------------------------- rffi
def build_rffi() -> bool:
    d = load("scaling-bench/results/preamble-division-crossrx.json")
    if not d:
        return False
    rows = d["raw_rows"]
    variants = [
        ("control", ("정규화 없음", "No normalization")),
        ("div_global", ("전역 프리앰블 나눗셈", "Global preamble division")),
        ("div_perdomain", ("수신기별 프리앰블 나눗셈", "Per-receiver preamble division")),
    ]
    seeds = sorted({r["seed"] for r in rows})
    probes = d["probes"]
    runs = []
    for p_ in probes:
        for vkey, _ in variants:
            for s_ in seeds:
                r = next(x for x in rows if x["probe"] == p_ and x["variant"] == vkey and x["seed"] == s_)
                runs.append({
                    "in": {"probe": p_, "variant": vkey, "seed": s_},
                    "out": {
                        "same_rx": r3(r["acc_same_rx"]),
                        "cross_rx": r3(r["acc_cross_rx"]),
                        "drop": r3(r["cross_rx_drop_vs_same_rx"]),
                    },
                })
    write("rffi", {
        "id": "rffi",
        "product": {
            "ko": (
                "송신기 여덟 대를 그 하드웨어 지문만으로 구별합니다. 어려운 부분은 구별이 아니라, 학습할 때와 "
                "다른 수신기로 들었을 때도 같은 답이 나오게 하는 것입니다. 수신기 지문이 송신기 지문에 섞여 "
                "들어오기 때문입니다. 프리앰블 나눗셈은 그 섞임을 지우자는 처방이고, 한 논문이 이걸로 교차 "
                "수신기 정확도를 15.5 에서 28.45 퍼센트포인트 올렸다고 보고했습니다. 이 표는 그 보고를 우리 "
                "합성 데이터에서 다시 돌려 본 기록입니다."
            ),
            "en": (
                "Tells eight transmitters apart by their hardware fingerprint alone. The hard part is not telling "
                "them apart, it is getting the same answer when a different receiver is listening, because the "
                "receiver's own fingerprint rides along with the transmitter's. Preamble division is one "
                "prescription for removing it, and a paper reports it lifting cross-receiver accuracy by 15.5 to "
                "28.45 points. This table is that report, run again on our synthetic data."
            ),
        },
        "howto": {
            "ko": "처방을 바꾸고 시드도 바꿔 보세요. 같은 수신기 정확도와 다른 수신기 정확도를 나란히 봅니다.",
            "en": "Change the prescription, then change the seed. Watch same-receiver and cross-receiver accuracy side by side.",
        },
        "controls": [
            {"key": "variant", "label": {"ko": "적용한 처방", "en": "Prescription applied"}, "type": "select",
             "options": [{"value": k, "label": {"ko": lab[0], "en": lab[1]}} for k, lab in variants]},
            {"key": "probe", "label": {"ko": "프로브 지점", "en": "Probe point"}, "type": "select",
             "options": [{"value": x, "label": {"ko": x, "en": x}} for x in probes]},
            {"key": "seed", "label": {"ko": "난수 시드", "en": "Random seed"}, "type": "select",
             "options": [{"value": x, "label": {"ko": str(x), "en": str(x)}} for x in seeds]},
        ],
        "outputs": [
            {"key": "same_rx", "label": {"ko": "학습과 같은 수신기", "en": "Same receiver as training"}, "unit": "", "better": "higher"},
            {"key": "cross_rx", "label": {"ko": "다른 수신기", "en": "Held out receiver"}, "unit": "", "better": "higher"},
            {"key": "drop", "label": {"ko": "수신기가 바뀔 때 손실", "en": "Loss when the receiver changes"}, "unit": "", "better": "lower"},
        ],
        "runs": runs,
        "verdict": {
            "ko": (
                "여덟 대 중 하나를 찍으면 0.125 입니다. 어느 처방을 걸어도, 어느 시드를 써도 다른 수신기 "
                "정확도는 0.19 에서 0.23 사이를 벗어나지 않았습니다. 처방이 만든 개선폭은 최대 0.38 "
                "퍼센트포인트로, 그 변형 자신의 시드 간 표준편차 3.3 퍼센트포인트보다 작습니다. 그러니 "
                "재현되지 않았다고는 말할 수 있어도 논문이 틀렸다고는 말할 수 없습니다. 여기서는 같은 "
                "수신기 정확도조차 0.22 근처라 지문 신호 자체가 약했고, 신호가 약한 자리에서는 전처리 "
                "하나가 만들 수 있는 개선의 상한도 낮습니다. 이 조건에 검출할 파워가 없었다는 쪽이 정확한 "
                "설명입니다."
            ),
            "en": (
                "Guessing one of eight scores 0.125. No prescription and no seed moved cross-receiver accuracy out "
                "of the 0.19 to 0.23 band. The largest gain any prescription produced was 0.38 points, smaller than "
                "that same variant's own spread across seeds, 3.3 points. So this says the result did not reproduce "
                "here. It does not say the paper is wrong. Same-receiver accuracy sits near 0.22 in this setup, "
                "meaning the fingerprint signal itself is weak, and where the signal is weak the ceiling on what any "
                "single preprocessing step can add is low as well. The honest reading is that these conditions had "
                "no power to detect the effect."
            ),
        },
        "provenance": {
            "backend": (
                f"Eight transmitters heard by two receivers in a SYNTHETIC fleet generator, not captured RF. "
                f"{d['classifier']} on a {d['win']} sample window, {d['n_seeds']} seeds per cell, two probe points "
                "in the chain. Training uses one receiver and the held out column is a receiver the model never "
                "saw. The generator has no shared known preamble, so the reference spectrum was approximated by a "
                "per domain magnitude envelope, which leaves phase distortion in place and is weaker than the "
                f"method the paper describes. Every cell is one real training run, {len(rows)} runs in total, "
                f"{d['elapsed_sec']:.0f} seconds of compute."
            ),
            "command": "preamble_division_crossrx --probes P0,P1 --seeds 5 --win 256",
            "generated": "2026-07",
            "measured": True,
        },
    })
    return True


def main() -> int:
    if not SRC.exists():
        print(f"원본 저장소가 이 머신에 없습니다: {SRC}")
        print("산출물은 이미 커밋되어 있으므로 아무것도 바꾸지 않고 끝냅니다.")
        return 0
    print(f"원본: {SRC}")
    ok = all([build_amc(), build_jammer(), build_ldpc(), build_chanest(), build_rffi()])
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
