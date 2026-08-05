/* 접근성 · UX 감사. 실제 브라우저로 조작해서 판정한다.
   사용: node tools/audit.mjs [baseURL] */

import { chromium } from "playwright";

const BASE = process.argv[2] || "http://127.0.0.1:4173";
const PAGES = [
  { name: "portfolio", url: "/" },
  { name: "catalog", url: "/tech.html" },
  { name: "resume-ko", url: "/resume.html?lang=ko" },
  { name: "resume-en", url: "/resume.html?lang=en" }
];
const WIDTHS = [320, 393, 768, 834, 1024, 1280, 1512];

const fails = [];
const ok = (m) => console.log("  ✓ " + m);
const bad = (m) => { fails.push(m); console.log("  ✗ " + m); };
const warn = (m) => console.log("  ⚠ " + m);

const browser = await chromium.launch();

for (const P of PAGES) {
  console.log(`\n[${P.name}]`);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + P.url, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1600);

  // --- heading 계층 ---
  const heads = await page.evaluate(() =>
    [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")]
      .filter((h) => h.offsetParent !== null || h.getClientRects().length)
      .map((h) => ({ lv: +h.tagName[1], t: h.textContent.trim().slice(0, 28) }))
  );
  const h1s = heads.filter((h) => h.lv === 1);
  h1s.length === 1 ? ok(`h1 정확히 1개 ("${h1s[0]?.t}")`) : bad(`h1 ${h1s.length}개 (1개여야 함)`);
  let skip = null, prev = 0;
  for (const h of heads) {
    if (prev && h.lv > prev + 1) { skip = `h${prev} → h${h.lv} ("${h.t}")`; break; }
    prev = h.lv;
  }
  skip ? bad(`heading 단계 건너뜀: ${skip}`) : ok(`heading 계층 연속 (${heads.length}개)`);

  // --- 랜드마크 ---
  const lm = await page.evaluate(() => ({
    main: document.querySelectorAll("main").length,
    nav: document.querySelectorAll("nav").length,
    header: document.querySelectorAll("body > .page > header, header").length,
    footer: document.querySelectorAll("footer").length
  }));
  lm.main === 1 ? ok("main 랜드마크 1개") : bad(`main ${lm.main}개`);

  // --- 이미지 alt ---
  const noAlt = await page.evaluate(() =>
    [...document.images].filter((i) => !i.hasAttribute("alt")).map((i) => i.src.split("/").pop())
  );
  noAlt.length === 0 ? ok(`이미지 alt 전부 있음 (${await page.evaluate(() => document.images.length)}개)`)
                     : bad(`alt 없는 이미지 ${noAlt.length}개: ${noAlt.slice(0, 3)}`);

  // --- 폼 라벨 ---
  const unlabeled = await page.evaluate(() =>
    [...document.querySelectorAll("input,select,textarea")].filter((f) => {
      if (f.type === "hidden") return false;
      return !(
        f.labels?.length || f.getAttribute("aria-label") || f.getAttribute("aria-labelledby")
      );
    }).map((f) => f.id || f.type)
  );
  unlabeled.length === 0 ? ok("입력 요소 라벨 연결됨") : bad(`라벨 없는 입력: ${unlabeled}`);

  // --- 실제 Tab 이동으로 첫 정지점 확인 (스킵 링크) ---
  if (P.name === "portfolio" || P.name === "catalog") {
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press("Tab");
    const first = await page.evaluate(() => document.activeElement?.className || document.activeElement?.tagName);
    String(first).includes("skip") ? ok("첫 Tab 정지점 = 스킵 링크") : warn(`첫 Tab 정지점: ${first}`);
  }

  // --- 키보드 도달성: 탭으로 모든 주요 링크/버튼에 갈 수 있는가 ---
  const kb = await page.evaluate(() => {
    const foc = [...document.querySelectorAll("a[href],button,input,select,textarea,[tabindex]")]
      .filter((e) => {
        if (e.hasAttribute("disabled") || e.getAttribute("tabindex") === "-1") return false;
        const s = getComputedStyle(e);
        if (s.display === "none" || s.visibility === "hidden") return false;
        return e.getBoundingClientRect().width > 0;
      });
    const noFocusStyle = [];
    foc.forEach((e) => {
      e.focus();
      const s = getComputedStyle(e);
      const hasRing = s.outlineStyle !== "none" || s.boxShadow !== "none";
      if (!hasRing) noFocusStyle.push(e.className || e.tagName);
    });
    return { total: foc.length, noFocusStyle: [...new Set(noFocusStyle)] };
  });
  kb.noFocusStyle.length === 0
    ? ok(`포커스 가능 ${kb.total}개, 전부 포커스 표시 있음`)
    : bad(`포커스 표시 없는 요소: ${kb.noFocusStyle.slice(0, 4).join(", ")}`);

  // --- 대비 (다양한 텍스트 역할) ---
  const contrast = await page.evaluate(() => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 1;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    /* 반투명 배경을 흰색 위에 칠하면 다크 테마 대비가 통째로 잘못 나온다.
       불투명 바닥까지 올라가 층층이 알파 합성해야 실제로 보이는 색이 된다. */
    const rgba = (c) => {
      cx.clearRect(0, 0, 1, 1);
      cx.fillStyle = c;
      cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const over = (fg, bg) => fg.slice(0, 3).map((v, i) => v * fg[3] + bg[i] * (1 - fg[3]));
    const lum = (rgbArr) => {
      const [r, g, b] = rgbArr.map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const bgOf = (e) => {
      const layers = [];
      let n = e;
      while (n && n !== document.documentElement) {
        const c = rgba(getComputedStyle(n).backgroundColor);
        if (c[3] > 0) { layers.push(c); if (c[3] >= 0.999) break; }
        n = n.parentElement;
      }
      const root = rgba(getComputedStyle(document.documentElement).backgroundColor);
      let base = root[3] >= 0.999 ? root.slice(0, 3) : [13, 17, 25];
      for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
      return base;
    };
    const out = [];
    [...document.querySelectorAll("p,li,span,dd,dt,h1,h2,h3,h4,a,b,small,i")]
      .filter((e) => {
        if (!e.textContent.trim() || !e.getClientRects().length || e.children.length) return false;
        // background-clip:text 로 칠한 그라디언트 글자는 color 가 transparent 라 측정 불가
        const s = getComputedStyle(e);
        if (s.webkitTextFillColor === "rgba(0, 0, 0, 0)" || s.color === "rgba(0, 0, 0, 0)") return false;
        return true;
      })
      .slice(0, 260)
      .forEach((e) => {
        const s = getComputedStyle(e);
        const fg = rgba(s.color);
        const l1 = lum(over(fg, bgOf(e))), l2 = lum(bgOf(e));
        const ratio = (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
        const px = parseFloat(s.fontSize);
        const large = px >= 24 || (px >= 18.66 && +s.fontWeight >= 700);
        const need = large ? 3 : 4.5;
        if (ratio < need) out.push({ cls: e.className || e.tagName, r: +ratio.toFixed(2), need, px: Math.round(px), txt: e.textContent.trim().slice(0,18) });
      });
    const seen = new Set();
    return out.filter((o) => !seen.has(o.cls) && seen.add(o.cls));
  });
  contrast.length === 0
    ? ok("텍스트 대비 WCAG AA 통과")
    : bad(`대비 미달 ${contrast.length}종: ${contrast.slice(0,6).map(c=>`${c.cls}="${c.txt}"(${c.r}/${c.need})`).join(", ")}`);

  // --- aria-expanded 실제 토글 ---
  const expLoc = page.locator("[aria-expanded]:visible");
  const exp = await expLoc.count();
  if (exp) {
    const el0 = expLoc.first();
    const before = await el0.getAttribute("aria-expanded");
    await el0.click();
    await page.waitForTimeout(400);
    const after = await el0.getAttribute("aria-expanded");
    before !== after ? ok(`aria-expanded 토글 동작 (${before}→${after})`) : bad("aria-expanded 값이 안 바뀜");
    await el0.click();
  }

  // --- 폭별 오버플로 / 겹침 ---
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(450);
    const r = await page.evaluate(() => {
      const of = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      // 뷰포트 밖으로 삐져나간 요소
      const out = [...document.querySelectorAll("body *")]
        .filter((e) => { const b = e.getBoundingClientRect();
          return b.width > 0 && (b.right > innerWidth + 2 || b.left < -2); })
        .map((e) => e.className || e.tagName).slice(0, 3);
      return { of, out: [...new Set(out)] };
    });
    r.of <= 1 && r.out.length === 0
      ? ok(`${w}px 넘침 없음`)
      : bad(`${w}px 오버플로 ${r.of}px${r.out.length ? " / 밖으로 나간 요소: " + r.out.join(", ") : ""}`);
  }

  // --- 좁은 화면에서 내비 도달 가능 여부 ---
  if (P.name === "portfolio" || P.name === "catalog") {
    await page.setViewportSize({ width: 393, height: 800 });
    await page.waitForTimeout(400);
    const reach = await page.evaluate(() => {
      const links = [...document.querySelectorAll(".nav-links a")];
      const visible = links.filter((a) => a.getBoundingClientRect().width > 0).length;
      const burger = document.querySelector(".nav-burger");
      return { visible, hasBurger: !!burger && burger.getBoundingClientRect().width > 0, total: links.length };
    });
    if (reach.visible === 0 && !reach.hasBurger) bad("393px 에서 내비 링크 도달 불가 (메뉴 버튼도 없음)");
    else if (reach.hasBurger) {
      await page.click(".nav-burger");
      await page.waitForTimeout(400);
      const after = await page.evaluate(() =>
        [...document.querySelectorAll(".nav-links a")].filter((a) => a.getBoundingClientRect().width > 0).length);
      after === reach.total ? ok(`393px 메뉴로 링크 ${after}개 도달 가능`) : bad(`메뉴를 열어도 ${after}/${reach.total}개만 보임`);
      await page.click(".nav-burger");
    } else ok(`393px 내비 링크 ${reach.visible}개 직접 노출`);
  }

  await ctx.close();
}

await browser.close();
console.log("\n" + "=".repeat(52));
if (fails.length) {
  console.log(`❌ 감사 실패 ${fails.length}건`);
  fails.forEach((f) => console.log("   - " + f));
  process.exit(1);
}
console.log("✅ 감사 통과");
