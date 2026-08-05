/* 페이지 조립 + 인터랙션.
   three.js 는 동적 import 로만 부른다. CDN 이 죽어도 페이지는 그대로 뜬다. */

import { wireBurger } from "./main-nav.js";
import { profile, stats, layers, work, timeline, strategy, research, stack, contact } from "./data.js";

const $ = (s, r = document) => r.querySelector(s);
const el = (id) => document.getElementById(id);

/* ---------- 렌더 ---------- */

function renderHero() {
  el("hero").innerHTML = `
    <div class="wrap hero-in">
     <div class="hero-grid">
      <div class="hero-copy">
      <p class="hero-name rv in">
        <b>${profile.name}</b>
        <span>${profile.nameEn}</span>
        <span>${profile.role}</span>
      </p>
      <h1 class="rv in rv-d1">${profile.tagline.replace(
        /(한 사람이 관통합니다|관통합니다)$/,
        '<span class="grad">$1</span>'
      )}</h1>
      <p class="lede hero-lead rv in rv-d2">${profile.lead}</p>
      <p class="hero-sub rv in rv-d3">${profile.sub}</p>
      <div class="hero-actions rv in rv-d4">
        <a class="btn btn-primary" href="#work" data-magnet>선택한 작업 보기</a>
        <a class="btn btn-ghost" href="#contact" data-magnet>연락하기</a>
      </div>
      </div>
      <figure class="hero-photo rv in rv-d2">
        <picture>
          <source srcset="${profile.photo.webp}" type="image/webp">
          <img src="${profile.photo.jpg}" alt="${profile.photo.alt}" width="960" height="960"
               fetchpriority="high" decoding="async">
        </picture>
      </figure>
     </div>
    </div>
    <p class="hero-hint" aria-hidden="true"><i></i>스크롤하면 스택을 통과합니다</p>
  `;
}

function renderStats() {
  el("stats").innerHTML = stats
    .map(
      (s, i) => `
    <div class="stat rv rv-d${i}">
      <b>${s.value}</b><i>${s.unit}</i>
      <p>${s.label}</p>
    </div>`
    )
    .join("");
}

function renderLayers() {
  el("layers").innerHTML = layers
    .map(
      (l, i) => `
    <article class="layer rv" data-layer="${i}" id="layer-${l.id}">
      <div class="layer-tag">${l.tag}</div>
      <div>
        <h3 class="layer-title">${l.title}</h3>
        <p class="layer-line">${l.line}</p>
        <div class="layer-keys">${l.keys.map((k) => `<span class="chip">${k}</span>`).join("")}</div>
      </div>
      <div class="layer-body-wrap"><p class="layer-body">${l.body}</p></div>
    </article>`
    )
    .join("");
}

