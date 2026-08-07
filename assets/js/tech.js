/* 기술 카탈로그 페이지. 본문은 tools/port_tech.py 가 만든 조각을 그대로 주입한다.
   여기서 하는 일은 검색 필터와 카운트뿐이다. */

import { wireBurger } from "./main-nav.js";
import { isEn, t, applyStatic, renderLangToggle } from "./i18n.js";

const board = document.getElementById("techboard");

applyStatic();
renderLangToggle(document.getElementById("langpick"));
wireBurger();

/* 영상 자막은 언어를 따라간다. 카탈로그 카드 본문은 국문 생성물이라 그대로 둔다. */
let reels = [];

async function load() {
  reels = (isEn ? await import("./data.en.js") : await import("./data.js")).reels;

  if (isEn) {
    const note = document.querySelector(".catalog-konly");
    if (note) note.hidden = false;
  }

  try {
    const res = await fetch("assets/tech-body.html");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    board.innerHTML = await res.text();
  } catch (e) {
    board.innerHTML = `<p class="muted">${t("tech.failed")}
      <a href="https://2icorp.github.io/tech.html" target="_blank" rel="noopener" style="color:var(--cy)">${t("tech.origin")}</a></p>`;
    return;
  }
  mountReels();
  wireSearch();
  wireCount();
}

function wireCount() {
  const n = board.querySelectorAll("a.pcard").length;
  const el = document.getElementById("techtotal");
  if (el) el.textContent = n.toLocaleString(isEn ? "en-US" : "ko-KR");
}

function wireSearch() {
  const box = board.querySelector(".techsearch");
  const input = board.querySelector("#techq");
  const out = board.querySelector("#techn");
  if (!box || !input) return;
  box.hidden = false;

  const cards = [...board.querySelectorAll("a.pcard")];
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
      f.hidden = ![...f.querySelectorAll("a.pcard")].some((c) => !c.hidden);
    });
    chips.forEach((ch) => {
      const t = document.querySelector(ch.getAttribute("href"));
      ch.style.opacity = t && t.closest(".fam")?.hidden ? "0.35" : "";
    });
    out.textContent = q ? `${shown}${t("tech.match")}` : "";
  };

  let t;
  input.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(apply, 120);
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
