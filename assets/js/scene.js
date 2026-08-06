/* "The Stack" — 스크롤이 카메라를 레이어 다섯 장 아래로 관통시킨다.
   효과를 여러 개 쌓지 않는다. 이 씬의 아이디어는 하나다: 한 사람이 스택을 뚫고 내려간다.

   성능 가드
   - DPR 상한 1.75, 모바일은 1.35
   - 탭이 숨겨지거나 캔버스가 화면 밖이면 렌더 루프 정지
   - 모바일은 포인트 필드를 끄고 레이어 해상도를 낮춘다
   - prefers-reduced-motion 이면 아예 초기화하지 않는다 (CSS 폴백이 그대로 보인다)
   - WebGL 컨텍스트 생성 실패 시 조용히 폴백
*/

import * as THREE from "three";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = matchMedia("(pointer: coarse)").matches;
const small = matchMedia("(max-width: 820px)").matches;
const LOW = coarse || small;

export function initScene(canvas) {
  if (reduce || !canvas) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !LOW,
      alpha: true,
      powerPreference: "high-performance"
    });
  } catch (e) {
    return null;
  }
  if (!renderer.getContext()) return null;

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, LOW ? 1.35 : 1.75));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0f1a, 0.0125);

  const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 400);

  /* ---- 레이어 색상: 아래로 갈수록 시안에서 바이올렛으로 ---- */
  const palette = [
    new THREE.Color("#7fd8e8"), // L5 제품
    new THREE.Color("#6fc9e6"), // L4 플랫폼
    new THREE.Color("#7bb6ef"), // L3 인프라
    new THREE.Color("#9d9ef2"), // L2 모델
    new THREE.Color("#c08ef0")  // L1 연구
  ];

  const COUNT = palette.length;
  const GAP = 11; // 레이어 간 y 간격
  const TOP = 0;

  const vert = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const frag = /* glsl */ `
    precision highp float;
    uniform float uTime;
    uniform float uActive;   // 0..1  현재 섹션이면 1
    uniform float uNear;     // 0..1  카메라가 가까울수록 1
    uniform vec3  uColor;
    varying vec2 vUv;

    // 미분값 기반 안티에일리어스 그리드
    float gridMask(vec2 uv, float scale) {
      vec2 c = uv * scale;
      vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
      float l = min(g.x, g.y);
      return 1.0 - min(l, 1.0);
    }

    void main() {
      vec2 p = vUv - 0.5;
      float r = length(p) * 2.0;

      float fine  = gridMask(vUv, 44.0) * 0.32;
      float major = gridMask(vUv, 11.0) * 0.62;
      float g = max(fine, major);

      // 중심에서 바깥으로 퍼지는 펄스 한 겹
      float t = fract(uTime * 0.085);
      float ring = smoothstep(0.055, 0.0, abs(r - t)) * (1.0 - t);

      float fade = smoothstep(1.05, 0.12, r);
      float energy = 0.30 + uActive * 0.55 + uNear * 0.35;

      float a = (g * 0.55 + ring * 0.5) * fade * energy;
      if (a < 0.002) discard;

      vec3 col = mix(uColor, vec3(1.0), ring * 0.65);
      gl_FragColor = vec4(col, a);
    }
  `;

  const layers = [];
  const geo = new THREE.PlaneGeometry(120, 120, 1, 1);

  for (let i = 0; i < COUNT; i++) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: i * 3.1 },
        uActive: { value: 0 },
        uNear: { value: 0 },
        uColor: { value: palette[i] }
      }
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = TOP - i * GAP;
    scene.add(mesh);
    layers.push(mesh);
  }

  /* ---- 스택을 관통하는 코어 빔 ---- */
  const beamH = GAP * (COUNT - 1) + 40;
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, beamH, 8, 1, true),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
      `,
      fragmentShader: `
        precision highp float;
        uniform float uTime;
        varying vec2 vUv;
        void main(){
          float pulse = smoothstep(0.035, 0.0, abs(fract(vUv.y * 1.0 - uTime * 0.06) - 0.5));
          float base = 0.06;
          vec3 col = mix(vec3(0.49,0.85,0.93), vec3(0.86,0.95,1.0), pulse);
          gl_FragColor = vec4(col, base + pulse * 0.30);
        }
      `
    })
  );
  beam.position.y = TOP - (beamH / 2) + 20;
  scene.add(beam);

  /* ---- 아주 성긴 포인트 필드. 깊이감만 담당하고 모바일에선 끈다 ---- */
  let dust = null;
  if (!LOW) {
    const N = 700;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 150;
      pos[i * 3 + 1] = TOP + 14 - Math.random() * (GAP * COUNT + 30);
      pos[i * 3 + 2] = (Math.random() - 0.5) * 150;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    dust = new THREE.Points(
      g,
      new THREE.PointsMaterial({
        size: 0.22,
        color: 0x9fd9ec,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      })
    );
    scene.add(dust);
  }

  /* ---- 상태 ---- */
  const state = {
    progress: 0,      // 문서 스크롤 0..1
    target: 0,
    activeIndex: -1,
    mx: 0, my: 0,     // 마우스 시차
    tmx: 0, tmy: 0,
    running: true,
    visible: true
  };

  function onResize() {
    const w = innerWidth, h = innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, LOW ? 1.35 : 1.75));
    renderer.setSize(w, h, false);
  }
  addEventListener("resize", onResize, { passive: true });
  onResize();

  if (!coarse) {
    addEventListener(
      "pointermove",
      (e) => {
        state.tmx = (e.clientX / innerWidth - 0.5) * 2;
        state.tmy = (e.clientY / innerHeight - 0.5) * 2;
      },
      { passive: true }
    );
  }

  document.addEventListener("visibilitychange", () => {
    state.visible = !document.hidden;
  });

  const clock = new THREE.Clock();
  const travel = GAP * (COUNT - 1) + 16;

  function frame() {
    if (!state.running) return;
    requestAnimationFrame(frame);
    if (!state.visible || state.suspended) return;

    const dt = Math.min(clock.getDelta(), 0.05);

    // 스크롤과 마우스는 항상 부드럽게 따라간다
    state.progress += (state.target - state.progress) * Math.min(1, dt * 3.4);
    state.mx += (state.tmx - state.mx) * Math.min(1, dt * 2.6);
    state.my += (state.tmy - state.my) * Math.min(1, dt * 2.6);

    const camY = TOP + 9 - state.progress * travel;
    camera.position.set(state.mx * 4.5, camY, 15 + state.my * 2.4);
    camera.lookAt(state.mx * 1.6, camY - 7.5, 0);

    for (let i = 0; i < COUNT; i++) {
      const u = layers[i].material.uniforms;
      u.uTime.value += dt;
      const dist = Math.abs(layers[i].position.y - camY);
      const near = Math.max(0, 1 - dist / (GAP * 1.6));
      u.uNear.value += (near - u.uNear.value) * Math.min(1, dt * 4);
      const want = state.activeIndex === i ? 1 : 0;
      u.uActive.value += (want - u.uActive.value) * Math.min(1, dt * 3);
      layers[i].rotation.z += dt * 0.014 * (i % 2 ? 1 : -1);
    }

    beam.material.uniforms.uTime.value += dt;
    if (dust) dust.rotation.y += dt * 0.012;

    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  return {
    setProgress(p) {
      state.target = Math.max(0, Math.min(1, p));
    },
    setActiveLayer(i) {
      state.activeIndex = i;
    },
    /* Reversible pause — the render loop keeps its rAF chain but stops drawing.
       `stop()` disposes and cannot be undone, so it is wrong for "a video started
       playing": the scene has to come back when the video ends. */
    setSuspended(on) {
      state.suspended = !!on;
    },
    stop() {
      state.running = false;
      renderer.dispose();
      geo.dispose();
      layers.forEach((l) => l.material.dispose());
    }
  };
}
