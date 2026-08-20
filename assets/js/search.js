/* 사이트 전역 검색.

   인덱스는 tools/build_search_index.py 가 원천 데이터에서 구워 assets/search-index.json
   으로 싣는다(Pagefind 와 같은 모양 — 빌드타임 인덱스, 정적 파일, 클라이언트는 조회만).
   Pagefind 자체를 못 쓰는 이유는 그 생성기 주석에 적어 두었다: 이 사이트는 네 페이지가
   빈 껍데기이고 본문을 자바스크립트가 그리는데, Pagefind 는 JS 를 실행하지 않는다.

   한국어를 어떻게 다루나
   ---------------------
   1) compact — 소문자화 + 공백·구두점 제거. 조사와 띄어쓰기 흔들림을 substring 이 흡수한다.
      "양자화" 가 "양자화를" 에 걸리고, "moe 전문가" 가 "MoE 전문가" 에 걸린다.
   2) 초성 — 한글 음절에서 초성만 뽑아 따로 들고 있어 "ㅇㅈㅎ" 로도 양자화가 나온다.
      질의가 초성만으로 이뤄졌을 때만 이 축을 본다(그러지 않으면 "ㄱ" 이 전부에 걸린다).
   3) 토큰 AND — 공백으로 나눈 모든 토큰이 어딘가에는 맞아야 한다.
   영문은 같은 compact 축이 접두·부분 일치를 함께 처리하므로 별도 스테밍이 필요 없다.

   인덱스는 **처음 검색을 열 때** 받는다. 페이지 첫 로드에 96KB 를 얹지 않는다. */

import { isEn, t } from "./i18n.js";

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
const KIND_ORDER = ["catalog", "demo", "case", "reel", "layer", "career", "resume"];
const KIND_LABEL = {
  catalog: ["카탈로그", "Catalog"], demo: ["데모", "Demos"], case: ["작업", "Work"],
  reel: ["영상", "Reels"], layer: ["스택", "Stack"], career: ["이력", "Career"],
  resume: ["이력서", "Resume"],
};

const compact = (s) => (s || "").toLowerCase().replace(/[^0-9a-z가-힣ㄱ-ㅎ]+/g, "");
const isChoOnly = (s) => s.length > 0 && /^[ㄱ-ㅎ]+$/.test(s);

function choseong(s) {
  let out = "";
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    if (c >= 0xac00 && c <= 0xd7a3) out += CHO[Math.floor((c - 0xac00) / 588)];
    else out += ch;
  }
  return out;
}

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let DOCS = null;      // 정규화까지 끝난 문서
let loading = null;

async function loadIndex() {
  if (DOCS) return DOCS;
  if (loading) return loading;
  loading = fetch("assets/search-index.json")
    .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then((raw) => {
      DOCS = raw.docs.map((d) => {
        const title = d.t || "";
        const titleEn = d.te || title;
        const ko = compact(`${title} ${d.b || ""} ${d.s || ""}`);
        const en = compact(`${titleEn} ${d.be || d.b || ""} ${d.s || ""}`);
        return {
          ...d, te: titleEn,
          _t: compact(title), _te: compact(titleEn),
          _ko: ko, _en: en,
          /* 초성은 제목과 태그에서만 본다. 본문까지 넣으면 "ㄷㅁ" 같은 두 글자가
             거의 모든 문서에 걸려 검색이 아니라 목록이 된다(실측 40/298).
             제목과 태그를 나눠 두는 것은 순위 때문이다 — 제목이 ㅇㅈㅎ 인 문서가
             태그에만 그게 있는 문서보다 위로 와야 한다. */
          _choT: choseong(compact(title)),
          _choG: choseong(compact((d.g || []).join(" "))),
        };
      });
      return DOCS;
    });
  return loading;
}

