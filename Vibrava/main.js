import { MyObject } from "./myObject.js";
import { LIBS } from "./libs.js";
import { generateBadanVibrava } from "./badan.js";
import { generateKepala } from "./kepala.js";
import { generateMata } from "./mata.js";
import { generateCurvedCone } from "./horn.js";
import { generateWing } from "./wings.js";
import { generateVibravaLeg, getLegPositions } from "./legs.js";

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

    Gl.useProgram(SHADER_PROGRAM);

    // --- Enable blending for opacity ---
    Gl.enable(Gl.DEPTH_TEST);
    Gl.depthFunc(Gl.LEQUAL);
    Gl.enable(Gl.BLEND);
    Gl.blendFunc(Gl.SRC_ALPHA, Gl.ONE_MINUS_SRC_ALPHA);

    Gl.clearColor(1, 1, 1, 1.0);
    Gl.clearDepth(1.0);

    // Generate geometry
    var bodyData = generateBadanVibrava(8, 0.8, 0.2, 120, 48);
    var headData = generateKepala(1.4, 1.3, 1.4, 30, 30);
    var leftEyeData = generateMata(0.8, 20, 20);
    var leftRetinaData = generateMata(0.4, 20, 20, [0, 0, 0]);
    var rightEyeData = leftEyeData;
    var rightRetinaData = leftRetinaData;
    var leftHornData = generateCurvedCone({
        length: 3,
        baseRadius: 0.22,
        tipRadius: 0.03,
        stacks: 40,
        slices: 28,
        bendAngle: Math.PI / 9, // 20°
        bendAxis: "z", // curve up/down
    });
    var rightHornData = leftHornData;
    var wingData = generateWing({
        w: 1,
        h: 2,
        z: 0,
        color: [0.26, 0.86, 0.24], // bright green
        twoSided: true,
    });
    var tailFinData = generateWing({
        w: 0.5,
        h: 1.0,
        z: 0,
        color: [0.26, 0.86, 0.24], // bright green
        twoSided: true,
    });
    var legData = generateVibravaLeg({
        thighLength: 1.2,
        shinLength: 1.5,
        footLength: 0.8,
        color: [0.25, 0.25, 0.2],
        clawColor: [0.15, 0.15, 0.15],
    });

    var Body = new MyObject(
        Gl,
        SHADER_PROGRAM,
        _position,
        _color,
        _Mmatrix,
        bodyData.vertices,
        bodyData.faces
    );
    var Head = new MyObject(
        Gl,
        SHADER_PROGRAM,
        _position,
        _color,
        _Mmatrix,
        headData.vertices,
        headData.faces
    );
    var LeftEye = new MyObject(
        Gl,
        SHADER_PROGRAM,
        _position,
        _color,
        _Mmatrix,
        leftEyeData.vertices,
        leftEyeData.faces
    );
    var RightEye = new MyObject(
        Gl,
        SHADER_PROGRAM,
        _position,
        _color,
        _Mmatrix,
        rightEyeData.vertices,
        rightEyeData.faces
    );
    var LeftRetina = new MyObject(
        Gl,
        SHADER_PROGRAM,
        _position,
        _color,
        _Mmatrix,
        leftRetinaData.vertices,
        leftRetinaData.faces
    );
    var RightRetina = new MyObject(
        Gl,
        SHADER_PROGRAM,
        _position,
        _color,
        _Mmatrix,
        rightRetinaData.vertices,
        rightRetinaData.faces
    );
    var LeftHorn = new MyObject(
        Gl,
        SHADER_PROGRAM,
        _position,
        _color,
        _Mmatrix,
        leftHornData.vertices,
        leftHornData.faces
    );
    var RightHorn = new MyObject(
        Gl,
        SHADER_PROGRAM,
        _position,
        _color,
        _Mmatrix,
        rightHornData.vertices,
        rightHornData.faces
    );
    var LeftTopWing = new MyObject(
        Gl,
        SHADER_PROGRAM,
        _position,
        _color,
        _Mmatrix,
        wingData.vertices,
        wingData.faces
    );
    var LeftBottomWing = new MyObject(
        Gl,
        SHADER_PROGRAM,
        _position,
        _color,
        _Mmatrix,
        wingData.vertices,
        wingData.faces
    );
    var RightTopWing = new MyObject(
        Gl,
        SHADER_PROGRAM,
        _position,
        _color,
        _Mmatrix,
        wingData.vertices,
        wingData.faces
    );
    var RightBottomWing = new MyObject(
        Gl,
        SHADER_PROGRAM,
        _position,
        _color,
        _Mmatrix,
        wingData.vertices,
        wingData.faces
    );
    var LeftTailFin = new MyObject(
        Gl,
        SHADER_PROGRAM,
        _position,
        _color,
        _Mmatrix,
        tailFinData.vertices,
        tailFinData.faces
    );
    var RightTailFin = new MyObject(
        Gl,
        SHADER_PROGRAM,
        _position,
        _color,
        _Mmatrix,
        tailFinData.vertices,
        tailFinData.faces
    );

    var legs = {};
    const legPositions = getLegPositions();
    [
        "frontLeft",
        "frontRight",
        "backLeft",
        "backRight",
    ].forEach((legName) => {
        legs[legName] = {
            thigh: new MyObject(
                Gl,
                SHADER_PROGRAM,
                _position,
                _color,
                _Mmatrix,
                legData.thigh.vertices,
                legData.thigh.faces
            ),
            shin: new MyObject(
                Gl,
                SHADER_PROGRAM,
                _position,
                _color,
                _Mmatrix,
                legData.shin.vertices,
                legData.shin.faces
            ),
            leftToe: new MyObject(
                Gl,
                SHADER_PROGRAM,
                _position,
                _color,
                _Mmatrix,
                legData.leftToe.vertices,
                legData.leftToe.faces
            ),
            rightToe: new MyObject(
                Gl,
                SHADER_PROGRAM,
                _position,
                _color,
                _Mmatrix,
                legData.rightToe.vertices,
                legData.rightToe.faces
            ),
        };
    });

    // Positioning
    LIBS.translateX(Head.MOVE_MATRIX, 4.8);

    // Example: set eye opacity (optional)
    LeftEye.alpha = 0.4;
    RightEye.alpha = 0.4;

    LIBS.translateZ(LeftRetina.MOVE_MATRIX, 1.4);
    LIBS.translateZ(RightRetina.MOVE_MATRIX, -1.4);

    LIBS.rotateY(LeftHorn.MOVE_MATRIX, Math.PI / 9); // point backwards
    LIBS.rotateY(RightHorn.MOVE_MATRIX, -Math.PI / 9); // point backwards

    // Wings positioning
    // Left Top Wing
    var temp = LIBS.get_I4();
    LIBS.translateY(temp, 2);
    LeftTopWing.MOVE_MATRIX = LIBS.multiply(LeftTopWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateY(temp, Math.PI / 2); // 90°
    LeftTopWing.MOVE_MATRIX = LIBS.multiply(LeftTopWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateZ(temp, Math.PI / 4); // 45°
    LeftTopWing.MOVE_MATRIX = LIBS.multiply(LeftTopWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateY(temp, Math.PI / 4); // 45°
    LeftTopWing.MOVE_MATRIX = LIBS.multiply(LeftTopWing.MOVE_MATRIX, temp);

    LIBS.translateX(LeftTopWing.MOVE_MATRIX, 3);
    LIBS.translateY(LeftTopWing.MOVE_MATRIX, 1);
    LIBS.translateZ(LeftTopWing.MOVE_MATRIX, 0.6);

    // Left Bottom Wing
    temp = LIBS.get_I4();
    LIBS.translateY(temp, 2);
    LeftBottomWing.MOVE_MATRIX = LIBS.multiply(LeftBottomWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateY(temp, Math.PI / 2); // 90°
    LeftBottomWing.MOVE_MATRIX = LIBS.multiply(LeftBottomWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateZ(temp, Math.PI / 2.5); // 30°
    LeftBottomWing.MOVE_MATRIX = LIBS.multiply(LeftBottomWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateY(temp, Math.PI / 4); // 45°
    LeftBottomWing.MOVE_MATRIX = LIBS.multiply(LeftBottomWing.MOVE_MATRIX, temp);

    LIBS.translateX(LeftBottomWing.MOVE_MATRIX, 3);
    LIBS.translateY(LeftBottomWing.MOVE_MATRIX, 1);
    LIBS.translateZ(LeftBottomWing.MOVE_MATRIX, 0.6);

    // Right Bottom Wing
    temp = LIBS.get_I4();
    LIBS.translateY(temp, 2);
    RightTopWing.MOVE_MATRIX = LIBS.multiply(RightTopWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateY(temp, Math.PI / 2); // 90°
    RightTopWing.MOVE_MATRIX = LIBS.multiply(RightTopWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateZ(temp, Math.PI / 4); // 45°
    RightTopWing.MOVE_MATRIX = LIBS.multiply(RightTopWing.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateY(temp, -Math.PI / 4); // 45°
    RightTopWing.MOVE_MATRIX = LIBS.multiply(RightTopWing.MOVE_MATRIX, temp);

    LIBS.translateX(RightTopWing.MOVE_MATRIX, 3);
    LIBS.translateY(RightTopWing.MOVE_MATRIX, 1);
    LIBS.translateZ(RightTopWing.MOVE_MATRIX, -0.6);

    // Right Bottom Wing
    temp = LIBS.get_I4();
    LIBS.translateY(temp, 2);
    RightBottomWing.MOVE_MATRIX = LIBS.multiply(
        RightBottomWing.MOVE_MATRIX,
        temp
    );

    temp = LIBS.get_I4();
    LIBS.rotateY(temp, Math.PI / 2); // 90°
    RightBottomWing.MOVE_MATRIX = LIBS.multiply(
        RightBottomWing.MOVE_MATRIX,
        temp
    );

    temp = LIBS.get_I4();
    LIBS.rotateZ(temp, Math.PI / 2.5); // 30°
    RightBottomWing.MOVE_MATRIX = LIBS.multiply(
        RightBottomWing.MOVE_MATRIX,
        temp
    );

    temp = LIBS.get_I4();
    LIBS.rotateY(temp, -Math.PI / 4); // 45°
    RightBottomWing.MOVE_MATRIX = LIBS.multiply(
        RightBottomWing.MOVE_MATRIX,
        temp
    );

    LIBS.translateX(RightBottomWing.MOVE_MATRIX, 3);
    LIBS.translateY(RightBottomWing.MOVE_MATRIX, 1);
    LIBS.translateZ(RightBottomWing.MOVE_MATRIX, -0.6);

    // Left Tail Fin
    temp = LIBS.get_I4();
    LIBS.translateY(temp, 1);
    LeftTailFin.MOVE_MATRIX = LIBS.multiply(LeftTailFin.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateY(temp, Math.PI / 2); // 90°
    LeftTailFin.MOVE_MATRIX = LIBS.multiply(LeftTailFin.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateZ(temp, Math.PI / 3); // 30°
    LeftTailFin.MOVE_MATRIX = LIBS.multiply(LeftTailFin.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateY(temp, -Math.PI / 4); // 45°
    LeftTailFin.MOVE_MATRIX = LIBS.multiply(LeftTailFin.MOVE_MATRIX, temp);

    LIBS.translateX(LeftTailFin.MOVE_MATRIX, -3.3);
    LIBS.translateY(LeftTailFin.MOVE_MATRIX, 1.9);
    LIBS.translateZ(LeftTailFin.MOVE_MATRIX, -0.1);

    // Right Tail Fin
    temp = LIBS.get_I4();
    LIBS.translateY(temp, 1);
    RightTailFin.MOVE_MATRIX = LIBS.multiply(RightTailFin.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateY(temp, Math.PI / 2); // 90°
    RightTailFin.MOVE_MATRIX = LIBS.multiply(RightTailFin.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateZ(temp, Math.PI / 3); // 30°
    RightTailFin.MOVE_MATRIX = LIBS.multiply(RightTailFin.MOVE_MATRIX, temp);

    temp = LIBS.get_I4();
    LIBS.rotateY(temp, Math.PI / 4); // 45°
    RightTailFin.MOVE_MATRIX = LIBS.multiply(RightTailFin.MOVE_MATRIX, temp);

    LIBS.translateX(RightTailFin.MOVE_MATRIX, -3.3);
    LIBS.translateY(RightTailFin.MOVE_MATRIX, 1.9);
    LIBS.translateZ(RightTailFin.MOVE_MATRIX, 0.1);

    Object.keys(legs).forEach((legName) => {
        const pos = legPositions[legName];
        const leg = legs[legName];

        // Position thigh at base
        LIBS.translateX(leg.thigh.MOVE_MATRIX, pos.base.x);
        LIBS.translateY(leg.thigh.MOVE_MATRIX, pos.base.y);
        LIBS.translateZ(leg.thigh.MOVE_MATRIX, pos.base.z);

        if (legName === "frontLeft" || legName === "backLeft") {
            LIBS.rotateX(leg.thigh.MOVE_MATRIX, -(pos.angles.hip * Math.PI) / 180);
        } else {
            LIBS.rotateX(leg.thigh.MOVE_MATRIX, (pos.angles.hip * Math.PI) / 180);
        }

        // Position shin at end of thigh
        LIBS.translateY(leg.shin.MOVE_MATRIX, -1.2); // thigh length
        LIBS.rotateX(leg.shin.MOVE_MATRIX, (pos.angles.knee * Math.PI) / 180);


        // Position toe at end of foot
        // Position toe at end of foot - SPREAD FIRST!
        LIBS.translateY(leg.leftToe.MOVE_MATRIX, -1.5); // foot length
        LIBS.rotateX(leg.leftToe.MOVE_MATRIX, (pos.angles.leftToe * Math.PI) / 180);

        LIBS.translateY(leg.rightToe.MOVE_MATRIX, -1.5); // foot length
        LIBS.rotateX(leg.rightToe.MOVE_MATRIX, (pos.angles.rightToe * Math.PI) / 180);
        // Build hierarchy: thigh -> shin -> foot -> claws
        leg.thigh.childs.push(leg.shin);
        leg.shin.childs.push(leg.leftToe);
        leg.shin.childs.push(leg.rightToe);

        // Attach to body
        Body.childs.push(leg.thigh);
    });

    // Hieararchy
    Body.childs.push(Head);
    Head.childs.push(LeftRetina);
    Head.childs.push(RightRetina);
    LeftRetina.childs.push(LeftEye);
    RightRetina.childs.push(RightEye);

    Head.childs.push(LeftHorn);
    Head.childs.push(RightHorn);

    Body.childs.push(LeftTopWing);
    Body.childs.push(LeftBottomWing);
    Body.childs.push(RightTopWing);
    Body.childs.push(RightBottomWing);

    Body.childs.push(LeftTailFin);
    Body.childs.push(RightTailFin);

    Body.setup();

    Object.keys(legs).forEach(ln => {
        legs[ln].leftToe.alpha = 1.0;
        legs[ln].rightToe.alpha = 1.0;
    });

    // 2) Disable face culling (see if they appear)
    Gl.disable(Gl.CULL_FACE);


    var PROJMATRIX = LIBS.get_projection(
        60,
        CANVAS.width / CANVAS.height,
        1,
        100
    );
    var VIEWMATRIX = LIBS.get_I4();
    var zoom = -20; // initial camera

    LIBS.translateZ(VIEWMATRIX, zoom);

    // Mouse
    var THETA = 0,
        PHI = 0;
    var drag = false;
    var x_prev, y_prev;

    var FRICTION = 0.05;
    var dX = 0,
        dY = 0;
    var SPEED = 0.05;

    var mouseDown = function (e) {
        drag = true;
        (x_prev = e.pageX), (y_prev = e.pageY);
        e.preventDefault();
        return false;
    };

    var mouseUp = function (e) {
        drag = false;
    };

    var mouseMove = function (e) {
        if (!drag) return false;
        dX = ((e.pageX - x_prev) * 2 * Math.PI) / CANVAS.width;
        dY = ((e.pageY - y_prev) * 2 * Math.PI) / CANVAS.height;
        THETA += dX;
        PHI += dY;
        (x_prev = e.pageX), (y_prev = e.pageY);
        e.preventDefault();
    };

    var mouseWheel = function (e) {
        e.preventDefault();
        var delta = e.deltaY * 0.05;
        zoom += delta;
        zoom = Math.min(-5, Math.max(-50, zoom));
    };

    var keyDown = function (e) {
        if (e.key === "w") dY -= SPEED;
        else if (e.key === "a") dX -= SPEED;
        else if (e.key === "s") dY += SPEED;
        else if (e.key === "d") dX += SPEED;
    };

    window.addEventListener("keydown", keyDown, false);
    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);
    CANVAS.addEventListener("wheel", mouseWheel, false);

    var wingFlapSpeed = 25.0;
    var wingFlapAmount = Math.PI / 6; // 30 degrees
    var time = 0;

    var animate = function () {
        Gl.viewport(0, 0, CANVAS.width, CANVAS.height);
        Gl.clear(Gl.COLOR_BUFFER_BIT | Gl.DEPTH_BUFFER_BIT);

        Gl.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        Gl.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

        time += 0.016; // approximately 60fps
        var wingAngle = Math.sin(time * wingFlapSpeed) * wingFlapAmount;

        var MODEL = LIBS.get_I4();
        LIBS.rotateY(MODEL, THETA);
        LIBS.rotateX(MODEL, PHI);
        LIBS.set_I4(VIEWMATRIX);
        LIBS.translateZ(VIEWMATRIX, zoom);

        // Animate Left Top Wing
        LIBS.set_I4(LeftTopWing.MOVE_MATRIX);
        temp = LIBS.get_I4();
        LIBS.translateY(temp, 2);
        LeftTopWing.MOVE_MATRIX = LIBS.multiply(LeftTopWing.MOVE_MATRIX, temp);

        temp = LIBS.get_I4();
        LIBS.rotateY(temp, Math.PI / 2);
        LeftTopWing.MOVE_MATRIX = LIBS.multiply(LeftTopWing.MOVE_MATRIX, temp);

        temp = LIBS.get_I4();
        LIBS.rotateZ(temp, Math.PI / 4 + wingAngle); // Add animation here
        LeftTopWing.MOVE_MATRIX = LIBS.multiply(LeftTopWing.MOVE_MATRIX, temp);

        temp = LIBS.get_I4();
        LIBS.rotateY(temp, Math.PI / 4);
        LeftTopWing.MOVE_MATRIX = LIBS.multiply(LeftTopWing.MOVE_MATRIX, temp);

        LIBS.translateX(LeftTopWing.MOVE_MATRIX, 3);
        LIBS.translateY(LeftTopWing.MOVE_MATRIX, 1);
        LIBS.translateZ(LeftTopWing.MOVE_MATRIX, 0.6);

        // Animate Left Bottom Wing
        LIBS.set_I4(LeftBottomWing.MOVE_MATRIX);
        temp = LIBS.get_I4();
        LIBS.translateY(temp, 2);
        LeftBottomWing.MOVE_MATRIX = LIBS.multiply(
            LeftBottomWing.MOVE_MATRIX,
            temp
        );

        temp = LIBS.get_I4();
        LIBS.rotateY(temp, Math.PI / 2);
        LeftBottomWing.MOVE_MATRIX = LIBS.multiply(
            LeftBottomWing.MOVE_MATRIX,
            temp
        );

        temp = LIBS.get_I4();
        LIBS.rotateZ(temp, Math.PI / 2.5 + wingAngle * 0.8); // Slightly different phase
        LeftBottomWing.MOVE_MATRIX = LIBS.multiply(
            LeftBottomWing.MOVE_MATRIX,
            temp
        );

        temp = LIBS.get_I4();
        LIBS.rotateY(temp, Math.PI / 4);
        LeftBottomWing.MOVE_MATRIX = LIBS.multiply(
            LeftBottomWing.MOVE_MATRIX,
            temp
        );

        LIBS.translateX(LeftBottomWing.MOVE_MATRIX, 3);
        LIBS.translateY(LeftBottomWing.MOVE_MATRIX, 1);
        LIBS.translateZ(LeftBottomWing.MOVE_MATRIX, 0.6);

        // Animate Right Top Wing
        LIBS.set_I4(RightTopWing.MOVE_MATRIX);
        temp = LIBS.get_I4();
        LIBS.translateY(temp, 2);
        RightTopWing.MOVE_MATRIX = LIBS.multiply(RightTopWing.MOVE_MATRIX, temp);

        temp = LIBS.get_I4();
        LIBS.rotateY(temp, Math.PI / 2);
        RightTopWing.MOVE_MATRIX = LIBS.multiply(RightTopWing.MOVE_MATRIX, temp);

        temp = LIBS.get_I4();
        LIBS.rotateZ(temp, Math.PI / 4 + wingAngle); // Mirror the left wing
        RightTopWing.MOVE_MATRIX = LIBS.multiply(RightTopWing.MOVE_MATRIX, temp);

        temp = LIBS.get_I4();
        LIBS.rotateY(temp, -Math.PI / 4);
        RightTopWing.MOVE_MATRIX = LIBS.multiply(RightTopWing.MOVE_MATRIX, temp);

        LIBS.translateX(RightTopWing.MOVE_MATRIX, 3);
        LIBS.translateY(RightTopWing.MOVE_MATRIX, 1);
        LIBS.translateZ(RightTopWing.MOVE_MATRIX, -0.6);

        // Animate Right Bottom Wing
        LIBS.set_I4(RightBottomWing.MOVE_MATRIX);
        temp = LIBS.get_I4();
        LIBS.translateY(temp, 2);
        RightBottomWing.MOVE_MATRIX = LIBS.multiply(
            RightBottomWing.MOVE_MATRIX,
            temp
        );

        temp = LIBS.get_I4();
        LIBS.rotateY(temp, Math.PI / 2);
        RightBottomWing.MOVE_MATRIX = LIBS.multiply(
            RightBottomWing.MOVE_MATRIX,
            temp
        );

        temp = LIBS.get_I4();
        LIBS.rotateZ(temp, Math.PI / 2.5 + wingAngle * 0.8); // Slightly different phase
        RightBottomWing.MOVE_MATRIX = LIBS.multiply(
            RightBottomWing.MOVE_MATRIX,
            temp
        );

        temp = LIBS.get_I4();
        LIBS.rotateY(temp, -Math.PI / 4);
        RightBottomWing.MOVE_MATRIX = LIBS.multiply(
            RightBottomWing.MOVE_MATRIX,
            temp
        );

        LIBS.translateX(RightBottomWing.MOVE_MATRIX, 3);
        LIBS.translateY(RightBottomWing.MOVE_MATRIX, 1);
        LIBS.translateZ(RightBottomWing.MOVE_MATRIX, -0.6);

        Body.render(MODEL);

        if (!drag) {
            dX *= 1 - FRICTION;
            dY *= 1 - FRICTION;
            THETA += dX;
            PHI += dY;
        }

        Gl.flush();
        requestAnimationFrame(animate);
    };
    animate(0);
}

window.addEventListener("load", main);
