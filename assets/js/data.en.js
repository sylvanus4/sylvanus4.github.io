/* 영문 콘텐츠 원본. data.js 와 키 구조가 완전히 같아야 한다.
   숫자는 국문판과 한 글자도 다르면 안 된다 — 두 언어가 다른 실적을 주장하는 순간
   둘 다 못 믿을 문서가 된다. tools/qa.mjs 의 언어 게이트가 이걸 검사한다. */

export const profile = {
  name: "Hyojung Han",
  nameEn: "한효정",
  role: "AI Systems Engineer",
  /* 국문은 두 줄인데 영문은 네 줄로 흘러 마지막 줄에 단어 하나만 남았다.
     의미(한 사람이 전 구간)를 지키면서 줄여 세 줄로 맞춘다. */
  tagline: "From research to deployment, one engineer",
  grad: "one engineer",
  lead:
    "Since 2007 I have built recognition engines and machine learning platforms at Daum, " +
    "Samsung Electronics and Toss without a break. At ThakiCloud I now design three platforms: " +
    "inference, training and agents.",
  sub:
    "I do not stop at tuning a model. I build the training and inference infrastructure it runs on, " +
    "the cloud platform above that, and the product people actually pay for.",
  photo: { webp: "assets/img/profile-960.webp", jpg: "assets/img/profile-960.jpg", alt: "Hyojung Han" },
  location: "Seoul, Korea",
  email: "hyojunguy@gmail.com",
  education: "M.S. Computer Science, Yonsei University, 2007",
  current: { org: "ThakiCloud", where: "Yeoksam, Seoul", since: "2025.04" }
};

export const stats = [
  { value: "19", unit: "yrs", label: "Building since 2007, no gaps" },
  { value: "608", unit: "posts", label: "Published across a three-language tech blog" },
  { value: "131", unit: "repos", label: "Built and maintained personally" },
  { value: "32", unit: "systems", label: "Finished builds with measured results" }
];

export const layers = [
  {
    id: "product",
    depth: 0,
    tag: "L5",
    title: "Product · Users",
    line: "I ship things people actually use",
    body:
      "I ran a generative AI content app myself and grew it to 50,000 paying users and 400M KRW in " +
      "cumulative revenue. It shipped to Japan, Taiwan and Hong Kong. The validation was paid checkout, not a deck.",
    keys: ["Product definition", "Full-stack build", "International launch", "Monetization"]
  },
  {
    id: "platform",
    depth: 1,
    tag: "L4",
    title: "Cloud Platform",
    line: "I lay the ground several teams share",
    body:
      "I put a Kubernetes-based ML platform on Samsung's internal cloud and cut model deployment from days to hours. " +
      "At ThakiCloud I design three pillars: inference (Metis), training (Maxis) and agents (Paxis). " +
      "On the agent side I engineer the harness, the loops and the graphs myself.",
    keys: ["Kubernetes", "Multi-tenancy", "GPU scheduling", "Agent harness", "GitOps"]
  },
  {
    id: "infra",
    depth: 2,
    tag: "L3",
    title: "Training · Inference Infrastructure",
    line: "I make models actually run",
    body:
      "I stand up and tune fine-tuning pipelines and serving stacks. I quantize with NVFP4 and W4A16 and " +
      "compress MoE models to fit more work on the same GPU. Speech and video models go on the same way.",
    keys: ["vLLM · Dynamo", "SFT · DPO · GRPO", "NVFP4 quantization", "TTS · STT · VLM", "CUDA"]
  },
  {
    id: "model",
    depth: 3,
    tag: "L2",
    title: "Models · Algorithms",
    line: "When it matters, I write the engine",
    body:
      "I built face, music and object recognition engines from scratch with no external API. " +
      "I designed indexing that identifies 3 million songs in real time and matches 7 million images instantly.",
    keys: ["Computer vision", "Generative models", "Search · indexing", "Optimization theory"]
  },
  {
    id: "research",
    depth: 4,
    tag: "L1",
    title: "Research · Fast Implementation",
    line: "I widen the fields I already know, much faster",
    body:
      "I take domains I have worked in for years and extend them with agents straight into implementation. " +
      "That is how 131 repositories came to exist, 32 of them finished builds with measurements attached. " +
      "I report results as they came out, without dressing them up.",
    keys: ["Agent-driven research", "Rapid prototyping", "Honest measurement", "Reproducibility"]
  }
];

