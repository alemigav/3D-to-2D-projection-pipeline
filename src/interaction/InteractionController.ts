/**
 * InteractionController class
 * Manages interaction with the scene, including camera controls and object manipulation
 */
import { Camera } from '../core/Camera';
import { Scene } from '../scene/Scene';
import { SceneNode } from '../scene/SceneNode';
import { Gimbal } from '../scene/Gimbal';
import { Vector3 } from '../math/Vector3';
import { Quaternion } from '../math/Quaternion';
import { SelectionManager } from './SelectionManager';

/**
 * Interaction modes
 */
export enum InteractionMode {
    CameraControl,  // Control the camera (default)
    ObjectControl,  // Control the selected object
    GimbalControl   // Control the object using gimbal axes
}

/**
 * Gimbal axis types
 */
export enum GimbalAxis {
    None,
    X,
    Y,
    Z
}

export class InteractionController {
    private camera: Camera;
    private scene: Scene;
    private canvas: HTMLCanvasElement;
    private selectionManager: SelectionManager;
    
    // Interaction state
    private mode: InteractionMode = InteractionMode.CameraControl;
    private isMouseDown: boolean = false;
    private lastMouseX: number = 0;
    private lastMouseY: number = 0;
    private mouseButton: number = 0;
    
    // Gimbal control state
    private gimbal: Gimbal | null = null;
    private activeGimbalAxis: GimbalAxis = GimbalAxis.None;
    private gimbalDragPlane: { normal: Vector3, point: Vector3 } | null = null;
    
    // Control settings
    private rotationSpeed: number = 0.01;
    private zoomSpeed: number = 0.02;
    private panSpeed: number = 0.002;
    
    // Limits
    private minDistance: number = 1;
    private maxDistance: number = 100;
    private minPolarAngle: number = 0.1; // Radians
    private maxPolarAngle: number = Math.PI - 0.1; // Radians
    
    // Event callbacks
    private onModeChange: ((mode: InteractionMode) => void) | null = null;
    
