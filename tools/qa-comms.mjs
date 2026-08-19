/* 통신 데모 전용 게이트. 실제 브라우저로 띄운다 (코드 읽기로 대체 금지).
   사용: node tools/qa-comms.mjs [baseURL]   기본 http://127.0.0.1:4173

   플래그십 게이트와 형제지만 검사 축이 다르다. 여기 그림은 WebGL 씬이 아니라
   조회표를 그린 2D 차트라, "캔버스가 있다" 가 아니라 "표에 있는 점이 실제로
   찍혔고 조작하면 그 점이 움직인다" 를 봐야 한다. */

import { chromium, devices } from "playwright";
import { readdirSync, readFileSync, mkdirSync } from "node:fs";

const BASE = process.argv[2] || "http://127.0.0.1:4173";
const URL_KO = `${BASE}/demos/comms/`;
const OUT = "tools/qa-shots";
mkdirSync(OUT, { recursive: true });

const DATA = readdirSync("demos/comms/data").filter((f) => f.endsWith(".json"));
const N = DATA.length;

const fails = [];
const ok = (m) => console.log("  ✓ " + m);
const bad = (m) => { fails.push(m); console.log("  ✗ " + m); };

const browser = await chromium.launch();

const CONTRAST = `(() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const rgba = (c) => { cx.clearRect(0,0,1,1); cx.fillStyle = c; cx.fillRect(0,0,1,1);
    const d = cx.getImageData(0,0,1,1).data; return [d[0],d[1],d[2],d[3]/255]; };
  const over = (f, b) => f.slice(0,3).map((v,i) => v*f[3] + b[i]*(1-f[3]));
  const lum = (c) => { const s = c.map(v => { v/=255; return v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055, 2.4); });
    return .2126*s[0] + .7152*s[1] + .0722*s[2]; };
  const bgOf = (el) => { let n = el, acc = [0,0,0,0];
    while (n && n !== document.documentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) { acc = acc[3] ? [...over(acc, c), Math.min(1, acc[3] + c[3])] : c; if (acc[3] >= .999) break; }
      n = n.parentElement; }
    return acc[3] >= .999 ? acc.slice(0,3) : over(acc, rgba(getComputedStyle(document.documentElement).backgroundColor)); };
  const out = [];
  document.querySelectorAll('p, li, dd, dt, h1, h2, h3, span, button, summary, code').forEach((el) => {
    const t = (el.textContent || '').trim();
    if (!t || el.children.length) return;
    const st = getComputedStyle(el);
    if (st.visibility === 'hidden' || st.display === 'none') return;
    const size = parseFloat(st.fontSize), bold = parseInt(st.fontWeight, 10) >= 700;
    const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
    const f = rgba(st.color), b = bgOf(el);
    const c = over(f, b);
    const L1 = lum(c), L2 = lum(b);
    const ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
    if (ratio < need) out.push({ t: t.slice(0, 26), ratio: +ratio.toFixed(2), need });
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

/* 캔버스에 실제로 뭔가 칠해졌나. 배경만 칠한 캔버스는 "존재" 검사를 통과한다. */
const INK = `(() => {
  const c = document.getElementById('plot');
  if (!c || !c.width) return -1;
  const cv = document.createElement('canvas');
  cv.width = Math.min(360, c.width); cv.height = Math.min(240, c.height);
  const cx = cv.getContext('2d', { willReadFrequently: true });
  cx.drawImage(c, 0, 0, cv.width, cv.height);
  const d = cx.getImageData(0, 0, cv.width, cv.height).data;
  let lit = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i] + d[i+1] + d[i+2] > 150 && d[i+3] > 20) lit++;
  return lit / (cv.width * cv.height);
})()`;

/* ---------- 1. 국문 데스크탑 ---------- */
console.log("\n[comms · 국문 데스크탑]");
{
  const { ctx, p, errors } = await page({ viewport: { width: 1440, height: 960 } });
  await p.goto(URL_KO, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);

  const tabs = await p.$$eval(".tab", (els) => els.map((e) => e.textContent.trim()));
  tabs.length === N ? ok(`탭 ${tabs.length}개`) : bad(`탭 ${tabs.length}개 (조회표 ${N}개와 불일치)`);

  await p.waitForSelector(".demo .opt", { timeout: 8000 });
  const seen = new Set(); const noTable = [], noChange = [], thin = [], blank = [], stuck = [];
  for (const name of tabs) {
    await p.click(`.tab:has-text("${name}")`);
    await p.waitForTimeout(320);
    const has = await p.waitForSelector(".demo .opt", { timeout: 8000 }).catch(() => null);
    if (!has) { noTable.push(name); continue; }
    const r = await p.evaluate(() => ({
      h2: document.getElementById("proj-name").textContent.trim(),
      product: (document.getElementById("product").textContent || "").trim().length,
      verdict: (document.getElementById("verdict").textContent || "").trim().length,
      legend: document.getElementById("legend").textContent.trim().length,
      prov: (document.querySelector(".dprov")?.textContent || "").trim().length,
      record: (document.getElementById("prov")?.textContent || "").trim().length,
      alt: document.getElementById("plot")?.getAttribute("aria-label")?.length || 0,
      hash: location.hash,
    }));
    seen.add(r.h2);
    if (r.product < 30 || r.verdict < 20) thin.push(`${name}(설명 ${r.product}/판정 ${r.verdict})`);
    if (r.prov < 10) thin.push(`${name}(출처 없음)`);
    if (r.record < 40) thin.push(`${name}(재현 기록 없음)`);
    if (r.legend < 20) thin.push(`${name}(범례 없음)`);
    if (r.alt < 20) thin.push(`${name}(그림 대체 텍스트 없음)`);
    if (!r.hash) bad(`${name}: 해시 딥링크 없음`);

    const ink = await p.evaluate(INK);
    if (!(ink > 0.002)) blank.push(`${name}(${ink})`);

    // 조작하면 (1) 결과 숫자가 바뀌고 (2) 그림도 다시 그려져야 한다.
    // 숫자만 바뀌고 그림이 그대로면 그림은 표와 무관한 장식이다.
    const shot = async () => p.evaluate(() => {
      const c = document.getElementById("plot");
      const cv = document.createElement("canvas");
      cv.width = 120; cv.height = 80;
      const cx = cv.getContext("2d", { willReadFrequently: true });
      cx.drawImage(c, 0, 0, cv.width, cv.height);
      return cv.toDataURL().slice(-2000);
    });
    const before = { vals: await p.$$eval(".demo .ov", (e) => e.map((x) => x.textContent).join("|")), img: await shot() };
    const clicked = await p.evaluate(() => {
      const offs = [...document.querySelectorAll(".demo .opt")].filter((b) => !b.classList.contains("on"));
      const read = () => [...document.querySelectorAll(".demo .ov")].map((e) => e.textContent).join("|");
      const b0 = read();
      for (const o of offs) { o.click(); if (read() !== b0) return true; }
      return false;
    });
    await p.waitForTimeout(240);
    if (!clicked) noChange.push(name);
    else if ((await shot()) === before.img) stuck.push(name);
  }
  seen.size === N ? ok(`탭 ${N}개 모두 다른 측정`) : bad(`측정 ${seen.size}종 (기대 ${N})`);
  noTable.length === 0 ? ok(`조작표 ${N}개 전부 로드`) : bad(`조작표 없음: ${noTable.join(", ")}`);
  blank.length === 0 ? ok("그림이 전부 칠해짐") : bad(`빈 그림: ${blank.join(", ")}`);
  noChange.length === 0 ? ok(`조작하면 결과가 바뀐다 (${N}/${N})`) : bad(`조작해도 결과가 그대로: ${noChange.join(", ")}`);
  stuck.length === 0 ? ok("조작하면 그림도 다시 그려진다") : bad(`그림이 표를 안 따라감: ${stuck.join(", ")}`);
  thin.length === 0 ? ok("설명·판정·출처·범례·대체텍스트 전부 있음") : bad(`빈약: ${thin.slice(0, 4).join(" / ")}`);

  await p.goto(`${URL_KO}#rffi`, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const deep = (await p.textContent("#proj-name")).trim();
  deep === "송신기 지문" ? ok("해시 딥링크 복원") : bad(`해시 딥링크 실패 (${deep})`);

  const low = await p.evaluate(CONTRAST);
  low.length === 0 ? ok("본문 대비 4.5:1 통과") : bad(`대비 미달 ${low.length}건: ${JSON.stringify(low.slice(0, 3))}`);

  const heads = await p.$$eval("h1,h2,h3", (e) => e.map((x) => +x.tagName[1]));
  heads.filter((h) => h === 1).length === 1 ? ok("h1 정확히 1개") : bad(`h1 ${heads.filter((h) => h === 1).length}개`);

  errors.length === 0 ? ok("콘솔 에러 0") : bad(`콘솔 에러 ${errors.length}: ${errors[0]}`);
  await p.screenshot({ path: `${OUT}/comms-desktop.png` });
  await ctx.close();
}

