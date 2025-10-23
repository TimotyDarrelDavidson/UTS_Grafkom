// BodyParts/Arms/FlygonArm.js

// Arm segment: short tapered cylinder (pivot at shoulder, extending along +Y)
export function generateArmSegment(a0, b0, a1, b1, length, stacks = 24, slices = 24, color = [171/255, 225/255, 135/255]) {
  const vertices = [];
  const faces = [];

  for (let i = 0; i <= stacks; i++) {
    const t = i / stacks;
    const a = a0 + (a1 - a0) * t;   // ellipse X
    const b = b0 + (b1 - b0) * t;   // ellipse Z
    const y = t * length;           // extends along +Y (so we can easily rotate down)

    for (let j = 0; j <= slices; j++) {
      const u = (2 * Math.PI * j) / slices;
      const x = a * Math.cos(u);
      const z = b * Math.sin(u);
      vertices.push(x, y, z, color[0], color[1], color[2]);
    }
  }

  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < slices; j++) {
      const first = i * (slices + 1) + j;
      const second = first + (slices + 1);
      faces.push(first, first + 1, second + 1);
      faces.push(first, second + 1, second);
    }
  }

  return { vertices, faces };
}

// Hand (simple ellipsoid, base for claws)
export function generateHandEllipsoid(ax, by, cz, stacks = 14, slices = 20, color = [171/255, 225/255, 135/255]) {
  const vertices = [];
  const faces = [];

  for (let i = 0; i <= stacks; i++) {
    const v = (i / stacks) * Math.PI;
    const y = by * Math.cos(v);
    const r = Math.sin(v);
    for (let j = 0; j <= slices; j++) {
      const u = (2 * Math.PI * j) / slices;
      const x = ax * r * Math.cos(u);
      const z = cz * r * Math.sin(u);
      vertices.push(x, y, z, color[0], color[1], color[2]);
    }
  }

  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < slices; j++) {
      const first = i * (slices + 1) + j;
      const second = first + (slices + 1);
      faces.push(first, first + 1, second + 1);
      faces.push(first, second + 1, second);
    }
  }

  return { vertices, faces };
}

// Kerucut murni (quadric) untuk claw
// - Oriented di sumbu Y
// - Pusat di origin: base di y = -length/2, tip di y = +length/2
// - rTip default 0 => kerucut tajam
export function generateClaw(
  length,
  rBase,
  stacks = 12,
  slices = 24,
  color = [1, 1, 1],
  { rTip = 0, capBase = true } = {}
) {
  const vertices = []; // [x, y, z, r, g, b]
  const faces = [];

  const y0 = -length / 2;
  const dy = length / stacks;

  // --- ring (stacks+1) dengan radius linear (quadric cone) ---
  for (let i = 0; i <= stacks; i++) {
    const t = i / stacks;                    // 0..1
    const y = y0 + i * dy;                   // posisi Y
    const r = rBase * (1 - t) + rTip * t;    // radius linear dari base -> tip

    for (let j = 0; j <= slices; j++) {
      const ang = (j / slices) * Math.PI * 2;
      const x = r * Math.cos(ang);
      const z = r * Math.sin(ang);
      vertices.push(x, y, z, color[0], color[1], color[2]);
    }
  }

  const ring = slices + 1;

  // --- sisi selimut kerucut ---
  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < slices; j++) {
      const a = i * ring + j;
      const b = a + 1;
      const c = a + ring;
      const d = c + 1;
      // dua segitiga per quad
      faces.push(a, b, d);
      faces.push(a, d, c);
    }
  }

  // --- tutup base (opsional) ---
  if (capBase && rBase > 0) {
    // tambahkan 1 vertex pusat base
    const baseCenterIndex = vertices.length / 6;
    vertices.push(0, y0, 0, color[0], color[1], color[2]);

    // fan ke ring dasar (i = 0)
    for (let j = 0; j < slices; j++) {
      const a = 0 * ring + j;       // titik di ring dasar
      const b = 0 * ring + j + 1;
      // orientasi muka disesuaikan agar normal menghadap keluar
      faces.push(baseCenterIndex, b, a);
    }
  }

  return { vertices, faces };
}

