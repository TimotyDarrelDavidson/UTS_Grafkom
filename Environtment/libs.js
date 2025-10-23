// libs.js - VERSI LENGKAP DENGAN SCALE
export const LIBS = (function(){
  function get_I4(){
    return [1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1];
  }

  function set_I4(m){
    if(!m || m.length !== 16) return;
    m[0]=1; m[1]=0; m[2]=0; m[3]=0;
    m[4]=0; m[5]=1; m[6]=0; m[7]=0;
    m[8]=0; m[9]=0; m[10]=1; m[11]=0;
    m[12]=0; m[13]=0; m[14]=0; m[15]=1;
    return m;
  }

  function multiply(a,b){
    const out = new Array(16);
    for(let r=0;r<4;r++){
      for(let c=0;c<4;c++){
        let s = 0;
        for(let k=0;k<4;k++) s += a[r*4+k]*b[k*4+c];
        out[r*4+c] = s;
      }
    }
    return out;
  }

  function translate(m, v){
    const t = get_I4();
    t[12]=v[0]; t[13]=v[1]; t[14]=v[2];
    return multiply(m,t);
  }

  function translateX(m, v){
    m[12] = (m[12]||0) + v;
    return m;
  }
  function translateY(m, v){
    m[13] = (m[13]||0) + v;
    return m;
  }
  function translateZ(m, v){
    m[14] = (m[14]||0) + v;
    return m;
  }

  function rotateX(m, angle){
    const c = Math.cos(angle), s = Math.sin(angle);
    const rot = [
      1,0,0,0,
      0,c,s,0,
      0,-s,c,0,
      0,0,0,1
    ];
    const res = multiply(rot, m);
    for(let i=0;i<16;i++) m[i]=res[i];
    return m;
  }

  function rotateY(m, angle){
    const c = Math.cos(angle), s = Math.sin(angle);
    const rot = [
      c,0,-s,0,
      0,1,0,0,
      s,0,c,0,
      0,0,0,1
    ];
    const res = multiply(rot, m);
    for(let i=0;i<16;i++) m[i]=res[i];
    return m;
  }

  function rotateZ(m, angle){
    const c = Math.cos(angle), s = Math.sin(angle);
    const rot = [
      c,s,0,0,
      -s,c,0,0,
      0,0,1,0,
      0,0,0,1
    ];
    const res = multiply(rot, m);
    for(let i=0;i<16;i++) m[i]=res[i];
    return m;
  }

  function perspective(fovy, aspect, near, far){
    const f = 1.0 / Math.tan(fovy/2);
    const nf = 1/(near - far);
    const out = new Array(16).fill(0);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[14] = (2 * far * near) * nf;
    return out;
  }

  function get_projection(angle, a, zMin, zMax) {
    const ang = Math.tan((angle * 0.5) * Math.PI / 180);
    return [
      0.5 / ang, 0, 0, 0,
      0, 0.5 * a / ang, 0, 0,
      0, 0, -(zMax + zMin) / (zMax - zMin), -1,
      0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
    ];
  }

  function lookAt(eye, center, up){
    const z0 = eye[0]-center[0], z1 = eye[1]-center[1], z2 = eye[2]-center[2];
    let len = Math.hypot(z0,z1,z2);
    const zx = z0/len, zy = z1/len, zz = z2/len;
    const ux = up[0], uy = up[1], uz = up[2];
    const xx = uy*zz - uz*zy;
    const xy = uz*zx - ux*zz;
    const xz = ux*zy - uy*zx;
    len = Math.hypot(xx,xy,xz);
    const rx = xx/len, ry = xy/len, rz = xz/len;
    const vx = zy*rz - zz*ry;
    const vy = zz*rx - zx*rz;
    const vz = zx*ry - zy*rx;
    const out = [rx, vx, zx, 0,
                 ry, vy, zy, 0,
                 rz, vz, zz, 0,
                 0,  0,  0,  1];
    out[12] = -(rx*eye[0] + ry*eye[1] + rz*eye[2]);
    out[13] = -(vx*eye[0] + vy*eye[1] + vz*eye[2]);
    out[14] = -(zx*eye[0] + zy*eye[1] + zz*eye[2]);
    return out;
  }

  // === TAMBAHKAN SCALE FUNCTIONS DI SINI ===
  function scale(m, sx, sy, sz) {
    const scaleMatrix = get_I4();
    scaleMatrix[0] = sx;
    scaleMatrix[5] = sy; 
    scaleMatrix[10] = sz;
    return multiply(m, scaleMatrix);
  }

  function scaleInPlace(m, sx, sy, sz) {
    const scaled = scale(m, sx, sy, sz);
    for(let i=0; i<16; i++) m[i] = scaled[i];
    return m;
  }

  return { 
    get_I4, set_I4, multiply, translate, 
    translateX, translateY, translateZ,
    rotateX, rotateY, rotateZ,
    perspective, get_projection, lookAt,
    scale, scaleInPlace
  };
})();