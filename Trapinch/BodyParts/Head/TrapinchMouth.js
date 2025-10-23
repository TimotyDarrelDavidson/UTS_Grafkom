/**
 * Generate Trapinch Mouth - Truncated Cone (Frustum)
 * @param {number} topRadius - Radius at the top
 * @param {number} bottomRadius - Radius at the bottom
 * @param {number} height - Height of the cone
 * @param {number} radialSegments - Number of segments around
 * @param {Array} color - RGB color [r, g, b] (0-1 range)
 * @returns {Object} - { vertices: Float32Array, faces: Uint16Array }
 */
export function generateTrapinchMouth(topRadius, bottomRadius, height, radialSegments, color) {
    var vertices = [];
    var faces = [];

    // Generate vertices for truncated cone
    for (var i = 0; i <= 1; i++) { // 0 = top, 1 = bottom
        var y = i * height - height / 2; // Center at origin
        var radius = i === 0 ? topRadius : bottomRadius;

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

    // Generate faces for the sides
    for (var j = 0; j < radialSegments; j++) {
        var first = j;
        var second = j + radialSegments + 1;

        faces.push(first, second, first + 1);
        faces.push(second, second + 1, first + 1);
    }

    // Top cap (circle at top)
    var topCenterIndex = vertices.length / 6; // Divide by 6 (x,y,z,r,g,b)
    vertices.push(0, -height / 2, 0); // Top center
    vertices.push(color[0], color[1], color[2]);

    for (var j = 0; j < radialSegments; j++) {
        faces.push(topCenterIndex, j, j + 1);
    }

    // Bottom cap (circle at bottom)
    var bottomCenterIndex = vertices.length / 6;
    vertices.push(0, height / 2, 0); // Bottom center
    vertices.push(color[0], color[1], color[2]);

    for (var j = 0; j < radialSegments; j++) {
        var offset = radialSegments + 1;
        faces.push(bottomCenterIndex, offset + j + 1, offset + j);
    }

    return {
        vertices: new Float32Array(vertices),
        faces: new Uint16Array(faces)
    };
}