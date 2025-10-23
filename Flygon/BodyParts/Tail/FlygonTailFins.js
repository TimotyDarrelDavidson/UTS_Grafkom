// BodyParts/Tail/FlygonTailFins.js
export function generateFlygonTailFins(size = 1, options = {}) {
  // --- colors to mirror the wing ---
  const centerColor = options.centerColor || [0.6, 1.0, 0.6]; // light green
  const midColor = options.midColor || [0.4, 0.9, 0.4]; // medium green
  const edgeColor = options.edgeColor || [0.8, 0.2, 0.2]; // red border

  const twoSided = !!options.twoSided;
  const borderWidth = options.borderWidth ?? 0.3;
  const spreadDeg = options.spreadDeg ?? 25;
  const sideSeparation = options.sideSeparation ?? size * 0.3;
  const zEps = 0.02;

  const toRad = (d) => (d * Math.PI) / 180;

  const vertices = [];
  const faces = [];

  function rot2(x, y, a) {
    const c = Math.cos(a),
      s = Math.sin(a);
    return [x * c - y * s, x * s + y * c];
  }
  
  function pushV(x, y, z, c) {
    vertices.push(x, y, z, c[0], c[1], c[2]);
  }

  function addSingleFin(
    angleRad,
    shiftX = 0,
    shiftY = 0,
    zStack = 0,
    col = { center: centerColor, inner: midColor, edge: edgeColor },
    scale = 1.0
  ) {
    // Diamond proportions: 2:1 height to width ratio
    const halfW = size * 0.4 * scale;
    const halfH = size * 0.8 * scale;
    const innerW = halfW * (1 - borderWidth);
    const innerH = halfH * (1 - borderWidth);

    // Inner diamond (green membrane)
    const innerRing = [
      [0, 0, zEps + zStack],           // center
      [0, innerH, zEps + zStack],      // top
      [innerW, 0, zEps + zStack],      // right
      [0, -innerH, zEps + zStack],     // bottom
      [-innerW, 0, zEps + zStack],     // left
    ];

    // Outer diamond (red border)
    const outerRing = [
      [0, halfH, -zEps + zStack],      // top
      [halfW, 0, -zEps + zStack],      // right
      [0, -halfH, -zEps + zStack],     // bottom
      [-halfW, 0, -zEps + zStack],     // left
    ];

    const [sx, sy] = rot2(shiftX, shiftY, angleRad);
    const RT = ([x, y]) => rot2(x, y, angleRad);

    // 1) GREEN membrane (inner diamond)
    const baseInnerGreen = vertices.length / 6;
    innerRing.forEach(([x, y, z], i) => {
      const [xr, yr] = RT([x, y]);
      const useShift = [sx, sy];
      const color = i === 0 ? col.center : col.inner;
      pushV(xr + useShift[0], yr + useShift[1], z, color);
    });

    // 2) RED duplicate (for crisp border seam)
    const baseInnerRed = vertices.length / 6;
    innerRing.forEach(([x, y, z], i) => {
      const [xr, yr] = RT([x, y]);
      const useShift = [sx, sy];
      pushV(xr + useShift[0], yr + useShift[1], z, col.edge);
    });

    // 3) RED outer diamond
    const baseOuterRed = vertices.length / 6;
    outerRing.forEach(([x, y, z]) => {
      const [xr, yr] = RT([x, y]);
      pushV(xr + sx, yr + sy, z, col.edge);
    });

    // Faces for the fin
    faces.push(
      // Inner green diamond triangles
      baseInnerGreen + 0, baseInnerGreen + 1, baseInnerGreen + 2,
      baseInnerGreen + 0, baseInnerGreen + 2, baseInnerGreen + 3,
      baseInnerGreen + 0, baseInnerGreen + 3, baseInnerGreen + 4,
      baseInnerGreen + 0, baseInnerGreen + 4, baseInnerGreen + 1,

      // Red border strips
      baseInnerRed + 1, baseOuterRed + 0, baseOuterRed + 1,
      baseInnerRed + 1, baseOuterRed + 1, baseInnerRed + 2,

      baseInnerRed + 2, baseOuterRed + 1, baseOuterRed + 2,
      baseInnerRed + 2, baseOuterRed + 2, baseInnerRed + 3,

      baseInnerRed + 3, baseOuterRed + 2, baseOuterRed + 3,
      baseInnerRed + 3, baseOuterRed + 3, baseInnerRed + 4,

      baseInnerRed + 4, baseOuterRed + 3, baseOuterRed + 0,
      baseInnerRed + 4, baseOuterRed + 0, baseInnerRed + 1
    );
  }

  const layerZ = 0;
  
  // Center fin pointing up
  addSingleFin(0, 0, 0, layerZ, undefined, 1.0);
  
  // Right and left fins spread at angles
  addSingleFin(+toRad(spreadDeg), +sideSeparation, 0, layerZ + 0.01, undefined, 0.85);
  addSingleFin(-toRad(spreadDeg), -sideSeparation, 0, layerZ + 0.02, undefined, 0.85);

  if (twoSided) {
    const baseCount = vertices.length / 6;
    const backGap = 0.0015;
    for (let i = 0; i < baseCount; i++) {
      const k = i * 6;
      vertices.push(
        vertices[k],
        vertices[k + 1],
        -vertices[k + 2] - backGap,
        vertices[k + 3],
        vertices[k + 4],
        vertices[k + 5]
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