// mata.js — minimal ellipsoid generator
export function generateMata(radius = 1.0, stacks = 20, slices = 20, color = [0., 100/255, 0.]) {
  const vertices = [];
  const faces = [];

  const sx = radius * 1.0;   // X axis
  const sy = radius * 1;  // Y axis (slightly squashed)
  const sz = radius * 0.8;   // Z axis (slightly elongated)

  for (let i = 0; i <= stacks; i++) {
    const theta = (i / stacks) * Math.PI - Math.PI / 2;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    for (let j = 0; j <= slices; j++) {
      const phi = (j / slices) * 2 * Math.PI;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);

      const x = sx * cosT * cosP;
      const y = sy * cosT * sinP;
      const z = sz * sinT;

      vertices.push(x, y, z, ...color);
    }
  }

  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < slices; j++) {
      const a = i * (slices + 1) + j;
      const b = a + 1;
      const c = a + (slices + 1);
      const d = c + 1;
      faces.push(a, b, d, a, d, c);
    }
  }

  return { vertices, faces };
}
