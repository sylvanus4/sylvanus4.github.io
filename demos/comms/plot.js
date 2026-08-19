// 조회표를 그대로 그린다.
//
// 이 페이지의 그림은 장식이 아니라 표의 다른 표현이다. 방문자가 고른 조합은
// 표에서 한 칸이고, 그 칸이 곡선 위 어디에 앉아 있는지를 보여주는 것이 요점이다.
// 그래서 여기서는 아무것도 모델링하지 않는다. runs 배열에 있는 점만 찍는다.

const PALETTE = ['#38BDF8', '#FBBF24', '#A78BFA', '#34D399', '#F87171', '#22D3EE'];

function css(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** 숫자 축 눈금. 사람이 읽는 자리에서 끊는다. */
function ticks(lo, hi, want = 5) {
  if (!(hi > lo)) return [lo];
  const raw = (hi - lo) / want;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || 10 * mag;
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(Number(v.toFixed(10)));
  return out;
}

function fmtNum(v) {
  const a = Math.abs(v);
  if (v === 0) return '0';
  if (a >= 10000) return (v / 1000).toFixed(0) + 'k';
  if (a >= 100) return v.toFixed(0);
  if (a >= 1) return String(Number(v.toFixed(2)));
  return String(Number(v.toFixed(3)));
}

export class Plot {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = null;
    this._ro = new ResizeObserver(() => this.draw());
    this._ro.observe(canvas);
  }

  /**
   * @param {object} data  로드된 조회표
   * @param {object} spec  {x, y, series?, y2?, logx?, logy?, ylabel}
   * @param {object} sel   현재 선택
   * @param {'ko'|'en'} lang
   */
  show(data, spec, sel, lang) {
    this.state = { data, spec, sel, lang };
    this.draw();
  }

  /** x 와 series 를 제외한 나머지 컨트롤은 현재 선택으로 고정한다. */
  _rows() {
    const { data, spec, sel } = this.state;
    const fixed = data.controls.map((c) => c.key).filter((k) => k !== spec.x && k !== spec.series);
    return data.runs.filter((r) => fixed.every((k) => String(r.in[k]) === String(sel[k])));
  }

  draw() {
    if (!this.state) return;
    const { data, spec, sel, lang } = this.state;
    const cv = this.c;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth || 600;
    const h = cv.clientHeight || 450;
    if (!w || !h) return;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    const g = this.ctx;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);

    const fg = css('--fg', '#eee');
    const fg3 = css('--fg-3', '#999');
    const line = css('--line-soft', '#333');
    const accent = css('--accent', PALETTE[0]);

    const rows = this._rows();
    if (!rows.length) return;

    const xCtl = data.controls.find((c) => c.key === spec.x);
    const sCtl = spec.series ? data.controls.find((c) => c.key === spec.series) : null;
    const xs = xCtl.options.map((o) => Number(o.value));
    const seriesVals = sCtl ? sCtl.options.map((o) => o.value) : [null];

    // 계열별 점 모으기
    const lines = [];
    seriesVals.forEach((sv, i) => {
      const pts = xs.map((xv) => {
        const r = rows.find((rr) => Number(rr.in[spec.x]) === xv && (!sCtl || String(rr.in[spec.series]) === String(sv)));
        return r ? { x: xv, y: Number(r.out[spec.y]) } : null;
      }).filter(Boolean);
      const label = sCtl ? sCtl.options[i].label[lang] : (spec.ylabel ? spec.ylabel[lang] : '');
      lines.push({ pts, label, color: PALETTE[i % PALETTE.length], key: sv, dash: false });
    });
    if (spec.y2) {
      const pts = xs.map((xv) => {
        const r = rows.find((rr) => Number(rr.in[spec.x]) === xv);
        return r ? { x: xv, y: Number(r.out[spec.y2]) } : null;
      }).filter(Boolean);
      lines.push({ pts, label: spec.y2label[lang], color: css('--fg-2', '#ccc'), key: '__y2', dash: true });
    }

    const allY = lines.flatMap((l) => l.pts.map((p) => p.y));
    const logy = !!spec.logy && allY.every((v) => v > 0);
    const logx = !!spec.logx && xs.every((v) => v > 0);
    const tx = (v) => (logx ? Math.log10(v) : v);
    const ty = (v) => (logy ? Math.log10(v) : v);

    let y0 = Math.min(...allY.map(ty));
    let y1 = Math.max(...allY.map(ty));
    if (!logy) { y0 = Math.min(y0, 0); }
    if (y1 === y0) y1 = y0 + 1;
    const pad = (y1 - y0) * 0.08;
    y0 -= pad; y1 += pad;
    const x0 = Math.min(...xs.map(tx));
    const x1 = Math.max(...xs.map(tx));

    // 범례를 먼저 재서 그만큼 위를 비운다. 안 그러면 맨 위 눈금 글자와 겹친다.
    g.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
    const L = 54, R = 14, B = 54;
    let legRows = 1, legX = L;
    for (const l of lines) {
      const tw = g.measureText(l.label || '').width + 30;
      if (legX + tw > w - R) { legX = L; legRows += 1; }
      legX += tw;
    }
    const T = 14 + legRows * 16;
    const pw = w - L - R, ph = h - T - B;
    const px = (v) => L + ((tx(v) - x0) / (x1 - x0 || 1)) * pw;
    const py = (v) => T + (1 - (ty(v) - y0) / (y1 - y0 || 1)) * ph;

    // 격자와 눈금
    g.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
    g.strokeStyle = line; g.lineWidth = 1;
    const yts = logy
      ? ticks(y0, y1, 4).map((e) => Math.pow(10, e))
      : ticks(y0, y1, 4);
    for (const t of yts) {
      const Y = Math.round(py(t)) + 0.5;
      if (Y < T - 1 || Y > T + ph + 1) continue;
      g.beginPath(); g.moveTo(L, Y); g.lineTo(L + pw, Y); g.stroke();
      g.fillStyle = fg3; g.textAlign = 'right'; g.textBaseline = 'middle';
      g.fillText(fmtNum(t), L - 8, Y);
    }
    const step = Math.ceil(xs.length / 8);
    xs.forEach((xv, i) => {
      if (i % step && i !== xs.length - 1) return;
      const X = Math.round(px(xv)) + 0.5;
      g.strokeStyle = line; g.beginPath(); g.moveTo(X, T); g.lineTo(X, T + ph); g.stroke();
      g.fillStyle = fg3; g.textAlign = 'center'; g.textBaseline = 'top';
      g.fillText(fmtNum(xv), X, T + ph + 8);
    });
    // 축 이름
    g.fillStyle = fg3; g.textAlign = 'center'; g.textBaseline = 'bottom';
    g.fillText(xCtl.label[lang], L + pw / 2, h - 6);

    // 기준선. 무작위 수준처럼 "이 아래면 의미가 없다" 는 값이 있을 때만 그린다.
    if (spec.ref && spec.ref.value >= (logy ? Math.pow(10, y0) : y0)) {
      const Y = Math.round(py(spec.ref.value)) + 0.5;
      g.strokeStyle = fg3; g.lineWidth = 1; g.setLineDash([2, 5]);
      g.beginPath(); g.moveTo(L, Y); g.lineTo(L + pw, Y); g.stroke();
      g.setLineDash([]);
      g.fillStyle = fg3; g.textAlign = 'left'; g.textBaseline = 'bottom';
      g.fillText(spec.ref.label[lang], L + 6, Y - 3);
    }

    // 선. 지금 고른 계열을 진하게 두고 나머지를 물린다 — 곡선 여섯 개가 겹쳐 있을 때
    // 어느 것을 고른 것인지 그림에서 읽히지 않으면 조작과 그림이 따로 논다.
    const curKey = sCtl ? String(sel[spec.series]) : null;
    for (const l of lines) {
      const on = !sCtl || l.key === '__y2' || String(l.key) === curKey;
      g.globalAlpha = on ? 1 : 0.34;
      g.strokeStyle = l.color; g.lineWidth = on ? 2.4 : 1.4;
      g.setLineDash(l.dash ? [5, 4] : []);
      g.beginPath();
      l.pts.forEach((p, i) => (i ? g.lineTo(px(p.x), py(p.y)) : g.moveTo(px(p.x), py(p.y))));
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = l.color;
      for (const p of l.pts) { g.beginPath(); g.arc(px(p.x), py(p.y), on ? 2.8 : 2, 0, 7); g.fill(); }
      g.globalAlpha = 1;
    }

    // 지금 고른 칸
    const curX = Number(sel[spec.x]);
    const curLine = lines.find((l) => (sCtl ? String(l.key) === String(sel[spec.series]) : l.key !== '__y2'));
    const cur = curLine && curLine.pts.find((p) => p.x === curX);
    if (spec.y2) {
      const l2 = lines.find((l) => l.key === '__y2');
      const p2 = l2 && l2.pts.find((p) => p.x === curX);
      if (p2) {
        g.beginPath(); g.arc(px(p2.x), py(p2.y), 5, 0, 7);
        g.strokeStyle = l2.color; g.lineWidth = 2; g.stroke();
        g.fillStyle = fg; g.textAlign = 'left'; g.textBaseline = 'top';
        g.fillText(fmtNum(p2.y), px(p2.x) + 10, py(p2.y) + 4);
      }
    }
    if (cur) {
      const X = px(cur.x), Y = py(cur.y);
      g.strokeStyle = accent; g.lineWidth = 1; g.setLineDash([3, 3]);
      g.beginPath(); g.moveTo(X, T); g.lineTo(X, T + ph); g.stroke();
      g.setLineDash([]);
      g.beginPath(); g.arc(X, Y, 6.5, 0, 7); g.fillStyle = accent; g.fill();
      g.beginPath(); g.arc(X, Y, 10, 0, 7); g.strokeStyle = accent; g.lineWidth = 1.5; g.stroke();
      g.fillStyle = fg; g.textAlign = X > L + pw * 0.7 ? 'right' : 'left'; g.textBaseline = 'bottom';
      g.fillText(fmtNum(cur.y), X + (X > L + pw * 0.7 ? -14 : 14), Y - 8);
    }

    // 범례
    let lx = L, ly = 8;
    g.textAlign = 'left'; g.textBaseline = 'top';
    for (const l of lines) {
      const t = l.label || '';
      const tw = g.measureText(t).width + 20;
      if (lx + tw > L + pw) { lx = L; ly += 16; }
      const on = !sCtl || l.key === '__y2' || String(l.key) === curKey;
      g.globalAlpha = on ? 1 : 0.45;
      g.fillStyle = l.color;
      g.fillRect(lx, ly + 5, 12, 2.5);
      g.fillStyle = on ? fg : fg3;
      g.fillText(t, lx + 16, ly);
      g.globalAlpha = 1;
      lx += tw + 10;
    }
  }
}