const chev = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`;

function renderWork() {
  el("work-grid").innerHTML = work
    .map(
      (w) => `
    <article class="card rv${w.featured ? " wide" : ""}" data-spot data-magnet>
      <div class="card-top"><b>${w.org}</b><span>${w.era}</span></div>
      <h3>${w.title}</h3>
      <p class="card-sum">${w.summary}</p>

      <div class="card-more">
        <div>
          <dl class="qa">
            <div><dt>문제</dt><dd>${w.problem}</dd></div>
            <div><dt>접근</dt><dd>${w.approach}</dd></div>
            <div class="res"><dt>결과</dt><dd>${w.result}</dd></div>
          </dl>
          ${
            w.metrics
              ? `<dl class="metrics">${w.metrics
                  .map((m) => `<div class="metric"><dt>${m.k}</dt><dd>${m.v}</dd></div>`)
                  .join("")}</dl>`
              : ""
          }
          <div class="card-stack">${w.stack.map((s) => `<span class="chip">${s}</span>`).join("")}</div>
          ${
            w.link
              ? `<p style="margin-top:1.2rem"><a class="card-link" href="${w.link.url}" target="_blank" rel="noopener">${w.link.label} ↗</a></p>`
              : ""
          }
        </div>
      </div>

      <button class="card-toggle" type="button" aria-expanded="false">
        <span>자세히</span>${chev}
      </button>
    </article>`
    )
    .join("");
}

function renderTimeline() {
  el("tl").innerHTML = timeline
    .map(
      (t) => `
    <div class="tl-item rv${t.accent ? " accent" : ""}">
      <div class="tl-head">
        <span class="tl-period">${t.period}</span>
        <span class="tl-org">${t.org}</span>
        <span class="tl-role">${t.role}</span>
        <span class="tl-where">${t.where}</span>
      </div>
      <p class="tl-note">${t.note}</p>
    </div>`
    )
    .join("");
}

function renderResearch() {
  el("research-split").innerHTML = `
    <div class="rv">
      <p class="eyebrow">Research &amp; Evidence</p>
      <h2 class="h2">${research.title}</h2>
      <p class="lede">${research.body}</p>
      <p style="margin-top:2rem">
        <a class="btn btn-ghost" href="${research.link.url}" target="_blank" rel="noopener" data-magnet>
          ${research.link.label}
        </a>
      </p>
    </div>
    <div class="rv rv-d2">
      <dl class="counts">
        ${research.counts.map((c) => `<div class="count"><dt>${c.k}</dt><dd>${c.v}</dd></div>`).join("")}
      </dl>
      <p class="muted" style="margin-top:1.4rem;font-size:.92rem">${strategy.intro}</p>
    </div>
  `;

  el("slist").innerHTML = strategy.items
    .map(
      (s) => `
    <div class="sitem rv">
      <div class="sitem-org">${s.org}</div>
      <div><h3>${s.title}</h3><p>${s.note}</p></div>
    </div>`
    )
    .join("");
}

function renderStack() {
  el("sgrid").innerHTML = stack
    .map(
      (g) => `
    <div class="sgroup rv">
      <h3>${g.group}${g.note ? `<b>${g.note}</b>` : ""}</h3>
      <ul>${g.items.map((i) => `<li>${i}</li>`).join("")}</ul>
    </div>`
    )
    .join("");
}

function renderContact() {
  el("contact-in").innerHTML = `
    <p class="eyebrow" style="justify-content:center">Contact</p>
    <h2 class="h2">${contact.title}</h2>
    <p class="lede" style="margin-inline:auto">${contact.body}</p>
    <div class="contact-links">
      ${contact.links
        .map(
          (l) =>
            `<a class="btn ${l.kind === "mail" ? "btn-primary" : "btn-ghost"}" href="${l.url}"${
              l.kind === "mail" ? "" : ' target="_blank" rel="noopener"'
            } data-magnet>${l.label}</a>`
        )
        .join("")}
    </div>
    <div class="resume-box">
      <p class="eyebrow" style="justify-content:center">${contact.resume.title}</p>
      <p class="muted" style="font-size:.93rem;margin-top:.5rem">${contact.resume.note}</p>
      <div class="resume-links">
        ${contact.resume.items
          .map(
            (r) => `<a class="rlink" href="${r.url}"${r.download ? " download" : ""} data-magnet>
              <b>${r.label}</b><span>${r.sub}</span></a>`
          )
          .join("")}
      </div>
    </div>
    <p class="contact-meta">${profile.location} · ${profile.education}</p>
  `;
  el("foot").innerHTML = `
    <span>© ${new Date().getFullYear()} ${profile.name} (${profile.nameEn})</span>
    <span class="mono">${profile.current.org} · ${profile.current.where}</span>
  `;
}

/* ---------- 인터랙션 ---------- */

function wireReveal() {
  const io = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  );
  document.querySelectorAll(".rv:not(.in)").forEach((n) => io.observe(n));
}

function wireCards() {
  document.querySelectorAll("[data-spot]").forEach((card) => {
    card.addEventListener(
      "pointermove",
      (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        card.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      },
      { passive: true }
    );
  });

  document.querySelectorAll(".card-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".card");
      const open = card.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      btn.querySelector("span").textContent = open ? "접기" : "자세히";
    });
  });
}

function wireCursor() {
  if (matchMedia("(pointer: coarse)").matches) return;
  const c = document.createElement("div");
  c.className = "cursor";
  document.body.appendChild(c);
  let x = 0, y = 0, cx = 0, cy = 0;

  addEventListener(
    "pointermove",
    (e) => {
      x = e.clientX; y = e.clientY;
      c.classList.add("on");
    },
    { passive: true }
  );
  addEventListener("pointerleave", () => c.classList.remove("on"), { passive: true });

  document.addEventListener("pointerover", (e) => {
    c.classList.toggle("grow", !!e.target.closest("a, button, [data-magnet]"));
  });

  (function loop() {
    cx += (x - cx) * 0.19;
    cy += (y - cy) * 0.19;
    c.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();
}

function wireNav() {
  const nav = $(".nav");
  const links = [...document.querySelectorAll(".nav-links a")];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const io = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) =>
          a.classList.toggle("on", a.getAttribute("href") === `#${e.target.id}`)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => io.observe(s));

  addEventListener(
    "scroll",
    () => nav.classList.toggle("stuck", scrollY > 24),
    { passive: true }
  );
}

/* 3D 씬은 있으면 좋고 없어도 되는 층위다. 실패해도 조용히 넘어간다. */
async function wireScene() {
  const canvas = el("scene");
  if (!canvas) return;
  let ctl = null;
  try {
    const mod = await import("./scene.js");
    ctl = mod.initScene(canvas);
  } catch (err) {
    console.info("3D 씬을 건너뜁니다:", err && err.message);
    return;
  }
  if (!ctl) return;
  canvas.classList.add("ready");

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    ctl.setProgress(max > 0 ? scrollY / max : 0);
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
  onScroll();

  const io = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        const i = Number(e.target.dataset.layer);
        e.target.classList.toggle("active", e.isIntersecting);
        if (e.isIntersecting) ctl.setActiveLayer(i);
      });
    },
    { rootMargin: "-40% 0px -40% 0px" }
  );
  document.querySelectorAll("[data-layer]").forEach((n) => io.observe(n));
}

/* ---------- 부팅 ---------- */
function boot() {
  renderHero();
  renderStats();
  renderLayers();
  renderWork();
  renderTimeline();
  renderResearch();
  renderStack();
  renderContact();

  wireReveal();
  wireCards();
  wireCursor();
  wireNav();
  wireBurger();
  wireScene();

  document.body.dataset.ready = "1";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
