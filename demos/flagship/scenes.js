// One scene per project.
//
// These are not decoration picked to look technical. Each scene draws the
// thing that repository actually found, so the shape carries the finding: two
// identical lattices because two architectures synthesize to the same netlist,
// a cluster at zero separation because a third of the screened pairs are the
// same object twice, a power column that is mostly idle because at peak load
// most of the draw is. A viewer who never opens the JSON should still come
// away with the right impression, and a viewer who does should find the
// picture and the numbers agreeing.
//
// Geometry is seeded, so a scene looks the same on every visit and a change in
// it means a change in the data rather than a reroll.

import { hex, rng } from './gl.js';

const TAU = Math.PI * 2;

function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
const DIM = [0.24, 0.29, 0.42];
const WARN = hex('#F87171');
const OK = hex('#4ADE80');

function pt(p, c, size) {
  return [p[0], p[1], p[2], c[0], c[1], c[2], size];
}
function seg(a, b, c, w = 1) {
  return [pt(a, c, w), pt(b, c, w)];
}

/** SiliconPilot — two architectures, one netlist. */
function lattice(accent) {
  const points = [], lines = [];
  const A = hex(accent);
  const rand = rng(11);
  // Two stacks, deliberately congruent: the measurement found identical
  // netlists at every tested point, so drawing them differently would be
  // drawing something that is not there.
  for (const side of [-1, 1]) {
    const ox = side * 1.5;
    for (let level = 0; level < 6; level++) {
      const n = 4 + (level % 2);
      for (let i = 0; i < n; i++) {
        const x = ox + (i - (n - 1) / 2) * 0.42;
        const y = level * 0.46 - 1.3;
        const z = ((i % 2) - 0.5) * 0.42;
        const lit = 0.55 + 0.45 * rand();
        points.push(pt([x, y, z], mix(DIM, A, lit), 5));
        if (level > 0) {
          lines.push(...seg([x, y, z], [x + (rand() - 0.5) * 0.3, y - 0.46, z], mix(DIM, A, 0.3)));
        }
      }
    }
  }
  // The bridge between the two stacks is the point: they are the same object.
  for (let i = 0; i < 6; i++) {
    const y = i * 0.46 - 1.3;
    lines.push(...seg([-1.5, y, 0], [1.5, y, 0], mix(DIM, A, 0.22)));
  }
  return { points, lines, distance: 7.4, spin: 0.05, caption: 'Two gate stacks, drawn congruent because synthesis makes them so. The rungs between them are the point.' };
}

/** OrbitGuard — a third of the screened pairs are one object twice. */
function orbits(accent) {
  const points = [], lines = [];
  const A = hex(accent);
  const rand = rng(23);
  for (let shell = 0; shell < 3; shell++) {
    const r = 1.5 + shell * 0.72;
    const tilt = 0.24 + shell * 0.36;
    const prev = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * TAU;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const y = Math.sin(a) * Math.sin(tilt) * r * 0.42;
      const p = [x, y * 0.6, z];
      if (prev.length) lines.push(...seg(prev, p, mix(DIM, A, 0.26)));
      prev.splice(0, 3, ...p);
      if (i % 12 === 0) points.push(pt(p, mix(DIM, A, 0.75), 4));
    }
  }
  // The docked cluster: twelve objects whose element sets are so close the
  // screener reports 0.000 km between them.
  //
  // Drawn as one marker inside a ring rather than twelve coincident points.
  // Additive blending sums stacked points, so twelve reds became white and
  // the picture said something the caption did not. A legend and an image
  // that disagree are worse than either alone.
  const knot = [1.5, 0.02, 0];
  points.push(pt(knot, WARN, 13));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    points.push(pt([
      knot[0] + Math.cos(a) * 0.17,
      knot[1] + Math.sin(a) * 0.17 * 0.5,
      knot[2] + Math.sin(a) * 0.17,
    ], mix(DIM, WARN, 0.8), 4));
  }
  void rand;
  // The genuine encounter, further out and far quieter than the false ones.
  points.push(pt([-1.42, 0.34, 1.1], OK, 11));
  return { points, lines, distance: 8.2, spin: 0.07, caption: 'Three shells. The red knot is twelve objects the catalogue reports at zero separation; green is the one real encounter.' };
}

