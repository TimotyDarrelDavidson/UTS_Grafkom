// Vibrava-like tapered body with rounded caps (capsule shape) - CLOSED
// x = length axis (head at +x, tail at -x)
export function generateBadanVibrava(
  len = 1.2, rFront = 0.22, rBack = 0.05, stacks = 120, radial = 48
) {
  const V = [];   // [x,y,z,r,g,b]
  const F = [];

  const arcDeg = -25;                          // total bend for the tail
  const arc = arcDeg * (Math.PI / 180);
  const bendStartT = 0.4;                    // 0=head .. 1=tail; bend starts here (tail half only)

  // --- palette ---
  const bodyBase = [0.93, 0.97, 0.72];
  const stripeCol = [0.42, 0.78, 0.27];
  const shadowTint = 0.10;

  // rings (0=head -> 1=tail)
  const bandCenters = [0.10, 0.24, 0.38, 0.53, 0.69, 0.83, 0.92];
  const bandWidth = 0.045;

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const smooth = (x) => { const s = clamp01(x); return s*s*(3-2*s); };

  // taper + slight bulge near head
  const radiusY = (t) => {
    const base = rFront + (rBack - rFront) * smooth(t);
    const bulge = 0.6 * rFront * Math.exp(-((t - 0.2) ** 2) / 0.07);
    return 1.08 * (base + bulge);
  };
  const radiusZ = (t) => 0.78 * radiusY(t);

  const skew = (t) => 1 + 0.06 * Math.sin(t * 5.0);

  // pivot is the ring where bending begins (keeps the front perfectly straight)
  const pivotX = (len / 2) - len * bendStartT;

  // Helper function to get color at parameter t
  const getColorAt = (t) => {
    let d = 1;
    for (let k = 0; k < bandCenters.length; k++) d = Math.min(d, Math.abs(t - bandCenters[k]));
    const stripeMask = smooth(Math.min(1, d / (bandWidth * 0.5)));
    const rCol = stripeMask * bodyBase[0] + (1 - stripeMask) * stripeCol[0];
    const gCol = stripeMask * bodyBase[1] + (1 - stripeMask) * stripeCol[1];
    const bCol = stripeMask * bodyBase[2] + (1 - stripeMask) * stripeCol[2];

    const ht = 0.06 * (0.7 - t);
    return [
      Math.min(1, rCol + ht),
      Math.min(1, gCol + ht),
      Math.min(1, bCol + ht)
    ];
  };

  // --- 1) HEAD CAP (hemisphere at front) ---
  const capStacks = 12; // detail for hemisphere
  const headCenter = len / 2;
  const headRadius = radiusY(0);
  
  // Add center point for head cap
  const [headR, headG, headB] = getColorAt(0);
  V.push(headCenter, 0, 0, headR, headG, headB);
  const headCenterIdx = 0;
  
  for (let i = 1; i <= capStacks; i++) {
    const phi = (i / capStacks) * (Math.PI / 2); // 0 to 90 degrees
    const y0Mult = Math.sin(phi);
    const xOffset = -headRadius * Math.cos(phi); // negative because we go forward
    
    const [baseR, baseG, baseB] = getColorAt(0);
    
    for (let j = 0; j <= radial; j++) {
      const ang = (j / radial) * Math.PI * 2;
      const y = headRadius * y0Mult * Math.sin(ang);
      const z = headRadius * 0.78 * y0Mult * Math.cos(ang);
      const x = headCenter + xOffset;
      
      const shade = 1 - shadowTint * (0.5 - 0.5 * Math.sin(ang));
      V.push(x, y, z, baseR * shade, baseG * shade, baseB * shade);
    }
  }

  const headCapStart = 1; // after center point
  const headCapRings = capStacks;

  // --- 2) MAIN BODY (cylindrical part with bend) ---
  const bodyStart = V.length / 6;
  
  for (let i = 0; i <= stacks; i++) {
    const t = i / stacks;          // 0=head → 1=tail
    const x = (len / 2) - len * t; // head at +len/2
    const ry = radiusY(t);
    const rz = radiusZ(t) * skew(t);

    const [baseR, baseG, baseB] = getColorAt(t);

    // how far into the bend we are (0 before bendStartT, 1 at tail)
    const u = (t <= bendStartT) ? 0 : (t - bendStartT) / (1 - bendStartT);
    const theta = arc * smooth(u);

    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    for (let j = 0; j <= radial; j++) {
      const ang = (j / radial) * Math.PI * 2;
      const y0 = ry * Math.sin(ang);
      const z  = rz * Math.cos(ang);

      // rotate tail segment around Z at pivotX; front remains unbent
      const dx = x - pivotX;
      const xb = pivotX + dx * cosT - y0 * sinT;
      const yb =          dx * sinT + y0 * cosT;

      const shade = 1 - shadowTint * (0.5 - 0.5 * Math.sin(ang));
      V.push(xb, yb, z, baseR * shade, baseG * shade, baseB * shade);
    }
  }

  const bodyRings = stacks + 1;

  // --- 3) TAIL CAP (hemisphere at back with bend) ---
  const tailT = 1.0;
  const tailRadius = radiusY(tailT);
  const tailX = (len / 2) - len * tailT;
  
  // Get tail bend transformation
  const u = (tailT - bendStartT) / (1 - bendStartT);
  const tailTheta = arc * smooth(u);
  const tailCos = Math.cos(tailTheta);
  const tailSin = Math.sin(tailTheta);
  
  const [tailR, tailG, tailB] = getColorAt(tailT);
  
  const tailCapStart = V.length / 6;
  
  for (let i = 1; i <= capStacks; i++) {
    const phi = (i / capStacks) * (Math.PI / 2); // 0 to 90 degrees
    const y0Mult = Math.sin(phi);
    const xOffset = tailRadius * Math.cos(phi); // positive because we go backward
    
    for (let j = 0; j <= radial; j++) {
      const ang = (j / radial) * Math.PI * 2;
      const y0 = tailRadius * y0Mult * Math.sin(ang);
      const z = tailRadius * 0.78 * y0Mult * Math.cos(ang);
      const x0 = tailX - xOffset;
      
      // Apply bend transformation
      const dx = x0 - pivotX;
      const xb = pivotX + dx * tailCos - y0 * tailSin;
      const yb = dx * tailSin + y0 * tailCos;
      
      const shade = 1 - shadowTint * (0.5 - 0.5 * Math.sin(ang));
      V.push(xb, yb, z, tailR * shade, tailG * shade, tailB * shade);
    }
  }

  // Add center point for tail cap (at the tip)
  const tailTipX0 = tailX - tailRadius;
  const dxTip = tailTipX0 - pivotX;
  const tailTipX = pivotX + dxTip * tailCos;
  const tailTipY = dxTip * tailSin;
  V.push(tailTipX, tailTipY, 0, tailR, tailG, tailB);
  const tailCenterIdx = (V.length / 6) - 1;

  // --- FACES ---
  const ring = radial + 1;

  // Head cap center to first ring (cone)
  const firstHeadRing = headCapStart;
  for (let j = 0; j < radial; j++) {
    const a = headCenterIdx;
    const b = firstHeadRing + j;
    const c = firstHeadRing + j + 1;
    F.push(a, b, c);
  }

  // Head cap hemisphere rings
  for (let i = 0; i < capStacks - 1; i++) {
    const r0 = headCapStart + i * ring;
    const r1 = r0 + ring;
    for (let j = 0; j < radial; j++) {
      const a = r0 + j, b = r0 + j + 1, c = r1 + j, d = r1 + j + 1;
      F.push(a, b, d, a, d, c);
    }
  }

  // Connect head cap to body
  const lastHeadRing = headCapStart + (capStacks - 1) * ring;
  const firstBodyRing = bodyStart;
  for (let j = 0; j < radial; j++) {
    const a = lastHeadRing + j;
    const b = lastHeadRing + j + 1;
    const c = firstBodyRing + j;
    const d = firstBodyRing + j + 1;
    F.push(a, b, d, a, d, c);
  }

  // Body faces
  for (let i = 0; i < stacks; i++) {
    const r0 = bodyStart + i * ring;
    const r1 = r0 + ring;
    for (let j = 0; j < radial; j++) {
      const a = r0 + j, b = r0 + j + 1, c = r1 + j, d = r1 + j + 1;
      F.push(a, b, d, a, d, c);
    }
  }

  // Connect body to tail cap
  const lastBodyRing = bodyStart + stacks * ring;
  const firstTailRing = tailCapStart;
  for (let j = 0; j < radial; j++) {
    const a = lastBodyRing + j;
    const b = lastBodyRing + j + 1;
    const c = firstTailRing + j;
    const d = firstTailRing + j + 1;
    F.push(a, b, d, a, d, c);
  }

  // Tail cap hemisphere rings
  for (let i = 0; i < capStacks - 1; i++) {
    const r0 = tailCapStart + i * ring;
    const r1 = r0 + ring;
    for (let j = 0; j < radial; j++) {
      const a = r0 + j, b = r0 + j + 1, c = r1 + j, d = r1 + j + 1;
      F.push(a, b, d, a, d, c);
    }
  }

  // Tail cap last ring to center point (cone)
  const lastTailRing = tailCapStart + (capStacks - 1) * ring;
  for (let j = 0; j < radial; j++) {
    const a = tailCenterIdx;
    const b = lastTailRing + j + 1;
    const c = lastTailRing + j;
    F.push(a, b, c);
  }

  return { vertices: V, faces: F };
}