/* 플래그십 데모 전용 게이트. 실제 브라우저로 띄운다 (코드 읽기로 대체 금지).
   사용: node tools/qa-flagship.mjs [baseURL]   기본 http://127.0.0.1:4173

   여기 있는 검사는 전부 이 페이지를 만들며 실제로 한 번씩 틀렸던 것들이다.
   개수만 세는 검사는 레이아웃 붕괴를 못 잡으므로 폭별 오버플로·터치타깃·대비를
   같이 잰다. */

import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] || "http://127.0.0.1:4173";
const URL_KO = `${BASE}/demos/flagship/`;
const OUT = "tools/qa-shots";
mkdirSync(OUT, { recursive: true });

const fails = [];
const ok = (m) => console.log("  ✓ " + m);
const bad = (m) => { fails.push(m); console.log("  ✗ " + m); };

const browser = await chromium.launch();

/* 대비: 알파 합성까지 감안해 실제로 칠해지는 색을 뒤에서부터 합성한다.
   투명 패널 위 글자는 선언값만 보면 통과하고 화면에서는 안 보인다. */
const CONTRAST = `(() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  // 계산된 색은 oklch 문자열로 나온다. 정규식으로 숫자를 뽑으면 전부 오탐이므로
  // 캔버스에 한 번 칠해서 실제 sRGB 바이트를 받는다.
  const rgba = (c) => { cx.clearRect(0,0,1,1); cx.fillStyle = c; cx.fillRect(0,0,1,1);
    const d = cx.getImageData(0,0,1,1).data; return [d[0],d[1],d[2],d[3]/255]; };
  const over = (f,b) => f.slice(0,3).map((v,i)=>v*f[3]+b[i]*(1-f[3]));
  const lum = (a) => { const [r,g,b]=a.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});
    return 0.2126*r+0.7152*g+0.0722*b; };
  const bgOf = (e) => { const layers=[]; let n=e;
    while (n && n !== document.documentElement) { const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) { layers.push(c); if (c[3] >= 0.999) break; } n = n.parentElement; }
    const root = rgba(getComputedStyle(document.documentElement).backgroundColor);
    let base = root[3] >= 0.999 ? root.slice(0,3) : [13,17,25];
    for (let i = layers.length-1; i >= 0; i--) base = over(layers[i], base);
    return base; };
  const out = [], seen = new Set();
  [...document.querySelectorAll('p,li,span,dd,dt,h1,h2,h3,a,b,button')]
    .filter((e) => e.textContent.trim() && e.getClientRects().length && !e.children.length)
    .forEach((e) => {
      const s = getComputedStyle(e);
      if (s.color === 'rgba(0, 0, 0, 0)') return;
      const bg = bgOf(e);
      const l1 = lum(over(rgba(s.color), bg)), l2 = lum(bg);
      const ratio = (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
      const px = parseFloat(s.fontSize);
      const need = (px >= 24 || (px >= 18.66 && +s.fontWeight >= 700)) ? 3 : 4.5;
      const key = (e.className || e.tagName) + '|' + need;
      if (ratio < need && !seen.has(key)) { seen.add(key);
        out.push({ cls: e.className || e.tagName, r: +ratio.toFixed(2), need, txt: e.textContent.trim().slice(0,18) }); }
    });
  return out;
})()`;

async function page(ctxOpts = {}) {
  const ctx = await browser.newContext(ctxOpts);
  const p = await ctx.newPage();
  const errors = [];
  p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  p.on("pageerror", (e) => errors.push(String(e)));
  return { ctx, p, errors };
}