export const work = [
  {
    id: "thaki-platform",
    era: "2025 — present",
    org: "ThakiCloud",
    title: "Three AI platforms: definition, architecture, build",
    summary: "I set up three platform pillars covering inference, training and agents, and lead the team building them.",
    problem:
      "A model alone does not let a company use AI. It needs somewhere to be served, somewhere to be retrained " +
      "on the company's own data, and somewhere those results attach to real workflows.",
    approach:
      "I split the roles into an inference platform, a training and fine-tuning platform, and an agent " +
      "automation platform. GPU scheduling and multi-tenancy sit on Kubernetes, and GitOps pins deployment.",
    result:
      "I designed the roadmap and architecture for all three and stay involved through implementation. " +
      "Nothing has to be translated between the plan and the code.",
    stack: ["Kubernetes", "vLLM", "Kueue", "ArgoCD", "Go", "React"],
    tags: ["Platform", "Infrastructure", "Leadership"],
    featured: true
  },
  {
    id: "thaki-blog",
    era: "2024 — present",
    org: "ThakiCloud",
    title: "Tech blog operation and a multilingual publishing pipeline",
    summary:
      "I launched and run tech blogs in Korean, English and Arabic. 2,260 posts written so far, 608 published.",
    problem:
      "Platform products sell on technical trust. Written entirely by hand, a technical blog tops out at one or " +
      "two posts a week, so neither search traffic nor brand ever compounds.",
    approach:
      "I built a Jekyll blog and wired drafting, fact-checking, translation, diagramming and deployment into one " +
      "pipeline. Content is split across 11 categories such as LLMOps, agent operations, research reviews and " +
      "tutorials, with quality gates enforced in code rather than by reminders.",
    result:
      "2,260 posts written since May 2024, 608 currently published: 307 in Korean and 301 in English. " +
      "All three languages are held to the same quality bar.",
    metrics: [
      { k: "Written · published", v: "2,260 · 608 live" },
      { k: "Languages", v: "Korean · English · Arabic" },
      { k: "Categories", v: "11" }
    ],
    stack: ["Jekyll", "GitHub Actions", "LLM pipeline", "i18n", "SEO"],
    tags: ["Content", "Automation", "Operations"],
    link: { label: "Open the blog", url: "https://thakicloud.com/tech-blog" },
    featured: true
  },
  {
    id: "hanji",
    era: "2026",
    org: "Personal project · Open source",
    title: "hanji, a document converter that never uploads your files",
    summary:
      "Built and released a tool that opens and converts Korean HWP documents, PDFs, images and video in one place. " +
      "It ships as both a web app and a desktop app.",
    problem:
      "Every online converter sends the file to a server. For anyone handling contracts or HR records, " +
      "'we delete it quickly' is not an answer. Korea also mandated open document formats for public agencies " +
      "from May 2026, which made converting Korean HWP files a far more common chore.",
    approach:
      "Parsing, rendering and encoding all happen inside the browser, which narrows the product to a single claim. " +
      "Rather than assert that claim, 40 checks drive real documents through a real browser and confirm zero outbound " +
      "requests on every run. The desktop binary ships with no networking library at all, so the dependency list is itself the proof.",
    result:
      "Released for macOS and Windows at 9.3MB, with the source public under MIT. " +
      "A defect where Korean tables overran the page was traced by bisecting 358 upstream commits and then patched.",
    metrics: [
      { k: "No-upload proof", v: "40 real-browser checks · 0 outbound requests" },
      { k: "Install size", v: "9.3MB · zero networking libraries" },
      { k: "Upstream defect", v: "Bisected across 358 commits, then patched" }
    ],
    stack: ["TypeScript", "WebAssembly", "Tauri", "Rust", "pdf-lib"],
    tags: ["Product", "Open source", "Local-first"],
    link: { label: "Download page", url: "https://sylvanus4.github.io/hanji-download/" },
    featured: true
  },
  {
    id: "2i-studio",
    era: "2024 — 2025",
    org: "2i Studio (founded)",
    title: "Face-based generative AI content platform",
    summary: "I built a generation pipeline that preserves identity and grew it to 50,000 paying users.",
    problem:
      "Generative models usually turn a person into someone else. Whether it is an avatar or a sticker, " +
      "once the \"that is me\" feeling is gone, nobody pays.",
    approach:
      "I reworked a DreamBooth fine-tuning pipeline to preserve identity, built a generation queue on FastAPI " +
      "and RabbitMQ, and shipped app and web together with Expo and Next.js.",
    result:
      "400M KRW in cumulative revenue and 50,000 paying users. Use cases widened to emoji, game avatars and " +
      "ad imagery, and the product launched in Japan, Taiwan and Hong Kong.",
    metrics: [
      { k: "Cumulative revenue", v: "400M KRW" },
      { k: "Paying users", v: "50,000" },
      { k: "Markets", v: "Japan · Taiwan · Hong Kong" }
    ],
    stack: ["Stable Diffusion", "DreamBooth", "PyTorch", "FastAPI", "RabbitMQ", "Next.js", "AWS"],
    tags: ["Generative AI", "Product", "Monetization"],
    featured: true
  },
  {
    id: "toss-cdp",
    era: "2021 — 2023",
    org: "Toss",
    title: "Customer data platform and personalized prediction",
    summary: "I replaced hand-carved SQL segments with a per-user probability.",
    problem:
      "Every push and content slot meant a marketer writing a fresh SQL segment. A/B tests were always late " +
      "because everyone waited for the result.",
    approach:
      "I ran CTR and CVR prediction per service and per user so the probabilities filled themselves in, and " +
      "built a separate model to judge A/B tests so experiments could be stopped early.",
    result:
      "Click-through and conversion both rose, contributing to loan, card and account brokerage revenue. " +
      "A/B test duration fell by 75%.",
    metrics: [
      { k: "A/B duration", v: "75% shorter" },
      { k: "Coverage", v: "All push and in-app content" }
    ],
    stack: ["LightGBM", "CatBoost", "Airflow", "Python"],
    tags: ["ML", "Personalization", "Data"],
    featured: true
  },
  {
    id: "toss-tosst",
    era: "2023",
    org: "Toss",
    title: "Tosst, a graphics generation tool for designers",
    summary: "Work that took weeks per character came down to two or three days.",
    problem:
      "Every 2D and 3D asset went out to an agency. The cycle from planning to design to development stalled every time.",
    approach:
      "I layered Toss style templates onto a Stable Diffusion prompt engine so designers' intent carried through, " +
      "and added a path that converted the 2D characters from the Toss Securities community into a 3D style.",
    result:
      "Production dropped from weeks to two or three days and saved tens of millions of KRW in agency cost. " +
      "It was used across Toss blog, web and app graphics.",
    metrics: [
      { k: "Production cycle", v: "Weeks → 2-3 days" },
      { k: "Agency cost", v: "Tens of millions KRW saved" }
    ],
    stack: ["Stable Diffusion", "Prompt engineering", "Python"],
    tags: ["Generative AI", "Design tooling"],
    featured: true
  },
  {
    id: "toss-uigen",
    era: "2023",
    org: "Toss",
    title: "UI code generator and RAG search",
    summary: "I fine-tuned LLaMA on internal UI code and brought prototyping down to minutes.",
    problem:
      "The design system was documented but hard to search. Components were rebuilt from scratch or used against the style guide.",
    approach:
      "I fine-tuned LLaMA on an internal dataset so that feeding it YAML produced code matching the Toss UI system, " +
      "then chunked and embedded docs, code and style guides and added natural language search with LangChain and ChromaDB.",
    result:
      "UI prototyping went from hours to minutes. Onboarding for new developers and component reuse improved alongside it.",
    metrics: [{ k: "Prototyping", v: "Hours → minutes" }],
    stack: ["LLaMA", "HuggingFace", "LangChain", "ChromaDB", "OpenAI API"],
    tags: ["LLM", "RAG", "Developer tooling"],
    featured: true
  },
  {
    id: "toss-face",
    era: "2022 — 2023",
    org: "Toss",
    title: "Face payment and smart door lock authentication",
    summary: "I added 3D depth-based anti-spoofing so people could pass with no card and no PIN.",
    problem:
      "Face authentication falls to a single photograph. Before it could touch payments or building access, spoofing had to be closed.",
    approach:
      "I filtered spoofing with 3D depth information and customized AdaFace and ArcFace to raise accuracy, " +
      "then wired the modules into Android and iOS natively through JNI.",
    result:
      "Real-time authentication shortened payment time and ran building access without dedicated security hardware. " +
      "De-identification followed internal policy, so privacy was designed in rather than bolted on.",
    stack: ["OpenCV", "C++", "AdaFace", "ArcFace", "JNI", "Android NDK", "iOS"],
    tags: ["Computer vision", "Security", "Native"]
  },
  {
    id: "toss-scheduling",
    era: "2023",
    org: "Toss",
    title: "Automated shift scheduling for the contact center",
    summary: "A roster two people spent two weeks on now comes out in five minutes.",
    problem:
      "Hundreds of shifts, leave requests and rotation rules were matched by hand. One change meant starting over.",
    approach:
      "I modeled the constraints as a linear program and solved it with Google OR-Tools, keeping the structure " +
      "loose enough to re-solve in real time.",
    result:
      "Scheduling fell from two weeks to five minutes. The same engine went on to assign lodging for a workshop of several thousand people.",
    metrics: [{ k: "Scheduling time", v: "2 weeks → 5 minutes" }],
    stack: ["Google OR-Tools", "Python", "Linear programming"],
    tags: ["Optimization", "Operations automation"]
  },
  {
    id: "samsung-mlplatform",
    era: "2017 — 2018",
    org: "Samsung Electronics",
    title: "Machine learning platform on the internal cloud",
    summary: "An organization that took days to deploy a model started doing it in hours.",
    problem:
      "Each team ran models on its own servers. Experiments did not reproduce and every deployment was manual.",
    approach:
      "I designed a Kubernetes-based ML platform on the internal cloud infrastructure, versioned models with Docker, " +
      "and auto-deployed WaveNet, DeepVoice2, SRGAN, CycleGAN and SSD behind APIs.",
    result:
      "Development to deployment went from days to hours. With several teams experimenting on the same platform, " +
      "models that had been stuck at PoC moved into production.",
    metrics: [{ k: "Deployment lead time", v: "Days → hours" }],
    stack: ["Kubernetes", "Docker", "TensorFlow", "Jenkins", "GitLab"],
    tags: ["Platform", "MLOps"],
    featured: true
  },
  {
    id: "samsung-vran",
    era: "2019 — 2020",
    org: "Samsung Electronics Networks",
    title: "5G vRAN GPU automation and statistical analysis",
    summary: "I caught the problems that surfaced in an early 5G launch by designing UDP log analysis.",
    problem:
      "There was no visibility into where the virtualized radio access network bottlenecked. Latency and error rates " +
      "climbed with no identifiable cause.",
    approach:
      "I designed a statistics system that watched traffic, latency and error rates in real time and optimized " +
      "CUDA-based parallel processing. I also ran the workshops with NVIDIA headquarters and aligned the technical specs.",
    result:
      "Automatic bottleneck detection and resource reallocation raised operational efficiency. Anomaly detection and " +
      "failure prediction improved availability, and I became the channel for the global technical collaboration.",
    stack: ["CUDA", "NVIDIA GPU", "Kubernetes", "Prometheus", "Grafana", "InfluxDB"],
    tags: ["GPU", "5G", "Global collaboration"]
  },
  {
    id: "samsung-music",
    era: "2014 — 2015",
    org: "Samsung Research",
    title: "Real-time music recognition across 3 million songs",
    summary: "I built the fingerprinting engine in house, with no external API.",
    problem:
      "Depending on an outside service for music recognition means paying forever and handing the product roadmap to someone else.",
    approach:
      "I generated audio fingerprints with compact sub-fingerprint hashing and designed a fast hash indexing structure, " +
      "then built the Android app and the metadata management UI on top.",
    result:
      "More than 3 million songs recognized in real time. Removing the external API dependency fixed both cost and " +
      "reliability, and the work reached the final round of the Samsung Electronics paper award.",
    metrics: [
      { k: "Index size", v: "3M+ songs" },
      { k: "Internal recognition", v: "Paper award finalist" }
    ],
    stack: ["C++", "Python", "Flask", "BerkeleyDB", "mmap", "Android"],
    tags: ["Audio", "Search", "In-house engine"]
  },
  {
    id: "daum-vision",
    era: "2008 — 2011",
    org: "Daum",
    title: "Object recognition and image search",
    summary: "In 2010 I built visual search that matched 7 million images in real time.",
    problem:
      "Searching by image was still unfamiliar technology. Deduplication and quality filtering were being done by hand.",
    approach:
      "I implemented large-scale real-time matching with histogram-based Hamming embedding and LIS indexing, " +
      "and built image hash deduplication, adult image filtering, face detection and a category classifier alongside it.",
    result:
      "At 7 million images it returned faster responses and higher precision than what was typical at the time. " +
      "The work carried into representative image recommendation for shopping search, where it improved conversion.",
    metrics: [{ k: "Index size", v: "7M images" }],
    stack: ["OpenCV", "C++", "Python", "MySQL", "BerkeleyDB", "Twisted"],
    tags: ["Computer vision", "Search"]
  }
];