/** Embodied Lab — one environment separates the policies, the other cannot. */
function workspace(accent) {
  const points = [], lines = [];
  const A = hex(accent);
  const rand = rng(37);
  // Reach volume.
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * TAU;
    lines.push(...seg(
      [Math.cos(a) * 1.7, -1.15, Math.sin(a) * 1.7],
      [Math.cos(a) * 0.42, 1.25, Math.sin(a) * 0.42],
      mix(DIM, A, 0.16),
    ));
  }
  // Left cloud: the physics environment, where the two policies land apart.
  for (let i = 0; i < 200; i++) {
    const ok = i < 125;
    points.push(pt([
      -1.25 + (rand() - 0.5) * 1.15,
      (ok ? 0.55 : -0.5) + (rand() - 0.5) * 0.6,
      (rand() - 0.5) * 1.15,
    ], ok ? mix(DIM, OK, 0.85) : mix(DIM, WARN, 0.7), ok ? 4 : 3));
  }
  // Right cloud: the lite environment, where both collapse to the same place.
  for (let i = 0; i < 200; i++) {
    points.push(pt([
      1.25 + (rand() - 0.5) * 1.15,
      -0.5 + (rand() - 0.5) * 0.45,
      (rand() - 0.5) * 1.15,
    ], mix(DIM, WARN, 0.55), 3));
  }
  return { points, lines, distance: 7.6, spin: 0.05, caption: 'Left, the physics environment separates the two policies. Right, the lite one collapses them into one failure.' };
}

/** BioProof — confidence coloured along the backbone, and where it fails. */
function ribbon(accent) {
  const points = [], lines = [];
  const A = hex(accent);
  let prev = null;
  const N = 240;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    // A helix that loses its fold two thirds of the way through, which is
    // what a single-sequence prediction did on the disulfide-rich targets.
    const broken = t > 0.66;
    const r = broken ? 0.5 + (t - 0.66) * 3.2 : 0.82;
    const a = t * TAU * 6;
    const wob = broken ? Math.sin(t * 61) * 0.42 : 0;
    const p = [Math.cos(a) * r + wob, (t - 0.5) * 3.0, Math.sin(a) * r + wob * 0.6];
    // Confidence stays high where it should not: it drops by half while the
    // error grows by an order of magnitude.
    const conf = broken ? 0.5 : 0.95;
    const c = broken ? mix(WARN, hex(accent), conf * 0.35) : mix(DIM, A, conf);
    points.push(pt(p, c, broken ? 5 : 4));
    if (prev) lines.push(...seg(prev, p, mix(DIM, c, 0.5)));
    prev = p;
  }
  return { points, lines, distance: 7.0, spin: 0.06, caption: 'A backbone that loses its fold two thirds along. Colour is the model\'s own confidence, which barely moves.' };
}

/** GridMind — a measured sky, where shortfall arrives in blocks. */
function surface(accent) {
  const points = [], lines = [];
  const A = hex(accent);
  const rand = rng(53);
  const W = 46, D = 26;
  for (let i = 0; i < W; i++) {
    for (let j = 0; j < D; j++) {
      const x = (i / (W - 1) - 0.5) * 5.4;
      const z = (j / (D - 1) - 0.5) * 3.0;
      const day = Math.max(0, Math.sin((i / W) * Math.PI * 5.2));
      // A single contiguous overcast band, not scattered dropouts. The
      // difference between those two is the whole finding.
      const overcast = i > 15 && i < 26;
      const level = overcast ? day * 0.16 : day * (0.72 + rand() * 0.28);
      const y = level * 1.5 - 0.6;
      points.push(pt([x, y, z], overcast ? mix(DIM, WARN, 0.5) : mix(DIM, A, 0.35 + level * 0.65), 3));
      if (j === 0 && i > 0) {
        lines.push(...seg([x, y, z - 0.05], [x, -0.62, z - 0.05], mix(DIM, A, 0.1)));
      }
    }
  }
  return { points, lines, distance: 7.2, spin: 0.04, caption: 'A season of measured irradiance. The red band is one contiguous overcast run, not scattered dropouts.' };
}

