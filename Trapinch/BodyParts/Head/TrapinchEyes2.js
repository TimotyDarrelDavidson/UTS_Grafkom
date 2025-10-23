/**
 * Generate Trapinch Eye - Flattened ellipsoid (less bulge)
 * @param {number} radiusX - Horizontal radius (width)
 * @param {number} radiusY - Vertical radius (height)
 * @param {number} radiusZ - Depth radius (how much it bulges out)
 * @param {number} latBands - Number of latitude bands
 * @param {number} longBands - Number of longitude bands
 * @param {Array} outerColor - RGB color for outer eye [r, g, b]
 * @returns {Object} - { vertices: Float32Array, faces: Uint16Array }
 */
export function generateTrapinchEyes2(radiusX, radiusY, radiusZ, latBands, longBands, outerColor) {
    var vertices = [];
    var faces = [];

    // Generate flattened ellipsoid (less bulge in Z direction)
    for (var lat = 0; lat <= latBands; lat++) {
        var theta = (lat * Math.PI) / latBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var long = 0; long <= longBands; long++) {
            var phi = (long * 2 * Math.PI) / longBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            // CHANGED: Use different radius for each axis
            var x = radiusX * cosPhi * sinTheta;  // Width
            var y = radiusY * cosTheta;           // Height
            var z = radiusZ * sinPhi * sinTheta;  // Depth (FLATTER!)

            vertices.push(x, y, z);
            vertices.push(outerColor[0], outerColor[1], outerColor[2]);
        }
    }

    // Generate faces (same as before)
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