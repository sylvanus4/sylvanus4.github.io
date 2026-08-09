/* 이력서 콘텐츠 데이터. 사실·수치는 assets/js/data.js와 2icorp-work/cases.json을 정본으로 한다.
   마크업과 카피를 분리해 둔다. 문구 수정은 이 파일만 고치면 된다. */

export const ko = {
  meta: {
    name: "한효정",
    nameEn: "Hyojung Han",
    title: "AI Systems Engineer",
    location: "서울시 송파구 잠실동",
    email: "hyojunguy@gmail.com",
    github: "github.com/sylvanus4",
    blog: "thakicloud.com/tech-blog",
    updated: "2026-08"
  },

  summary: [
    "2007년부터 공백 없이 19년째 컴퓨터 비전, 추천, 생성 AI, 엔터프라이즈 AI 플랫폼을 만들어 온 AI 시스템 엔지니어입니다.",
    "현재 ThakiCloud에서 추론(Metis), 학습(Maxis), 에이전트 자동화(Paxis) 세 플랫폼의 제품 전략과 아키텍처를 설계하고 팀을 이끕니다.",
    "생성 AI 콘텐츠 플랫폼을 직접 창업해 일본·대만·홍콩 3개 시장에서 유료 사용자 5만 명, 누적 매출 4억 원을 만든 경험이 있습니다.",
    "한국어·영어·아랍어 3개 언어 기술 블로그를 운영하며 2,260편을 쓰고 608편을 공개했습니다. 동작하는 구현 사례 32건을 독립 연구로 축적했습니다.",
    "모델부터 인프라, 제품까지 직접 만들어 본 경험을 바탕으로 방향을 정하고, 필요한 부분은 지금도 직접 구현합니다."
  ],

  skills: [
    {
      group: "에이전트 하네스 · 오케스트레이션 (Paxis)",
      items: [
        "하네스 엔지니어링", "루프 엔지니어링", "그래프 엔지니어링", "MCP 툴 연동",
        "스킬 라우팅 · 검색증강", "LangGraph", "Human-in-the-Loop 승인", "정책 · 감사 추적",
        "결정론 검증 게이트", "멀티에이전트 합의"
      ]
    },
    {
      group: "학습 · 파인튜닝 · 증류 (Maxis)",
      items: [
        "SFT", "CPT", "DPO", "GRPO", "GKD", "LoRA · QLoRA", "지식 증류",
        "FSDP · DDP", "TRL", "Unsloth", "MLflow", "평가셋 · 회귀 테스트"
      ]
    },
    {
      group: "추론 · 서빙 · 압축 (Metis)",
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
  ],

  experience: [
    {
      org: "ThakiCloud",
      period: "2025.04 ~ 현재",
      role: "AI 플랫폼 기획 · 설계 · 리딩",
      where: "서울 역삼",
      intro:
        "추론 · 학습 · 에이전트 플랫폼 세 축을 기획하고 설계하며 팀을 이끌고 있습니다. 기술 블로그 발행 파이프라인도 함께 운영합니다.",
      projects: [
        {
          name: "AI 플랫폼 3종 기획 · 아키텍처 설계 · 리딩",
          bullets: [
            "추론(Metis) · 학습(Maxis) · 에이전트(Paxis) 세 축의 제품 방향과 기본 아키텍처를 설계하고, 실험 우선순위를 정해 개발팀을 리딩",
            "Kubernetes GPU 스케줄링 · 멀티테넌시 · GitOps 배포 체계의 설계 방향을 잡고 구축을 총괄"
          ]
        },
        {
          name: "에이전트 빌더 사내 시스템 연동 (직접 구현)",
          bullets: [
            "에이전트 빌더를 사내 시스템과 연동해 실제 업무를 에이전트로 조립·실행하는 경로를 직접 설계하고 구현",
            "모델 양자화(NVFP4 · W4A16)를 직접 담당해 서빙 가능 여부까지 검증한 뒤 배포 대상으로 확정"
          ]
        },
        {
          name: "기술 블로그 운영과 다국어 발행 파이프라인",
          bullets: [
            "초안 생성부터 사실 검증, 번역, 배포까지 이어지는 발행 파이프라인을 구축해 2024년 5월부터 2,260편을 작성하고 608편(한국어 307 · 영어 301)을 공개 운영",
            "11개 카테고리에 걸쳐 품질 게이트를 코드로 강제해 3개 언어를 동일 품질 기준으로 유지"
          ]
        }
      ]
    },
    {
      org: "2i Studio (창업)",
      period: "2024.03 ~ 2025.04",
      role: "창업자",
      where: "경기 용인",
      intro:
        "생성 AI 콘텐츠 플랫폼을 직접 창업해 기획부터 개발, 운영까지 전 과정을 담당했습니다.",
      projects: [
        {
          name: "얼굴 기반 생성 AI 콘텐츠 플랫폼",
          bullets: [
            "DreamBooth 파인튜닝 기반 동일인물성 보존 생성 파이프라인을 설계해 누적 매출 4억 원, 유료 결제 사용자 5만 명을 달성",
            "FastAPI · RabbitMQ 생성 큐와 Expo · Next.js 앱 · 웹을 직접 구현해 일본 · 대만 · 홍콩 3개 시장에 출시"
          ]
        }
      ]
    },
    {
      org: "Toss",
      period: "2021.01 ~ 2024.02",
      role: "시니어 머신러닝 엔지니어",
      where: "서울",
      intro:
        "CDP 개인화, 생성 AI 도구, 얼굴 인증, 근무 스케줄링까지 여러 도메인을 넘나들며 머신러닝 시스템을 설계하고 구현했습니다.",
      projects: [
        {
          name: "고객 데이터 플랫폼과 개인화 예측",
          bullets: [
            "서비스별 · 유저별 CTR · CVR 예측 모델을 구축해 SQL 세그먼트 수작업을 확률 기반 자동화로 전환",
            "A/B 테스트 조기 종료 판단 모델을 별도로 설계해 테스트 기간을 75% 단축"
          ]
        },
        {
          name: "디자이너용 그래픽 생성 도구 Tosst",
          bullets: [
            "토스 스타일 템플릿을 얹은 Stable Diffusion 프롬프트 엔진을 구축해 캐릭터 제작 주기를 수 주에서 2~3일로 단축",
            "외주 비용 수천만 원을 절감하고 토스 블로그 · 웹 · 앱 전반의 그래픽 제작에 적용"
          ]
        },
        {
          name: "UI 코드 생성기와 RAG 검색 시스템",
          bullets: [
            "사내 UI 시스템에 맞춰 LLaMA를 파인튜닝해 YAML 입력만으로 프로토타입 코드를 생성",
            "LangChain · ChromaDB 기반 자연어 검색을 붙여 프로토타입 제작 시간을 수 시간에서 수 분으로 단축"
          ]
        },
        {
          name: "얼굴 결제와 스마트도어락 인증",
          bullets: [
            "3D 깊이 기반 위조 방지와 AdaFace · ArcFace 커스터마이징으로 실시간 얼굴 인증 정확도를 개선",
            "JNI로 안드로이드 · iOS 네이티브 모듈에 직접 연동해 카드 · 비밀번호 없는 결제 · 출입 인증을 구현"
          ]
        },
        {
          name: "고객센터 근무 스케줄 자동 편성",
          bullets: [
            "근무 · 휴가 · 교대 제약을 선형계획으로 모델링하고 Google OR-Tools로 풀어 편성 시간을 2주에서 5분으로 단축",
            "동일 엔진을 수천 명 규모 워크숍 숙소 배정에도 재사용해 확장성을 검증"
          ]
        }
      ]
    },
    {
      org: "삼성전자",
      period: "2011.09 ~ 2020.12",
      role: "시니어 소프트웨어 엔지니어 · ML 리서처 · 개발 매니저",
      where: "수원",
      intro:
        "ML 플랫폼과 5G 네트워크 자동화, 음악 인식 엔진을 만들며 조직의 기술 방향에도 관여했습니다.",
      projects: [
        {
          name: "사내 클라우드 머신러닝 플랫폼",
          bullets: [
            "Kubernetes 기반 ML 플랫폼을 설계해 모델 배포 리드타임을 수 일에서 수 시간으로 단축",
            "WaveNet · DeepVoice2 · SRGAN · CycleGAN · SSD를 자동 배포 체계에 얹어 여러 팀의 PoC를 실서비스로 전환"
          ]
        },
        {
          name: "5G vRAN GPU 자동화와 통계 분석",
          bullets: [
            "CUDA 기반 병렬 처리를 최적화하고 실시간 통계 시스템을 설계해 5G 조기 런칭의 병목 구간을 자동 탐지",
            "NVIDIA 본사와의 기술 워크숍을 직접 주관해 글로벌 협업 창구 역할을 수행"
          ]
        },
        {
          name: "300만 곡 실시간 음악 인식 엔진",
          bullets: [
            "Compact Sub-Fingerprint Hashing 기반 자체 오디오 지문 엔진을 설계해 외부 API 의존 없이 300만 곡 이상을 실시간 인식",
            "고속 해시 인덱싱 구조와 안드로이드 앱을 직접 구현해 삼성전자 논문상 최종 후보에 선정"
          ]
        }
      ]
    },
    {
      org: "Daum",
      period: "2008.09 ~ 2011.08",
      role: "머신러닝 엔지니어",
      where: "제주",
      intro:
        "사물 인식과 이미지 검색 시스템을 만들며 컴퓨터 비전 경력을 시작했습니다.",
      projects: [
        {
          name: "사물 인식과 이미지 검색 시스템",
          bullets: [
            "Histogram 기반 Hamming Embedding과 LIS 인덱싱으로 700만 장 규모 실시간 이미지 매칭 시스템을 설계",
            "이미지 해시 중복 제거 · 얼굴 검출 · 카테고리 분류기를 함께 구현해 쇼핑 검색 대표 이미지 추천 로직에 적용"
          ]
        }
      ]
    },
    {
      org: "비전 스타트업",
      period: "2007.01 ~ 2008.08",
      role: "소프트웨어 엔지니어",
      where: "서울",
      intro:
        "영상 처리와 패턴 인식으로 커리어를 시작했습니다. 여기서 다룬 문제들이 이후 이미지 검색으로 이어졌습니다.",
      projects: [
        {
          name: "영상 처리 · 패턴 인식 모듈",
          bullets: [
            "카메라 입력에서 특징을 추출하고 매칭하는 비전 모듈을 C++로 구현",
            "영상 전처리와 인식 정확도 개선을 반복하며 컴퓨터 비전 기본기를 축적"
          ]
        }
      ]
    }
  ],

  rnd: {
    intro:
      "비전, 신호 처리, 최적화, 추천처럼 제가 오래 다뤄 온 영역을 에이전트로 더 넓게 확장하며 직접 구현합니다. 무엇을 재야 답이 나오는지 이미 알기 때문에 논문을 읽는 자리에서 곧바로 실측 가능한 구현으로 넘어갑니다. 저장소 129개를 만들어 운영하며 그중 32건은 측정값이 붙은 완성 구현입니다.",
    groups: [
      {
        name: "최적화 · 스케줄링",
        items: [
          "근무표가 안 풀리는 이유를 제약 완화 트레이드오프로 정량화하는 인력 스케줄링 엔진",
          "증원 없이 시프트 구조 재설계만으로 SLA를 끌어올린 인력 배치 최적화 엔진",
          "이동거리와 연속 원정 일수를 함께 최소화하는 다목적 일정 최적화",
          "배차 최적화로 동일 라이더 수에서 배달 처리량을 증대",
          "배정 · 편성 문제 3건에서 실현 가능성을 감이 아닌 증명으로 확인하는 검증 엔진",
          "LLM 생성-수정 최적화 루프를 조합최적화 벤치마크 3개에 적용해 2승 1패로 검증"
        ]
      },
      {
        name: "인프라 · 배포",
        items: [
          "복제본 3벌로는 못 잡는 데이터 부식(bit rot)을 온프렘 스토리지에서 실측",
          "스토리지 검증 도구를 자사 인프라에 먼저 겨눠 결함을 스스로 찾아내는 진단 하네스",
          "클라우드 대비 온프렘 전환의 손익분기점을 TCO로 계산",
          "인터넷이 없는 폐쇄망 설비에도 AI 모델을 안전하게 전달하는 배포 경로 설계",
          "테스트는 전부 통과했지만 실제 클라이언트 연동에서 1분 만에 죽는 결함을 재현 · 검증"
        ]
      },
      {
        name: "데이터 · 추천",
        items: [
          "부서별로 흩어진 엑셀을 표준 ETL로 통합해 경영 현황 조회를 반나절에서 즉시로 단축",
          "결품과 악성재고를 동시에 줄이는 수요예측 기반 재고 최적화",
          "제안 골든타임을 놓치지 않는 영업 인텔리전스 레이더",
          "인기순 대조군을 세워 추천 모델의 실제 개선폭을 재는 GPU 벤치마크 하네스",
          "위치 정보를 넣어 도달 불가능한 매장 추천을 걸러내는 로컬 커머스 시맨틱 ID 인덱서"
        ]
      },
      {
        name: "비전",
        items: [
          "검사원마다 다르던 판정 기준을 통일하는 24시간 제조 비전 검사 AI",
          "이미지 분할 오류를 찾아 스스로 고치는 연구 도구 자동화 폐루프",
          "GPU 서버 없이 소비자용 실리콘에서 영상 이해 AI 성능을 실측"
        ]
      },
      {
        name: "에이전트 · 자동화 하네스",
        items: [
          "견적 · 발주 수기입력을 자동화해 담당자는 예외 건만 처리하는 문서 자동화",
          "반복 문의는 AI가 처리하고 사람은 진짜 상담에 집중하는 AI 상담 에이전트",
          "20년 베테랑의 노하우를 질문 한 번으로 꺼내는 RAG 지식 자산화",
          "제품 정보만 넣으면 채널별 홍보영상과 온라인 존재감을 자동으로 만드는 마케팅 자동화",
          "\"부산 출장 준비해줘\" 한마디로 앱 여러 개를 대신 실행하는 대화형 에이전트 오케스트레이션",
          "백지 도면에서 비판 가능한 초안까지 열 분 만에 도달하는 설계 자동화 폐루프",
        "스킬 1,600여 개를 BM25와 임베딩 하이브리드로 라우팅하는 에이전트 하네스",
        "무인 스케줄 파이프라인 13종을 운영하며 실패를 회고로 되먹여 모델 등급을 자동 조정"
        ]
      },
      {
        name: "신호 · 음향",
        items: [
          "무선망을 멈추는 원인 불명 전파를 실시간으로 지목하는 신호 지문 분석",
          "여분의 스마트폰 한 대로 통행량을 세는 무설치 음향 센싱",
          "전파도 빛도 못 쓰는 방에서 소리로 데이터를 넘기는 에어갭 음향 통신"
        ]
      },
      {
        name: "제품 · 도구",
        items: [
          "파일을 서버로 보내지 않는 한글 문서 변환기를 웹과 데스크탑 앱으로 출시(MIT 공개, 무업로드를 검사 40개로 상시 검증)",
          "모델이 내 GPU에 올라가는지와 자체 호스팅이 API보다 싼지를 브라우저에서 계산하는 도구"
        ]
      }
    ]
  },

  education: [
    { school: "연세대학교", degree: "컴퓨터과학과 석사", year: "2007" }
  ]
};

export const en = {
  meta: {
    name: "Hyojung Han",
    nameEn: "Hyojung Han",
    title: "AI Systems Engineer",
    location: "Jamsil-dong, Songpa-gu, Seoul, South Korea",
    email: "hyojunguy@gmail.com",
    github: "github.com/sylvanus4",
    blog: "thakicloud.com/tech-blog",
    updated: "2026-08"
  },

  summary: [
    "AI systems engineer with 19 years of continuous experience (2007-present) spanning computer vision, recommendation systems, generative AI, and enterprise AI platforms.",
    "Currently leads product strategy and architecture for three AI platforms at ThakiCloud: inference (Metis), training (Maxis), and enterprise agent automation (Paxis).",
    "Founded and ran a generative AI content platform that reached 50K paying users and KRW 400M in cumulative revenue across Japan, Taiwan, and Hong Kong.",
    "Runs a trilingual technical blog (Korean, English, Arabic), having written 2,260 posts since May 2024 with 608 currently public, backed by 32 working independent R&D implementations."
  ],

  skills: [
    {
      group: "Agent Harness & Orchestration (Paxis)",
      items: [
        "Harness Engineering", "Loop Engineering", "Graph Engineering", "MCP Tool Integration",
        "Skill Routing / RAG", "LangGraph", "Human-in-the-Loop Approval", "Policy & Audit Trail",
        "Deterministic Verification Gates", "Multi-Agent Consensus"
      ]
    },
    {
      group: "Training, Fine-tuning & Distillation (Maxis)",
      items: [
        "SFT", "CPT", "DPO", "GRPO", "GKD", "LoRA / QLoRA", "Knowledge Distillation",
        "FSDP / DDP", "TRL", "Unsloth", "MLflow", "Eval Sets & Regression Testing"
      ]
    },
    {
      group: "Inference, Serving & Compression (Metis)",
      items: [
        "vLLM", "NVIDIA Dynamo", "LMCache", "Prefill-Decode Disaggregation", "NVFP4 / W4A16",
        "LLM Compressor", "MoE Compression / Pruning", "Scale-to-Zero", "KServe", "Model Routing"
      ]
    },
    {
      group: "Speech, Vision & Generative Models",
      items: [
        "VoxCPM2 TTS", "Qwen3-TTS", "Qwen3-ASR", "Speaker Diarization (pyannote)", "VLM Video Understanding",
        "Stable Diffusion", "DreamBooth", "GPT Image", "Text-to-Video", "EmbeddingGemma",
        "AdaFace / ArcFace", "OpenCV / ViT"
      ]
    },
    {
      group: "Platform & GPU Infrastructure",
      items: [
        "Kubernetes", "Kueue / MultiKueue", "ArgoCD / GitOps", "Helm", "Keycloak",
        "SeaweedFS", "CloudNativePG", "NATS", "Prometheus / Grafana", "CUDA", "Docker"
      ]
    },
    {
      group: "Languages & Frameworks",
      items: [
        "Python", "Go (Fiber)", "TypeScript", "C++", "React 19", "Next.js",
        "FastAPI", "PyTorch", "PostgreSQL", "Redis"
      ]
    },
    {
      group: "Classical ML & Optimization",
      items: [
        "LightGBM", "CatBoost", "XGBoost", "scikit-learn", "Google OR-Tools",
        "Airflow", "Linear Programming / Constraint Optimization", "Time Series / Ranking"
      ]
    }
  ],

  experience: [
    {
      org: "ThakiCloud",
      period: "Apr 2025 ~ Present",
      role: "AI Platform Strategy, Architecture & Team Lead",
      where: "Seoul, South Korea",
      intro:
        "Leads strategy, architecture, and delivery across three AI platforms, and operates the company's multilingual technical blog pipeline.",
      projects: [
        {
          name: "Led strategy and architecture for three AI platforms",
          bullets: [
            "Set product direction and designed the core architecture for inference (Metis), training (Maxis), and agent automation (Paxis), and led the engineering team by setting experiment priorities",
            "Directed the design of GPU scheduling, multi-tenancy, and GitOps deployment on Kubernetes, overseeing the build"
          ]
        },
        {
          name: "Agent builder integration with internal systems (hands-on)",
          bullets: [
            "Personally designed and built the path that wires the agent builder into internal systems so real work can be assembled and executed as agents",
            "Owned model quantization (NVFP4, W4A16) end to end, qualifying each build by whether it actually serves before it ships"
          ]
        },
        {
          name: "Built and operated a multilingual technical blog publishing pipeline",
          bullets: [
            "Built an end-to-end pipeline from drafting through fact-checking, translation, and deployment, writing 2,260 posts since May 2024 with 608 currently public (307 Korean, 301 English)",
            "Enforced quality gates in code across 11 categories to keep all three languages at the same quality bar"
          ]
        }
      ]
    },
    {
      org: "2i Studio (Founder)",
      period: "Mar 2024 ~ Apr 2025",
      role: "Founder",
      where: "Yongin, South Korea",
      intro:
        "Founded and ran a generative AI content platform end to end, from product to engineering to operations.",
      projects: [
        {
          name: "Built a face-based generative AI content platform",
          bullets: [
            "Designed an identity-preserving generation pipeline on DreamBooth fine-tuning, growing to KRW 400M cumulative revenue and 50K paying users",
            "Shipped the full stack (FastAPI/RabbitMQ generation queue, Expo/Next.js app and web) and launched in Japan, Taiwan, and Hong Kong"
          ]
        }
      ]
    },
    {
      org: "Toss",
      period: "Jan 2021 ~ Feb 2024",
      role: "Senior Machine Learning Engineer",
      where: "Seoul, South Korea",
      intro:
        "Designed and shipped machine learning systems across CDP personalization, generative AI tooling, face authentication, and workforce scheduling.",
      projects: [
        {
          name: "Customer data platform and personalization prediction",
          bullets: [
            "Built per-service, per-user CTR/CVR prediction models, replacing manual SQL segment queries with automated probability scores",
            "Designed a separate early-stopping model for A/B tests, cutting test duration by 75%"
          ]
        },
        {
          name: "Tosst, a generative graphic design tool for designers",
          bullets: [
            "Built a Stable Diffusion prompt engine with Toss style templates, cutting character asset production from weeks to 2-3 days",
            "Saved tens of millions of KRW in outsourcing costs; adopted across Toss blog, web, and app graphics"
          ]
        },
        {
          name: "UI code generator and RAG search system",
          bullets: [
            "Fine-tuned LLaMA on internal UI system data to generate prototype code directly from YAML input",
            "Added natural-language search over docs and components with LangChain/ChromaDB, cutting prototyping time from hours to minutes"
          ]
        },
        {
          name: "Face payment and smart door lock authentication",
          bullets: [
            "Improved real-time face authentication accuracy with 3D depth-based anti-spoofing and customized AdaFace/ArcFace",
            "Integrated natively into Android and iOS via JNI, enabling card-free and password-free payment and door access"
          ]
        },
        {
          name: "Automated workforce scheduling for customer support",
          bullets: [
            "Modeled shift, leave, and rotation constraints as a linear program solved with Google OR-Tools, cutting scheduling time from 2 weeks to 5 minutes",
            "Reused the same engine for lodging assignment at workshops with thousands of attendees, validating its generality"
          ]
        }
      ]
    },
    {
      org: "Samsung Electronics",
      period: "Sep 2011 ~ Dec 2020",
      role: "Senior Software Engineer, ML Researcher, Development Manager",
      where: "Suwon, South Korea",
      intro:
        "Built an ML platform, 5G network automation, and a music recognition engine, while also shaping the organization's technical direction.",
      projects: [
        {
          name: "Built an internal cloud machine learning platform",
          bullets: [
            "Designed a Kubernetes-based ML platform, cutting model deployment lead time from days to hours",
            "Auto-deployed WaveNet, DeepVoice2, SRGAN, CycleGAN, and SSD models, moving multiple teams' PoCs into production"
          ]
        },
        {
          name: "5G vRAN GPU automation and statistical analysis",
          bullets: [
            "Optimized CUDA-based parallel processing and designed a real-time statistics system, auto-detecting bottlenecks during an early 5G launch",
            "Ran technical workshops directly with NVIDIA HQ, serving as the point of contact for global collaboration"
          ]
        },
        {
          name: "Real-time music recognition engine at 3M-track scale",
          bullets: [
            "Designed a proprietary audio fingerprinting engine on Compact Sub-Fingerprint Hashing, recognizing 3M+ tracks in real time with no external API dependency",
            "Built the high-speed hash indexing structure and Android app end to end; selected as a finalist for Samsung Electronics' internal paper award"
          ]
        }
      ]
    },
    {
      org: "Daum",
      period: "Sep 2008 ~ Aug 2011",
      role: "Machine Learning Engineer",
      where: "Jeju, South Korea",
      intro:
        "Started in computer vision, building object recognition and image search systems.",
      projects: [
        {
          name: "Object recognition and image search system",
          bullets: [
            "Designed a real-time image matching system at 7M-image scale using histogram-based Hamming embedding and LIS indexing",
            "Built image hash deduplication, face detection, and category classifiers, applied to representative-image recommendation in shopping search"
          ]
        }
      ]
    },
    {
      org: "Vision Startup",
      period: "Jan 2007 ~ Aug 2008",
      role: "Software Engineer",
      where: "Seoul, South Korea",
      intro:
        "Began my career in image processing and pattern recognition, the groundwork for later image search systems.",
      projects: [
        {
          name: "Image processing and pattern recognition modules",
          bullets: [
            "Implemented C++ vision modules that extracted and matched features from camera input",
            "Iterated on preprocessing and recognition accuracy, building the computer vision fundamentals used later at Daum"
          ]
        }
      ]
    }
  ],

  rnd: {
    intro:
      "Extends long-held domains, computer vision, signal processing, combinatorial optimization, and recommendation, through agent-driven development. Knowing the field is what makes the speed possible: I know which measurement settles the question, so a paper becomes a measured implementation rather than a summary. Owns and operates 129 repositories, 32 of them completed implementations with measured results.",
    groups: [
      {
        name: "Optimization & Scheduling",
        items: [
          "Workforce scheduling engine that quantifies exactly which constraint trade-offs unblock an infeasible roster",
          "Redesigned shift structure before recommending headcount increases to fix staffing shortfalls",
          "Multi-objective schedule optimization minimizing travel distance and consecutive road trips together",
          "Dispatch optimization that increased delivery throughput with the same rider headcount",
          "Verification engine proving feasibility of 3 assignment/rostering problems with math instead of gut feel",
          "Applied an LLM generate-and-repair optimization loop to 3 combinatorial optimization benchmarks, winning 2 of 3"
        ]
      },
      {
        name: "Infrastructure & Deployment",
        items: [
          "Measured bit rot that 3-way replication alone cannot catch, on real on-prem storage",
          "Pointed a storage validation tool at its own infrastructure first, and it found its own defects",
          "Calculated the real break-even point for on-prem vs. cloud storage using TCO",
          "Designed a deployment path for safely delivering AI models into air-gapped facilities with no internet",
          "Reproduced and diagnosed a defect that passed every test but killed a real client integration in under a minute"
        ]
      },
      {
        name: "Data & Recommendation",
        items: [
          "Unified scattered department spreadsheets into a standard ETL pipeline, cutting executive status checks from half a day to instant",
          "Demand-forecast-driven inventory optimization that reduces stockouts and dead stock together",
          "Sales intelligence radar that catches the golden window for a proposal before it closes",
          "Evaluation framework that checks whether a recommendation model actually beats popularity ranking before buying one",
          "Semantic ID design for local commerce recommendations, fixing the case where a suggestion is semantically right but physically unreachable"
        ]
      },
      {
        name: "Vision",
        items: [
          "24/7 manufacturing vision inspection AI that unifies judgment criteria that used to vary by inspector",
          "Self-correcting research-tool automation loop that finds and fixes its own image segmentation errors",
          "Measured whether video-understanding AI is viable on consumer-grade silicon with no GPU server"
        ]
      },
      {
        name: "Agents & Automation Harness",
        items: [
          "Document automation that lets staff review only exceptions instead of manually keying quotes and purchase orders",
          "AI support agent that handles repetitive inquiries so staff focus on real conversations",
          "RAG-based knowledge capture that surfaces a 20-year veteran's expertise in a single query",
          "Marketing automation that generates channel-specific promo videos from nothing but product info",
          "Conversational agent orchestration that runs a dozen apps from a single instruction like planning a business trip",
          "Design automation loop that goes from a blank drawing to a critiquable draft in ten minutes"
        ]
      },
      {
        name: "Signal & Acoustic Sensing",
        items: [
          "Signal fingerprinting that pinpoints unidentified RF interference disrupting a wireless network in real time",
          "Installation-free acoustic sensing that counts foot traffic with a single spare phone",
          "Air-gapped acoustic data link that moves data by sound in a room where RF and light are unavailable"
        ]
      },
      {
        name: "Shipped Products & Tooling",
        items: [
          "Shipped a Korean document converter that never uploads files, as both a web and a desktop app (MIT, no-upload claim re-proven by 40 checks per run)",
          "Browser-side calculator for whether a model fits a given GPU and whether self-hosting beats the API"
        ]
      }
    ]
  },

  education: [
    { school: "Yonsei University", degree: "M.S. in Computer Science", year: "2007" }
  ]
};
