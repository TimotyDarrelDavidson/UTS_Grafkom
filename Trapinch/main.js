import { MyObject } from './myObject.js';
import { LIBS } from './libs.js';

function main() {
    var CANVAS = document.getElementById("mycanvas");

    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;


    /**
     * @type {CanvasRenderingContext2D}
     */

    // var CTX = CANVAS.getContext("2d");
    // CTX.fillStyle = "red";
    // CTX.fillRect(0, 0, 100, 100);

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
        gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
        vColor = color;
    }
    `;

    var shader_fragment_source = `
    precision mediump float;
    varying vec3 vColor;

    void main(void) {
        gl_FragColor = vec4(vColor, 1.);
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
    }

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
    var uniform_color = Gl.getUniformLocation(SHADER_PROGRAM, "uColor");

    // POINTS
    var CUBE_VERTEX = [
        -1, -1, -1, 0, 0, 0,
        1, -1, -1, 1, 0, 0,
        1,  1, -1, 1, 1, 0,
        -1,  1, -1, 0, 1, 0,
        -1, -1,  1, 0, 0, 1,
        1, -1,  1, 1, 0, 1,
        1,  1,  1, 1, 1, 1,
        -1,  1,  1, 0, 1, 1
    ];
    
    var CUBE_FACES = [
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        0, 3, 7, 0, 4, 7,
        1, 2, 6, 1, 5, 6,
        2, 3, 6, 3, 7, 6,
        0, 1, 5, 0, 4, 5
    ];

    var Object1 = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, CUBE_VERTEX, CUBE_FACES);
    var Object2 = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, CUBE_VERTEX, CUBE_FACES);
    var Object3 = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, CUBE_VERTEX, CUBE_FACES);
    var Object4 = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, CUBE_VERTEX, CUBE_FACES);

    Object1.childs.push(Object2);
    Object2.childs.push(Object3);
    Object1.childs.push(Object4);

    LIBS.translateY(Object4.POSITION_MATRIX, -4);

    LIBS.translateX(Object2.POSITION_MATRIX, 5);
    LIBS.scaleX(Object2.POSITION_MATRIX, 0.75);
    LIBS.scaleY(Object2.POSITION_MATRIX, 0.75);
    LIBS.scaleZ(Object2.POSITION_MATRIX, 0.75);

    LIBS.translateY(Object3.POSITION_MATRIX, 4);
    LIBS.scaleX(Object3.POSITION_MATRIX, 0.75);
    LIBS.scaleY(Object3.POSITION_MATRIX, 0.75);
    LIBS.scaleZ(Object3.POSITION_MATRIX, 0.75);

    Object1.setup();

    var PROJMATRIX = LIBS.get_projection(60, CANVAS.width / CANVAS.height, 1, 100);
    var VIEWMATRIX = LIBS.get_I4();

    LIBS.translateZ(VIEWMATRIX, -20)

    // Mouse
    var THETA = 0, PHI = 0;
    var drag = false;
    var x_prev, y_prev;

    // Add Friction
    var FRICTION = 0.05;
    var dX = 0, dY = 0;

    // Control Speed using Keyboard
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

    // Keyboard WASD
    var keyDown = function (e) {
        if (e.key === 'w') {
            dY -= SPEED;
        }
        else if (e.key === 'a') {
            dX -= SPEED;
        }
        else if (e.key === 's') {
            dY += SPEED;
        }
        else if (e.key === 'd') {
            dX += SPEED;
        }
    };

    window.addEventListener("keydown", keyDown, false);

    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);

    // Drawing
    Gl.enable(Gl.DEPTH_TEST);
    Gl.depthFunc(Gl.LEQUAL);
    Gl.clearColor(0.98, 0.94, 0.72, 1.0);
    Gl.clearDepth(1.0);

    var lastTime = 0;
    var animate = function (time) {
        Gl.viewport(0, 0, CANVAS.width, CANVAS.height);
        Gl.clear(Gl.COLOR_BUFFER_BIT | Gl.DEPTH_BUFFER_BIT);

        var dt = time - lastTime; lastTime = time;

        LIBS.rotateY(Object1.MOVE_MATRIX, dt * 0.001);
        LIBS.rotateX(Object2.MOVE_MATRIX, dt * 0.001);
        LIBS.rotateZ(Object3.MOVE_MATRIX, dt * 0.001);

        Gl.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        Gl.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

        Object1.render(LIBS.get_I4());

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