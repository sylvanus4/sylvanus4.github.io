/* 언어 해석 + 화면 고정 문구.
   기본은 한국어다. 브라우저 언어로 추측하지 않는다 — 한국어 독자가 다수이고,
   추측이 틀리면 첫 화면부터 잘못된 언어를 보게 된다.
   우선순위: ?lang= > 지난 선택(localStorage) > ko.
   resume.js 가 이미 쓰던 ?lang=en 규약을 사이트 전체로 넓힌 것이다. */

const SUPPORTED = ["ko", "en"];
const STORE_KEY = "hh-lang";

function resolve() {
  const q = new URLSearchParams(location.search).get("lang");
  if (SUPPORTED.includes(q)) {
    try { localStorage.setItem(STORE_KEY, q); } catch (_) {}
    return q;
  }
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (SUPPORTED.includes(saved)) return saved;
  } catch (_) {}
  return "ko";
}

export const LANG = resolve();
export const isEn = LANG === "en";

/* 같은 페이지, 같은 위치를 유지한 채 언어만 바꾸는 주소 */
export function langHref(lang) {
  const u = new URL(location.href);
  u.searchParams.set("lang", lang);
  return u.pathname + u.search + u.hash;
}

/* ---------- 화면 고정 문구 ----------
   데이터(data.js / data.en.js)가 아니라 UI 껍데기 문구만 여기 둔다. */
