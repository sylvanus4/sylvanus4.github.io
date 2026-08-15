// Public demo. It shows what ten systems measured; it does not run them.
//
// The operating console that runs these repositories lives on a loopback
// server on my machine and is not what is published here: the implementations
// are private. What travels is the finding and the scene that carries it, so
// nothing on this page executes anything or talks to a backend.

import { SceneView, reducedMotion } from './gl.js';
import { buildScene } from './scenes.js';
import { PROJECTS, KIND } from './data.js';

const UI = {
  ko: {
    htmlLang: 'ko',
    toggle: 'English',
    title: '재 보고 나서 달라진 것들',
    lede: '열 개 도메인에서 각자 진짜 백엔드를 붙여 다시 쟀습니다. 합성기, 물리 엔진, 공개 궤도 카탈로그, 기상 관측 아카이브, 자체 GPU 위의 모델로 시뮬레이터를 갈아 끼우자 결론이 달라졌습니다. 각 시스템이 무엇을 쟀고 무엇을 아직 모르는지 함께 놓았습니다.',
    facts: (n, r) => [`시스템 <b>${n}</b>개`, `실측 백엔드 <b>${n}</b>종`, `아직 답하지 못한 것 ${r}건`, '실행 코드 비공개'],
    proof: [
      { id: 'siliconpilot', n: '46 / 17', w: '두 구조가 같은 넷리스트로 합성됩니다', go: 'SiliconPilot 보기' },
      { id: 'orbitguard', n: '31 / 210', w: '근접 경보 상위는 같은 물체를 두 번 센 것입니다', go: 'OrbitGuard 보기' },
      { id: 'helios', n: '63.8%', w: '최대 부하에서도 전력의 이만큼이 유휴분입니다', go: 'Helios 보기' },
    ],
    openH: (n) => `아직 답하지 못한 것 ${n}건`,
    hint: '끌어서 돌리고, 휠로 확대합니다.',
    nogl: '이 브라우저에서는 WebGL2를 쓸 수 없어 그림을 건너뜁니다. 아래 측정값은 그대로 읽으실 수 있습니다.',
    note: '<strong>왜 화면만 있고 코드는 없나.</strong> 열 저장소는 비공개입니다. 사내 클러스터 경로와 아직 정리되지 않은 실험 코드가 섞여 있어 통째로 열 수 없고, 대신 무엇을 어떻게 쟀고 무엇이 남았는지를 여기에 남깁니다. 기술 항목은 카탈로그에 비공개 표시로 올려 두었습니다. 재현 절차나 원본 측정값이 필요하시면 말씀해 주시면 개별로 보여 드립니다.',
    foot: '수치는 전부 실측입니다. 계산으로 채운 값과 선언한 상수는 위에 그렇게 적어 두었습니다.',
    backTo: '← 데모 목록',
    skip: '본문으로 건너뛰기',
    railLabel: '프로젝트',
  },
  en: {
    htmlLang: 'en',
    toggle: '한국어',
    title: 'What changed once it was measured',
    lede: 'Ten domains, each rewired to a real backend and measured again. A synthesis tool, a physics engine, a public orbital catalogue, a weather archive, models on in-house GPUs. Swapping the simulator for the real thing changed the answer. What each system measured sits next to what it still cannot answer.',
    facts: (n, r) => [`<b>${n}</b> systems`, `<b>${n}</b> real backends`, `${r} questions still open`, 'code private'],
    proof: [
      { id: 'siliconpilot', n: '46 / 17', w: 'two architectures, one identical netlist', go: 'Open SiliconPilot' },
      { id: 'orbitguard', n: '31 / 210', w: 'screened pairs that are one object counted twice', go: 'Open OrbitGuard' },
      { id: 'helios', n: '63.8%', w: 'of the power at peak load is idle draw', go: 'Open Helios' },
    ],
    openH: (n) => `Still open (${n})`,
    hint: 'Drag to orbit, scroll to zoom.',
    nogl: 'This browser has no WebGL2, so the scene is skipped. The measurements below read the same.',
    note: '<strong>Why the screens and not the code.</strong> The ten repositories are private: they carry internal cluster paths and experiment code that is not ready to be read whole. What is published instead is what was measured, how, and what remains. The technology entries are listed in the catalogue marked private. If you need the reproduction steps or the raw measurements, ask and I will walk you through them directly.',
    foot: 'Every figure here is measured. Values that are computed or declared are labelled as such above.',
    backTo: '← All demos',
    skip: 'Skip to content',
    railLabel: 'Projects',
  },
};

const $ = (id) => document.getElementById(id);
const state = { lang: 'ko', project: PROJECTS[0], view: null };

/* ---------- language ---------- */

function initialLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'ko') return q;
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'ko') return saved;
  } catch { /* storage may be blocked; the default is fine */ }
  return (navigator.language || '').startsWith('ko') ? 'ko' : 'ko';
}