/* ---------- 1. 국문 기본 화면 ---------- */
console.log("\n[flagship · 국문 데스크탑]");
{
  const { ctx, p, errors } = await page({ viewport: { width: 1440, height: 960 } });
  await p.goto(URL_KO, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);

  const tabs = await p.$$eval(".tab", (els) => els.map((e) => e.textContent.trim()));
  tabs.length === 10 ? ok(`탭 ${tabs.length}개`) : bad(`탭 ${tabs.length}개 (기대 10)`);

  // WebGL 컨텍스트가 실제로 살아 있나. canvas 존재만으로는 그림이 있다는 뜻이 아니다.
  const gl = await p.evaluate(() => {
    const c = document.getElementById("gl");
    if (!c) return { present: false };
    const ctx = c.getContext("webgl2");
    return { present: true, w: c.width, h: c.height, lost: ctx ? ctx.isContextLost() : true };
  });
  gl.present && gl.w > 0 && !gl.lost
    ? ok(`WebGL2 살아 있음 (${gl.w}x${gl.h})`)
    : bad(`WebGL2 이상: ${JSON.stringify(gl)}`);

  // 그림이 실제로 칠해졌나. 검은 캔버스는 위 검사를 통과한다.
  // preserveDrawingBuffer 없이 readPixels 하면 합성 뒤라 항상 0 이므로 2D 로 옮겨 읽는다.
  const ink = await p.evaluate(() => {
    const c = document.getElementById("gl");
    const cv = document.createElement("canvas");
    cv.width = Math.min(320, c.width); cv.height = Math.min(180, c.height);
    const cx = cv.getContext("2d", { willReadFrequently: true });
    cx.drawImage(c, 0, 0, cv.width, cv.height);
    const d = cx.getImageData(0, 0, cv.width, cv.height).data;
    let lit = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] + d[i+1] + d[i+2] > 90 && d[i+3] > 20) lit++;
    return lit / (cv.width * cv.height);
  }).catch(() => -1);
  ink > 0.0005 ? ok(`씬 픽셀 ${(ink * 100).toFixed(2)}%`) : bad(`씬이 비었다 (lit ${ink})`);

  // 제품 설명과 조작 패널이 있어야 데모다. 측정 결과만 있으면 실험 노트다.
  await p.waitForSelector('.demo .opt', { timeout: 8000 });
  const first = await p.evaluate(() => ({
    product: (document.getElementById('product').textContent || '').trim().length,
    ctls: document.querySelectorAll('.demo .ctl').length,
    outs: document.querySelectorAll('.demo .oc').length,
  }));
  first.product > 30 ? ok(`제품 설명 ${first.product}자`) : bad(`제품 설명이 없거나 짧다 (${first.product}자)`);
  first.ctls >= 1 && first.outs >= 2
    ? ok(`조작 ${first.ctls}축 · 결과 ${first.outs}개`)
    : bad(`조작 패널 빈약: 축 ${first.ctls} / 결과 ${first.outs}`);

  // 전 프로젝트 순회: 각 시스템이 제품 설명 + 조작 가능한 표를 갖는가,
  // 그리고 조작하면 결과가 실제로 바뀌는가(바뀌지 않으면 조회표가 아니라 그림이다).
  const seen = new Set(); let noChange = [], noTable = [], thin = [];
  for (const name of tabs) {
    await p.click(`.tab:has-text("${name}")`);
    await p.waitForTimeout(160);
    const has = await p.waitForSelector('.demo .opt', { timeout: 8000 }).catch(() => null);
    if (!has) { noTable.push(name); continue; }
    const r = await p.evaluate(() => ({
      h2: document.getElementById('proj-name').textContent.trim(),
      product: (document.getElementById('product').textContent || '').trim().length,
      verdict: (document.getElementById('verdict').textContent || '').trim().length,
      legend: document.getElementById('legend').textContent.trim().length,
      prov: (document.querySelector('.dprov')?.textContent || '').trim().length,
      record: (document.getElementById('prov')?.textContent || '').trim().length,
      hash: location.hash,
    }));
    seen.add(r.h2);
    if (r.product < 30 || r.verdict < 20) thin.push(`${name}(설명 ${r.product}/판정 ${r.verdict})`);
    if (r.prov < 10) thin.push(`${name}(출처 없음)`);
    // 재현 경로는 접혀 있어도 존재해야 한다. 접었다고 사라지면 근거 없는 표가 된다.
    if (r.record < 40) thin.push(`${name}(재현 기록 없음)`);
    if (r.legend < 20) thin.push(`${name}(범례 없음)`);
    if (!r.hash) bad(`${name}: 해시 딥링크 없음`);

    // 두 번째 선택지를 눌러 결과가 바뀌는지 본다.
    const changed = await p.evaluate(() => {
      const read = () => [...document.querySelectorAll('.demo .ov')].map((e) => e.textContent).join('|');
      const before = read();
      const offs = [...document.querySelectorAll('.demo .opt')].filter((b) => !b.classList.contains('on'));
      if (!offs.length) return null;
      // 옵션 하나가 결과를 안 바꾸는 것은 정상일 수 있다(같은 넷리스트로 합성되는 두
      // 구조처럼). 표가 죽은 것은 어떤 옵션을 눌러도 안 바뀔 때다.
      for (const o of offs) {
        o.click();
        if (read() !== before) return true;
      }
      return false;
    });
    if (changed === null || changed === false) noChange.push(name);
  }
  seen.size === 10 ? ok("탭 10개 모두 다른 제품") : bad(`제품 ${seen.size}종 (기대 10)`);
  noTable.length === 0 ? ok("조작표 10개 전부 로드") : bad(`조작표 없음: ${noTable.join(", ")}`);
  noChange.length === 0 ? ok("조작하면 결과가 바뀐다 (10/10)") : bad(`조작해도 결과가 그대로: ${noChange.join(", ")}`);
  thin.length === 0 ? ok("설명·판정·출처·범례 전부 있음") : bad(`빈약: ${thin.slice(0, 4).join(" / ")}`);

  // 실험 노트 프레이밍이 남아 있지 않은지
  const scratch = await p.evaluate(() => document.body.innerText.includes('아직 답하지 못한'));
  scratch ? bad("공개면에 미해결 목록이 남아 있다") : ok("미해결 목록 없음");

  // 딥링크 복원
  await p.goto(`${URL_KO}#helios`, { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const deep = await p.textContent("#proj-name");
  deep.trim() === "Helios" ? ok("해시 딥링크 복원") : bad(`해시 딥링크 실패 (${deep})`);

  const low = await p.evaluate(CONTRAST);
  low.length === 0 ? ok("본문 대비 4.5:1 통과") : bad(`대비 미달 ${low.length}건: ${JSON.stringify(low.slice(0, 3))}`);

  // heading 계층: h1 하나, 건너뜀 없음
  const heads = await p.$$eval("h1,h2,h3,h4", (els) => els.map((e) => +e.tagName[1]));
  const h1n = heads.filter((h) => h === 1).length;
  h1n === 1 ? ok("h1 유일") : bad(`h1 ${h1n}개`);
  let skip = null;
  for (let i = 1; i < heads.length; i++) if (heads[i] - heads[i - 1] > 1) skip = `h${heads[i-1]}→h${heads[i]}`;
  skip ? bad(`heading 단계 건너뜀 ${skip}`) : ok("heading 계층 연속");

  // 스킵 링크가 첫 Tab 정지점인가.
  // 앞의 클릭들이 포커스를 남기므로 새로 연 문서에서 재야 한다.
  await p.goto(URL_KO, { waitUntil: "networkidle" });
  await p.waitForTimeout(300);
  await p.keyboard.press("Tab");
  const firstStop = await p.evaluate(() => document.activeElement.className);
  firstStop.includes("skip") ? ok("스킵 링크가 첫 Tab 정지점") : bad(`첫 Tab이 스킵 링크가 아님 (${firstStop})`);

  // 포커스 표시가 실제로 그려지나
  const focusRing = await p.evaluate(() => {
    const b = document.querySelector(".tab");
    b.focus();
    const s = getComputedStyle(b);
    return { w: s.outlineWidth, style: s.outlineStyle };
  });
  parseFloat(focusRing.w) >= 2 && focusRing.style !== "none"
    ? ok(`포커스 링 ${focusRing.w}`) : bad(`포커스 링 없음 ${JSON.stringify(focusRing)}`);

  errors.length ? bad(`콘솔 에러: ${errors.slice(0, 2).join(" | ")}`) : ok("콘솔 에러 0");
  await p.screenshot({ path: `${OUT}/flagship-desktop.png`, fullPage: false });
  await ctx.close();
}

/* ---------- 2. 폭별 오버플로 + 터치 타깃 ---------- */
console.log("\n[flagship · 폭별]");
for (const w of [320, 360, 390, 768, 1024, 1280, 1440]) {
  const { ctx, p } = await page({ viewport: { width: w, height: 900 }, hasTouch: w < 800 });
  await p.goto(URL_KO, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  over <= 0 ? ok(`${w}px 가로 오버플로 0`) : bad(`${w}px 가로 오버플로 ${over}px`);

  const small = await p.$$eval("button, a", (els) => els
    .filter((e) => e.offsetParent !== null)
    .map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 18), w: Math.round(r.width), h: Math.round(r.height) }; })
    .filter((r) => r.h < 44 && r.h > 0));
  small.length === 0 ? ok(`${w}px 터치 타깃 44px 충족`) : bad(`${w}px 44px 미달 ${JSON.stringify(small.slice(0, 3))}`);
  if (w === 390) await p.screenshot({ path: `${OUT}/flagship-mobile.png`, fullPage: false });
  await ctx.close();
}

