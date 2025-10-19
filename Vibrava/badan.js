// badanWithStripes.js
export function generateBadanWithStripes(a, b, c, stack, step) {
    var vertices = [];
    var faces = [];

    // === BADAN (Ellipsoid utama) ===
    for (var i = 0; i <= stack; i++) {
        var u = i / stack * Math.PI - (Math.PI / 2);
        for (var j = 0; j <= step; j++) {
            var v = j / step * 2 * Math.PI;

            var x = a * Math.cos(v) * Math.cos(u);
            var y = b * Math.sin(u);
            var z = c * Math.sin(v) * Math.cos(u);

            vertices.push(x, y, z);

            // Warna utama badan (hijau kekuningan)
            vertices.push(0.85, 0.9, 0.6);
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

    // === STRIPES (lebih banyak dan lembut) ===
    var stripeVertices = [];
    var stripeFaces = [];
    var stripeOffset = vertices.length / 6;

    var numStripes = 10;               // jumlah garis (lebih banyak)
    var bandThickness = 0.05 * a;      // ketebalan tiap stripe
    var outward = 1.01;                // sedikit keluar biar tidak tertutup badan

    for (var s = 1; s <= numStripes; s++) {
        var t = s / (numStripes + 1); // posisi X normalisasi

        // posisi pusat stripe di sumbu X
        var xCenter = -a * 0.8 + (2 * a * 0.8) * t;

        // radius tubuh di posisi ini (supaya mengikuti bentuk ellipsoid)
        var scaleXZ = Math.sqrt(1 - (xCenter * xCenter) / (a * a));
        var radiusY = b * scaleXZ;
        var radiusZ = c * scaleXZ;

        // dua ring membentuk satu pita
        for (var ring = 0; ring < 2; ring++) {
            var offsetX = xCenter + (ring === 0 ? -bandThickness / 2 : bandThickness / 2);
            for (var j = 0; j <= step; j++) {
                var angle = j / step * 2 * Math.PI;

                var x = offsetX;
                var y = outward * radiusY * Math.cos(angle);
                var z = outward * radiusZ * Math.sin(angle);

                // Warna stripe abu-abu kehijauan (menyatu dengan badan)
                stripeVertices.push(x, y, z);
                stripeVertices.push(0.7, 0.8, 0.7);
            }
        }

        // Buat faces antar dua ring
        var ringSize = step + 1;
        var base = stripeOffset + (s - 1) * ringSize * 2;
        for (var j = 0; j < step; j++) {
            var first = base + j;
            var second = first + 1;
            var third = first + ringSize;
            var fourth = third + 1;

            stripeFaces.push(first, second, fourth);
            stripeFaces.push(first, fourth, third);
        }
    }

    // Gabungkan mesh badan dan stripes
    return {
        vertices: vertices.concat(stripeVertices),
        faces: faces.concat(stripeFaces)
    };
}
