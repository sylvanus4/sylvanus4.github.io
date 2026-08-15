// Ten independent systems, one record each.
//
// Korean and English live in the SAME record on purpose. Splitting them into
// two files is how a list quietly grows an entry on one side only, which has
// already happened twice on other pages here.
//
// `finding` is a measurement taken against a real backend, not a simulator and
// not a projection. The open backlog for each system lives in the private
// console, not here: a portfolio shows what a system does, and the work still
// queued behind it is not the visitor's business.

export const PROJECTS = [
  {
    id: 'siliconpilot',
    legend: { ko: '게이트 스택 두 개입니다. 합성이 둘을 같게 만들기 때문에 합동으로 그렸습니다. 사이를 잇는 가로선이 요점입니다.', en: 'Two gate stacks, drawn congruent because synthesis makes them so. The rungs between them are the point.' },
    name: 'SiliconPilot',
    scene: 'lattice',
    accent: '#38BDF8',
    domain: { ko: '반도체 설계공간 탐색', en: 'EDA / design-space exploration' },
    backend: { ko: '실제 논리합성', en: 'Real logic synthesis' },
    headline: {
      ko: '덧셈기 두 구조가 같은 넷리스트로 합성됩니다',
      en: 'Two adder architectures synthesize to the same netlist',
    },
    finding: {
      ko: 'ripple carry와 carry lookahead는 시험한 모든 지점에서 완전히 같은 넷리스트를 냅니다. 기준 설정에서 셀 46개, 레벨 17개로 똑같습니다. 시뮬레이터는 두 구조에 서로 다른 면적을 매기지만, 합성을 한 번 거치고 나면 튜닝 파라미터 네 개 중 하나는 아무것도 움직이지 않는 손잡이였습니다.',
      en: 'ripple_carry and carry_lookahead produce identical netlists at every tested point, 46 cells and 17 levels at the baseline. The simulator gives them different areas. After synthesis, one of the four tunable parameters turns out to move nothing at all.',
    },
    stat: [
      { k: { ko: '셀', en: 'Cells' }, v: '46' },
      { k: { ko: '레벨', en: 'Levels' }, v: '17' },
      { k: { ko: '합성 지점', en: 'Synthesized points' }, v: '6' },
    ],
  },
  {
    id: 'orbitguard',
    legend: { ko: '궤도 세 겹입니다. 붉은 매듭은 카탈로그가 분리거리 0으로 보고하는 물체 열둘이고, 초록 하나가 실제 접근입니다.', en: 'Three shells. The red knot is twelve objects the catalogue reports at zero separation; green is the one real encounter.' },
    name: 'OrbitGuard',
    scene: 'orbits',
    accent: '#A78BFA',
    domain: { ko: '위성 근접 스크리닝', en: 'Conjunction screening' },
    backend: { ko: '공개 궤도 카탈로그 + SGP4', en: 'Public orbital catalogue + SGP4' },
    headline: {
      ko: '스크리닝한 210쌍 중 31쌍은 같은 물체를 두 번 센 것입니다',
      en: '31 of 210 screened pairs are the same object counted twice',
    },
    finding: {
      ko: '정거장 군집 21개 객체 가운데 12개는 실제로 도킹된 상태라 동일한 궤도 요소를 발표합니다. 그 쌍들은 분리거리가 0.000 km로 계산되어, 40.8 km까지 실제로 접근하는 단 하나의 진짜 사건보다 전부 위에 올라옵니다. 위험도 순위표의 상단이 사건이 아니라 중복이었습니다.',
      en: 'Twelve of the twenty-one station-group objects are physically docked and publish identical element sets. Those pairs compute to 0.000 km of separation, so every one of them ranks above the single genuine 40.8 km encounter. The top of the risk table was duplication, not events.',
    },
    stat: [
      { k: { ko: '스크리닝 쌍', en: 'Pairs screened' }, v: '210' },
      { k: { ko: '중복 쌍', en: 'Duplicate pairs' }, v: '31' },
      { k: { ko: '진짜 최근접', en: 'Real closest approach' }, v: '40.8 km' },
    ],
  },
  {
    id: 'embodied',
    legend: { ko: '왼쪽은 물리 환경이 두 정책을 갈라놓은 모습이고, 오른쪽은 가벼운 환경이 둘을 같은 실패로 뭉갠 모습입니다.', en: 'Left, the physics environment separates the two policies. Right, the lite one collapses them into one failure.' },
    name: 'Embodied Lab',
    scene: 'workspace',
    accent: '#34D399',
    domain: { ko: '로봇 정책 평가', en: 'Robot policy evaluation' },
    backend: { ko: 'MuJoCo 물리 엔진', en: 'MuJoCo physics' },
    headline: {
      ko: '가벼운 환경은 두 정책을 구분하지 못합니다',
      en: 'The lightweight environment cannot tell the two policies apart',
    },
    finding: {
      ko: 'MuJoCo에서 파지 오프셋 정책은 40회 중 25회, 비례 제어 정책은 4회 성공합니다. 물리를 단순화한 환경에서는 둘 다 4회입니다. 옮겨 쓸 수 있는 정책과 시뮬레이터에서만 되는 정책을 구조적으로 가려내지 못합니다. 평가 환경을 바꾸자 순위가 아니라 존재 여부가 바뀌었습니다.',
      en: 'Under MuJoCo the grasp-offset policy scores 25 of 40 and the proportional one scores 4. Under the physics-lite environment both score 4. It structurally cannot separate a transferable policy from one that only works in simulation. Changing the evaluator did not reorder the ranking, it erased it.',
    },
    stat: [
      { k: { ko: '물리 엔진', en: 'Physics' }, v: '25 / 40 · 4 / 40' },
      { k: { ko: '단순 환경', en: 'Lite env' }, v: '4 / 40 · 4 / 40' },
      { k: { ko: '시행', en: 'Trials' }, v: '40' },
    ],
  },
  {
    id: 'bioproof',
    legend: { ko: '3분의 2 지점에서 접힘이 풀리는 백본입니다. 색은 모델이 스스로 매긴 신뢰도이고 거의 움직이지 않습니다.', en: 'A backbone that loses its fold two thirds along. Colour is the model\'s own confidence, which barely moves.' },
    name: 'BioProof',
    scene: 'ribbon',
    accent: '#F472B6',
    domain: { ko: '단백질 구조 예측 신뢰도', en: 'Structure prediction reliability' },
    backend: { ko: '자체 GPU 폴딩 + 공개 구조 아카이브', en: 'In-house GPU folding + public structure archives' },
    headline: {
      ko: '신뢰도는 절반이 되고 정확도는 열네 배로 떨어집니다',
      en: 'Confidence halves while accuracy falls fourteenfold',
    },
    finding: {
      ko: '단일 서열만 주고 접었을 때 다섯 표적 중 셋은 성공하고 둘은 실패합니다. 실패한 쪽에서 모델이 스스로 매긴 신뢰도는 0.955에서 0.510으로 내려가지만, 실제 정확도는 0.99에서 0.067로 무너집니다. 실패를 감지하기는 하되 그 크기만큼 보고하지는 못합니다. 실패한 둘은 모두 이황화 결합이 많은 작은 단백질이었습니다.',
      en: 'Folded from single sequences, the model succeeds on three targets and fails two. On the failures its own confidence drops from 0.955 to 0.510 while observed accuracy collapses from 0.99 to 0.067. It detects the failure but cannot report it proportionally. Both failures are small, disulfide-rich proteins.',
    },
    stat: [
      { k: { ko: '신뢰도', en: 'Confidence' }, v: '0.955 → 0.510' },
      { k: { ko: '정확도', en: 'Accuracy' }, v: '0.99 → 0.067' },
      { k: { ko: '보정 오차', en: 'Calibration error' }, v: '0.043 → 0.443' },
    ],
  },
  {
    id: 'gridmind',
    legend: { ko: '한 계절 치 실측 일사량입니다. 붉은 띠는 흩어진 결측이 아니라 이어진 흐림 한 구간입니다.', en: 'A season of measured irradiance. The red band is one contiguous overcast run, not scattered dropouts.' },
    name: 'GridMind',
    scene: 'surface',
    accent: '#FBBF24',
    domain: { ko: '마이크로그리드 급전 계획', en: 'Microgrid dispatch' },
    backend: { ko: '공개 기상 관측 아카이브', en: 'Public weather archive' },
    headline: {
      ko: '합성한 하늘에는 기억이 없습니다',
      en: 'The synthetic sky has no memory',
    },
    finding: {
      ko: '실측 구름은 한 시간 지연 자기상관이 +0.881이고 최악 부족 구간이 15시간 이어집니다. 생성기는 -0.031에 3시간입니다. 구름 확률을 올려 평균 일사량을 맞춰도 자기상관은 -0.006에 머뭅니다. 파라미터를 돌려 좁힐 수 있는 차이가 아니라 구조가 다릅니다. 흐린 날은 이어지는데 생성기의 흐림은 매 시각 새로 뽑힙니다.',
      en: 'Measured cloud has a lag-1 autocorrelation of +0.881 and a worst shortfall run of 15 hours. The generator gives -0.031 and 3 hours. Raising the cloud probability matches the mean irradiance and leaves the autocorrelation at -0.006. This is not a gap tuning can close: real overcast persists, while the generator redraws it every hour.',
    },
    stat: [
      { k: { ko: '실측 자기상관', en: 'Measured lag-1' }, v: '+0.881' },
      { k: { ko: '합성 자기상관', en: 'Synthetic lag-1' }, v: '-0.031' },
      { k: { ko: '최악 부족 구간', en: 'Worst shortfall run' }, v: '15 h · 3 h' },
    ],
  },
  {
    id: 'vaultai',
    legend: { ko: '아무것도 넘지 않는 경계 안의 문서 아홉 개입니다. 붉은 표시는 유출 탐지 게이트가 지목한 구간입니다.', en: 'Nine documents inside a boundary nothing crosses. Red marks a span the disclosure gate flagged.' },
    name: 'VaultAI',
    scene: 'vault',
    accent: '#60A5FA',
    domain: { ko: '망분리 문서 작업대', en: 'Air-gapped document workspace' },
    backend: { ko: '로컬 언어모델 + 실제 문서 코퍼스', en: 'Local language model + a real corpus' },
    headline: {
      ko: '충실하지만 막연하면 그것도 실패입니다',
      en: 'Faithful and vague is still a failure',
    },
    finding: {
      ko: '발췌형 응답기가 근거 없는 수치를 0건 낸 것은 얻어낸 성질이 아니라 구조상 당연한 결과입니다. 재현율 60.5%는 807자를 통째로 돌려주며 그 안에 수치 414개를 담아 얻은 값이고 정밀도는 12.6%입니다. 모델은 36자로 65.5%를 답하는 대신 수치 58개 중 8개를 근거 없이 씁니다. 보증과 구체성을 맞바꾸는 거래이지 한쪽이 다른 쪽보다 나은 문제가 아닙니다.',
      en: "The extractive answerer's zero unsupported figures is structural, not earned. Its 60.5% recall comes from returning 807 characters holding 414 figures, which is 12.6% precision. The model answers in 36 characters at 65.5% recall and pays 8 unsupported figures out of 58. The trade is guarantee against specificity, not one method beating the other.",
    },
    stat: [
      { k: { ko: '발췌형', en: 'Extractive' }, v: '60.5% / 12.6%' },
      { k: { ko: '모델', en: 'Model' }, v: { ko: '65.5% / 36자', en: '65.5% / 36ch' } },
      { k: { ko: '근거 없는 수치', en: 'Unsupported figures' }, v: '0 · 8 / 58' },
    ],
  },
  {
    id: 'blackbox',
    legend: { ko: '기록된 실행과, 순서를 바꿨을 때 갈라지는 가지입니다. 재생은 기록된 순서를 따라가므로 붉은 길을 걷지 않습니다.', en: 'A recorded run and the branch a reordering takes. Replay follows the recorded order and never walks the red path.' },
    name: 'BlackBox',
    scene: 'dag',
    accent: '#F87171',
    domain: { ko: '에이전트 기록과 재생', en: 'Agent record and replay' },
    backend: { ko: '로컬 언어모델 의사결정', en: 'Local language model decisions' },
    headline: {
      ko: '재생은 통과하는데 기록이 오해를 만듭니다',
      en: 'Replay passes while the trace misleads',
    },
    finding: {
      ko: '같은 입력에 같은 답이 나오므로 재생은 어긋남을 다섯 번 중 0건으로 보고합니다. 그런데 선택지 순서만 바꾸면 45%의 경우 결정이 달라지고, 재생은 기록해 둔 그 순서를 그대로 다시 먹입니다. 그래서 재생이 통과했다는 사실은 결정이 재현된다는 뜻이지, 기록이 이유를 설명한다는 뜻이 아닙니다.',
      en: 'The model reproduces itself perfectly, so replay reports zero divergence across five runs. But permuting the offers changes the choice 45% of the time, and replay feeds the recorded order straight back. A passing replay means the decision reproduces, not that the trace explains it.',
    },
    stat: [
      { k: { ko: '재현성', en: 'Reproducibility' }, v: '100%' },
      { k: { ko: '순서 불변성', en: 'Order invariance' }, v: '54.5%' },
      { k: { ko: '재생 어긋남', en: 'Replay divergence' }, v: '0 / 5' },
    ],
  },
  {
    id: 'forge',
    legend: { ko: '후보들이 만드는 프런티어입니다. 큰 점 두 개가 모두 4비트이고, 표에서는 한 줄로 합쳐져 있던 것들입니다.', en: 'A frontier of candidates. The two large points are both four-bit formats that one table row would merge.' },
    name: 'Forge',
    scene: 'pareto',
    accent: '#2DD4BF',
    domain: { ko: '서빙 오토튜너', en: 'Serving autotuner' },
    backend: { ko: '자체 GPU 실측 + 품질 채점', en: 'In-house GPU measurement + quality scoring' },
    headline: {
      ko: '4비트는 하나가 아닙니다',
      en: 'Four-bit is not one thing',
    },
    finding: {
      ko: '두 가지 4비트 방식은 똑같이 가중치를 4비트로 줄이지만 품질 보존율이 0.9177과 0.9482로 3포인트 벌어집니다. 라우터가 참조하던 상수표에는 정수형 한 줄뿐이고 부동소수점 4비트 줄은 아예 없었습니다. 같은 이름으로 묶여 있던 두 가지가 실제로는 다른 선택지였습니다.',
      en: 'Two four-bit schemes reduce weights to the same bit width and differ by three points of quality retention, 0.9177 against 0.9482. The constants table the router consulted had a single integer row and no floating-point four-bit row at all. Two different options were filed under one name.',
    },
    stat: [
      { k: { ko: '정수 4비트', en: 'Integer 4-bit' }, v: '0.9177' },
      { k: { ko: '부동 4비트', en: 'Float 4-bit' }, v: '0.9482' },
      { k: { ko: '차이', en: 'Delta' }, v: '3.05 pt' },
    ],
  },
  {
    id: 'helios',
    legend: { ko: '장치 여덟 대입니다. 아래 어두운 기둥이 유휴 전력이고, 위의 밝은 부분만 작업이 만들어낸 몫입니다.', en: 'Eight devices. The dim lower column is idle draw; the bright cap is the part the work causes.' },
    name: 'Helios',
    scene: 'fleet',
    accent: '#818CF8',
    domain: { ko: 'AI 인프라 배치 계획', en: 'AI deployment planning' },
    backend: { ko: '자체 GPU 처리량과 전력 실측', en: 'In-house throughput and power measurement' },
    headline: {
      ko: '최대 부하에서도 전력의 63.8%는 유휴분입니다',
      en: 'At peak load 63.8% of the power is idle draw',
    },
    finding: {
      ko: '동시성을 1에서 16으로 올리면 처리량이 13.4배가 되는데 토큰 사이 지연은 1.4밀리초에서 평평합니다. 전력은 388W에서 포화하고 그중 247.8W는 아무 요청이 없어도 나가던 몫입니다. 토큰당 에너지가 9.2배 좋아진 것은 효율이 좋아진 것이 아니라 이미 내고 있던 전력을 여럿이 나눠 쓴 결과입니다.',
      en: 'Raising concurrency from 1 to 16 scales throughput 13.4x while inter-token latency stays flat at about 1.4 ms. Power saturates at 388 W, of which 247.8 W was being drawn with no requests at all. Energy per token improving 9.2x is not efficiency arriving, it is a bill that was already being paid getting shared.',
    },
    stat: [
      { k: { ko: '처리량', en: 'Throughput' }, v: '13.4x' },
      { k: { ko: '토큰 간 지연', en: 'Inter-token latency' }, v: '~1.4 ms' },
      { k: { ko: '유휴 전력', en: 'Idle draw' }, v: '247.8 / 388 W' },
    ],
  },
  {
    id: 'omniindex',
    legend: { ko: '해시가 만드는 군집 다섯 개입니다. 붉은 점은 어디에도 속하지 않으면서 한 군집의 최근접 이웃입니다.', en: 'Five clusters of hashes. The red point belongs to none of them and is still the nearest neighbour to one.' },
    name: 'OmniIndex',
    scene: 'constellation',
    accent: '#C084FC',
    domain: { ko: '멀티모달 검색', en: 'Multimodal retrieval' },
    backend: { ko: '실제 이미지와 오디오, 실제 코덱', en: 'Real images and audio through real codecs' },
    headline: {
      ko: '완벽하게 찾아내고도 답할 자격은 없습니다',
      en: 'Perfect retrieval, no right to answer',
    },
    finding: {
      ko: '두 해시 모두 JPEG 품질 25와 25% 축소를 무사히 통과하고 크롭에서 무너집니다. 가장자리를 5%씩만 잘라내도 한쪽은 44%로 떨어집니다. 다른 한쪽은 축소에서 100%를 찾아내지만, 진짜 짝의 가장 나쁜 값과 남의 것 중 가장 가까운 값을 갈라 놓을 임계값이 존재하지 않습니다. 검색이 맞았다는 것과 답해도 된다는 것은 다른 문제였습니다.',
      en: 'Both hashes sail through JPEG quality 25 and a resize to 25%, then collapse on crop. Taking 5% off each edge drops one of them to 44%. The other retrieves 100% under resize, yet no threshold separates its worst true match from its closest impostor. Retrieving correctly and being entitled to answer are different questions.',
    },
    stat: [
      { k: { ko: '코덱 통과', en: 'Survives codecs' }, v: 'JPEG q25 · 25%' },
      { k: { ko: '크롭 5%', en: 'Crop 5%' }, v: '44%' },
      { k: { ko: '사용 가능한 임계값', en: 'Usable threshold' }, v: { ko: '없음', en: 'None' } },
    ],
  },
];
