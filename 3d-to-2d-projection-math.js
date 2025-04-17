class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static subtract(a, b) {
    return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  static cross(a, b) {
    return new Vector3(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    );
  }

  static dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  normalize() {
    const length = Math.sqrt(this.x**2 + this.y**2 + this.z**2);
    return new Vector3(this.x/length, this.y/length, this.z/length);
  }
}

class Matrix4 {
  constructor() {
    this.elements = new Float32Array(16);
    this.identity();
  }

  identity() {
    this.elements.set([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
    return this;
  }

  static lookAt(eye, target, up) {
    const z = Vector3.subtract(eye, target).normalize();
    const x = Vector3.cross(up, z).normalize();
    const y = Vector3.cross(z, x);

    return new Matrix4().set(
      x.x, x.y, x.z, -Vector3.dot(x, eye),
      y.x, y.y, y.z, -Vector3.dot(y, eye),
      z.x, z.y, z.z, -Vector3.dot(z, eye),
      0,   0,   0,    1
    );
  }

  static perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov * Math.PI / 360);
    const rangeInv = 1 / (near - far);

    return new Matrix4().set(
      f/aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near)*rangeInv, 2*far*near*rangeInv,
      0, 0, -1, 0
    );
  }

  set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
    const te = this.elements;
    te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
    te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
    te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
    te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;
    return this;
  }

  multiply(m) {
    const a = this.elements;
    const b = m.elements;
    const result = new Matrix4();

    for(let i = 0; i < 4; i++) {
      for(let j = 0; j < 4; j++) {
        result.elements[i*4 + j] = 
          a[i*4] * b[j] + 
          a[i*4 + 1] * b[j + 4] + 
          a[i*4 + 2] * b[j + 8] + 
          a[i*4 + 3] * b[j + 12];
      }
    }
    return result;
  }

  transformVector(v) {
    const x = v.x, y = v.y, z = v.z;
    const e = this.elements;

    const w = e[3] * x + e[7] * y + e[11] * z + e[15];

    return {
      x: (e[0] * x + e[4] * y + e[8] * z + e[12]) / w,
      y: (e[1] * x + e[5] * y + e[9] * z + e[13]) / w,
      z: (e[2] * x + e[6] * y + e[10] * z + e[14]) / w
    };
  }
}

// Full Projection Pipeline
function projectVertex(v, modelMatrix, viewMatrix, projMatrix, width, height) {
  // 1. Model Transformation (Object -> World Space)
  const worldPos = modelMatrix.transformVector(v);
  
  // 2. View Transformation (World -> Camera Space)
  const viewPos = viewMatrix.transformVector(worldPos);
  
  // 3. Projection Transformation (Camera -> Clip Space)
  const clipPos = projMatrix.transformVector(viewPos);
  
  // 4. Perspective Divide (Clip -> NDC [-1,1]^3)
  const ndcX = clipPos.x;
  const ndcY = clipPos.y;
  
  // 5. Viewport Transformation (NDC -> Screen Space)
  const screenX = (ndcX * 0.5 + 0.5) * width;
  const screenY = (0.5 - ndcY * 0.5) * height;

  return { x: screenX, y: screenY };
}

// Usage Example
const canvas = document.getElementById('projectionCanvas');
canvas.width = 800;
canvas.height = 600;
const ctx = canvas.getContext('2d');

// Cube vertices (object space)
const cube = [
  new Vector3(-1, -1, -1),
  new Vector3(1, -1, -1),
  new Vector3(1, 1, -1),
  new Vector3(-1, 1, -1),
  new Vector3(-1, -1, 1),
  new Vector3(1, -1, 1),
  new Vector3(1, 1, 1),
  new Vector3(-1, 1, 1)
];

// Transformation matrices
const modelMatrix = new Matrix4().identity(); // No model transformation
const viewMatrix = Matrix4.lookAt(
  new Vector3(3, 3, 3), // Camera position
  new Vector3(0, 0, 0), // Target
  new Vector3(0, 1, 0)  // Up vector
);
const projMatrix = Matrix4.perspective(
  75,                           // FOV
  canvas.width/canvas.height,   // Aspect
  0.1,                          // Near
  100                           // Far
);

// Project all vertices
const projected = cube.map(v => 
  projectVertex(v, modelMatrix, viewMatrix, projMatrix, canvas.width, canvas.height)
);

// Draw cube edges
function drawLine(a, b) {
  ctx.beginPath();
  ctx.moveTo(projected[a].x, projected[a].y);
  ctx.lineTo(projected[b].x, projected[b].y);
  ctx.stroke();
}

// Cube edges definition
const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
ctx.strokeStyle = '#000';
edges.forEach(([a, b]) => drawLine(a, b));
