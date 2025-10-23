/**
 * Generate Trapinch Head - Large Ellipsoid (big round head)
 * @param {number} rx - Radius in X direction
 * @param {number} ry - Radius in Y direction (height)
 * @param {number} rz - Radius in Z direction
 * @param {number} latBands - Number of latitude bands
 * @param {number} longBands - Number of longitude bands
 * @param {Array} color - RGB color [r, g, b] (0-1 range)
 * @returns {Object} - { vertices: Float32Array, faces: Uint16Array }
 */
export function generateTrapinchHead(rx, ry, rz, latBands, longBands, color) {
    var vertices = [];
    var faces = [];

    // Generate vertices for ellipsoid
    for (var lat = 0; lat <= latBands; lat++) {
        var theta = (lat * Math.PI) / latBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var long = 0; long <= longBands; long++) {
            var phi = (long * 2 * Math.PI) / longBands;
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

    // Generate faces
    for (var lat = 0; lat < latBands; lat++) {
        for (var long = 0; long < longBands; long++) {
            var first = lat * (longBands + 1) + long;
            var second = first + longBands + 1;

            faces.push(first, second, first + 1);
            faces.push(second, second + 1, first + 1);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        faces: new Uint16Array(faces)
    };
}