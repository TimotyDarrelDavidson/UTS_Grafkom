/**
 * Generate Trapinch Eye - Black sphere with star-shaped white pupil
 * @param {number} radius - Radius of the eye sphere
 * @param {number} latBands - Number of latitude bands
 * @param {number} longBands - Number of longitude bands
 * @param {Array} outerColor - RGB color for outer eye [r, g, b]
 * @returns {Object} - { vertices: Float32Array, faces: Uint16Array }
 */
export function generateTrapinchEyes(radius, latBands, longBands, outerColor) {
    var vertices = [];
    var faces = [];

    // Generate black outer sphere
    for (var lat = 0; lat <= latBands; lat++) {
        var theta = (lat * Math.PI) / latBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var long = 0; long <= longBands; long++) {
            var phi = (long * 2 * Math.PI) / longBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = radius * cosPhi * sinTheta;
            var y = radius * cosTheta;
            var z = radius * sinPhi * sinTheta;

            vertices.push(x, y, z);
            vertices.push(outerColor[0], outerColor[1], outerColor[2]);
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

/**
 * Generate Trapinch Eye Pupil - White star/diamond shape
 * @param {number} size - Size of the pupil
 * @param {Array} color - RGB color [r, g, b]
 * @returns {Object} - { vertices: Float32Array, faces: Uint16Array }
 */
export function generateTrapinchPupil(size, color) {
    var vertices = [];
    var faces = [];

    // Create diamond/star shape (4-pointed star)
    var points = [
        [0, size * 1.2, 0],      // Top point
        [size * 0.3, 0, 0],       // Right
        [0, -size * 1.2, 0],     // Bottom point
        [-size * 0.3, 0, 0],     // Left
    ];
    
    var center = [0, 0, size * 0.1]; // Center slightly forward

    // Add center vertex
    vertices.push(center[0], center[1], center[2]);
    vertices.push(color[0], color[1], color[2]);

    // Add outer points
    for (var i = 0; i < points.length; i++) {
        vertices.push(points[i][0], points[i][1], points[i][2]);
        vertices.push(color[0], color[1], color[2]);
    }

    // Create triangular faces
    for (var i = 0; i < points.length; i++) {
        faces.push(0, i + 1, ((i + 1) % points.length) + 1);
    }

    return {
        vertices: new Float32Array(vertices),
        faces: new Uint16Array(faces)
    };
}