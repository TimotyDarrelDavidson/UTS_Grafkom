// BodyParts/Body/FlygonWing.js
export function generateFlygonWing(size = 1, options = {}) {
  const topColor    = options.topColor    || [181/255, 235/255, 145/255];
  const midColor    = options.midColor    || [0.8, 0.2, 0.2];
  const bottomColor = options.bottomColor || [181/255, 235/255, 145/255];
  const twoSided    = !!options.twoSided;
  const borderWidth = options.borderWidth || 0.2;
  const zGap        = options.zGap || 0.015;
  const redScale    = options.redScale || 1.15; // <-- NEW: expand red membrane

  const vertices = [];
  const faces = [];

  function addWingLayer(color, zOffset, scale = 1.0) {
    const base = vertices.length / 6;

    // inner diamond
    const innerVerts = [
      [0, 0, zOffset],
      [0, size * (0.5 - borderWidth) * scale, zOffset],
      [size * (0.5 - borderWidth) * scale, 0, zOffset],
      [0, -size * (2 - borderWidth * 2) * scale, zOffset],
      [-size * (0.5 - borderWidth) * scale, 0, zOffset],
    ];

    // outer diamond
    const outerVerts = [
      [0, size / 2 * scale, zOffset],
      [size * 0.5 * scale, 0, zOffset],
      [0, -size * 2 * scale, zOffset],
      [-size * 0.5 * scale, 0, zOffset],
    ];

    for (let i = 0; i < innerVerts.length; i++) {
      const [x, y, z] = innerVerts[i];
      vertices.push(x, y, z, color[0], color[1], color[2]);
    }
    for (let i = 0; i < outerVerts.length; i++) {
      const [x, y, z] = outerVerts[i];
      vertices.push(x, y, z, color[0], color[1], color[2]);
    }

    faces.push(
      base + 0, base + 1, base + 2,
      base + 0, base + 2, base + 3,
      base + 0, base + 3, base + 4,
      base + 0, base + 4, base + 1,

      base + 1, base + 5, base + 6,
      base + 1, base + 6, base + 2,
      base + 2, base + 6, base + 7,
      base + 2, base + 7, base + 3,
      base + 3, base + 7, base + 8,
      base + 3, base + 8, base + 4,
      base + 4, base + 8, base + 5,
      base + 4, base + 5, base + 1
    );
  }

  // top + bottom stay same size, middle (red) expanded
  addWingLayer(topColor, +zGap, 1.0);
  addWingLayer(midColor, 0, redScale);
  addWingLayer(bottomColor, -zGap, 1.0);

  if (twoSided) {
    const baseCount = vertices.length / 6;
    for (let i = 0; i < baseCount; i++) {
      const k = i * 6;
      vertices.push(
        vertices[k], vertices[k + 1], -vertices[k + 2],
        vertices[k + 3], vertices[k + 4], vertices[k + 5]
      );
    }
    const orig = faces.length;
    for (let i = 0; i < orig; i += 3) {
      faces.push(
        faces[i] + baseCount,
        faces[i + 2] + baseCount,
        faces[i + 1] + baseCount
      );
    }
  }

  return { vertices, faces };
}
