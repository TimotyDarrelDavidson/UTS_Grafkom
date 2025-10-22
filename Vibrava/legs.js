// Generate a single leg segment (thigh, shin, or foot)
function generateLegSegment(length, radiusTop, radiusBottom, segments = 8, color = [0.2, 0.2, 0.2]) {
  const V = [];
  const F = [];

  // Create cylinder with taper
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = -length * t; // goes downward
    const radius = radiusTop + (radiusBottom - radiusTop) * t;

    for (let j = 0; j <= segments; j++) {
      const angle = (j / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Add shading variation
      const shade = 0.8 + 0.2 * Math.cos(angle);
      V.push(x, y, z, color[0] * shade, color[1] * shade, color[2] * shade);
    }
  }

  // Create faces
  const ring = segments + 1;
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * ring + j;
      const b = a + 1;
      const c = (i + 1) * ring + j;
      const d = c + 1;
      F.push(a, b, d, a, d, c);
    }
  }

  // Add caps
  const topCenter = V.length / 6;
  V.push(0, 0, 0, color[0], color[1], color[2]);
  
  const bottomCenter = V.length / 6;
  V.push(0, -length, 0, color[0], color[1], color[2]);

  // Top cap
  for (let j = 0; j < segments; j++) {
    F.push(topCenter, j, j + 1);
  }

  // Bottom cap
  const lastRing = segments * ring;
  for (let j = 0; j < segments; j++) {
    F.push(bottomCenter, lastRing + j + 1, lastRing + j);
  }

  return { vertices: V, faces: F };
}

// Generate complete leg with multiple toes
export function generateVibravaLeg(config = {}) {
  const {
    thighLength = 1.2,
    thighRadius = 0.3,
    shinLength = 1.5,
    shinRadius = 0.1,
    footLength = 0.8,
    footRadius = 0.08,
    toeLength = 0.3,
    color = [0.25, 0.25, 0.2],
  } = config;

  // Generate segments
  const thigh = generateLegSegment(thighLength, thighRadius, thighRadius * 0.8, 8, color);
  const shin = generateLegSegment(shinLength, shinRadius, shinRadius * 0.7, 8, color);
  const foot = generateLegSegment(footLength, footRadius, footRadius * 0.5, 6, color);
  const leftToe = generateLegSegment(toeLength, footRadius * 0.4, footRadius * 0.2, 6, color);
  const rightToe = generateLegSegment(toeLength, footRadius * 0.4, footRadius * 0.2, 6, color);

  return {
    thigh,
    shin,
    foot,
    leftToe,
    rightToe
  };
}

// Helper to position legs
export function getLegPositions() {
  return {
    frontLeft: {
      base: { x: 2.5, y: -0.3, z: 0.6 },
      angles: { hip: 100, knee: 90, leftToe: 60, rightToe: 60 }
    },
    frontRight: {
      base: { x: 2.5, y: -0.3, z: -0.6 },
      angles: { hip: 100, knee: -90, leftToe: 60, rightToe: 60 }
    },
    backLeft: {
      base: { x: 0.5, y: -0.4, z: 0.7 },
      angles: { hip: 100, knee: 90, leftToe: 65, rightToe: 65 }
    },
    backRight: {
      base: { x: 0.5, y: -0.4, z: -0.7 },
      angles: { hip: 100, knee: -90, leftToe: 65, rightToe: 65 }
    }
  };
}