export const timeline = [
  {
    period: "2025.04 — present",
    org: "ThakiCloud",
    role: "AI platform definition, architecture and leadership",
    where: "Yeoksam, Seoul",
    note: "Building three platform pillars, inference, training and agents, and leading the team.",
    accent: true
  },
  {
    period: "2024.03 — 2025.04",
    org: "2i Studio",
    role: "Founder",
    where: "Yongin, Gyeonggi",
    note: "Built a face-based generative AI platform to 50,000 paying users and 400M KRW in revenue."
  },
  {
    period: "2021.01 — 2024.02",
    org: "Toss",
    role: "Senior Machine Learning Engineer",
    where: "Seoul",
    note: "Crossed domains: CDP personalization, generative AI tooling, face authentication, shift scheduling and credit scoring."
  },
  {
    period: "2011.09 — 2020.12",
    org: "Samsung Electronics",
    role: "Senior Software Engineer · ML Researcher · Development Manager",
    where: "Suwon",
    note: "Built the ML platform, 5G vRAN GPU work, music recognition and unified search, and shaped technical direction."
  },
  {
    period: "2008.09 — 2011.08",
    org: "Daum",
    role: "Machine Learning Engineer",
    where: "Jeju",
    note: "Built object recognition and image search."
  },
  {
    period: "2007.01 — 2008.08",
    org: "Computer vision startup",
    role: "Software Engineer",
    where: "Seoul",
    note: "Started in image processing and pattern recognition. Those problems led directly to the image search work later."
  }
];

