/**
 * InteractionController class
 * Manages interaction with the scene, including camera controls and object manipulation
 */
import { Camera } from '../core/Camera';
import { Scene } from '../scene/Scene';
import { SceneNode } from '../scene/SceneNode';
import { Vector3 } from '../math/Vector3';
import { Quaternion } from '../math/Quaternion';
import { SelectionManager } from './SelectionManager';

/**
 * Interaction modes
 */
export enum InteractionMode {
    CameraControl,  // Control the camera (default)
    ObjectControl   // Control the selected object
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
        });
        
        // Mouse leave event
        window.addEventListener('mouseleave', () => {
            this.isMouseDown = false;
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
        this.canvas.addEventListener('object-selected', ((event: Event) => {
            // Switch to object control mode when an object is selected
            this.setMode(InteractionMode.ObjectControl);
        }) as EventListener);
        
        this.canvas.addEventListener('object-deselected', (() => {
            // Switch back to camera control mode when no object is selected
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
        if (this.mode === InteractionMode.CameraControl) {
            this.handleCameraControl(deltaX, deltaY);
        } else {
            this.handleObjectControl(deltaX, deltaY);
        }
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
            
            // Translate the object
            selectedNode.translate(
                right.x * translateX + up.x * translateY,
                right.y * translateX + up.y * translateY,
                right.z * translateX + up.z * translateY
            );
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
     * Toggle between camera and object control modes
     */
    toggleMode(): void {
        if (this.mode === InteractionMode.CameraControl) {
            // Only switch to object control if an object is selected
            if (this.selectionManager.getSelectedNode()) {
                this.setMode(InteractionMode.ObjectControl);
            }
        } else {
            this.setMode(InteractionMode.CameraControl);
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
     * Update the controller
     * This should be called once per frame
     */
    update(): void {
        // Implement any continuous updates here
    }
}