const UI = {
  ko: {
    "meta.title": "한효정 · AI Systems Engineer — 연구에서 배포까지",
    "meta.desc":
      "19년차 AI 시스템 엔지니어 한효정. Daum, 삼성전자, Toss를 거쳐 지금은 ThakiCloud에서 추론·학습·에이전트 플랫폼을 설계합니다.",
    "meta.techTitle": "보유 기술 카탈로그 · 한효정",
    "meta.demosTitle": "돌아가는 데모 44개 · 한효정",

    "skip": "본문으로 건너뛰기",
    "nav.aria": "주요 섹션",
    "nav.stack": "스택",
    "nav.reels": "영상",
    "nav.work": "작업",
    "nav.career": "이력",
    "nav.research": "연구",
    "nav.skills": "도구",
    "nav.demos": "데모",
    "nav.tech": "카탈로그",
    "nav.resume": "이력서",
    "nav.cta": "연락하기",
    "nav.open": "메뉴 열기",
    "nav.close": "메뉴 닫기",
    "nav.langAria": "언어 선택",

    "hero.workBtn": "선택한 작업 보기",
    "hero.contactBtn": "연락하기",
    "hero.hint": "스크롤하면 스택을 통과합니다",

    "stack.eyebrow": "The Stack",
    "stack.h2": "다섯 층을 하나로 꿰는 사람",
    "stack.lede":
      "대부분의 엔지니어는 한두 층에서 깊어집니다. 저는 다섯 층을 모두 직접 만들어 봤고, 그래서 층 사이에서 무엇이 깨지는지 압니다. 스크롤하면 위에서 아래로 내려갑니다.",

    "reels.eyebrow": "Reels",
    "reels.h2": "기술을 90초 안에 보여드립니다",
    "reels.lede":
      "글로 읽으면 오래 걸리는 것들을 영상으로 만들고 있습니다. 각 편은 기술을 짧게 설명하고, 제가 실제로 구현한 사례를 보여준 뒤, 그 기술로 풀 수 있는 문제 세 가지로 끝납니다.",
    "reels.featured": "대표 영상",
    "reels.soon": "준비 중",
    "reels.noVideo": "이 브라우저는 영상 재생을 지원하지 않습니다.",
    "reels.download": "영상 내려받기",
    "reels.soonAria": "영상 준비 중",

    "work.eyebrow": "Selected Work",
    "work.h2": "문제, 접근, 그리고 숫자",
    "work.lede":
      "만들었다는 말보다 무엇이 얼마나 달라졌는지가 중요합니다. 카드를 열면 문제와 접근, 결과를 순서대로 볼 수 있습니다.",
    "work.problem": "문제",
    "work.approach": "접근",
    "work.result": "결과",
    "work.more": "자세히",
    "work.less": "접기",

    "career.eyebrow": "Career",
    "career.h2": "제주에서 수원, 강남을 거쳐 역삼까지",

    "research.eyebrow": "Research & Evidence",

    "skills.eyebrow": "Toolbox",
    "skills.h2": "손에 익은 것들",

    "contact.eyebrow": "Contact",

    "tech.eyebrow": "Technology Catalog",
    "tech.h1": "쓰던 것을 다시 꺼내 씁니다",
    "tech.lede1":
      "직접 만들어 굴리고 있는 저장소 <b id=\"techtotal\">127</b>개입니다. 새 과제를 받으면 백지에서 시작하지 않고 이 목록에서 맞는 조각을 먼저 찾습니다. 그래서 첫 결과가 빨리 나옵니다.",
    "tech.lede2":
      "105개는 2026년에 손댄 것이고 나머지는 휴면입니다. 111개는 비공개 저장소라 링크를 눌러도 코드가 보이지 않습니다. 무엇을 갖고 있는지에 대한 목록이지 코드를 공개하겠다는 뜻은 아닙니다.",
    "tech.langs": "주 사용 언어 · Python 66 · JavaScript 23 · TypeScript 12 · Rust 10 · HTML 6 · Go 4",
    "tech.loading": "카탈로그를 불러오는 중입니다.",
    "tech.failed": "카탈로그를 불러오지 못했습니다.",
    "tech.origin": "원본 목록 보기",
    "tech.koOnly": "카탈로그 항목 설명은 한국어로만 제공합니다.",
    "tech.match": "개 일치",
    "tech.reelSoon": "영상 준비 중",

    "demos.eyebrow": "Live Demos",
    "demos.h1": "말로 설명하는 대신, 눌러 보시면 됩니다",
    "demos.lede":
      "브라우저에서 그 자리에서 계산하는 데모 <b id=\"demototal\">44</b>개입니다. 영상도 슬라이드도 아니고 값을 바꾸면 결과가 다시 나옵니다. 제가 다루는 문제가 실제로 어떤 모양인지 보시는 게 가장 빠릅니다.",
    "demos.note":
      "12개는 제 개인 저장소에 소스까지 공개돼 있어 코드를 바로 열어 볼 수 있습니다. 나머지는 배포된 화면만 공개돼 있습니다.",
    "demos.loading": "데모 목록을 불러오는 중입니다.",
    "demos.failed": "데모 목록을 불러오지 못했습니다.",
    "demos.open": "데모 열기",
    "demos.source": "소스",
    "demos.badgeOwn": "소스 공개",
    "demos.badgeHosted": "배포 화면",
    "demos.shotAlt": "화면 캡처",

    "foot.where": "ThakiCloud · 서울 역삼",
    "noscript":
      "이 페이지는 자바스크립트로 내용을 불러옵니다. 연락은 hyojunguy@gmail.com 으로 주세요."
  },

  en: {
    "meta.title": "Hyojung Han · AI Systems Engineer — Research to Deployment",
    "meta.desc":
      "Hyojung Han, AI systems engineer with 19 years of experience. Built recognition engines and ML platforms at Daum, Samsung Electronics and Toss. Now designs inference, training and agent platforms at ThakiCloud.",
    "meta.techTitle": "Technology Catalog · Hyojung Han",
    "meta.demosTitle": "44 Live Demos · Hyojung Han",

    "skip": "Skip to content",
    "nav.aria": "Main sections",
    "nav.stack": "Stack",
    "nav.reels": "Reels",
    "nav.work": "Work",
    "nav.career": "Career",
    "nav.research": "Research",
    "nav.skills": "Toolbox",
    "nav.demos": "Demos",
    "nav.tech": "Catalog",
    "nav.resume": "Resume",
    "nav.cta": "Get in touch",
    "nav.open": "Open menu",
    "nav.close": "Close menu",
    "nav.langAria": "Language",

    "hero.workBtn": "See selected work",
    "hero.contactBtn": "Get in touch",
    "hero.hint": "Scroll to pass through the stack",

    "stack.eyebrow": "The Stack",
    "stack.h2": "One person across all five layers",
    "stack.lede":
      "Most engineers go deep in one or two layers. I have built all five myself, which is why I know what breaks between them. Scroll to travel from the top layer down.",

    "reels.eyebrow": "Reels",
    "reels.h2": "Each capability in 90 seconds",
    "reels.lede":
      "Some things take too long to read. Each reel explains one capability, shows something I actually built with it, and closes with three problems it can solve.",
    "reels.featured": "Featured reel",
    "reels.soon": "Coming soon",
    "reels.noVideo": "This browser cannot play the video.",
    "reels.download": "Download the video",
    "reels.soonAria": "reel coming soon",

    "work.eyebrow": "Selected Work",
    "work.h2": "The problem, the approach, the numbers",
    "work.lede":
      "What changed matters more than what was built. Open a card to read the problem, the approach and the result in order.",
    "work.problem": "Problem",
    "work.approach": "Approach",
    "work.result": "Result",
    "work.more": "Details",
    "work.less": "Collapse",

    "career.eyebrow": "Career",
    "career.h2": "From Jeju to Suwon, Gangnam and now Yeoksam",

    "research.eyebrow": "Research & Evidence",

    "skills.eyebrow": "Toolbox",
    "skills.h2": "Tools I reach for",

    "contact.eyebrow": "Contact",

    "tech.eyebrow": "Technology Catalog",
    "tech.h1": "I reuse what I have already built",
    "tech.lede1":
      "<b id=\"techtotal\">127</b> repositories I built and still maintain. When a new problem arrives I do not start from a blank page. I look here first for a piece that fits, which is why the first result comes quickly.",
    "tech.lede2":
      "105 were touched in 2026 and the rest are dormant. 111 are private, so the links will not show you code. This is an inventory of what I have, not a promise to open source it.",
    "tech.langs": "Primary languages · Python 66 · JavaScript 23 · TypeScript 12 · Rust 10 · HTML 6 · Go 4",
    "tech.loading": "Loading the catalog.",
    "tech.failed": "The catalog could not be loaded.",
    "tech.origin": "Open the original list",
    "tech.koOnly": "Catalog entry descriptions are available in Korean only.",
    "tech.match": " matching",
    "tech.reelSoon": "Reel coming soon",

    "demos.eyebrow": "Live Demos",
    "demos.h1": "Rather than explain it, you can just press it",
    "demos.lede":
      "<b id=\"demototal\">44</b> demos that compute in your browser on the spot. Not a video and not a slide: change a value and the result is recomputed. The fastest way to see the shape of the problems I work on.",
    "demos.note":
      "12 of them ship their source in my own public repositories, so you can open the code directly. The rest are published as running screens only.",
    "demos.loading": "Loading the demo list.",
    "demos.failed": "The demo list could not be loaded.",
    "demos.open": "Open demo",
    "demos.source": "Source",
    "demos.badgeOwn": "Source open",
    "demos.badgeHosted": "Running screen",
    "demos.shotAlt": "screenshot",

    "foot.where": "ThakiCloud · Yeoksam, Seoul",
    "noscript":
      "This page loads its content with JavaScript. You can reach me at hyojunguy@gmail.com."
  }
};