export const strategy = {
  intro:
    "My title said engineer, but a good share of the work with the most impact came from strategy and planning. " +
    "Defining the problem precisely and bringing back an answer that can actually be executed is where I am strongest.",
  items: [
    {
      org: "Toss",
      title: "Toss Securities community and overseas equities strategy",
      note: "Proposed an execution roadmap that treated retention and new acquisition as one problem, and folded in the feedback."
    },
    {
      org: "Samsung Electronics",
      title: "n-Screen cloud service strategy",
      note: "Designed and presented a content continuity structure linking phone, TV and tablet. (2011)"
    },
    {
      org: "Samsung Electronics",
      title: "Platform transition strategy",
      note: "Analyzed the limits of a Bada OS centered strategy and proposed moving to Android with ChatON as a platform. (2012)"
    },
    {
      org: "Samsung Electronics",
      title: "C-Lab first cohort reviewer · Samsung Venture Investment advisor",
      note: "Assessed early ideas for market viability and feasibility. Received several proposal awards."
    },
    {
      org: "Daum",
      title: "Search quality improvement",
      note: "Analyzed hundreds of long-tail queries myself and proposed fixes. The Road View advertising idea shipped and won an award."
    }
  ]
};

export const research = {
  title: "I push the fields I know much wider, much faster",
  body:
    "Vision, signal processing, combinatorial optimization and recommendation are domains I have worked in for years, " +
    "and agents let me extend them further. Because I already know what has to be measured for an answer to count, " +
    "I go from reading a paper straight to an implementation I can measure. When someone who knows the domain holds " +
    "the agent, speed and depth rise together. I write results down as they came out. I have published one saying " +
    "the wall I hit turned out to be my own model.",
  counts: [
    { k: "Repositories built", v: "131" },
    { k: "Finished builds with measurements", v: "32" },
    { k: "Core domains", v: "Optimization · Infra · RecSys · Signal" }
  ],
  link: { label: "Open the technology catalog", url: "tech.html" }
};

