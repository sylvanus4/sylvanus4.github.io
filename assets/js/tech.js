/* 기술 카탈로그 페이지. 본문은 tools/port_tech.py 가 만든 조각을 그대로 주입한다.
   여기서 하는 일은 검색 필터와 카운트뿐이다. */

import { wireBurger } from "./main-nav.js";
import { isEn, t, applyStatic, renderLangToggle } from "./i18n.js";
import { renderLeadReel } from "./reel-lead.js";

const board = document.getElementById("techboard");

applyStatic();
renderLangToggle(document.getElementById("langpick"));
wireBurger();

/* 영상 자막은 언어를 따라간다. 카드 본문은 국문 생성물이 정본이고,
   영문은 assets/tech-en.json 오버레이(제목 키)로 주입 후 갈아끼운다 —
   생성기(port_tech.py)를 건드리지 않아 재생성해도 영문이 살아남는다. */
let reels = [];

async function load() {
  reels = (isEn ? await import("./data.en.js") : await import("./data.js")).reels;

  // 계열 카드보다 먼저. 카탈로그를 열자마자 보이는 자리다.
  renderLeadReel(document.getElementById("reel-lead"), reels);

  try {
    const res = await fetch("assets/tech-body.html");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    board.innerHTML = await res.text();
  } catch (e) {
    board.innerHTML = `<p class="muted">${t("tech.failed")}
      <a href="https://2icorp.github.io/tech.html" target="_blank" rel="noopener" style="color:var(--cy)">${t("tech.origin")}</a></p>`;
    return;
  }
  if (isEn) await applyEnCatalog();
  mountReels();
  wireSearch();
  wireCount();
}

/* 영문 오버레이. 국문 제목을 키로 쓴다(160장 중복 0 확인됨).
   오버레이가 없거나 키가 빠지면 그 카드만 국문으로 남는다(fail-open) —
   전량 커버는 tools/qa.mjs 게이트가 별도 방법(파일 대조)으로 센다. */
async function applyEnCatalog() {
  let en;
  try {
    const res = await fetch("assets/tech-en.json");
    if (!res.ok) return;
    en = await res.json();
  } catch (_) { return; }

  board.querySelectorAll(".pcard").forEach((c) => {
    const titleEl = c.querySelector(".pcard__title");
    const m = titleEl && en.cards[titleEl.textContent];
    if (!m) return;
    titleEl.textContent = m.t;
    const ex = c.querySelector(".pcard__excerpt");
    if (ex) ex.textContent = m.e;
    const tg = c.querySelector(".pcard__tags");
    if (tg && m.g) tg.innerHTML = m.g.map((x) => `<span>${x}</span>`).join("");
    const cat = c.querySelector(".pcard__cat");
    if (cat) cat.textContent = cat.textContent === "비공개" ? "Private" : "Public";
  });

  board.querySelectorAll(".fam__t").forEach((h) => {
    const f = en.fams[h.id];
    if (!f) return;
    h.firstChild.textContent = f.t;      // h2 텍스트 노드. span.fam__n 은 뒤에 남는다
    const n = h.querySelector(".fam__n");
    if (n) n.textContent = f.n;
    const d = h.closest(".fam__head")?.querySelector(".fam__d");
    if (d) d.textContent = f.d;
  });

  // 분류 점프 칩. href "#tech-<slug>" ↔ 헤더 id "techt-<slug>"
  const nav = board.querySelector(".famnav");
  if (nav) {
    nav.setAttribute("aria-label", "Jump to a category");
    const k = nav.querySelector(".famnav__k");
    if (k) k.textContent = "Category";
    nav.querySelectorAll(".famnav__chip").forEach((ch) => {
      const slug = (ch.getAttribute("href") || "").replace("#tech-", "");
      const f = en.fams["techt-" + slug];
      if (f) ch.firstChild.textContent = f.t;
    });
  }

  const lbl = board.querySelector(".techsearch__l");
  if (lbl) lbl.textContent = "Filter by name, description or stack";
  const q = board.querySelector("#techq");
  if (q) q.setAttribute("placeholder", "e.g. storage, Rust, CP-SAT, quantization");
}

function wireCount() {
  const n = board.querySelectorAll(".pcard").length;
  const el = document.getElementById("techtotal");
  if (el) el.textContent = n.toLocaleString(isEn ? "en-US" : "ko-KR");
}

function wireSearch() {
  const box = board.querySelector(".techsearch");
  const input = board.querySelector("#techq");
  const out = board.querySelector("#techn");
  if (!box || !input) return;
  box.hidden = false;

  const cards = [...board.querySelectorAll(".pcard")];
  const fams = [...board.querySelectorAll(".fam")];
  const chips = [...board.querySelectorAll(".famnav__chip")];
  // 검색 대상 문자열을 한 번만 만들어 둔다
  const hay = cards.map((c) => (c.dataset.q || "") + " " + c.textContent.toLowerCase());

  const apply = () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    cards.forEach((c, i) => {
      const hit = !q || hay[i].includes(q);
      c.hidden = !hit;
      if (hit) shown++;
    });
    // 결과가 하나도 없는 분류는 통째로 숨긴다
    fams.forEach((f) => {
      f.hidden = ![...f.querySelectorAll(".pcard")].some((c) => !c.hidden);
    });
    chips.forEach((ch) => {
      const t = document.querySelector(ch.getAttribute("href"));
      ch.style.opacity = t && t.closest(".fam")?.hidden ? "0.35" : "";
    });
    out.textContent = q ? `${shown}${t("tech.match")}` : "";
  };

  /* 주의: 타이머 변수를 t 로 두면 i18n 의 t() 를 가려 위 매치 카운트가
     TypeError 로 죽는다 (2026-08-10 실제로 그랬다). */
  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(apply, 120);
  });
  input.addEventListener("search", apply);
}

load();

/* 분류마다 그 카테고리 영상을 머리에 얹는다. 아직 안 만든 편은 자리만 잡는다.
   data.js 의 reels 가 유일한 출처라 홈과 카탈로그가 어긋날 수 없다. */
function mountReels() {
  const by = Object.fromEntries(reels.map((r) => [r.slug, r]));
  document.querySelectorAll(".fam__reel[data-reel]").forEach((host) => {
    const r = by[host.dataset.reel];
    if (!r) { host.remove(); return; }
    host.dataset.pal = r.palette;
    host.innerHTML = r.ready
      ? `<video class="fam__v" controls preload="none" playsinline
                poster="assets/video/${r.slug}.jpg" aria-label="${r.cat}">
           <source src="assets/video/${r.slug}.mp4" type="video/mp4">
           ${t("reels.noVideo")}
           <a href="assets/video/${r.slug}.mp4">${t("reels.download")}</a>
         </video>
         <p class="fam__vcap">${r.blurb} <em>${r.dur}</em></p>`
      : `<div class="fam__v fam__vslot"><span>${t("tech.reelSoon")}</span></div>
         <p class="fam__vcap">${r.blurb}</p>`;
  });
}
