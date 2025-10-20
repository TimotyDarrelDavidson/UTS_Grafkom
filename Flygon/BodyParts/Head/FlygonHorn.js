// FlygonHorn.js (replace previous)
export function generateCurvedHorn_flat(radiusBase, radiusTip, length, steps, slices) {
    // We'll produce:
    // verticesFlat: Float32Array([x,y,z,r,g,b, x,y,z,r,g,b, ...])
    // indices: Uint16Array([i0,i1,i2, ...]) (triangle list)
    const verts = [];
    const inds = [];

    const arcAngle = Math.PI * 0.55; // 81° bend; tweak as needed

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = t * arcAngle;

        // Path along circular arc (in X-Y plane). Adjust formulas if you want different bend.
        const px = Math.sin(angle) * length;          // forward along X
        const py = (1 - Math.cos(angle)) * length;    // upward along Y
        const pz = 0;                                 // no offset in Z

        const r = radiusBase * (1 - t) + radiusTip * t; // linear taper

        for (let j = 0; j < slices; j++) {
            const theta = (j / slices) * Math.PI * 2;
            // local circle coordinates in plane perpendicular to path (approximate)
            const cx = Math.cos(theta) * r;
            const cz = Math.sin(theta) * r;

            // vertex position (we offset circle in X and Z around the path point)
            // small approximation: place the circle centered at (px,py,pz)
            verts.push(px + cx, py, pz + cz);

            // vertex color
            verts.push(102/255, 172/255, 85/255); // dark green
        }
    }

    // Build indices: quad strips between rings, two triangles per quad
    for (let i = 0; i < steps; i++) {
        for (let j = 0; j < slices; j++) {
            const nextJ = (j + 1) % slices;
            const a = i * slices + j;
            const b = i * slices + nextJ;
            const c = (i + 1) * slices + j;
            const d = (i + 1) * slices + nextJ;

            // two triangles (a,b,c) and (b,d,c)
            inds.push(a, b, c);
            inds.push(b, d, c);
        }
    }

    // Optionally close the tip with a small fan if radiusTip > 0
    if (radiusTip > 0.0001) {
        // create a tip vertex at final path point
        const tipIndex = verts.length / 6;
        const lastAngle = arcAngle;
        const tipX = Math.sin(lastAngle) * length;
        const tipY = (1 - Math.cos(lastAngle)) * length;
        const tipZ = 0;
        verts.push(tipX, tipY, tipZ);
        verts.push(50/255, 120/255, 50/255);

        // connect last ring to tip
        const baseStart = steps * slices;
        for (let j = 0; j < slices; j++) {
            const nextJ = (j + 1) % slices;
            const a = baseStart + j;
            const b = baseStart + nextJ;
            inds.push(a, b, tipIndex);
        }
    }

    return {
        vertices: new Float32Array(verts),
        faces: new Uint16Array(inds)
    };
}
