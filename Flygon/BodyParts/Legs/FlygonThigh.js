// FlygonBelly.js
export function generateFlygonThigh(a, b, c, stacks, steps, inner) {
    let vertices = [];
    let faces = [];

    for (let i = 0; i <= stacks; i++) {
        let v = (i / stacks) * Math.PI; // 0 → π
        for (let j = 0; j <= steps; j++) {
            let u = (j / steps) * 2 * Math.PI; // 0 → 2π

            // rumus ellipsoid
            let x = a * Math.cos(u) * Math.sin(v);
            let y = b * Math.sin(u) * Math.sin(v);
            let z = c * Math.cos(v);

            vertices.push(x, y, z);

            if (!inner) {
                // hijau gelap
                vertices.push(181/255, 235/255, 145/255);
            } else {
                // hijau muda
                vertices.push(85/255, 170/255, 85/255);
            }
        }
    }

    // Faces
    for (let i = 0; i < stacks; i++) {
        for (let j = 0; j < steps; j++) {
            let first = i * (steps + 1) + j;
            let second = first + 1;
            let third = first + (steps + 1);
            let fourth = third + 1;

            faces.push(first, second, fourth);
            faces.push(first, fourth, third);
        }
    }

    return { vertices, faces };
}
