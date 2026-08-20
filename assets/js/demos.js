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
  // 비공개: 라이선스나 데이터 사정으로 배포판을 공개하지 않는 것. 캡처와 설명만 싣는다.
  // 눌러도 안 가는 링크를 다는 것보다 처음부터 링크가 아닌 편이 정직하다 — 버튼이
  // 있는데 죽어 있으면 방문자는 사이트가 깨졌다고 읽는다.
  const priv = d.src === "private";
  const badge = priv ? t("demos.badgePrivate") : own ? t("demos.badgeOwn") : t("demos.badgeHosted");
  const badgeCls = priv ? " dbadge--priv" : own ? " dbadge--own" : "";

  const shotImg = `<img src="assets/img/demos/${esc(d.slug)}.jpg" alt="${esc(title)} ${t("demos.shotAlt")}"
           width="1200" height="750" loading="lazy" decoding="async">`;
  const shot = priv
    ? `<span class="dcard__shot dcard__shot--plain">${shotImg}</span>`
    : `<a class="dcard__shot" href="${esc(d.url)}" target="_blank" rel="noopener"
       aria-label="${esc(title)}${isEn ? "" : " 데모 열기"}">${shotImg}</a>`;

  /* 비공개 카드에도 저장소 링크를 단다. 방문자에게는 GitHub 404 이지만 소유자에게는
     카드에서 코드로 가는 유일한 경로라, 링크 문구를 "비공개 저장소" 로 두어 눌러도
     열리지 않는다는 사실을 누르기 전에 밝힌다(2026-08-20 사용자 지시). */
  const note = pick(d, "note") || t("demos.privateNote");
  const links = priv
    ? `<span class="dlink dlink--muted">${esc(note)}</span>
        ${d.repo ? `<a class="dlink dlink--ghost" href="${esc(d.repo)}" target="_blank" rel="noopener">${t("demos.privateRepo")} ↗</a>` : ""}`
    : `<a class="dlink" href="${esc(d.url)}" target="_blank" rel="noopener">${esc(pick(d, "cta") || t("demos.open"))} ↗</a>
        ${d.repo ? `<a class="dlink dlink--ghost" href="${esc(d.repo)}" target="_blank" rel="noopener">${t("demos.source")} ↗</a>` : ""}`;

  return `
  <article class="dcard">
    ${shot}
    <div class="dcard__body">
      <p class="dcard__badges">
        <span class="dbadge${badgeCls}">${badge}</span>
      </p>
      <h3 class="dcard__title">${esc(title)}</h3>
      <p class="dcard__blurb">${esc(blurb)}</p>
      <p class="dcard__tech">${tech.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</p>
      <p class="dcard__links">${links}</p>
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
