import { MyObject } from './myObject.js';
import { LIBS } from './libs.js';
import { generateBadanVibrava } from './badan.js';
import { generateKepala } from './kepala.js';
import { generateMata } from './mata.js';

function main() {
  var CANVAS = document.getElementById("mycanvas");

  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;

  var Gl;
  try {
    Gl = CANVAS.getContext("webgl", { antialias: true });
  } catch (e) {
    alert("WebGL not supported");
    console.log(e);
    return false;
  }

  // --- Shaders (now support opacity via uAlpha uniform) ---
  var shader_vertex_source = `
    attribute vec3 position;
    uniform mat4 Pmatrix, Vmatrix, Mmatrix;
    attribute vec3 color;
    varying vec3 vColor;

    void main(void) {
        gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.0);
        vColor = color;
    }
  `;

  var shader_fragment_source = `
    precision mediump float;
    varying vec3 vColor;
    uniform float uAlpha;   // per-object opacity

    void main(void) {
        gl_FragColor = vec4(vColor, uAlpha);
    }
  `;

  var compile_shader = function (source, type, typeString) {
    var shader = Gl.createShader(type);
    Gl.shaderSource(shader, source);
    Gl.compileShader(shader);
    if (!Gl.getShaderParameter(shader, Gl.COMPILE_STATUS)) {
      console.error("Error in " + typeString + " shader: " + Gl.getShaderInfoLog(shader));
      Gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  var SHADER_PROGRAM = Gl.createProgram();
  var shader_vertex = compile_shader(shader_vertex_source, Gl.VERTEX_SHADER, "vertex");
  var shader_fragment = compile_shader(shader_fragment_source, Gl.FRAGMENT_SHADER, "fragment");

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

  Gl.useProgram(SHADER_PROGRAM);

  // --- Enable blending for opacity ---
  Gl.enable(Gl.DEPTH_TEST);
  Gl.depthFunc(Gl.LEQUAL);
  Gl.enable(Gl.BLEND);
  Gl.blendFunc(Gl.SRC_ALPHA, Gl.ONE_MINUS_SRC_ALPHA);

  Gl.clearColor(0.0, 0.0, 0.0, 1.0);
  Gl.clearDepth(1.0);

  // Generate geometry
  var bodyData = generateBadanVibrava(8, 0.8, 0.2, 120, 48);
  var headData = generateKepala(1.4, 1.3, 1.4, 30, 30);
  var leftEyeData = generateMata(0.8, 20, 20);
  var leftRetinaData = generateMata(0.4, 20, 20, [0, 0, 0]); 
  var rightEyeData = leftEyeData;
  var rightRetinaData = leftRetinaData;

  var Body = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, bodyData.vertices, bodyData.faces);
  var Head = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, headData.vertices, headData.faces);
  var LeftEye = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, leftEyeData.vertices, leftEyeData.faces);
  var RightEye = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, rightEyeData.vertices, rightEyeData.faces);
  var LeftRetina = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, leftRetinaData.vertices, leftRetinaData.faces);
  var RightRetina = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, rightRetinaData.vertices, rightRetinaData.faces);

  // Positioning
  LIBS.translateX(Head.MOVE_MATRIX, 4.8);

  // Example: set eye opacity (optional)
  LeftEye.alpha = 0.4;
  RightEye.alpha = 0.4;

//   LIBS.translateZ(LeftEye.MOVE_MATRIX, 1.3);
//   LIBS.translateZ(RightEye.MOVE_MATRIX, -1.3);
  LIBS.translateZ(LeftRetina.MOVE_MATRIX, 1.4);
  LIBS.translateZ(RightRetina.MOVE_MATRIX, -1.4);

  Body.childs.push(Head);
  Head.childs.push(LeftRetina);
  Head.childs.push(RightRetina);
  LeftRetina.childs.push(LeftEye);
  RightRetina.childs.push(RightEye);

  Body.setup();

  var PROJMATRIX = LIBS.get_projection(60, CANVAS.width / CANVAS.height, 1, 100);
  var VIEWMATRIX = LIBS.get_I4();
  var zoom = -20; // initial camera

  LIBS.translateZ(VIEWMATRIX, zoom);

  // Mouse
  var THETA = 0, PHI = 0;
  var drag = false;
  var x_prev, y_prev;

  var FRICTION = 0.05;
  var dX = 0, dY = 0;
  var SPEED = 0.05;

  var mouseDown = function (e) {
    drag = true;
    x_prev = e.pageX, y_prev = e.pageY;
    e.preventDefault();
    return false;
  };

  var mouseUp = function (e) { drag = false; };

  var mouseMove = function (e) {
    if (!drag) return false;
    dX = (e.pageX - x_prev) * 2 * Math.PI / CANVAS.width;
    dY = (e.pageY - y_prev) * 2 * Math.PI / CANVAS.height;
    THETA += dX;
    PHI += dY;
    x_prev = e.pageX, y_prev = e.pageY;
    e.preventDefault();
  };

  var mouseWheel = function (e) {
    e.preventDefault();
    var delta = e.deltaY * 0.05;
    zoom += delta;
    zoom = Math.min(-5, Math.max(-50, zoom));
  };

  var keyDown = function (e) {
    if (e.key === 'w') dY -= SPEED;
    else if (e.key === 'a') dX -= SPEED;
    else if (e.key === 's') dY += SPEED;
    else if (e.key === 'd') dX += SPEED;
  };

  window.addEventListener("keydown", keyDown, false);
  CANVAS.addEventListener("mousedown", mouseDown, false);
  CANVAS.addEventListener("mouseup", mouseUp, false);
  CANVAS.addEventListener("mouseout", mouseUp, false);
  CANVAS.addEventListener("mousemove", mouseMove, false);
  CANVAS.addEventListener("wheel", mouseWheel, false);

  var animate = function () {
    Gl.viewport(0, 0, CANVAS.width, CANVAS.height);
    Gl.clear(Gl.COLOR_BUFFER_BIT | Gl.DEPTH_BUFFER_BIT);

    Gl.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    Gl.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

    var MODEL = LIBS.get_I4();
    LIBS.rotateY(MODEL, THETA);
    LIBS.rotateX(MODEL, PHI);
    LIBS.set_I4(VIEWMATRIX);
    LIBS.translateZ(VIEWMATRIX, zoom);

    Body.render(MODEL);

    if (!drag) {
      dX *= (1 - FRICTION);
      dY *= (1 - FRICTION);
      THETA += dX;
      PHI += dY;
    }

    Gl.flush();
    requestAnimationFrame(animate);
  };
  animate(0);
}

window.addEventListener('load', main);
