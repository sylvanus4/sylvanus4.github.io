/* 렌더 품질 게이트. 실제 브라우저로 띄워서 확인한다 (코드 읽기로 대체 금지).
   사용: node tools/qa.mjs [baseURL]   기본값 http://127.0.0.1:4173 */

import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] || "http://127.0.0.1:4173";
const OUT = "tools/qa-shots";
mkdirSync(OUT, { recursive: true });

const fails = [];
const warn = (m) => console.log("  ⚠ " + m);
const ok = (m) => console.log("  ✓ " + m);
const bad = (m) => { fails.push(m); console.log("  ✗ " + m); };

const browser = await chromium.launch();

async function run(name, ctxOpts, shots) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  const bad404 = [];
  page.on("response", (r) => { if (r.status() >= 400) bad404.push(`${r.status()} ${r.url()}`); });

  console.log(`\n[${name}]`);
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(2200);

  // --- 콘텐츠가 실제로 렌더됐는가 ---
  const counts = await page.evaluate(() => ({
    stats: document.querySelectorAll(".stat").length,
    layers: document.querySelectorAll(".layer").length,
    cards: document.querySelectorAll(".card").length,
    tl: document.querySelectorAll(".tl-item").length,
    sgroups: document.querySelectorAll(".sgroup").length,
    slist: document.querySelectorAll(".sitem").length,
    contact: document.querySelectorAll("#contact-in .btn").length,
    ready: document.body.dataset.ready === "1",
    sceneReady: document.getElementById("scene")?.classList.contains("ready"),
    h1: document.querySelector("h1")?.textContent?.trim().slice(0, 40)
  }));
  const expect = { stats: 4, layers: 5, cards: 12, tl: 5, sgroups: 7, slist: 5, contact: 3 };
  for (const [k, v] of Object.entries(expect)) {
    counts[k] === v ? ok(`${k} = ${v}`) : bad(`${k} = ${counts[k]} (기대 ${v})`);
  }
  counts.ready ? ok("boot 완료") : bad("boot 미완료");
  counts.sceneReady ? ok("3D 씬 활성") : warn("3D 씬 비활성 (폴백 경로)");
  ok(`h1: ${counts.h1}`);

  // --- 콘솔/네트워크 ---
  errors.length ? bad(`콘솔 에러 ${errors.length}건: ${errors.slice(0, 3).join(" | ")}`) : ok("콘솔 에러 0");
  bad404.length ? warn(`4xx/5xx ${bad404.length}건: ${bad404.slice(0, 3).join(" | ")}`) : ok("실패 응답 0");

  // --- 가로 스크롤 (모바일 필수) ---
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  overflow <= 1 ? ok("가로 오버플로 없음") : bad(`가로 오버플로 ${overflow}px`);

  // --- 대비: 본문 텍스트가 배경 위에서 읽히는가 (근사) ---
  /* 브라우저가 oklch() 문자열을 그대로 돌려주므로 정규식 파싱은 못 쓴다.
     캔버스에 실제로 칠해서 sRGB 픽셀을 읽는다. */
  const contrast = await page.evaluate(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    const toRGB = (css) => {
      cx.clearRect(0, 0, 1, 1);
      cx.fillStyle = "#000";
      cx.fillRect(0, 0, 1, 1);
      cx.fillStyle = css;
      cx.fillRect(0, 0, 1, 1);
      return cx.getImageData(0, 0, 1, 1).data;
    };
    const lum = (css) => {
      const [r, g, b] = [...toRGB(css)].slice(0, 3).map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const bgL = lum(getComputedStyle(document.body).backgroundColor);
    let min = 99, who = "";
    [...document.querySelectorAll(".lede, .card-sum, .layer-body, .tl-note, .qa dd, .muted")]
      .slice(0, 30)
      .forEach((e) => {
        const l = lum(getComputedStyle(e).color);
        const r = (Math.max(l, bgL) + 0.05) / (Math.min(l, bgL) + 0.05);
        if (r < min) { min = r; who = e.className || e.tagName; }
      });
    return { ratio: Math.round(min * 100) / 100, who };
  });
  contrast.ratio >= 4.5
    ? ok(`본문 대비 ${contrast.ratio}:1`)
    : bad(`본문 대비 ${contrast.ratio}:1 (4.5 미만) — ${contrast.who}`);

  /* --- 이미지 비율 왜곡 ---
     height 속성이 프레젠테이션 힌트로 남으면 aspect-ratio 가 무시돼 사진이 늘어난다.
     개수 검사만으로는 절대 안 잡힌다. 실제 렌더 박스와 원본 비율을 대조한다. */
  const warped = await page.evaluate(() =>
    [...document.images]
      .filter((i) => i.naturalWidth && i.getBoundingClientRect().width > 8)
      .map((i) => {
        const r = i.getBoundingClientRect();
        const want = i.naturalWidth / i.naturalHeight;
        const got = r.width / r.height;
        return { src: i.currentSrc.split("/").pop(), off: Math.abs(got / want - 1), got: got.toFixed(2) };
      })
      .filter((x) => x.off > 0.06)
  );
  warped.length === 0
    ? ok("이미지 비율 정상")
    : bad(`이미지 비율 왜곡: ${warped.map((w) => `${w.src}(${w.got})`).join(", ")}`);

  /* --- 첫 화면에 핵심 정보가 보이는가 (채용담당자 3분 룰) --- */
  const fold = await page.evaluate(() => {
    const h1 = document.querySelector(".hero h1");
    const r = h1?.getBoundingClientRect();
    return r ? { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight } : null;
  });
  fold && fold.bottom > 0 && fold.bottom < fold.vh
    ? ok(`히어로 제목 첫 화면 노출 (${fold.top}~${fold.bottom} / ${fold.vh})`)
    : bad(`히어로 제목이 첫 화면 밖 (${JSON.stringify(fold)})`);

  // --- 터치 타깃 44px ---
  const tiny = await page.evaluate(() =>
    [...document.querySelectorAll("a.btn, button, .nav-cta")]
      .filter((e) => { const r = e.getBoundingClientRect(); return r.height > 0 && r.height < 44; })
      .map((e) => `${e.className || e.tagName}:${Math.round(e.getBoundingClientRect().height)}px`)
  );
  tiny.length === 0 ? ok("터치 타깃 44px 이상") : warn(`44px 미만: ${tiny.join(", ")}`);

  // --- 카드 펼치기 동작 ---
  const t = page.locator(".card-toggle").first();
  await t.click();
  await page.waitForTimeout(650);
  const opened = await page.locator(".card.open").count();
  opened >= 1 ? ok("카드 펼치기 동작") : bad("카드 펼치기 실패");
  await page.locator(".card.open .card-toggle").first().click(); // 원상 복구
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(900);

  // --- 스크린샷 ---
  for (const s of shots) {
    if (s.at) { await page.evaluate((y) => scrollTo(0, y), s.at); await page.waitForTimeout(1100); }
    await page.screenshot({ path: `${OUT}/${name}-${s.name}.png`, fullPage: !!s.full });
    ok(`shot ${s.name}`);
  }

  await ctx.close();
}

