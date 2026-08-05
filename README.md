# 한효정 포트폴리오

https://sylvanus4.github.io

AI 시스템 엔지니어 한효정의 개인 포트폴리오. 빌드 단계 없이 GitHub Pages에서 정적으로 서빙된다.

## 컨셉

**The Stack.** 연구, 모델, 인프라, 플랫폼, 제품의 다섯 층을 한 사람이 관통한다는 서사를
3D 씬 하나로 표현했다. 스크롤이 카메라를 레이어 아래로 내려보낸다. 효과를 여러 개 쌓지
않고 이 아이디어 하나에만 집중한다.

## 구조

```
index.html            섹션 골격 + 메타 + importmap
assets/css/style.css  디자인 토큰과 컴포넌트. 토큰 밖 색상 하드코딩 금지
assets/js/data.js     모든 카피와 데이터. 문구 수정은 이 파일만 고친다
assets/js/main.js     DOM 조립과 인터랙션. three.js 를 동적 import 한다
assets/js/scene.js    three.js 씬. 실패하면 CSS 그라디언트로 조용히 폴백
tools/make_og.py      OG 이미지 생성기
tools/qa.mjs          렌더 품질 게이트 (Playwright)
```

## 문구 고치기

`assets/js/data.js` 만 수정하면 된다. 마크업은 건드릴 필요가 없다.

## 품질 게이트

브라우저로 실제 띄워서 확인한다. 코드 읽기로 대체하지 않는다.

```bash
python3 -m http.server 4173 &
node tools/qa.mjs
```

렌더 개수, 콘솔 에러, 가로 오버플로, 본문 대비 4.5:1, 터치 타깃 44px, 카드 동작을 검사하고
데스크톱과 모바일 스크린샷을 `tools/qa-shots/` 에 남긴다. 하나라도 실패하면 exit 1.

OG 이미지 재생성:

```bash
python3 tools/make_og.py
```

## 견고성

- three.js CDN 이 죽어도 페이지는 그대로 뜬다 (동적 import + CSS 폴백)
- `prefers-reduced-motion` 이면 3D 를 아예 초기화하지 않는다
- 모바일은 포인트 필드를 끄고 DPR 과 씬 불투명도를 낮춘다
- 탭이 숨겨지면 렌더 루프가 멈춘다
