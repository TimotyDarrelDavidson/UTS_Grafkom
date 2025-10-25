import { MyObject } from "../myObject.js";
import { LIBS } from "../libs.js";
import { generateFlygonBodyBezier } from "./BodyParts/Body/FlygonBody.js";
import { generateFlygonBelly } from "./BodyParts/Body/FlygonBelly.js";
import { generateFlygonHead } from "./BodyParts/Head/FlygonHead.js";
import { generateCurvedHorn_flat } from "./BodyParts/Head/FlygonHorn.js";
import { generateFlygonThigh } from "./BodyParts/Legs/FlygonThigh.js";
import { generateFlygonFeet } from "./BodyParts/Legs/FlygonFeet.js";
import { generateFlygonTailBezier } from "./BodyParts/Tail/FlygonTail.js";
import { generateFlygonTailFins } from "./BodyParts/Tail/FlygonTailFins.js";
import { generateFlygonWing } from "./BodyParts/Body/FlygonWing.js";
import {
  generateArmSegment,
  generateHandEllipsoid,
  generateClaw,
} from "./BodyParts/Arms/FlygonArm.js";
import { generateFlygonEyes } from "./BodyParts/Head/Eyes/FlygonEyes.js";

export function createFlygon(Gl, SHADER_PROGRAM, attribs) {
  const { _position, _color, _Mmatrix } = attribs;

  // ─────────────── Geometry (body + parts) ───────────────
  var p0 = [0, 0, 0]; // tail base
  var p1 = [0, 1.2, 1.0]; // abdomen bulge forward
  var p2 = [0, 2.2, -0.2]; // chest pulls back
  var p3 = [0, 3.5, 0]; // neck

  var FlygonBody = generateFlygonBodyBezier(p0, p1, p2, p3, 1.0, 1.0, 96, 64);
  var FlygonBelly = generateFlygonBelly(0.8, 0.5, 1, 40, 40);
  var FlygonHead = generateFlygonHead(0.5, 0.4, 0.7, 40, 40);
  var FlygonHornCurved = generateCurvedHorn_flat(0.15, 0.02, 1, 8, 22, 18);
  var FlygonThigh = generateFlygonThigh(0.4, 0.6, 0.7, 40, 40, false);
  var FlygonInnerThigh = generateFlygonThigh(0.4, 0.7, 0.5, 40, 40, true);
  var FlygonFeetGeo = generateFlygonFeet(0.2, 0.2, 1, 20, 20);
  var FlygonTail = generateFlygonTailBezier(
    [0, 0, 0],
    [0, -3, -5],
    [-1, -3, 2],
    [-1, -4, 3],
    0.8,
    0.8,
    60,
    20
  );
  var FlygonTailFins = generateFlygonTailFins(1.2, {
    centerColor: [0.6, 1.0, 0.6],
    midColor: [0.4, 0.9, 0.4],
    edgeColor: [0.8, 0.2, 0.2],
    borderWidth: 0.5,
    spreadDeg: 50,
    sideSeparation: 0.9,
    twoSided: true,
  });

  var FlygonWing = generateFlygonWing(2.3, {
    redScale: 1.2, // makes the red membrane wider
    borderWidth: 0.2, // optional, still controls base shape
    twoSided: true,
  });

  // Arms (short, tapered)
  var LUpperArmGeo = generateArmSegment(0.14, 0.11, 0.1, 0.08, 0.52, 24, 20);
  var LForeArmGeo = generateArmSegment(0.12, 0.09, 0.085, 0.07, 0.45, 24, 20);
  var LHandGeo = generateHandEllipsoid(0.09, 0.07, 0.085);
  var ClawGeo = generateClaw(0.22, 0.038);
  var RUpperArmGeo = LUpperArmGeo,
    RForeArmGeo = LForeArmGeo,
    RHandGeo = LHandGeo;

  // Eyes
  var FlygonEyes = generateFlygonEyes(0.2, 0.3, 0.4, 14, 20, [1, 0, 0]);
  var FlygonPupils = generateFlygonEyes(0.1, 0.1, 0.15, 14, 20, [0, 0, 0]);

  // ─────────────── Objects ───────────────
  var Flygon = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonBody.vertices,
    FlygonBody.faces
  );
  var Belly = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonBelly.vertices,
    FlygonBelly.faces
  );
  var Head = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonHead.vertices,
    FlygonHead.faces
  );

  var leftHorn = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonHornCurved.vertices,
    FlygonHornCurved.faces
  );
  var rightHorn = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonHornCurved.vertices,
    FlygonHornCurved.faces
  );

  var leftInnerThigh = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonInnerThigh.vertices,
    FlygonInnerThigh.faces
  );
  var rightInnerThigh = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonInnerThigh.vertices,
    FlygonInnerThigh.faces
  );
  var leftThigh = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonThigh.vertices,
    FlygonThigh.faces
  );
  var rightThigh = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonThigh.vertices,
    FlygonThigh.faces
  );

  var leftFeet = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonFeetGeo.vertices,
    FlygonFeetGeo.faces
  );
  var rightFeet = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonFeetGeo.vertices,
    FlygonFeetGeo.faces
  );

  var tail = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonTail.vertices,
    FlygonTail.faces
  );
  var tailFins = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonTailFins.vertices,
    FlygonTailFins.faces
  );
  var leftWing = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonWing.vertices,
    FlygonWing.faces
  );
  var rightWing = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonWing.vertices,
    FlygonWing.faces
  );

  var LUpperArm = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    LUpperArmGeo.vertices,
    LUpperArmGeo.faces
  );
  var LForeArm = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    LForeArmGeo.vertices,
    LForeArmGeo.faces
  );
  var LHand = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    LHandGeo.vertices,
    LHandGeo.faces
  );
  var LClaw1 = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    ClawGeo.vertices,
    ClawGeo.faces
  );
  var LClaw2 = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    ClawGeo.vertices,
    ClawGeo.faces
  );
  var LClaw3 = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    ClawGeo.vertices,
    ClawGeo.faces
  );

  var RUpperArm = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    RUpperArmGeo.vertices,
    RUpperArmGeo.faces
  );
  var RForeArm = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    RForeArmGeo.vertices,
    RForeArmGeo.faces
  );
  var RHand = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    RHandGeo.vertices,
    RHandGeo.faces
  );
  var RClaw1 = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    ClawGeo.vertices,
    ClawGeo.faces
  );
  var RClaw2 = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    ClawGeo.vertices,
    ClawGeo.faces
  );
  var RClaw3 = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    ClawGeo.vertices,
    ClawGeo.faces
  );
  var LEyes = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonEyes.vertices,
    FlygonEyes.faces
  );
  var REyes = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonEyes.vertices,
    FlygonEyes.faces
  );
  var LPupils = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonPupils.vertices,
    FlygonPupils.faces
  );
  var RPupils = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    FlygonPupils.vertices,
    FlygonPupils.faces
  );

  // ─────────────── Base transforms ───────────────
  // Belly
  LIBS.translateY(Belly.MOVE_MATRIX, 0.1);

  // Head
  LIBS.translateY(Head.MOVE_MATRIX, 3.4);
  LIBS.rotateX(Head.MOVE_MATRIX, (-10 * Math.PI) / 180);

  // Horns (relative to head)
  LIBS.translateX(leftHorn.MOVE_MATRIX, -0.18);
  LIBS.translateY(leftHorn.MOVE_MATRIX, 0.4);
  LIBS.translateZ(leftHorn.MOVE_MATRIX, 0.1);
  LIBS.rotateZ(leftHorn.MOVE_MATRIX, (140 * Math.PI) / 180);
  LIBS.rotateY(leftHorn.MOVE_MATRIX, (-70 * Math.PI) / 180);

  LIBS.translateX(rightHorn.MOVE_MATRIX, 0.18);
  LIBS.translateY(rightHorn.MOVE_MATRIX, 0.4);
  LIBS.translateZ(rightHorn.MOVE_MATRIX, 0.1);
  LIBS.rotateZ(rightHorn.MOVE_MATRIX, (140 * Math.PI) / 180);
  LIBS.rotateY(rightHorn.MOVE_MATRIX, (-100 * Math.PI) / 180);

  // Thigh anchors
  LIBS.translateX(leftInnerThigh.MOVE_MATRIX, -0.7);
  LIBS.translateZ(leftInnerThigh.MOVE_MATRIX, 0.3);
  LIBS.rotateX(leftInnerThigh.MOVE_MATRIX, (40 * Math.PI) / 180);

  LIBS.translateX(rightInnerThigh.MOVE_MATRIX, 0.7);
  LIBS.translateZ(rightInnerThigh.MOVE_MATRIX, 0.3);
  LIBS.rotateX(rightInnerThigh.MOVE_MATRIX, (40 * Math.PI) / 180);

  // Outer Thighs
  LIBS.translateY(leftThigh.MOVE_MATRIX, -0.1);
  LIBS.scaleX(leftThigh.MOVE_MATRIX, 1.5);
  LIBS.translateY(rightThigh.MOVE_MATRIX, -0.1);
  LIBS.scaleX(rightThigh.MOVE_MATRIX, 1.5);

  // Feet
  LIBS.translateY(leftFeet.MOVE_MATRIX, -0.6);
  LIBS.translateZ(leftFeet.MOVE_MATRIX, 0.2);
  LIBS.rotateX(leftFeet.MOVE_MATRIX, (20 * Math.PI) / 180);

  LIBS.translateY(rightFeet.MOVE_MATRIX, -0.6);
  LIBS.translateZ(rightFeet.MOVE_MATRIX, 0.2);
  LIBS.rotateX(rightFeet.MOVE_MATRIX, (20 * Math.PI) / 180);

  // Wings (children of Head → appear near shoulders)
  // Wing parameters
  const wingSize = 2.3;
  const pivotY = wingSize * 2 * 1.2; // bottom point is at -size*2

  // ─────────────── Arms (natural forward/down pose) ───────────────
  // --- LEFT ARM (natural: sedikit turun & maju) ---
  LIBS.set_I4(LUpperArm.MOVE_MATRIX);
  LIBS.translateX(LUpperArm.MOVE_MATRIX, -0.27);
  LIBS.translateY(LUpperArm.MOVE_MATRIX, 1.62);
  LIBS.translateZ(LUpperArm.MOVE_MATRIX, 0.6);
  LIBS.rotateZ(LUpperArm.MOVE_MATRIX, (20 * Math.PI) / 180);
  LIBS.rotateX(LUpperArm.MOVE_MATRIX, (120 * Math.PI) / 180);
  LIBS.rotateY(LUpperArm.MOVE_MATRIX, (-3 * Math.PI) / 180);

  LIBS.set_I4(LForeArm.MOVE_MATRIX);
  LIBS.translateY(LForeArm.MOVE_MATRIX, 0.5);
  LIBS.rotateX(LForeArm.MOVE_MATRIX, (-100 * Math.PI) / 180);

  LIBS.set_I4(LHand.MOVE_MATRIX);
  LIBS.translateY(LHand.MOVE_MATRIX, 0.5);

  // claws kiri
  LIBS.set_I4(LClaw1.MOVE_MATRIX);
  LIBS.rotateX(LClaw1.MOVE_MATRIX, Math.PI / 2);
  LIBS.translateZ(LClaw1.MOVE_MATRIX, 0.13);

  LIBS.set_I4(LClaw2.MOVE_MATRIX);
  LIBS.rotateX(LClaw2.MOVE_MATRIX, Math.PI / 2);
  LIBS.rotateY(LClaw2.MOVE_MATRIX, (18 * Math.PI) / 180);
  LIBS.translateX(LClaw2.MOVE_MATRIX, 0.05);
  LIBS.translateZ(LClaw2.MOVE_MATRIX, 0.12);

  LIBS.set_I4(LClaw3.MOVE_MATRIX);
  LIBS.rotateX(LClaw3.MOVE_MATRIX, Math.PI / 2);
  LIBS.rotateY(LClaw3.MOVE_MATRIX, (-18 * Math.PI) / 180);
  LIBS.translateX(LClaw3.MOVE_MATRIX, -0.05);
  LIBS.translateZ(LClaw3.MOVE_MATRIX, 0.12);

  // --- RIGHT ARM (mirror) ---
  LIBS.set_I4(RUpperArm.MOVE_MATRIX);
  LIBS.translateX(RUpperArm.MOVE_MATRIX, 0.27);
  LIBS.translateY(RUpperArm.MOVE_MATRIX, 1.62);
  LIBS.translateZ(RUpperArm.MOVE_MATRIX, 0.6);
  LIBS.rotateZ(RUpperArm.MOVE_MATRIX, (-20 * Math.PI) / 180);
  LIBS.rotateX(RUpperArm.MOVE_MATRIX, (120 * Math.PI) / 180);
  LIBS.rotateY(RUpperArm.MOVE_MATRIX, (3 * Math.PI) / 180);

  LIBS.set_I4(RForeArm.MOVE_MATRIX);
  LIBS.translateY(RForeArm.MOVE_MATRIX, 0.5);
  LIBS.rotateX(RForeArm.MOVE_MATRIX, (-100 * Math.PI) / 180);

  LIBS.set_I4(RHand.MOVE_MATRIX);
  LIBS.translateY(RHand.MOVE_MATRIX, 0.5);

  // claws kanan
  LIBS.set_I4(RClaw1.MOVE_MATRIX);
  LIBS.rotateX(RClaw1.MOVE_MATRIX, Math.PI / 2);
  LIBS.translateZ(RClaw1.MOVE_MATRIX, 0.13);

  LIBS.set_I4(RClaw2.MOVE_MATRIX);
  LIBS.rotateX(RClaw2.MOVE_MATRIX, Math.PI / 2);
  LIBS.rotateY(RClaw2.MOVE_MATRIX, (-18 * Math.PI) / 180);
  LIBS.translateX(RClaw2.MOVE_MATRIX, -0.05);
  LIBS.translateZ(RClaw2.MOVE_MATRIX, 0.12);

  LIBS.set_I4(RClaw3.MOVE_MATRIX);
  LIBS.rotateX(RClaw3.MOVE_MATRIX, Math.PI / 2);
  LIBS.rotateY(RClaw3.MOVE_MATRIX, (18 * Math.PI) / 180);
  LIBS.translateX(RClaw3.MOVE_MATRIX, 0.05);
  LIBS.translateZ(RClaw3.MOVE_MATRIX, 0.12);

  // Eyes (child of Head)
  LEyes.alpha = 0.6; // semi-transparan
  LIBS.translateX(LPupils.MOVE_MATRIX, -0.4);
  LIBS.translateZ(LPupils.MOVE_MATRIX, 0.38);
  LIBS.rotateY(LPupils.MOVE_MATRIX, (20 * Math.PI) / 180);
  LIBS.translateZ(LEyes.MOVE_MATRIX, -0.1);

  REyes.alpha = 0.6;
  LIBS.translateX(RPupils.MOVE_MATRIX, 0.4);
  LIBS.translateZ(RPupils.MOVE_MATRIX, 0.38);
  LIBS.rotateY(RPupils.MOVE_MATRIX, (-20 * Math.PI) / 180);
  LIBS.translateZ(REyes.MOVE_MATRIX, -0.1);

  // ─────────────── Hierarchy ───────────────
  Flygon.childs.push(Belly);
  Flygon.childs.push(Head);

  Head.childs.push(leftWing);
  Head.childs.push(rightWing);
  Head.childs.push(leftHorn);
  Head.childs.push(rightHorn);

  Belly.childs.push(leftInnerThigh);
  Belly.childs.push(rightInnerThigh);
  leftInnerThigh.childs.push(leftThigh);
  rightInnerThigh.childs.push(rightThigh);
  leftThigh.childs.push(leftFeet);
  rightThigh.childs.push(rightFeet);

  Belly.childs.push(tail);
  tail.childs.push(tailFins);

  // Arms hierarchy
  Belly.childs.push(LUpperArm);
  LUpperArm.childs.push(LForeArm);
  LForeArm.childs.push(LHand);
  LHand.childs.push(LClaw1);
  LHand.childs.push(LClaw2);
  LHand.childs.push(LClaw3);

  Belly.childs.push(RUpperArm);
  RUpperArm.childs.push(RForeArm);
  RForeArm.childs.push(RHand);
  RHand.childs.push(RClaw1);
  RHand.childs.push(RClaw2);
  RHand.childs.push(RClaw3);

  // Eyes (child of Head)
  Head.childs.push(LPupils);
  Head.childs.push(RPupils);
  LPupils.childs.push(LEyes);
  RPupils.childs.push(REyes);

  // Buffer setup (recursively)
  Flygon.setup();

  // --- Tail fins: auto-place to tail tip & orient to tail direction ---
  function getTipBaseFromVertices(vtx) {
    // vertices are [x,y,z,r,g,b,...]
    let minY = Infinity,
      maxY = -Infinity;
    let tip = [0, 0, 0],
      base = [0, 0, 0];

    for (let i = 0; i < vtx.length; i += 6) {
      const x = vtx[i + 0],
        y = vtx[i + 1],
        z = vtx[i + 2];
      if (y < minY) {
        minY = y;
        tip = [x, y, z];
      }
      if (y > maxY) {
        maxY = y;
        base = [x, y, z];
      }
    }
    return { tip, base };
  }
  const { tip, base } = getTipBaseFromVertices(FlygonTail.vertices);

  // direction from base->tip (tail axis)
  let dx = tip[0] - base[0],
    dy = tip[1] - base[1],
    dz = tip[2] - base[2];
  const len = Math.hypot(dx, dy, dz) || 1.0;
  dx /= len;
  dy /= len;
  dz /= len;

  // Rotate +Z ke (dx,dy,dz)
  const yaw = Math.atan2(dx, dz);
  const pitch = -Math.atan2(dy, Math.hypot(dx, dz));

  // push sedikit biar gak clip
  const push = 0.04;
  const px = tip[0] + dx * push;
  const py = tip[1] + dy * push;
  const pz = tip[2] + dz * push;

  function animate(t, orbit = { theta: 0, phi: 0 }) {
    Flygon.MOVE_MATRIX = LIBS.get_I4();
    LIBS.rotateX(Flygon.MOVE_MATRIX, (40 * Math.PI) / 180);
    let temp = LIBS.get_I4();
    LIBS.rotateY(temp, orbit.theta);
    Flygon.MOVE_MATRIX = LIBS.multiply(Flygon.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateX(temp, orbit.phi);
    Flygon.MOVE_MATRIX = LIBS.multiply(Flygon.MOVE_MATRIX, temp);
    LIBS.translateZ(temp, -0.6);
    Flygon.MOVE_MATRIX = LIBS.multiply(Flygon.MOVE_MATRIX, temp);

    // ─────────────── Idle Animation ───────────────

    const wingFlap = Math.sin(t * 10) * ((40 * Math.PI) / 180); // ±10°
    const tailWave = Math.sin(t * 1) * ((8 * Math.PI) / 180);
    const bodyBob = Math.sin(t * 2) * 0.1;

    // Wings flap
    // Left wing
    LIBS.set_I4(leftWing.MOVE_MATRIX);
    temp = LIBS.get_I4();
    LIBS.translateY(temp, pivotY);
    leftWing.MOVE_MATRIX = LIBS.multiply(leftWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateZ(temp, (40 * Math.PI) / 180);
    leftWing.MOVE_MATRIX = LIBS.multiply(leftWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateX(temp, (30 * Math.PI) / 180 + wingFlap);
    leftWing.MOVE_MATRIX = LIBS.multiply(leftWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateY(temp, -(60 * Math.PI) / 180);
    leftWing.MOVE_MATRIX = LIBS.multiply(leftWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.translateZ(temp, -0.3);
    leftWing.MOVE_MATRIX = LIBS.multiply(leftWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.translateY(temp, -2);
    leftWing.MOVE_MATRIX = LIBS.multiply(leftWing.MOVE_MATRIX, temp);

    // Right wing
    LIBS.set_I4(rightWing.MOVE_MATRIX);
    temp = LIBS.get_I4();
    LIBS.translateY(temp, pivotY);
    rightWing.MOVE_MATRIX = LIBS.multiply(rightWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateZ(temp, -(40 * Math.PI) / 180);
    rightWing.MOVE_MATRIX = LIBS.multiply(rightWing.MOVE_MATRIX, temp);


    temp = LIBS.get_I4();
    LIBS.rotateX(temp, (30 * Math.PI) / 180 + wingFlap);
    rightWing.MOVE_MATRIX = LIBS.multiply(rightWing.MOVE_MATRIX, temp);
    temp = LIBS.get_I4();

    LIBS.rotateY(temp, (60 * Math.PI) / 180);
    rightWing.MOVE_MATRIX = LIBS.multiply(rightWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.translateZ(temp, -0.3);
    rightWing.MOVE_MATRIX = LIBS.multiply(rightWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.translateY(temp, -2);
    rightWing.MOVE_MATRIX = LIBS.multiply(rightWing.MOVE_MATRIX, temp);

    // Tail wave
    LIBS.set_I4(tail.MOVE_MATRIX);
    LIBS.rotateX(tail.MOVE_MATRIX, tailWave);
    // LIBS.translateY(tail.MOVE_MATRIX, bodyBob);

    // Tail fins follow tail
    LIBS.set_I4(tailFins.MOVE_MATRIX);
    LIBS.translateX(tailFins.MOVE_MATRIX, px);
    LIBS.translateY(tailFins.MOVE_MATRIX, py - 0.3);
    LIBS.translateZ(tailFins.MOVE_MATRIX, pz + 0.5);
    LIBS.rotateY(tailFins.MOVE_MATRIX, yaw);
    LIBS.rotateX(tailFins.MOVE_MATRIX, pitch + tailWave * 0.5);
    LIBS.rotateY(tailFins.MOVE_MATRIX, Math.PI);

    // Body bobbing (breathing)
    LIBS.set_I4(Belly.MOVE_MATRIX);
    LIBS.translateY(Belly.MOVE_MATRIX, 0.1 + bodyBob);

    // Head follows body slightly
    const breath = 1 + Math.sin(t * 5.0) * 0.04;

    LIBS.set_I4(Head.MOVE_MATRIX);
    LIBS.translateY(Head.MOVE_MATRIX, 3.4 + bodyBob * 1.2);
    LIBS.rotateX(Head.MOVE_MATRIX, (-10 * Math.PI) / 180 + bodyBob * 0.1);
    LIBS.scaleX(Head.MOVE_MATRIX, breath);
    LIBS.scaleY(Head.MOVE_MATRIX, breath);
    LIBS.scaleZ(Head.MOVE_MATRIX, breath);
  }

  return {
    root: Flygon,
    parts: { leftWing, rightWing, tail, tailFins, Belly, Head },
    animate
  };
}
