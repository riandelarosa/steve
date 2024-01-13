// asg2.js (c)
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let g_globalAngle = 0;
let g_headAngle = 0;
let g_armAngle = 0;
let g_elbowAngle = 0;
let g_legAngle = 0;
let g_kneeAngle = 0;
let g_footAngle = 0;
let g_allAnimation = 1;
let g_headAnimation = false;
let g_armAnimation = false;
let g_elbowAnimation = false;
let g_legAnimation = false;
let g_kneeAnimation = false;
let g_footAnimation = false;
let g_shiftAnimation = false;
let skinColor = [0.725, 0.545, 0.471, 1.0];
let animationSpeed = 4;
let shiftArms = 20;
var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;


function addActionsForHtmlUI() {
  // Slides
  document.getElementById('camera').addEventListener('mousemove', function() { g_globalAngle = this.value; renderScene();});
  document.getElementById('headSlide').addEventListener('mousemove', function() { g_headAngle = this.value; renderScene();});
  document.getElementById('armSlide').addEventListener('mousemove', function() { g_armAngle = this.value; renderScene();});
  document.getElementById('elbowSlide').addEventListener('mousemove', function() { g_elbowAngle = this.value; renderScene();});
  document.getElementById('legSlide').addEventListener('mousemove', function() { g_legAngle = this.value; renderScene();});
  document.getElementById('kneeSlide').addEventListener('mousemove', function() { g_kneeAngle = this.value; renderScene();});
  document.getElementById('footSlide').addEventListener('mousemove', function() { g_footAngle = this.value; renderScene();});
  // All Animation Buttons
  document.getElementById('animationAllOnButton').onclick = function() { g_allAnimation = 2;};
  document.getElementById('animationAllOffButton').onclick = function() { g_allAnimation = 0;};
  // Head Animation Buttons
  document.getElementById('animationHeadOnButton').onclick = function() { g_headAnimation = true;};
  document.getElementById('animationHeadOffButton').onclick = function() { g_headAnimation = false;};
  // Arm Animation Buttons
  document.getElementById('animationArmOnButton').onclick = function() { g_armAnimation = true;};
  document.getElementById('animationArmOffButton').onclick = function() { g_armAnimation = false;};
  // Elbow Animation Buttons
  document.getElementById('animationElbowOnButton').onclick = function() { g_elbowAnimation = true;};
  document.getElementById('animationElbowOffButton').onclick = function() { g_elbowAnimation = false;};
  // Leg Animation Buttons
  document.getElementById('animationLegOnButton').onclick = function() { g_legAnimation = true;};
  document.getElementById('animationLegOffButton').onclick = function() { g_legAnimation = false;};
  // Knee Animation Buttons
  document.getElementById('animationKneeOnButton').onclick = function() { g_kneeAnimation = true;};
  document.getElementById('animationKneeOffButton').onclick = function() { g_kneeAnimation = false;};
  // Foot Animation Buttons
  document.getElementById('animationFootOnButton').onclick = function() { g_footAnimation = true;};
  document.getElementById('animationFootOffButton').onclick = function() { g_footAnimation = false;};
}

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  // Store the coordinates to g_points array
  return ([x, y]);
}

function click(ev) {
  // Extract the event click and return it in WebGl coordinates
  let [x, y] = convertCoordinatesEventToGL(ev);
  g_globalAngle = x * 100;
  if(ev.shiftKey) {
    g_shiftAnimation = true;
  } else {
    g_shiftAnimation = false;
  }
  renderScene();
}

