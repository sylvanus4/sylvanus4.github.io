// The operable half of the page.
//
// Each project ships a lookup table produced by actually running that system
// across an enumerated input grid. The browser does not model anything: it
// looks up the combination the visitor selected and shows what the real run
// returned. That keeps the demo honest -- every number on screen came out of
// the system it claims to come from -- while still feeling live.

const $ = (id) => document.getElementById(id);

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/** Format a value without pretending to a precision it does not have. */
function fmt(v, lang) {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v[lang] ?? v.ko ?? v.en ?? '';
  // A raw `true` in a results row reads as a leaked debug value, not an answer.
  if (typeof v === 'boolean') return lang === 'ko' ? (v ? '예' : '아니오') : (v ? 'Yes' : 'No');
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return v.toLocaleString();
    return Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 1 ? v.toFixed(2) : v.toFixed(3);
  }
  return String(v);
}

/** Some systems answer with text. Show it as returned, but do not let one row
 *  of raw output take over the panel. */
const NOTE_CAP = 260;

export class DemoPanel {
  /**
   * @param {HTMLElement} root
   * @param {() => 'ko'|'en'} getLang
   */
  constructor(root, getLang) {
    this.root = root;
    this.lang = getLang;
    this.data = null;
    this.sel = {};
  }

  load(data) {
    this.data = data;
    this.sel = {};
    if (!data) { this.root.innerHTML = ''; return; }
    for (const c of data.controls) this.sel[c.key] = c.options[c.default_index || 0].value;
    this.render();
  }

  /** The run whose inputs match every current selection. */
  current() {
    const keys = this.data.controls.map((c) => c.key);
    return this.data.runs.find((r) => keys.every((k) => String(r.in[k]) === String(this.sel[k])));
  }

  render() {
    const L = this.lang();
    const d = this.data;
    if (!d) return;

    const controls = d.controls.map((c) => {
      const opts = c.options.map((o) => {
        const on = String(o.value) === String(this.sel[c.key]);
        return `<button type="button" role="radio" aria-checked="${on}" class="opt${on ? ' on' : ''}"
                 data-k="${esc(c.key)}" data-v="${esc(o.value)}">${esc(o.label[L])}</button>`;
      }).join('');
      return `<div class="ctl">
        <span class="ctl-l" id="ctl-${esc(c.key)}">${esc(c.label[L])}</span>
        <div class="opts" role="radiogroup" aria-labelledby="ctl-${esc(c.key)}">${opts}</div>
      </div>`;
    }).join('');

    const run = this.current();
    // A missing combination is a hole in the table, not something to paper over.
    const outs = run
      ? d.outputs.map((o) => {
          const v = run.out[o.key];
          const tag = run.tag && run.tag[o.key];
          return `<div class="oc">
            <span class="ok">${esc(o.label[L])}</span>
            <span class="ov">${esc(fmt(v, L))}${o.unit ? `<i>${esc(o.unit)}</i>` : ''}</span>
            ${tag ? `<span class="otag">${esc(tag[L] || tag)}</span>` : ''}
          </div>`;
        }).join('')
      : `<p class="hole">${L === 'ko' ? '이 조합은 표에 없습니다.' : 'That combination is not in the table.'}</p>`;

    let note = '';
    if (run && run.note) {
      const raw = run.note[L] || '';
      const cut = raw.length > NOTE_CAP ? raw.slice(0, NOTE_CAP).trimEnd() + '…' : raw;
      note = `<p class="dnote">${esc(cut)}</p>`;
    }
    // The full backend description is long and English-only, which reads as a
    // wall of text under a Korean panel. The claim stays here; the detail moves
    // one click away into the measurement record.
    const prov = d.provenance || {};
    const provLine = esc(prov.generated || '');

    this.root.innerHTML = `
      <div class="demo">
        <p class="dhow">${esc(d.howto[L])}</p>
        <div class="ctls">${controls}</div>
        <div class="outs">${outs}</div>
        ${note}
        <p class="dprov"><span>${L === 'ko' ? '이 표는 실제 실행 결과입니다' : 'This table is real output'}</span> ${provLine}</p>
      </div>`;

    this.root.querySelectorAll('.opt').forEach((b) => {
      b.addEventListener('click', () => {
        this.sel[b.dataset.k] = b.dataset.v;
        this.render();
      });
    });
  }
}
