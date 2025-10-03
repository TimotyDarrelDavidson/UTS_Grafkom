// FlygonFeet.js
export function generateFlygonFeet(a, b, c, stacks, steps) {
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

            if (z > 0.7 * c) {
                // dark green claws
                vertices.push(50/255, 120/255, 50/255);
            } else {
                // light green foot
                vertices.push(214/255, 216/255, 93/255);
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
