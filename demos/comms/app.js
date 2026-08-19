// 공개 데모. 다섯 갈래가 무엇을 측정했는지 보여주고, 아무것도 실행하지 않는다.
//
// 이 저장소들의 코드는 비공개다. 여기로 나오는 것은 발견과 그 발견을 담은 조회표뿐이라,
// 이 페이지는 백엔드에 말을 걸지 않는다. 브라우저는 방문자가 고른 조합을 표에서 찾을 뿐이다.

import { SYSTEMS } from './data.js';
import { DemoPanel } from './demo.js';
import { Plot } from './plot.js';

const UI = {
  ko: {
    htmlLang: 'ko',
    toggle: 'English',
    title: '직접 만든 통신 스택',
    lede: '변조 인식, LDPC 복호 커널, 채널추정 처리량, 송신기 지문, 재밍 유형 판별. 물리계층에서 전자전까지 다섯 갈래를 여기서 직접 조작해 보실 수 있습니다. 화면의 숫자는 전부 실제로 돌려 나온 측정값이고, 재현되지 않은 것과 합성 데이터로 잰 것은 그렇게 적어 두었습니다.',
    facts: (n) => [`측정 <b>${n}</b>갈래`, '전부 조작 가능', '실측 조회표', '코드 비공개'],
    hint: '조작을 바꾸면 표시된 점이 곡선 위에서 움직입니다.',
    more: '측정 기록 보기',
    loading: '불러오는 중',
    note: '<strong>코드는 비공개입니다.</strong> 저장소를 공개하지 않는 대신, 각 실험이 무엇을 재서 무엇을 알아냈는지 이 페이지에서 직접 눌러 보실 수 있게 했습니다. 소스를 함께 보셔야 하는 자리라면 말씀해 주시면 그 자리에서 열어 드립니다.',
    foot: '수치는 전부 실측입니다. 합성 벤치에서 잰 것과 재현되지 않은 것은 각 항목에 그렇게 적어 두었습니다.',
    backTo: '← 데모 목록',
    skip: '본문으로 건너뛰기',
    railLabel: '측정',
  },
  en: {
    htmlLang: 'en',
    toggle: '한국어',
    title: 'A comms stack I built',
    lede: 'Modulation recognition, an LDPC decode kernel, channel estimation throughput, transmitter fingerprinting, jammer taxonomy. Five measurements from the physical layer up to electronic warfare, all operable here. Every number came out of a real run, and the ones taken on synthetic benches or that failed to reproduce say so.',
    facts: (n) => [`<b>${n}</b> measurements`, 'all operable here', 'real lookup tables', 'code private'],
    hint: 'Change a control and the marked point moves along the curve.',
    more: 'Measurement record',
    loading: 'Loading',
    note: '<strong>The code is private.</strong> The repositories are not published. What each experiment measured and what it found is on this page instead, and you can operate it here. If a conversation calls for reading the source, say so and I will open it there.',
    foot: 'Every figure here is measured. Where a bench is synthetic, or a result failed to reproduce, the entry says so.',
    backTo: '← All demos',
    skip: 'Skip to content',
    railLabel: 'Measurements',
  },
};

const $ = (id) => document.getElementById(id);
const state = { lang: 'ko', sys: SYSTEMS[0], plot: null, demo: null };

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/* ---------- language ---------- */

function initialLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'ko') return q;
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'ko') return saved;
  } catch { /* storage may be blocked; the default is fine */ }
  return 'ko';
}

function setLang(lang) {
  state.lang = lang;
  try { localStorage.setItem('lang', lang); } catch { /* ignore */ }
  const url = new URL(location.href);
  if (lang === 'ko') url.searchParams.delete('lang'); else url.searchParams.set('lang', lang);
  history.replaceState(null, '', url.toString() + location.hash);
  document.documentElement.lang = UI[lang].htmlLang;
  renderChrome();
  renderSystem(state.sys);
}

/* ---------- chrome ---------- */

function renderChrome() {
  const t = UI[state.lang];
  document.title = state.lang === 'ko'
    ? `통신 스택 5종 — ${t.title}`
    : `Five comms measurements — ${t.title}`;
  $('title').textContent = t.title;
  $('lede').textContent = t.lede;
  $('facts').innerHTML = t.facts(SYSTEMS.length).map((f) => `<li>${f}</li>`).join('');
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
  for (const p of SYSTEMS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tab';
    b.id = `tab-${p.id}`;
    b.textContent = state.lang === 'ko' ? p.name : p.name_en;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', String(p.id === state.sys.id));
    b.setAttribute('aria-controls', 'panel');
    b.addEventListener('click', () => select(p, true));
    rail.appendChild(b);
  }
  rail.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const i = SYSTEMS.findIndex((p) => p.id === state.sys.id);
    const next = SYSTEMS[(i + d + SYSTEMS.length) % SYSTEMS.length];
    select(next, true);
    $(`tab-${next.id}`).focus();
  });
}

