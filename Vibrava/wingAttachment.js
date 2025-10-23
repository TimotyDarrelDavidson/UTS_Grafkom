export function generateVibravaWingAttachment(
  a = 1.0,
  b = 1.0,
  c = 1.5,
  slices = 32,
  stacks = 32,
  color = [0.9, 0.8, 0.4]
) {
  const vertices = [];
  const faces = [];

  // Hyperboloid of two sheets (bottom only):
  //  -x^2/a^2 - y^2/b^2 + z^2/c^2 = 1
  //  → z = -c * cosh(u), x = a * sinh(u) * cos(v), y = b * sinh(u) * sin(v)
  //  u ∈ [0, uMax], v ∈ [0, 2π]

  const uMax = 1.2; // controls how "open" the surface is

  for (let i = 0; i <= stacks; i++) {
    const u = (i / stacks) * uMax;
    for (let j = 0; j <= slices; j++) {
      const v = (j / slices) * 2 * Math.PI;

      const x = a * Math.sinh(u) * Math.cos(v);
      const y = b * Math.sinh(u) * Math.sin(v);
      const z = -c * Math.cosh(u); // bottom sheet only (negative z)

      vertices.push(x, y, z, color[0], color[1], color[2]);
    }
  }

  // connect faces
  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < slices; j++) {
      const p1 = i * (slices + 1) + j;
      const p2 = p1 + (slices + 1);
      const p3 = p1 + 1;
      const p4 = p2 + 1;

      faces.push(p1, p2, p3);
      faces.push(p3, p2, p4);
    }
  }

  return { vertices, faces };
}
