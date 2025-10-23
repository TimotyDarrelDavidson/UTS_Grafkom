export function generateWing({
  w = 1.0,
  h = 1.2,
  z = 0.0,
  innerColor = [0.26, 0.86, 0.24],  // bright green
  borderColor = [0.2, 0.2, 0.2],    // dark gray border
  borderThickness = 0.1,            // thickness of the border
  twoSided = true
} = {}) {
  const vertices = [];
  const faces = [];

  // Inner green size (base size)
  const innerW = w * (1 - borderThickness);
  const innerH = h * (1 - borderThickness);

  // back green diamond (layer 1) - BELAKANG
  const P_backGreen = [
    [ +innerW, 0.0, z - 0.0002 ],
    [ 0.0, +innerH, z - 0.0002 ],
    [ -innerW, 0.0, z - 0.0002 ],
    [ 0.0, -innerH, z - 0.0002 ],
  ];

  // black border diamond (layer 2) - TENGAH (lebih besar)
  const P_border = [
    [ +w, 0.0, z ],
    [ 0.0, +h, z ],
    [ -w, 0.0, z ],
    [ 0.0, -h, z ],
  ];

  // front green diamond (layer 3) - DEPAN (sama dengan layer 1)
  const P_frontGreen = [
    [ +innerW, 0.0, z + 0.0002 ],
    [ 0.0, +innerH, z + 0.0002 ],
    [ -innerW, 0.0, z + 0.0002 ],
    [ 0.0, -innerH, z + 0.0002 ],
  ];

  // --- Back green diamond vertices (index 0-3) ---
  for (let i = 0; i < 4; i++) {
    vertices.push(P_backGreen[i][0], P_backGreen[i][1], P_backGreen[i][2],
      innerColor[0], innerColor[1], innerColor[2]);
  }

  // --- Border diamond vertices (index 4-7) ---
  for (let i = 0; i < 4; i++) {
    vertices.push(P_border[i][0], P_border[i][1], P_border[i][2],
      borderColor[0], borderColor[1], borderColor[2]);
  }

  // --- Front green diamond vertices (index 8-11) ---
  for (let i = 0; i < 4; i++) {
    vertices.push(P_frontGreen[i][0], P_frontGreen[i][1], P_frontGreen[i][2],
      innerColor[0], innerColor[1], innerColor[2]);
  }

  // Back green diamond (2 triangles)
  faces.push(0, 1, 2, 0, 2, 3);

  // Border diamond (2 triangles)
  faces.push(4, 5, 6, 4, 6, 7);

  // Front green diamond (2 triangles)
  faces.push(8, 9, 10, 8, 10, 11);

  if (twoSided) {
    const baseCount = vertices.length / 6; // 12 vertices
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