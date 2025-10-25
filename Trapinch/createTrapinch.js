// Trapinch/createTrapinch.js
import { MyObject } from "../myObject.js";
import { LIBS } from "../libs.js";

import { generateTrapinchBody } from "./BodyParts/Body/TrapinchBody.js";
import { generateTrapinchEyes2 } from "./BodyParts/Head/TrapinchEyes2.js";
import { generateTrapinchHead } from "./BodyParts/Head/TrapinchHead.js";
import { generateTrapinchLegs } from "./BodyParts/Legs/TrapinchLeg.js";
import { generateTrapinchLegTip } from "./BodyParts/Legs/TrapinchLegTip.js";
import { generateTrapinchNeck } from "./BodyParts/Neck/TrapinchNeck.js";
import { generateTrapinchHeadCracks } from "./BodyParts/Head/TrapinchHeadCracks.js";

export function createTrapinch(Gl, SHADER_PROGRAM, attribs) {
  const { _position, _color, _Mmatrix } = attribs;

  // ─────────────── Geometry (sizes/colors adapted from your Trapinch.js) ───────────────
  const TrapinchBody = generateTrapinchBody(0.8, 0.65, 0.9, 14, 20, [
    240 / 255,
    150 / 255,
    70 / 255,
  ]);
  const TrapinchHead = generateTrapinchHead(1.0, 0.9, 1.2, 50, 30, [
    240 / 255,
    150 / 255,
    70 / 255,
  ]);
  const TrapinchEyes = generateTrapinchEyes2(0.05, 0.2, 0.2, 10, 12, [0, 0, 0]); // black
  const TrapinchPupil = generateTrapinchEyes2(
    0.01,
    0.08,
    0.06,
    8,
    10,
    [1, 1, 1]
  ); //
  const TrapinchNeck = generateTrapinchNeck(
    0.3,
    0.2,
    0.2,
    1,
    8,
    16,
    [0.9, 0.53, 0.22]
  );
  const TrapinchCracks = generateTrapinchHeadCracks(7, 30, [
    40 / 255,
    25 / 255,
    10 / 255,
  ]);

  const TrapinchLeg = generateTrapinchLegs(0.22, 25, 10, [0.9, 0.53, 0.22]);
  const TrapinchTip = generateTrapinchLegTip(0.22, 0.05, 0.22, 10, 12, [
    220 / 255,
    140 / 255,
    80 / 255,
  ]);

  // ─────────────── Objects ───────────────
  const Trapinch = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchBody.vertices,
    TrapinchBody.faces
  );

  const TNeck = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchNeck.vertices,
    TrapinchNeck.faces
  );

  const THead = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchHead.vertices,
    TrapinchHead.faces
  );

  const TCracks = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchCracks.vertices,
    TrapinchCracks.faces
  );

  const TREyes = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchEyes.vertices,
    TrapinchEyes.faces
  );
  const TLEyes = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchEyes.vertices,
    TrapinchEyes.faces
  );

  const TRPupil = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchPupil.vertices,
    TrapinchPupil.faces
  );
  const TLPupil = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchPupil.vertices,
    TrapinchPupil.faces
  );

  // Legs
  const TRFLeg = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchLeg.vertices,
    TrapinchLeg.faces
  );
  const TRBLeg = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchLeg.vertices,
    TrapinchLeg.faces
  );
  const TLFLeg = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchLeg.vertices,
    TrapinchLeg.faces
  );
  const TLBLeg = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchLeg.vertices,
    TrapinchLeg.faces
  );

  // Leg tips
  const TRFTip = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchTip.vertices,
    TrapinchTip.faces
  );
  const TRBTip = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchTip.vertices,
    TrapinchTip.faces
  );
  const TLFTip = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchTip.vertices,
    TrapinchTip.faces
  );
  const TLBTip = new MyObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchTip.vertices,
    TrapinchTip.faces
  );

  // ─────────────── Base transforms (one-time pose) ───────────────
  // Body slight back
  LIBS.translateZ(Trapinch.MOVE_MATRIX, -0.3);

  // Neck
  LIBS.translateY(TNeck.MOVE_MATRIX, 0.55);
  LIBS.translateZ(TNeck.MOVE_MATRIX, 1.02);
  LIBS.rotateX(TNeck.MOVE_MATRIX, Math.PI / 4);

  // Head
  LIBS.translateY(THead.MOVE_MATRIX, 0.75);
  LIBS.translateZ(THead.MOVE_MATRIX, 0.4);
  LIBS.rotateX(THead.MOVE_MATRIX, -Math.PI / 3);

  // Eyes
  LIBS.translateX(TREyes.MOVE_MATRIX, 0.9);
  LIBS.translateY(TREyes.MOVE_MATRIX, 0.3);
  LIBS.rotateZ(TREyes.MOVE_MATRIX, Math.PI / 8);

  LIBS.translateX(TLEyes.MOVE_MATRIX, -0.9);
  LIBS.translateY(TLEyes.MOVE_MATRIX, 0.3);
  LIBS.rotateZ(TLEyes.MOVE_MATRIX, -Math.PI / 8);

  // Pupils offset (children of eyes)
  LIBS.translateX(TRPupil.MOVE_MATRIX, 0.08);
  LIBS.translateX(TLPupil.MOVE_MATRIX, -0.08);

  // Head cracks
  LIBS.translateX(TCracks.MOVE_MATRIX, -0.1);
  LIBS.translateZ(TCracks.MOVE_MATRIX, 0.05);
  LIBS.rotateZ(TCracks.MOVE_MATRIX, -Math.PI / 2);
  LIBS.rotateY(TCracks.MOVE_MATRIX, Math.PI / 9);
  LIBS.rotateX(TCracks.MOVE_MATRIX, Math.PI / 9);

  // Legs (base placement)
  LIBS.translateX(TRFLeg.MOVE_MATRIX, 0.55);
  LIBS.translateZ(TRFLeg.MOVE_MATRIX, 0.4);
  LIBS.translateY(TRFLeg.MOVE_MATRIX, -0.2);

  LIBS.translateX(TRBLeg.MOVE_MATRIX, 0.55);
  LIBS.translateZ(TRBLeg.MOVE_MATRIX, -0.3);
  LIBS.translateY(TRBLeg.MOVE_MATRIX, -0.2);

  LIBS.translateX(TLFLeg.MOVE_MATRIX, -0.55);
  LIBS.translateZ(TLFLeg.MOVE_MATRIX, 0.4);
  LIBS.translateY(TLFLeg.MOVE_MATRIX, -0.2);
  LIBS.rotateY(TLFLeg.MOVE_MATRIX, -Math.PI / 2);

  LIBS.translateX(TLBLeg.MOVE_MATRIX, -0.55);
  LIBS.translateZ(TLBLeg.MOVE_MATRIX, -0.3);
  LIBS.translateY(TLBLeg.MOVE_MATRIX, -0.2);
  LIBS.rotateY(TLBLeg.MOVE_MATRIX, -Math.PI / 2);

  // Leg tips (downward)
  LIBS.translateY(TRFTip.MOVE_MATRIX, -0.5);
  LIBS.translateY(TRBTip.MOVE_MATRIX, -0.5);
  LIBS.translateY(TLFTip.MOVE_MATRIX, -0.5);
  LIBS.translateY(TLBTip.MOVE_MATRIX, -0.5);

  // ─────────────── Hierarchy ───────────────
  Trapinch.childs.push(TNeck);
  TNeck.childs.push(THead);

  THead.childs.push(TREyes, TLEyes, TCracks);
  TREyes.childs.push(TRPupil);
  TLEyes.childs.push(TLPupil);

  Trapinch.childs.push(TRFLeg, TRBLeg, TLFLeg, TLBLeg);
  TRFLeg.childs.push(TRFTip);
  TRBLeg.childs.push(TRBTip);
  TLFLeg.childs.push(TLFTip);
  TLBLeg.childs.push(TLBTip);

  // Buffer setup
  Trapinch.setup();

  // ─────────────── Animation (time t in seconds) ───────────────
  function animate(t, orbit = { theta: 0, phi: 0, camDist: 10 }) {
    // Root
    Trapinch.MOVE_MATRIX = LIBS.get_I4();
    LIBS.rotateX(Trapinch.MOVE_MATRIX, (20 * Math.PI) / 180);

    // Idle bob + light breathing
    const bob = Math.sin(t * 2.0) * 0.1;
    const breath = 1.0 + Math.sin(t * 2.0) * 0.03;
    LIBS.scaleX(Trapinch.MOVE_MATRIX, breath);
    LIBS.scaleY(Trapinch.MOVE_MATRIX, breath);
    LIBS.scaleZ(Trapinch.MOVE_MATRIX, breath);
    tmp = LIBS.get_I4();
    LIBS.translateY(tmp, -0.6 + bob);
    Trapinch.MOVE_MATRIX = LIBS.multiply(Trapinch.MOVE_MATRIX, tmp);

    var tmp;
    // Head follows body slightly
    LIBS.set_I4(THead.MOVE_MATRIX);
    LIBS.translateY(THead.MOVE_MATRIX, 0.75 + bob * 1.2);
    LIBS.translateZ(THead.MOVE_MATRIX, 0.4);
    LIBS.rotateX(THead.MOVE_MATRIX, -Math.PI / 3 + bob * 0.1);

    const maxHeadTilt = Math.PI / 4; // 45 degrees max
    const clampedPhi = Math.max(-maxHeadTilt, Math.min(maxHeadTilt, orbit.phi));

    tmp = LIBS.get_I4();
    LIBS.rotateX(tmp, clampedPhi);
    THead.MOVE_MATRIX = LIBS.multiply(THead.MOVE_MATRIX, tmp);

    // Eyes (re-apply base each frame so anims don’t accumulate)
    LIBS.set_I4(TREyes.MOVE_MATRIX);
    LIBS.translateX(TREyes.MOVE_MATRIX, 0.9);
    LIBS.translateY(TREyes.MOVE_MATRIX, 0.3);
    LIBS.rotateZ(TREyes.MOVE_MATRIX, Math.PI / 8);

    LIBS.set_I4(TLEyes.MOVE_MATRIX);
    LIBS.translateX(TLEyes.MOVE_MATRIX, -0.9);
    LIBS.translateY(TLEyes.MOVE_MATRIX, 0.3);
    LIBS.translateZ(TLEyes.MOVE_MATRIX, -0.5);
    LIBS.rotateZ(TLEyes.MOVE_MATRIX, -Math.PI / 8);

    LIBS.set_I4(TRPupil.MOVE_MATRIX);
    LIBS.translateX(TRPupil.MOVE_MATRIX, 0.08);
    LIBS.set_I4(TLPupil.MOVE_MATRIX);
    LIBS.translateX(TLPupil.MOVE_MATRIX, -0.08);

    // Cracks stable pose
    LIBS.set_I4(TCracks.MOVE_MATRIX);
    LIBS.translateX(TCracks.MOVE_MATRIX, -0.1);
    LIBS.translateZ(TCracks.MOVE_MATRIX, 0.05);
    LIBS.rotateZ(TCracks.MOVE_MATRIX, -Math.PI / 2);
    LIBS.rotateY(TCracks.MOVE_MATRIX, Math.PI / 9);
    LIBS.rotateX(TCracks.MOVE_MATRIX, Math.PI / 9);

    // Cat-like diagonal gait (RF+LB vs LF+RB)
    const phase = Math.sin(t * 3.0);
    const lift = Math.max(0, phase) * 0.15;
    const swing = phase * 0.1;

    // RF
    LIBS.set_I4(TRFLeg.MOVE_MATRIX);
    LIBS.translateX(TRFLeg.MOVE_MATRIX, 0.55);
    LIBS.translateZ(TRFLeg.MOVE_MATRIX, 0.4 + swing);
    LIBS.translateY(TRFLeg.MOVE_MATRIX, -0.2 + lift);
    LIBS.rotateX(TRFLeg.MOVE_MATRIX, swing * 0.5);

    // RB (opposite)
    LIBS.set_I4(TRBLeg.MOVE_MATRIX);
    LIBS.translateX(TRBLeg.MOVE_MATRIX, 0.55);
    LIBS.translateZ(TRBLeg.MOVE_MATRIX, -0.3 - swing);
    LIBS.translateY(TRBLeg.MOVE_MATRIX, -0.2 + Math.max(0, -phase) * 0.15);
    LIBS.rotateX(TRBLeg.MOVE_MATRIX, -swing * 0.5);

    // LF
    LIBS.set_I4(TLFLeg.MOVE_MATRIX);
    LIBS.translateX(TLFLeg.MOVE_MATRIX, -0.55);
    LIBS.translateZ(TLFLeg.MOVE_MATRIX, 0.4 - swing);
    LIBS.translateY(TLFLeg.MOVE_MATRIX, -0.2 + Math.max(0, -phase) * 0.15);
    LIBS.rotateY(TLFLeg.MOVE_MATRIX, -Math.PI / 2);
    LIBS.rotateX(TLFLeg.MOVE_MATRIX, -swing * 0.5);

    // LB
    LIBS.set_I4(TLBLeg.MOVE_MATRIX);
    LIBS.translateX(TLBLeg.MOVE_MATRIX, -0.55);
    LIBS.translateZ(TLBLeg.MOVE_MATRIX, -0.4 + swing);
    LIBS.translateY(TLBLeg.MOVE_MATRIX, -0.2 + lift);
    LIBS.rotateY(TLBLeg.MOVE_MATRIX, -Math.PI / 2);
    LIBS.rotateX(TLBLeg.MOVE_MATRIX, swing * 0.5);

    const pupilScale = (Math.sin(t) + 1) / 2; // range = [0, 1]

    // LEFT pupil
    let animMat = LIBS.get_I4();
    LIBS.scaleY(animMat, pupilScale);
    TLEyes.MOVE_MATRIX = LIBS.multiply(TLEyes.MOVE_MATRIX, animMat);

    LIBS.translateZ(TLEyes.MOVE_MATRIX, .4)
    
    // RIGHT pupil
    animMat = LIBS.get_I4();
    LIBS.scaleY(animMat, pupilScale);
    TREyes.MOVE_MATRIX = LIBS.multiply(TREyes.MOVE_MATRIX, animMat);

    LIBS.translateZ(TREyes.MOVE_MATRIX, -.4)
  }

  return {
    root: Trapinch,
    parts: {
      head: THead,
      neck: TNeck,
      eyes: { left: TLEyes, right: TREyes },
      pupils: { left: TLPupil, right: TRPupil },
      legs: { RF: TRFLeg, RB: TRBLeg, LF: TLFLeg, LB: TLBLeg },
      legTips: { RF: TRFTip, RB: TRBTip, LF: TLFTip, LB: TLBTip },
      cracks: TCracks,
    },
    animate,
  };
}
