export const LIBS = {
  degToRad: function (angle) {
    return (angle * Math.PI) / 180;
  },

  get_projection: function (angle, a, zMin, zMax) {
    var tan = Math.tan(LIBS.degToRad(0.5 * angle)),
      A = -(zMax + zMin) / (zMax - zMin),
      B = (-2 * zMax * zMin) / (zMax - zMin);

    return [
      0.5 / tan,
      0,
      0,
      0,
      0,
      (0.5 * a) / tan,
      0,
      0,
      0,
      0,
      A,
      -1,
      0,
      0,
      B,
      0,
    ];
  },

  get_I4: function () {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  },

  set_I4: function (m) {
    (m[0] = 1),
      (m[1] = 0),
      (m[2] = 0),
      (m[3] = 0),
      (m[4] = 0),
      (m[5] = 1),
      (m[6] = 0),
      (m[7] = 0),
      (m[8] = 0),
      (m[9] = 0),
      (m[10] = 1),
      (m[11] = 0),
      (m[12] = 0),
      (m[13] = 0),
      (m[14] = 0),
      (m[15] = 1);
  },

  rotateX: function (m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv1 = m[1],
      mv5 = m[5],
      mv9 = m[9];
    m[1] = m[1] * c - m[2] * s;
    m[5] = m[5] * c - m[6] * s;
    m[9] = m[9] * c - m[10] * s;

    m[2] = m[2] * c + mv1 * s;
    m[6] = m[6] * c + mv5 * s;
    m[10] = m[10] * c + mv9 * s;
  },

  rotateY: function (m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0],
      mv4 = m[4],
      mv8 = m[8];
    m[0] = c * m[0] + s * m[2];
    m[4] = c * m[4] + s * m[6];
    m[8] = c * m[8] + s * m[10];

    m[2] = c * m[2] - s * mv0;
    m[6] = c * m[6] - s * mv4;
    m[10] = c * m[10] - s * mv8;
  },

  rotateZ: function (m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0],
      mv4 = m[4],
      mv8 = m[8];
    m[0] = c * m[0] - s * m[1];
    m[4] = c * m[4] - s * m[5];
    m[8] = c * m[8] - s * m[9];

    m[1] = c * m[1] + s * mv0;
    m[5] = c * m[5] + s * mv4;
    m[9] = c * m[9] + s * mv8;
  },

  translateZ: function (m, t) {
    m[14] += t;
  },
  translateX: function (m, t) {
    m[12] += t;
  },
  translateY: function (m, t) {
    m[13] += t;
  },

  scaleZ: function (m, s) {
    m[2] *= s;
    m[6] *= s;
    m[10] *= s;
  },
  scaleX: function (m, s) {
    m[0] *= s;
    m[4] *= s;
    m[8] *= s;
  },
  scaleY: function (m, s) {
    m[1] *= s;
    m[5] *= s;
    m[9] *= s;
  },

  set_position: function (m, x, y, z) {
    (m[12] = x), (m[13] = y), (m[14] = z);
  },

  multiply: function (m1, m2) {
    var rm = this.get_I4();
    var N = 4;
    for (var i = 0; i < N; i++) {
      for (var j = 0; j < N; j++) {
        rm[i * N + j] = 0;
        for (var k = 0; k < N; k++) {
          rm[i * N + j] += m1[i * N + k] * m2[k * N + j];
        }
      }
    }
    return rm;
  },

  // ADD THIS: Arbitrary axis rotation
    rotateArbitraryAxis: function (m, axis, angle) {
        // Normalize axis
        var len = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
        var x = axis[0] / len;
        var y = axis[1] / len;
        var z = axis[2] / len;

        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var t = 1 - c;

        // Rotation matrix for arbitrary axis (Rodrigues' rotation formula)
        var r00 = t * x * x + c;
        var r01 = t * x * y - s * z;
        var r02 = t * x * z + s * y;

        var r10 = t * x * y + s * z;
        var r11 = t * y * y + c;
        var r12 = t * y * z - s * x;

        var r20 = t * x * z - s * y;
        var r21 = t * y * z + s * x;
        var r22 = t * z * z + c;

        // Apply rotation to matrix
        var m0 = m[0], m1 = m[1], m2 = m[2];
        var m4 = m[4], m5 = m[5], m6 = m[6];
        var m8 = m[8], m9 = m[9], m10 = m[10];

        m[0] = r00 * m0 + r01 * m1 + r02 * m2;
        m[1] = r10 * m0 + r11 * m1 + r12 * m2;
        m[2] = r20 * m0 + r21 * m1 + r22 * m2;

        m[4] = r00 * m4 + r01 * m5 + r02 * m6;
        m[5] = r10 * m4 + r11 * m5 + r12 * m6;
        m[6] = r20 * m4 + r21 * m5 + r22 * m6;

        m[8] = r00 * m8 + r01 * m9 + r02 * m10;
        m[9] = r10 * m8 + r11 * m9 + r12 * m10;
        m[10] = r20 * m8 + r21 * m9 + r22 * m10;
    },
    
  scale: function (m, sx, sy, sz) {
    const scaleMatrix = this.get_I4();
    scaleMatrix[0] = sx;
    scaleMatrix[5] = sy;
    scaleMatrix[10] = sz;
    return this.multiply(m, scaleMatrix);
  },

  scaleInPlace: function (m, sx, sy, sz) {
    const scaled = this.scale(m, sx, sy, sz);
    for (let i = 0; i < 16; i++) m[i] = scaled[i];
    return m;
  },
};