function setLang(lang) {
  state.lang = lang;
  try { localStorage.setItem('lang', lang); } catch { /* ignore */ }
  const url = new URL(location.href);
  if (lang === 'ko') url.searchParams.delete('lang'); else url.searchParams.set('lang', lang);
  history.replaceState(null, '', url.toString() + location.hash);
  document.documentElement.lang = UI[lang].htmlLang;
  renderChrome();
  renderProject(state.project);
}

/* ---------- chrome ---------- */

function renderChrome() {
  const t = UI[state.lang];
  const openCount = PROJECTS.reduce((n, p) => n + p.remaining.length, 0);
  document.title = state.lang === 'ko'
    ? `플래그십 10종 — ${t.title}`
    : `Ten flagship systems — ${t.title}`;
  $('title').textContent = t.title;
  $('lede').textContent = t.lede;
  $('facts').innerHTML = t.facts(PROJECTS.length, openCount).map((f) => `<li>${f}</li>`).join('');
  // The loudest thing on the page should be the evidence, not the framing, and
  // each number should take the reader to the project it came from.
  $('proof').innerHTML = t.proof.map((p) =>
    `<li><a href="#${p.id}"><span class="n">${esc(p.n)}</span><span class="w">${esc(p.w)}</span>` +
    `<span class="go">${esc(p.go)} →</span></a></li>`).join('');
  $('lang').textContent = t.toggle;
  $('lang').setAttribute('aria-label', state.lang === 'ko' ? 'Read this page in English' : '이 페이지를 한국어로 보기');
  $('note').innerHTML = t.note;
  $('foot').textContent = t.foot;
  $('rail').setAttribute('aria-label', t.railLabel);
  document.querySelector('.skip').textContent = t.skip;
  document.querySelector('footer a').textContent = t.backTo;
  buildRail();
}

function buildRail() {
  const rail = $('rail');
  rail.innerHTML = '';
  for (const p of PROJECTS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tab';
    b.id = `tab-${p.id}`;
    b.textContent = p.name;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', String(p.id === state.project.id));
    b.setAttribute('aria-controls', 'panel');
    b.addEventListener('click', () => select(p, true));
    rail.appendChild(b);
  }
  // Arrow keys move between tabs, which is what a tablist is expected to do.
  rail.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const i = PROJECTS.findIndex((p) => p.id === state.project.id);
    const next = PROJECTS[(i + d + PROJECTS.length) % PROJECTS.length];
    select(next, true);
    $(`tab-${next.id}`).focus();
  });
}

/* ---------- project ---------- */

function select(project, pushHash) {
  state.project = project;
  if (pushHash) history.replaceState(null, '', `#${project.id}` + location.search);
  for (const p of PROJECTS) {
    const el = $(`tab-${p.id}`);
    if (el) el.setAttribute('aria-selected', String(p.id === project.id));
  }
  renderProject(project);
}

function renderProject(p) {
  const lang = state.lang;
  const t = UI[lang];
  document.documentElement.style.setProperty('--accent', p.accent);

  $('domain').textContent = p.domain[lang];
  $('backend').textContent = p.backend[lang];
  $('proj-name').textContent = p.name;
  $('headline').textContent = p.headline[lang];
  $('finding').textContent = p.finding[lang];

  $('stats').innerHTML = p.stat.map((s) => {
    const v = typeof s.v === 'string' ? s.v : s.v[lang];
    return `<div class="stat"><dt>${esc(s.k[lang])}</dt><dd>${esc(v)}</dd></div>`;
  }).join('');

  $('open-h').textContent = t.openH(p.remaining.length);
  $('open').innerHTML = p.remaining.map((r) => {
    const k = KIND[r.kind];
    // The chip carries the word, not just the colour: a reader who cannot
    // separate the border colours still gets the classification.
    return `<li class="k-${r.kind}"><span class="chip">${esc(k[lang])}</span><span>${esc(r[lang])}</span></li>`;
  }).join('');

  const legend = $('legend');
  if (state.view) {
    const scene = buildScene(p.scene, p.accent);
    // This page gives the scene a taller box than the console does, so the
    // camera comes in a little; otherwise the geometry floats in dead space.
    scene.distance *= 0.86;
    state.view.setScene(scene);
    legend.innerHTML = `${esc(p.legend[lang])}<span class="hint">${esc(t.hint)}</span>`;
  } else {
    legend.textContent = t.nogl;
  }
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/* ---------- boot ---------- */

function boot() {
  const canvas = $('gl');
  try {
    state.view = new SceneView(canvas);
    if (reducedMotion()) state.view.spin = 0;
    state.view.start();
  } catch {
    // No WebGL2. The page is still the page: the findings are text.
    state.view = null;
    canvas.remove();
  }

  const fromHash = PROJECTS.find((p) => p.id === location.hash.slice(1));
  state.project = fromHash || PROJECTS[0];
  state.lang = initialLang();
  document.documentElement.lang = UI[state.lang].htmlLang;

  renderChrome();
  renderProject(state.project);

  $('lang').addEventListener('click', () => setLang(state.lang === 'ko' ? 'en' : 'ko'));
  window.addEventListener('hashchange', () => {
    const p = PROJECTS.find((x) => x.id === location.hash.slice(1));
    if (p && p.id !== state.project.id) select(p, false);
  });
}

boot();
