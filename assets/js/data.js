/* 포트폴리오 콘텐츠 원본.
   마크업과 카피를 분리해 둔다. 문구 수정은 이 파일만 고치면 된다. */

export const profile = {
  name: "한효정",
  nameEn: "Hyojung Han",
  role: "AI Systems Engineer",
  tagline: "연구에서 배포까지, 한 사람이 관통합니다",
  lead:
    "2007년부터 쉬지 않고 Daum, 삼성전자, Toss에서 인식 엔진과 머신러닝 플랫폼을 만들어 왔습니다. " +
    "지금은 ThakiCloud에서 추론·학습·에이전트 플랫폼 세 개를 기획하고 설계하고 있습니다.",
  sub:
    "모델 하나를 튜닝하는 일에서 멈추지 않습니다. 그 모델이 돌아갈 학습·추론 인프라, " +
    "그 위에 얹을 클라우드 플랫폼, 사용자가 실제로 쓰는 제품까지 직접 만듭니다.",
  photo: { webp: "assets/img/profile-960.webp", jpg: "assets/img/profile-960.jpg", alt: "한효정 프로필 사진" },
  location: "경기도 성남시 분당구",
  email: "hyojunguy@gmail.com",
  /* 전화번호는 공개 레포에 두지 않는다. 필요하면 메일로 요청받는다. */
  education: "연세대학교 컴퓨터과학과 석사 · 2007",
  current: { org: "ThakiCloud", where: "서울 역삼", since: "2025.04" }
};

export const stats = [
  { value: "19", unit: "년", label: "2007년부터 공백 없이" },
  { value: "2,260", unit: "편", label: "3개 언어 기술 블로그 운영" },
  { value: "49", unit: "편", label: "직접 돌린 실험 기록" },
  { value: "32", unit: "건", label: "동작하는 구현 사례" }
];

/* 스택 관통 — 3D 씬의 레이어와 1:1 대응한다. 순서를 바꾸면 씬도 같이 바뀐다. */
export const layers = [
  {
    id: "product",
    depth: 0,
    tag: "L5",
    title: "제품 · 사용자",
    line: "쓰는 사람이 있는 물건까지 만듭니다",
    body:
      "생성 AI 콘텐츠 앱을 직접 운영해 유료 결제 사용자 5만 명, 누적 매출 4억 원을 만들었습니다. " +
      "일본과 대만, 홍콩까지 내보냈고, 기획서가 아니라 결제되는 제품으로 검증했습니다.",
    keys: ["제품 기획", "풀스택 구현", "해외 출시", "수익화"]
  },
  {
    id: "platform",
    depth: 1,
    tag: "L4",
    title: "클라우드 플랫폼",
    line: "여러 팀이 함께 쓰는 판을 깝니다",
    body:
      "삼성 사내 클라우드에 Kubernetes 기반 ML 플랫폼을 올려 모델 배포 시간을 며칠에서 몇 시간으로 줄였습니다. " +
      "지금은 ThakiCloud에서 추론(Metis), 학습(Maxis), 에이전트(Paxis) 세 축을 설계합니다. " +
      "에이전트 쪽은 하네스와 루프, 그래프를 직접 엔지니어링합니다.",
    keys: ["Kubernetes", "멀티테넌시", "GPU 스케줄링", "에이전트 하네스", "GitOps"]
  },
  {
    id: "infra",
    depth: 2,
    tag: "L3",
    title: "학습 · 추론 인프라",
    line: "모델이 실제로 돌아가게 만듭니다",
    body:
      "파인튜닝 파이프라인과 서빙 스택을 직접 깔고 튜닝합니다. NVFP4와 W4A16으로 양자화하고 MoE를 압축해 " +
      "같은 GPU에서 더 많이 돌립니다. 음성과 영상 모델도 같은 방식으로 얹습니다.",
    keys: ["vLLM · Dynamo", "SFT · DPO · GRPO", "NVFP4 양자화", "TTS · STT · VLM", "CUDA"]
  },
  {
    id: "model",
    depth: 3,
    tag: "L2",
    title: "모델 · 알고리즘",
    line: "필요하면 엔진부터 새로 씁니다",
    body:
      "얼굴 인식, 음악 인식, 사물 인식 엔진을 외부 API 없이 처음부터 만들었습니다. " +
      "300만 곡을 실시간으로 찾아내고 700만 장의 이미지를 즉시 매칭하는 인덱싱 구조를 설계했습니다.",
    keys: ["컴퓨터 비전", "생성 모델", "검색 · 인덱싱", "최적화 이론"]
  },
  {
    id: "research",
    depth: 4,
    tag: "L1",
    title: "연구 · 검증",
    line: "졌으면 졌다고 씁니다",
    body:
      "가설을 세우고 실험을 돌리고 결과를 그대로 적습니다. 49편의 실험 기록 중에는 " +
      "제 모델이 벽인 줄 알았다가 다시 재보고 결론을 뒤집은 것도 있습니다.",
    keys: ["실험 설계", "정직한 측정", "재현 가능성", "반증"]
  }
];