export const stack = [
  {
    group: "Agent harness · orchestration",
    note: "Paxis",
    items: [
      "Harness engineering", "Loop engineering", "Graph engineering", "MCP tool integration",
      "Skill routing · retrieval augmentation", "LangGraph", "Human-in-the-loop approval", "Policy · audit trail",
      "Deterministic verification gates", "Multi-agent consensus"
    ]
  },
  {
    group: "Training · fine-tuning · distillation",
    note: "Maxis",
    items: [
      "SFT", "CPT", "DPO", "GRPO", "GKD", "LoRA · QLoRA", "Knowledge distillation",
      "FSDP · DDP", "TRL", "Unsloth", "MLflow", "Eval sets · regression tests"
    ]
  },
  {
    group: "Inference · serving · compression",
    note: "Metis",
    items: [
      "vLLM", "NVIDIA Dynamo", "LMCache", "Prefill-decode disaggregation", "NVFP4 · W4A16",
      "LLM Compressor", "MoE compression · pruning", "Scale-to-zero", "KServe", "Model routing"
    ]
  },
  {
    group: "Speech · vision · generative models",
    items: [
      "VoxCPM2 TTS", "Qwen3-TTS", "Qwen3-ASR", "Speaker diarization (pyannote)", "VLM video understanding",
      "Stable Diffusion", "DreamBooth", "GPT Image", "Text-to-video", "EmbeddingGemma",
      "AdaFace · ArcFace", "OpenCV · ViT"
    ]
  },
  {
    group: "Platform · GPU infrastructure",
    items: [
      "Kubernetes", "Kueue · MultiKueue", "ArgoCD · GitOps", "Helm", "Keycloak",
      "SeaweedFS", "CloudNativePG", "NATS", "Prometheus · Grafana", "CUDA", "Docker"
    ]
  },
  {
    group: "Languages · frameworks",
    items: [
      "Python", "Go (Fiber)", "TypeScript", "C++", "React 19", "Next.js",
      "FastAPI", "PyTorch", "PostgreSQL", "Redis"
    ]
  },
  {
    group: "Classical ML · optimization",
    items: [
      "LightGBM", "CatBoost", "XGBoost", "scikit-learn", "Google OR-Tools",
      "Airflow", "Linear · constraint optimization", "Time series · ranking"
    ]
  }
];