/** VaultAI — a corpus that stays put, and the few spans worth flagging. */
function vault(accent) {
  const points = [], lines = [];
  const A = hex(accent);
  const rand = rng(67);
  const flags = [];
  // Documents as stacked sheets inside a closed boundary.
  for (let d = 0; d < 9; d++) {
    const y = d * 0.28 - 1.15;
    const w = 1.05, h = 0.7;
    const corners = [[-w, y, -h], [w, y, -h], [w, y, h], [-w, y, h]];
    for (let i = 0; i < 4; i++) {
      lines.push(...seg(corners[i], corners[(i + 1) % 4], mix(DIM, A, 0.3)));
    }
    for (let i = 0; i < 30; i++) {
      // Exactly five flags across the corpus, because the run found five.
      const flagged = flags.length < 5 && rand() < 0.02 && (flags.push(1), true);
      points.push(pt([
        (rand() - 0.5) * w * 1.85,
        y + 0.02,
        (rand() - 0.5) * h * 1.85,
      ], flagged ? WARN : mix(DIM, A, 0.5), flagged ? 7 : 2.5));
    }
  }
  // The boundary that nothing crosses. It is drawn closed: four bare posts read
  // as lines leaving the stack, which is the opposite of what they mean.
  const bx = 1.5, bz = 1.1;
  for (const sy of [-1.4, 1.4]) {
    const c = [[-bx, sy, -bz], [bx, sy, -bz], [bx, sy, bz], [-bx, sy, bz]];
    for (let i = 0; i < 4; i++) lines.push(...seg(c[i], c[(i + 1) % 4], mix(DIM, A, 0.26)));
  }
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      lines.push(...seg([sx * bx, -1.4, sz * bz], [sx * bx, 1.4, sz * bz], mix(DIM, A, 0.22)));
    }
  }
  return { points, lines, distance: 6.6, spin: 0.05, caption: 'Nine documents inside a boundary nothing crosses. Red marks a span the disclosure gate flagged.' };
}

/** BlackBox — a recorded run, and the branch replay cannot see. */
function dag(accent) {
  const points = [], lines = [];
  // Deliberately NOT the project accent: BlackBox's accent is a red, and WARN
  // is a red, so drawing the recorded run in the accent made the whole graph
  // one colour and erased the distinction the caption rests on.
  const A = [0.62, 0.72, 0.92];
  const nodes = [];
  for (let i = 0; i < 7; i++) {
    const p = [(i - 3) * 0.62, Math.sin(i * 1.1) * 0.32, Math.cos(i * 0.8) * 0.3];
    nodes.push(p);
    points.push(pt(p, mix(DIM, A, 0.9), 8));
    if (i > 0) lines.push(...seg(nodes[i - 1], p, mix(DIM, A, 0.62), 1.6));
  }
  // The fork: same inputs, reordered. Replay reproduces the recorded order
  // and so never takes this path, which is exactly why it reports clean.
  let prev = nodes[3];
  for (let i = 0; i < 4; i++) {
    const p = [prev[0] + 0.5, prev[1] - 0.42, prev[2] + 0.34];
    points.push(pt(p, WARN, 7));
    lines.push(...seg(prev, p, mix(DIM, WARN, 0.5)));
    prev = p;
  }
  return { points, lines, distance: 6.2, spin: 0.06, caption: 'A recorded run and the branch a reordering takes. Replay follows the recorded order and never walks the red path.' };
}

/** Forge — a frontier, and the four-bit points that a single row collapses. */
function pareto(accent) {
  const points = [], lines = [];
  const A = hex(accent);
  const rand = rng(83);
  for (let i = 0; i < 320; i++) {
    const x = rand() * 2.8 - 1.4;
    const z = rand() * 2.4 - 1.2;
    const y = -0.9 + (1 - Math.hypot(x / 1.4, z / 1.2)) * 1.5 + (rand() - 0.5) * 0.35;
    const onFront = y > 0.34;
    points.push(pt([x, y, z], onFront ? mix(DIM, A, 0.95) : mix(DIM, A, 0.24), onFront ? 5 : 2.5));
  }
  // Two four-bit formats that a single int4 row would place on one point.
  const w4 = [-0.42, 0.62, 0.2];
  const nv = [0.18, 0.78, -0.16];
  points.push(pt(w4, WARN, 11), pt(nv, OK, 11));
  lines.push(...seg(w4, nv, mix(WARN, OK, 0.5), 2));
  return { points, lines, distance: 6.4, spin: 0.05, caption: 'A frontier of candidates. The two large points are both four-bit formats that one table row would merge.' };
}

