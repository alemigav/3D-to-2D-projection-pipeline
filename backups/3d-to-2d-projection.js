// Initialize scene variables
let worldScene, worldCamera, worldRenderer, worldControls;
let cameraScene, cameraCamera, cameraRenderer;
let object3D, cameraHelper, cameraViewHelper;
let frustumHelper;

// Camera parameters
let cameraPosition = { x: 5, y: 5, z: 5 };
let cameraLookAt = { x: 0, y: 0, z: 0 };
let cameraUp = { x: 0, y: 1, z: 0 };

// Projection parameters
let fov = 75;
let aspect = window.innerWidth / 2 / (window.innerHeight * 0.7);
let near = 0.1;
let far = 30;

// Matrices
let viewMatrix, projectionMatrix;

// Initialize
init();
animate();

function init() {
    initWorldView();
    initCameraView();
    setupEventListeners();
    updateMatricesDisplay();
    updateVertexTable();
}

function initWorldView() {
    // Create scene
    worldScene = new THREE.Scene();
    worldScene.background = new THREE.Color(0xeeeeee);
    
    // Create camera
    worldCamera = new THREE.PerspectiveCamera(75, window.innerWidth / 2 / (window.innerHeight * 0.7), 0.1, 1000);
    worldCamera.position.set(15, 10, 15);
    worldCamera.lookAt(0, 0, 0);
    
    // Create renderer
    worldRenderer = new THREE.WebGLRenderer({ antialias: true });
    worldRenderer.setSize(window.innerWidth / 2, window.innerHeight * 0.7);
    document.getElementById('world-view').appendChild(worldRenderer.domElement);
    
    // Add OrbitControls to make the world view interactive
    worldControls = new THREE.OrbitControls(worldCamera, worldRenderer.domElement);
    worldControls.enableDamping = true; // Add smooth damping for better user experience
    worldControls.dampingFactor = 0.05;
    worldControls.rotateSpeed = 0.8;
    worldControls.panSpeed = 0.8;
    worldControls.zoomSpeed = 1.2;
    worldControls.minDistance = 5;
    worldControls.maxDistance = 50;
    
    // Add instructions to the world view
    const instructions = document.createElement('div');
    instructions.style.position = 'absolute';
    instructions.style.bottom = '10px';
    instructions.style.left = '10px';
    instructions.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    instructions.style.padding = '5px 10px';
    instructions.style.borderRadius = '5px';
    instructions.style.fontSize = '12px';
    instructions.style.zIndex = '10';
    instructions.innerHTML = 'Left click + drag: Rotate | Right click + drag: Pan | Scroll: Zoom';
    document.getElementById('world-view').appendChild(instructions);
    
    // No grid helper to keep visualization clean
    
    // No axes helper to keep visualization clean
    
    // Create object
    createObject('cube');
    
    // Add camera visualization
    createCameraHelper();
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    worldScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    worldScene.add(directionalLight);
}

function initCameraView() {
    // Create scene
    cameraScene = new THREE.Scene();
    cameraScene.background = new THREE.Color(0xdddddd);
    
    // Create camera (this simulates the view from our actual camera)
    cameraCamera = new THREE.PerspectiveCamera(fov, window.innerWidth / 2 / (window.innerHeight * 0.7), near, far);
    updateCameraPosition();
    
    // Create renderer
    cameraRenderer = new THREE.WebGLRenderer({ antialias: true });
    cameraRenderer.setSize(window.innerWidth / 2, window.innerHeight * 0.7);
    document.getElementById('camera-view').appendChild(cameraRenderer.domElement);
    
    // No grid helper to keep visualization clean
    
    // No axes helper to keep visualization clean
    
    // Mirror the object
    const object3DClone = object3D.clone();
    cameraScene.add(object3DClone);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    cameraScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    cameraScene.add(directionalLight);
}

