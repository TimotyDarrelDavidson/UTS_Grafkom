export function generateFlygonTailBezier(p0, p1, p2, p3, a, b, stacks, slices) {
    const vertices = [];
    const faces = [];

    function bezierPoint(t, p0, p1, p2, p3) {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;
        return [
            uuu * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + ttt * p3[0],
            uuu * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + ttt * p3[1],
            uuu * p0[2] + 3 * uu * t * p1[2] + 3 * u * tt * p2[2] + ttt * p3[2],
        ];
    }

    function bezierTangent(t, p0, p1, p2, p3) {
        const u = 1 - t;
        return [
            -3 * u * u * p0[0] + 3 * (u * u - 2 * u * t) * p1[0] + 3 * (2 * u * t - t * t) * p2[0] + 3 * t * t * p3[0],
            -3 * u * u * p0[1] + 3 * (u * u - 2 * u * t) * p1[1] + 3 * (2 * u * t - t * t) * p2[1] + 3 * t * t * p3[1],
            -3 * u * u * p0[2] + 3 * (u * u - 2 * u * t) * p1[2] + 3 * (2 * u * t - t * t) * p2[2] + 3 * t * t * p3[2],
        ];
    }

    function normalize(v) {
        const len = Math.hypot(...v);
        return v.map(x => x / len);
    }

    function cross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
        ];
    }

    // radius profile (fat base → thin tip)
    function radiusProfile(t) {
        return 1 - 0.9 * t;
    }

    // starting frame
    let prevTangent = normalize(bezierTangent(0, p0, p1, p2, p3));
    let normal = [0, 1, 0];
    if (Math.abs(prevTangent[1]) > 0.9) normal = [1, 0, 0];
    let binormal = normalize(cross(prevTangent, normal));
    normal = normalize(cross(binormal, prevTangent));

    const lightGreen = [181/255, 235/255, 145/255]; // pale green
    const darkGreen  = [85/255, 170/255, 85/255];   // darker ring

    for (let i = 0; i <= stacks; i++) {
        const t = i / stacks;
        const center = bezierPoint(t, p0, p1, p2, p3);
        const tangent = normalize(bezierTangent(t, p0, p1, p2, p3));

        // Smoothly rotate frame to follow tangent
        const axis = cross(prevTangent, tangent);
        const axisLen = Math.hypot(...axis);
        if (axisLen > 1e-6) {
            const angle = Math.asin(axisLen);
            const rot = axis.map(v => v / axisLen);
            // Rotate normal & binormal using Rodrigues' rotation formula
            function rotate(v) {
                const cosA = Math.cos(angle);
                const sinA = Math.sin(angle);
                const dot = v[0] * rot[0] + v[1] * rot[1] + v[2] * rot[2];
                return [
                    v[0] * cosA + (rot[1] * v[2] - rot[2] * v[1]) * sinA + rot[0] * dot * (1 - cosA),
                    v[1] * cosA + (rot[2] * v[0] - rot[0] * v[2]) * sinA + rot[1] * dot * (1 - cosA),
                    v[2] * cosA + (rot[0] * v[1] - rot[1] * v[0]) * sinA + rot[2] * dot * (1 - cosA),
                ];
            }
            normal = normalize(rotate(normal));
            binormal = normalize(cross(tangent, normal));
        }
        prevTangent = tangent;

        const scale = radiusProfile(t);
        const at = a * scale;
        const bt = b * scale;

        // alternate color every few rings
        let ringIndex = Math.floor(i / (stacks / 6)); // 6 stripes along tail
        let color = (ringIndex % 2 === 0) ? lightGreen : darkGreen;

        for (let j = 0; j <= slices; j++) {
            const u = (j / slices) * 2 * Math.PI;
            const cosu = Math.cos(u);
            const sinu = Math.sin(u);

            const pos = [
                center[0] + at * cosu * normal[0] + bt * sinu * binormal[0],
                center[1] + at * cosu * normal[1] + bt * sinu * binormal[1],
                center[2] + at * cosu * normal[2] + bt * sinu * binormal[2],
            ];

            vertices.push(...pos);
            const c = 0.8 + 0.2 * (1 - t);
            vertices.push(color[0], color[1], color[2]);
        }
    }

    // faces
    for (let i = 0; i < stacks; i++) {
        for (let j = 0; j < slices; j++) {
            const first = i * (slices + 1) + j;
            const second = first + slices + 1;
            faces.push(first, first + 1, second + 1);
            faces.push(first, second + 1, second);
        }
    }

    return { vertices, faces };
}
