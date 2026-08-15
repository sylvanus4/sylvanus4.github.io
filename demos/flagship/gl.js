// Minimal WebGL2 renderer for the project scenes.
//
// Written against the browser's own API rather than pulling in a 3D library.
// The scenes here are points and lines with per-vertex colour -- a lattice, a
// set of orbits, a protein backbone, a point cloud. A general-purpose engine
// would bring materials, loaders, and a scene graph that none of this uses,
// and it would have to be fetched, which makes the console stop working on a
// machine that is offline. The whole renderer is one file and no dependency.
//
// Everything a scene supplies is in world units centred on the origin; the
// camera orbits at a distance the scene chooses.

const VERT = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aColor;
layout(location=2) in float aSize;
uniform mat4 uProj;
uniform mat4 uView;
uniform float uTime;
uniform float uPixelRatio;
out vec3 vColor;
out float vDepth;
void main() {
  vec4 world = vec4(aPos, 1.0);
  vec4 eye = uView * world;
  gl_Position = uProj * eye;
  // Points shrink with distance the way real ones do, so depth reads as depth
  // rather than as a size the author picked.
  gl_PointSize = max(1.0, aSize * uPixelRatio * (14.0 / max(0.4, -eye.z)));
  vColor = aColor;
  vDepth = -eye.z;
}`;

const FRAG = `#version 300 es
precision highp float;
in vec3 vColor;
in float vDepth;
uniform float uFogNear;
uniform float uFogFar;
uniform int uRound;
out vec4 outColor;
void main() {
  if (uRound == 1) {
    // Round the sprite and soften its edge, so a dense cloud reads as many
    // points rather than as a field of squares.
    vec2 d = gl_PointCoord - vec2(0.5);
    float r = length(d);
    if (r > 0.5) discard;
    float edge = smoothstep(0.5, 0.34, r);
    float fog = 1.0 - clamp((vDepth - uFogNear) / max(0.001, uFogFar - uFogNear), 0.0, 0.82);
    outColor = vec4(vColor * fog, edge);
    return;
  }
  float fog = 1.0 - clamp((vDepth - uFogNear) / max(0.001, uFogFar - uFogNear), 0.0, 0.82);
  outColor = vec4(vColor * fog, 0.85);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || 'shader compile failed');
  }
  return sh;
}

function perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

function lookAt(eye, center, up) {
  const z = norm(sub(eye, center));
  const x = norm(cross(up, z));
  const y = cross(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ]);
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
function norm(v) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

