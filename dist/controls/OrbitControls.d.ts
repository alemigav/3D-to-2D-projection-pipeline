/**
 * OrbitControls class
 * Handles mouse interaction for orbiting the camera around a target
 */
import { Camera } from '../core/Camera';
export declare class OrbitControls {
    private camera;
    private canvas;
    private isMouseDown;
    private lastMouseX;
    private lastMouseY;
    private mouseButton;
    private rotationSpeed;
    private zoomSpeed;
    private panSpeed;
    private enableDamping;
    private dampingFactor;
    private minDistance;
    private maxDistance;
    private minPolarAngle;
    private maxPolarAngle;
    /**
     * Create new OrbitControls
     * @param camera Camera to control
     * @param canvas Canvas element for mouse events
     */
    constructor(camera: Camera, canvas: HTMLCanvasElement);
    /**
     * Set up event listeners for mouse interaction
     */
    private setupEventListeners;
    /**
     * Handle mouse movement
     * @param deltaX Change in X position
     * @param deltaY Change in Y position
     */
    private handleMouseMove;
    /**
     * Handle panning movement
     * @param deltaX Change in X position
     * @param deltaY Change in Y position
     */
    private handlePan;
    /**
     * Handle mouse wheel
     * @param deltaY Change in wheel position
     */
    private handleMouseWheel;
    /**
     * Update controls (for damping)
     */
    update(): void;
    /**
     * Set rotation speed
     * @param speed Rotation speed
     */
    setRotationSpeed(speed: number): void;
    /**
     * Set zoom speed
     * @param speed Zoom speed
     */
    setZoomSpeed(speed: number): void;
    /**
     * Set pan speed
     * @param speed Pan speed
     */
    setPanSpeed(speed: number): void;
    /**
     * Enable or disable damping
     * @param enable Whether to enable damping
     * @param factor Damping factor
     */
    setDamping(enable: boolean, factor?: number): void;
    /**
     * Set distance limits
     * @param min Minimum distance
     * @param max Maximum distance
     */
    setDistanceLimits(min: number, max: number): void;
    /**
     * Set polar angle limits
     * @param min Minimum polar angle in radians
     * @param max Maximum polar angle in radians
     */
    setPolarAngleLimits(min: number, max: number): void;
}
