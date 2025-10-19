// mata.js — versi perbaikan arah & posisi
export function generateMata(radius, offsetX, offsetY, offsetZ, tiltAngle, stack, step) {
    var vertices = [];
    var faces = [];

    // === Bola mata hijau ===
    for (var i = 0; i <= stack; i++) {
        var u = i / stack * Math.PI - (Math.PI / 2);
        for (var j = 0; j <= step; j++) {
            var v = j / step * 2 * Math.PI;

            // bentuk ellipsoid
            var x = radius * Math.cos(u) * Math.cos(v);
            var y = radius * Math.cos(u) * Math.sin(v);
            var z = radius * Math.sin(u);

            // rotasi keluar (sekitar Z)
            var yTilt = y * Math.cos(tiltAngle) - x * Math.sin(tiltAngle);
            var xTilt = y * Math.sin(tiltAngle) + x * Math.cos(tiltAngle);

            vertices.push(xTilt + offsetX, yTilt + offsetY, z + offsetZ);
            vertices.push(0.3, 0.8, 0.3); // warna hijau terang
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

    // === Pupil hitam datar di depan mata ===
    var pupilBase = vertices.length / 6;
    var pupilRadius = radius * 0.7;
    var pupilDepth = radius * 0.95;

    for (var j = 0; j <= step; j++) {
        var angle = j / step * 2 * Math.PI;

        var x = pupilDepth;
        var y = pupilRadius * Math.cos(angle);
        var z = pupilRadius * Math.sin(angle);

        // rotasi pupil ke arah tilt
        var yTilt = y * Math.cos(tiltAngle) - x * Math.sin(tiltAngle);
        var xTilt = y * Math.sin(tiltAngle) + x * Math.cos(tiltAngle);

        // geser ke posisi mata
        vertices.push(xTilt + offsetX, yTilt + offsetY, z + offsetZ);
        vertices.push(0.0, 0.0, 0.0);
    }

    vertices.push(offsetX + pupilDepth * Math.cos(tiltAngle),
                  offsetY + pupilDepth * Math.sin(tiltAngle),
                  offsetZ);
    vertices.push(0.0, 0.0, 0.0);

    var centerIdx = pupilBase + step + 1;
    for (var j = 0; j < step; j++) {
        faces.push(centerIdx, pupilBase + j, pupilBase + j + 1);
    }

    return { vertices, faces };
}
