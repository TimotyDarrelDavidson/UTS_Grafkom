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

// Claw: small cone-like spike
// Rounded claw (ellipsoid), oriented along local +Y
export function generateClaw(length, radius, stacks = 12, slices = 20,
  color = [255/255, 255/255, 255/255]) {

  const ax = radius * 0.85;        // width (X)
  const by = length * 0.5;         // half-length (Y)
  const cz = radius;               // depth (Z)

  const vertices = [];
  const faces = [];

  for (let i = 0; i <= stacks; i++) {
    const v = (i / stacks) * Math.PI; // 0..π
    const y = by * Math.cos(v);       // -by..by
    const r = Math.sin(v);            // 0..1..0
    for (let j = 0; j <= slices; j++) {
      const u = (2 * Math.PI * j) / slices;
      const x = ax * r * Math.cos(u);
      const z = cz * r * Math.sin(u);
      vertices.push(x, y, z, color[0], color[1], color[2]);
    }
  }
  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < slices; j++) {
      const first  = i * (slices + 1) + j;
      const second = first + (slices + 1);
      faces.push(first, first + 1, second + 1);
      faces.push(first, second + 1, second);
    }
  }
  return { vertices, faces };
}

