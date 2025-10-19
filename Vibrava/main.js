import { MyObject } from './myObject.js';
import { LIBS } from './libs.js';
import { generateBadanWithStripes } from './badan.js';
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

    // Shaders
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

    void main(void) {
        gl_FragColor = vec4(vColor, 1.0);
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

    // Generate Badan
    var bodyData = generateBadanWithStripes(3.0, 1.2, 1.2, 30, 30, 3); 

    var BODY_VERTEX = bodyData.vertices;
    var BODY_FACES = bodyData.faces;

    var Body = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, BODY_VERTEX, BODY_FACES);
    Body.setup();

    // Generate Kepala
    var headData = generateKepala(1.5, 1.2, 1.2, 30, 30);    
    var HEAD_VERTEX = headData.vertices;
    var HEAD_FACES = headData.faces;

    var Head = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, HEAD_VERTEX, HEAD_FACES);
    Head.setup();

   // Mata kiri (ke samping kiri kepala)
    var leftEyeData = generateMata(0.8, 2.5, 1.0, 0.0, 0.4, 20, 20);
    var LeftEye = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, leftEyeData.vertices, leftEyeData.faces);

    // Mata kanan (ke samping kanan kepala)
    var rightEyeData = generateMata(0.8, 2.5, -1.0, 0.0, -0.4, 20, 20);
    var RightEye = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, rightEyeData.vertices, rightEyeData.faces);

    // Masukkan sebagai child dari kepala
    Head.childs.push(LeftEye);
    Head.childs.push(RightEye);


    // Geser kepala ke depan badan
    LIBS.translateX(Head.MOVE_MATRIX, 3.5);

    // pasang hierarchy: kepala anak dari badan
    Body.childs.push(Head);

    // Setup semua object
    Body.setup();

    // Matrix kamera
    var PROJMATRIX = LIBS.get_projection(60, CANVAS.width / CANVAS.height, 1, 100);
    var VIEWMATRIX = LIBS.get_I4();
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

    var mouseUp = function (e) {
        drag = false;
    };

    var mouseMove = function (e) {
        if (!drag) return false;
        dX = (e.pageX - x_prev) * 2 * Math.PI / CANVAS.width;
        dY = (e.pageY - y_prev) * 2 * Math.PI / CANVAS.height;
        THETA += dX;
        PHI += dY;
        x_prev = e.pageX, y_prev = e.pageY;
        e.preventDefault();
    };

    var zoom = -20; // posisi awal kamera

    // Event untuk scroll zoom
    var mouseWheel = function (e) {
        e.preventDefault();
        var delta = e.deltaY * 0.05; // sensitivitas zoom
        zoom += delta;

        // batasi biar ga terlalu dekat atau jauh
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

    // Drawing
    Gl.enable(Gl.DEPTH_TEST);
    Gl.depthFunc(Gl.LEQUAL);
    Gl.clearColor(0.0, 0.0, 0.0, 1.0);
    Gl.clearDepth(1.0);

    var lastTime = 0;
    var animate = function (time) {
        Gl.viewport(0, 0, CANVAS.width, CANVAS.height);
        Gl.clear(Gl.COLOR_BUFFER_BIT | Gl.DEPTH_BUFFER_BIT);

        Gl.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        Gl.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

        // Buat matriks model identity
        var MODEL = LIBS.get_I4();

        // Apply rotasi berdasarkan mouse
        LIBS.rotateY(MODEL, THETA);
        LIBS.rotateX(MODEL, PHI);
        LIBS.set_I4(VIEWMATRIX);
        LIBS.translateZ(VIEWMATRIX, zoom);

        // render badan pakai model matrix yg sudah diputar
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