/** Helios — a fleet whose draw is mostly idle even at peak. */
function fleet(accent) {
  const points = [], lines = [];
  const A = hex(accent);
  // Eight devices, each a column: the tall dim base is idle draw, the short
  // bright cap is the part the work is responsible for. 247.8 W of 388 W.
  const IDLE_FRAC = 247.8 / 388.4;
  for (let g = 0; g < 8; g++) {
    const x = (g % 4 - 1.5) * 0.86;
    const z = (Math.floor(g / 4) - 0.5) * 1.15;
    const total = 2.0;
    const idleTop = -1.0 + total * IDLE_FRAC;
    // Columns are built from lines, not stacks of points. Additive points
    // bloom, and a bloomed bright cap made the smaller active share look
    // like the larger one -- the opposite of the finding. Lines keep the
    // proportion on screen equal to the proportion in the measurement.
    // The idle part has to be clearly VISIBLE, not merely present: the finding
    // is that it is the larger share. A faint base next to a bright cap draws
    // the eye to the smaller number again, which is how the first version of
    // this scene managed to say the opposite of the measurement. So both parts
    // are drawn as a solid bar and the roles are separated by brightness with
    // a wide gap, not by presence.
    for (let k = 0; k < 7; k++) {
      const dx = (k - 3) * 0.03;
      lines.push(...seg([x + dx, -1.0, z], [x + dx, idleTop, z], mix(DIM, A, 0.22), 2.2));
      lines.push(...seg([x + dx, idleTop + 0.03, z], [x + dx, 1.0, z], mix(DIM, A, 1.0), 2.2));
    }
    // A tick across the column marks where the split sits, so the proportion is
    // read off a line rather than guessed from a gradient.
    lines.push(...seg([x - 0.14, idleTop, z], [x + 0.14, idleTop, z], [1, 1, 1], 1.6));
  }
  return { points, lines, distance: 6.8, spin: 0.05, caption: 'Eight devices. The dim lower column is idle draw; the bright cap is the part the work causes.' };
}

/** OmniIndex — a true cluster, and an impostor close enough to be returned. */
function constellation(accent) {
  const points = [], lines = [];
  const A = hex(accent);
  const rand = rng(97);
  const centres = [];
  for (let c = 0; c < 5; c++) {
    const a = (c / 5) * TAU;
    const centre = [Math.cos(a) * 1.25, Math.sin(a * 1.7) * 0.5, Math.sin(a) * 1.25];
    centres.push(centre);
    for (let i = 0; i < 44; i++) {
      points.push(pt([
        centre[0] + (rand() - 0.5) * 0.5,
        centre[1] + (rand() - 0.5) * 0.5,
        centre[2] + (rand() - 0.5) * 0.5,
      ], mix(DIM, A, 0.45 + rand() * 0.5), 3));
    }
  }
  // A query that belongs to nothing here, sitting close enough to the first
  // cluster that a nearest-neighbour search returns it anyway.
  const impostor = [centres[0][0] + 0.52, centres[0][1] + 0.3, centres[0][2] + 0.42];
  points.push(pt(impostor, WARN, 11));
  lines.push(...seg(impostor, centres[0], mix(DIM, WARN, 0.7), 2));
  return { points, lines, distance: 6.6, spin: 0.06, caption: 'Five clusters of hashes. The red point belongs to none of them and is still the nearest neighbour to one.' };
}

const SCENES = {
  lattice, orbits, workspace, ribbon, surface,
  vault, dag, pareto, fleet, constellation,
};

/**
 * Build the geometry for one project.
 * @param {string} name scene id from the manifest
 * @param {string} accent project accent colour
 */
export function buildScene(name, accent) {
  const make = SCENES[name] || constellation;
  return make(accent);
}
