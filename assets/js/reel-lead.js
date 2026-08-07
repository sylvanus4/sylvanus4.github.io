/* 대표 영상 한 편을 크게 거는 블록. 홈과 카탈로그가 같이 쓴다.
   내비를 페이지마다 복사했다가 항목이 갈라진 적이 있어(2026-08-07) 이건 처음부터 한 곳에 둔다.

   어느 편이 대표인지는 data.js 의 `lead: true` 가 정한다. 화면이 인덱스로 고르지 않는다 —
   순서를 바꿔도 대표가 따라 바뀌면 안 되기 때문이다. */

import { t } from "./i18n.js";

export function findLead(reels) {
  return reels.find((r) => r.lead && r.ready) || null;
}

export function renderLeadReel(host, reels) {
  if (!host) return null;
  const r = findLead(reels);
  // 대표로 지정된 편이 아직 안 나왔으면 자리표시자를 남기지 않고 통째로 접는다.
  if (!r) { host.remove(); return null; }

  host.innerHTML = `
    <figure class="leadreel" data-pal="${r.palette}">
      <video class="leadreel__v" controls preload="none" playsinline
             poster="assets/video/${r.slug}.jpg" aria-describedby="leadreel-cap">
        <source src="assets/video/${r.slug}.mp4" type="video/mp4">
        ${t("reels.noVideo")}
        <a href="assets/video/${r.slug}.mp4">${t("reels.download")}</a>
      </video>
      <figcaption class="leadreel__cap" id="leadreel-cap">
        <p class="leadreel__meta">
          <i>${r.n}</i><span>${t("reels.featured")}</span><em>${r.dur}</em>
        </p>
        <p class="leadreel__title">${r.cat}</p>
        <p class="leadreel__blurb">${r.blurb}</p>
      </figcaption>
    </figure>`;
  return r;
}
