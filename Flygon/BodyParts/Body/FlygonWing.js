// BodyParts/Body/FlygonWing.js
export function generateFlygonWing(size = 1, options = {}) {
    // Softer gradient colors
    const centerColor = options.centerColor || [0.6, 1.0, 0.6]; // light green
    const midColor    = options.midColor    || [0.4, 0.9, 0.4]; // medium green
    const edgeColor   = options.edgeColor   || [0.8, 0.2, 0.2]; // red border
    const twoSided    = !!options.twoSided;
    const borderWidth = options.borderWidth || 0.2; // controls border thickness

    const vertices = [];
    const faces = [];

    // Inner diamond (green part)
    const innerVerts = [
        [0, 0, 0],                    // center - 0
        [0, size * (0.5 - borderWidth), 0],     // top inner - 1
        [size * (0.5 - borderWidth), 0, 0],     // right inner - 2
        [0, -size * (2 - borderWidth * 2), 0],  // bottom inner - 3
        [-size * (0.5 - borderWidth), 0, 0]     // left inner - 4
    ];

    const innerColors = [
        centerColor,
        midColor,
        midColor,
        midColor,
        midColor
    ];

    // Outer border (red part)
    const outerVerts = [
        [0, size / 2, 0],             // top outer - 5
        [size * 0.5, 0, 0],           // right outer - 6
        [0, -size * 2, 0],            // bottom outer - 7
        [-size * 0.5, 0, 0]           // left outer - 8
    ];

    // Add all vertices to the buffer
    // Inner vertices first (0-4)
    for (let i = 0; i < innerVerts.length; i++) {
        const [x, y, z] = innerVerts[i];
        const [r, g, b] = innerColors[i];
        vertices.push(x, y, z, r, g, b);
    }

    // Outer vertices next (5-8)
    for (let i = 0; i < outerVerts.length; i++) {
        const [x, y, z] = outerVerts[i];
        const [r, g, b] = edgeColor;
        vertices.push(x, y, z, r, g, b);
    }

    // Inner diamond faces (green part)
    faces.push(
        0, 1, 2,  // center -> top inner -> right inner
        0, 2, 3,  // center -> right inner -> bottom inner
        0, 3, 4,  // center -> bottom inner -> left inner
        0, 4, 1   // center -> left inner -> top inner
    );

    // Border faces (red part) - clean, sharp border
    // Each border section is a quadrilateral made of 2 triangles
    
    // Top-right border section
    faces.push(
        1, 5, 6,  // top inner -> top outer -> right outer
        1, 6, 2   // top inner -> right outer -> right inner
    );

    // Right-bottom border section  
    faces.push(
        2, 6, 7,  // right inner -> right outer -> bottom outer
        2, 7, 3   // right inner -> bottom outer -> bottom inner
    );

    // Bottom-left border section
    faces.push(
        3, 7, 8,  // bottom inner -> bottom outer -> left outer
        3, 8, 4   // bottom inner -> left outer -> left inner
    );

    // Left-top border section
    faces.push(
        4, 8, 5,  // left inner -> left outer -> top outer
        4, 5, 1   // left inner -> top outer -> top inner
    );

    // Optional: Two-sided wing
    if (twoSided) {
        const baseCount = vertices.length / 6;
        
        // Duplicate vertices for backside with slight Z offset
        for (let i = 0; i < baseCount; i++) {
            const baseIndex = i * 6;
            vertices.push(
                vertices[baseIndex],     // x
                vertices[baseIndex + 1], // y
                -0.001,                 // z (slightly behind)
                vertices[baseIndex + 3], // r
                vertices[baseIndex + 4], // g
                vertices[baseIndex + 5]  // b
            );
        }

        // Add backside faces (reversed winding order)
        for (let i = 0; i < faces.length; i += 3) {
            faces.push(
                faces[i] + baseCount,
                faces[i + 2] + baseCount,
                faces[i + 1] + baseCount
            );
        }
    }

    return { vertices, faces };
}