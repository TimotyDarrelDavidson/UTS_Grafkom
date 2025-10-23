import { MyObject } from "./myObject.js";
import { LIBS } from "./libs.js";
import { createFlygon } from "./Flygon/createFlygon.js";
import { createTrapinch } from "./Trapinch/createTrapinch.js";

function main() {
  const CANVAS = document.getElementById("mycanvas");
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

  // ─── Shaders ───
  const shader_vertex_source = `
    attribute vec3 position;
    uniform mat4 Pmatrix, Vmatrix, Mmatrix;
    attribute vec3 color;
    varying vec3 vColor;
    void main(void) {
      gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.0);
      vColor = color;
    }
  `;
  const shader_fragment_source = `
    precision mediump float;
    varying vec3 vColor;
    uniform float uAlpha;   // per-object opacity
    void main(void) {
      gl_FragColor = vec4(vColor, uAlpha);
    }
  `;

  const compile_shader = (source, type, typeString) => {
    const shader = Gl.createShader(type);
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

  const SHADER_PROGRAM = Gl.createProgram();
  const shader_vertex = compile_shader(
    shader_vertex_source,
    Gl.VERTEX_SHADER,
    "vertex"
  );
  const shader_fragment = compile_shader(
    shader_fragment_source,
    Gl.FRAGMENT_SHADER,
    "fragment"
  );
  Gl.attachShader(SHADER_PROGRAM, shader_vertex);
  Gl.attachShader(SHADER_PROGRAM, shader_fragment);
  Gl.linkProgram(SHADER_PROGRAM);

  const _position = Gl.getAttribLocation(SHADER_PROGRAM, "position");
  const _color = Gl.getAttribLocation(SHADER_PROGRAM, "color");
  const _Pmatrix = Gl.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
  const _Vmatrix = Gl.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
  const _Mmatrix = Gl.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

  Gl.enableVertexAttribArray(_position);
  Gl.enableVertexAttribArray(_color);
  Gl.useProgram(SHADER_PROGRAM);

  // ─── GL state ───
  Gl.enable(Gl.DEPTH_TEST);
  Gl.depthFunc(Gl.LEQUAL);
  Gl.enable(Gl.BLEND);
  Gl.blendFunc(Gl.SRC_ALPHA, Gl.ONE_MINUS_SRC_ALPHA);
  Gl.clearColor(1, 1, 1, 1.0);
  Gl.clearDepth(1.0);
  Gl.disable(Gl.CULL_FACE);

  // ─── Scene ───
  const Flygon = createFlygon(Gl, SHADER_PROGRAM, {
    _position,
    _color,
    _Mmatrix,
  });
  const Trapinch = createTrapinch(Gl, SHADER_PROGRAM, {
    _position,
    _color,
    _Mmatrix,
  });

  // Attach Trapinch to Flygon (so it moves with Flygon)
  Flygon.root.childs.push(Trapinch.root);

  // ─── Camera ───
  let PROJMATRIX = LIBS.get_projection(
    60,
    CANVAS.width / CANVAS.height,
    1,
    100
  );
  let VIEWMATRIX = LIBS.get_I4();

  // Camera pan offsets (for right-click drag)
  let camPanX = 0;
  let camPanY = 0;

  // Zoom
  let zoom = 20;
  const MIN_DIST = 3;
  const MAX_DIST = 30;
  const ZOOM_SENS = 0.25;

  // ─── Mouse controls ───
  let THETA = 0,
    PHI = 0; // Pokemon rotation (left-click)
  let leftDrag = false,
    rightDrag = false;
  let x_prev, y_prev;
  const FRICTION = 0.05;
  let dX = 0,
    dY = 0;
  const SPEED = 0.05;
  const PAN_SENS = 0.01;

  const mouseDown = (e) => {
    x_prev = e.pageX;
    y_prev = e.pageY;

    if (e.button === 0) {
      // Left click - rotate Pokemon
      leftDrag = true;
    } else if (e.button === 2) {
      // Right click - pan camera
      rightDrag = true;
    }
    e.preventDefault();
  };

  const mouseUp = () => {
    leftDrag = false;
    rightDrag = false;
  };

  const mouseMove = (e) => {
    if (!leftDrag && !rightDrag) return;
    
    const deltaX = e.pageX - x_prev;
    const deltaY = e.pageY - y_prev;
    
    if (leftDrag) {
      // Rotate Pokemon
      dX = (deltaX * 2 * Math.PI) / CANVAS.width;
      dY = (deltaY * 2 * Math.PI) / CANVAS.height;
      THETA += dX;
      PHI += dY;
    } else if (rightDrag) {
      // Pan camera
      camPanX += deltaX * PAN_SENS;
      camPanY -= deltaY * PAN_SENS;  // Invert Y for natural feel
    }
    
    x_prev = e.pageX;
    y_prev = e.pageY;
    e.preventDefault();
  };

  const onWheel = (e) => {
    e.preventDefault();
    zoom += e.deltaY * (ZOOM_SENS / 10);
    if (zoom < MIN_DIST) zoom = MIN_DIST;
    if (zoom > MAX_DIST) zoom = MAX_DIST;
  };

  const onResize = () => {
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
    Gl.viewport(0, 0, CANVAS.width, CANVAS.height);
    PROJMATRIX = LIBS.get_projection(60, CANVAS.width / CANVAS.height, 1, 100);
  };

  // Event listeners
  window.addEventListener("resize", onResize, false);
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "w") dY -= SPEED;
      else if (e.key === "a") dX -= SPEED;
      else if (e.key === "s") dY += SPEED;
      else if (e.key === "d") dX += SPEED;
    },
    false
  );

  CANVAS.addEventListener("mousedown", mouseDown, false);
  CANVAS.addEventListener("mouseup", mouseUp, false);
  CANVAS.addEventListener("mouseout", mouseUp, false);
  CANVAS.addEventListener("mousemove", mouseMove, false);
  CANVAS.addEventListener("wheel", onWheel, { passive: false });
  CANVAS.addEventListener("contextmenu", (e) => e.preventDefault(), false); // Disable context menu

  // ─── Draw loop ───
  const animate = (tMs) => {
    const t = tMs * 0.001; // seconds

    Gl.viewport(0, 0, CANVAS.width, CANVAS.height);
    Gl.clear(Gl.COLOR_BUFFER_BIT | Gl.DEPTH_BUFFER_BIT);

    // Build view matrix with zoom and pan
    VIEWMATRIX = LIBS.get_I4();
    LIBS.translateZ(VIEWMATRIX, -zoom);
    LIBS.rotateX(VIEWMATRIX, -camPanY);
    LIBS.rotateY(VIEWMATRIX, camPanX);

    Gl.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    Gl.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

    // Animate both (Trapinch is child of Flygon, so it inherits transformations)
    Trapinch.animate(t, { theta: THETA, phi: PHI, camDist: zoom });
    Flygon.animate(t, { theta: THETA, phi: PHI, camDist: zoom });

    LIBS.rotateX(Flygon.parts.Head.MOVE_MATRIX, -20 * Math.PI / 180)

    // Position Trapinch on top of Flygon's head
    LIBS.translateY(Trapinch.root.MOVE_MATRIX, 4.2); // on top of head
    LIBS.translateZ(Trapinch.root.MOVE_MATRIX, -.2); // on top of head
    LIBS.rotateX(Trapinch.root.MOVE_MATRIX, -30 * Math.PI / 180)
    LIBS.scaleX(Trapinch.root.MOVE_MATRIX, 0.5);
    LIBS.scaleY(Trapinch.root.MOVE_MATRIX, 0.5);
    LIBS.scaleZ(Trapinch.root.MOVE_MATRIX, 0.5);

    // Render entire hierarchy (Flygon renders Trapinch automatically)
    Flygon.root.render(LIBS.get_I4());

    // Smooth rotation when not dragging
    if (!leftDrag) {
      dX *= 1 - FRICTION;
      dY *= 1 - FRICTION;
      THETA += dX;
      PHI += dY;
    }

    Gl.flush();
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

window.addEventListener("load", main);
