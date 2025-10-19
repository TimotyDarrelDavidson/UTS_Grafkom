// kepala.js
export function generateKepala(a, b, c, stack, step) {
    var vertices = [];
    var faces = [];

    // ======== Bagian kepala (ellipsoid) ========
    for (var i = 0; i <= stack; i++) {
        var u = i / stack * Math.PI - (Math.PI / 2);
        for (var j = 0; j <= step; j++) {
            var v = j / step * 2 * Math.PI;

            var x = a * Math.cos(v) * Math.cos(u);
            var y = b * Math.sin(u);
            var z = c * Math.sin(v) * Math.cos(u);

            vertices.push(x, y, z);
            vertices.push(0.9, 0.95, 0.6); // warna sama badan
        }
    }

    for (var i = 0; i < stack; i++) {
        for (var j = 0; j < step; j++) {
            var first = i * (step + 1) + j;
            var second = first + 1;
            var third = first + (step + 1);
            var fourth = third + 1;

            faces.push(first, second, fourth);
            faces.push(first, fourth, third);
        }
    }

    // ======== Bagian leher (cylinder tipis) ========
    var baseIndex = vertices.length / 6;
    var radius = a * 0.4; // kecil dibanding kepala
    var height = a * 1.0; // panjang ke arah X
    var steps = step;

    for (var i = 0; i <= 1; i++) { // top & bottom
        var offsetX = (i === 0) ? -height * 0.5 : height * 0.5;
        for (var j = 0; j <= steps; j++) {
            var theta = j / steps * 2 * Math.PI;
            var x = offsetX;
            var y = radius * Math.cos(theta);
            var z = radius * Math.sin(theta);

            vertices.push(x, y, z);
            vertices.push(0.8, 0.9, 0.5); // warna sedikit lebih gelap
        }
    }

    for (var j = 0; j < steps; j++) {
        var first = baseIndex + j;
        var second = baseIndex + j + 1;
        var third = baseIndex + (steps + 1) + j;
        var fourth = third + 1;

        faces.push(first, second, fourth);
        faces.push(first, fourth, third);
    }

    return { vertices, faces };
}