/* ---------- system ---------- */

function select(sys, pushHash) {
  state.sys = sys;
  if (pushHash) history.replaceState(null, '', `#${sys.id}` + location.search);
  for (const p of SYSTEMS) {
    const el = $(`tab-${p.id}`);
    if (el) el.setAttribute('aria-selected', String(p.id === sys.id));
  }
  renderSystem(sys);
}

function renderSystem(p) {
  const lang = state.lang;
  const t = UI[lang];
  document.documentElement.style.setProperty('--accent', p.accent);

  $('domain').textContent = p.domain[lang];
  $('backend').textContent = p.backend[lang];
  $('proj-name').textContent = lang === 'ko' ? p.name : p.name_en;
  $('headline').textContent = p.headline[lang];
  $('finding').textContent = p.finding[lang];
  $('stats').innerHTML = p.stat.map((s) => {
    const v = typeof s.v === 'string' ? s.v : s.v[lang];
    return `<div class="stat"><dt>${esc(s.k[lang])}</dt><dd>${esc(v)}</dd></div>`;
  }).join('');
  $('more-s').textContent = t.more;
  $('legend').innerHTML = `${esc(p.legend[lang])}<span class="hint">${esc(t.hint)}</span>`;
  const cv = $('plot');
  if (cv) cv.setAttribute('aria-label', p.legend[lang]);

  $('product').textContent = '';
  $('verdict').textContent = '';
  loadTable(p, lang);
}

const cache = new Map();

async function loadTable(p, lang) {
  const t = UI[lang];
  state.demo.root.innerHTML = `<p class="dhow">${esc(t.loading)}…</p>`;
  let data = cache.get(p.id);
  if (!data) {
    try {
      const res = await fetch(`./data/${p.id}.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(String(res.status));
      data = await res.json();
      cache.set(p.id, data);
    } catch {
      state.demo.root.innerHTML = `<p class="hole">${esc(lang === 'ko'
        ? '이 측정의 조회표는 아직 올라오지 않았습니다.'
        : 'The lookup table for this measurement is not published yet.')}</p>`;
      return;
    }
  }
  if (state.sys.id !== p.id) return;
  $('product').textContent = data.product[lang];
  $('verdict').textContent = data.verdict[lang];
  state.demo.load(data);
  redraw();
  const prov = data.provenance || {};
  $('prov').innerHTML =
    `<dt>${lang === 'ko' ? '무엇을 돌렸나' : 'What ran'}</dt><dd>${esc(prov.backend || '')}</dd>` +
    `<dt>${lang === 'ko' ? '재현 명령' : 'Reproduce'}</dt><dd><code>${esc(prov.command || '')}</code></dd>`;
}

/** 조작이 바뀔 때마다 그림이 같은 표를 다시 그린다. */
function redraw() {
  const d = state.demo.data;
  if (!d || !state.plot) return;
  state.plot.show(d, state.sys.plot, state.demo.sel, state.lang);
}

/* ---------- boot ---------- */

function boot() {
  state.demo = new DemoPanel($('demo'), () => state.lang);
  // 패널이 다시 그려지면 그림도 같은 선택을 따라가야 한다. 패널이 스스로
  // 알리게 만들면 두 벌이 되므로, 여기서 한 번만 감싼다.
  const origRender = state.demo.render.bind(state.demo);
  state.demo.render = () => { origRender(); redraw(); };

  try {
    state.plot = new Plot($('plot'));
  } catch {
    state.plot = null;
    const c = $('plot');
    if (c) c.remove();
  }

  const fromHash = SYSTEMS.find((p) => p.id === location.hash.slice(1));
  state.sys = fromHash || SYSTEMS[0];
  state.lang = initialLang();
  document.documentElement.lang = UI[state.lang].htmlLang;

  renderChrome();
  renderSystem(state.sys);

  $('lang').addEventListener('click', () => setLang(state.lang === 'ko' ? 'en' : 'ko'));
  window.addEventListener('hashchange', () => {
    const p = SYSTEMS.find((x) => x.id === location.hash.slice(1));
    if (p && p.id !== state.sys.id) select(p, false);
  });
}

boot();
