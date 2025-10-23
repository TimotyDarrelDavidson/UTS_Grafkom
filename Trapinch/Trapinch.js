import { MyObject } from "../myObject.js";
import { LIBS } from "../libs.js";
import { generateTrapinchBody } from "./BodyParts/Body/TrapinchBody.js";
import { generateTrapinchEyes2 } from "./BodyParts/Head/TrapinchEyes2.js";
import { generateTrapinchHead } from "./BodyParts/Head/TrapinchHead.js";
// import { generateTrapinchMouth } from "./BodyParts/Head/TrapinchMouth.js";
import { generateTrapinchLegs } from "./BodyParts/Legs/TrapinchLeg.js";
import { generateTrapinchLegTip } from "./BodyParts/Legs/TrapinchLegTip.js";
import { generateTrapinchNeck } from "./BodyParts/Neck/TrapinchNeck.js";

import { generateTrapinchHeadCracks } from "./BodyParts/Head/TrapinchHeadCracks.js";

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


  // INITIALIZE BODYPARTS
  // ─────────────── Geometry (body + parts) ───────────────

  // INITIALIZE BODYPARTS with CORRECTED sizing to match reference
// var TrapinchBody = generateTrapinchBody(
//     0.45, 0.4, 0.45,  // SMALLER, slightly flattened body
//     14, 20, 
//     [240 / 255, 150 / 255, 70 / 255]
// );
var TrapinchBody = generateTrapinchBody(
    0.8, 0.65, 0.9,   // Wide horizontally (X, Z), very flat vertically (Y)
    14, 20, 
    [240 / 255, 150 / 255, 70 / 255]
);

var TrapinchHead = generateTrapinchHead(
    1, 0.9, 1.2,   // Elongated HORIZONTALLY (wider in X and Z, shorter in Y)
    50, 30,
    [240 / 255, 150 / 255, 70 / 255]
);


// NEW (flattened ellipsoid - less bulge):
var TrapinchEyes = generateTrapinchEyes2(
    0.05,   // radiusX - Width (side to side)
    0.2,   // radiusY - Height (up and down)
    0.2,   // radiusZ - Depth (how much it sticks out) - HALF the size!
    10, 12,
    [0, 0, 0]  // Black outer part
);

// Pupil also needs updating:
var TrapinchPupil = generateTrapinchEyes2(
    0.01,  // radiusX
    0.08,  // radiusY
    0.06,  // radiusZ - Less bulge
    8, 10,
    [1, 1, 1]  // White
);


var TrapinchNeck = generateTrapinchNeck( 
    0.325, 0.2, 0.6,  // WIDER to match body connection
    1.2,  // Shorter height
    8, 16,
    // [240 / 255, 150 / 255, 70 / 255]
    [0.90, 0.53, 0.22]
);

// var TrapinchMouth = generateTrapinchMouth(
//     0.15, 0.2,   // BIGGER mouth
//     0.25,        // Taller
//     12,
//     [200 / 255, 120 / 255, 50 / 255]  // Darker orange
// );

// var TrapinchHeadCracks = generateTrapinchHeadCracks(
//     0.04,  // THICKER crack lines so they're visible
//     30,     // More segments for smoother curves
//     [40 / 255, 25 / 255, 10 / 255]  // DARKER brown/black
// );

var TrapinchHeadCracks = generateTrapinchHeadCracks(
    7,  // thickness
    30,    // segments
    [40 / 255, 25 / 255, 10 / 255]  // color
    // Head dimensions will be used internally: 1, 0.9, 1.2
);


// var TrapinchLeg = generateTrapinchLegs(
//     0.18,  // THICKER legs (more stubby)
//     12,    // Fewer segments (less smooth, more stubby)
//     10,    // More radial segments
//     [240 / 255, 150 / 255, 70 / 255]
// );

