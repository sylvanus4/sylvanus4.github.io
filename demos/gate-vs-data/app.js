/* 조회표 뷰어. 계산하지 않는다 — 미리 돌려 둔 결과를 찾아 보여줄 뿐이다.
   그래서 화면의 모든 숫자가 실제 실행에서 나온 값이고, 의존성이 0 이다. */

const isEn = new URLSearchParams(location.search).get("lang") === "en";
const t = (o) => (o == null ? "" : typeof o === "string" ? o : (isEn ? o.en ?? o.ko : o.ko));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function fmt(v, unit) {
  if (typeof v !== "number") return esc(String(v));
  const s = Number.isInteger(v) ? v.toLocaleString() : v.toFixed(3);
  return unit ? `${s} ${esc(unit)}` : s;
}

function render(root, d) {
  const sec = document.createElement("section");
  sec.innerHTML = `
    <h2>${esc(t(d.product).split(/[.。]\s/)[0])}</h2>
    <p>${esc(t(d.product))}</p>
    <p><strong>${esc(t(d.howto))}</strong></p>
    <div class="ctl"></div>
    <table><tbody></tbody></table>
    <div class="verdict"><p>${esc(t(d.verdict))}</p></div>
    <details><summary>${isEn ? "How it was measured" : "어떻게 쟀나"}</summary>
      <p>${esc(d.provenance?.backend ?? "")}</p>
      ${d.provenance?.command ? `<p><code>${esc(d.provenance.command)}</code></p>` : ""}
    </details>`;
  const ctl = sec.querySelector(".ctl");
  const tbody = sec.querySelector("tbody");

  const state = {};
  for (const c of d.controls) {
    const wrap = document.createElement("div");
    const id = `${d.id}-${c.key}`;
    wrap.innerHTML = `<label for="${id}">${esc(t(c.label))}</label>`;
    const sel = document.createElement("select");
    sel.id = id;
    c.options.forEach((o, i) => {
      const op = document.createElement("option");
      op.value = JSON.stringify(o.value);
      op.textContent = t(o.label);
      op.selected = i === (c.default_index ?? 0);
      sel.append(op);
    });
    state[c.key] = c.options[c.default_index ?? 0].value;
    sel.addEventListener("change", () => { state[c.key] = JSON.parse(sel.value); draw(); });
    wrap.append(sel);
    ctl.append(wrap);
  }

  function draw() {
    const hit = d.runs.find((r) => d.controls.every((c) => r.in[c.key] === state[c.key]));
    if (!hit) {
      // 조합이 비어 있으면 방문자에게는 고장으로 보인다. 조용히 빈칸을 두지 않는다.
      tbody.innerHTML = `<tr><td class="miss" colspan="2">${
        isEn ? "This combination was not run." : "이 조합은 돌리지 않았습니다."}</td></tr>`;
      return;
    }
    tbody.innerHTML = d.outputs.map((o) =>
      `<tr><th>${esc(t(o.label))}</th><td class="v">${fmt(hit.out[o.key], o.unit)}</td></tr>`).join("");
  }
  draw();
  root.append(sec);
}

export async function mount(files) {
  const root = document.getElementById("board");
  for (const f of files) {
    try {
      const d = await (await fetch(`data/${f}`)).json();
      render(root, d);
    } catch (e) {
      const p = document.createElement("p");
      p.className = "miss";
      p.textContent = `${f}: ${e}`;
      root.append(p);
    }
  }
}
