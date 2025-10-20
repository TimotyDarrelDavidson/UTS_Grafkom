// BodyParts/Tail/FlygonTailFins.js
export function generateFlygonTailFins(size = 1, options = {}) {
  const centerColor = options.centerColor || [0.55, 0.98, 0.55];
  const midColor = options.midColor || [0.2, 0.8, 0.2];
  const edgeColor = options.edgeColor || [1.0, 0.1, 0.1];

  const twoSided = !!options.twoSided;
  const borderWidth = options.borderWidth ?? 0.22;
  const spreadDeg = options.spreadDeg ?? 30;
  const zEps = options.zEps ?? 0.0005;
  const sideSeparation = options.sideSeparation ?? size * 0.14; // NEW: lateral shift of side fins
  const stackZGap = options.stackZGap ?? 0.002; // NEW: z layering between fins

  const vertices = [];
  const faces = [];
  const toRad = (d) => (d * Math.PI) / 180;

  function rot2(x, y, a) {
    const c = Math.cos(a),
      s = Math.sin(a);
    return [x * c - y * s, x * s + y * c];
  }
  function pushV(x, y, z, c) {
    vertices.push(x, y, z, c[0], c[1], c[2]);
  }

  function addSingleFin(angleRad, shiftX = 0, shiftY = 0, zStack = 0) {
    const base = vertices.length / 6;

    const innerVerts = [
      [0, 0, zEps + zStack],
      [0, size * (0.5 - borderWidth), zEps + zStack],
      [size * (0.5 - borderWidth), 0, zEps + zStack],
      [0, -size * (2 - borderWidth * 2), zEps + zStack],
      [-size * (0.5 - borderWidth), 0, zEps + zStack],
    ];
    const innerCols = [centerColor, midColor, midColor, midColor, midColor];

    const outerVerts = [
      [0, size / 2, -zEps + zStack],
      [size * 0.5, 0, -zEps + zStack],
      [0, -size * 2, -zEps + zStack],
      [-size * 0.5, 0, -zEps + zStack],
    ];

    // rotate + translate (local shift rotated with the fin)
    const [sx, sy] = rot2(shiftX, shiftY, angleRad);

    for (let i = 0; i < innerVerts.length; i++) {
      const [x, y, z] = innerVerts[i];
      const [xr, yr] = rot2(x, y, angleRad);
      pushV(xr + sx, yr + sy, z, innerCols[i]);
    }
    for (let i = 0; i < outerVerts.length; i++) {
      const [x, y, z] = outerVerts[i];
      const [xr, yr] = rot2(x, y, angleRad);
      pushV(xr + sx, yr + sy, z, edgeColor);
    }

    // faces (same pattern)
    faces.push(
      base + 0,
      base + 1,
      base + 2,
      base + 0,
      base + 2,
      base + 3,
      base + 0,
      base + 3,
      base + 4,
      base + 0,
      base + 4,
      base + 1,

      base + 1,
      base + 5,
      base + 6,
      base + 1,
      base + 6,
      base + 2,

      base + 2,
      base + 6,
      base + 7,
      base + 2,
      base + 7,
      base + 3,

      base + 3,
      base + 7,
      base + 8,
      base + 3,
      base + 8,
      base + 4,

      base + 4,
      base + 8,
      base + 5,
      base + 4,
      base + 5,
      base + 1
    );
  }

  // Center fin on the middle layer
  addSingleFin(0, 0, 0, 0);

  // Side fins: fan with spread, push sideways, and place on ± z layers
  addSingleFin(+toRad(spreadDeg), +sideSeparation, 0, +stackZGap);
  addSingleFin(-toRad(spreadDeg), -sideSeparation, 0, -stackZGap);

  if (twoSided) {
    const baseCount = vertices.length / 6;
    const backGap = 0.0006;

    for (let i = 0; i < baseCount; i++) {
      const k = i * 6;
      const z = vertices[k + 2];
      const sign = z === 0 ? 1 : z > 0 ? 1 : -1;
      vertices.push(
        vertices[k], // x
        vertices[k + 1], // y
        -z - sign * backGap, // mirrored Z, nudged opposite side
        vertices[k + 3], // r
        vertices[k + 4], // g
        vertices[k + 5] // b
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
