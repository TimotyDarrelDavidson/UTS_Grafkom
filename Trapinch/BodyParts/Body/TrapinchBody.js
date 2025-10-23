// export function generateTrapinchBody(ax, by, cz, stacks = 14, slices = 20,
//   color = [240 / 255, 150 / 255, 70 / 255]) {
//     const vertices = [];
//   const faces = [];

//   for (let i = 0; i <= stacks; i++) {
//     const v = (i / stacks) * Math.PI;
//     const y = by * Math.cos(v);
//     const r = Math.sin(v);
//     for (let j = 0; j <= slices; j++) {
//       const u = (2 * Math.PI * j) / slices;
//       const x = ax * r * Math.cos(u);
//       const z = cz * r * Math.sin(u);
//       vertices.push(x, y, z, color[0], color[1], color[2]);
//     }
//   }

//   for (let i = 0; i < stacks; i++) {
//     for (let j = 0; j < slices; j++) {
//       const first = i * (slices + 1) + j;
//       const second = first + (slices + 1);
//       faces.push(first, first + 1, second + 1);
//       faces.push(first, second + 1, second);
//     }
//   }

//   return { vertices, faces };
// }

/**
 * Generate Trapinch Body - Ellipsoid (small body)
 * @param {number} rx - Radius in X direction
 * @param {number} ry - Radius in Y direction (height)
 * @param {number} rz - Radius in Z direction
 * @param {number} latBands - Number of latitude bands
 * @param {number} longBands - Number of longitude bands
 * @param {Array} color - RGB color [r, g, b] (0-1 range)
 * @returns {Object} - { vertices: Float32Array, faces: Uint16Array }
 */
export function generateTrapinchBody(rx, ry, rz, latBands, longBands, color) {
    var vertices = [];
    var faces = [];

    // Generate vertices for ellipsoid
    for (var lat = 0; lat <= latBands; lat++) {
        var theta = (lat * Math.PI) / latBands; // 0 to PI (top to bottom)
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var long = 0; long <= longBands; long++) {
            var phi = (long * 2 * Math.PI) / longBands; // 0 to 2PI (around)
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            // Ellipsoid parametric equation
            var x = rx * cosPhi * sinTheta;
            var y = ry * cosTheta;
            var z = rz * sinPhi * sinTheta;

            // Position
            vertices.push(x, y, z);
            
            // Color
            vertices.push(color[0], color[1], color[2]);
        }
    }

    // Generate faces (triangles)
    for (var lat = 0; lat < latBands; lat++) {
        for (var long = 0; long < longBands; long++) {
            var first = lat * (longBands + 1) + long;
            var second = first + longBands + 1;

            // First triangle
            faces.push(first);
            faces.push(second);
            faces.push(first + 1);

            // Second triangle
            faces.push(second);
            faces.push(second + 1);
            faces.push(first + 1);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        faces: new Uint16Array(faces)
    };
}