/* ---------- 3. 영문 화면 ---------- */
console.log("\n[flagship · 영문]");
{
  const { ctx, p, errors } = await page({ viewport: { width: 1280, height: 900 } });
  await p.goto(`${URL_KO}?lang=en`, { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  const lang = await p.getAttribute("html", "lang");
  lang === "en" ? ok("html lang=en") : bad(`html lang=${lang}`);

  // 영문 화면에 국문이 남아 있으면 번역 누락이다. 전 탭을 돌면서 본다.
  const names = await p.$$eval(".tab", (e) => e.map((x) => x.textContent.trim()));
  let residue = [];
  for (const n of names) {
    await p.click(`.tab:has-text("${n}")`);
    await p.waitForTimeout(90);
    const r = await p.evaluate(() => {
      const kr = /[가-힣]/;
      const hits = [];
      for (const id of ["title", "lede", "domain", "backend", "headline", "finding", "legend", "open-h", "note", "foot"]) {
        const t = document.getElementById(id)?.textContent || "";
        if (kr.test(t)) hits.push(id);
      }
      document.querySelectorAll("#open li, .stat").forEach((el) => { if (kr.test(el.textContent)) hits.push(el.className || "stat"); });
      return hits;
    });
    if (r.length) residue.push(`${n}:${r.join(",")}`);
  }
  residue.length === 0 ? ok("영문 화면 국문 잔류 0") : bad(`영문 국문 잔류: ${residue.slice(0, 3).join(" | ")}`);

  // 토글 왕복
  await p.click("#lang");
  await p.waitForTimeout(250);
  const back = await p.getAttribute("html", "lang");
  back === "ko" ? ok("언어 토글 왕복") : bad(`토글 후 lang=${back}`);

  errors.length ? bad(`영문 콘솔 에러: ${errors.slice(0, 2).join(" | ")}`) : ok("영문 콘솔 에러 0");
  await ctx.close();
}

/* ---------- 4. 감축 모션 + WebGL 없는 환경 ---------- */
console.log("\n[flagship · 감축 모션 / WebGL 부재]");
{
  const { ctx, p } = await page({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  await p.goto(URL_KO, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const dur = await p.evaluate(() => getComputedStyle(document.querySelector(".tab")).transitionDuration);
  parseFloat(dur) <= 0.02 ? ok(`감축 모션에서 전환 ${dur}`) : bad(`감축 모션인데 전환 ${dur}`);
  await ctx.close();
}
{
  // WebGL2 를 막고도 본문이 읽히나. 그림이 못 뜨면 페이지가 죽는 설계는 아니어야 한다.
  const { ctx, p, errors } = await page({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, ...a) {
      if (String(t).startsWith("webgl")) return null;
      return orig.call(this, t, ...a);
    };
  });
  await p.goto(URL_KO, { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  await p.waitForSelector(".demo .opt", { timeout: 8000 }).catch(() => null);
  const r = await p.evaluate(() => ({
    product: (document.getElementById("product").textContent || "").length,
    opts: document.querySelectorAll(".demo .opt").length,
    outs: document.querySelectorAll(".demo .oc").length,
    legend: (document.getElementById("legend").textContent || "").length,
  }));
  r.product > 30 && r.opts >= 2 && r.outs >= 2 && r.legend > 20
    ? ok("WebGL 없어도 제품 설명과 조작표 유지")
    : bad(`WebGL 부재 폴백 실패 ${JSON.stringify(r)}`);
  errors.length ? bad(`폴백 콘솔 에러: ${errors[0]}`) : ok("폴백 콘솔 에러 0");
  await ctx.close();
}

/* ---------- 5. 공개 안전 ---------- */
// 사내 식별자 누출 검사는 여기 없다. 검사 자체가 무엇을 찾는지 적어야 하는데, 그 목록이
// 곧 사내 호스트·네임스페이스 명명 규칙이라 공개 저장소에 두면 검사가 누출이 된다.
// 그래서 그 스캔은 비공개 저장소가 소유한다:
//   ai-platform-strategy/scripts/skills/public_surface_scan.py
console.log("\n[flagship · 공개 안전]");
console.log("  · 사내 식별자 스캔은 비공개 저장소가 소유한다 (public_surface_scan.py)");

await browser.close();
console.log("");
if (fails.length) { console.log(`FAIL ${fails.length}건`); process.exit(1); }
console.log("PASS — flagship 게이트 통과");
