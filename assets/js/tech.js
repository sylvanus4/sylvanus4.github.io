/* 기술 카탈로그 페이지. 본문은 tools/port_tech.py 가 만든 조각을 그대로 주입한다.
   여기서 하는 일은 검색 필터와 카운트뿐이다. */

const board = document.getElementById("techboard");

async function load() {
  try {
    const res = await fetch("assets/tech-body.html");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    board.innerHTML = await res.text();
  } catch (e) {
    board.innerHTML = `<p class="muted">카탈로그를 불러오지 못했습니다.
      <a href="https://2icorp.github.io/tech.html" target="_blank" rel="noopener" style="color:var(--cy)">원본 목록 보기</a></p>`;
    return;
  }
  wireSearch();
  wireCount();
}

function wireCount() {
  const n = board.querySelectorAll("a.pcard").length;
  const el = document.getElementById("techtotal");
  if (el) el.textContent = n.toLocaleString("ko-KR");
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
    out.textContent = q ? `${shown}개 일치` : "";
  };

  let t;
  input.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(apply, 120);
  });
  input.addEventListener("search", apply);
}

load();
