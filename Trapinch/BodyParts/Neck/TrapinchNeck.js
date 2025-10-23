/**
 * Generate Trapinch Neck - Hyperboloid (hourglass/neck shape)
 * Hyperboloid equation: x²/a² + z²/c² - y²/b² = 1
 * @param {number} radiusTop - Radius at the top
 * @param {number} radiusMiddle - Radius at the middle (narrowest point)
 * @param {number} radiusBottom - Radius at the bottom
 * @param {number} height - Total height
 * @param {number} heightSegments - Number of vertical segments
 * @param {number} radialSegments - Number of segments around
 * @param {Array} color - RGB color [r, g, b] (0-1 range)
 * @returns {Object} - { vertices: Float32Array, faces: Uint16Array }
 */
export function generateTrapinchNeck(radiusTop, radiusMiddle, radiusBottom, height, heightSegments, radialSegments, color) {
    var vertices = [];
    var faces = [];

    // Generate vertices for hyperboloid
    for (var i = 0; i <= heightSegments; i++) {
        var v = i / heightSegments; // 0 to 1
        var y = v * height - height / 2; // -height/2 to +height/2

        // Interpolate radius with hyperboloid curve
        // Creates hourglass shape: wider at ends, narrow in middle
        var t = Math.abs(2 * v - 1); // 0 (middle) to 1 (ends)
        var radius = radiusMiddle + (radiusTop - radiusMiddle) * t * t;
        
        // Adjust for bottom being potentially different
        if (v > 0.5) {
            var bottomT = (v - 0.5) * 2;
            radius = radiusMiddle + (radiusBottom - radiusMiddle) * bottomT * bottomT;
        }

        for (var j = 0; j <= radialSegments; j++) {
            var angle = (j * 2 * Math.PI) / radialSegments;
            var x = radius * Math.cos(angle);
            var z = radius * Math.sin(angle);

            // Position
            vertices.push(x, y, z);
            
            // Color
            vertices.push(color[0], color[1], color[2]);
        }
    }

    // Generate faces
    for (var i = 0; i < heightSegments; i++) {
        for (var j = 0; j < radialSegments; j++) {
            var first = i * (radialSegments + 1) + j;
            var second = first + radialSegments + 1;

            faces.push(first, second, first + 1);
            faces.push(second, second + 1, first + 1);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        faces: new Uint16Array(faces)
    };
}