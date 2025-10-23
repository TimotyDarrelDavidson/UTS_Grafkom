// horn.js — make a cone, then bend it (cylindrical bend)
// Returns { vertices, faces } with layout [x,y,z, r,g,b]
export function generateCurvedCone({
  length = 2.0,
  baseRadius = 0.25,
  tipRadius = 0.03,
  stacks = 36,
  slices = 24,
  bendAngle = Math.PI / 3, // total bend (radians). 0 = straight
  bendAxis = 'y',          // 'y' => bend in XZ plane (curves up/down). 'z' => bend in XY.
  baseColor = [0.70, 0.62, 0.50],
  tipColor  = [0.95, 0.92, 0.85],
  capBase = true,
  capTip  = false
} = {}) {
  const vertices = [];
  const faces = [];

  const ringCount = stacks + 1;
  const sliceCount = slices + 1; // duplicate seam

  // 1) Build a straight, X-aligned tapered cone (base at x=0, tip at x=length)
  for (let i = 0; i < ringCount; i++) {
    const t = i / stacks;                       // 0..1 along length
    const x = t * length;
    const r = (1 - t) * baseRadius + t * tipRadius;
    const col = [
      (1 - t) * baseColor[0] + t * tipColor[0],
      (1 - t) * baseColor[1] + t * tipColor[1],
      (1 - t) * baseColor[2] + t * tipColor[2]
    ];

    for (let j = 0; j < sliceCount; j++) {
      const a = (j / slices) * Math.PI * 2;
      const y = r * Math.cos(a);
      const z = r * Math.sin(a);
      vertices.push(x, y, z, col[0], col[1], col[2]);
    }
  }

  // 2) Build faces between rings (before bending; indices remain valid after)
  const stride = sliceCount;
  for (let i = 0; i < stacks; i++) {
    const row0 = i * stride;
    const row1 = (i + 1) * stride;
    for (let j = 0; j < slices; j++) {
      const a = row0 + j;
      const b = row0 + j + 1;
      const c = row1 + j;
      const d = row1 + j + 1;
      faces.push(a, b, d, a, d, c);
    }
  }

  // Optional caps
  if (capBase) {
    const baseCenterIndex = vertices.length / 6;
    // base center at x=0
    vertices.push(0, 0, 0, baseColor[0], baseColor[1], baseColor[2]);
    for (let j = 0; j < slices; j++) {
      const a = j;
      const b = j + 1;
      faces.push(baseCenterIndex, b, a);
    }
  }
  if (capTip) {
    const tipCenterIndex = vertices.length / 6;
    // tip center at x=length
    vertices.push(length, 0, 0, tipColor[0], tipColor[1], tipColor[2]);
    const tipRow = stacks * stride;
    for (let j = 0; j < slices; j++) {
      const a = tipRow + j;
      const b = tipRow + j + 1;
      faces.push(tipCenterIndex, a, b);
    }
  }

  // 3) Bend in-place: cylindrical bend around chosen axis
  //    We bend along X (length axis). For s=x/R, new coords for bend around Y:
  //      x' =  R * sin(s),  z' =  R * (1 - cos(s)),  y stays
  //    For bend around Z (curves in XY):  x' = R * sin(s),  y' = R * (1 - cos(s)),  z stays
  if (Math.abs(bendAngle) > 1e-6) {
    const R = length / bendAngle; // bend radius
    for (let vi = 0; vi < vertices.length; vi += 6) {
      const x = vertices[vi + 0];
      const y = vertices[vi + 1];
      const z = vertices[vi + 2];
      const s = x / R;

      if (bendAxis === 'z') {
        // curve in XY plane (around Z)
        const xp = R * Math.sin(s);
        const yp = y + (R * (1.0 - Math.cos(s)));
        vertices[vi + 0] = xp;
        vertices[vi + 1] = yp;
        // z unchanged
      } else {
        // default: bend around Y (curve in XZ plane)
        const xp = R * Math.sin(s);
        const zp = z + (R * (1.0 - Math.cos(s)));
        vertices[vi + 0] = xp;
        vertices[vi + 2] = zp;
        // y unchanged
      }
    }
  }

  return { vertices, faces };
}
