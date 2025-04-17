/**
 * OrbitControls class
 * Handles mouse interaction for orbiting the camera around a target
 */
import { Camera, ProjectionType } from '../core/Camera';
import { Vector3 } from '../math/Vector3';

export class OrbitControls {
    private camera: Camera;
    private canvas: HTMLCanvasElement;
    
    // Mouse state
    private isMouseDown: boolean = false;
    private lastMouseX: number = 0;
    private lastMouseY: number = 0;
    private mouseButton: number = 0;
    
    // Control settings
    private rotationSpeed: number = 0.01;
    private zoomSpeed: number = 0.02;  // Increased from 0.01 for slightly faster zooming
    private panSpeed: number = 0.002;
    
    // Damping
    private enableDamping: boolean = true;
    private dampingFactor: number = 0.1;
    
    // Limits
    private minDistance: number = 1;
    private maxDistance: number = 100;
    private minPolarAngle: number = 0.1; // Radians
    private maxPolarAngle: number = Math.PI - 0.1; // Radians
    
    /**
     * Create new OrbitControls
     * @param camera Camera to control
     * @param canvas Canvas element for mouse events
     */
    constructor(camera: Camera, canvas: HTMLCanvasElement) {
        this.camera = camera;
        this.canvas = canvas;
        
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners for mouse interaction
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
    }
    
    /**
     * Handle mouse movement
     * @param deltaX Change in X position
     * @param deltaY Change in Y position
     */
    private handleMouseMove(deltaX: number, deltaY: number): void {
        // Get camera's projection type
        const isOrthographic = this.camera.projectionType === ProjectionType.Orthographic;
        
        // Left mouse button behavior depends on projection type
        if (this.mouseButton === 0) {
            if (isOrthographic) {
                // For orthographic projection, left mouse button changes orientation
                // Determine which axis to rotate around based on mouse movement
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal movement rotates around Y axis
                    this.camera.orbitTheta -= deltaX * this.rotationSpeed;
                } else {
                    // Vertical movement rotates around X axis
                    this.camera.orbitPhi -= deltaY * this.rotationSpeed;
                    
                    // Clamp phi to avoid gimbal lock
                    this.camera.orbitPhi = Math.max(
                        this.minPolarAngle,
                        Math.min(this.maxPolarAngle, this.camera.orbitPhi)
                    );
                }
                
                // Update camera position
                this.camera.updateFromOrbit();
            } else {
                // For perspective projection, left mouse button orbits the camera
                // Update theta (horizontal angle)
                this.camera.orbitTheta -= deltaX * this.rotationSpeed;
                
                // Update phi (vertical angle)
                this.camera.orbitPhi -= deltaY * this.rotationSpeed;
                
                // Clamp phi to avoid gimbal lock
                this.camera.orbitPhi = Math.max(
                    this.minPolarAngle,
                    Math.min(this.maxPolarAngle, this.camera.orbitPhi)
                );
            }
        }
        
        // Right mouse button or middle mouse button: pan (for both projection types)
        else if (this.mouseButton === 2 || this.mouseButton === 1) {
            this.handlePan(deltaX, deltaY);
        }
    }
    
    /**
     * Handle panning movement
     * @param deltaX Change in X position
     * @param deltaY Change in Y position
     */
    private handlePan(deltaX: number, deltaY: number): void {
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
     * Handle mouse wheel
     * @param deltaY Change in wheel position
     */
    private handleMouseWheel(deltaY: number): void {
        // Get camera's projection type
        const isOrthographic = this.camera.projectionType === ProjectionType.Orthographic;
        
        if (isOrthographic) {
            // For orthographic projection, adjust the orthoSize
            const zoomFactor = Math.max(0.05, this.camera.orthoSize * 0.01);
            this.camera.orthoSize += deltaY * this.zoomSpeed * zoomFactor;
            
            // Clamp orthoSize to reasonable values
            this.camera.orthoSize = Math.max(0.1, Math.min(20, this.camera.orthoSize));
        } else {
            // For perspective projection, adjust the orbit radius
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
    }
    
    /**
     * Update controls (for damping)
     */
    update(): void {
        // Implement damping if needed
        if (this.enableDamping) {
            // Future implementation
        }
    }
    
    /**
     * Set rotation speed
     * @param speed Rotation speed
     */
    setRotationSpeed(speed: number): void {
        this.rotationSpeed = speed;
    }
    
    /**
     * Set zoom speed
     * @param speed Zoom speed
     */
    setZoomSpeed(speed: number): void {
        this.zoomSpeed = speed;
    }
    
    /**
     * Set pan speed
     * @param speed Pan speed
     */
    setPanSpeed(speed: number): void {
        this.panSpeed = speed;
    }
    
    /**
     * Enable or disable damping
     * @param enable Whether to enable damping
     * @param factor Damping factor
     */
    setDamping(enable: boolean, factor: number = 0.1): void {
        this.enableDamping = enable;
        this.dampingFactor = factor;
    }
    
    /**
     * Set distance limits
     * @param min Minimum distance
     * @param max Maximum distance
     */
    setDistanceLimits(min: number, max: number): void {
        this.minDistance = min;
        this.maxDistance = max;
    }
    
    /**
     * Set polar angle limits
     * @param min Minimum polar angle in radians
     * @param max Maximum polar angle in radians
     */
    setPolarAngleLimits(min: number, max: number): void {
        this.minPolarAngle = min;
        this.maxPolarAngle = max;
    }
}