var TrapinchLeg = generateTrapinchLegs(
    0.22,  // THICKER radius (was 0.18)
    25,    // FEWER segments (was 12) - more stubby
    10,    // Radial segments
        [0.90, 0.53, 0.22]

);

var TrapinchLegTip = generateTrapinchLegTip(
    0.22, 0.05, 0.22,  // BIGGER (was 0.22, 0.18, 0.22)
    10, 12,
    [220 / 255, 140 / 255, 80 / 255]
);

  // var FlygonTailFins = generateFlygonTailFins(1, {
  //   centerColor: [0.5, 1.0, 0.5],
  //   midColor: [0.2, 0.7, 0.2],
  //   edgeColor: [1.0, 0.05, 0.05], // super vivid red
  //   borderWidth: 0.22,
  //   twoSided: true,
  //   spreadDeg: 30,
  // });
  // var FlygonWing = generateFlygonWing(2.1);

  // // Eyes
  // var FlygonEyes = generateFlygonEyes(0.2, 0.3, 0.4, 14, 20, [1, 0, 0]);
  // var FlygonPupils = generateFlygonEyes(0.1, 0.1, 0.15, 14, 20, [0, 0, 0]);

  // // ─────────────── Objects ───────────────
  //Body
var Trapinch = new MyObject(
   Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchBody.vertices,
    TrapinchBody.faces
)

//Leg
var TRFLeg = new MyObject(
   Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchLeg.vertices,
    TrapinchLeg.faces
)
var TRBLeg = new MyObject(
   Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchLeg.vertices,
    TrapinchLeg.faces
)
var TLFLeg = new MyObject(
   Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchLeg.vertices,
    TrapinchLeg.faces
)
var TLBLeg = new MyObject(
   Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchLeg.vertices,
    TrapinchLeg.faces
)

//Leg Tip
var TRFLegTip = new MyObject(
   Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchLegTip.vertices,
    TrapinchLegTip.faces
)
var TRBLegTip = new MyObject(
   Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchLegTip.vertices,
    TrapinchLegTip.faces
)
var TLFLegTip = new MyObject(
   Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchLegTip.vertices,
    TrapinchLegTip.faces
)
var TLBLegTip = new MyObject(
   Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchLegTip.vertices,
    TrapinchLegTip.faces
)

//Head, Head Cracks, Neck, Mouth
var THead = new MyObject(
   Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchHead.vertices,
    TrapinchHead.faces
)
// Add this with other MyObject creations:
var THeadCracks = new MyObject(
   Gl,
   SHADER_PROGRAM,
   _position,
   _color,
   _Mmatrix,
   TrapinchHeadCracks.vertices,
   TrapinchHeadCracks.faces
);

var TNeck = new MyObject(
   Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    TrapinchNeck.vertices,
    TrapinchNeck.faces
)
// var TUpperMouth = new MyObject( 
//    Gl,
//     SHADER_PROGRAM,
//     _position,
//     _color,
//     _Mmatrix,
//     TrapinchMouth.vertices,
//     TrapinchMouth.faces
// )
// var TLowerMouth = new MyObject(
//    Gl,
//     SHADER_PROGRAM,
//     _position,
//     _color,
//     _Mmatrix,
//     TrapinchMouth.vertices,
//     TrapinchMouth.faces
// )

//Eyes
// Add after TREyes and TLEyes creation:

//Eyes with pupils
var TREyes = new MyObject(
  Gl, 
  SHADER_PROGRAM,
  _position,
  _color,
  _Mmatrix,
  TrapinchEyes.vertices,
  TrapinchEyes.faces
);

var TLEyes = new MyObject(
  Gl,
  SHADER_PROGRAM,
  _position,
  _color,
  _Mmatrix,
  TrapinchEyes.vertices,
  TrapinchEyes.faces
);

// ADD PUPILS (white spark in center)
var TRPupil = new MyObject(
  Gl,
  SHADER_PROGRAM,
  _position,
  _color,
  _Mmatrix,
  TrapinchPupil.vertices,
  TrapinchPupil.faces
);