/* 토큰 하나가 문서에 맞는지. 맞으면 가중치를 돌려준다(제목 > 태그 > 본문). */
/* 조사를 붙여 친 질의를 구제한다.

   compact substring 은 "양자화" → "양자화를" 방향은 그냥 걸리지만 반대는 안 걸린다.
   한국어 검색창에는 조사를 붙여 치는 사람이 실제로 있으므로, 그 토큰이 아무 문서에도
   안 맞을 때만 꼬리를 떼고 한 번 더 본다. 처음부터 떼지 않는 이유는 "도구"·"의사"
   처럼 조사처럼 끝나는 멀쩡한 단어를 잘라 먹기 때문이다. */
const JOSA = ["에서는","으로는","에게서","이라도","에서","으로","에게","한테","까지","부터",
              "보다","처럼","이나","라도","은","는","이","가","을","를","의","에","와","과",
              "도","만","로","께"];

function relax(tok) {
  for (const j of JOSA) {
    if (tok.length > j.length + 1 && tok.endsWith(j)) return tok.slice(0, -j.length);
  }
  return null;
}

function hitOne(doc, tok) {
  if (isChoOnly(tok)) {
    if (doc._choT.startsWith(tok)) return 12;
    if (doc._choT.includes(tok)) return 8;
    return doc._choG.includes(tok) ? 4 : 0;
  }
  if (doc._t.includes(tok) || doc._te.includes(tok)) {
    return doc._t.startsWith(tok) || doc._te.startsWith(tok) ? 12 : 8;
  }
  if (doc.g && doc.g.some((g) => compact(g).includes(tok))) return 4;
  if (doc._ko.includes(tok) || doc._en.includes(tok)) return 1;
  return 0;
}

/* 원형과 조사를 뗀 형태 중 **잘 맞는 쪽**을 쓴다. 앞서 "조사를 뗀 형태는 원형이
   0건일 때만" 으로 뒀더니 "양자화를" 이 그 표현을 그대로 쓴 문서 2건에만 걸리고
   정작 "양자화" 10건을 놓쳤다. OR 이 맞다. */
function hit(doc, tok) {
  const a = hitOne(doc, tok);
  const r = relax(tok);
  return r ? Math.max(a, hitOne(doc, r)) : a;
}

export function search(query, limit = 40) {
  if (!DOCS) return [];
  const toks = compact(query).length ? query.trim().toLowerCase().split(/\s+/).map(compact).filter(Boolean) : [];
  if (!toks.length) return [];
  const out = [];
  for (const d of DOCS) {
    let score = 0;
    for (const tok of toks) {
      const s = hit(d, tok);
      if (!s) { score = 0; break; }
      score += s;
    }
    if (score) out.push({ d, score });
  }
  out.sort((a, b) =>
    b.score - a.score ||
    KIND_ORDER.indexOf(a.d.k) - KIND_ORDER.indexOf(b.d.k) ||
    a.d.t.length - b.d.t.length);
  return out.slice(0, limit);
}

/* ── UI ──────────────────────────────────────────────────────────────────── */

