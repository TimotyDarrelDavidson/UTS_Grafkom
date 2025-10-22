export function generateWing({
  w = 1.0,
  h = 1.2,
  z = 0.0,
  innerColor = [0.26, 0.86, 0.24],  // bright green
  borderColor = [0.2, 0.2, 0.2],    // dark gray border
  borderThickness = 0.1,            // how thick the border appears
  twoSided = true
} = {}) {
  const vertices = [];
  const faces = [];

  // outer diamond (border)
  const P_outer = [
    [ +w, 0.0, z ],
    [ 0.0, +h, z ],
    [ -w, 0.0, z ],
    [ 0.0, -h, z ],
  ];

  // inner diamond (shrunken by borderThickness)
  const iw = w * (1 - borderThickness);
  const ih = h * (1 - borderThickness);
  const P_inner = [
    [ +iw, 0.0, z + 0.0001 ], // slight z offset to avoid z-fighting
    [ 0.0, +ih, z + 0.0001 ],
    [ -iw, 0.0, z + 0.0001 ],
    [ 0.0, -ih, z + 0.0001 ],
  ];

  // --- Outer diamond vertices (border) ---
  for (let i = 0; i < 4; i++) {
    vertices.push(P_outer[i][0], P_outer[i][1], P_outer[i][2],
      borderColor[0], borderColor[1], borderColor[2]);
  }

  // --- Inner diamond vertices (green) ---
  for (let i = 0; i < 4; i++) {
    vertices.push(P_inner[i][0], P_inner[i][1], P_inner[i][2],
      innerColor[0], innerColor[1], innerColor[2]);
  }

  // outer frame (two triangles)
  faces.push(0, 1, 2, 0, 2, 3);

  // inner green diamond (two triangles)
  faces.push(4, 5, 6, 4, 6, 7);

  if (twoSided) {
    const baseCount = vertices.length / 6;
    const origFaceCount = faces.length;
    // duplicate vertices
    for (let i = 0; i < baseCount; i++) {
      const k = i * 6;
      vertices.push(
        vertices[k], vertices[k + 1], vertices[k + 2],
        vertices[k + 3], vertices[k + 4], vertices[k + 5]
      );
    }
    // reverse winding for back side
    for (let i = 0; i < origFaceCount; i += 3) {
      faces.push(
        faces[i] + baseCount,
        faces[i + 2] + baseCount,
        faces[i + 1] + baseCount
      );
    }
  }

  return { vertices, faces };
}