function createObject(shapeType) {
    // Remove existing object if any
    if (object3D) {
        worldScene.remove(object3D);
        if (cameraScene) {
            // Find and remove the clone in camera scene
            const objectToRemove = cameraScene.children.find(child => 
                child.type === 'Mesh' || child.type === 'Group');
            if (objectToRemove) {
                cameraScene.remove(objectToRemove);
            }
        }
    }
    
    // Create new object based on selection
    let geometry;
    switch (shapeType) {
        case 'tetrahedron':
            geometry = new THREE.TetrahedronGeometry(2);
            break;
        case 'dodecahedron':
            geometry = new THREE.DodecahedronGeometry(2);
            break;
        case 'cube':
        default:
            geometry = new THREE.BoxGeometry(3, 3, 3);
            break;
    }
    
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x3399ff, 
        wireframe: false,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    
    object3D = new THREE.Mesh(geometry, material);
    worldScene.add(object3D);
    
    // Add wireframe
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const wireframe = new THREE.LineSegments(edgesGeometry, wireframeMaterial);
    object3D.add(wireframe);
    
    // Add to camera view
    if (cameraScene) {
        const object3DClone = object3D.clone();
        cameraScene.add(object3DClone);
    }
    
    updateVertexTable();
}

function createCameraHelper() {
    // No camera visualization to keep the scene clean
    cameraHelper = null;
    cameraViewHelper = null;
    frustumHelper = null;
}

function updateCameraPosition() {
    cameraCamera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    cameraCamera.lookAt(cameraLookAt.x, cameraLookAt.y, cameraLookAt.z);
    cameraCamera.up.set(cameraUp.x, cameraUp.y, cameraUp.z);
}

function updateVirtualCamera(camera) {
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(cameraLookAt.x, cameraLookAt.y, cameraLookAt.z);
    camera.up.set(cameraUp.x, cameraUp.y, cameraUp.z);
    camera.fov = fov;
    camera.aspect = aspect;
    camera.near = near;
    camera.far = far;
    camera.updateProjectionMatrix();
}

function updateFrustumHelper() {
    // No frustum helper to update
}

function setupEventListeners() {
    // Camera position controls
    document.getElementById('camera-x').addEventListener('input', function(e) {
        cameraPosition.x = parseFloat(e.target.value);
        document.getElementById('camera-x-value').textContent = cameraPosition.x.toFixed(1);
        updateScene();
    });
    
    document.getElementById('camera-y').addEventListener('input', function(e) {
        cameraPosition.y = parseFloat(e.target.value);
        document.getElementById('camera-y-value').textContent = cameraPosition.y.toFixed(1);
        updateScene();
    });
    
    document.getElementById('camera-z').addEventListener('input', function(e) {
        cameraPosition.z = parseFloat(e.target.value);
        document.getElementById('camera-z-value').textContent = cameraPosition.z.toFixed(1);
        updateScene();
    });
    
    // Projection controls
    document.getElementById('fov').addEventListener('input', function(e) {
        fov = parseFloat(e.target.value);
        document.getElementById('fov-value').textContent = fov + '°';
        updateScene();
    });
    
    document.getElementById('near').addEventListener('input', function(e) {
        near = parseFloat(e.target.value);
        document.getElementById('near-value').textContent = near.toFixed(1);
        updateScene();
    });
    
    document.getElementById('far').addEventListener('input', function(e) {
        far = parseFloat(e.target.value);
        document.getElementById('far-value').textContent = far;
        updateScene();
    });
    
    // Shape selector
    document.getElementById('shape-selector').addEventListener('change', function(e) {
        createObject(e.target.value);
    });
    
    // Window resize handler
    window.addEventListener('resize', onWindowResize);
}

function updateScene() {
    // Update camera position
    updateCameraPosition();
    
    // No camera helpers to update
    
    // Update matrices display
    updateMatricesDisplay();
    
    // Update vertex table
    updateVertexTable();
}

