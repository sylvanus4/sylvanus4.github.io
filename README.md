# 한효정 포트폴리오

https://sylvanus4.github.io

AI 시스템 엔지니어 한효정의 개인 포트폴리오. 빌드 단계 없이 GitHub Pages에서 정적으로 서빙된다.

| 페이지 | 내용 |
|---|---|
| `/` | 포트폴리오. 3D 스택 씬, 케이스 스터디, 이력, 도구 |
| `/tech.html` | 보유 기술 카탈로그 126개, 11개 계열, 검색 필터 |
| `/resume.html` | 이력서. `?lang=ko` / `?lang=en` |
| `한효정_이력서.pdf` · `Hyojung_Han_Resume_EN.pdf` | 위 페이지에서 구운 PDF |

## 컨셉

**The Stack.** 연구, 모델, 인프라, 플랫폼, 제품의 다섯 층을 한 사람이 관통한다는 서사를
3D 씬 하나로 표현했다. 스크롤이 카메라를 레이어 아래로 내려보낸다. 효과를 여러 개 쌓지
않고 이 아이디어 하나에만 집중한다.

## 구조

```
index.html            포트폴리오 골격 + 메타 + importmap
tech.html             기술 카탈로그 (본문은 빌드 산출물을 fetch)
resume.html           이력서 (한 파일로 두 언어)
assets/css/style.css  포트폴리오 디자인 토큰과 컴포넌트
assets/css/tech.css   카탈로그 이식 레이어 (자동 생성)
assets/css/resume.css 이력서. 밝은 종이 + A4 인쇄 규격
assets/js/data.js     포트폴리오 카피와 데이터
assets/js/resume-data.js  이력서 콘텐츠 (ko / en)
assets/js/main.js     DOM 조립과 인터랙션. three.js 를 동적 import
assets/js/scene.js    three.js 씬. 실패하면 CSS 그라디언트로 폴백
assets/tech-body.html 카탈로그 본문 (자동 생성)
tools/                생성기와 품질 게이트
```

## 문구 고치기

포트폴리오는 `assets/js/data.js`, 이력서는 `assets/js/resume-data.js` 만 고치면 된다.
마크업은 건드릴 필요가 없다. 이력서를 고쳤으면 PDF를 다시 구워야 한다.

## 생성기

```bash
python3 tools/port_tech.py        # 2i tech.html -> 카탈로그 본문 + 토큰 브리지 CSS
python3 tools/make_og.py          # OG 이미지
node tools/make_resume_pdf.mjs    # 이력서 PDF 2종 (서버가 떠 있어야 한다)
```

`port_tech.py` 는 원본 148KB를 다시 쓰지 않는다. 본문에서 카탈로그만 뽑고, 그 본문이 쓰는
CSS 규칙만 추출해 `.tech2i` 아래로 스코프한 뒤 토큰만 포트폴리오 팔레트로 갈아끼운다.

## 품질 게이트

브라우저로 실제 띄워서 확인한다. 코드 읽기로 대체하지 않는다.

```bash
python3 -m http.server 4173 &
node tools/qa.mjs                 # 7개 뷰포트 x 포트폴리오 + 카탈로그 3종
node tools/make_resume_pdf.mjs    # PDF 장수 / 용량 / 텍스트 추출 / 추출 순서
```

`qa.mjs` 검사 항목: 섹션별 렌더 개수, 콘솔 에러 0, 가로 오버플로 0, 본문 대비 4.5:1,
터치 타깃 44px, **이미지 비율 왜곡**, **히어로 제목의 첫 화면 노출**, 카드 펼치기 동작,
카탈로그 카드 126개와 검색 필터. 하나라도 실패하면 exit 1.

`make_resume_pdf.mjs` 검사 항목: 장수 상한(국문 5 · 영문 2), 용량 500KB, 필수 키워드,
**스킬 추출 순서**(2열 레이아웃이면 제목과 항목이 뒤섞여 ATS가 깨진다).

## 배운 것 (다시 밟지 말 것)

- `<img>` 의 `height` 속성은 프레젠테이션 힌트로 남아 `aspect-ratio` 를 무력화한다.
  CSS 에서 `height: auto` 로 눌러야 한다. 개수만 세는 게이트로는 절대 안 잡힌다.
- CSS 필터를 부모와 자식에 동시에 걸면 두 번 뒤집혀 원래대로 돌아온다.
- 이력서 스킬을 2열 그리드로 두면 PDF 텍스트가 "제목1 제목2 항목1 항목2" 로 추출된다.
- 가변폰트는 Chromium PDF 에서 Type3 로 구워져 용량이 5배가 된다. 정적 폰트를 쓴다.
- `:root` 와 같은 이름의 커스텀 속성을 `var()` 로 재선언하면 순환이라 값이 통째로 죽는다.

## 견고성

- three.js CDN 이 죽어도 페이지는 그대로 뜬다 (동적 import + CSS 폴백)
- `prefers-reduced-motion` 이면 3D 를 아예 초기화하지 않는다
- 모바일은 포인트 필드를 끄고 DPR 과 씬 불투명도를 낮춘다
- 탭이 숨겨지면 렌더 루프가 멈춘다
