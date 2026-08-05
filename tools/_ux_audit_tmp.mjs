import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = "http://127.0.0.1:4177";
const OUT = "/private/tmp/claude-501/-Users-hanhyojung-thaki-ai-platform-strategy/50ff08bb-e1a0-4715-b207-eee1da8f0769/scratchpad/shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const report = {};

const pages = [
  { name: "home", url: BASE + "/" },
  { name: "tech", url: BASE + "/tech.html" },
  { name: "resume-ko", url: BASE + "/resume.html?lang=ko" },
  { name: "resume-en", url: BASE + "/resume.html?lang=en" },
];

const widths = [320, 393, 768, 834, 1024, 1280, 1512];

for (const p of pages) {
  report[p.name] = {};
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
    page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
    try {
      await page.goto(p.url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1500);
    } catch (e) {
      report[p.name][w] = { error: String(e) };
      await ctx.close();
      continue;
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

    // heading structure
    const headings = await page.evaluate(() =>
      [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(h => ({ tag: h.tagName, text: h.textContent.trim().slice(0, 50) }))
    );

    // images without alt
    const imgsNoAlt = await page.evaluate(() =>
      [...document.querySelectorAll("img")].filter(i => !i.hasAttribute("alt") || i.getAttribute("alt").trim() === "").length
    );

    // landmarks
    const landmarks = await page.evaluate(() => ({
      header: document.querySelectorAll("header").length,
      nav: document.querySelectorAll("nav").length,
      main: document.querySelectorAll("main").length,
      footer: document.querySelectorAll("footer").length,
    }));

    // focusable elements count + tab order sample (first 15 tabs)
    let tabTrace = [];
    if (w === 1280) {
      await page.keyboard.press("Tab");
      for (let i = 0; i < 20; i++) {
        const info = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return {
            tag: el.tagName,
            cls: el.className && typeof el.className === "string" ? el.className.slice(0, 40) : "",
            text: (el.textContent || "").trim().slice(0, 30),
            visible: r.width > 0 && r.height > 0,
            outline: cs.outlineStyle,
            outlineWidth: cs.outlineWidth,
            boxShadow: cs.boxShadow.slice(0, 60),
          };
        });
        tabTrace.push(info);
        await page.keyboard.press("Tab");
      }
    }

    // contrast check (approx WCAG) for body text & muted text against bg
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
      const ratio = (fg, bg) => {
        const L1 = lum(fg), L2 = lum(bg);
        const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
        return (hi + 0.05) / (lo + 0.05);
      };
      const results = [];
      const sampleSelectors = ["body", ".lede", ".muted", ".eyebrow", ".nav-links a", ".btn-primary", "h1", "h2"];
      for (const sel of sampleSelectors) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const cs = getComputedStyle(el);
        let bgEl = el, bg = cs.backgroundColor;
        let depth = 0;
        while ((bg === "rgba(0, 0, 0, 0)" || bg === "transparent") && bgEl.parentElement && depth < 8) {
          bgEl = bgEl.parentElement;
          bg = getComputedStyle(bgEl).backgroundColor;
          depth++;
        }
        if (bg === "rgba(0, 0, 0, 0)" || bg === "transparent") bg = getComputedStyle(document.body).backgroundColor;
        try {
          results.push({ sel, fg: cs.color, bg, fontSize: cs.fontSize, ratio: +ratio(cs.color, bg).toFixed(2) });
        } catch (e) {
          results.push({ sel, error: String(e) });
        }
      }
      return results;
    });

    // reduced motion respected?
    let reducedMotionInfo = null;
    if (w === 1280) {
      await ctx.close();
      const ctx2 = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
      const page2 = await ctx2.newPage();
      await page2.goto(p.url, { waitUntil: "networkidle", timeout: 30000 });
      await page2.waitForTimeout(1500);
      reducedMotionInfo = await page2.evaluate(() => {
        const canvas = document.getElementById("scene");
        return {
          sceneVisible: canvas ? getComputedStyle(canvas).display !== "none" && getComputedStyle(canvas).opacity !== "0" : null,
          hasAnimatedEls: document.querySelectorAll("[class*='rv'], .layer, .card").length,
        };
      });
      await page2.screenshot({ path: `${OUT}/${p.name}-reducedmotion-${w}.png`, fullPage: false }).catch(()=>{});
      await ctx2.close();
    } else {
      await page.screenshot({ path: `${OUT}/${p.name}-${w}.png`, fullPage: false }).catch(()=>{});
      await ctx.close();
    }

    report[p.name][w] = { overflow, headings: w === 1280 ? headings : headings.length, imgsNoAlt, landmarks, contrast: w === 1280 ? contrast : undefined, tabTrace: tabTrace.length ? tabTrace : undefined, consoleErrors, reducedMotionInfo };
  }
}

await browser.close();
writeFileSync(OUT + "/report.json", JSON.stringify(report, null, 2));
console.log("DONE");
