function bezierPoint(t, p0, p1, p2, p3) {
    let u = 1 - t;
    let tt = t * t;
    let uu = u * u;
    let uuu = uu * u;
    let ttt = tt * t;

    let x = uuu * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + ttt * p3[0];
    let y = uuu * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + ttt * p3[1];
    let z = uuu * p0[2] + 3 * uu * t * p1[2] + 3 * u * tt * p2[2] + ttt * p3[2];
    return [x, y, z];
}

function bezierTangent(t, p0, p1, p2, p3) {
    let u = 1 - t;
    let x = -3 * u * u * p0[0] + (3 * u * u - 6 * u * t) * p1[0] + (6 * u * t - 3 * t * t) * p2[0] + 3 * t * t * p3[0];
    let y = -3 * u * u * p0[1] + (3 * u * u - 6 * u * t) * p1[1] + (6 * u * t - 3 * t * t) * p2[1] + 3 * t * t * p3[1];
    let z = -3 * u * u * p0[2] + (3 * u * u - 6 * u * t) * p1[2] + (6 * u * t - 3 * t * t) * p2[2] + 3 * t * t * p3[2];
    return [x, y, z];
}

export function generateFlygonBodyBezier(p0, p1, p2, p3, a, b, stacks, slices) {
    let vertices = [];
    let faces = [];

    // radius profile: fat bottom → skinny top
    function radiusProfile(t) {
        // t=0 bottom (fat), t=1 top (skinny)
        return 0.3 + 0.7 * (1 - t); 
        // try: return 1 - t;         // linear taper
        // try: return 1 - (t-0.5)**2;// bulge in middle
    }

    for (let i = 0; i <= stacks; i++) {
        let t = i / stacks;

        // center on curve
        let center = bezierPoint(t, p0, p1, p2, p3);
        let tangent = bezierTangent(t, p0, p1, p2, p3);

        // normalize tangent
        let len = Math.hypot(...tangent);
        tangent = tangent.map(v => v / len);

        // choose up vector
        let up = [0, 1, 0];
        if (Math.abs(tangent[0]) < 0.01 && Math.abs(tangent[2]) < 0.01) {
            up = [1, 0, 0];
        }

        // binormal = tangent × up
        let binormal = [0,0,1]; // fixed sideways
        let normal   = [
            binormal[1]*tangent[2] - binormal[2]*tangent[1],
            binormal[2]*tangent[0] - binormal[0]*tangent[2],
            binormal[0]*tangent[1] - binormal[1]*tangent[0],
        ];

        // taper radii
        let scale = radiusProfile(t);
        let at = a * scale;
        let bt = b * scale;

        for (let j = 0; j <= slices; j++) {
            let u = 2 * Math.PI * j / slices;
            let cosu = Math.cos(u), sinu = Math.sin(u);

            let x = center[0] + at * cosu * normal[0] + bt * sinu * binormal[0];
            let y = center[1] + at * cosu * normal[1] + bt * sinu * binormal[1];
            let z = center[2] + at * cosu * normal[2] + bt * sinu * binormal[2];

            vertices.push(x, y, z);

            // color gradient
            vertices.push(181/255, 235/255, 145/255);
        }
    }

    // faces
    for (let i = 0; i < stacks; i++) {
        for (let j = 0; j < slices; j++) {
            let first = i * (slices + 1) + j;
            let second = first + slices + 1;
            faces.push(first, first+1, second+1);
            faces.push(first, second+1, second);
        }
    }

    return { vertices, faces };
}