export const contact = {
  title: "If you would like to talk",
  body:
    "I am open to roles with real authority over technical strategy, architecture, R&D direction and product decisions. " +
    "I prefer to exchange specifics by message first.",
  links: [
    { label: "hyojunguy@gmail.com", url: "mailto:hyojunguy@gmail.com", kind: "mail" },
    { label: "GitHub", url: "https://github.com/sylvanus4", kind: "github" },
    { label: "Experiment log", url: "https://2icorp.github.io/papers.html", kind: "link" }
  ],
  resume: {
    title: "Resume",
    note: "Read it on the web or download the PDF.",
    items: [
      { label: "Resume (web)", sub: "English", url: "resume.html?lang=en" },
      { label: "Hyojung_Han_Resume_EN.pdf", sub: "English · 2 pages", url: "Hyojung_Han_Resume_EN.pdf", download: true },
      { label: "한효정_이력서.pdf", sub: "Korean · 3 pages", url: "한효정_이력서.pdf", download: true }
    ]
  }
};

export const reels = [
  /* lead 는 data.js 와 같은 편을 가리켜야 한다. 두 언어가 다른 영상을 앞세우면 안 된다. */
  { n: "00", slug: "00-ainative", cat: "AI native · Jarvis", palette: "amber", ready: true, dur: "0:50",
    lead: true,
    hook: "It starts with speech and ends with speech.",
    blurb: "It starts with speech and ends with speech. One assistant picks from 1,930 skills. This is already running on this laptop." },
  { n: "01", slug: "01-comms", cat: "Communications, end to end", palette: "cyan", ready: true, dur: "0:52",
    blurb: "Signal fingerprinting generalized to radio, with transmitter, channel and receiver split apart to run on a single ordinary server." },
  { n: "02", slug: "02-recsys", cat: "Recommender systems", palette: "amber", ready: true, dur: "1:00",
    blurb: "Moved onto the problems companies actually want solved: coupon budgets, delivery volume, offer ranking." },
  { n: "03", slug: "03-agent", cat: "Agent platform", palette: "violet", ready: true, dur: "0:53",
    blurb: "One assistant operating 2,000 skills. Routing, loops and verification are owned by code." },
  { n: "04", slug: "04-nphard", cat: "NP-hard optimization", palette: "emerald", ready: true, dur: "0:43",
    blurb: "Assignment problems deep learning handles badly: shift rosters, contact center staffing, league schedules." },
  { n: "05", slug: "05-quant", cat: "LLM quantization", palette: "indigo", ready: true, dur: "0:48",
    blurb: "The same model, cheaper to run. Only the ones verified through serving are counted." },
  { n: "06", slug: "06-distill", cat: "Small model distillation", palette: "teal", ready: true, dur: "0:31",
    blurb: "Repetitive workers move to a small model, and the large one is kept for the places that need judgment." },
  { n: "07", slug: "07-acoustic", cat: "Acoustics", palette: "lime", ready: true, dur: "0:40",
    blurb: "From recognizing 3.6 million songs in real time to predictive maintenance. What sound can do." },
  { n: "08", slug: "08-vision", cat: "Vision", palette: "crimson", ready: true, dur: "0:55",
    blurb: "Object search across 7.3 million images, and optical channels. Moving data where there is no network." },
  { n: "09", slug: "09-aiplatform", cat: "Paxis · Maxis · Metis", palette: "azure", ready: true, dur: "1:13",
    blurb: "The current work. Setting product direction and base architecture, and personally handling agent builder integration and model quantization." },
  { n: "10", slug: "10-mediagen", cat: "Video · image generation", palette: "violet", ready: true, dur: "0:33",
    blurb: "Assets produced repeatedly without hands. These reels came out of that pipeline." },
  { n: "11", slug: "11-marketing", cat: "Marketing automation", palette: "amber", ready: true, dur: "0:28",
    blurb: "Unattended tech blog operation and competitor intel, automated through to publication." },
  { n: "12", slug: "12-storage", cat: "Storage durability", palette: "teal", ready: true, dur: "0:34",
    blurb: "Only what was counted after injecting real faults. Vendor claims verified by measurement." },
  { n: "13", slug: "13-product", cat: "Domain products", palette: "emerald", ready: true, dur: "0:29",
    blurb: "Legal, education, healthcare, finance. Built local-first where regulation applies." },
  { n: "14", slug: "14-devtool", cat: "Developer tooling", palette: "azure", ready: true, dur: "0:27",
    blurb: "The floor that makes everything else fast. Templates, checkers, documentation, authoring tools." },
  { n: "15", slug: "15-career", cat: "Career archive", palette: "crimson", ready: true, dur: "0:53",
    blurb: "From founding 2i back through Toss, Samsung Electronics and Daum. Twenty years of screens moving again." }
];
