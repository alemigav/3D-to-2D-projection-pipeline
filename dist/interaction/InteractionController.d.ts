/**
 * InteractionController class
 * Manages interaction with the scene, including camera controls and object manipulation
 */
import { Camera } from '../core/Camera';
import { Scene } from '../scene/Scene';
import { SelectionManager } from './SelectionManager';
/**
 * Interaction modes
 */
export declare enum InteractionMode {
    CameraControl = 0,// Control the camera (default)
    ObjectControl = 1,// Control the selected object
    GimbalControl = 2
}
/**
 * Gimbal axis types
 */
export declare enum GimbalAxis {
    None = 0,
    X = 1,
    Y = 2,
    Z = 3
}
export declare class InteractionController {
    private camera;
    private scene;
    private canvas;
    private selectionManager;
    private mode;
    private isMouseDown;
    private lastMouseX;
    private lastMouseY;
    private mouseButton;
    private activeGimbalAxis;
    private gimbalDragPlane;
    private rotationSpeed;
    private zoomSpeed;
    private panSpeed;
    private minDistance;
    private maxDistance;
    private minPolarAngle;
    private maxPolarAngle;
    private onModeChange;
    /**
     * Create a new InteractionController
     * @param camera Camera to control
     * @param scene Scene to interact with
     * @param canvas Canvas element for mouse events
     * @param selectionManager Selection manager for object selection
     */
    constructor(camera: Camera, scene: Scene, canvas: HTMLCanvasElement, selectionManager: SelectionManager);
    /**
     * Set up event listeners for interaction
     */
    private setupEventListeners;
    /**
     * Handle mouse movement
     * @param deltaX Change in X position
     * @param deltaY Change in Y position
     */
    private handleMouseMove;
    /**
     * Handle gimbal axis control
     * @param deltaX Change in X position
     * @param deltaY Change in Y position
     */
    private handleGimbalControl;
    /**
     * Handle camera control
     * @param deltaX Change in X position
     * @param deltaY Change in Y position
     */
    private handleCameraControl;
    /**
     * Handle camera panning
     * @param deltaX Change in X position
     * @param deltaY Change in Y position
     */
    private handleCameraPan;
    /**
     * Handle object control
     * @param deltaX Change in X position
     * @param deltaY Change in Y position
     */
    private handleObjectControl;
    /**
     * Handle mouse wheel
     * @param deltaY Change in wheel position
     */
    private handleMouseWheel;
    /**
     * Handle camera zoom
     * @param deltaY Change in wheel position
     */
    private handleCameraZoom;
    /**
     * Handle object scaling
     * @param deltaY Change in wheel position
     */
    private handleObjectScale;
    /**
     * Set the interaction mode
     * @param mode New interaction mode
     */
    setMode(mode: InteractionMode): void;
    /**
     * Toggle between camera, object, and gimbal control modes
     */
    toggleMode(): void;
    /**
     * Get the current interaction mode
     */
    getMode(): InteractionMode;
    /**
     * Set the rotation speed
     * @param speed Rotation speed
     */
    setRotationSpeed(speed: number): void;
    /**
     * Set the zoom speed
     * @param speed Zoom speed
     */
    setZoomSpeed(speed: number): void;
    /**
     * Set the pan speed
     * @param speed Pan speed
     */
    setPanSpeed(speed: number): void;
    /**
     * Set the distance limits
     * @param min Minimum distance
     * @param max Maximum distance
     */
    setDistanceLimits(min: number, max: number): void;
    /**
     * Set the polar angle limits
     * @param min Minimum polar angle in radians
     * @param max Maximum polar angle in radians
     */
    setPolarAngleLimits(min: number, max: number): void;
    /**
     * Set the mode change callback
     * @param callback Callback function
     */
    setOnModeChange(callback: (mode: InteractionMode) => void): void;
    /**
     * Detect if a gimbal axis was clicked
     * @param ndcX X coordinate in normalized device coordinates (-1 to 1)
     * @param ndcY Y coordinate in normalized device coordinates (-1 to 1)
     */
    private detectGimbalAxisClick;
    /**
     * Calculate the distance from a ray to a line
     * @param ray Ray (origin and direction)
     * @param linePoint Point on the line
     * @param lineDirection Direction of the line
     * @returns Distance from ray to line
     */
    private distanceFromRayToLine;
    /**
     * Set up the drag plane for gimbal axis movement
     * @param axis Gimbal axis
     * @param objectPosition Object position
     */
    private setupGimbalDragPlane;
    /**
     * Create a ray from the camera through a point in normalized device coordinates
     * @param ndcX X coordinate in normalized device coordinates (-1 to 1)
     * @param ndcY Y coordinate in normalized device coordinates (-1 to 1)
     * @returns Ray origin and direction
     */
    private createRayFromCamera;
    /**
     * Set the visibility of gimbal axes
     * @param visible Whether the gimbal axes should be visible
     */
    setGimbalVisibility(visible: boolean): void;
    /**
     * Update the controller
     * This should be called once per frame
     */
    update(): void;
}