function renderScene() {
  // Clear <canvas>
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Body
  var body = new Cube();
  body.matrix.translate(-0.2, -0.2, -0.2);
  body.matrix.scale(0.2, 0.6, 0.4);
  body.drawCube(body.matrix, [0.082, 0.757, 0.753, 1.0]);

  var waist = new Cube();
  waist.matrix.translate(-0.2005, -0.2, -0.2005);
  waist.matrix.scale(0.201, 0.1, 0.401);
  waist.drawCube(waist.matrix, [0.318, 0.271, 0.722, 1.0]);

  var tuckDot1 = new Cube();
  tuckDot1.matrix.translate(-0.201, -0.2, -0.201);
  tuckDot1.matrix.scale(0.05, 0.05, 0.05);
  tuckDot1.drawCube(tuckDot1.matrix, [0.082, 0.757, 0.753, 1.0]);

  var tuckDot2 = new Cube();
  tuckDot2.matrix.translate(-0.201, -0.15, -0.151);
  tuckDot2.matrix.scale(0.05, 0.05, 0.05);
  tuckDot2.drawCube(tuckDot2.matrix, [0.082, 0.757, 0.753, 1.0]);

  var tuckDot3 = new Cube();
  tuckDot3.matrix.translate(-0.201, -0.15, -0.201);
  tuckDot3.matrix.scale(0.1, 0.05, 0.05);
  tuckDot3.drawCube(tuckDot3.matrix, [0.082, 0.757, 0.753, 1.0]);

  var tuckDot4 = new Cube();
  tuckDot4.matrix.translate(-0.049, -0.2, 0.0);
  tuckDot4.matrix.scale(0.05, 0.05, 0.05);
  tuckDot4.drawCube(tuckDot4.matrix, [0.082, 0.757, 0.753, 1.0]);

  var tuckDot5 = new Cube();
  tuckDot5.matrix.translate(-0.049, -0.15, -0.05);
  tuckDot5.matrix.scale(0.05, 0.05, 0.15);
  tuckDot5.drawCube(tuckDot5.matrix, [0.082, 0.757, 0.753, 1.0]);
  //Head
  var head = new Cube();
  head.matrix.rotate(g_headAngle, 0, 0, 1);
  var headMat = new Matrix4(head.matrix);
  head.matrix.translate(-0.3, 0.41, -0.2);
  head.matrix.scale(0.4, 0.3, 0.4);
  head.drawCube(head.matrix, skinColor);

  var hair = new Cube();
  hair.matrix = headMat;
  hair.matrix.translate(-0.3, 0.71, -0.2);
  hair.matrix.scale(0.4, 0.1, 0.4);
  hair.drawCube(hair.matrix, [0.200, 0.145, 0.055, 1.0]);
  
  var neck = new Cube();
  neck.matrix.translate(-0.2, 0.4, -0.1);
  neck.matrix.scale(0.2, 0.1, 0.2);
  neck.drawCube(neck.matrix, skinColor);

  var upperNeck = new Cube();
  upperNeck.matrix.translate(-0.201, 0.35, -0.1);
  upperNeck.matrix.scale(0.05, 0.05, 0.2);
  upperNeck.drawCube(upperNeck.matrix, skinColor);

  var lowerNeck = new Cube();
  lowerNeck.matrix.translate(-0.201, 0.3, -0.05);
  lowerNeck.matrix.scale(0.05, 0.05, 0.1);
  lowerNeck.drawCube(lowerNeck.matrix, skinColor);
  // Facial Features
  var leftEye = new Cube();
  leftEye.matrix.rotate(g_headAngle, 0, 0, 1);
  leftEye.matrix.translate(-0.301, 0.56, -0.15);
  leftEye.matrix.scale(0.05, 0.05, 0.05);
  leftEye.drawCube(leftEye.matrix, [1, 1, 1, 1.0]);

  var rightEye = new Cube();
  rightEye.matrix.rotate(g_headAngle, 0, 0, 1);
  rightEye.matrix.translate(-0.301, 0.56, 0.10);
  rightEye.matrix.scale(0.05, 0.05, 0.05);
  rightEye.drawCube(rightEye.matrix, [1, 1, 1, 1.0]);
  
  var leftPupil = new Cube();
  leftPupil.matrix.rotate(g_headAngle, 0, 0, 1);
  leftPupil.matrix.translate(-0.301, 0.56, -0.10);
  leftPupil.matrix.scale(0.05, 0.05, 0.05);
  leftPupil.drawCube(leftPupil.matrix, [0.298, 0.231, 0.494, 1.0]);

  var rightPupil = new Cube();
  rightPupil.matrix.rotate(g_headAngle, 0, 0, 1);
  rightPupil.matrix.translate(-0.301, 0.56, 0.05);
  rightPupil.matrix.scale(0.05, 0.05, 0.05);
  rightPupil.drawCube(rightPupil.matrix, [0.298, 0.231, 0.494, 1.0]);

  var mouth = new Cube();
  mouth.matrix.rotate(g_headAngle, 0, 0, 1);
  mouth.matrix.translate(-0.301, 0.41, -0.1);
  mouth.matrix.scale(0.05, 0.05, 0.2);
  mouth.drawCube(mouth.matrix, [0.224, 0.157, 0.078, 1.0]);

  var upperNose= new Cube();
  upperNose.matrix.rotate(g_headAngle, 0, 0, 1);
  upperNose.matrix.translate(-0.301, 0.51, -.05);
  upperNose.matrix.scale(0.05, 0.05, 0.1);
  upperNose.drawCube(upperNose.matrix, [0.380, 0.239, 0.184, 1.0]);

  var lowerNose= new Cube();
  lowerNose.matrix.rotate(g_headAngle, 0, 0, 1);
  lowerNose.matrix.translate(-0.301, 0.46, -.05);
  lowerNose.matrix.scale(0.05, 0.05, 0.1);
  lowerNose.drawCube(lowerNose.matrix, [0.459, 0.275, 0.220, 1.0]);

  var leftLip = new Cube();
  leftLip.matrix.rotate(g_headAngle, 0, 0, 1);
  leftLip.matrix.translate(-0.301, 0.46, -0.1);
  leftLip.matrix.scale(0.05, 0.05, 0.05);
  leftLip.drawCube(leftLip.matrix, [0.224, 0.157, 0.078, 1.0]);

  var rightLip = new Cube();
  rightLip.matrix.rotate(g_headAngle, 0, 0, 1);
  rightLip.matrix.translate(-0.301, 0.46, 0.05);
  rightLip.matrix.scale(0.05, 0.05, 0.05);
  rightLip.drawCube(rightLip.matrix, [0.224, 0.157, 0.078, 1.0]);

  var leftHairC = new Cube();
  leftHairC.matrix.rotate(g_headAngle, 0, 0, 1);
  leftHairC.matrix.translate(-0.301, 0.66, -0.205);
  leftHairC.matrix.scale(0.05, 0.05, 0.05);
  leftHairC.drawCube(leftHairC.matrix, [0.200, 0.145, 0.055, 1.0]);

  var rightHairC = new Cube();
  rightHairC.matrix.rotate(g_headAngle, 0, 0, 1);
  rightHairC.matrix.translate(-0.301, 0.66, 0.155);
  rightHairC.matrix.scale(0.05, 0.05, 0.05);
  rightHairC.drawCube(rightHairC.matrix, [0.200, 0.145, 0.055, 1.0]);
  
  var backHair = new Cube();
  backHair.matrix.rotate(g_headAngle, 0, 0, 1);
  backHair.matrix.translate(0.051, 0.46, -0.201);
  backHair.matrix.scale(0.05, 0.35, 0.402);
  backHair.drawCube(backHair.matrix, [0.200, 0.145, 0.055, 1.0]);
  
  var lowerbackHair = new Cube();
  lowerbackHair.matrix.rotate(g_headAngle, 0, 0, 1);
  lowerbackHair.matrix.translate(0.051, 0.41, -0.1);
  lowerbackHair.matrix.scale(0.05, 0.05, 0.2);
  lowerbackHair.drawCube(lowerbackHair.matrix, [0.200, 0.145, 0.055, 1.0]);

  var rightSideBurn = new Cube();
  rightSideBurn.matrix.rotate(g_headAngle, 0, 0, 1);
  rightSideBurn.matrix.translate(-0.299, 0.56, -0.201);
  rightSideBurn.matrix.scale(0.05, 0.2, 0.05);
  rightSideBurn.drawCube(rightSideBurn.matrix, [0.200, 0.145, 0.055, 1.0]);

  var rightTopHair = new Cube();
  rightTopHair.matrix.rotate(g_headAngle, 0, 0, 1);
  rightTopHair.matrix.translate(-0.25, 0.61, -0.201);
  rightTopHair.matrix.scale(0.305, 0.1, 0.05);
  rightTopHair.drawCube(rightTopHair.matrix, [0.200, 0.145, 0.055, 1.0]);

  var rightMidHair = new Cube();
  rightMidHair.matrix.rotate(g_headAngle, 0, 0, 1);
  rightMidHair.matrix.translate(-0.15, 0.51, -0.201);
  rightMidHair.matrix.scale(0.205, 0.1, 0.05);
  rightMidHair.drawCube(rightMidHair.matrix, [0.200, 0.145, 0.055, 1.0]);

  var rightBotHair = new Cube();
  rightBotHair.matrix.rotate(g_headAngle, 0, 0, 1);
  rightBotHair.matrix.translate(-0.095, 0.46, -0.201);
  rightBotHair.matrix.scale(0.15, 0.05, 0.05);
  rightBotHair.drawCube(rightBotHair.matrix, [0.200, 0.145, 0.055, 1.0]);

  var leftSideBurn = new Cube();
  leftSideBurn.matrix.rotate(g_headAngle, 0, 0, 1);
  leftSideBurn.matrix.translate(-0.299, 0.56, 0.151);
  leftSideBurn.matrix.scale(0.05, 0.2, 0.05);
  leftSideBurn.drawCube(leftSideBurn.matrix, [0.200, 0.145, 0.055, 1.0]);

  var leftTopHair = new Cube();
  leftTopHair.matrix.rotate(g_headAngle, 0, 0, 1);
  leftTopHair.matrix.translate(-0.25, 0.61, 0.151);
  leftTopHair.matrix.scale(0.305, 0.1, 0.05);
  leftTopHair.drawCube(leftTopHair.matrix, [0.200, 0.145, 0.055, 1.0]);

  var leftMidHair = new Cube();
  leftMidHair.matrix.rotate(g_headAngle, 0, 0, 1);
  leftMidHair.matrix.translate(-0.15, 0.51, 0.151);
  leftMidHair.matrix.scale(0.205, 0.1, 0.05);
  leftMidHair.drawCube(leftMidHair.matrix, [0.200, 0.145, 0.055, 1.0]);

  var leftBotHair = new Cube();
  leftBotHair.matrix.rotate(g_headAngle, 0, 0, 1);
  leftBotHair.matrix.translate(-0.095, 0.46, 0.151);
  leftBotHair.matrix.scale(0.15, 0.05, 0.05);
  leftBotHair.drawCube(leftBotHair.matrix, [0.200, 0.145, 0.055, 1.0]);
  // Arms
  var leftShoulder = new Cube();
  leftShoulder.matrix.rotate(3, 1, 0, 0);
  leftShoulder.matrix.rotate(-g_armAngle, 0, 0, 1);
  var leftShoMat = new Matrix4(leftShoulder.matrix);
  leftShoulder.matrix.translate(-0.2, 0.2, -0.4);
  leftShoulder.matrix.scale(0.2, 0.2, 0.2);
  leftShoulder.drawCube(leftShoulder.matrix, [0.082, 0.757, 0.753, 1.0]);

  var leftMidArm = new Cube();
  leftMidArm.matrix = leftShoMat;
  leftMidArm.matrix.translate(-0.2, 0.0, -0.4);
  var leftMarmMat = new Matrix4(leftMidArm.matrix);
  leftMidArm.matrix.scale(0.2, 0.2, 0.2);
  leftMidArm.drawCube(leftMidArm.matrix, skinColor);

  var leftArm = new Cube();
  leftArm.matrix = leftMarmMat;
  leftArm.matrix.rotate(-g_elbowAngle, 0, 0, 1);
  leftArm.matrix.translate(0.0, -0.2, 0.0);
  leftArm.matrix.scale(0.2, 0.26, 0.2);
  leftArm.drawCube(leftArm.matrix, skinColor);

  var rightShoulder = new Cube();
  rightShoulder.matrix.rotate(-3, 1, 0, 0);
  rightShoulder.matrix.rotate(g_armAngle, 0, 0, 1);
  var rightShoMat = new Matrix4(rightShoulder.matrix);
  rightShoulder.matrix.translate(-0.2, 0.2, 0.2);
  rightShoulder.matrix.scale(0.2, 0.2, 0.2);
  rightShoulder.drawCube(rightShoulder.matrix, [0.082, 0.757, 0.753, 1.0]);

  var rightMidArm = new Cube();
  rightMidArm.matrix = rightShoMat;
  rightMidArm.matrix.translate(-0.2, 0.0, 0.2);
  var rightMarmMat = new Matrix4(rightMidArm.matrix);
  rightMidArm.matrix.scale(0.2, 0.2, 0.2);
  rightMidArm.drawCube(rightMidArm.matrix, skinColor);

  var rightArm = new Cube();
  rightArm.matrix = rightMarmMat;
  rightArm.matrix.rotate(-g_elbowAngle, 0, 0, 1);
  rightArm.matrix.translate(0.0, -0.2, 0.0);
  rightArm.matrix.scale(0.2, 0.26, 0.2);
  rightArm.drawCube(rightArm.matrix, skinColor);
  // Legs
  var leftLeg = new Cube();
  leftLeg.matrix.rotate(0.5, 1, 0, 0);
  leftLeg.matrix.rotate(g_legAngle, 0, 0, 1);
  var leftLegMat = new Matrix4(leftLeg.matrix);
  leftLeg.matrix.translate(-0.2, -0.4, -0.2);
  leftLeg.matrix.scale(0.2, 0.2, 0.2);
  leftLeg.drawCube(leftLeg.matrix, [0.318, 0.271, 0.722, 1.0]);

  var leftKnee = new Cube();
  leftKnee.matrix = leftLegMat;
  leftKnee.matrix.rotate(g_kneeAngle, 0, 0, 1);
  var leftKneeMat = new Matrix4(leftKnee.matrix);
  leftKnee.matrix.translate(-0.2, -0.7, 0.0);
  leftKnee.matrix.scale(0.2, 0.5, -0.2);
  leftKnee.drawCube(leftKnee.matrix, [0.318, 0.271, 0.722, 1.0]);

  var leftFoot = new Cube();
  leftFoot.matrix = leftKneeMat;
  leftFoot.matrix.rotate(-g_footAngle, 0, 0, 1);
  leftFoot.matrix.translate(-0.2, -0.8, -0.202);
  leftFoot.matrix.scale(0.2, 0.101, 0.204);
  leftFoot.drawCube(leftFoot.matrix, [0.431, 0.439, 0.443, 1.0]);
  
  var rightLeg = new Cube();
  rightLeg.matrix.rotate(-0.5, 1, 0, 0);
  rightLeg.matrix.rotate(-g_legAngle, 0, 0, 1);
  var rightLegMat = new Matrix4(rightLeg.matrix);
  rightLeg.matrix.translate(-0.2, -0.4, 0.0);
  rightLeg.matrix.scale(0.2, 0.2, 0.2);
  rightLeg.drawCube(rightLeg.matrix, [0.318, 0.271, 0.722, 1.0]);

  var rightKnee = new Cube();
  rightKnee.matrix = rightLegMat;
  rightKnee.matrix.rotate(-g_kneeAngle, 0, 0, 1);
  var rightKneeMat = new Matrix4(rightKnee.matrix);
  rightKnee.matrix.translate(-0.2, -0.7, 0.2);
  rightKnee.matrix.scale(0.2, 0.5, -0.2);
  rightKnee.drawCube(rightKnee.matrix, [0.318, 0.271, 0.722, 1.0]);

  var rightFoot = new Cube();
  rightFoot.matrix = rightKneeMat;
  rightFoot.matrix.rotate(-g_footAngle, 0, 0, 1);
  rightFoot.matrix.translate(-0.2, -0.8, -0.002);
  rightFoot.matrix.scale(0.2, 0.101, 0.204);
  rightFoot.drawCube(rightFoot.matrix, [0.431, 0.439, 0.443, 1.0]);
  // Body
  var body = new Cube();
  body.matrix.translate(-0.2, -0.2, -0.2);
  body.matrix.scale(0.2, 0.6, 0.4);
  body.drawCube(body.matrix, [0.082, 0.757, 0.753, 1.0]);

  var waist = new Cube();
  waist.matrix.translate(-0.2005, -0.2, -0.2005);
  waist.matrix.scale(0.201, 0.1, 0.401);
  waist.drawCube(waist.matrix, [0.318, 0.271, 0.722, 1.0]);

  var tuckDot1 = new Cube();
  tuckDot1.matrix.translate(-0.201, -0.2, -0.201);
  tuckDot1.matrix.scale(0.05, 0.05, 0.05);
  tuckDot1.drawCube(tuckDot1.matrix, [0.082, 0.757, 0.753, 1.0]);

  var tuckDot2 = new Cube();
  tuckDot2.matrix.translate(-0.201, -0.15, -0.151);
  tuckDot2.matrix.scale(0.05, 0.05, 0.05);
  tuckDot2.drawCube(tuckDot2.matrix, [0.082, 0.757, 0.753, 1.0]);

  var tuckDot3 = new Cube();
  tuckDot3.matrix.translate(-0.201, -0.15, -0.201);
  tuckDot3.matrix.scale(0.1, 0.05, 0.05);
  tuckDot3.drawCube(tuckDot3.matrix, [0.082, 0.757, 0.753, 1.0]);

  var tuckDot4 = new Cube();
  tuckDot4.matrix.translate(-0.049, -0.2, 0.0);
  tuckDot4.matrix.scale(0.05, 0.05, 0.05);
  tuckDot4.drawCube(tuckDot4.matrix, [0.082, 0.757, 0.753, 1.0]);

  var tuckDot5 = new Cube();
  tuckDot5.matrix.translate(-0.049, -0.15, -0.05);
  tuckDot5.matrix.scale(0.05, 0.05, 0.15);
  tuckDot5.drawCube(tuckDot5.matrix, [0.082, 0.757, 0.753, 1.0]);
  //Head
  var head = new Cube();
  head.matrix.rotate(g_headAngle, 0, 0, 1);
  var headMat = new Matrix4(head.matrix);
  head.matrix.translate(-0.3, 0.41, -0.2);
  head.matrix.scale(0.4, 0.3, 0.4);
  head.drawCube(head.matrix, skinColor);

  var hair = new Cube();
  hair.matrix = headMat;
  hair.matrix.translate(-0.3, 0.71, -0.2);
  hair.matrix.scale(0.4, 0.1, 0.4);
  hair.drawCube(hair.matrix, [0.200, 0.145, 0.055, 1.0]);
  
  var neck = new Cube();
  neck.matrix.translate(-0.2, 0.4, -0.1);
  neck.matrix.scale(0.2, 0.1, 0.2);
  neck.drawCube(neck.matrix, skinColor);

  var upperNeck = new Cube();
  upperNeck.matrix.translate(-0.201, 0.35, -0.1);
  upperNeck.matrix.scale(0.05, 0.05, 0.2);
  upperNeck.drawCube(upperNeck.matrix, skinColor);

  var lowerNeck = new Cube();
  lowerNeck.matrix.translate(-0.201, 0.3, -0.05);
  lowerNeck.matrix.scale(0.05, 0.05, 0.1);
  lowerNeck.drawCube(lowerNeck.matrix, skinColor);
  // Facial Features
  var leftEye = new Cube();
  leftEye.matrix.rotate(g_headAngle, 0, 0, 1);
  leftEye.matrix.translate(-0.301, 0.56, -0.15);
  leftEye.matrix.scale(0.05, 0.05, 0.05);
  leftEye.drawCube(leftEye.matrix, [1, 1, 1, 1.0]);

  var rightEye = new Cube();
  rightEye.matrix.rotate(g_headAngle, 0, 0, 1);
  rightEye.matrix.translate(-0.301, 0.56, 0.10);
  rightEye.matrix.scale(0.05, 0.05, 0.05);
  rightEye.drawCube(rightEye.matrix, [1, 1, 1, 1.0]);
  
  var leftPupil = new Cube();
  leftPupil.matrix.rotate(g_headAngle, 0, 0, 1);
  leftPupil.matrix.translate(-0.301, 0.56, -0.10);
  leftPupil.matrix.scale(0.05, 0.05, 0.05);
  leftPupil.drawCube(leftPupil.matrix, [0.298, 0.231, 0.494, 1.0]);

  var rightPupil = new Cube();
  rightPupil.matrix.rotate(g_headAngle, 0, 0, 1);
  rightPupil.matrix.translate(-0.301, 0.56, 0.05);
  rightPupil.matrix.scale(0.05, 0.05, 0.05);
  rightPupil.drawCube(rightPupil.matrix, [0.298, 0.231, 0.494, 1.0]);

  var mouth = new Cube();
  mouth.matrix.rotate(g_headAngle, 0, 0, 1);
  mouth.matrix.translate(-0.301, 0.41, -0.1);
  mouth.matrix.scale(0.05, 0.05, 0.2);
  mouth.drawCube(mouth.matrix, [0.224, 0.157, 0.078, 1.0]);

  var upperNose= new Cube();
  upperNose.matrix.rotate(g_headAngle, 0, 0, 1);
  upperNose.matrix.translate(-0.301, 0.51, -.05);
  upperNose.matrix.scale(0.05, 0.05, 0.1);
  upperNose.drawCube(upperNose.matrix, [0.380, 0.239, 0.184, 1.0]);

  var lowerNose= new Cube();
  lowerNose.matrix.rotate(g_headAngle, 0, 0, 1);
  lowerNose.matrix.translate(-0.301, 0.46, -.05);
  lowerNose.matrix.scale(0.05, 0.05, 0.1);
  lowerNose.drawCube(lowerNose.matrix, [0.459, 0.275, 0.220, 1.0]);

  var leftLip = new Cube();
  leftLip.matrix.rotate(g_headAngle, 0, 0, 1);
  leftLip.matrix.translate(-0.301, 0.46, -0.1);
  leftLip.matrix.scale(0.05, 0.05, 0.05);
  leftLip.drawCube(leftLip.matrix, [0.224, 0.157, 0.078, 1.0]);

  var rightLip = new Cube();
  rightLip.matrix.rotate(g_headAngle, 0, 0, 1);
  rightLip.matrix.translate(-0.301, 0.46, 0.05);
  rightLip.matrix.scale(0.05, 0.05, 0.05);
  rightLip.drawCube(rightLip.matrix, [0.224, 0.157, 0.078, 1.0]);

  var leftHairC = new Cube();
  leftHairC.matrix.rotate(g_headAngle, 0, 0, 1);
  leftHairC.matrix.translate(-0.301, 0.66, -0.205);
  leftHairC.matrix.scale(0.05, 0.05, 0.05);
  leftHairC.drawCube(leftHairC.matrix, [0.200, 0.145, 0.055, 1.0]);

  var rightHairC = new Cube();
  rightHairC.matrix.rotate(g_headAngle, 0, 0, 1);
  rightHairC.matrix.translate(-0.301, 0.66, 0.155);
  rightHairC.matrix.scale(0.05, 0.05, 0.05);
  rightHairC.drawCube(rightHairC.matrix, [0.200, 0.145, 0.055, 1.0]);
  
  var backHair = new Cube();
  backHair.matrix.rotate(g_headAngle, 0, 0, 1);
  backHair.matrix.translate(0.051, 0.46, -0.201);
  backHair.matrix.scale(0.05, 0.35, 0.402);
  backHair.drawCube(backHair.matrix, [0.200, 0.145, 0.055, 1.0]);
  
  var lowerbackHair = new Cube();
  lowerbackHair.matrix.rotate(g_headAngle, 0, 0, 1);
  lowerbackHair.matrix.translate(0.051, 0.41, -0.1);
  lowerbackHair.matrix.scale(0.05, 0.05, 0.2);
  lowerbackHair.drawCube(lowerbackHair.matrix, [0.200, 0.145, 0.055, 1.0]);

  var rightSideBurn = new Cube();
  rightSideBurn.matrix.rotate(g_headAngle, 0, 0, 1);
  rightSideBurn.matrix.translate(-0.299, 0.56, -0.201);
  rightSideBurn.matrix.scale(0.05, 0.2, 0.05);
  rightSideBurn.drawCube(rightSideBurn.matrix, [0.200, 0.145, 0.055, 1.0]);

  var rightTopHair = new Cube();
  rightTopHair.matrix.rotate(g_headAngle, 0, 0, 1);
  rightTopHair.matrix.translate(-0.25, 0.61, -0.201);
  rightTopHair.matrix.scale(0.305, 0.1, 0.05);
  rightTopHair.drawCube(rightTopHair.matrix, [0.200, 0.145, 0.055, 1.0]);

  var rightMidHair = new Cube();
  rightMidHair.matrix.rotate(g_headAngle, 0, 0, 1);
  rightMidHair.matrix.translate(-0.15, 0.51, -0.201);
  rightMidHair.matrix.scale(0.205, 0.1, 0.05);
  rightMidHair.drawCube(rightMidHair.matrix, [0.200, 0.145, 0.055, 1.0]);

  var rightBotHair = new Cube();
  rightBotHair.matrix.rotate(g_headAngle, 0, 0, 1);
  rightBotHair.matrix.translate(-0.095, 0.46, -0.201);
  rightBotHair.matrix.scale(0.15, 0.05, 0.05);
  rightBotHair.drawCube(rightBotHair.matrix, [0.200, 0.145, 0.055, 1.0]);

  var leftSideBurn = new Cube();
  leftSideBurn.matrix.rotate(g_headAngle, 0, 0, 1);
  leftSideBurn.matrix.translate(-0.299, 0.56, 0.151);
  leftSideBurn.matrix.scale(0.05, 0.2, 0.05);
  leftSideBurn.drawCube(leftSideBurn.matrix, [0.200, 0.145, 0.055, 1.0]);

  var leftTopHair = new Cube();
  leftTopHair.matrix.rotate(g_headAngle, 0, 0, 1);
  leftTopHair.matrix.translate(-0.25, 0.61, 0.151);
  leftTopHair.matrix.scale(0.305, 0.1, 0.05);
  leftTopHair.drawCube(leftTopHair.matrix, [0.200, 0.145, 0.055, 1.0]);

  var leftMidHair = new Cube();
  leftMidHair.matrix.rotate(g_headAngle, 0, 0, 1);
  leftMidHair.matrix.translate(-0.15, 0.51, 0.151);
  leftMidHair.matrix.scale(0.205, 0.1, 0.05);
  leftMidHair.drawCube(leftMidHair.matrix, [0.200, 0.145, 0.055, 1.0]);

  var leftBotHair = new Cube();
  leftBotHair.matrix.rotate(g_headAngle, 0, 0, 1);
  leftBotHair.matrix.translate(-0.095, 0.46, 0.151);
  leftBotHair.matrix.scale(0.15, 0.05, 0.05);
  leftBotHair.drawCube(leftBotHair.matrix, [0.200, 0.145, 0.055, 1.0]);
  
  // Arms
  var leftShoulder = new Cube();
  leftShoulder.matrix.rotate(3, 1, 0, 0);
  leftShoulder.matrix.rotate(-g_armAngle, 0, 0, 1);
  var leftShoMat = new Matrix4(leftShoulder.matrix);
  leftShoulder.matrix.translate(-0.2, 0.2, -0.4);
  leftShoulder.matrix.scale(0.2, 0.2, 0.2);
  leftShoulder.drawCube(leftShoulder.matrix, [0.082, 0.757, 0.753, 1.0]);

  var leftMidArm = new Cube();
  leftMidArm.matrix = leftShoMat;
  leftMidArm.matrix.translate(-0.2, 0.0, -0.4);
  var leftMarmMat = new Matrix4(leftMidArm.matrix);
  leftMidArm.matrix.scale(0.2, 0.2, 0.2);
  leftMidArm.drawCube(leftMidArm.matrix, skinColor);

  var leftArm = new Cube();
  leftArm.matrix = leftMarmMat;
  leftArm.matrix.rotate(-g_elbowAngle, 0, 0, 1);
  leftArm.matrix.translate(0.0, -0.2, 0.0);
  leftArm.matrix.scale(0.2, 0.26, 0.2);
  leftArm.drawCube(leftArm.matrix, skinColor);

  var rightShoulder = new Cube();
  rightShoulder.matrix.rotate(-3, 1, 0, 0);
  rightShoulder.matrix.rotate(g_armAngle, 0, 0, 1);
  var rightShoMat = new Matrix4(rightShoulder.matrix);
  rightShoulder.matrix.translate(-0.2, 0.2, 0.2);
  rightShoulder.matrix.scale(0.2, 0.2, 0.2);
  rightShoulder.drawCube(rightShoulder.matrix, [0.082, 0.757, 0.753, 1.0]);

  var rightMidArm = new Cube();
  rightMidArm.matrix = rightShoMat;
  rightMidArm.matrix.translate(-0.2, 0.0, 0.2);
  var rightMarmMat = new Matrix4(rightMidArm.matrix);
  rightMidArm.matrix.scale(0.2, 0.2, 0.2);
  rightMidArm.drawCube(rightMidArm.matrix, skinColor);

  var rightArm = new Cube();
  rightArm.matrix = rightMarmMat;
  rightArm.matrix.rotate(-g_elbowAngle, 0, 0, 1);
  rightArm.matrix.translate(0.0, -0.2, 0.0);
  rightArm.matrix.scale(0.2, 0.26, 0.2);
  rightArm.drawCube(rightArm.matrix, skinColor);
  // Legs
  var leftLeg = new Cube();
  leftLeg.matrix.rotate(0.5, 1, 0, 0);
  leftLeg.matrix.rotate(g_legAngle, 0, 0, 1);
  var leftLegMat = new Matrix4(leftLeg.matrix);
  leftLeg.matrix.translate(-0.2, -0.4, -0.2);
  leftLeg.matrix.scale(0.2, 0.2, 0.2);
  leftLeg.drawCube(leftLeg.matrix, [0.318, 0.271, 0.722, 1.0]);

  var leftKnee = new Cube();
  leftKnee.matrix = leftLegMat;
  leftKnee.matrix.rotate(g_kneeAngle, 0, 0, 1);
  var leftKneeMat = new Matrix4(leftKnee.matrix);
  leftKnee.matrix.translate(-0.2, -0.7, 0.0);
  leftKnee.matrix.scale(0.2, 0.5, -0.2);
  leftKnee.drawCube(leftKnee.matrix, [0.318, 0.271, 0.722, 1.0]);

  var leftFoot = new Cube();
  leftFoot.matrix = leftKneeMat;
  leftFoot.matrix.rotate(-g_footAngle, 0, 0, 1);
  leftFoot.matrix.translate(-0.2, -0.8, -0.202);
  leftFoot.matrix.scale(0.2, 0.101, 0.204);
  leftFoot.drawCube(leftFoot.matrix, [0.431, 0.439, 0.443, 1.0]);
  
  var rightLeg = new Cube();
  rightLeg.matrix.rotate(-0.5, 1, 0, 0);
  rightLeg.matrix.rotate(-g_legAngle, 0, 0, 1);
  var rightLegMat = new Matrix4(rightLeg.matrix);
  rightLeg.matrix.translate(-0.2, -0.4, 0.0);
  rightLeg.matrix.scale(0.2, 0.2, 0.2);
  rightLeg.drawCube(rightLeg.matrix, [0.318, 0.271, 0.722, 1.0]);

  var rightKnee = new Cube();
  rightKnee.matrix = rightLegMat;
  rightKnee.matrix.rotate(-g_kneeAngle, 0, 0, 1);
  var rightKneeMat = new Matrix4(rightKnee.matrix);
  rightKnee.matrix.translate(-0.2, -0.7, 0.2);
  rightKnee.matrix.scale(0.2, 0.5, -0.2);
  rightKnee.drawCube(rightKnee.matrix, [0.318, 0.271, 0.722, 1.0]);

  var rightFoot = new Cube();
  rightFoot.matrix = rightKneeMat;
  rightFoot.matrix.rotate(-g_footAngle, 0, 0, 1);
  rightFoot.matrix.translate(-0.2, -0.8, -0.002);
  rightFoot.matrix.scale(0.2, 0.101, 0.204);
  rightFoot.drawCube(rightFoot.matrix, [0.431, 0.439, 0.443, 1.0]);
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
  gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(tick);
}

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  // Update animation angles
  updateAnimationAngles();
  // Draw everything
  renderScene();
  // Tell the broweser to update again when it has time
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_allAnimation == 2) {
    g_headAngle = (3 * Math.sin(animationSpeed * g_seconds));
    g_armAngle = (shiftArms * Math.sin(animationSpeed * g_seconds));
    g_elbowAngle = Math.abs((20 * Math.sin(animationSpeed * g_seconds)));
    g_legAngle = ((shiftArms - 5) * Math.sin(animationSpeed * g_seconds));
    g_kneeAngle = (10 * Math.sin(animationSpeed *g_seconds));
    g_footAngle = Math.abs((5 * Math.sin((animationSpeed / 2) * g_seconds)));
  } else if (g_allAnimation == 0) {
    g_headAnimation = false;
    g_armAnimation = false;
    g_elbowAnimation = false;
    g_legAnimation = false;
    g_kneeAnimation = false;
    g_footAnimation = false;
    g_allAnimation = 1;
  } else {
    if (g_headAnimation) {
      g_headAngle = (3 * Math.sin(animationSpeed * g_seconds));
    }
    if (g_armAnimation) {
      g_armAngle = (shiftArms * Math.sin(animationSpeed * g_seconds));
    }
    if (g_elbowAnimation) {
      g_elbowAngle = Math.abs((shiftArms * Math.sin(animationSpeed * g_seconds)));
    }
    if (g_legAnimation) {
      g_legAngle = (15 * Math.sin(animationSpeed * g_seconds));
    }
    if (g_kneeAnimation) {
      g_kneeAngle = (10 * Math.sin(animationSpeed *g_seconds));
    }
    if (g_footAnimation) {
      g_footAngle = Math.abs((5 * Math.sin((animationSpeed / 2) * g_seconds)));
    }
  }
  if (g_shiftAnimation) {
    var r = (Math.sin(0.3 * (Math.abs(32 * Math.sin(0.5 * g_seconds))) + 0) * 127 + 128) / 255.0;
    var g = (Math.sin(0.3 * (Math.abs(32 * Math.sin(0.5 * g_seconds))) + 2) * 127 + 128) / 255.0;
    var b = (Math.sin(0.3 * (Math.abs(32 * Math.sin(0.5 * g_seconds))) + 4) * 127 + 128) / 255.0;
    skinColor = [r, g, b, 1.0];
    animationSpeed = 16;
    shiftArms = 360;
    g_allAnimation = 2;
  } else {
    skinColor = [0.725, 0.545, 0.471, 1.0];
    animationSpeed = 4;
    shiftArms = 20;
  }
}
