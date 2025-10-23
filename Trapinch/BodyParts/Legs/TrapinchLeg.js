/**
 * Generate Trapinch Leg - Curved Cylinder using Bezier Curve
 * The leg follows a Bezier curve path for natural bending
 * @param {number} radius - Radius of the leg cylinder
 * @param {number} segments - Number of segments along the curve
 * @param {number} radialSegments - Number of segments around
 * @param {Array} color - RGB color [r, g, b] (0-1 range)
 * @returns {Object} - { vertices: Float32Array, faces: Uint16Array }
 */
export function generateTrapinchLegs(radius, segments, radialSegments, color) {
    var vertices = [];
    var faces = [];

    // Bezier curve for leg path (curves outward and down)
    var p0 = [0, 0, 0];        // Start: attached to body
    var p1 = [0.2, -0.2, 0.2]; // Control point 1: slight outward
    var p2 = [0.1, -0.3, 0.1]; // Control point 2: continues down
    var p3 = [0, -0.5, 0];     // End: down at foot

    // Helper: Cubic Bezier
    function bezierPoint(t, p0, p1, p2, p3) {
        var t2 = t * t;
        var t3 = t2 * t;
        var mt = 1 - t;
        var mt2 = mt * mt;
        var mt3 = mt2 * mt;
        
        return [
            mt3 * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t3 * p3[0],
            mt3 * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t3 * p3[1],
            mt3 * p0[2] + 3 * mt2 * t * p1[2] + 3 * mt * t2 * p2[2] + t3 * p3[2]
        ];
    }

    // Generate vertices along the Bezier curve
    for (var i = 0; i <= segments; i++) {
        var t = i / segments;
        var point = bezierPoint(t, p0, p1, p2, p3);
        
        // Create circle of vertices at this point
        for (var j = 0; j <= radialSegments; j++) {
            var angle = (j * 2 * Math.PI) / radialSegments;
            var x = point[0] + radius * Math.cos(angle);
            var y = point[1];
            var z = point[2] + radius * Math.sin(angle);
            
            vertices.push(x, y, z);
            vertices.push(color[0], color[1], color[2]);
        }
    }

    // Generate faces
    for (var i = 0; i < segments; i++) {
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