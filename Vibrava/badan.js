// Vibrava-like tapered body with tail-only bend
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

  for (let i = 0; i <= stacks; i++) {
    const t = i / stacks;          // 0=head → 1=tail
    const x = (len / 2) - len * t; // head at +len/2
    const ry = radiusY(t);
    const rz = radiusZ(t) * skew(t);

    // stripe blend
    let d = 1;
    for (let k = 0; k < bandCenters.length; k++) d = Math.min(d, Math.abs(t - bandCenters[k]));
    const stripeMask = smooth(Math.min(1, d / (bandWidth * 0.5)));
    const rCol = stripeMask * bodyBase[0] + (1 - stripeMask) * stripeCol[0];
    const gCol = stripeMask * bodyBase[1] + (1 - stripeMask) * stripeCol[1];
    const bCol = stripeMask * bodyBase[2] + (1 - stripeMask) * stripeCol[2];

    const ht = 0.06 * (0.7 - t);
    const baseR = Math.min(1, rCol + ht);
    const baseG = Math.min(1, gCol + ht);
    const baseB = Math.min(1, bCol + ht);

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

  // faces
  const ring = radial + 1;
  for (let i = 0; i < stacks; i++) {
    const r0 = i * ring, r1 = (i + 1) * ring;
    for (let j = 0; j < radial; j++) {
      const a = r0 + j, b = r0 + j + 1, c = r1 + j, d = r1 + j + 1;
      F.push(a, b, d, a, d, c);
    }
  }

  return { vertices: V, faces: F };
}
