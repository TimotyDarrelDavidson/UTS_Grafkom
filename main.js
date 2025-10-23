import { MyObject } from "./myObject.js";
import { LIBS } from "./libs.js";
import { createFlygon } from "./Flygon/createFlygon.js";
import { createTrapinch } from "./Trapinch/createTrapinch.js";
import {
  generateDesertTerrain,
  generateSkyDome,
  generateSun,
  generateCloud,
  //   CloudManager
} from "./Environtment/environment.js";
import { createVibrava } from "./Vibrava/createVibrava.js";

class EnvObject {
  constructor(gl, program, posLoc, colorLoc, matLoc, vertices, faces) {
    this.gl = gl;
    this.program = program;
    this.posLoc = posLoc;
    this.colorLoc = colorLoc;
    this.matLoc = matLoc;

    this.MOVE_MATRIX = LIBS.get_I4();
    this.alpha = 1.0;

    // Vertex buffer
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Index buffer
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(faces),
      gl.STATIC_DRAW
    );

    this.faceCount = faces.length;
  }

  render(modelMatrix) {
    const gl = this.gl;
    const finalMatrix = LIBS.multiply(modelMatrix, this.MOVE_MATRIX);

    gl.uniformMatrix4fv(this.matLoc, false, finalMatrix);

    const uAlpha = gl.getUniformLocation(this.program, "uAlpha");
    gl.uniform1f(uAlpha, this.alpha);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.posLoc, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(this.colorLoc, 3, gl.FLOAT, false, 24, 12);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.faceCount, gl.UNSIGNED_SHORT, 0);
  }
}

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
        uniform float uAlpha;

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
  Gl.clearColor(0.5, 0.3, 0.4, 1.0);
  Gl.clearDepth(1.0);
  Gl.disable(Gl.CULL_FACE);

  // Generate environment
  console.log("Generating desert terrain...");
  var desertData = generateDesertTerrain(200, 200, 50);
  console.log("Generating sky dome...");
  var skyData = generateSkyDome(150, 32);
  console.log("Generating sun...");
  var sunData = generateSun(5, 20);
  console.log("Generating clouds...");
  var cloudData = generateCloud(8, 2, 6);

  // Create objects
  var Desert = new EnvObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    desertData.vertices,
    desertData.faces
  );

  var Sky = new EnvObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    skyData.vertices,
    skyData.faces
  );

  var Sun = new EnvObject(
    Gl,
    SHADER_PROGRAM,
    _position,
    _color,
    _Mmatrix,
    sunData.vertices,
    sunData.faces
  );

  // Position sun - SUNSET BESAR
  LIBS.set_I4(Sun.MOVE_MATRIX);
  LIBS.translateX(Sun.MOVE_MATRIX, -30);
  LIBS.translateY(Sun.MOVE_MATRIX, -2);
  LIBS.scaleInPlace(Sun.MOVE_MATRIX, 4.5, 4.5, 4.5);

  // === BUAT CLOUDS DENGAN AWAN BACKGROUND ===
  var clouds = [];

  for (let i = 0; i < 8; i++) {
    var cloud = new EnvObject(
      Gl,
      SHADER_PROGRAM,
      _position,
      _color,
      _Mmatrix,
      cloudData.vertices,
      cloudData.faces
    );
    clouds.push(cloud);

    // SET POSISI SETELAH PUSH KE ARRAY
    const startX = -60 + i * 25;
    const y = 20 + Math.random() * 10;
    const z = -30 + (i % 3) * 20;

    LIBS.set_I4(cloud.MOVE_MATRIX);
    LIBS.translateX(cloud.MOVE_MATRIX, startX);
    LIBS.translateY(cloud.MOVE_MATRIX, y);
    LIBS.translateZ(cloud.MOVE_MATRIX, z);
    LIBS.scaleInPlace(cloud.MOVE_MATRIX, 1.8, 1.8, 1.8);
  }

  // AWAN BACKGROUND (12 awan di belakang)
  for (let i = 0; i < 12; i++) {
    var cloud = new EnvObject(
      Gl,
      SHADER_PROGRAM,
      _position,
      _color,
      _Mmatrix,
      cloudData.vertices,
      cloudData.faces
    );
    clouds.push(cloud);

    const startX = -100 + i * 30;
    const y = 15 + Math.random() * 15;
    const z = -80 + Math.random() * 50;

    LIBS.set_I4(cloud.MOVE_MATRIX);
    LIBS.translateX(cloud.MOVE_MATRIX, startX);
    LIBS.translateY(cloud.MOVE_MATRIX, y);
    LIBS.translateZ(cloud.MOVE_MATRIX, z);
    LIBS.scaleInPlace(cloud.MOVE_MATRIX, 2.2, 2.2, 2.2);
    cloud.alpha = 0.6; // Lebih transparan untuk efek jauh
  }

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
  const Vibrava = createVibrava(Gl, SHADER_PROGRAM, {
    _position,
    _color,
    _Mmatrix,
  });

  // Attach Trapinch to Flygon (so it moves with Flygon)
  Flygon.root.childs.push(Trapinch.root);
  Flygon.root.childs.push(Vibrava.root);

  // ─── Camera ───
  let PROJMATRIX = LIBS.get_projection(
    60,
    CANVAS.width / CANVAS.height,
    1,
    400
  );
  let VIEWMATRIX = LIBS.get_I4();

  // Camera pan offsets (for right-click drag)
  let camPanX = 0;
  let camPanY = 0;

  // Zoom
  let zoom = 15;
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
      camPanY -= deltaY * PAN_SENS; // Invert Y for natural feel
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
    LIBS.rotateY(VIEWMATRIX, camPanX);

    Gl.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
    Gl.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

    // Animate both (Trapinch is child of Flygon, so it inherits transformations)
    Trapinch.animate(t, { theta: 0, phi: PHI, camDist: zoom });
    Flygon.animate(t, { theta: THETA, phi: 0, camDist: zoom });
    Vibrava.animate(t, { theta: 0, phi: 0, camDist: zoom });

    LIBS.rotateY(Flygon.root.MOVE_MATRIX, (-90 * Math.PI) / 180);
    LIBS.rotateX(Flygon.parts.Head.MOVE_MATRIX, (-20 * Math.PI) / 180);

    // Position Trapinch on top of Flygon's head
    LIBS.translateY(Trapinch.root.MOVE_MATRIX, 4.2); // on top of head
    LIBS.translateZ(Trapinch.root.MOVE_MATRIX, -0.2); // on top of head
    LIBS.rotateX(Trapinch.root.MOVE_MATRIX, (-30 * Math.PI) / 180);
    LIBS.scaleX(Trapinch.root.MOVE_MATRIX, 0.5);
    LIBS.scaleY(Trapinch.root.MOVE_MATRIX, 0.5);
    LIBS.scaleZ(Trapinch.root.MOVE_MATRIX, 0.5);

    LIBS.set_I4(Vibrava.root.MOVE_MATRIX);
    LIBS.translateX(Vibrava.root.MOVE_MATRIX, 6.0);
    LIBS.rotateY(Vibrava.root.MOVE_MATRIX, (-90 * Math.PI) / 180);
    LIBS.rotateX(Vibrava.root.MOVE_MATRIX, (-35 * Math.PI) / 180);
    LIBS.scaleX(Vibrava.root.MOVE_MATRIX, 0.30);
    LIBS.scaleY(Vibrava.root.MOVE_MATRIX, 0.30);
    LIBS.scaleZ(Vibrava.root.MOVE_MATRIX, 0.30);

    // Render entire hierarchy (Flygon renders Trapinch automatically)
    Flygon.root.render(LIBS.get_I4());

    var MODEL = LIBS.get_I4();

    // Render sky first (background)
    Sky.render(MODEL);

    // Render clouds - SEBELUM matahari agar matahari terlihat di depan awan
    clouds.forEach((cloud, i) => {
      if (i < 8) {
        cloud.alpha = 0.8;
      } else {
        cloud.alpha = 0.6;
      }
      cloud.render(MODEL);
    });

    // Render sun - SETELAH sky dome dan clouds
    Sun.render(MODEL);

    // Render desert terakhir (foreground)
    Desert.render(MODEL);

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
