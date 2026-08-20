# data/ — 조회표

한 파일이 한 축이다. 형태는 `validate_demo_data.py` 가 판정한다:

    id · product{ko,en} · howto{ko,en} · controls[] · outputs[] · runs[] · verdict{ko,en} · provenance{backend,command}

- `controls[]` = `{key, label{ko,en}, type:"select", default_index, options:[{value,label{ko,en}}]}`
- `runs[]` = `{in:{<control key>: value, ...}, out:{<output key>: number, ...}}` — **조합을 전부 채운다**
- `verdict` 는 원본 실험 문서를 읽고 쓴다. 조회표만 옮기고 서사를 새로 지으면 뒤집힌다.
- 사내 식별자·회사 제품명 금지. 산문에 em/en 대시 금지.

⛔ 손으로 쓰지 마라. 원본 산출물(로그·JSON·CSV)에서 빌더 스크립트가 굽는다.
