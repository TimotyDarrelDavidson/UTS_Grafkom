import { MyObject } from './myObject.js';
import { LIBS } from './libs.js';
import { generateFlygonBodyBezier } from './BodyParts/FlygonBody.js';
import { generateFlygonBelly } from './BodyParts/FlygonBelly.js';
import { generateFlygonHead } from './BodyParts/FlygonHead.js';
import { generateCurvedHorn_flat } from './BodyParts/FlygonHorn.js';
import { generateFlygonThigh } from './BodyParts/FlygonThigh.js';

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

    let p0 = [0, 0, 0];     // tail base
    let p1 = [0, 1.2, 1.0]; // abdomen bulge forward
    let p2 = [0, 2.2, -0.2];// chest pulls back
    let p3 = [0, 3.5, 0];   // neck

    let FlygonBody = generateFlygonBodyBezier(p0, p1, p2, p3, 1, 1, 80, 40);
    let FlygonBelly = generateFlygonBelly(0.8,0.5,1, 40, 40);
    let FlygonHead = generateFlygonHead(0.5,0.4,0.7, 40, 40);
    let FlygonHornCurved = generateCurvedHorn_flat(0.15, 0.02, 0.9, 22, 18);
    let FlygonThigh = generateFlygonThigh(0.4,0.8,0.5, 40, 40, false);
    let FlygonInnerThigh = generateFlygonThigh(0.4,0.8,0.5, 40, 40, true);

    
    var Flygon = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, FlygonBody.vertices, FlygonBody.faces);
    var Belly = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, FlygonBelly.vertices, FlygonBelly.faces);
    var Head = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, FlygonHead.vertices, FlygonHead.faces);
    var leftHorn = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, FlygonHornCurved.vertices, FlygonHornCurved.faces);
    var rightHorn = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, FlygonHornCurved.vertices, FlygonHornCurved.faces);
    var leftInnerThigh = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, FlygonInnerThigh.vertices, FlygonInnerThigh.faces);
    var leftThigh = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, FlygonThigh.vertices, FlygonThigh.faces);
    var rightInnerThigh = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, FlygonInnerThigh.vertices, FlygonInnerThigh.faces);
    var rightThigh = new MyObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, FlygonThigh.vertices, FlygonThigh.faces);
    
    // Belly
    LIBS.rotateX(Belly.MOVE_MATRIX, -1 * Math.PI/180)
    LIBS.translateY(Belly.MOVE_MATRIX, 0.1)
    
    // Head
    LIBS.translateY(Head.MOVE_MATRIX, 3.4)
    LIBS.translateZ(Head.MOVE_MATRIX, 0.4)
    LIBS.rotateX(Head.MOVE_MATRIX, 10 * Math.PI/180)
    
    // Left Horn
    LIBS.translateX(leftHorn.MOVE_MATRIX, -0.18); // left side of the head (negative X)
    LIBS.translateY(leftHorn.MOVE_MATRIX, 0.4)
    LIBS.translateZ(leftHorn.MOVE_MATRIX, 0.1);  // push forward out of the head
    LIBS.rotateZ(leftHorn.MOVE_MATRIX,  140 * Math.PI/180);    // slight tilt
    LIBS.rotateY(leftHorn.MOVE_MATRIX, -70 * Math.PI/180);     // rotate so the horn points outward

    // Right Horn
    LIBS.translateX(rightHorn.MOVE_MATRIX, 0.18); // right side of the head (positive X)
    LIBS.translateY(rightHorn.MOVE_MATRIX, 0.4)
    LIBS.translateZ(rightHorn.MOVE_MATRIX, 0.1);  // push forward out of the head
    LIBS.rotateZ(rightHorn.MOVE_MATRIX,  140 * Math.PI/180);    // slight tilt
    LIBS.rotateY(rightHorn.MOVE_MATRIX, -100 * Math.PI/180);     // rotate so the horn points outward

    // Left Inner Thigh
    LIBS.translateX(leftInnerThigh.MOVE_MATRIX, -0.7); // left side of the belly (negative X)
    LIBS.translateZ(leftInnerThigh.MOVE_MATRIX, 0.3);
    LIBS.rotateX(leftInnerThigh.MOVE_MATRIX,  40 * Math.PI/180);    // slight tilt

    // right Inner Thigh
    LIBS.translateX(rightInnerThigh.MOVE_MATRIX, 0.7); // right side of the belly (negative X)
    LIBS.translateZ(rightInnerThigh.MOVE_MATRIX, 0.3);
    LIBS.rotateX(rightInnerThigh.MOVE_MATRIX,  40 * Math.PI/180);    // slight tilt

    // Outer Thighs
    LIBS.translateY(leftThigh.MOVE_MATRIX, -0.2);
    LIBS.scaleX(leftThigh.MOVE_MATRIX, 1.2);

    LIBS.translateY(rightThigh.MOVE_MATRIX, -0.2);
    LIBS.scaleX(rightThigh.MOVE_MATRIX, 1.2);

    // susun hierarki
    Flygon.childs.push(Belly)
    Flygon.childs.push(Head)
    Head.childs.push(leftHorn)
    Head.childs.push(rightHorn)
    Belly.childs.push(leftInnerThigh)
    Belly.childs.push(rightInnerThigh)
    leftInnerThigh.childs.push(leftThigh)
    rightInnerThigh.childs.push(rightThigh)
    Flygon.setup();

    var PROJMATRIX = LIBS.get_projection(60, CANVAS.width / CANVAS.height, 1, 100);
    var VIEWMATRIX = LIBS.get_I4();

    LIBS.translateZ(VIEWMATRIX, -10)
    LIBS.rotateY(Flygon.MOVE_MATRIX, -180 * Math.PI / 180);

    // Mouse
    var THETA = 0, PHI = 0;
    var drag = false;
    var x_prev, y_prev;

    // Add Friction
    var FRICTION = 0.05;
    var dX = 0, dY = 0;


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


    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);

    // Drawing
    Gl.enable(Gl.DEPTH_TEST);
    Gl.depthFunc(Gl.LEQUAL);
    Gl.clearColor(0.98, 0.94, 0.72, 1.0);
    Gl.clearDepth(1.0);

    var autoRotate = 0;
    var animate = function (time) {
        Gl.viewport(0, 0, CANVAS.width, CANVAS.height);
        Gl.clear(Gl.COLOR_BUFFER_BIT | Gl.DEPTH_BUFFER_BIT);

        Flygon.MOVE_MATRIX = LIBS.get_I4();
        var temp = LIBS.get_I4();

        temp = LIBS.get_I4();
        LIBS.rotateY(temp, THETA)
        Flygon.MOVE_MATRIX = LIBS.multiply(Flygon.MOVE_MATRIX, temp);

        temp = LIBS.get_I4();
        LIBS.rotateX(temp, PHI)
        Flygon.MOVE_MATRIX = LIBS.multiply(Flygon.MOVE_MATRIX, temp);

        LIBS.translateZ(temp, -0.6);
        Flygon.MOVE_MATRIX = LIBS.multiply(Flygon.MOVE_MATRIX, temp);

        //Auto Rotate
        autoRotate += 0.02;
        if (autoRotate > Math.PI * 2) {
            autoRotate -= Math.PI * 2;  // reset after full circle
        }

        // temp = LIBS.get_I4();
        // LIBS.rotateY(temp, autoRotate);
        // Flygon.MOVE_MATRIX = LIBS.multiply(Flygon.MOVE_MATRIX, temp);
        // End Auto Rotate

        temp = LIBS.get_I4();
        LIBS.translateZ(temp, 0.6);
        Flygon.MOVE_MATRIX = LIBS.multiply(Flygon.MOVE_MATRIX, temp);


        if (!drag) {
            dX *= (1-FRICTION)
            dY *= (1-FRICTION)
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

window.addEventListener('load', main);