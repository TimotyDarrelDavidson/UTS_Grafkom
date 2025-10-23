import { LIBS } from "./libs.js";
import { 
  generateDesertTerrain, 
  generateSkyDome, 
  generateSun, 
  generateCloud,
//   CloudManager 
} from "./environment.js";

// Simple object class for environment
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
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces), gl.STATIC_DRAW);
        
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
        uniform float uAlpha;

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

    Gl.enable(Gl.DEPTH_TEST);
    Gl.depthFunc(Gl.LEQUAL);
    Gl.enable(Gl.BLEND);
    Gl.blendFunc(Gl.SRC_ALPHA, Gl.ONE_MINUS_SRC_ALPHA);

    Gl.clearColor(0.5, 0.3, 0.4, 1.0);
    Gl.clearDepth(1.0);

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
    var Desert = new EnvObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, 
        desertData.vertices, desertData.faces);

    var Sky = new EnvObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, 
        skyData.vertices, skyData.faces);

    var Sun = new EnvObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, 
        sunData.vertices, sunData.faces);

    // Position sun - SUNSET BESAR
    LIBS.set_I4(Sun.MOVE_MATRIX);
    LIBS.translateX(Sun.MOVE_MATRIX, -30);
    LIBS.translateY(Sun.MOVE_MATRIX, -2);
    LIBS.scaleInPlace(Sun.MOVE_MATRIX, 4.5, 4.5, 4.5);
    
    // === BUAT CLOUDS DENGAN AWAN BACKGROUND ===
    var clouds = [];

    // AWAN DEPAN (8 awan) - PERBAIKI: CREATE DULU, BARU SET POSISI
    for (let i = 0; i < 8; i++) {
        var cloud = new EnvObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, 
            cloudData.vertices, cloudData.faces);
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
        var cloud = new EnvObject(Gl, SHADER_PROGRAM, _position, _color, _Mmatrix, 
            cloudData.vertices, cloudData.faces);
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

    // Camera setup
    var PROJMATRIX = LIBS.get_projection(60, CANVAS.width / CANVAS.height, 1, 300);
    var VIEWMATRIX = LIBS.get_I4();
    var zoom = -50;
    LIBS.translateZ(VIEWMATRIX, zoom);

    // Camera rotation variables - FIXED
    var THETA = 0, PHI = 0;
    var drag = false;
    var x_prev, y_prev;
    var dX = 0, dY = 0;

    // Mouse controls - FIXED VERSION
    var mouseDown = function (e) {
        drag = true;
        x_prev = e.pageX;
        y_prev = e.pageY;
        e.preventDefault();
        return false;
    };

    var mouseUp = function (e) {
        drag = false;
    };

    var mouseMove = function (e) {
        if (!drag) return false;
        
        dX = (e.pageX - x_prev) * 0.01; // Lebih smooth
        dY = (e.pageY - y_prev) * 0.01;
        
        THETA += dX;
        PHI += dY;
        
        // Batasi rotasi vertikal agar tidak terbalik
        PHI = Math.max(-Math.PI/2, Math.min(Math.PI/2, PHI));
        
        x_prev = e.pageX;
        y_prev = e.pageY;
        e.preventDefault();
    };

    var mouseWheel = function (e) {
        e.preventDefault();
        var delta = e.deltaY * 0.05;
        zoom += delta;
        zoom = Math.min(-10, Math.max(-100, zoom)); // Batasi zoom
    };

    // Event listeners
    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);
    CANVAS.addEventListener("wheel", mouseWheel, false);

    var time = 0;

    var animate = function () {
        Gl.viewport(0, 0, CANVAS.width, CANVAS.height);
        Gl.clear(Gl.COLOR_BUFFER_BIT | Gl.DEPTH_BUFFER_BIT);

        Gl.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);

        time += 0.016;

        // UPDATE VIEWMATRIX
        LIBS.set_I4(VIEWMATRIX);
        LIBS.translateZ(VIEWMATRIX, zoom);
        LIBS.rotateY(VIEWMATRIX, THETA);
        // LIBS.rotateX(VIEWMATRIX, PHI);
        
        Gl.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

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

        Gl.flush();
        requestAnimationFrame(animate);
    };
    animate();
}

window.addEventListener("load", main);