/* 케이스 스터디 — 문제 / 접근 / 결과 3단 고정. 수치는 이력 원본 그대로. */
export const work = [
  {
    id: "thaki-platform",
    era: "2025 — 현재",
    org: "ThakiCloud",
    title: "AI 플랫폼 3종 기획 · 설계 · 구축",
    summary: "추론, 학습, 에이전트를 각각 담당하는 플랫폼 세 축을 세우고 팀을 이끌고 있습니다.",
    problem:
      "기업이 AI를 쓰려면 모델만으로는 안 됩니다. 모델을 서빙할 곳, 자기 데이터로 다시 학습시킬 곳, " +
      "그 결과를 실제 업무 흐름에 붙일 곳이 함께 있어야 합니다.",
    approach:
      "추론 플랫폼, 학습·파인튜닝 플랫폼, 에이전트 자동화 플랫폼으로 역할을 나눴습니다. " +
      "Kubernetes 위에 GPU 스케줄링과 멀티테넌시를 깔고, GitOps로 배포를 고정했습니다.",
    result:
      "세 제품의 로드맵과 아키텍처를 직접 설계하고 구현까지 관여하고 있습니다. 기획과 코드 사이에 통역이 필요 없습니다.",
    stack: ["Kubernetes", "vLLM", "Kueue", "ArgoCD", "Go", "React"],
    tags: ["플랫폼", "인프라", "리딩"],
    featured: true
  },
  {
    id: "thaki-blog",
    era: "2024 — 현재",
    org: "ThakiCloud",
    title: "기술 블로그 운영과 다국어 발행 파이프라인",
    summary: "한국어, 영어, 아랍어로 2,260편을 발행하는 기술 블로그를 세우고 직접 운영합니다.",
    problem:
      "플랫폼 제품은 기술적 신뢰가 쌓여야 팔립니다. 그런데 기술 글을 사람 손으로만 쓰면 주 한두 편이 한계라 " +
      "검색 유입도 브랜드도 좀처럼 쌓이지 않습니다.",
    approach:
      "Jekyll 기반 블로그를 세우고 초안 생성부터 사실 검증, 번역, 도식화, 배포까지 파이프라인으로 묶었습니다. " +
      "LLMOps, 에이전트 운영, 연구 리뷰, 튜토리얼 등 11개 카테고리로 나누고 품질 게이트를 코드로 강제했습니다.",
    result:
      "2024년 5월부터 지금까지 2,260편을 발행했습니다. 한국어 1,055편, 영어 647편, 아랍어 558편으로 " +
      "세 언어를 같은 품질 기준으로 유지하고 있습니다.",
    metrics: [
      { k: "누적 발행", v: "2,260편" },
      { k: "언어", v: "한국어 · 영어 · 아랍어" },
      { k: "카테고리", v: "11개" }
    ],
    stack: ["Jekyll", "GitHub Actions", "LLM 파이프라인", "다국어 i18n", "SEO"],
    tags: ["콘텐츠", "자동화", "운영"],
    link: { label: "블로그 열기", url: "https://thakicloud.com/tech-blog" },
    featured: true
  },
  {
    id: "2i-studio",
    era: "2024 — 2025",
    org: "2i Studio (창업)",
    title: "얼굴 기반 생성 AI 콘텐츠 플랫폼",
    summary: "동일인물성을 지키는 생성 파이프라인을 만들어 유료 사용자 5만 명까지 키웠습니다.",
    problem:
      "생성 모델로 사람 얼굴을 바꾸면 대체로 다른 사람이 됩니다. 아바타든 스티커든 " +
      "\"이게 나다\"라는 느낌이 사라지면 아무도 돈을 내지 않습니다.",
    approach:
      "DreamBooth 파인튜닝 파이프라인을 손봐 동일인물성 보존 기술을 구현했습니다. " +
      "FastAPI와 RabbitMQ로 생성 큐를 만들고, Expo와 Next.js로 앱과 웹을 함께 냈습니다.",
    result:
      "누적 매출 4억 원, 유료 결제 사용자 5만 명. 이모티콘과 게임 아바타, 광고 이미지로 쓰임새를 넓히고 " +
      "일본·대만·홍콩에 내보냈습니다.",
    metrics: [
      { k: "누적 매출", v: "4억 원" },
      { k: "유료 사용자", v: "5만 명" },
      { k: "진출 시장", v: "일본 · 대만 · 홍콩" }
    ],
    stack: ["Stable Diffusion", "DreamBooth", "PyTorch", "FastAPI", "RabbitMQ", "Next.js", "AWS"],
    tags: ["생성 AI", "제품", "수익화"],
    featured: true
  },
  {
    id: "toss-cdp",
    era: "2021 — 2023",
    org: "Toss",
    title: "고객 데이터 플랫폼과 개인화 예측",
    summary: "세그먼트를 쿼리로 깎던 일을 유저별 확률값으로 바꿨습니다.",
    problem:
      "푸시와 콘텐츠를 보낼 때마다 마케터가 SQL로 세그먼트를 새로 만들었습니다. " +
      "A/B 테스트는 결과를 기다리느라 늘 늦었습니다.",
    approach:
      "CTR·CVR 예측 모델을 서비스별·유저별로 돌려 확률값을 자동으로 채웠습니다. " +
      "A/B 테스트 판단 모델을 따로 만들어 실험을 조기에 끊을 수 있게 했습니다.",
    result:
      "클릭률과 전환율이 함께 올라 대출·카드·계좌 중계 매출에 기여했습니다. A/B 테스트 기간은 75% 줄었습니다.",
    metrics: [
      { k: "A/B 기간", v: "75% 단축" },
      { k: "적용 범위", v: "푸시 · UI 콘텐츠 전면" }
    ],
    stack: ["LightGBM", "CatBoost", "Airflow", "Python"],
    tags: ["ML", "개인화", "데이터"],
    featured: true
  },
  {
    id: "toss-tosst",
    era: "2023",
    org: "Toss",
    title: "디자이너용 그래픽 생성 도구 Tosst",
    summary: "캐릭터 하나에 몇 주 걸리던 작업을 2~3일로 줄였습니다.",
    problem:
      "2D·3D 에셋이 필요할 때마다 외주를 돌렸습니다. 기획에서 디자인, 개발로 넘어가는 사이클이 매번 막혔습니다.",
    approach:
      "Stable Diffusion 기반 프롬프트 엔진에 토스 스타일 템플릿을 얹어 디자이너 의도를 반영할 수 있게 만들었습니다. " +
      "토스증권 커뮤니티의 2D 캐릭터를 3D 스타일로 변환하는 경로도 붙였습니다.",
    result:
      "제작 주기가 몇 주에서 2~3일로 줄고 외주 비용 수천만 원을 아꼈습니다. " +
      "토스 블로그와 웹, 앱의 그래픽 전반에 쓰였습니다.",
    metrics: [
      { k: "제작 주기", v: "수 주 → 2~3일" },
      { k: "외주 비용", v: "수천만 원 절감" }
    ],
    stack: ["Stable Diffusion", "Prompt Engineering", "Python"],
    tags: ["생성 AI", "디자인 도구"],
    featured: true
  },
  {
    id: "toss-uigen",
    era: "2023",
    org: "Toss",
    title: "UI 코드 생성기와 RAG 검색 시스템",
    summary: "LLaMA를 사내 UI 코드로 파인튜닝해 프로토타입 시간을 분 단위로 내렸습니다.",
    problem:
      "디자인 시스템 문서는 있는데 찾기가 어려웠습니다. 컴포넌트를 다시 만들거나 스타일에 어긋나게 쓰는 일이 반복됐습니다.",
    approach:
      "YAML을 넣으면 토스 UI 시스템에 맞는 코드가 나오도록 LLaMA를 사내 데이터셋으로 파인튜닝했습니다. " +
      "문서와 코드, 스타일 가이드를 청킹해 임베딩하고 LangChain과 ChromaDB로 자연어 검색을 붙였습니다.",
    result:
      "UI 프로토타입 제작이 몇 시간에서 몇 분으로 줄었습니다. 신규 개발자 온보딩과 컴포넌트 재사용이 함께 좋아졌습니다.",
    metrics: [{ k: "프로토타입", v: "수 시간 → 수 분" }],
    stack: ["LLaMA", "HuggingFace", "LangChain", "ChromaDB", "OpenAI API"],
    tags: ["LLM", "RAG", "개발 도구"],
    featured: true
  },
  {
    id: "toss-face",
    era: "2022 — 2023",
    org: "Toss",
    title: "얼굴 결제와 스마트도어락 인증",
    summary: "3D 깊이 기반 위조 방지를 붙여 카드도 비밀번호도 없이 통과시켰습니다.",
    problem:
      "얼굴 인증은 사진 한 장으로 뚫립니다. 결제와 출입에 쓰려면 스푸핑을 먼저 막아야 했습니다.",
    approach:
      "3D 깊이 정보로 위조를 걸러내고 AdaFace와 ArcFace를 커스터마이징해 정확도를 올렸습니다. " +
      "JNI로 안드로이드와 iOS 네이티브 모듈에 직접 연동했습니다.",
    result:
      "실시간 인증으로 결제 시간이 짧아지고 물리 보안 기기 없이 출입 시스템을 돌렸습니다. " +
      "사내 정책에 맞춘 비식별 처리로 프라이버시 설계도 함께 잡았습니다.",
    stack: ["OpenCV", "C++", "AdaFace", "ArcFace", "JNI", "Android NDK", "iOS"],
    tags: ["컴퓨터 비전", "보안", "네이티브"]
  },
  {
    id: "toss-scheduling",
    era: "2023",
    org: "Toss",
    title: "고객센터 근무 스케줄 자동 편성",
    summary: "두 사람이 2주 붙어 짜던 근무표를 5분 안에 뽑았습니다.",
    problem:
      "수백 명의 근무와 휴가, 교대 규칙을 사람이 손으로 맞췄습니다. 한 명만 바뀌어도 처음부터 다시였습니다.",
    approach:
      "제약 조건을 선형계획으로 모델링하고 Google OR-Tools로 풀었습니다. " +
      "실시간 재조정이 가능하도록 구조를 느슨하게 잡았습니다.",
    result:
      "편성 시간이 2주에서 5분으로 줄었습니다. 같은 엔진을 수천 명 규모 워크숍 숙소 배정에도 그대로 썼습니다.",
    metrics: [{ k: "편성 시간", v: "2주 → 5분" }],
    stack: ["Google OR-Tools", "Python", "선형계획"],
    tags: ["최적화", "운영 자동화"]
  },
  {
    id: "samsung-mlplatform",
    era: "2017 — 2018",
    org: "삼성전자",
    title: "사내 클라우드 머신러닝 플랫폼",
    summary: "모델 배포에 며칠 걸리던 조직을 몇 시간짜리로 바꿨습니다.",
    problem:
      "팀마다 각자 서버에서 모델을 돌렸습니다. 실험은 재현되지 않았고 배포는 매번 수작업이었습니다.",
    approach:
      "사내 클라우드 인프라 위에 Kubernetes 기반 ML 플랫폼을 설계했습니다. " +
      "Docker로 모델을 버저닝하고 WaveNet, DeepVoice2, SRGAN, CycleGAN, SSD를 자동 배포해 API로 열었습니다.",
    result:
      "개발에서 배포까지 며칠 걸리던 일이 몇 시간으로 줄었습니다. 여러 팀이 같은 플랫폼에서 실험하면서 " +
      "PoC에 머물던 모델들이 실서비스로 넘어갔습니다.",
    metrics: [{ k: "배포 리드타임", v: "수 일 → 수 시간" }],
    stack: ["Kubernetes", "Docker", "TensorFlow", "Jenkins", "GitLab"],
    tags: ["플랫폼", "MLOps"],
    featured: true
  },
  {
    id: "samsung-vran",
    era: "2019 — 2020",
    org: "삼성전자 네트워크",
    title: "5G vRAN GPU 자동화와 통계 분석",
    summary: "5G 조기 런칭에서 터진 문제를 UDP 로그 분석 설계로 잡았습니다.",
    problem:
      "가상화 무선접속망의 병목이 어디서 생기는지 보이지 않았습니다. 지연과 오류율은 올라가는데 원인을 짚지 못했습니다.",
    approach:
      "트래픽과 지연, 오류율을 실시간으로 보는 통계 시스템을 설계하고 CUDA 기반 병렬 처리를 최적화했습니다. " +
      "NVIDIA 본사와의 워크숍을 직접 주관하며 기술 스펙을 조율했습니다.",
    result:
      "병목 구간 자동 탐지와 자원 재할당으로 운영 효율을 끌어올렸습니다. " +
      "이상 탐지와 장애 예측으로 가용성을 높이고 글로벌 기술 협업의 창구 역할을 했습니다.",
    stack: ["CUDA", "NVIDIA GPU", "Kubernetes", "Prometheus", "Grafana", "InfluxDB"],
    tags: ["GPU", "5G", "글로벌 협업"]
  },
  {
    id: "samsung-music",
    era: "2014 — 2015",
    org: "삼성전자 리서치",
    title: "300만 곡 실시간 음악 인식 엔진",
    summary: "외부 API 없이 자체 지문 인식 엔진을 만들었습니다.",
    problem:
      "음악 인식을 외부 서비스에 의존하면 비용이 계속 나가고 제품 로드맵도 남의 손에 달립니다.",
    approach:
      "Compact Sub-Fingerprint Hashing으로 오디오 지문을 만들고 고속 해시 인덱싱 구조를 설계했습니다. " +
      "안드로이드 앱과 메타데이터 관리 UI까지 붙였습니다.",
    result:
      "300만 곡 이상을 실시간으로 인식했습니다. 외부 API 의존을 없애 비용과 안정성을 함께 잡았고 " +
      "삼성전자 논문상 최종 후보에 올랐습니다.",
    metrics: [
      { k: "인덱스 규모", v: "300만 곡+" },
      { k: "사내 인정", v: "논문상 최종 후보" }
    ],
    stack: ["C++", "Python", "Flask", "BerkeleyDB", "mmap", "Android"],
    tags: ["오디오", "검색", "자체 엔진"]
  },
  {
    id: "daum-vision",
    era: "2008 — 2011",
    org: "Daum",
    title: "사물 인식과 이미지 검색 시스템",
    summary: "700만 장을 실시간으로 매칭하는 비전 검색을 2010년에 만들었습니다.",
    problem:
      "이미지로 검색하는 기술이 아직 낯설던 시기였습니다. 중복 제거와 품질 필터링도 사람 손을 타고 있었습니다.",
    approach:
      "Histogram 기반 Hamming Embedding과 LIS 인덱싱으로 대규모 실시간 매칭을 구현했습니다. " +
      "이미지 해시 중복 제거, 성인 이미지 필터링, 얼굴 검출, 카테고리 분류기를 함께 만들었습니다.",
    result:
      "700만 장 규모에서 당대 기술 대비 빠른 응답과 높은 정합도를 냈습니다. " +
      "쇼핑 검색의 대표 이미지 추천 로직으로 이어져 전환율 개선에 쓰였습니다.",
    metrics: [{ k: "인덱스 규모", v: "700만 장" }],
    stack: ["OpenCV", "C++", "Python", "MySQL", "BerkeleyDB", "Twisted"],
    tags: ["컴퓨터 비전", "검색"]
  }
];

