import { LIBS } from './libs.js';

// MyObject.js (with per-object alpha support)
export class MyObject {
    GL = null;
    SHADER_PROGRAM = null;

    _position = null;
    _color = null;
    _MMatrix = null;
    _uAlpha = null;          // NEW: uniform location for alpha

    OBJECT_VERTEX = null;
    OBJECT_FACES = null;

    vertex = [];
    faces  = [];

    POSITION_MATRIX = LIBS.get_I4(); // Mpos
    MOVE_MATRIX     = LIBS.get_I4(); // Mmove

    childs = [];

    // Public: set this to control opacity (default fully opaque)
    alpha = 1.0;             // NEW

    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, vertex, faces) {
        this.GL = GL;
        this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position;
        this._color = _color;
        this._MMatrix = _Mmatrix;

        // NEW: look up uAlpha once
        this._uAlpha = this.GL.getUniformLocation(this.SHADER_PROGRAM, 'uAlpha');

        this.vertex = vertex;
        this.faces  = faces;
    }

    setup() {
        this.OBJECT_VERTEX = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);

        this.OBJECT_FACES = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);

        this.childs.forEach(child => child.setup());
    }

    render(PARENT_MATRIX) {
        this.MODEL_MATRIX = LIBS.multiply(this.MOVE_MATRIX, this.POSITION_MATRIX);
        this.MODEL_MATRIX = LIBS.multiply(this.MODEL_MATRIX, PARENT_MATRIX);

        this.GL.useProgram(this.SHADER_PROGRAM);
        this.GL.uniformMatrix4fv(this._MMatrix, false, this.MODEL_MATRIX);

        // NEW: set per-object alpha (defaults to 1.0)
        if (this._uAlpha) {
            this.GL.uniform1f(this._uAlpha, (this.alpha == null ? 1.0 : this.alpha));
        }

        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 24, 0);
        this.GL.vertexAttribPointer(this._color,    3, this.GL.FLOAT, false, 24, 12);

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        this.childs.forEach(child => child.render(this.MODEL_MATRIX));
    }
}