/* ---------- 2. 좁은 화면: 열화판이면 안 된다 ---------- */
console.log("\n[comms · 모바일]");
{
  const { ctx, p, errors } = await page({ ...devices["iPhone 13"] });
  await p.goto(URL_KO, { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  over <= 1 ? ok("가로 넘침 없음") : bad(`가로 ${over}px 넘침`);

  const small = await p.$$eval(".tab, .opt, .langbtn, summary, footer a",
    (els) => els.filter((e) => e.getBoundingClientRect().height < 44).length);
  small === 0 ? ok("터치 타깃 44px 이상") : bad(`44px 미만 ${small}개`);

  const box = await p.evaluate(() => {
    const c = document.getElementById("plot");
    const r = c.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  });
  box.w >= 280 && box.h >= 200 ? ok(`그림 ${box.w}x${box.h}`) : bad(`그림이 너무 작다 ${box.w}x${box.h}`);
  const ink = await p.evaluate(INK);
  ink > 0.002 ? ok(`모바일 그림 픽셀 ${(ink * 100).toFixed(2)}%`) : bad(`모바일 그림이 비었다 (${ink})`);

  errors.length === 0 ? ok("콘솔 에러 0") : bad(`콘솔 에러 ${errors.length}: ${errors[0]}`);
  await p.screenshot({ path: `${OUT}/comms-mobile.png` });
  await ctx.close();
}

/* ---------- 3. 영문 화면 ---------- */
console.log("\n[comms · 영문]");
{
  const { ctx, p, errors } = await page({ viewport: { width: 1440, height: 960 } });
  await p.goto(`${URL_KO}?lang=en`, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  const tabs = await p.$$eval(".tab", (e) => e.map((x) => x.textContent.trim()));
  const kr = [];
  for (const name of tabs) {
    await p.click(`.tab:has-text("${name}")`);
    await p.waitForTimeout(300);
    const hit = await p.evaluate(() => {
      const t = [document.getElementById("product"), document.getElementById("verdict"),
                 document.getElementById("legend"), document.querySelector(".demo")]
        .map((e) => (e && e.textContent) || "").join(" ");
      const m = t.match(/[가-힣]+/g);
      return m ? m.slice(0, 3) : null;
    });
    if (hit) kr.push(`${name}: ${hit.join(",")}`);
  }
  kr.length === 0 ? ok("영문 화면에 국문 잔류 0") : bad(`국문 잔류: ${kr.slice(0, 3).join(" / ")}`);
  errors.length === 0 ? ok("콘솔 에러 0") : bad(`콘솔 에러 ${errors.length}: ${errors[0]}`);
  await ctx.close();
}

/* ---------- 4. 조회표가 화면 밖에서도 계약을 지키나 ---------- */
console.log("\n[comms · 데이터 계약]");
{
  let holes = 0;
  for (const f of DATA) {
    const d = JSON.parse(readFileSync(`demos/comms/data/${f}`, "utf8"));
    const keys = d.controls.map((c) => c.key);
    const sigs = new Set(d.runs.map((r) => keys.map((k) => String(r.in[k])).join("|")));
    const expect = d.controls.reduce((a, c) => a * c.options.length, 1);
    if (sigs.size !== expect) { bad(`${f}: 조합 ${expect}개인데 표에 ${sigs.size}개`); holes++; }
  }
  holes === 0 ? ok(`조회표 ${DATA.length}개 구멍 없음`) : bad(`구멍 ${holes}건`);
}

await browser.close();
console.log("\n" + "=".repeat(52));
if (fails.length) { console.log(`❌ FAIL ${fails.length}건`); process.exit(1); }
console.log("✅ PASS — 통신 데모 게이트 통과");
