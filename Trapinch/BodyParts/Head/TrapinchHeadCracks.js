/**
 * Generate Trapinch Head Cracks — Zigzag mouth pattern ON the head surface
 */
export function generateTrapinchHeadCracks(thickness, segments, color) {
    const vertices = [];
    const faces = [];

    // Head dimensions from main.js, supaya kurvanya mengikuti bentuk kepala
    const headRadiusX = 1.0;
    const headRadiusY = 0.9;
    const headRadiusZ = 1.2;

    // 🌀 Helper: Cubic Bezier interpolation
    const bezierPoint = (t, p0, p1, p2, p3) => {
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;

        return [
            mt3 * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t3 * p3[0],
            mt3 * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t3 * p3[1],
            mt3 * p0[2] + 3 * mt2 * t * p1[2] + 3 * mt * t2 * p2[2] + t3 * p3[2]
        ];
    };

    // 🎯 Project point onto ellipsoid surface
    const projectOntoHead = (x, y, z) => {
        // Normalize to unit sphere first
        const length = Math.sqrt(
            (x * x) / (headRadiusX * headRadiusX) +
            (y * y) / (headRadiusY * headRadiusY) +
            (z * z) / (headRadiusZ * headRadiusZ)
        );
        
        // Scale back to ellipsoid surface
        return [
            x / length,
            y / length,
            z / length
        ];
    };

    // ✏️ Create a ribbon-like crack segment along a curve
    const createCrackLine = (controlPoints, thickness, segments) => {
        const startIdx = vertices.length / 6;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const [x, y, z] = bezierPoint(t, ...controlPoints);
            
            // PROJECT onto head surface
            const [px, py, pz] = projectOntoHead(x, y, z);

            // Add slight offset outward (normal direction) to prevent z-fighting
            const offset = 0.02;
            const nx = px * (1 + offset / Math.sqrt(px*px + py*py + pz*pz));
            const ny = py * (1 + offset / Math.sqrt(px*px + py*py + pz*pz));
            const nz = pz * (1 + offset / Math.sqrt(px*px + py*py + pz*pz));

            // Create ribbon thickness perpendicular to curve
            vertices.push(
                nx - thickness * 0.01, ny, nz, color[0], color[1], color[2],
                nx + thickness * 0.01, ny, nz, color[0], color[1], color[2]
            );
        }

        // Generate triangle strip faces
        for (let i = 0; i < segments; i++) {
            const base = startIdx + i * 2;
            faces.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
        }
    };

    // 🪨 Main Zigzag Crack Pattern (scaled to head size)
    const crackPaths = [
        [[-0.5 * headRadiusX, 0.7 * headRadiusY, 0.85 * headRadiusZ], 
         [-0.52 * headRadiusX, 0.66 * headRadiusY, 0.88 * headRadiusZ], 
         [-0.48 * headRadiusX, 0.62 * headRadiusY, 0.92 * headRadiusZ], 
         [-0.42 * headRadiusX, 0.56 * headRadiusY, 0.95 * headRadiusZ]],
        
        [[-0.42 * headRadiusX, 0.56 * headRadiusY, 0.95 * headRadiusZ], 
         [-0.48 * headRadiusX, 0.52 * headRadiusY, 0.93 * headRadiusZ], 
         [-0.56 * headRadiusX, 0.48 * headRadiusY, 0.91 * headRadiusZ], 
         [-0.62 * headRadiusX, 0.42 * headRadiusY, 0.90 * headRadiusZ]],
        
        [[-0.62 * headRadiusX, 0.42 * headRadiusY, 0.90 * headRadiusZ], 
         [-0.58 * headRadiusX, 0.37 * headRadiusY, 0.89 * headRadiusZ], 
         [-0.48 * headRadiusX, 0.33 * headRadiusY, 0.90 * headRadiusZ], 
         [-0.38 * headRadiusX, 0.28 * headRadiusY, 0.90 * headRadiusZ]],
        
        [[-0.38 * headRadiusX, 0.28 * headRadiusY, 0.90 * headRadiusZ], 
         [-0.45 * headRadiusX, 0.24 * headRadiusY, 0.88 * headRadiusZ], 
         [-0.54 * headRadiusX, 0.20 * headRadiusY, 0.87 * headRadiusZ], 
         [-0.62 * headRadiusX, 0.15 * headRadiusY, 0.86 * headRadiusZ]],
        
        [[-0.62 * headRadiusX, 0.15 * headRadiusY, 0.86 * headRadiusZ], 
         [-0.57 * headRadiusX, 0.10 * headRadiusY, 0.85 * headRadiusZ], 
         [-0.48 * headRadiusX, 0.06 * headRadiusY, 0.86 * headRadiusZ], 
         [-0.40 * headRadiusX, 0.02 * headRadiusY, 0.86 * headRadiusZ]],
        
        [[-0.40 * headRadiusX, 0.02 * headRadiusY, 0.86 * headRadiusZ], 
         [-0.46 * headRadiusX, -0.03 * headRadiusY, 0.85 * headRadiusZ], 
         [-0.55 * headRadiusX, -0.07 * headRadiusY, 0.84 * headRadiusZ], 
         [-0.62 * headRadiusX, -0.12 * headRadiusY, 0.83 * headRadiusZ]],
        
        [[-0.62 * headRadiusX, -0.12 * headRadiusY, 0.83 * headRadiusZ], 
         [-0.57 * headRadiusX, -0.17 * headRadiusY, 0.82 * headRadiusZ], 
         [-0.49 * headRadiusX, -0.21 * headRadiusY, 0.82 * headRadiusZ], 
         [-0.42 * headRadiusX, -0.25 * headRadiusY, 0.81 * headRadiusZ]],
        
        [[-0.42 * headRadiusX, -0.25 * headRadiusY, 0.81 * headRadiusZ], 
         [-0.48 * headRadiusX, -0.30 * headRadiusY, 0.79 * headRadiusZ], 
         [-0.56 * headRadiusX, -0.34 * headRadiusY, 0.78 * headRadiusZ], 
         [-0.61 * headRadiusX, -0.38 * headRadiusY, 0.76 * headRadiusZ]],
        
        [[-0.61 * headRadiusX, -0.38 * headRadiusY, 0.76 * headRadiusZ], 
         [-0.57 * headRadiusX, -0.42 * headRadiusY, 0.75 * headRadiusZ], 
         [-0.53 * headRadiusX, -0.44 * headRadiusY, 0.75 * headRadiusZ], 
         [-0.50 * headRadiusX, -0.47 * headRadiusY, 0.74 * headRadiusZ]],

        // ✨ NEW: 6 ADDITIONAL ZIGZAG SEGMENTS (continuing the pattern)
        [[-0.50 * headRadiusX, -0.47 * headRadiusY, 0.74 * headRadiusZ],
         [-0.56 * headRadiusX, -0.51 * headRadiusY, 0.73 * headRadiusZ],
         [-0.63 * headRadiusX, -0.55 * headRadiusY, 0.71 * headRadiusZ],
         [-0.68 * headRadiusX, -0.60 * headRadiusY, 0.69 * headRadiusZ]],

        [[-0.68 * headRadiusX, -0.60 * headRadiusY, 0.69 * headRadiusZ],
         [-0.63 * headRadiusX, -0.64 * headRadiusY, 0.68 * headRadiusZ],
         [-0.55 * headRadiusX, -0.68 * headRadiusY, 0.67 * headRadiusZ],
         [-0.48 * headRadiusX, -0.72 * headRadiusY, 0.66 * headRadiusZ]],

        [[-0.48 * headRadiusX, -0.72 * headRadiusY, 0.66 * headRadiusZ],
         [-0.54 * headRadiusX, -0.76 * headRadiusY, 0.64 * headRadiusZ],
         [-0.62 * headRadiusX, -0.80 * headRadiusY, 0.62 * headRadiusZ],
         [-0.68 * headRadiusX, -0.84 * headRadiusY, 0.60 * headRadiusZ]],

        [[-0.68 * headRadiusX, -0.84 * headRadiusY, 0.60 * headRadiusZ],
         [-0.63 * headRadiusX, -0.88 * headRadiusY, 0.58 * headRadiusZ],
         [-0.56 * headRadiusX, -0.91 * headRadiusY, 0.57 * headRadiusZ],
         [-0.50 * headRadiusX, -0.94 * headRadiusY, 0.56 * headRadiusZ]],

        [[-0.50 * headRadiusX, -0.94 * headRadiusY, 0.56 * headRadiusZ],
         [-0.56 * headRadiusX, -0.97 * headRadiusY, 0.54 * headRadiusZ],
         [-0.63 * headRadiusX, -1.00 * headRadiusY, 0.52 * headRadiusZ],
         [-0.68 * headRadiusX, -1.03 * headRadiusY, 0.50 * headRadiusZ]],

        [[-0.68 * headRadiusX, -1.03 * headRadiusY, 0.50 * headRadiusZ],
         [-0.64 * headRadiusX, -1.06 * headRadiusY, 0.48 * headRadiusZ],
         [-0.58 * headRadiusX, -1.08 * headRadiusY, 0.47 * headRadiusZ],
         [-0.52 * headRadiusX, -1.10 * headRadiusY, 0.46 * headRadiusZ]]
    ];

    // Generate each crack segment
    crackPaths.forEach(path => createCrackLine(path, thickness, segments));

    // 🚫 REMOVED the "optional smaller side crack" that was causing the extra line

    return {
        vertices: new Float32Array(vertices),
        faces: new Uint16Array(faces)
    };
}