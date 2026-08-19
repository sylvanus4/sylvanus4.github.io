// 다섯 갈래, 각각 한 레코드.
//
// 한국어와 영어가 같은 레코드 안에 있다. 언어별 파일로 나누면 한쪽에만 항목이
// 늘어나는 사고가 나고, 이 저장소에서 이미 두 번 났다.
//
// `finding` 은 실제로 돌려서 나온 결과다. 시뮬레이터 추정도, 논문 인용도 아니다.
// 어떤 조건에서 쟀는지는 각 조회표의 provenance 가 그대로 들고 있다.

export const SYSTEMS = [
  {
    id: 'amc',
    name: '변조 인식',
    name_en: 'Modulation recognition',
    accent: '#38BDF8',
    domain: { ko: '스펙트럼 인식', en: 'Spectrum awareness' },
    backend: { ko: '합성 RRC 벤치 · 출하 특징 이식', en: 'Synthetic RRC bench, shipped features' },
    plot: { x: 'snr', series: 'clf', y: 'acc',
            ref: { value: 0.125, label: { ko: '찍었을 때 0.125', en: 'chance 0.125' } } },
    legend: {
      ko: '가로는 수신 SNR, 세로는 8종 판정 정확도입니다. 오른쪽으로 갈수록 신호가 깨끗해지는데, 아래쪽 곡선은 그 방향으로 내려갑니다.',
      en: 'Receive SNR across, eight-way accuracy up. The signal gets cleaner to the right, and the lower curve goes down as it does.',
    },
    headline: {
      ko: '출하된 판정 규칙이 신호가 깨끗해질수록 나빠집니다',
      en: 'The shipped decision rule gets worse as the signal gets cleaner',
    },
    finding: {
      ko: '최근접 중심 규칙은 4 dB 에서 0.711 로 정점을 찍고 20 dB 에서 0.403 까지 내려갑니다. 특징 벡터는 출하 코드에서 그대로 옮겨 온 것이라, 이건 이상적인 특징이 아니라 실제로 도는 특징을 잰 값입니다. 같은 특징에 부스팅을 얹으면 전 구간 0.729 로 그 함정을 피합니다.',
      en: 'The nearest-centroid rule peaks at 0.711 at 4 dB and falls to 0.403 at 20 dB. The feature vector is a port of what ships, so this measures the real feature set rather than an idealized one. Boosting on those same features holds 0.729 overall and does not fall.',
    },
    stat: [
      { k: { ko: '정점 SNR', en: 'Peak SNR' }, v: '4 dB' },
      { k: { ko: '20 dB 정확도', en: 'Accuracy at 20 dB' }, v: '0.403' },
      { k: { ko: '부스팅 전 구간', en: 'Boosting, all SNR' }, v: '0.729' },
    ],
  },
  {
    id: 'ldpc',
    name: 'LDPC 복호 커널',
    name_en: 'LDPC decode kernel',
    accent: '#34D399',
    domain: { ko: '물리계층 · GPU 커널', en: 'Physical layer, GPU kernel' },
    backend: { ko: '공개 레퍼런스 복호기 2종과 비트 대조', en: 'Bit-compared against two public decoders' },
    plot: { x: 'ebno', series: 'oracle', y: 'ref_bler', y2: 'our_bler',
            y2label: { ko: '우리 커널', en: 'Our kernel' } },
    legend: {
      ko: '가로는 채널 품질, 세로는 블록오류율입니다. 점선이 우리 커널이고 실선이 레퍼런스입니다. 오른쪽에서 셋이 겹칩니다.',
      en: 'Channel quality across, block error rate up. The dashed line is our kernel, the solid ones are the references. They meet on the right.',
    },
    headline: {
      ko: '1.0 dB 위에서는 레퍼런스와 비트까지 같은 답을 냅니다',
      en: 'Above 1.0 dB the answers are bit-identical to the reference',
    },
    finding: {
      ko: '직접 쓴 GPU 커널이 맞는지를 스스로 주장하는 대신, 같은 입력을 공개 복호기 두 종에 통과시켜 대조했습니다. 1.0 dB 위에서는 출력이 99에서 100 퍼센트 완전히 일치합니다. 0.5 dB 에서는 갈라져 블록오류율이 0.420 대 0.075 로 벌어지는데, 같은 최소합 계열과 견주면 0.420 대 0.370 이라 이 격차는 구현 결함이 아니라 근사 자체의 손실입니다.',
      en: 'Rather than assert the hand-written GPU kernel is correct, the same inputs went through two public decoders. Above 1.0 dB the outputs match bit for bit, 99 to 100 percent of the time. At 0.5 dB they part: 0.420 against 0.075 block error rate. Against the same min-sum family it is 0.420 against 0.370, so the gap is the approximation and not a bug.',
    },
    stat: [
      { k: { ko: '완전 일치 (1.0 dB 이상)', en: 'Bit-identical, 1.0 dB and up' }, v: '99~100%' },
      { k: { ko: '0.5 dB 격차', en: 'Gap at 0.5 dB' }, v: '0.420 / 0.075' },
      { k: { ko: '같은 계열과는', en: 'Same family' }, v: '0.420 / 0.370' },
    ],
  },
  {
    id: 'chanest',
    name: '채널추정 처리량',
    name_en: 'Channel estimation throughput',
    accent: '#FBBF24',
    domain: { ko: '물리계층 · 처리량', en: 'Physical layer, throughput' },
    backend: { ko: 'GPU 커널 · CPU 오라클 대조', en: 'GPU kernel, checked against a CPU oracle' },
    plot: { x: 'batch', series: 'stage', y: 'mre', logx: true, logy: true },
    legend: {
      ko: '가로는 배치, 세로는 초당 처리량입니다. 둘 다 로그 눈금입니다. 위 곡선은 계속 올라가는데 아래 곡선은 중간에서 멈춥니다.',
      en: 'Batch across, throughput up, both on log scales. The upper curve keeps climbing. The lower one stops in the middle.',
    },
    headline: {
      ko: '커널은 예순여덟 배 빠른데 파이프라인은 거기서 멈춥니다',
      en: 'The kernel is sixty-eight times faster. The pipeline is not.',
    },
    finding: {
      ko: '커널만 재면 배치 4096 에서 초당 67,084 Mre 까지 갑니다. 전송을 포함한 실제 처리량은 배치 256 에서 991 Mre 로 천장을 치고 그 뒤로는 내려갑니다. 이 지점부터 커널을 더 깎는 일은 아무것도 바꾸지 못하고, 남은 개선은 전부 데이터를 옮기지 않는 쪽에 있습니다. 커널 시간만 보고했다면 정반대 결론을 냈을 것입니다.',
      en: 'Timed alone the kernel reaches 67,084 Mre per second at batch 4096. With transfers included, real throughput tops out at 991 at batch 256 and then falls. Past that point, a faster kernel changes nothing and every remaining gain is in not moving the data. Reporting kernel time alone would have argued the opposite.',
    },
    stat: [
      { k: { ko: '커널 최고', en: 'Kernel peak' }, v: '67,084 Mre/s' },
      { k: { ko: '전체 최고', en: 'Pipeline peak' }, v: '991 Mre/s' },
      { k: { ko: '천장이 오는 배치', en: 'Batch at the ceiling' }, v: '256' },
    ],
  },
  {
    id: 'rffi',
    name: '송신기 지문',
    name_en: 'Transmitter fingerprinting',
    accent: '#A78BFA',
    domain: { ko: '무선 신원 · 일반화', en: 'RF identity and generalization' },
    backend: { ko: '합성 무선 데이터셋 · 시드 5개 반복', en: 'Synthetic RF dataset, five seeds per cell' },
    plot: { x: 'seed', series: 'variant', y: 'cross_rx',
            ref: { value: 0.125, label: { ko: '찍었을 때 0.125', en: 'chance 0.125' } } },
    legend: {
      ko: '가로는 난수 시드, 세로는 학습 때와 다른 수신기로 들었을 때의 정확도입니다. 세 처방이 서로 붙어 있고, 위아래로도 거의 움직이지 않습니다.',
      en: 'Seed across, accuracy on a receiver the model never trained on up. The three prescriptions sit on top of each other and barely move.',
    },
    headline: {
      ko: '논문이 보고한 개선폭이 우리 조건에서는 재현되지 않았습니다',
      en: 'The improvement a paper reported did not reproduce in our conditions',
    },
    finding: {
      ko: '프리앰블 나눗셈으로 교차 수신기 정확도가 15.5 에서 28.45 퍼센트포인트 올랐다는 보고를 우리 합성 데이터에서 다시 돌렸습니다. 개선폭은 최대 0.38 퍼센트포인트로, 시드 간 표준편차 3.3 퍼센트포인트에 묻힙니다. 다만 여기서는 같은 수신기 정확도조차 0.22 근처라 지문 신호 자체가 약했습니다. 논문이 틀렸다기보다 이 조건에 그 효과를 검출할 파워가 없었다고 적는 편이 정확하고, 그렇게 적어 두었습니다.',
      en: 'A paper reports preamble division lifting cross-receiver accuracy by 15.5 to 28.45 points. Run again on our synthetic data, the largest gain is 0.38 points, buried under a 3.3 point spread across seeds. But same-receiver accuracy here sits near 0.22, so the fingerprint signal itself is weak. Rather than call the paper wrong, the honest entry is that these conditions had no power to detect the effect, and that is what the record says.',
    },
    stat: [
      { k: { ko: '논문이 보고한 개선', en: 'Reported in the paper' }, v: '+15.5~28.45%p' },
      { k: { ko: '우리 조건에서', en: 'In our conditions' }, v: '+0.38%p 이하' },
      { k: { ko: '시드 간 표준편차', en: 'Spread across seeds' }, v: '0.3~3.3%p' },
    ],
  },
  {
    id: 'jammer',
    name: '재밍 유형 판별',
    name_en: 'Jammer taxonomy',
    accent: '#F87171',
    domain: { ko: '전자전 · 간섭 분류', en: 'Electronic warfare, interference' },
    backend: { ko: '합성 재밍 뱅크 · 24개 특징', en: 'Synthetic jammer bank, 24 features' },
    plot: { x: 'jsr', series: 'cls', y: 'acc' },
    legend: {
      ko: '가로는 재밍 대 신호비, 세로는 그 종류를 맞힌 비율입니다. 여섯 곡선이 왼쪽 끝에서만 갈라집니다.',
      en: 'Jam-to-signal ratio across, accuracy for that type up. The six curves only separate at the left edge.',
    },
    headline: {
      ko: '여섯 종류를 가르는 데 무너지는 구간이 없었습니다',
      en: 'No ratio tested made any of the six types collapse',
    },
    finding: {
      ko: '매크로 F1 은 0.9928 이고, 정확도가 0.6 아래로 내려가는 JSR 칸은 한 종류에도 없습니다. 남은 오류는 신호가 잡음에 묻히는 -10 dB 두 칸뿐이고, 둘 다 시간축에서 실제로 닮은 쌍입니다. 다만 이건 합성 뱅크라 문제가 여기서 쉽다는 뜻이지 풀렸다는 뜻은 아닙니다. 대응이 종류마다 다르기 때문에 있다 없다보다 무엇인가를 물은 것이 이 실험의 요점입니다.',
      en: 'Macro F1 is 0.9928 and no type drops below 0.6 accuracy at any ratio tested. The only errors sit at -10 dB where the jammer is buried in noise, between pairs that genuinely resemble each other in time. This is a synthetic bank, so it says the problem is easy here, not solved. The point of the experiment is that the response differs by type, so the useful question is which one rather than whether.',
    },
    stat: [
      { k: { ko: '매크로 F1', en: 'Macro F1' }, v: '0.9928' },
      { k: { ko: '붕괴 구간', en: 'Collapse buckets' }, v: '0' },
      { k: { ko: '가장 낮은 칸', en: 'Worst cell' }, v: '0.714' },
    ],
  },
];
