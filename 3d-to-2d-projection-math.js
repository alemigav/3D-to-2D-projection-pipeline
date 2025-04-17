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
  
  // Create rotation matrix around X axis
  static rotationX(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    
    const result = new Matrix4();
    result.elements.set([
      1, 0, 0, 0,
      0, c, -s, 0,
      0, s, c, 0,
      0, 0, 0, 1
    ]);
    return result;
  }
  
  // Create rotation matrix around Y axis
  static rotationY(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    
    const result = new Matrix4();
    result.elements.set([
      c, 0, s, 0,
      0, 1, 0, 0,
      -s, 0, c, 0,
      0, 0, 0, 1
    ]);
    return result;
  }
  
  // Create rotation matrix around Z axis
  static rotationZ(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    
    const result = new Matrix4();
    result.elements.set([
      c, -s, 0, 0,
      s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
    return result;
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
  
  // Create orthographic projection matrix
  static orthographic(left, right, bottom, top, near, far) {
    const width = right - left;
    const height = top - bottom;
    const depth = far - near;
    
    return new Matrix4().set(
      2/width, 0, 0, -(right + left)/width,
      0, 2/height, 0, -(top + bottom)/height,
      0, 0, -2/depth, -(far + near)/depth,
      0, 0, 0, 1
    );
  }
  
  // Create isometric view matrix (for orthographic projection)
  static isometric() {
    // Standard isometric angles (approx. 35.264° around Y, then 45° around Z)
    const angleX = 0;
    const angleY = Math.PI / 180 * 35.264;
    const angleZ = Math.PI / 4; // 45 degrees
    
    // Create rotation matrices
    const rotX = Matrix4.rotationX(angleX);
    const rotY = Matrix4.rotationY(angleY);
    const rotZ = Matrix4.rotationZ(angleZ);
    
    // Combine rotations (Y then X then Z)
    return rotZ.multiply(rotX.multiply(rotY));
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
function projectVertex(v, modelMatrix, viewMatrix, projMatrix, width, height, isOrthographic = false) {
  // 1. Model Transformation (Object -> World Space)
  const worldPos = modelMatrix.transformVector(v);
  
  // 2. View Transformation (World -> Camera Space)
  const viewPos = viewMatrix.transformVector(worldPos);
  
  // 3. Projection Transformation (Camera -> Clip Space)
  const clipPos = projMatrix.transformVector(viewPos);
  
  // 4. Perspective Divide (Clip -> NDC [-1,1]^3)
  // For orthographic projection, w is always 1, so no divide needed
  const ndcX = isOrthographic ? clipPos.x : clipPos.x;
  const ndcY = isOrthographic ? clipPos.y : clipPos.y;
  
  // 5. Viewport Transformation (NDC -> Screen Space)
  const screenX = (ndcX * 0.5 + 0.5) * width;
  const screenY = (0.5 - ndcY * 0.5) * height;

  return { x: screenX, y: screenY };
}

// Interactive 3D Renderer
class Renderer3D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Set default canvas size if not specified
    if (!this.canvas.width) this.canvas.width = 800;
    if (!this.canvas.height) this.canvas.height = 600;
    
    // Camera settings
    this.cameraPosition = new Vector3(3, 3, 3);
    this.cameraTarget = new Vector3(0, 0, 0);
    this.cameraUp = new Vector3(0, 1, 0);
    
    // Projection settings
    this.fov = 75;
    this.aspect = this.canvas.width / this.canvas.height;
    this.near = 0.1;
    this.far = 100;
    this.isOrthographic = false; // Default to perspective projection
    this.orthoSize = 5; // Size of the orthographic view
    
    // Object settings
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
    this.autoRotate = true;
    
    // Mouse interaction
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.setupMouseControls();
    
    // Shapes
    this.shapes = {
      cube: this.createCube(),
      pyramid: this.createPyramid(),
      octahedron: this.createOctahedron()
    };
    
    this.currentShape = 'cube';
    this.vertices = this.shapes.cube.vertices;
    this.edges = this.shapes.cube.edges;
    
    // Animation
    this.animationId = null;
  }
  
  createCube() {
    return {
      vertices: [
        new Vector3(-1, -1, -1),
        new Vector3(1, -1, -1),
        new Vector3(1, 1, -1),
        new Vector3(-1, 1, -1),
        new Vector3(-1, -1, 1),
        new Vector3(1, -1, 1),
        new Vector3(1, 1, 1),
        new Vector3(-1, 1, 1)
      ],
      edges: [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]
    };
  }
  
  createPyramid() {
    return {
      vertices: [
        new Vector3(0, 1.5, 0),    // Top
        new Vector3(-1, -1, -1),   // Base - front left
        new Vector3(1, -1, -1),    // Base - front right
        new Vector3(1, -1, 1),     // Base - back right
        new Vector3(-1, -1, 1)     // Base - back left
      ],
      edges: [[0,1],[0,2],[0,3],[0,4],[1,2],[2,3],[3,4],[4,1]]
    };
  }
  
  createOctahedron() {
    return {
      vertices: [
        new Vector3(0, 1, 0),     // Top
        new Vector3(1, 0, 0),     // Right
        new Vector3(0, 0, 1),     // Back
        new Vector3(-1, 0, 0),    // Left
        new Vector3(0, 0, -1),    // Front
        new Vector3(0, -1, 0)     // Bottom
      ],
      edges: [
        [0,1], [0,2], [0,3], [0,4], // Top to middle points
        [5,1], [5,2], [5,3], [5,4], // Bottom to middle points
        [1,2], [2,3], [3,4], [4,1]  // Middle point connections
      ]
    };
  }
  
  setupMouseControls() {
    // Orbit camera parameters
    this.orbitRadius = 5;  // Distance from camera to target
    this.orbitTheta = Math.PI / 4;  // Horizontal angle (around Y axis)
    this.orbitPhi = Math.PI / 4;    // Vertical angle (from Y axis)
    this.damping = 0.95;            // Damping factor for smooth deceleration
    this.orbitVelocityTheta = 0;
    this.orbitVelocityPhi = 0;
    
    // Calculate initial camera position from orbit parameters
    this.updateCameraFromOrbit();
    
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.autoRotate = false;
      if (document.getElementById('autoRotate')) {
        document.getElementById('autoRotate').checked = false;
      }
      
      // Reset velocities when starting a new drag
      this.orbitVelocityTheta = 0;
      this.orbitVelocityPhi = 0;
      
      // Prevent default behavior to avoid text selection during drag
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      
      // Calculate delta movement
      const deltaX = e.clientX - this.lastMouseX;
      const deltaY = e.clientY - this.lastMouseY;
      
      // Scale factor for rotation sensitivity
      const rotationSensitivity = 0.005;
      
      // Update orbit angles - horizontal movement rotates around Y axis (theta)
      // vertical movement changes elevation angle (phi)
      this.orbitVelocityTheta = deltaX * rotationSensitivity;
      this.orbitVelocityPhi = deltaY * rotationSensitivity;
      
      // Apply rotation to orbit angles
      this.orbitTheta -= this.orbitVelocityTheta; // Negative to match natural drag direction
      this.orbitPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.orbitPhi - this.orbitVelocityPhi)); // Inverted up/down behavior
      
      // Update camera position based on new orbit angles
      this.updateCameraFromOrbit();
      
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });
    
    document.addEventListener('mouseup', () => {
      this.isDragging = false;
      
      // Continue with momentum after release
      // (velocities will be gradually reduced by the damping in render())
    });
    
    // Add mouse wheel for zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = Math.sign(e.deltaY);
      
      // Zoom factor with limits to prevent zooming too close or too far
      const factor = 1 - delta * 0.1;
      
      if (this.isOrthographic) {
        // For orthographic mode, adjust the orthographic size
        this.orthoSize = Math.max(1, Math.min(20, this.orthoSize * (1 + delta * 0.1)));
        
        // Update the orthoSize slider if it exists
        const orthoSizeSlider = document.getElementById('orthoSize');
        const orthoSizeValue = document.getElementById('orthoSize-value');
        if (orthoSizeSlider && orthoSizeValue) {
          orthoSizeSlider.value = this.orthoSize;
          orthoSizeValue.textContent = this.orthoSize.toFixed(1);
        }
      } else {
        // For perspective mode, adjust the orbit radius
        this.orbitRadius = Math.max(1.5, Math.min(20, this.orbitRadius * factor));
        
        // Update camera position based on new orbit radius
        this.updateCameraFromOrbit();
      }
    });
  }
  
  // Calculate camera position from orbit parameters
  updateCameraFromOrbit() {
    // Convert spherical coordinates to Cartesian
    this.cameraPosition.x = this.orbitRadius * Math.sin(this.orbitPhi) * Math.sin(this.orbitTheta);
    this.cameraPosition.y = this.orbitRadius * Math.cos(this.orbitPhi);
    this.cameraPosition.z = this.orbitRadius * Math.sin(this.orbitPhi) * Math.cos(this.orbitTheta);
  }
  
  setShape(shapeName) {
    if (this.shapes[shapeName]) {
      this.currentShape = shapeName;
      this.vertices = this.shapes[shapeName].vertices;
      this.edges = this.shapes[shapeName].edges;
    }
  }
  
  updateCamera(x, y, z) {
    this.cameraPosition = new Vector3(x, y, z);
  }
  
  updateProjection(fov, near, far) {
    this.fov = fov;
    this.near = near;
    this.far = far;
  }
  
  toggleAutoRotate(enabled) {
    this.autoRotate = enabled;
  }
  
  toggleProjectionMode(useOrthographic) {
    this.isOrthographic = useOrthographic;
  }
  
  setOrthoSize(size) {
    this.orthoSize = size;
  }
  
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Apply momentum and damping when not dragging
    if (!this.isDragging && !this.autoRotate) {
      // Apply velocity with damping
      this.orbitTheta -= this.orbitVelocityTheta;
      this.orbitPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.orbitPhi - this.orbitVelocityPhi)); // Inverted up/down behavior
      
      // Apply damping to gradually reduce velocity
      this.orbitVelocityTheta *= this.damping;
      this.orbitVelocityPhi *= this.damping;
      
      // Stop rotation when velocity becomes very small
      if (Math.abs(this.orbitVelocityTheta) < 0.0001) this.orbitVelocityTheta = 0;
      if (Math.abs(this.orbitVelocityPhi) < 0.0001) this.orbitVelocityPhi = 0;
      
      // Update camera position based on new orbit angles
      if (this.orbitVelocityTheta !== 0 || this.orbitVelocityPhi !== 0) {
        this.updateCameraFromOrbit();
      }
    }
    
    // Update rotation if auto-rotate is enabled
    if (this.autoRotate) {
      this.orbitTheta += 0.01;
      this.updateCameraFromOrbit();
    }
    
    // Apply rotations in the correct order to prevent gimbal lock
    // Order: Z -> X -> Y (roll, pitch, yaw)
    const rotationMatrixZ = Matrix4.rotationZ(this.rotationZ);
    const rotationMatrixX = Matrix4.rotationX(this.rotationX);
    const rotationMatrixY = Matrix4.rotationY(this.rotationY);
    
    // Combine rotations to create model matrix
    // The multiplication order matters! This order applies Z first, then X, then Y
    const modelMatrix = rotationMatrixY.multiply(rotationMatrixX.multiply(rotationMatrixZ));
    
    let viewMatrix, projMatrix;
    
    // Always use the orbit camera for view matrix, regardless of projection mode
    viewMatrix = Matrix4.lookAt(
      this.cameraPosition,
      this.cameraTarget,
      this.cameraUp
    );
    
    if (this.isOrthographic) {
      // For orthographic projection
      const size = this.orthoSize;
      const aspect = this.aspect;
      projMatrix = Matrix4.orthographic(
        -size * aspect, size * aspect,  // left, right
        -size, size,                    // bottom, top
        -100, 100                       // near, far (large range for visibility)
      );
    } else {
      // For perspective projection
      projMatrix = Matrix4.perspective(
        this.fov,
        this.aspect,
        this.near,
        this.far
      );
    }
    
    // Project all vertices
    const projected = this.vertices.map(v => 
      projectVertex(v, modelMatrix, viewMatrix, projMatrix, this.canvas.width, this.canvas.height, this.isOrthographic)
    );
    
    // Draw edges
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    
    this.edges.forEach(([a, b]) => {
      this.ctx.beginPath();
      this.ctx.moveTo(projected[a].x, projected[a].y);
      this.ctx.lineTo(projected[b].x, projected[b].y);
      this.ctx.stroke();
    });
    
    // Draw vertices
    this.ctx.fillStyle = '#f00';
    projected.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // Draw coordinate axes
    this.drawAxes(modelMatrix, viewMatrix, projMatrix);
    
    // Request next frame
    this.animationId = requestAnimationFrame(() => this.render());
  }
  
  drawAxes(modelMatrix, viewMatrix, projMatrix) {
    const origin = projectVertex(new Vector3(0, 0, 0), modelMatrix, viewMatrix, projMatrix, this.canvas.width, this.canvas.height);
    const xAxis = projectVertex(new Vector3(2, 0, 0), modelMatrix, viewMatrix, projMatrix, this.canvas.width, this.canvas.height);
    const yAxis = projectVertex(new Vector3(0, 2, 0), modelMatrix, viewMatrix, projMatrix, this.canvas.width, this.canvas.height);
    const zAxis = projectVertex(new Vector3(0, 0, 2), modelMatrix, viewMatrix, projMatrix, this.canvas.width, this.canvas.height);
    
    // X axis (red)
    this.ctx.strokeStyle = '#f00';
    this.ctx.beginPath();
    this.ctx.moveTo(origin.x, origin.y);
    this.ctx.lineTo(xAxis.x, xAxis.y);
    this.ctx.stroke();
    
    // Y axis (green)
    this.ctx.strokeStyle = '#0f0';
    this.ctx.beginPath();
    this.ctx.moveTo(origin.x, origin.y);
    this.ctx.lineTo(yAxis.x, yAxis.y);
    this.ctx.stroke();
    
    // Z axis (blue)
    this.ctx.strokeStyle = '#00f';
    this.ctx.beginPath();
    this.ctx.moveTo(origin.x, origin.y);
    this.ctx.lineTo(zAxis.x, zAxis.y);
    this.ctx.stroke();
  }
  
  start() {
    this.render();
  }
  
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.aspect = width / height;
  }
}
