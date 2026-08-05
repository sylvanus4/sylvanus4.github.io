/* 이력서 PDF 생성. 화면과 같은 HTML 을 인쇄 CSS 로 굽는다.
   사용: node tools/make_resume_pdf.mjs [baseURL]

   게이트: 페이지 수 상한(한국어 5장 · 영문 2장)과 텍스트 추출 가능 여부를 확인한다.
   이미지로 구운 PDF 는 ATS 가 못 읽으므로 반드시 텍스트가 살아 있어야 한다. */

import { chromium } from "playwright";
import { statSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const BASE = process.argv[2] || "http://127.0.0.1:4173";

const JOBS = [
  { lang: "ko", out: "한효정_이력서.pdf", maxPages: 5, mustHave: ["한효정", "ThakiCloud", "연세대학교"] },
  { lang: "en", out: "Hyojung_Han_Resume_EN.pdf", maxPages: 2, mustHave: ["Hyojung Han", "ThakiCloud", "Yonsei"] }
];

const browser = await chromium.launch();
const fails = [];

for (const j of JOBS) {
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(`${BASE}/resume.html?lang=${j.lang}`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1200);

  const filled = await page.evaluate(() => document.querySelectorAll(".sec").length);
  if (filled < 5) fails.push(`${j.lang}: 섹션 ${filled}개 (기대 5개 이상)`);
  if (errs.length) fails.push(`${j.lang}: JS 에러 ${errs[0]}`);

  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: j.out,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "12mm", left: "13mm", right: "13mm" }
  });
  await page.close();

  // --- PDF 자체 검사 ---
  const buf = readFileSync(j.out);
  const kb = Math.round(statSync(j.out).size / 1024);
  const pages = (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;

  const line = `${j.out}  ${kb}KB  ${pages}p`;
  if (pages > j.maxPages) fails.push(`${j.out}: ${pages}장 (상한 ${j.maxPages}장)`);
  if (kb > 500) fails.push(`${j.out}: ${kb}KB (500KB 초과)`);
  console.log("  " + line);

  // 텍스트가 살아 있는지 (ATS 파싱 가능 여부)
  const p2 = await browser.newPage();
  await p2.goto(`${BASE}/resume.html?lang=${j.lang}`, { waitUntil: "networkidle" });
  const text = await p2.evaluate(() => document.body.innerText);
  await p2.close();
  for (const w of j.mustHave) {
    if (!text.includes(w)) fails.push(`${j.out}: "${w}" 누락`);
  }

  /* --- ATS 추출 순서 ---
     스킬을 2열로 두면 PDF 텍스트가 "제목1 제목2 항목1 항목2" 로 뒤섞여 나온다.
     제목 바로 뒤에 그 그룹의 첫 항목이 오는지 실제 추출본으로 확인한다. */
  try {
    const raw = execFileSync("pdftotext", [j.out, "-"], { encoding: "utf8" }).replace(/\s+/g, " ");
    const groups = await (async () => {
      const p3 = await browser.newPage();
      await p3.goto(`${BASE}/resume.html?lang=${j.lang}`, { waitUntil: "networkidle" });
      const g = await p3.evaluate(() =>
        [...document.querySelectorAll(".skill")].map((s) => ({
          title: s.querySelector("b").textContent.trim(),
          first: s.querySelector("span").textContent.trim().split("·")[0].trim()
        }))
      );
      await p3.close();
      return g;
    })();
    for (const g of groups) {
      const i = raw.indexOf(g.title);
      const k = raw.indexOf(g.first, i);
      if (i < 0 || k < 0 || k - i > g.title.length + 40) {
        fails.push(`${j.out}: 스킬 추출 순서 깨짐 ("${g.title}" 뒤에 항목이 안 옴)`);
        break;
      }
    }
  } catch {
    console.log("  (pdftotext 없음 - 추출 순서 검사 건너뜀)");
  }
}

await browser.close();

if (fails.length) {
  console.log("\n❌ PDF 게이트 실패");
  fails.forEach((f) => console.log("   - " + f));
  process.exit(1);
}
console.log("\n✅ PDF 생성 완료");
