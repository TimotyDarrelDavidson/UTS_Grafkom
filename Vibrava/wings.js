export function generateWing({
  // half-width/half-height of the diamond (along X/Y)
  w = 1.0,
  h = 1.2,
  // z plane where the wing sits
  z = 0.0,
  // color tuned to the reference image (vibrant leaf green)
  color = [0.26, 0.86, 0.24], // ≈ #43DB3D
  // optional: duplicate backface for visibility from both sides
  twoSided = true
} = {}) {
  const vertices = [];
  const faces = [];

  // diamond corners (right, top, left, bottom)
  const P = [
    [ +w, 0.0, z ],
    [ 0.0, +h, z ],
    [ -w, 0.0, z ],
    [ 0.0, -h, z ],
  ];

  // push vertices with color
  for (let i = 0; i < 4; i++) {
    vertices.push(P[i][0], P[i][1], P[i][2], color[0], color[1], color[2]);
  }

  // two triangles (0-1-2) and (0-2-3)
  faces.push(0, 1, 2, 0, 2, 3);

  if (twoSided) {
    // duplicate verts with inverted winding for the back face
    const baseCount = vertices.length / 6;
    for (let i = 0; i < baseCount; i++) {
      const k = i * 6;
      vertices.push(
        vertices[k], vertices[k + 1], vertices[k + 2],
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