function onWindowResize() {
    // Update aspect ratio
    aspect = window.innerWidth / 2 / (window.innerHeight * 0.7);
    
    // Update world camera
    worldCamera.aspect = aspect;
    worldCamera.updateProjectionMatrix();
    worldRenderer.setSize(window.innerWidth / 2, window.innerHeight * 0.7);
    
    // Update camera view
    cameraCamera.aspect = aspect;
    cameraCamera.updateProjectionMatrix();
    cameraRenderer.setSize(window.innerWidth / 2, window.innerHeight * 0.7);
    
    // Update frustum helper
    updateFrustumHelper();
    
    // Update screen dimensions display
    updateScreenDimensionsDisplay();
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update OrbitControls
    if (worldControls) {
        worldControls.update();
    }
    
    // Auto-rotate object if enabled
    if (document.getElementById('auto-rotate').checked && object3D) {
        object3D.rotation.x += 0.005;
        object3D.rotation.y += 0.01;
        
        // Rotate the clone in camera view as well
        if (cameraScene) {
            const objectInCameraView = cameraScene.children.find(child => 
                child.type === 'Mesh' || child.type === 'Group');
            if (objectInCameraView) {
                objectInCameraView.rotation.copy(object3D.rotation);
            }
        }
        
        // Update vertex table since vertices are moving
        updateVertexTable();
    }
    
    // Render both scenes
    worldRenderer.render(worldScene, worldCamera);
    cameraRenderer.render(cameraScene, cameraCamera);
}

function calculateViewMatrix() {
    // Create camera position vector
    const eye = new THREE.Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    
    // Create look-at vector
    const target = new THREE.Vector3(cameraLookAt.x, cameraLookAt.y, cameraLookAt.z);
    
    // Calculate forward vector (normalized direction from eye to target)
    const forward = new THREE.Vector3().subVectors(target, eye).normalize();
    
    // Up vector
    const up = new THREE.Vector3(cameraUp.x, cameraUp.y, cameraUp.z);
    
    // Calculate right vector (cross product of forward and up)
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();
    
    // Recalculate orthogonal up vector
    const trueUp = new THREE.Vector3().crossVectors(right, forward).normalize();
    
    // Create view matrix
    const viewMatrix = new THREE.Matrix4().set(
        right.x, trueUp.x, -forward.x, 0,
        right.y, trueUp.y, -forward.y, 0,
        right.z, trueUp.z, -forward.z, 0,
        -right.dot(eye), -trueUp.dot(eye), forward.dot(eye), 1
    );
    
    return viewMatrix;
}

function calculateProjectionMatrix() {
    const tanFov = Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const nearToFar = far - near;
    
    return new THREE.Matrix4().set(
        1 / (aspect * tanFov), 0, 0, 0,
        0, 1 / tanFov, 0, 0,
        0, 0, -(far + near) / nearToFar, -1,
        0, 0, -2 * far * near / nearToFar, 0
    );
}

function formatMatrix(matrix) {
    const elements = matrix.elements;
    let result = "";
    
    for (let i = 0; i < 4; i++) {
        result += "| ";
        for (let j = 0; j < 4; j++) {
            // Format each element to 2 decimal places
            const value = elements[j * 4 + i].toFixed(2);
            // Pad with spaces for alignment
            result += value.padStart(7) + " ";
        }
        result += "|\n";
    }
    
    return result;
}

function updateMatricesDisplay() {
    // Calculate matrices
    viewMatrix = calculateViewMatrix();
    projectionMatrix = calculateProjectionMatrix();
    
    // Update matrix displays
    document.getElementById('view-matrix').textContent = formatMatrix(viewMatrix);
    document.getElementById('projection-matrix').textContent = formatMatrix(projectionMatrix);
    
    // Update screen dimensions
    updateScreenDimensionsDisplay();
}

function updateScreenDimensionsDisplay() {
    // Check if cameraRenderer is initialized
    if (cameraRenderer && cameraRenderer.domElement) {
        document.getElementById('screen-width').textContent = cameraRenderer.domElement.width;
        document.getElementById('screen-height').textContent = cameraRenderer.domElement.height;
    } else {
        // Default values if renderer is not available
        document.getElementById('screen-width').textContent = Math.round(window.innerWidth / 2);
        document.getElementById('screen-height').textContent = Math.round(window.innerHeight * 0.7);
    }
}