var TLPupil = new MyObject(
  Gl,
  SHADER_PROGRAM,
  _position,
  _color,
  _Mmatrix,
  TrapinchPupil.vertices,
  TrapinchPupil.faces
);

  // ─────────────── Base transforms ───────────────

// BODY (Root) - Small body at center/back
LIBS.translateY(Trapinch.MOVE_MATRIX, 0.0);  
LIBS.translateZ(Trapinch.MOVE_MATRIX, -0.3);  // Body slightly back

// NECK (short connector between body and head)
LIBS.translateY(TNeck.MOVE_MATRIX, 0.55);     // Above body
LIBS.translateZ(TNeck.MOVE_MATRIX, 1.02);      // Forward from body center
LIBS.rotateX(TNeck.MOVE_MATRIX, Math.PI/4); // Tilt upward

// HEAD (large sphere in front, not TOO far)
LIBS.translateY(THead.MOVE_MATRIX, 0.75);     // Stack on neck
LIBS.translateZ(THead.MOVE_MATRIX, 0.4);      // Slightly forward (NOT 0.8!)
LIBS.rotateX(THead.MOVE_MATRIX, -Math.PI /3); // Tilt upward

// EYES (positioned on right side of head)
LIBS.translateX(TREyes.MOVE_MATRIX, 0.9);     
// LIBS.translateZ(TREyes.MOVE_MATRIX, 0.55);     
LIBS.translateY(TREyes.MOVE_MATRIX, 0.3);  
LIBS.rotateZ(TREyes.MOVE_MATRIX, Math.PI/8);

LIBS.translateX(TLEyes.MOVE_MATRIX, -0.9);   
// LIBS.translateZ(TLEyes.MOVE_MATRIX, 0.55);    
LIBS.translateY(TLEyes.MOVE_MATRIX, 0.3);   
LIBS.rotateZ(TLEyes.MOVE_MATRIX, -Math.PI/8); 

// PUPILS (white spark)
LIBS.translateX(TRPupil.MOVE_MATRIX, 0.08);
// LIBS.translateZ(TRPupil.MOVE_MATRIX, 0.67);   
// LIBS.translateY(TRPupil.MOVE_MATRIX, 0.3);

LIBS.translateX(TLPupil.MOVE_MATRIX, -0.08);
// LIBS.translateZ(TLPupil.MOVE_MATRIX, 0.67);
// LIBS.translateY(TLPupil.MOVE_MATRIX, 0.3);

// // MOUTH (bottom front of head)
// LIBS.translateY(TUpperMouth.MOVE_MATRIX, -1); 
// LIBS.translateZ(TUpperMouth.MOVE_MATRIX, 0.65);  
// LIBS.rotateX(TUpperMouth.MOVE_MATRIX, Math.PI); 

// LIBS.translateY(TLowerMouth.MOVE_MATRIX, 1); 
// LIBS.translateZ(TLowerMouth.MOVE_MATRIX, 0.65);  

// bezier curve for the mouth lines
// LIBS.translateX(THeadCracks.MOVE_MATRIX, -0.1); 
// LIBS.translateY(THeadCracks.MOVE_MATRIX, -0.2); 
// LIBS.translateZ(THeadCracks.MOVE_MATRIX, 0.3);  
// LIBS.rotateZ(THeadCracks.MOVE_MATRIX, -Math.PI / 2,5);

// Around line 447-451, replace with:
// LIBS.translateX(THeadCracks.MOVE_MATRIX, 0); 
// LIBS.translateY(THeadCracks.MOVE_MATRIX, 0); 
// LIBS.translateZ(THeadCracks.MOVE_MATRIX, 0);  
// Around line 447-451 in main.js