/* 커리어 타임라인 — 3D 씬의 스크럽과 연동한다. */
export const timeline = [
  {
    period: "2025.04 — 현재",
    org: "ThakiCloud",
    role: "AI 플랫폼 기획 · 설계 · 리딩",
    where: "서울 역삼",
    note: "추론·학습·에이전트 플랫폼 세 축을 만들고 팀을 이끌고 있습니다.",
    accent: true
  },
  {
    period: "2024.03 — 2025.04",
    org: "2i Studio",
    role: "창업자",
    where: "경기 용인",
    note: "얼굴 기반 생성 AI 플랫폼을 만들어 유료 사용자 5만 명, 매출 4억 원을 냈습니다."
  },
  {
    period: "2021.01 — 2024.02",
    org: "Toss",
    role: "시니어 머신러닝 엔지니어",
    where: "서울",
    note: "CDP 개인화, 생성 AI 도구, 얼굴 인증, 근무 스케줄링, 신용평가까지 도메인을 넘나들었습니다."
  },
  {
    period: "2011.09 — 2020.12",
    org: "삼성전자",
    role: "시니어 소프트웨어 엔지니어 · ML 리서처 · 개발 매니저",
    where: "수원",
    note: "ML 플랫폼, 5G vRAN GPU, 음악 인식, 통합 검색을 만들고 조직의 기술 방향에 관여했습니다."
  },
  {
    period: "2008.09 — 2011.08",
    org: "Daum",
    role: "머신러닝 엔지니어",
    where: "제주",
    note: "사물 인식과 이미지 검색 시스템을 만들었습니다. 여기서 비전으로 시작했습니다."
  }
];