function updateVertexTable() {
    if (!object3D) return;
    
    // Make sure matrices are calculated before using them
    if (!viewMatrix || !projectionMatrix) {
        viewMatrix = calculateViewMatrix();
        projectionMatrix = calculateProjectionMatrix();
    }
    
    // Get vertices from geometry
    const geometry = object3D.geometry;
    const vertices = [];
    
    // Get position attribute
    const positionAttribute = geometry.getAttribute('position');
    
    // Get the unique vertices (without duplicates for shared vertices)
    const uniqueVertices = new Map();
    for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const z = positionAttribute.getZ(i);
        
        // Create a key for the vertex to check for duplicates
        const key = `${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`;
        
        if (!uniqueVertices.has(key)) {
            uniqueVertices.set(key, { x, y, z });
        }
    }
    
    // Convert to array and take at most 8 vertices for display
    const displayVertices = Array.from(uniqueVertices.values()).slice(0, 8);
    
    // Calculate transformed vertices
    const transformedVertices = displayVertices.map(vertex => {
        // Step 1: Apply object's world matrix to get world coordinates
        const worldVertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z)
            .applyMatrix4(object3D.matrixWorld);
        
        // Step 2: Apply view matrix to get camera space coordinates
        const cameraVertex = worldVertex.clone().applyMatrix4(viewMatrix);
        
        // Step 3: Apply projection matrix to get clip space coordinates
        const clipVertex = cameraVertex.clone();
        clipVertex.w = 1; // Initialize w component
        clipVertex.applyMatrix4(projectionMatrix);
        
        // Step 4: Perspective divide to get NDC coordinates
        const ndcVertex = new THREE.Vector4(
            clipVertex.x / clipVertex.w,
            clipVertex.y / clipVertex.w,
            clipVertex.z / clipVertex.w,
            clipVertex.w
        );
        
        // Step 5: Convert to screen coordinates
        let screenWidth = 0;
        let screenHeight = 0;
        
        // Check if cameraRenderer is initialized
        if (cameraRenderer && cameraRenderer.domElement) {
            screenWidth = cameraRenderer.domElement.width;
            screenHeight = cameraRenderer.domElement.height;
        } else {
            // Default values if renderer is not available
            screenWidth = window.innerWidth / 2;
            screenHeight = window.innerHeight * 0.7;
        }
        
        const screenX = Math.round((ndcVertex.x + 1) * 0.5 * screenWidth);
        const screenY = Math.round((1 - ndcVertex.y) * 0.5 * screenHeight);
        
        return {
            world: worldVertex,
            camera: cameraVertex,
            clip: clipVertex,
            ndc: ndcVertex,
            screen: { x: screenX, y: screenY }
        };
    });
    
    // Create table HTML
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>World Coords (X,Y,Z)</th>
                    <th>Camera Coords (X,Y,Z)</th>
                    <th>Clip Coords (X,Y,Z,W)</th>
                    <th>NDC Coords (X,Y,Z)</th>
                    <th>Screen Coords (X,Y)</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    transformedVertices.forEach((vertex, index) => {
        tableHTML += `
            <tr>
                <td>V${index + 1}</td>
                <td>(${vertex.world.x.toFixed(2)}, ${vertex.world.y.toFixed(2)}, ${vertex.world.z.toFixed(2)})</td>
                <td>(${vertex.camera.x.toFixed(2)}, ${vertex.camera.y.toFixed(2)}, ${vertex.camera.z.toFixed(2)})</td>
                <td>(${vertex.clip.x.toFixed(2)}, ${vertex.clip.y.toFixed(2)}, ${vertex.clip.z.toFixed(2)}, ${vertex.clip.w.toFixed(2)})</td>
                <td>(${vertex.ndc.x.toFixed(2)}, ${vertex.ndc.y.toFixed(2)}, ${vertex.ndc.z.toFixed(2)})</td>
                <td>(${vertex.screen.x}, ${vertex.screen.y})</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    document.getElementById('vertex-table').innerHTML = tableHTML;
}