export function wireSiteSearch() {
  const trigger = document.getElementById("searchopen");
  if (!trigger) return;

  const dlg = document.createElement("div");
  dlg.className = "srch";
  dlg.hidden = true;
  dlg.innerHTML = `
    <div class="srch__scrim" data-close></div>
    <div class="srch__panel" role="dialog" aria-modal="true"
         aria-label="${esc(t("search.aria") || "사이트 검색")}">
      <div class="srch__bar">
        <input class="srch__input" type="search" autocomplete="off" spellcheck="false"
               placeholder="${esc(t("search.ph") || "검색")}"
               aria-label="${esc(t("search.aria") || "사이트 검색")}"
               aria-controls="srchres" aria-describedby="srchhint">
        <button class="srch__x" type="button" data-close
                aria-label="${esc(t("search.close") || "검색 닫기")}">✕</button>
      </div>
      <p class="srch__hint" id="srchhint">${esc(t("search.hint") || "초성으로도 찾습니다. 예: ㅇㅈㅎ")}</p>
      <div class="srch__res" id="srchres" role="listbox" aria-live="polite"></div>
    </div>`;
  document.body.appendChild(dlg);

  const input = dlg.querySelector(".srch__input");
  const res = dlg.querySelector(".srch__res");
  let cursor = -1, rows = [], opener = null;

  const setOpen = (open) => {
    dlg.hidden = !open;
    /* aria-expanded 를 쓰지 않는다 — 이건 디스클로저가 아니라 모달 오프너다.
       상태는 다이얼로그의 존재와 포커스가 알린다. */
    document.documentElement.classList.toggle("srch-on", open);
    if (open) {
      opener = document.activeElement;
      loadIndex().then(() => { if (input.value.trim()) run(); }).catch(() => {
        res.innerHTML = `<p class="srch__empty">${esc(t("search.failed") || "검색 인덱스를 불러오지 못했습니다")}</p>`;
      });
      input.focus();
      input.select();
    } else {
      (opener && opener.focus) ? opener.focus() : trigger.focus();
    }
  };

  function run() {
    const q = input.value.trim();
    if (!q) { res.innerHTML = ""; rows = []; cursor = -1; return; }
    if (!DOCS) { res.innerHTML = `<p class="srch__empty">…</p>`; return; }
    const found = search(q);
    rows = found;
    cursor = found.length ? 0 : -1;
    if (!found.length) {
      res.innerHTML = `<p class="srch__empty">${esc(t("search.none") || "결과가 없습니다")} — ${esc(q)}</p>`;
      return;
    }
    const groups = new Map();
    for (const f of found) {
      if (!groups.has(f.d.k)) groups.set(f.d.k, []);
      groups.get(f.d.k).push(f);
    }
    let i = 0, html = `<p class="srch__count">${found.length}${esc(t("search.countSuffix") || "건")}</p>`;
    for (const k of KIND_ORDER) {
      const g = groups.get(k);
      if (!g) continue;
      html += `<p class="srch__k">${esc(KIND_LABEL[k][isEn ? 1 : 0])}</p>`;
      for (const { d } of g) {
        const title = isEn ? d.te : d.t;
        const body = (isEn ? (d.be || d.b) : d.b) || "";
        html += `<a class="srch__row" role="option" aria-selected="false" data-i="${i}" href="${esc(d.u)}">
          <span class="srch__rt">${esc(title)}</span>
          <span class="srch__rb">${esc(body.slice(0, 110))}</span></a>`;
        i++;
      }
    }
    res.innerHTML = html;
    paint();
  }

  const paint = () => {
    const els = [...res.querySelectorAll(".srch__row")];
    els.forEach((el, i) => {
      const on = i === cursor;
      el.classList.toggle("on", on);
      el.setAttribute("aria-selected", String(on));
      if (on) el.scrollIntoView({ block: "nearest" });
    });
  };

  const move = (delta) => {
    const n = res.querySelectorAll(".srch__row").length;
    if (!n) return;
    cursor = (cursor + delta + n) % n;
    paint();
  };

  trigger.addEventListener("click", () => setOpen(dlg.hidden));
  dlg.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) setOpen(false); });
  input.addEventListener("input", run);

  dlg.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    else if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") {
      const el = res.querySelector(".srch__row.on");
      if (el) { e.preventDefault(); location.href = el.getAttribute("href"); }
    } else if (e.key === "Tab") {
      /* 패널 밖으로 포커스가 새면 뒤의 페이지를 탭으로 훑게 된다. 가둔다. */
      const f = [...dlg.querySelectorAll("input,button,a[href]")].filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "");
    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing && dlg.hidden)) {
      e.preventDefault();
      setOpen(true);
    }
  });

  /* 마우스를 올리기 전에 미리 받아 두면 첫 검색이 즉시 뜬다. 실패해도 조용히 넘어간다. */
  trigger.addEventListener("pointerenter", () => loadIndex().catch(() => {}), { once: true });
}