/* 코드 밖에서 만든 결과 */
export const strategy = {
  intro:
    "직무는 개발자였지만 임팩트가 컸던 일 가운데 상당수는 전략과 기획에서 나왔습니다. " +
    "문제를 정확히 정의하고 실행 가능한 답을 만들어 제안하는 쪽이 제 강점입니다.",
  items: [
    {
      org: "Toss",
      title: "토스증권 커뮤니티와 해외 주식 전략",
      note: "리텐션과 신규 유입을 함께 보는 실행 로드맵을 제안하고 피드백을 반영했습니다."
    },
    {
      org: "삼성전자",
      title: "n-Screen 클라우드 서비스 전략",
      note: "스마트폰과 TV, 태블릿을 잇는 콘텐츠 연동 구조를 기획해 보고했습니다. (2011)"
    },
    {
      org: "삼성전자",
      title: "플랫폼 전환 전략 보고",
      note: "바다OS 중심 전략의 한계를 분석하고 안드로이드 중심 전환과 챗온 플랫폼화를 제안했습니다. (2012)"
    },
    {
      org: "삼성전자",
      title: "C-Lab 1기 평가위원 · 삼성벤처투자 자문",
      note: "초기 아이디어의 시장성과 실행 가능성을 평가했습니다. 제안상도 여러 번 받았습니다."
    },
    {
      org: "Daum",
      title: "검색 품질 개선 전략",
      note: "수백 건의 롱테일 쿼리를 직접 분석해 개선안을 냈습니다. 로드뷰 광고 아이디어는 실제 구현돼 수상까지 이어졌습니다."
    }
  ]
};

