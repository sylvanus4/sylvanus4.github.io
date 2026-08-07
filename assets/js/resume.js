/* 이력서 렌더러. 한 장의 HTML 로 두 언어를 낸다.
   ?lang=en 이면 영문, 아니면 한국어. PDF 생성기도 같은 URL 을 쓴다. */

import { ko, en } from "./resume-data.js";
/* 언어 결정은 사이트 전체가 한 곳에서 한다. ?lang= 이 여전히 최우선이라
   PDF 생성기(tools/make_resume_pdf.mjs)의 고정 주소는 그대로 동작한다. */
import { LANG as lang, isEn } from "./i18n.js";

const d = isEn ? en : ko;

const L = isEn
  ? {
      summary: "Summary",
      skills: "Core Technical Skills",
      exp: "Professional Experience",
      rnd: "Systems Built Independently",
      edu: "Education",
      foot: "References and detailed case studies available on request."
    }
  : {
      summary: "핵심 역량",
      skills: "보유 기술",
      exp: "경력 사항",
      rnd: "직접 구현한 시스템",
      edu: "학력",
      foot: "상세 사례와 실측 자료는 요청 시 제공합니다."
    };

document.documentElement.lang = lang;
document.title = isEn
  ? "Hyojung Han · Resume"
  : "한효정 · 이력서 및 경력기술서";

const m = d.meta;

/* 영문 레주메에는 사진을 넣지 않는다(미국·글로벌 관례, ATS 안전).
   한국어판은 국내 관례대로 넣는다. */
const photo = isEn
  ? ""
  : `<img class="rphoto" src="assets/img/profile-480.jpg" alt="${m.name} 사진">`;

/* 영문 레주메는 2장이 상한이다(시니어 표준). 독립 연구개발은 대표 항목만 남긴다.
   한국어 경력기술서는 3~5장이 관례라 전량 유지한다. */
if (isEn) {
  // AI/ML 역할과 가장 가까운 순으로 4그룹만. 전량은 한국어판이 담는다.
  const order = ["agent", "language", "data", "recommend", "vision", "infra", "deploy", "optimi", "signal", "acoustic"];
  const rank = (n) => {
    const i = order.findIndex((k) => n.toLowerCase().includes(k));
    return i < 0 ? 99 : i;
  };
  d.rnd.groups = [...d.rnd.groups].sort((a, b) => rank(a.name) - rank(b.name)).slice(0, 3);
  d.rnd.groups.forEach((g) => (g.items = g.items.slice(0, 2)));
  // A4 두 장(인쇄영역 546mm)에 맞추려면 회사당 대표 프로젝트 2건이 상한이다.
  d.experience.forEach((e) => (e.projects = e.projects.slice(0, 2)));
}

const head = `
  <header class="rhead">
    <div class="rhead-main">
      <h1>${m.name}${isEn ? "" : `<small>${m.nameEn}</small>`}</h1>
      <p class="role">${m.title}</p>
      <p class="meta">
        <b>${m.email}</b> · ${m.location}<br>
        ${m.github} · ${m.blog}
      </p>
    </div>
    ${photo}
  </header>`;

const summary = `
  <section class="sec">
    <h2>${L.summary}</h2>
    <ul class="sum">${d.summary.map((s) => `<li>${s}</li>`).join("")}</ul>
  </section>`;

const skills = `
  <section class="sec">
    <h2>${L.skills}</h2>
    <div class="skills">
      ${d.skills
        .map((g) => `<div class="skill"><b>${g.group}</b><span>${g.items.join(" · ")}</span></div>`)
        .join("")}
    </div>
  </section>`;

const experience = `
  <section class="sec">
    <h2>${L.exp}</h2>
    ${d.experience
      .map(
        (e) => `
      <article class="job">
        <div class="job-h">
          <span class="org">${e.org}</span>
          <span class="role">${e.role}</span>
          <span class="where">${e.where}</span>
          <span class="when">${e.period}</span>
        </div>
        ${e.intro ? `<p class="job-i">${e.intro}</p>` : ""}
        ${e.projects
          .map(
            (p) => `
          <div class="proj">
            <b>${p.name}</b>
            <ul>${p.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
          </div>`
          )
          .join("")}
      </article>`
      )
      .join("")}
  </section>`;

const rnd = `
  <section class="sec">
    <h2>${L.rnd}</h2>
    ${d.rnd.intro ? `<p class="rnd-i">${d.rnd.intro}</p>` : ""}
    ${d.rnd.groups
      .map(
        (g) => `
      <div class="rgroup">
        <b>${g.name}</b>
        <ul>${g.items.map((i) => `<li>${i}</li>`).join("")}</ul>
      </div>`
      )
      .join("")}
  </section>`;

const education = `
  <section class="sec">
    <h2>${L.edu}</h2>
    ${d.education
      .map((e) => `<p class="edu"><b>${e.school}</b><span>${e.degree}</span><i>${e.year}</i></p>`)
      .join("")}
  </section>`;

document.getElementById("sheet").innerHTML =
  head + summary + skills + experience + rnd + education +
  `<p class="rfoot"><span>${L.foot}</span><span>${m.updated}</span></p>`;

/* 화면용 도구막대. 인쇄에서는 CSS 가 숨긴다. */
const bar = document.getElementById("bar");
if (bar) {
  bar.innerHTML = `
    <span>${isEn ? "Resume" : "이력서 · 경력기술서"} · ${m.name}</span>
    <span class="bar-links">
      <a class="b" href="?lang=ko" aria-current="${!isEn}">한국어</a>
      <a class="b" href="?lang=en" aria-current="${isEn}">English</a>
      <a class="b" href="${isEn ? "Hyojung_Han_Resume_EN.pdf" : "한효정_이력서.pdf"}" download>PDF</a>
      <a class="b" href="demos.html">${isEn ? "Demos" : "데모"}</a>
      <a class="b" href="tech.html">${isEn ? "Catalog" : "카탈로그"}</a>
      <a class="b" href="./">${isEn ? "Portfolio" : "포트폴리오"}</a>
    </span>`;
}