// Position the single crack (around line 380)
LIBS.translateX(THeadCracks.MOVE_MATRIX, -0.1); 
LIBS.translateY(THeadCracks.MOVE_MATRIX, 0);  // Lower position
LIBS.translateZ(THeadCracks.MOVE_MATRIX, 0.05);   // Forward
LIBS.rotateZ(THeadCracks.MOVE_MATRIX, -Math.PI / 2); // Rotate to horizontal
LIBS.rotateY(THeadCracks.MOVE_MATRIX, Math.PI/9);
LIBS.rotateX(THeadCracks.MOVE_MATRIX, Math.PI/9);
// LIBS.rotateZ(THeadCracks.MOVE_MATRIX, -Math.PI / 2);
// LIBS.rotateX(THeadCracks.MOVE_MATRIX, -Math.PI/6); // Tilt to follow head curve (experiment with this value)
// No rotation needed - cracks are already positioned correctly
// // LIBS.rotateX(THeadCracks.MOVE_MATRIX, Math.PI / 3);


// LIBS.translateZ(THeadCracks.MOVE_MATRIX, 0.4);   
// LIBS.translateY(THeadCracks.MOVE_MATRIX, 0.3);
// LIBS.rotateY(THeadCracks.MOVE_MATRIX, -Math.PI / 3);s
// LIBS.rotateX(THeadCracks.MOVE_MATRIX, Math.PI / 3);

//(attached to BODY bottom)
LIBS.translateX(TRFLeg.MOVE_MATRIX, 0.55);    
LIBS.translateZ(TRFLeg.MOVE_MATRIX, 0.4);     
LIBS.translateY(TRFLeg.MOVE_MATRIX, -0.2);   
// LIBS.rotateY(TRFLeg.MOVE_MATRIX, Math.PI);

LIBS.translateX(TRBLeg.MOVE_MATRIX, 0.55);    
LIBS.translateZ(TRBLeg.MOVE_MATRIX, -0.3);    
LIBS.translateY(TRBLeg.MOVE_MATRIX, -0.2);   
// LIBS.rotateY(TRBLeg.MOVE_MATRIX, Math.PI);

LIBS.translateX(TLFLeg.MOVE_MATRIX, -0.55);   
LIBS.translateZ(TLFLeg.MOVE_MATRIX, 0.4);     
LIBS.translateY(TLFLeg.MOVE_MATRIX, -0.2);   
LIBS.rotateY(TLFLeg.MOVE_MATRIX, -Math.PI / 2);

LIBS.translateX(TLBLeg.MOVE_MATRIX, -0.55);   
LIBS.translateZ(TLBLeg.MOVE_MATRIX, -0.3);    
LIBS.translateY(TLBLeg.MOVE_MATRIX, -0.2);   
LIBS.rotateY(TLBLeg.MOVE_MATRIX, -Math.PI / 2);