export const research = {
  title: "혼자 돌린 실험, 그대로 적은 기록",
  body:
    "가설을 세우고 실험을 돌린 뒤 결과를 미화하지 않고 적습니다. 이긴 것도 있고 진 것도 있습니다. " +
    "\"벽인 줄 알았던 것이 제 모델이었습니다\" 같은 제목이 나오는 이유입니다. " +
    "추천 시스템 벤치마크, 음향 센싱, 스토리지 무결성, 스케줄링 최적화, 시뮬레이션과 실제의 간극까지 " +
    "도메인을 가리지 않고 직접 측정했습니다.",
  counts: [
    { k: "실험 기록", v: "49편" },
    { k: "동작하는 구현", v: "32건" },
    { k: "주요 도메인", v: "최적화 · 인프라 · 비전 · 신호" }
  ],
  link: { label: "실험 기록 보기", url: "https://2icorp.github.io/papers.html" }
};

/* 지금 실제로 손대고 있는 것 위주로. 오래된 목록을 관성으로 남겨두지 않는다.
   앞의 네 그룹이 현재 주력(에이전트 하네스 · 학습 · 서빙 · 멀티모달)이다. */
export const stack = [
  {
    group: "에이전트 하네스 · 오케스트레이션",
    note: "Paxis",
    items: [
      "하네스 엔지니어링", "루프 엔지니어링", "그래프 엔지니어링", "MCP 툴 연동",
      "스킬 라우팅 · 검색증강", "LangGraph", "Human-in-the-Loop 승인", "정책 · 감사 추적",
      "결정론 검증 게이트", "멀티에이전트 합의"
    ]
  },
  {
    group: "학습 · 파인튜닝 · 증류",
    note: "Maxis",
    items: [
      "SFT", "CPT", "DPO", "GRPO", "GKD", "LoRA · QLoRA", "지식 증류",
      "FSDP · DDP", "TRL", "Unsloth", "MLflow", "평가셋 · 회귀 테스트"
    ]
  },
  {
    group: "추론 · 서빙 · 압축",
    note: "Metis",
    items: [
      "vLLM", "NVIDIA Dynamo", "LMCache", "Prefill-Decode 분리", "NVFP4 · W4A16",
      "LLM Compressor", "MoE 압축 · 프루닝", "Scale-to-Zero", "KServe", "모델 라우팅"
    ]
  },
  {
    group: "음성 · 비전 · 생성 모델",
    items: [
      "VoxCPM2 TTS", "Qwen3-TTS", "Qwen3-ASR", "화자 분리(pyannote)", "VLM 영상 이해",
      "Stable Diffusion", "DreamBooth", "GPT Image", "Text-to-Video", "EmbeddingGemma",
      "AdaFace · ArcFace", "OpenCV · ViT"
    ]
  },
  {
    group: "플랫폼 · GPU 인프라",
    items: [
      "Kubernetes", "Kueue · MultiKueue", "ArgoCD · GitOps", "Helm", "Keycloak",
      "SeaweedFS", "CloudNativePG", "NATS", "Prometheus · Grafana", "CUDA", "Docker"
    ]
  },
  {
    group: "언어 · 프레임워크",
    items: [
      "Python", "Go (Fiber)", "TypeScript", "C++", "React 19", "Next.js",
      "FastAPI", "PyTorch", "PostgreSQL", "Redis"
    ]
  },
  {
    group: "고전 ML · 최적화",
    items: [
      "LightGBM", "CatBoost", "XGBoost", "scikit-learn", "Google OR-Tools",
      "Airflow", "선형계획 · 제약 최적화", "시계열 · 랭킹"
    ]
  }
];

export const contact = {
  title: "이야기를 나눠보고 싶다면",
  body:
    "기술 전략과 아키텍처, 연구개발 방향, 제품 의사결정에 실제 권한이 있는 역할이라면 열려 있습니다. " +
    "메시지로 먼저 구체적인 내용을 주고받는 방식을 선호합니다.",
  links: [
    { label: "hyojunguy@gmail.com", url: "mailto:hyojunguy@gmail.com", kind: "mail" },
    { label: "GitHub", url: "https://github.com/sylvanus4", kind: "github" },
    { label: "실험 기록", url: "https://2icorp.github.io/papers.html", kind: "link" }
  ],
  resume: {
    title: "이력서",
    note: "웹에서 바로 보거나 PDF로 받을 수 있습니다.",
    items: [
      { label: "이력서 · 경력기술서", sub: "웹", url: "resume.html" },
      { label: "한효정_이력서.pdf", sub: "국문 · 3장", url: "한효정_이력서.pdf", download: true },
      { label: "Hyojung_Han_Resume_EN.pdf", sub: "영문 · 2장", url: "Hyojung_Han_Resume_EN.pdf", download: true }
    ]
  }
};
