import { MyObject } from "./myObject.js";
import { LIBS } from "./libs.js";
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

function main() {
  var CANVAS = document.getElementById("mycanvas");
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;

  let Gl;
  try {
    Gl = CANVAS.getContext("webgl", { antialias: true });
  } catch (e) {
    alert("WebGL not supported");
    console.log(e);
    return false;
  }

  // ───────────────── Shaders ─────────────────
  var shader_vertex_source = `
    attribute vec3 position;
    uniform mat4 Pmatrix, Vmatrix, Mmatrix;
    attribute vec3 color;
    varying vec3 vColor;
    void main(void) {
      gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
      vColor = color;
    }
  `;

  var shader_fragment_source = `
    precision mediump float;
    varying vec3 vColor;
    uniform float uAlpha;     // NEW: per-object opacity
    void main(void) {
      gl_FragColor = vec4(vColor, uAlpha);
    }
  `;
  var compile_shader = function (source, type, typeString) {
    var shader = Gl.createShader(type);
    Gl.shaderSource(shader, source);
    Gl.compileShader(shader);
    if (!Gl.getShaderParameter(shader, Gl.COMPILE_STATUS)) {
      console.error(
        "Error in " + typeString + " shader: " + Gl.getShaderInfoLog(shader)
      );
      Gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  var SHADER_PROGRAM = Gl.createProgram();
  var shader_vertex = compile_shader(
    shader_vertex_source,
    Gl.VERTEX_SHADER,
    "vertex"
  );
  var shader_fragment = compile_shader(
    shader_fragment_source,
    Gl.FRAGMENT_SHADER,
    "fragment"
  );
  Gl.attachShader(SHADER_PROGRAM, shader_vertex);
  Gl.attachShader(SHADER_PROGRAM, shader_fragment);
  Gl.linkProgram(SHADER_PROGRAM);

  var _position = Gl.getAttribLocation(SHADER_PROGRAM, "position");
  var _color = Gl.getAttribLocation(SHADER_PROGRAM, "color");
  var _Pmatrix = Gl.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
  var _Vmatrix = Gl.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
  var _Mmatrix = Gl.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

  Gl.enableVertexAttribArray(_position);
  Gl.enableVertexAttribArray(_color);

  Gl.enable(Gl.BLEND);
  Gl.blendFunc(Gl.SRC_ALPHA, Gl.ONE_MINUS_SRC_ALPHA);
  Gl.useProgram(SHADER_PROGRAM);

  // ─────────────── Geometry (body + parts) ───────────────
  var p0 = [0, 0, 0]; // tail base
  var p1 = [0, 1.2, 1.0]; // abdomen bulge forward
  var p2 = [0, 2.2, -0.2]; // chest pulls back
  var p3 = [0, 3.5, 0]; // neck

  var FlygonBody = generateFlygonBodyBezier(p0, p1, p2, p3, 1.0, 1.0, 96, 64);
  var FlygonBelly = generateFlygonBelly(0.8, 0.5, 1, 40, 40);
  var FlygonHead = generateFlygonHead(0.5, 0.4, 0.7, 40, 40);
  var FlygonHornCurved = generateCurvedHorn_flat(0.15, 0.02, 0.9, 22, 18);
  var FlygonThigh = generateFlygonThigh(0.4, 0.6, 0.7, 40, 40, false);
  var FlygonInnerThigh = generateFlygonThigh(0.4, 0.7, 0.5, 40, 40, true);
  var FlygonFeetGeo = generateFlygonFeet(0.2, 0.2, 1, 20, 20);
  var FlygonTail = generateFlygonTailBezier(
    [0, 0, 0],
    [0, -3, -5],
    [-1, -4, 2],
    [0, -4, 2],
    0.8,
    0.8,
    60,
    20
  );
  var FlygonTailFins = generateFlygonTailFins(1, {
    centerColor: [0.5, 1.0, 0.5],
    midColor: [0.2, 0.7, 0.2],
    edgeColor: [1.0, 0.05, 0.05],
    borderWidth: 0.22,
    twoSided: true,
    spreadDeg: 50, // a bit wider fan
    sideSeparation: 0.5, // NEW: pushes the side fins apart
    stackZGap: 0.001, // NEW: puts them on separate tiny z layers
  });
  var FlygonWing = generateFlygonWing(2.3);

  // Arms (short, tapered)
  var LUpperArmGeo = generateArmSegment(0.14, 0.11, 0.1, 0.08, 0.52, 24, 20);
  var LForeArmGeo = generateArmSegment(0.12, 0.09, 0.085, 0.07, 0.45, 24, 20);
  var LHandGeo = generateHandEllipsoid(0.09, 0.07, 0.085);
  var ClawGeo = generateClaw(0.22, 0.038); // shorter & slimmer claws
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
  LIBS.translateY(leftWing.MOVE_MATRIX, 1.0);
  LIBS.translateZ(leftWing.MOVE_MATRIX, -1.7);
  LIBS.translateX(leftWing.MOVE_MATRIX, -3.0);
  LIBS.rotateX(leftWing.MOVE_MATRIX, (-20 * Math.PI) / 180);
  LIBS.rotateZ(leftWing.MOVE_MATRIX, (50 * Math.PI) / 180);

  LIBS.translateY(rightWing.MOVE_MATRIX, 1.0);
  LIBS.translateZ(rightWing.MOVE_MATRIX, -1.7);
  LIBS.translateX(rightWing.MOVE_MATRIX, 3.0);
  LIBS.rotateX(rightWing.MOVE_MATRIX, (-20 * Math.PI) / 180);
  LIBS.rotateZ(rightWing.MOVE_MATRIX, (-50 * Math.PI) / 180);

  // ─────────────── Arms (natural forward/down pose) ───────────────
  // --- LEFT ARM (natural: sedikit turun & maju) ---
  LIBS.set_I4(LUpperArm.MOVE_MATRIX);
  LIBS.translateX(LUpperArm.MOVE_MATRIX, -0.27); // closer to torso
  LIBS.translateY(LUpperArm.MOVE_MATRIX, 1.62);
  LIBS.translateZ(LUpperArm.MOVE_MATRIX, 0.6);
  LIBS.rotateZ(LUpperArm.MOVE_MATRIX, (20 * Math.PI) / 180); // open outward a bit
  LIBS.rotateX(LUpperArm.MOVE_MATRIX, (120 * Math.PI) / 180); // tilt downward
  LIBS.rotateY(LUpperArm.MOVE_MATRIX, (-3 * Math.PI) / 180); // slight forward twist

  LIBS.set_I4(LForeArm.MOVE_MATRIX);
  LIBS.translateY(LForeArm.MOVE_MATRIX, 0.5); // attach at end of upper arm (+Y)
  LIBS.rotateX(LForeArm.MOVE_MATRIX, (-100 * Math.PI) / 180);

  LIBS.set_I4(LHand.MOVE_MATRIX);
  LIBS.translateY(LHand.MOVE_MATRIX, 0.5);

  // claws kiri (sebar dikit di sumbu Z, arahkan keluar)
  LIBS.set_I4(LClaw1.MOVE_MATRIX); // center
  LIBS.rotateX(LClaw1.MOVE_MATRIX, Math.PI / 2);
  LIBS.translateZ(LClaw1.MOVE_MATRIX, 0.13);

  LIBS.set_I4(LClaw2.MOVE_MATRIX); // left side (fan out)
  LIBS.rotateX(LClaw2.MOVE_MATRIX, Math.PI / 2);
  LIBS.rotateY(LClaw2.MOVE_MATRIX, (18 * Math.PI) / 180);
  LIBS.translateX(LClaw2.MOVE_MATRIX, 0.05);
  LIBS.translateZ(LClaw2.MOVE_MATRIX, 0.12);

  LIBS.set_I4(LClaw3.MOVE_MATRIX); // right side (fan out)
  LIBS.rotateX(LClaw3.MOVE_MATRIX, Math.PI / 2);
  LIBS.rotateY(LClaw3.MOVE_MATRIX, (-18 * Math.PI) / 180);
  LIBS.translateX(LClaw3.MOVE_MATRIX, -0.05);
  LIBS.translateZ(LClaw3.MOVE_MATRIX, 0.12);

  // --- RIGHT ARM (mirror di X; rotasi Z & Y dibalik tandanya) ---
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
  LIBS.set_I4(RClaw1.MOVE_MATRIX); // center
  LIBS.rotateX(RClaw1.MOVE_MATRIX, Math.PI / 2);
  LIBS.translateZ(RClaw1.MOVE_MATRIX, 0.13);

  LIBS.set_I4(RClaw2.MOVE_MATRIX); // right side (mirror)
  LIBS.rotateX(RClaw2.MOVE_MATRIX, Math.PI / 2);
  LIBS.rotateY(RClaw2.MOVE_MATRIX, (-18 * Math.PI) / 180);
  LIBS.translateX(RClaw2.MOVE_MATRIX, -0.05);
  LIBS.translateZ(RClaw2.MOVE_MATRIX, 0.12);

  LIBS.set_I4(RClaw3.MOVE_MATRIX); // left side (mirror)
  LIBS.rotateX(RClaw3.MOVE_MATRIX, Math.PI / 2);
  LIBS.rotateY(RClaw3.MOVE_MATRIX, (18 * Math.PI) / 180);
  LIBS.translateX(RClaw3.MOVE_MATRIX, 0.05);
  LIBS.translateZ(RClaw3.MOVE_MATRIX, 0.12);

  // Eyes (child of Head)
  LEyes.alpha = 0.6; // set transparency
  LIBS.translateX(LPupils.MOVE_MATRIX, -0.4);
  LIBS.translateZ(LPupils.MOVE_MATRIX, 0.38);
  LIBS.rotateY(LPupils.MOVE_MATRIX, (20 * Math.PI) / 180);

  LIBS.translateZ(LEyes.MOVE_MATRIX, -0.1);

  REyes.alpha = 0.6; // set transparency
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

  // ─────────────── Camera / Controls ───────────────
  var PROJMATRIX = LIBS.get_projection(
    60,
    CANVAS.width / CANVAS.height,
    1,
    100
  );
  var VIEWMATRIX = LIBS.get_I4();
  LIBS.translateZ(VIEWMATRIX, -10);
  LIBS.rotateY(Flygon.MOVE_MATRIX, -Math.PI);

  let THETA = 0,
    PHI = 0;
  let drag = false,
    x_prev,
    y_prev;
  let dX = 0,
    dY = 0;
  var FRICTION = 0.05;

  var mouseDown = (e) => {
    drag = true;
    x_prev = e.pageX;
    y_prev = e.pageY;
    e.preventDefault();
  };
  var mouseUp = () => {
    drag = false;
  };
  var mouseMove = (e) => {
    if (!drag) return false;
    dX = ((e.pageX - x_prev) * 2 * Math.PI) / CANVAS.width;
    dY = ((e.pageY - y_prev) * 2 * Math.PI) / CANVAS.height;
    THETA += dX;
    PHI += dY;
    x_prev = e.pageX;
    y_prev = e.pageY;
    e.preventDefault();
  };
  CANVAS.addEventListener("mousedown", mouseDown, false);
  CANVAS.addEventListener("mouseup", mouseUp, false);
  CANVAS.addEventListener("mouseout", mouseUp, false);
  CANVAS.addEventListener("mousemove", mouseMove, false);

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

  // We want the fins' plane normal (starts at +Z for our fins geometry) to align with tail axis.
  // Convert direction vector to yaw/pitch that rotates +Z to (dx,dy,dz).
  const yaw = Math.atan2(dx, dz); // rotate around Y to line up XZ
  const pitch = -Math.atan2(dy, Math.hypot(dx, dz)); // then pitch around X to add Y

  // tiny push past the tip so the red rim doesn't clip into the tail
  const push = 0.04; // tweak if needed
  const px = tip[0] + dx * push;
  const py = tip[1] + dy * push;
  const pz = tip[2] + dz * push;

  // ─────────────── Draw loop ───────────────
  Gl.enable(Gl.DEPTH_TEST);
  Gl.depthFunc(Gl.LEQUAL);
  Gl.clearColor(0.98, 0.94, 0.72, 1.0);
  Gl.clearDepth(1.0);

  let autoRotate = 0;
  var animate = function () {
    Gl.viewport(0, 0, CANVAS.width, CANVAS.height);
    Gl.clear(Gl.COLOR_BUFFER_BIT | Gl.DEPTH_BUFFER_BIT);

    Flygon.MOVE_MATRIX = LIBS.get_I4();
    LIBS.rotateX(Flygon.MOVE_MATRIX, (20 * Math.PI) / 180);

    let temp = LIBS.get_I4();
    LIBS.rotateY(temp, THETA);
    Flygon.MOVE_MATRIX = LIBS.multiply(Flygon.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateX(temp, PHI);
    Flygon.MOVE_MATRIX = LIBS.multiply(Flygon.MOVE_MATRIX, temp);

    LIBS.translateZ(temp, -0.6);
    Flygon.MOVE_MATRIX = LIBS.multiply(Flygon.MOVE_MATRIX, temp);

    // Reset and place fins in tail-local space
    LIBS.set_I4(tailFins.MOVE_MATRIX);
    LIBS.translateX(tailFins.MOVE_MATRIX, px);
    LIBS.translateY(tailFins.MOVE_MATRIX, py);
    LIBS.translateZ(tailFins.MOVE_MATRIX, pz + 0.5);

    // Orient the fins so their normal follows the tail axis
    LIBS.rotateY(tailFins.MOVE_MATRIX, yaw);
    LIBS.rotateX(tailFins.MOVE_MATRIX, pitch);

    // after: rotateY(...yaw); rotateX(...pitch);
    LIBS.rotateY(tailFins.MOVE_MATRIX, Math.PI); // turn to face the other way

    autoRotate += 0.02;
    if (autoRotate > Math.PI * 2) autoRotate -= Math.PI * 2;

    temp = LIBS.get_I4();
    LIBS.translateZ(temp, 0.6);
    Flygon.MOVE_MATRIX = LIBS.multiply(Flygon.MOVE_MATRIX, temp);

    if (!drag) {
      dX *= 1 - FRICTION;
      dY *= 1 - FRICTION;
      THETA += dX;
      PHI += dY;
    }

    Gl.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    Gl.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
    Flygon.render(LIBS.get_I4());

    Gl.flush();
    requestAnimationFrame(animate);
  };
  animate(0);
}

window.addEventListener("load", main);
