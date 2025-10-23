export function generateFlygonEyes(ax, by, cz, stacks = 14, slices = 20,
  color = [1, 0, 0]) {
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