    /**
     * Create a new InteractionController
     * @param camera Camera to control
     * @param scene Scene to interact with
     * @param canvas Canvas element for mouse events
     * @param selectionManager Selection manager for object selection
     */
    constructor(camera: Camera, scene: Scene, canvas: HTMLCanvasElement, selectionManager: SelectionManager) {
        this.camera = camera;
        this.scene = scene;
        this.canvas = canvas;
        this.selectionManager = selectionManager;
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners for interaction
     */
    private setupEventListeners(): void {
        // Mouse down event
        this.canvas.addEventListener('mousedown', (event: MouseEvent) => {
            this.isMouseDown = true;
            this.mouseButton = event.button;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
            
            // Check if we clicked on a gimbal axis
            if (event.button === 0) { // Left mouse button
                const rect = this.canvas.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / this.canvas.width) * 2 - 1;
                const y = -((event.clientY - rect.top) / this.canvas.height) * 2 + 1;
                
                // Try to detect gimbal axis click
                this.detectGimbalAxisClick(x, y);
            }
            
            // Prevent default behavior (e.g., text selection)
            event.preventDefault();
        });
        
        // Mouse move event
        window.addEventListener('mousemove', (event: MouseEvent) => {
            if (!this.isMouseDown) return;
            
            const deltaX = event.clientX - this.lastMouseX;
            const deltaY = event.clientY - this.lastMouseY;
            
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
            
            this.handleMouseMove(deltaX, deltaY);
            
            // Prevent default behavior
            event.preventDefault();
        });
        
        // Mouse up event
        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
            
            // Reset gimbal axis when mouse is released
            if (this.activeGimbalAxis !== GimbalAxis.None) {
                this.activeGimbalAxis = GimbalAxis.None;
                this.gimbalDragPlane = null;
                
                // Update UI to show the current mode
                if (this.onModeChange) {
                    this.onModeChange(this.mode);
                }
            }
        });
        
        // Mouse leave event
        window.addEventListener('mouseleave', () => {
            this.isMouseDown = false;
            
            // Reset gimbal axis when mouse leaves window
            if (this.activeGimbalAxis !== GimbalAxis.None) {
                this.activeGimbalAxis = GimbalAxis.None;
                this.gimbalDragPlane = null;
                
                // Update UI to show the current mode
                if (this.onModeChange) {
                    this.onModeChange(this.mode);
                }
            }
        });
        
        // Mouse wheel event
        this.canvas.addEventListener('wheel', (event: WheelEvent) => {
            this.handleMouseWheel(event.deltaY);
            
            // Prevent default behavior (page scrolling)
            event.preventDefault();
        });
        
        // Touch events for mobile support
        this.canvas.addEventListener('touchstart', (event: TouchEvent) => {
            if (event.touches.length === 1) {
                this.isMouseDown = true;
                this.lastMouseX = event.touches[0].clientX;
                this.lastMouseY = event.touches[0].clientY;
            }
            
            // Prevent default behavior (page scrolling)
            event.preventDefault();
        });
        
        this.canvas.addEventListener('touchmove', (event: TouchEvent) => {
            if (event.touches.length === 1 && this.isMouseDown) {
                const deltaX = event.touches[0].clientX - this.lastMouseX;
                const deltaY = event.touches[0].clientY - this.lastMouseY;
                
                this.lastMouseX = event.touches[0].clientX;
                this.lastMouseY = event.touches[0].clientY;
                
                this.handleMouseMove(deltaX, deltaY);
            }
            
            // Prevent default behavior (page scrolling)
            event.preventDefault();
        });
        
        this.canvas.addEventListener('touchend', () => {
            this.isMouseDown = false;
        });
        
        // Listen for selection changes
        this.canvas.addEventListener('object-selected', ((event: CustomEvent<SceneNode>) => {
            const selectedNode = event.detail;
            if (!selectedNode) return;

            // Create or update the gimbal for the selected node
            if (!this.gimbal) {
                this.gimbal = new Gimbal(selectedNode);
                // Add gimbal to the scene root. The visible 'local_axes' should become its child.
                this.scene.getRoot().addChild(this.gimbal); 
            } else {
                this.gimbal.controlledObject = selectedNode;
            }
            // Sync gimbal position/rotation with the newly selected object
            this.gimbal.syncWithObject(); 

            // Find the visible gimbal representation ('local_axes')
            const visibleGimbal = this.scene.findNodeByName('local_axes');
            if (visibleGimbal) {
                 // Ensure it's a child of our logical gimbal and visible
                if (visibleGimbal.parent !== this.gimbal) {
                    // Remove from previous parent (could be scene root or another object)
                    visibleGimbal.parent?.removeChild(visibleGimbal); 
                    // Add to our logical gimbal
                    this.gimbal.addChild(visibleGimbal); 
                    // Reset local transform if needed, as it's now relative to the gimbal
                    visibleGimbal.position.set(0, 0, 0); 
                    visibleGimbal.rotation.set(0, 0, 0, 1);
                    visibleGimbal.scale.set(1, 1, 1);
                    visibleGimbal.updateMatrices();
                }
                visibleGimbal.visible = true; // Make sure it's visible
            } else {
                // If the visible gimbal doesn't exist, we might need to create it.
                // For now, just warn. Creation logic would depend on how 'local_axes' is generated.
                console.warn("Visible gimbal node 'local_axes' not found in the scene.");
            }

            // Switch to object control mode if not currently dragging a gimbal axis
            if (this.activeGimbalAxis === GimbalAxis.None) {
                this.setMode(InteractionMode.ObjectControl);
            }
        }) as EventListener);
        
        this.canvas.addEventListener('object-deselected', (() => {
            // Hide the visible gimbal when nothing is selected
            if (this.gimbal) {
                 // Find the visible gimbal, which should be a child now
                 const visibleGimbal = this.gimbal.findChildByName('local_axes'); 
                 if (visibleGimbal) {
                     visibleGimbal.visible = false;
                 }
            }
            // Reset gimbal state
            this.activeGimbalAxis = GimbalAxis.None; 
            this.gimbalDragPlane = null;
            // Switch back to camera control mode
            this.setMode(InteractionMode.CameraControl); 
        }) as EventListener);
        
        // Keyboard events for mode switching
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            // Toggle mode with Tab key
            if (event.key === 'Tab') {
                this.toggleMode();
                event.preventDefault();
            }
            
            // Escape key to deselect object
            if (event.key === 'Escape' && this.mode === InteractionMode.ObjectControl) {
                this.selectionManager.clearSelection();
                event.preventDefault();
            }
        });
    }
    
    /**
     * Handle mouse movement
     * @param deltaX Change in X position
     * @param deltaY Change in Y position
     */
    private handleMouseMove(deltaX: number, deltaY: number): void {
        // Check if we're in gimbal control mode with an active axis
        if (this.activeGimbalAxis !== GimbalAxis.None) {
            // Force gimbal control mode if an axis is active
            this.mode = InteractionMode.GimbalControl;
            this.handleGimbalControl(deltaX, deltaY);
        } else if (this.mode === InteractionMode.CameraControl) {
            this.handleCameraControl(deltaX, deltaY);
        } else if (this.mode === InteractionMode.ObjectControl) {
            this.handleObjectControl(deltaX, deltaY);
        } else if (this.mode === InteractionMode.GimbalControl) {
            this.handleGimbalControl(deltaX, deltaY);
        }
    }
    
    /**
     * Handle gimbal axis control
     * @param deltaX Change in X position
     * @param deltaY Change in Y position
     */
    private handleGimbalControl(deltaX: number, deltaY: number): void {
        const selectedNode = this.selectionManager.getSelectedNode();
        if (!selectedNode || this.activeGimbalAxis === GimbalAxis.None || !this.gimbalDragPlane) {
            return;
        }
        
        // Find the actual object to move (parent of the gimbal axes)
        // If the selected node is the gimbal axes, move its parent
        // If the selected node is the object itself, move it directly
        const nodeToMove = selectedNode.name === 'local_axes' ? selectedNode.parent : selectedNode;
        
        if (!nodeToMove) {
            console.warn('No node to move found');
            return;
        }
        
        // Get the object's world position
        const objectPosition = nodeToMove.worldMatrix.getTranslation();
        
        // Get the axis direction in world space
        let axisDir: Vector3;
        const worldMatrix = nodeToMove.worldMatrix;
        
        switch (this.activeGimbalAxis) {
            case GimbalAxis.X:
                // Transform X axis direction (1,0,0) by the world matrix
                axisDir = new Vector3(
                    worldMatrix.elements[0],  // First column X component
                    worldMatrix.elements[1],  // First column Y component
                    worldMatrix.elements[2]   // First column Z component
                ).normalize();
                break;
            case GimbalAxis.Y:
                // Transform Y axis direction (0,1,0) by the world matrix
                axisDir = new Vector3(
                    worldMatrix.elements[4],  // Second column X component
                    worldMatrix.elements[5],  // Second column Y component
                    worldMatrix.elements[6]   // Second column Z component
                ).normalize();
                break;
            case GimbalAxis.Z:
                // Transform Z axis direction (0,0,1) by the world matrix
                axisDir = new Vector3(
                    worldMatrix.elements[8],  // Third column X component
                    worldMatrix.elements[9],  // Third column Y component
                    worldMatrix.elements[10]  // Third column Z component
                ).normalize();
                break;
            default:
                return;
        }
        
        // Calculate movement amount based on mouse delta
        // Use a scale factor that's proportional to the camera distance for better control
        const cameraDistance = this.camera.orbitRadius;
        const movementScale = 0.01 * Math.max(1, cameraDistance / 10);
        
        // Use both X and Y deltas, but weight them based on the camera view
        // This makes the movement more intuitive from any camera angle
        const viewDir = this.camera.position.subtract(this.camera.target).normalize();
        const rightDir = viewDir.cross(this.camera.up).normalize();
        const upDir = rightDir.cross(viewDir).normalize();
        
        // Project the axis direction onto the view plane
        const axisOnViewPlane = axisDir.subtract(viewDir.multiply(axisDir.dot(viewDir))).normalize();
        
        // Calculate how much the axis aligns with the right and up directions
        const rightAlignment = Math.abs(axisOnViewPlane.dot(rightDir));
        const upAlignment = Math.abs(axisOnViewPlane.dot(upDir));
        
        // Weight the X and Y deltas based on alignment
        const weightedDeltaX = deltaX * rightAlignment;
        const weightedDeltaY = -deltaY * upAlignment; // Negate Y for intuitive control
        
        // Calculate the final movement amount
        const movementAmount = (weightedDeltaX + weightedDeltaY) * movementScale;
        
        // Move the gimbal along the selected axis
        const movement = axisDir.multiply(movementAmount);
        if (this.gimbal) {
            this.gimbal.translate(movement.x, movement.y, movement.z);
            this.gimbal.syncToObject();
        }
        
        console.log(`Moving along ${GimbalAxis[this.activeGimbalAxis]} axis: ${movementAmount}`);
    }
    
    /**
     * Handle camera control
     * @param deltaX Change in X position
     * @param deltaY Change in Y position
     */
    private handleCameraControl(deltaX: number, deltaY: number): void {
        // Left mouse button: orbit
        if (this.mouseButton === 0) {
            // Update theta (horizontal angle)
            this.camera.orbitTheta -= deltaX * this.rotationSpeed;
            
            // Update phi (vertical angle)
            this.camera.orbitPhi -= deltaY * this.rotationSpeed;
            
            // Clamp phi to avoid gimbal lock
            this.camera.orbitPhi = Math.max(
                this.minPolarAngle,
                Math.min(this.maxPolarAngle, this.camera.orbitPhi)
            );
            
            // Update camera position
            this.camera.updateFromOrbit();
        }
        
        // Right mouse button or middle mouse button: pan
        else if (this.mouseButton === 2 || this.mouseButton === 1) {
            this.handleCameraPan(deltaX, deltaY);
        }
    }
    
    /**
     * Handle camera panning
     * @param deltaX Change in X position
     * @param deltaY Change in Y position
     */
    private handleCameraPan(deltaX: number, deltaY: number): void {
        // Calculate pan amount based on camera's distance to target
        const distance = this.camera.orbitRadius;
        const panX = -deltaX * this.panSpeed * distance;
        const panY = deltaY * this.panSpeed * distance;
        
        // Get camera's right and up vectors
        const forward = this.camera.target.subtract(this.camera.position).normalize();
        const right = forward.cross(this.camera.up).normalize();
        const up = right.cross(forward).normalize();
        
        // Update target position
        const target = this.camera.target;
        this.camera.target = target.add(right.multiply(panX)).add(up.multiply(panY));
        
        // Update camera position to maintain the same relative position
        const position = this.camera.position;
        this.camera.position = position.add(right.multiply(panX)).add(up.multiply(panY));
    }
    
    /**
     * Handle object control
     * @param deltaX Change in X position
     * @param deltaY Change in Y position
     */
    private handleObjectControl(deltaX: number, deltaY: number): void {
        const selectedNode = this.selectionManager.getSelectedNode();
        if (!selectedNode) return;
        
        // Left mouse button: rotate object
        if (this.mouseButton === 0) {
            // Determine which axis to rotate around based on mouse movement
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal movement rotates around Y axis
                selectedNode.rotate(new Vector3(0, 1, 0), -deltaX * this.rotationSpeed);
            } else {
                // Vertical movement rotates around X axis
                selectedNode.rotate(new Vector3(1, 0, 0), -deltaY * this.rotationSpeed);
            }
        }
        
        // Right mouse button or middle mouse button: translate object
        else if (this.mouseButton === 2 || this.mouseButton === 1) {
            // Calculate translation amount
            const translateX = deltaX * this.panSpeed * 2;
            const translateY = -deltaY * this.panSpeed * 2;
            
            // Get camera's right and up vectors for translation in view space
            const forward = this.camera.target.subtract(this.camera.position).normalize();
            const right = forward.cross(this.camera.up).normalize();
            const up = right.cross(forward).normalize();
            
            // Check if a gimbal exists and controls this node
            if (this.gimbal && this.gimbal.controlledObject === selectedNode) {
                // Translate the gimbal instead
                const movement = right.multiply(translateX).add(up.multiply(translateY));
                this.gimbal.translate(movement.x, movement.y, movement.z);
                this.gimbal.syncToObject();
            } else {
                // Translate the object directly if no gimbal is involved
                selectedNode.translate(
                    right.x * translateX + up.x * translateY,
                    right.y * translateX + up.y * translateY,
                    right.z * translateX + up.z * translateY
                );
            }
        }
    }
    
    /**
     * Handle mouse wheel
     * @param deltaY Change in wheel position
     */
    private handleMouseWheel(deltaY: number): void {
        if (this.mode === InteractionMode.CameraControl) {
            this.handleCameraZoom(deltaY);
        } else {
            this.handleObjectScale(deltaY);
        }
    }
    
    /**
     * Handle camera zoom
     * @param deltaY Change in wheel position
     */
    private handleCameraZoom(deltaY: number): void {
        // Make zoom speed proportional to current distance for more natural zooming
        const zoomFactor = Math.max(0.05, this.camera.orbitRadius * 0.01);
        
        // Update orbit radius (zoom)
        this.camera.orbitRadius += deltaY * this.zoomSpeed * zoomFactor;
        
        // Clamp distance
        this.camera.orbitRadius = Math.max(
            this.minDistance,
            Math.min(this.maxDistance, this.camera.orbitRadius)
        );
        
        // Update camera position
        this.camera.updateFromOrbit();
    }
    
    /**
     * Handle object scaling
     * @param deltaY Change in wheel position
     */
    private handleObjectScale(deltaY: number): void {
        const selectedNode = this.selectionManager.getSelectedNode();
        if (!selectedNode) return;
        
        // Calculate scale factor
        const scaleFactor = 1.0 - deltaY * this.zoomSpeed * 0.1;
        
        // Scale the object
        selectedNode.scaleBy(scaleFactor, scaleFactor, scaleFactor);
    }
    
    /**
     * Set the interaction mode
     * @param mode New interaction mode
     */
    setMode(mode: InteractionMode): void {
        if (this.mode === mode) return;
        
        this.mode = mode;
        
        // Call the mode change callback if set
        if (this.onModeChange) {
            this.onModeChange(mode);
        }
    }
    
    /**
     * Toggle between camera, object, and gimbal control modes
     */
    toggleMode(): void {
        const selectedNode = this.selectionManager.getSelectedNode();
        
        // Only allow object and gimbal control if an object is selected
        if (!selectedNode) {
            this.setMode(InteractionMode.CameraControl);
            return;
        }
        
        // Cycle through modes: Camera -> Object -> Gimbal -> Camera
        switch (this.mode) {
            case InteractionMode.CameraControl:
                this.setMode(InteractionMode.ObjectControl);
                break;
                
            case InteractionMode.ObjectControl:
                // Reset gimbal state
                this.activeGimbalAxis = GimbalAxis.None;
                this.gimbalDragPlane = null;
                
                this.setMode(InteractionMode.GimbalControl);
                break;
                
            case InteractionMode.GimbalControl:
            default:
                this.setMode(InteractionMode.CameraControl);
                break;
        }
    }
    
    /**
     * Get the current interaction mode
     */
    getMode(): InteractionMode {
        return this.mode;
    }
    
    /**
     * Set the rotation speed
     * @param speed Rotation speed
     */
    setRotationSpeed(speed: number): void {
        this.rotationSpeed = speed;
    }
    
    /**
     * Set the zoom speed
     * @param speed Zoom speed
     */
    setZoomSpeed(speed: number): void {
        this.zoomSpeed = speed;
    }
    
    /**
     * Set the pan speed
     * @param speed Pan speed
     */
    setPanSpeed(speed: number): void {
        this.panSpeed = speed;
    }
    
    /**
     * Set the distance limits
     * @param min Minimum distance
     * @param max Maximum distance
     */
    setDistanceLimits(min: number, max: number): void {
        this.minDistance = min;
        this.maxDistance = max;
    }
    
    /**
     * Set the polar angle limits
     * @param min Minimum polar angle in radians
     * @param max Maximum polar angle in radians
     */
    setPolarAngleLimits(min: number, max: number): void {
        this.minPolarAngle = min;
        this.maxPolarAngle = max;
    }
    
    /**
     * Set the mode change callback
     * @param callback Callback function
     */
    setOnModeChange(callback: (mode: InteractionMode) => void): void {
        this.onModeChange = callback;
    }
    
    /**
     * Detect if a gimbal axis was clicked
     * @param ndcX X coordinate in normalized device coordinates (-1 to 1)
     * @param ndcY Y coordinate in normalized device coordinates (-1 to 1)
     */
    private detectGimbalAxisClick(ndcX: number, ndcY: number): void {
        const selectedNode = this.selectionManager.getSelectedNode();
        if (!selectedNode) return;
        
        // Create ray from camera through the clicked point
        const ray = this.createRayFromCamera(ndcX, ndcY);
        
        // Check if the ray intersects with any of the gimbal axes
        // This is a simplified implementation - in a real implementation, we would
        // check for intersections with the actual gimbal geometry
        
        // Get the object's world position
        const objectPosition = selectedNode.worldMatrix.getTranslation();
        
        // Define axis directions in world space
        const xAxis = selectedNode.worldMatrix.transformDirection(new Vector3(1, 0, 0));
        const yAxis = selectedNode.worldMatrix.transformDirection(new Vector3(0, 1, 0));
        const zAxis = selectedNode.worldMatrix.transformDirection(new Vector3(0, 0, 1));
        
        // Define axis colors for visual identification
        const xAxisColor = new Vector3(1, 0, 0); // Red
        const yAxisColor = new Vector3(0, 1, 0); // Green
        const zAxisColor = new Vector3(0, 0, 1); // Blue
        
        // Check distance from ray to each axis
        // For simplicity, we'll use a cylinder test (distance from ray to line)
        const xAxisDistance = this.distanceFromRayToLine(ray, objectPosition, xAxis);
        const yAxisDistance = this.distanceFromRayToLine(ray, objectPosition, yAxis);
        const zAxisDistance = this.distanceFromRayToLine(ray, objectPosition, zAxis);
        
        // Threshold for axis selection (in world units)
        const threshold = 0.1;
        
        // Find the closest axis that's within the threshold
        let closestAxis = GimbalAxis.None;
        let closestDistance = threshold;
        
        if (xAxisDistance < closestDistance) {
            closestAxis = GimbalAxis.X;
            closestDistance = xAxisDistance;
        }
        
        if (yAxisDistance < closestDistance) {
            closestAxis = GimbalAxis.Y;
            closestDistance = yAxisDistance;
        }
        
        if (zAxisDistance < closestDistance) {
            closestAxis = GimbalAxis.Z;
            closestDistance = zAxisDistance;
        }
        
        // If we found an axis, set it as active and switch to gimbal control mode
        if (closestAxis !== GimbalAxis.None) {
            // Create gimbal if needed
            if (!this.gimbal) {
                this.gimbal = new Gimbal(selectedNode);
                this.scene.getRoot().addChild(this.gimbal);
                
                // Ensure the visible gimbal lines are connected to our Gimbal instance
                const visibleGimbal = this.scene.findNodeByName('local_axes');
                if (visibleGimbal && visibleGimbal !== this.gimbal) {
                    visibleGimbal.parent?.removeChild(visibleGimbal);
                    this.gimbal.addChild(visibleGimbal);
                }
            } else {
                this.gimbal.controlledObject = selectedNode;
                this.gimbal.syncWithObject();
            }
            
            this.gimbal.setActiveAxis(GimbalAxis[closestAxis].toLowerCase() as 'x'|'y'|'z');
            this.activeGimbalAxis = closestAxis;
            
            // Force the mode to GimbalControl
            this.mode = InteractionMode.GimbalControl;
            
            // Call the mode change callback if set
            if (this.onModeChange) {
                this.onModeChange(InteractionMode.GimbalControl);
            }
            
            // Set up the drag plane for this axis
            this.setupGimbalDragPlane(closestAxis, objectPosition);
            
            console.log(`Gimbal axis selected: ${GimbalAxis[closestAxis]}, Mode: ${InteractionMode[this.mode]}`);
        }
    }
    
    /**
     * Calculate the distance from a ray to a line
     * @param ray Ray (origin and direction)
     * @param linePoint Point on the line
     * @param lineDirection Direction of the line
     * @returns Distance from ray to line
     */
    private distanceFromRayToLine(
        ray: { origin: Vector3, direction: Vector3 },
        linePoint: Vector3,
        lineDirection: Vector3
    ): number {
        // Vector between ray origin and line point
        const w0 = ray.origin.subtract(linePoint);
        
        // Normalize directions
        const rayDir = ray.direction.normalize();
        const lineDir = lineDirection.normalize();
        
        // Calculate terms for closest point calculation
        const a = rayDir.dot(rayDir);
        const b = rayDir.dot(lineDir);
        const c = lineDir.dot(lineDir);
        const d = rayDir.dot(w0);
        const e = lineDir.dot(w0);
        
        // Calculate parameters for closest points
        const denom = a * c - b * b;
        
        // If lines are parallel, use point-to-line distance
        if (Math.abs(denom) < 0.0001) {
            const crossProduct = w0.cross(lineDir);
            return crossProduct.length();
        }
        
        const rayParam = (b * e - c * d) / denom;
        const lineParam = (a * e - b * d) / denom;
        
        // Calculate closest points on ray and line
        const rayPoint = ray.origin.add(rayDir.multiply(rayParam));
        const lineClosestPoint = linePoint.add(lineDir.multiply(lineParam));
        
        // Calculate distance between closest points
        return rayPoint.subtract(lineClosestPoint).length();
    }
    
    /**
     * Set up the drag plane for gimbal axis movement
     * @param axis Gimbal axis
     * @param objectPosition Object position
     */
    private setupGimbalDragPlane(axis: GimbalAxis, objectPosition: Vector3): void {
        // The drag plane is perpendicular to the camera direction and contains the axis
        const cameraDir = this.camera.position.subtract(objectPosition).normalize();
        
        // Get the axis direction in world space
        let axisDir: Vector3;
        switch (axis) {
            case GimbalAxis.X:
                axisDir = new Vector3(1, 0, 0);
                break;
            case GimbalAxis.Y:
                axisDir = new Vector3(0, 1, 0);
                break;
            case GimbalAxis.Z:
                axisDir = new Vector3(0, 0, 1);
                break;
            default:
                return;
        }
        
        // The plane normal is perpendicular to both the camera direction and the axis
        const planeNormal = cameraDir.cross(axisDir).normalize();
        
        // Store the drag plane
        this.gimbalDragPlane = {
            normal: planeNormal,
            point: objectPosition
        };
    }
    
    /**
     * Create a ray from the camera through a point in normalized device coordinates
     * @param ndcX X coordinate in normalized device coordinates (-1 to 1)
     * @param ndcY Y coordinate in normalized device coordinates (-1 to 1)
     * @returns Ray origin and direction
     */
    private createRayFromCamera(ndcX: number, ndcY: number): { origin: Vector3, direction: Vector3 } {
        // Get camera position (ray origin)
        const origin = this.camera.position.clone();
        
        // Calculate ray direction
        // This is a simplified version - in a real implementation, we would use the camera's
        // projection and view matrices to calculate the exact ray direction
        
        // For perspective camera:
        // 1. Create a point in clip space
        const clipX = ndcX;
        const clipY = ndcY;
        const clipZ = -1.0; // Near plane
        
        // 2. Transform to view space
        const invProjection = this.camera.projectionMatrix.inverse();
        const viewSpacePos = invProjection.transformVector(new Vector3(clipX, clipY, clipZ));
        
        // 3. Transform to world space
        const invView = this.camera.viewMatrix.inverse();
        const worldSpacePos = invView.transformVector(viewSpacePos);
        
        // 4. Calculate direction from camera to this point
        const direction = worldSpacePos.subtract(origin).normalize();
        
        return { origin, direction };
    }
    
    /**
     * Set the visibility of gimbal axes
     * @param visible Whether the gimbal axes should be visible
     */
    setGimbalVisibility(visible: boolean): void {
        // Find all gimbal axes in the scene and set their visibility
        this.scene.traverse((node: SceneNode) => {
            if (node.name === 'local_axes') {
                node.visible = visible;
            }
        });
    }
    
    /**
     * Update the controller
     * This should be called once per frame
     */
    update(): void {
        // Implement any continuous updates here
    }
}
