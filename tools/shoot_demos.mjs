/* 데모 카드용 화면 캡처.
   assets/demos.json 의 url 을 실제로 열어서 찍는다 — 카드 이미지와 링크가 어긋나면
   포트폴리오에서 가장 나쁜 종류의 거짓말이 된다.

   사용: node tools/shoot_demos.mjs [--only slug] [--force]
   결과: assets/img/demos/<slug>.jpg (1200x750, JPEG q72) */

import { chromium } from "playwright";
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";

const OUT = "assets/img/demos";
const W = 1200, H = 750;
const only = process.argv.includes("--only")
  ? process.argv[process.argv.indexOf("--only") + 1]
  : null;
const force = process.argv.includes("--force");

mkdirSync(OUT, { recursive: true });
const demos = JSON.parse(readFileSync("assets/demos.json", "utf8"));
const list = demos.filter((d) => !only || d.slug === only);

const browser = await chromium.launch();
const fails = [];
let shot = 0, skipped = 0;

// 동시에 4개까지. 더 늘리면 GitHub Pages 가 429 를 준다.
const LANES = 4;
const queue = [...list];

async function worker() {
  while (queue.length) {
    const d = queue.shift();
    const path = `${OUT}/${d.slug}.jpg`;
    // 비공개 항목은 열 URL 자체가 없다. 캡처는 손으로 만든 것을 쓰고, --force 재촬영이
    // 이 항목에서 죽으면 나머지 45장의 링크 생존 확인까지 같이 죽는다.
    if (d.src === "private" || !d.url) { skipped++; continue; }
    if (!force && existsSync(path)) { skipped++; continue; }

    const ctx = await browser.newContext({
      viewport: { width: W, height: H },
      deviceScaleFactor: 1,
      // 캡처에 스크롤바가 찍히면 카드가 지저분해진다
      reducedMotion: "reduce",
      colorScheme: "light"
    });
    const page = await ctx.newPage();
    try {
      const res = await page.goto(d.url, { waitUntil: "load", timeout: 45000 });
      if (!res || res.status() >= 400) throw new Error(`HTTP ${res && res.status()}`);
      // 클라이언트 계산 도구가 많다. 첫 계산이 끝나야 의미 있는 화면이 나온다.
      await page.waitForTimeout(3000);
      // 소리를 내는 작품은 사용자 제스처 전까지 표지 화면에 머문다. 그 상태를 찍으면
      // 카드가 빈 사각형이 되므로, enter 가 지정된 항목만 실제로 눌러서 동작 화면을 찍는다.
      // 어디까지나 라이브 URL 을 그대로 조작하는 것이라 카드와 링크는 여전히 같은 화면이다.
      if (d.enter) {
        const target = page.locator(d.enter.click).first();
        if (await target.count()) {
          await target.click({ timeout: 5000 });
          await page.waitForTimeout(d.enter.wait ?? 3500);
        } else {
          throw new Error(`enter.click 셀렉터를 못 찾음: ${d.enter.click}`);
        }
      }
      await page.evaluate(() => {
        document.documentElement.style.scrollbarWidth = "none";
        window.scrollTo(0, 0);
      });
      await page.screenshot({ path, type: "jpeg", quality: 72 });
      const kb = Math.round(statSync(path).size / 1024);
      shot++;
      console.log(`  ✓ ${d.slug} (${kb}KB)`);
    } catch (e) {
      fails.push(`${d.slug}: ${e.message.split("\n")[0]}`);
      console.log(`  ✗ ${d.slug} — ${e.message.split("\n")[0]}`);
    }
    await ctx.close();
  }
}

console.log(`캡처 대상 ${list.length}개 (lanes=${LANES})`);
await Promise.all(Array.from({ length: LANES }, () => worker()));
await browser.close();

console.log(`\n찍음 ${shot} · 건너뜀 ${skipped} · 실패 ${fails.length}`);
if (fails.length) {
  fails.forEach((f) => console.log("   - " + f));
  process.exit(1);
}
