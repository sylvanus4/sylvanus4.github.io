/* 데모 목록 페이지.
   콘텐츠 정본은 assets/demos.json 하나이고 한국어와 영어가 같은 레코드 안에 있다.
   언어별로 파일을 나누면 한쪽에만 항목을 추가해 목록이 어긋난다 — 이 저장소와 2i 에서
   각각 겪은 실패라 여기서는 구조적으로 불가능하게 두었다.

   분류 이동은 자바스크립트 필터가 아니라 앵커다. 스크립트가 죽어도 목록은 남아야 한다. */

import { wireBurger } from "./main-nav.js";
import { isEn, t, applyStatic, renderLangToggle } from "./i18n.js";

const GROUPS = [
  { id: "sched",  ko: "배정 · 일정 최적화", en: "Scheduling & assignment" },
  { id: "serve",  ko: "모델 서빙 · 비용",   en: "Serving & cost" },
  { id: "agent",  ko: "에이전트 · 하네스",  en: "Agents & harness" },
  { id: "signal", ko: "비전 · 신호 · 음향", en: "Vision, signal & acoustics" },
  { id: "data",   ko: "데이터 · 추천",      en: "Data & recommendation" },
  { id: "doc",    ko: "문서 · 지식",        en: "Documents & knowledge" },
  { id: "infra",  ko: "인프라 · 스토리지",  en: "Infrastructure & storage" },
  { id: "media",  ko: "미디어 · 제품",      en: "Media & product" }
];

const board = document.getElementById("demoboard");
const famnav = document.getElementById("demonav");

applyStatic();
renderLangToggle(document.getElementById("langpick"));
wireBurger();

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const pick = (d, key) => (isEn ? d[`${key}_en`] ?? d[key] : d[key]);

function card(d) {
  const title = pick(d, "title");
  const blurb = pick(d, "blurb");
  const tech = pick(d, "tech") || [];
  const own = d.src === "own";

  return `
  <article class="dcard">
    <a class="dcard__shot" href="${esc(d.url)}" target="_blank" rel="noopener"
       aria-label="${esc(title)}${isEn ? "" : " 데모 열기"}">
      <img src="assets/img/demos/${esc(d.slug)}.jpg" alt="${esc(title)} ${t("demos.shotAlt")}"
           width="1200" height="750" loading="lazy" decoding="async">
    </a>
    <div class="dcard__body">
      <p class="dcard__badges">
        <span class="dbadge${own ? " dbadge--own" : ""}">${own ? t("demos.badgeOwn") : t("demos.badgeHosted")}</span>
      </p>
      <h3 class="dcard__title">${esc(title)}</h3>
      <p class="dcard__blurb">${esc(blurb)}</p>
      <p class="dcard__tech">${tech.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</p>
      <p class="dcard__links">
        <a class="dlink" href="${esc(d.url)}" target="_blank" rel="noopener">${esc(pick(d, "cta") || t("demos.open"))} ↗</a>
        ${d.repo ? `<a class="dlink dlink--ghost" href="${esc(d.repo)}" target="_blank" rel="noopener">${t("demos.source")} ↗</a>` : ""}
      </p>
    </div>
  </article>`;
}

async function load() {
  let demos;
  try {
    const res = await fetch("assets/demos.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    demos = await res.json();
  } catch (e) {
    board.innerHTML = `<p class="muted">${t("demos.failed")}</p>`;
    return;
  }

  const used = GROUPS.filter((g) => demos.some((d) => d.group === g.id));

  famnav.innerHTML = used
    .map((g) => {
      const n = demos.filter((d) => d.group === g.id).length;
      return `<a class="dnav__chip" href="#fam-${g.id}">${esc(isEn ? g.en : g.ko)}<b>${n}</b></a>`;
    })
    .join("");

  board.innerHTML = used
    .map((g) => {
      const items = demos.filter((d) => d.group === g.id);
      return `
      <section class="dfam" id="fam-${g.id}">
        <h2 class="dfam__h">${esc(isEn ? g.en : g.ko)}<b>${items.length}</b></h2>
        <div class="dgrid">${items.map(card).join("")}</div>
      </section>`;
    })
    .join("");

  const total = document.getElementById("demototal");
  if (total) total.textContent = demos.length.toLocaleString(isEn ? "en-US" : "ko-KR");

  // 이미지가 하나라도 빠지면 카드가 깨진 액자처럼 보인다. 조용히 두지 않는다.
  board.querySelectorAll(".dcard__shot img").forEach((img) => {
    img.addEventListener("error", () => {
      img.closest(".dcard__shot").classList.add("dcard__shot--missing");
    });
  });
}

load();