export const t = (key) => UI[LANG][key] ?? UI.ko[key] ?? key;

/* data-i18n / data-i18n-html / data-i18n-attr 를 훑어 문구를 갈아끼운다.
   HTML 에는 한국어가 그대로 들어 있어 자바스크립트가 죽어도 한국어 페이지는 읽힌다. */
export function applyStatic(root = document) {
  document.documentElement.lang = LANG;

  root.querySelectorAll("[data-i18n]").forEach((n) => {
    const v = UI[LANG][n.dataset.i18n];
    if (v != null) n.textContent = v;
  });
  root.querySelectorAll("[data-i18n-html]").forEach((n) => {
    const v = UI[LANG][n.dataset.i18nHtml];
    if (v != null) n.innerHTML = v;
  });
  // data-i18n-attr="aria-label:nav.open|title:meta.title"
  root.querySelectorAll("[data-i18n-attr]").forEach((n) => {
    n.dataset.i18nAttr.split("|").forEach((pair) => {
      const [attr, key] = pair.split(":");
      const v = UI[LANG][key];
      if (v != null) n.setAttribute(attr, v);
    });
  });

  if (!isEn) return;
  // 페이지마다 제목 키가 다르다. <html data-title-key="..."> 로 지정한다.
  document.title = t(document.documentElement.dataset.titleKey || "meta.title");
  const d = document.querySelector('meta[name="description"]');
  if (d) d.setAttribute("content", t("meta.desc"));
}

/* 언어 전환. 링크 두 개짜리 전체 새로고침이다 —
   부분 갱신은 코드가 늘어나는 데 비해 얻는 게 없다. */
export function renderLangToggle(host) {
  if (!host) return;
  host.setAttribute("role", "group");
  host.setAttribute("aria-label", t("nav.langAria"));
  host.innerHTML = ["ko", "en"]
    .map(
      (l) =>
        `<a class="langpick__b" href="${langHref(l)}" hreflang="${l}" lang="${l}"
            aria-current="${String(l === LANG)}">${l === "ko" ? "한국어" : "EN"}</a>`
    )
    .join("");
}
