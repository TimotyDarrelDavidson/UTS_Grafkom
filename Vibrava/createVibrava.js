// Vibrava/createVibrava.js
import { MyObject } from "../myObject.js";
import { LIBS } from "../libs.js";

import { generateBadanVibrava } from "./badan.js";
import { generateKepala } from "./kepala.js";
import { generateMata } from "./mata.js";
import { generateCurvedCone } from "./horn.js";
import { generateWing } from "./wings.js";
import { generateVibravaLeg, getLegPositions } from "./legs.js";
import { generateVibravaWingAttachment } from "./wingAttachment.js";

export function createVibrava(Gl, SHADER_PROGRAM, attribs) {
  const { _position, _color, _Mmatrix } = attribs;

  // ───────── Geometry (same params as your Vibrava.js) ─────────
  const bodyData  = generateBadanVibrava(8, 0.8, 0.2, 120, 48);
  const headData  = generateKepala(1.4, 1.3, 1.4, 30, 30);

  const eyeData   = generateMata(0.8, 20, 20);
  const retinaData= generateMata(0.4, 20, 20, [0, 0, 0]);

  const hornOpts = {
    length: 3,
    baseRadius: 0.22,
    tipRadius: 0.03,
    stacks: 40,
    slices: 28,
    bendAngle: Math.PI / 9,
    bendAxis: "z",
  };

  const wingData = generateWing({ w: 1.5, h: 3, z: 0, color: [0.26, 0.86, 0.24] });
  const tailFinData = generateWing({ w: 1.0, h: 2.0, z: 0, color: [0.26, 0.86, 0.24], twoSided: true });

  const legData = generateVibravaLeg({
    thighLength: 1.2,
    shinLength: 1.5,
    footLength: 0.8,
    color: [0.25, 0.25, 0.2],
    clawColor: [0.15, 0.15, 0.15],
  });

  const wingAttachData = generateVibravaWingAttachment(0.2, 0.2, 1.0, 40, 40, [0.9, 0.9, 0.9]);

  // ───────── Objects ─────────
  const Body = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, bodyData.vertices, bodyData.faces);
  const Head = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, headData.vertices, headData.faces);

  const LeftEye     = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, eyeData.vertices, eyeData.faces);
  const RightEye    = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, eyeData.vertices, eyeData.faces);
  const LeftRetina  = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, retinaData.vertices, retinaData.faces);
  const RightRetina = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, retinaData.vertices, retinaData.faces);

  const LeftHorn  = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, generateCurvedCone(hornOpts).vertices,  generateCurvedCone(hornOpts).faces);
  const RightHorn = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, generateCurvedCone(hornOpts).vertices, generateCurvedCone(hornOpts).faces);

  const LeftWingAttachment  = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, wingAttachData.vertices, wingAttachData.faces);
  const RightWingAttachment = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, wingAttachData.vertices, wingAttachData.faces);

  const LeftTopWing     = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, wingData.vertices, wingData.faces);
  const LeftBottomWing  = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, wingData.vertices, wingData.faces);
  const RightTopWing    = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, wingData.vertices, wingData.faces);
  const RightBottomWing = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, wingData.vertices, wingData.faces);

  const LeftTailFin  = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, tailFinData.vertices, tailFinData.faces);
  const RightTailFin = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, tailFinData.vertices, tailFinData.faces);

  // Legs (grouped)
  const legs = {};
  const legPositions = getLegPositions();
  ["frontLeft", "frontRight", "backLeft", "backRight"].forEach((legName) => {
    legs[legName] = {
      thigh:    new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, legData.thigh.vertices,    legData.thigh.faces),
      shin:     new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, legData.shin.vertices,     legData.shin.faces),
      leftToe:  new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, legData.leftToe.vertices,  legData.leftToe.faces),
      rightToe: new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, legData.rightToe.vertices, legData.rightToe.faces),
    };
  });

  // ───────── Base transforms (one‑time) ─────────
  // Head forward (+X)
  LIBS.translateX(Head.MOVE_MATRIX, 4.8);

  // Eyes: glassy over black retinas
  LeftEye.alpha = 0.4; RightEye.alpha = 0.4;
  LIBS.translateZ(LeftRetina.MOVE_MATRIX,  1.4);
  LIBS.translateZ(RightRetina.MOVE_MATRIX, -1.4);

  // Horns tip backward a bit
  LIBS.rotateY(LeftHorn.MOVE_MATRIX,  Math.PI / 9);
  LIBS.rotateY(RightHorn.MOVE_MATRIX, -Math.PI / 9);

  // Wing attachment posts
  LIBS.rotateY(LeftWingAttachment.MOVE_MATRIX,  130 * Math.PI / 180);
  LIBS.translateY(LeftWingAttachment.MOVE_MATRIX, 1.2);
  LIBS.translateX(LeftWingAttachment.MOVE_MATRIX, 4.8);
  LIBS.translateZ(LeftWingAttachment.MOVE_MATRIX, -0.5);

  LIBS.rotateY(RightWingAttachment.MOVE_MATRIX, 50 * Math.PI / 180);
  LIBS.translateY(RightWingAttachment.MOVE_MATRIX, 1.2);
  LIBS.translateX(RightWingAttachment.MOVE_MATRIX, 4.8);
  LIBS.translateZ(RightWingAttachment.MOVE_MATRIX, 0.5);

  // Tail fins (left)
  let tmp = LIBS.get_I4();
  LIBS.translateY(tmp, 2);                   LeftTailFin.MOVE_MATRIX = LIBS.multiply(LeftTailFin.MOVE_MATRIX, tmp);
  tmp = LIBS.get_I4(); LIBS.rotateY(tmp, Math.PI/2);   LeftTailFin.MOVE_MATRIX = LIBS.multiply(LeftTailFin.MOVE_MATRIX, tmp);
  tmp = LIBS.get_I4(); LIBS.rotateZ(tmp, Math.PI/3);   LeftTailFin.MOVE_MATRIX = LIBS.multiply(LeftTailFin.MOVE_MATRIX, tmp);
  tmp = LIBS.get_I4(); LIBS.rotateY(tmp, -Math.PI/4);  LeftTailFin.MOVE_MATRIX = LIBS.multiply(LeftTailFin.MOVE_MATRIX, tmp);
  LIBS.translateX(LeftTailFin.MOVE_MATRIX, -3.3);
  LIBS.translateY(LeftTailFin.MOVE_MATRIX,  1.9);
  LIBS.translateZ(LeftTailFin.MOVE_MATRIX, -0.1);

  // Tail fins (right)
  tmp = LIBS.get_I4(); LIBS.translateY(tmp, 2);        RightTailFin.MOVE_MATRIX = LIBS.multiply(RightTailFin.MOVE_MATRIX, tmp);
  tmp = LIBS.get_I4(); LIBS.rotateY(tmp, Math.PI/2);   RightTailFin.MOVE_MATRIX = LIBS.multiply(RightTailFin.MOVE_MATRIX, tmp);
  tmp = LIBS.get_I4(); LIBS.rotateZ(tmp, Math.PI/3);   RightTailFin.MOVE_MATRIX = LIBS.multiply(RightTailFin.MOVE_MATRIX, tmp);
  tmp = LIBS.get_I4(); LIBS.rotateY(tmp, Math.PI/4);   RightTailFin.MOVE_MATRIX = LIBS.multiply(RightTailFin.MOVE_MATRIX, tmp);
  LIBS.translateX(RightTailFin.MOVE_MATRIX, -3.3);
  LIBS.translateY(RightTailFin.MOVE_MATRIX,  1.9);
  LIBS.translateZ(RightTailFin.MOVE_MATRIX,  0.1);

  // Legs: base placement + hierarchy
  Object.keys(legs).forEach((legName) => {
    const pos = legPositions[legName];
    const leg = legs[legName];

    LIBS.translateX(leg.thigh.MOVE_MATRIX, pos.base.x);
    LIBS.translateY(leg.thigh.MOVE_MATRIX, pos.base.y);
    LIBS.translateZ(leg.thigh.MOVE_MATRIX, pos.base.z);

    if (legName === "frontLeft" || legName === "backLeft") {
      LIBS.rotateX(leg.thigh.MOVE_MATRIX, -(pos.angles.hip * Math.PI) / 180);
    } else {
      LIBS.rotateX(leg.thigh.MOVE_MATRIX,  (pos.angles.hip * Math.PI) / 180);
    }

    LIBS.translateY(leg.shin.MOVE_MATRIX, -1.2);
    LIBS.rotateX(leg.shin.MOVE_MATRIX, (pos.angles.knee * Math.PI) / 180);

    LIBS.translateY(leg.leftToe.MOVE_MATRIX, -1.5);
    LIBS.rotateX(leg.leftToe.MOVE_MATRIX, (pos.angles.leftToe * Math.PI) / 180);

    LIBS.translateY(leg.rightToe.MOVE_MATRIX, -1.5);
    LIBS.rotateX(leg.rightToe.MOVE_MATRIX, (pos.angles.rightToe * Math.PI) / 180);

    leg.thigh.childs.push(leg.shin);
    leg.shin.childs.push(leg.leftToe);
    leg.shin.childs.push(leg.rightToe);
    Body.childs.push(leg.thigh);

    leg.leftToe.alpha = 1.0;
    leg.rightToe.alpha = 1.0;
  });

  // ───────── Hierarchy ─────────
  Body.childs.push(Head);

  Head.childs.push(LeftRetina);
  Head.childs.push(RightRetina);
  LeftRetina.childs.push(LeftEye);
  RightRetina.childs.push(RightEye);

  Head.childs.push(LeftHorn);
  Head.childs.push(RightHorn);

  Body.childs.push(LeftWingAttachment);
  Body.childs.push(RightWingAttachment);
  LeftWingAttachment.childs.push(LeftTopWing, LeftBottomWing);
  RightWingAttachment.childs.push(RightTopWing, RightBottomWing);

  Body.childs.push(LeftTailFin);
  Body.childs.push(RightTailFin);

  // Buffer setup
  Body.setup();

  // ───────── Animation (t in seconds) ─────────
  function animate(t, orbit = { theta: 0, phi: 0, camDist: 10 }) {
    // Root placement + orbit
    Body.MOVE_MATRIX = LIBS.get_I4();
    let T = LIBS.get_I4();
    LIBS.rotateY(T, orbit.theta); Body.MOVE_MATRIX = LIBS.multiply(Body.MOVE_MATRIX, T);
    T = LIBS.get_I4();
    LIBS.rotateX(T, orbit.phi);   Body.MOVE_MATRIX = LIBS.multiply(Body.MOVE_MATRIX, T);

    // Wing flap + hover wiggle
    const wingFlapSpeed = 35.0;
    const wingFlapAmount = Math.PI / 10;
    const wingAngle = Math.sin(t * wingFlapSpeed) * wingFlapAmount;

    const wiggleSpeed = 3.0;
    const wiggleAmount = 0.1;
    const hoverHeight = Math.sin(t * wiggleSpeed) * 0.3;

    // Left Top Wing
    LIBS.set_I4(LeftTopWing.MOVE_MATRIX);
    T = LIBS.get_I4(); LIBS.translateY(T, 3);             LeftTopWing.MOVE_MATRIX = LIBS.multiply(LeftTopWing.MOVE_MATRIX, T);
    T = LIBS.get_I4(); LIBS.rotateY(T, Math.PI / 2);      LeftTopWing.MOVE_MATRIX = LIBS.multiply(LeftTopWing.MOVE_MATRIX, T);
    T = LIBS.get_I4(); LIBS.rotateZ(T, Math.PI / 4 + wingAngle);
    LeftTopWing.MOVE_MATRIX = LIBS.multiply(LeftTopWing.MOVE_MATRIX, T);
    T = LIBS.get_I4(); LIBS.rotateY(T, -Math.PI / 2);     LeftTopWing.MOVE_MATRIX = LIBS.multiply(LeftTopWing.MOVE_MATRIX, T);
    LIBS.translateZ(LeftTopWing.MOVE_MATRIX, -1.7);

    // Left Bottom Wing
    LIBS.set_I4(LeftBottomWing.MOVE_MATRIX);
    T = LIBS.get_I4(); LIBS.translateY(T, 3);             LeftBottomWing.MOVE_MATRIX = LIBS.multiply(LeftBottomWing.MOVE_MATRIX, T);
    T = LIBS.get_I4(); LIBS.rotateY(T, Math.PI / 2);      LeftBottomWing.MOVE_MATRIX = LIBS.multiply(LeftBottomWing.MOVE_MATRIX, T);
    T = LIBS.get_I4(); LIBS.rotateZ(T, Math.PI / 2.5 + wingAngle * 0.5);
    LeftBottomWing.MOVE_MATRIX = LIBS.multiply(LeftBottomWing.MOVE_MATRIX, T);
    T = LIBS.get_I4(); LIBS.rotateY(T, -Math.PI / 2);     LeftBottomWing.MOVE_MATRIX = LIBS.multiply(LeftBottomWing.MOVE_MATRIX, T);
    LIBS.translateZ(LeftBottomWing.MOVE_MATRIX, -1.7);

    // Right Top Wing
    LIBS.set_I4(RightTopWing.MOVE_MATRIX);
    T = LIBS.get_I4(); LIBS.translateY(T, 3);             RightTopWing.MOVE_MATRIX = LIBS.multiply(RightTopWing.MOVE_MATRIX, T);
    T = LIBS.get_I4(); LIBS.rotateY(T, Math.PI / 2);      RightTopWing.MOVE_MATRIX = LIBS.multiply(RightTopWing.MOVE_MATRIX, T);
    T = LIBS.get_I4(); LIBS.rotateZ(T, Math.PI / 4 + wingAngle);
    RightTopWing.MOVE_MATRIX = LIBS.multiply(RightTopWing.MOVE_MATRIX, T);
    T = LIBS.get_I4(); LIBS.rotateY(T, -Math.PI / 2);     RightTopWing.MOVE_MATRIX = LIBS.multiply(RightTopWing.MOVE_MATRIX, T);
    LIBS.translateZ(RightTopWing.MOVE_MATRIX, -1.7);

    // Right Bottom Wing
    LIBS.set_I4(RightBottomWing.MOVE_MATRIX);
    T = LIBS.get_I4(); LIBS.translateY(T, 3);             RightBottomWing.MOVE_MATRIX = LIBS.multiply(RightBottomWing.MOVE_MATRIX, T);
    T = LIBS.get_I4(); LIBS.rotateY(T, Math.PI / 2);      RightBottomWing.MOVE_MATRIX = LIBS.multiply(RightBottomWing.MOVE_MATRIX, T);
    T = LIBS.get_I4(); LIBS.rotateZ(T, Math.PI / 2.5 + wingAngle * 0.8);
    RightBottomWing.MOVE_MATRIX = LIBS.multiply(RightBottomWing.MOVE_MATRIX, T);
    T = LIBS.get_I4(); LIBS.rotateY(T, -Math.PI / 2);     RightBottomWing.MOVE_MATRIX = LIBS.multiply(RightBottomWing.MOVE_MATRIX, T);
    LIBS.translateZ(RightBottomWing.MOVE_MATRIX, -1.7);

    // Hover body
    T = LIBS.get_I4(); LIBS.translateY(T, hoverHeight);   Body.MOVE_MATRIX = LIBS.multiply(Body.MOVE_MATRIX, T);
    T = LIBS.get_I4(); LIBS.rotateZ(T, Math.sin(t * wiggleSpeed) * wiggleAmount);
    Body.MOVE_MATRIX = LIBS.multiply(Body.MOVE_MATRIX, T);

    // Head subtle wiggle (reset to base each frame)
    const breath = 1.2 + Math.sin(t * 2.0) * 0.1;


    LIBS.set_I4(Head.MOVE_MATRIX);
    T = LIBS.get_I4(); LIBS.translateX(T, 4.8);           Head.MOVE_MATRIX = LIBS.multiply(Head.MOVE_MATRIX, T);
    T = LIBS.get_I4(); LIBS.rotateZ(T, Math.sin(t * wiggleSpeed * 1.5) * 0.05);
    Head.MOVE_MATRIX = LIBS.multiply(Head.MOVE_MATRIX, T);
    T = LIBS.get_I4(); LIBS.rotateX(T, Math.cos(t * wiggleSpeed * 1.5) * 0.03);
    Head.MOVE_MATRIX = LIBS.multiply(Head.MOVE_MATRIX, T);

    LIBS.scaleX(Head.MOVE_MATRIX, breath);
    LIBS.scaleY(Head.MOVE_MATRIX, breath);
    LIBS.scaleZ(Head.MOVE_MATRIX, breath);

    // Organic leg wiggle
    Object.entries(legs).forEach(([name, parts], idx) => {
      const base = legPositions[name];
      const legSpeed = wiggleSpeed * (1.5 + 0.3 * Math.sin(idx * 1.2)) * 0.5;
      const legPhase = idx * 0.8;
      const swing = Math.sin(t * legSpeed + legPhase) * ((3 + idx) * Math.PI / 180);

      LIBS.set_I4(parts.thigh.MOVE_MATRIX);
      LIBS.translateX(parts.thigh.MOVE_MATRIX, base.base.x);
      LIBS.translateY(parts.thigh.MOVE_MATRIX, base.base.y);
      LIBS.translateZ(parts.thigh.MOVE_MATRIX, base.base.z);
      const hipBase = (name.includes("Left") ? -base.angles.hip : base.angles.hip) * Math.PI / 180;
      LIBS.rotateX(parts.thigh.MOVE_MATRIX, hipBase + swing);

      LIBS.set_I4(parts.shin.MOVE_MATRIX);
      LIBS.translateY(parts.shin.MOVE_MATRIX, -1.2);
      LIBS.rotateX(parts.shin.MOVE_MATRIX, base.angles.knee * Math.PI / 180 - swing * 0.5);

      LIBS.set_I4(parts.leftToe.MOVE_MATRIX);
      LIBS.translateY(parts.leftToe.MOVE_MATRIX, -1.5);
      LIBS.rotateX(parts.leftToe.MOVE_MATRIX, base.angles.leftToe * Math.PI / 180);

      LIBS.set_I4(parts.rightToe.MOVE_MATRIX);
      LIBS.translateY(parts.rightToe.MOVE_MATRIX, -1.5);
      LIBS.rotateX(parts.rightToe.MOVE_MATRIX, base.angles.rightToe * Math.PI / 180);
    });
  }

  return {
    root: Body,
    parts: {
      body: Body,
      head: Head,
      eyes: { left: LeftEye, right: RightEye },
      retinas: { left: LeftRetina, right: RightRetina },
      horns: { left: LeftHorn, right: RightHorn },
      wingAttachments: { left: LeftWingAttachment, right: RightWingAttachment },
      wings: {
        leftTop: LeftTopWing, leftBottom: LeftBottomWing,
        rightTop: RightTopWing, rightBottom: RightBottomWing
      },
      tailFins: { left: LeftTailFin, right: RightTailFin },
      legs
    },
    animate
  };
}