await run("desktop", { viewport: { width: 1512, height: 950 }, deviceScaleFactor: 2 }, [
  { name: "1-hero" },
  { name: "2-stack", at: 1200 },
  { name: "3-work", at: 2900 },
  { name: "4-career", at: 5200 },
  { name: "5-contact", at: 99000 }
]);

await run("laptop", { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }, [
  { name: "1-hero" },
  { name: "2-work", at: 2600 }
]);

// 태블릿 3종: 세로 iPad mini / iPad Pro 11 / 가로 iPad Pro
await run("tablet-768", { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, [
  { name: "1-hero" },
  { name: "2-stack", at: 1300 },
  { name: "3-work", at: 3000 }
]);

await run("tablet-834", { viewport: { width: 834, height: 1194 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, [
  { name: "1-hero" },
  { name: "2-work", at: 3000 }
]);

await run("tablet-1024", { viewport: { width: 1024, height: 768 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, [
  { name: "1-hero" },
  { name: "2-work", at: 2600 }
]);

await run("mobile", { ...devices["iPhone 14 Pro"] }, [
  { name: "1-hero" },
  { name: "2-stack", at: 1400 },
  { name: "3-work", at: 3200 }
]);

await run("mobile-small", { viewport: { width: 320, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, [
  { name: "1-hero" }
]);

/* ---- 카탈로그 페이지 ---- */
async function runTech(name, ctxOpts) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

  console.log(`\n[tech/${name}]`);
  await page.goto(`${BASE}/tech.html`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1400);

  const cards = await page.locator("#techboard a.pcard").count();
  cards === 126 ? ok(`카드 ${cards}개`) : bad(`카드 ${cards}개 (기대 126)`);
  const fams = await page.locator("#techboard .fam").count();
  fams === 11 ? ok(`분류 ${fams}개`) : bad(`분류 ${fams}개 (기대 11)`);

  errors.length ? bad(`콘솔 에러: ${errors.slice(0, 2).join(" | ")}`) : ok("콘솔 에러 0");

  const of = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  of <= 1 ? ok("가로 오버플로 없음") : bad(`가로 오버플로 ${of}px`);

  // 검색 필터 실동작
  await page.fill("#techq", "양자화");
  await page.waitForTimeout(400);
  const shown = await page.evaluate(() => [...document.querySelectorAll("#techboard a.pcard")].filter((c) => !c.hidden).length);
  shown > 0 && shown < 126 ? ok(`검색 필터 동작 (${shown}개)`) : bad(`검색 필터 이상 (${shown}개)`);
  await page.fill("#techq", "");
  await page.waitForTimeout(300);

  await page.screenshot({ path: `${OUT}/tech-${name}.png` });
  await page.evaluate(() => document.querySelector("#techboard .fam")?.scrollIntoView());
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/tech-${name}-cards.png` });
  ok("shot");
  await ctx.close();
}

await runTech("desktop", { viewport: { width: 1512, height: 950 }, deviceScaleFactor: 2 });
await runTech("tablet", { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await runTech("mobile", { ...devices["iPhone 14 Pro"] });

await browser.close();

console.log("\n" + "=".repeat(52));
if (fails.length) {
  console.log(`❌ FAIL ${fails.length}건`);
  fails.forEach((f) => console.log("   - " + f));
  process.exit(1);
}
console.log("✅ PASS — 모든 게이트 통과");
