class Cube {
  // class constructor
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }
  // renders this shape
  drawCube(M, color) {
    var rgba = color;
    this.matrix = M;
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    // Front of cube
    drawTriangle3D([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]);
    drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0]);
    // Back of Cube
    drawTriangle3D([0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0]);
    drawTriangle3D([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0]);
    // Top of cube
    gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
    drawTriangle3D([0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0]);
    drawTriangle3D([0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0]);
    // Bottom of cube
    drawTriangle3D([1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0]);
    drawTriangle3D([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0]);
    // Right of cube
    gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
    drawTriangle3D([1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0]);
    drawTriangle3D([1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0]);
    // Left of cube
    drawTriangle3D([0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0]);
    drawTriangle3D([0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0]);
  }
}