export class SceneView {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    // preserveDrawingBuffer keeps the frame readable after compositing. It costs a
// little on this page and it is what lets the gate prove the scene actually
// drew something rather than that a canvas exists.
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, preserveDrawingBuffer: true });
    if (!gl) throw new Error('WebGL2 unavailable');
    this.gl = gl;

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) || 'link failed');
    }
    this.prog = prog;
    this.u = {
      proj: gl.getUniformLocation(prog, 'uProj'),
      view: gl.getUniformLocation(prog, 'uView'),
      time: gl.getUniformLocation(prog, 'uTime'),
      ratio: gl.getUniformLocation(prog, 'uPixelRatio'),
      fogNear: gl.getUniformLocation(prog, 'uFogNear'),
      fogFar: gl.getUniformLocation(prog, 'uFogFar'),
      round: gl.getUniformLocation(prog, 'uRound'),
    };

    this.vaoPoints = this._makeVAO();
    this.vaoLines = this._makeVAO();
    this.nPoints = 0;
    this.nLines = 0;

    this.dist = 6;
    this.yaw = 0.6;
    this.pitch = 0.42;
    this.spin = 0.055;
    this.paused = false;
    this._dragging = false;
    this._t0 = performance.now();
    this._raf = null;

    this._bindControls();
  }

  _makeVAO() {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const stride = 7 * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, 24);
    gl.bindVertexArray(null);
    return { vao, buf };
  }

  _bindControls() {
    const c = this.canvas;
    const onDown = (e) => {
      this._dragging = true;
      this._last = pointOf(e);
      c.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e) => {
      if (!this._dragging) return;
      const p = pointOf(e);
      this.yaw -= (p.x - this._last.x) * 0.007;
      this.pitch = Math.max(-1.4, Math.min(1.4, this.pitch + (p.y - this._last.y) * 0.007));
      this._last = p;
    };
    const onUp = () => { this._dragging = false; };
    const pointOf = (e) => ({ x: e.clientX, y: e.clientY });

    c.addEventListener('pointerdown', onDown);
    c.addEventListener('pointermove', onMove);
    c.addEventListener('pointerup', onUp);
    c.addEventListener('pointercancel', onUp);
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.dist = Math.max(1.6, Math.min(26, this.dist * (1 + Math.sign(e.deltaY) * 0.09)));
    }, { passive: false });
  }

  /**
   * Replace the geometry being drawn.
   * @param {{points?: Array, lines?: Array, distance?: number, spin?: number}} scene
   */
  setScene(scene) {
    const gl = this.gl;
    const pts = scene.points || [];
    const lns = scene.lines || [];
    this._upload(this.vaoPoints, pts);
    this._upload(this.vaoLines, lns);
    this.nPoints = pts.length;
    this.nLines = lns.length;
    if (scene.distance) this.dist = scene.distance;
    if (scene.spin !== undefined) this.spin = scene.spin;
    void gl;
  }

  _upload(target, verts) {
    const gl = this.gl;
    const data = new Float32Array(verts.length * 7);
    for (let i = 0; i < verts.length; i++) {
      const v = verts[i];
      data.set([v[0], v[1], v[2], v[3], v[4], v[5], v[6] ?? 3], i * 7);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, target.buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  }

  resize() {
    const c = this.canvas;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.floor(c.clientWidth * ratio));
    const h = Math.max(1, Math.floor(c.clientHeight * ratio));
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    this.ratio = ratio;
  }

  start() {
    if (this._raf) return;
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      this.draw();
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  draw() {
    const gl = this.gl;
    this.resize();
    const t = (performance.now() - this._t0) / 1000;
    // Motion stops when the viewer asked for less of it, and while they are
    // dragging -- a scene that keeps rotating under the cursor fights them.
    if (!this.paused && !this._dragging && !reducedMotion()) this.yaw += this.spin * 0.016;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.disable(gl.DEPTH_TEST);

    const aspect = this.canvas.width / Math.max(1, this.canvas.height);
    const proj = perspective(0.9, aspect, 0.1, 120);
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const eye = [
      this.dist * Math.cos(this.yaw) * cp,
      this.dist * sp,
      this.dist * Math.sin(this.yaw) * cp,
    ];
    const view = lookAt(eye, [0, 0, 0], [0, 1, 0]);

    gl.useProgram(this.prog);
    gl.uniformMatrix4fv(this.u.proj, false, proj);
    gl.uniformMatrix4fv(this.u.view, false, view);
    gl.uniform1f(this.u.time, t);
    gl.uniform1f(this.u.ratio, this.ratio || 1);
    gl.uniform1f(this.u.fogNear, this.dist * 0.45);
    gl.uniform1f(this.u.fogFar, this.dist * 2.3);

    if (this.nLines) {
      gl.uniform1i(this.u.round, 0);
      gl.bindVertexArray(this.vaoLines.vao);
      gl.drawArrays(gl.LINES, 0, this.nLines);
    }
    if (this.nPoints) {
      gl.uniform1i(this.u.round, 1);
      gl.bindVertexArray(this.vaoPoints.vao);
      gl.drawArrays(gl.POINTS, 0, this.nPoints);
    }
    gl.bindVertexArray(null);
  }
}

export function reducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** Parse "#RRGGBB" into linear-ish 0..1 components. */
export function hex(h) {
  const n = parseInt(h.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Deterministic pseudo-random, so a scene looks the same on every visit. */
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