// LEG TIPS 
LIBS.translateY(TRFLegTip.MOVE_MATRIX, -0.5);  
LIBS.translateY(TRBLegTip.MOVE_MATRIX, -0.5);
LIBS.translateY(TLFLegTip.MOVE_MATRIX, -0.5);
LIBS.translateY(TLBLegTip.MOVE_MATRIX, -0.5);
  // // Horns (relative to head)
  // LIBS.translateX(leftHorn.MOVE_MATRIX, -0.18);
  // LIBS.translateY(leftHorn.MOVE_MATRIX, 0.4);
  // LIBS.translateZ(leftHorn.MOVE_MATRIX, 0.1);
  // LIBS.rotateZ(leftHorn.MOVE_MATRIX, (140 * Math.PI) / 180);
  // LIBS.rotateY(leftHorn.MOVE_MATRIX, (-70 * Math.PI) / 180);

  // // Eyes (child of Head)
  // LEyes.alpha = 0.6; // set transparency
  // LIBS.translateX(LPupils.MOVE_MATRIX, -0.4);
  // LIBS.translateZ(LPupils.MOVE_MATRIX, 0.38);
  // LIBS.rotateY(LPupils.MOVE_MATRIX, (20 * Math.PI) / 180);

  // LIBS.translateZ(LEyes.MOVE_MATRIX, -0.1);

  // REyes.alpha = 0.6; // set transparency
  // LIBS.translateX(RPupils.MOVE_MATRIX, 0.4);
  // LIBS.translateZ(RPupils.MOVE_MATRIX, 0.38);
  // LIBS.rotateY(RPupils.MOVE_MATRIX, (-20 * Math.PI) / 180);

  // LIBS.translateZ(REyes.MOVE_MATRIX, -0.1);

  // ─────────────── Hierarchy ───────────────
  Trapinch.childs.push(TNeck);
  TNeck.childs.push(THead);

  THead.childs.push(TREyes);
  THead.childs.push(TLEyes);

  // ADD PUPILS as children of eyes
  TREyes.childs.push(TRPupil);
  TLEyes.childs.push(TLPupil);
  // THead.childs.push(TUpperMouth);
  // THead.childs.push(TLowerMouth);
  THead.childs.push(THeadCracks);

  Trapinch.childs.push(TRFLeg);
  Trapinch.childs.push(TRBLeg);
  Trapinch.childs.push(TLFLeg);
  Trapinch.childs.push(TLBLeg);

  TRFLeg.childs.push(TRFLegTip);
  TRBLeg.childs.push(TRBLegTip);
  TLFLeg.childs.push(TLFLegTip);
  TLBLeg.childs.push(TLBLegTip);

  // // Eyes (child of Head)
  // Head.childs.push(LPupils);
  // Head.childs.push(RPupils);

  // LPupils.childs.push(LEyes);
  // RPupils.childs.push(REyes);

  // Buffer setup (recursively)
  Trapinch.setup();

  // ─────────────── Camera / Controls ───────────────
  var PROJMATRIX = LIBS.get_projection(
    60,
    CANVAS.width / CANVAS.height,
    1,
    100
  );
  var VIEWMATRIX = LIBS.get_I4();
  LIBS.translateZ(VIEWMATRIX, -10);
  LIBS.rotateY(Trapinch.MOVE_MATRIX, -Math.PI);

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

  // function updateTailFinsTransform() {
  //   // 1) Copy the last segment’s world matrix (tail tip) into the fins
  //   // Replace `tailTipMatrix` with your actual last-bone/segment world matrix
  //   LIBS.copy_I4(tailFins.MOVE_MATRIX, tailTipMatrix);

  //   // 2) Push the fins slightly outward along the tail's local axis.
  //   // If your tail grows toward +Z, use translateZ; if it grows toward +Y, use translateY.
  //   LIBS.translateZ(tailFins.MOVE_MATRIX, TAIL_FINS_LOCAL_OFFSET);

  //   // 3) (Optional) If the fins need to face a specific direction, rotate locally here:
  //   // LIBS.rotateY(tailFins.MOVE_MATRIX, Math.PI / 2); // example tweak if needed
  // }

  // ─────────────── Draw loop ───────────────
  Gl.enable(Gl.DEPTH_TEST);
  Gl.depthFunc(Gl.LEQUAL);
  Gl.clearColor(0.98, 0.94, 0.72, 1.0);
  Gl.clearDepth(1.0);

  let autoRotate = 0;
  var animate = function (time) {  // ← ADD time parameter!
    Gl.viewport(0, 0, CANVAS.width, CANVAS.height);
    Gl.clear(Gl.COLOR_BUFFER_BIT | Gl.DEPTH_BUFFER_BIT);

    // Reset body matrix
    Trapinch.MOVE_MATRIX = LIBS.get_I4();

    //RotateArbitraryAxis
    const axis = [0, 5, 0]; // diagonal arbitrary axis
    const angle = performance.now() * 0.001;
    LIBS.rotateArbitraryAxis(Trapinch.MOVE_MATRIX, axis, angle);


    // / === 🌀 TRANSLATE (whole Trapinch bounce) ===
    const bounce = Math.sin(time * 0.01) * 0.05;
    LIBS.translateY(Trapinch.MOVE_MATRIX, bounce);
    // LIBS.rotateY(Trapinch.MOVE_MATRIX, 1);

    // ========== SCALING (Breathing effect) - Do this FIRST ==========
    let scale = 1.0 + Math.sin(time * 0.001) * 0.03;
    LIBS.scale(Trapinch.MOVE_MATRIX, scale, scale, scale);
    
    // ========== IDLE BOBBING ==========
    let bobOffset = Math.sin(time * 0.002) * 0.08;
    // LIBS.translateY(Trapinch.MOVE_MATRIX, 0.1 + bobOffset); // Add base Y position!
    LIBS.translateY(Trapinch.MOVE_MATRIX, -0.2 + bobOffset); // Around line 528
    
    // Base rotation
    LIBS.rotateX(Trapinch.MOVE_MATRIX, (20 * Math.PI) / 180);

    // User rotation controls
    let temp = LIBS.get_I4();
    LIBS.rotateY(temp, THETA);
    Trapinch.MOVE_MATRIX = LIBS.multiply(Trapinch.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateX(temp, PHI);
    Trapinch.MOVE_MATRIX = LIBS.multiply(Trapinch.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.translateZ(temp, -0.6);
    Trapinch.MOVE_MATRIX = LIBS.multiply(Trapinch.MOVE_MATRIX, temp);

    autoRotate += 0.02;
    if (autoRotate > Math.PI * 2) autoRotate -= Math.PI * 2;

    temp = LIBS.get_I4();
    LIBS.translateZ(temp, 0.6);
    Trapinch.MOVE_MATRIX = LIBS.multiply(Trapinch.MOVE_MATRIX, temp);

    

    // ========== WALKING ANIMATION (Leg swing) ==========
    // let legSwing = Math.sin(time * 0.003) * 0.25;
    
    // // Reset leg matrices before animation
    // TRFLeg.MOVE_MATRIX = LIBS.get_I4();
    // TRBLeg.MOVE_MATRIX = LIBS.get_I4();
    // TLFLeg.MOVE_MATRIX = LIBS.get_I4();
    // TLBLeg.MOVE_MATRIX = LIBS.get_I4();
    
    // // Right Front Leg: position + swing
    // LIBS.translateX(TRFLeg.MOVE_MATRIX, 0.5);
    // LIBS.translateZ(TRFLeg.MOVE_MATRIX, 0.3);
    // LIBS.translateY(TRFLeg.MOVE_MATRIX, -0.3);
    // LIBS.rotateX(TRFLeg.MOVE_MATRIX, legSwing);

    // // Left Front Leg: position + swing
    // LIBS.translateX(TRBLeg.MOVE_MATRIX, -0.5);
    // LIBS.translateZ(TRBLeg.MOVE_MATRIX, 0.3);
    // LIBS.translateY(TRBLeg.MOVE_MATRIX, -0.3);
    // LIBS.rotateX(TRBLeg.MOVE_MATRIX, legSwing);

    // // Right Back Leg: position + opposite swing
    // LIBS.translateX(TLFLeg.MOVE_MATRIX, 0.5);
    // LIBS.translateZ(TLFLeg.MOVE_MATRIX, -0.3);
    // LIBS.translateY(TLFLeg.MOVE_MATRIX, -0.3);
    // LIBS.rotateX(TLFLeg.MOVE_MATRIX, -legSwing);
    // // LIBS.rotateY(TLFLeg.MOVE_MATRIX, Math.PI/6)
    
    // // Left Back Leg: position + opposite swing
    // LIBS.translateX(TLBLeg.MOVE_MATRIX, -0.5);
    // LIBS.translateZ(TLBLeg.MOVE_MATRIX, -0.3);
    // LIBS.translateY(TLBLeg.MOVE_MATRIX, -0.3);
    // LIBS.rotateX(TLBLeg.MOVE_MATRIX, -legSwing);

    // ========== CAT-LIKE WALKING ANIMATION ==========
    // Cats use diagonal gait: RF+LB move together, LF+RB move together
    let walkCycle = Math.sin(time * 0.003); // Smooth oscillation
    let legLift = Math.max(0, Math.sin(time * 0.003)) * 0.15; // Only lift up (no negative)
    let legSwingFwd = Math.sin(time * 0.003) * 0.1; // Forward/backward swing

    // Reset all leg matrices
    TRFLeg.MOVE_MATRIX = LIBS.get_I4();
    TRBLeg.MOVE_MATRIX = LIBS.get_I4();
    TLFLeg.MOVE_MATRIX = LIBS.get_I4();
    TLBLeg.MOVE_MATRIX = LIBS.get_I4();

    // RIGHT FRONT LEG (moves with LEFT BACK)
    LIBS.translateX(TRFLeg.MOVE_MATRIX, 0.55);
    LIBS.translateZ(TRFLeg.MOVE_MATRIX, 0.4 + legSwingFwd);  // Forward swing
    LIBS.translateY(TRFLeg.MOVE_MATRIX, -0.2 + legLift);     // Lift up
    LIBS.rotateX(TRFLeg.MOVE_MATRIX, legSwingFwd * 0.5);     // Rotate forward

    // RIGHT BACK LEG (opposite phase - moves with LEFT FRONT)
    LIBS.translateX(TRBLeg.MOVE_MATRIX, 0.55);
    LIBS.translateZ(TRBLeg.MOVE_MATRIX, -0.3 - legSwingFwd); // Backward swing (opposite)
    LIBS.translateY(TRBLeg.MOVE_MATRIX, -0.2 + Math.max(0, -Math.sin(time * 0.003)) * 0.15); // Opposite lift
    LIBS.rotateX(TRBLeg.MOVE_MATRIX, -legSwingFwd * 0.5);    // Rotate backward

    // LEFT FRONT LEG (moves with RIGHT BACK)
    LIBS.translateX(TLFLeg.MOVE_MATRIX, -0.55);
    LIBS.translateZ(TLFLeg.MOVE_MATRIX, 0.4 - legSwingFwd);  // Backward swing (opposite of RF)
    LIBS.translateY(TLFLeg.MOVE_MATRIX, -0.2 + Math.max(0, -Math.sin(time * 0.003)) * 0.15); // Opposite lift
    LIBS.rotateY(TLFLeg.MOVE_MATRIX, -Math.PI / 2);
    LIBS.rotateX(TLFLeg.MOVE_MATRIX, -legSwingFwd * 0.5);

    // LEFT BACK LEG (moves with RIGHT FRONT)
    LIBS.translateX(TLBLeg.MOVE_MATRIX, -0.55);
    LIBS.translateZ(TLBLeg.MOVE_MATRIX, -0.3 + legSwingFwd); // Forward swing (same as RF)
    LIBS.translateY(TLBLeg.MOVE_MATRIX, -0.2 + legLift);     // Lift up (same as RF)
    LIBS.rotateY(TLBLeg.MOVE_MATRIX, -Math.PI / 2);
    LIBS.rotateX(TLBLeg.MOVE_MATRIX, legSwingFwd * 0.5);

    // Optional: Add slight body sway for more natural movement
    let bodySway = Math.sin(time * 0.003) * 0.02;
    LIBS.rotateZ(Trapinch.MOVE_MATRIX, bodySway); // Slight side-to-side sway

    // Friction for mouse drag
    if (!drag) {
      dX *= 1 - FRICTION;
      dY *= 1 - FRICTION;
      THETA += dX;
      PHI += dY;
    }

    // Render
    Gl.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    Gl.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
    Trapinch.render(LIBS.get_I4());

    Gl.flush();
    requestAnimationFrame(animate);
  };
animate(0);  // Start animation with time = 0
};
window.addEventListener("load", main);
