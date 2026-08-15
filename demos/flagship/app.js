// Public demo. It shows what ten systems measured; it does not run them.
//
// The operating console that runs these repositories lives on a loopback
// server on my machine and is not what is published here: the implementations
// are private. What travels is the finding and the scene that carries it, so
// nothing on this page executes anything or talks to a backend.

import { SceneView, reducedMotion } from './gl.js';
import { buildScene } from './scenes.js';
import { PROJECTS } from './data.js';
import { DemoPanel } from './demo.js';

const UI = {
  ko: {
    htmlLang: 'ko',
    toggle: 'English',
    title: '직접 만든 열 개 시스템',
    lede: '반도체 설계 탐색, 위성 충돌 회피, 로봇 신뢰성, 단백질 예측 검증, 마이크로그리드 운영, 망분리 문서 작업대, 에이전트 런타임, 서빙 오토튜너, AI 클라우드 배치, 멀티모달 검색. 각각 무엇을 하는 시스템인지 읽는 대신 여기서 직접 조작해 보실 수 있습니다. 화면의 숫자는 전부 그 시스템을 실제로 돌려 나온 값입니다.',
    facts: (n) => [`시스템 <b>${n}</b>개`, '전부 조작 가능', '실제 백엔드 실행 결과', '코드 비공개'],
      hint: '끌어서 돌리고, 휠로 확대합니다.',
    more: '측정 기록 보기',
    loading: '불러오는 중',
    nogl: '이 브라우저에서는 WebGL2를 쓸 수 없어 그림을 건너뜁니다. 아래 측정값은 그대로 읽으실 수 있습니다.',
    note: '<strong>코드는 비공개입니다.</strong> 열 저장소는 공개하지 않고, 대신 각 시스템이 무엇을 하는지 이 페이지에서 직접 눌러 보실 수 있게 했습니다. 소스를 함께 보셔야 하는 자리라면 말씀해 주시면 그 자리에서 열어 드립니다.',
    foot: '수치는 전부 실측입니다. 계산으로 채운 값과 선언한 상수는 위에 그렇게 적어 두었습니다.',
    backTo: '← 데모 목록',
    skip: '본문으로 건너뛰기',
    railLabel: '프로젝트',
  },
  en: {
    htmlLang: 'en',
    toggle: '한국어',
    title: 'Ten systems I built',
    lede: 'Chip design-space search, satellite collision avoidance, robot reliability, protein prediction QA, microgrid operation, an air-gapped document workstation, an agent runtime, a serving autotuner, AI cloud placement, multimodal retrieval. Rather than read about them, operate them here. Every number on screen came out of actually running that system.',
    facts: (n) => [`<b>${n}</b> systems`, 'all operable here', 'real backend output', 'code private'],
    hint: 'Drag to orbit, scroll to zoom.',
    more: 'Measurement record',
    loading: 'Loading',
    nogl: 'This browser has no WebGL2, so the scene is skipped. The measurements below read the same.',
    note: '<strong>The code is private.</strong> The ten repositories are not published. What each system does is on this page instead, and you can operate it here. If a conversation calls for reading the source, say so and I will open it there.',
    foot: 'Every figure here is measured. Values that are computed or declared are labelled as such above.',
    backTo: '← All demos',
    skip: 'Skip to content',
    railLabel: 'Projects',
  },
};

const $ = (id) => document.getElementById(id);
const state = { lang: 'ko', project: PROJECTS[0], view: null, demo: null };

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
  document.title = state.lang === 'ko'
    ? `플래그십 10종 — ${t.title}`
    : `Ten flagship systems — ${t.title}`;
  $('title').textContent = t.title;
  $('lede').textContent = t.lede;
  $('facts').innerHTML = t.facts(PROJECTS.length).map((f) => `<li>${f}</li>`).join('');
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

  $('more-s').textContent = t.more;

  // The demo table is fetched per project rather than shipped in one blob: ten
  // lookup tables in the first payload would make the page slow to open for a
  // reader who only ever looks at two of them.
  $('product').textContent = '';
  $('verdict').textContent = '';
  loadDemo(p, lang);

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

const demoCache = new Map();

async function loadDemo(p, lang) {
  const t = UI[lang];
  state.demo.root.innerHTML = `<p class="dhow">${esc(t.loading)}…</p>`;
  let data = demoCache.get(p.id);
  if (!data) {
    try {
      const res = await fetch(`./data/${p.id}.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(String(res.status));
      data = await res.json();
      demoCache.set(p.id, data);
    } catch {
      // A missing table is stated, not hidden behind an empty panel.
      state.demo.root.innerHTML = `<p class="hole">${esc(lang === 'ko'
        ? '이 시스템의 조작표는 아직 올라오지 않았습니다.'
        : 'The lookup table for this system is not published yet.')}</p>`;
      return;
    }
  }
  // The visitor may have switched projects while this was in flight.
  if (state.project.id !== p.id) return;
  $('product').textContent = data.product[lang];
  $('verdict').textContent = data.verdict[lang];
  state.demo.load(data);
  // 어떻게 쟀는지는 접힌 기록 안에 둔다. 없애지는 않는다 -- 재현 경로가 없는
  // 수치는 싣지 않는다는 규칙이 이 화면에도 그대로 적용된다.
  const prov = data.provenance || {};
  $('prov').innerHTML =
    `<dt>${lang === 'ko' ? '무엇을 돌렸나' : 'What ran'}</dt><dd>${esc(prov.backend || '')}</dd>` +
    `<dt>${lang === 'ko' ? '재현 명령' : 'Reproduce'}</dt><dd><code>${esc(prov.command || '')}</code></dd>`;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/* ---------- boot ---------- */

function boot() {
  state.demo = new DemoPanel($('demo'), () => state.lang);
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
