/**
 * Camera class
 * Handles camera position, orientation, and projection matrices
 */
import { Vector3 } from '../math/Vector3';
import { Matrix4 } from '../math/Matrix4';
import { Quaternion } from '../math/Quaternion';
/**
 * Projection types
 */
export declare enum ProjectionType {
    Perspective = 0,
    Orthographic = 1
}
export declare class Camera {
    private _position;
    private _target;
    private _up;
    private _rotation;
    private _orbitRadius;
    private _orbitTheta;
    private _orbitPhi;
    private _projectionType;
    private _fov;
    private _aspect;
    private _near;
    private _far;
    private _orthoSize;
    private _viewMatrix;
    private _projectionMatrix;
    private _viewMatrixNeedsUpdate;
    private _projectionMatrixNeedsUpdate;
    /**
     * Create a new Camera
     */
    constructor();
    /**
     * Get the camera position
     */
    get position(): Vector3;
    /**
     * Set the camera position
     */
    set position(value: Vector3);
    /**
     * Get the camera target
     */
    get target(): Vector3;
    /**
     * Set the camera target
     */
    set target(value: Vector3);
    /**
     * Get the camera up vector
     */
    get up(): Vector3;
    /**
     * Set the camera up vector
     */
    set up(value: Vector3);
    /**
     * Get the camera rotation
     */
    get rotation(): Quaternion;
    /**
     * Set the camera rotation
     */
    set rotation(value: Quaternion);
    /**
     * Get the projection type
     */
    get projectionType(): ProjectionType;
    /**
     * Set the projection type
     */
    set projectionType(value: ProjectionType);
    /**
     * Get the field of view
     */
    get fov(): number;
    /**
     * Set the field of view
     */
    set fov(value: number);
    /**
     * Get the aspect ratio
     */
    get aspect(): number;
    /**
     * Set the aspect ratio
     */
    set aspect(value: number);
    /**
     * Get the near clipping plane
     */
    get near(): number;
    /**
     * Set the near clipping plane
     */
    set near(value: number);
    /**
     * Get the far clipping plane
     */
    get far(): number;
    /**
     * Set the far clipping plane
     */
    set far(value: number);
    /**
     * Get the orthographic size
     */
    get orthoSize(): number;
    /**
     * Set the orthographic size
     */
    set orthoSize(value: number);
    /**
     * Get the view matrix
     */
    get viewMatrix(): Matrix4;
    /**
     * Get the projection matrix
     */
    get projectionMatrix(): Matrix4;
    /**
     * Get the orbit radius
     */
    get orbitRadius(): number;
    /**
     * Set the orbit radius
     */
    set orbitRadius(value: number);
    /**
     * Get the orbit theta angle
     */
    get orbitTheta(): number;
    /**
     * Set the orbit theta angle
     */
    set orbitTheta(value: number);
    /**
     * Get the orbit phi angle
     */
    get orbitPhi(): number;
    /**
     * Set the orbit phi angle
     */
    set orbitPhi(value: number);
    /**
     * Update the camera position from orbit parameters
     */
    updateFromOrbit(): void;
    /**
     * Update the view matrix
     */
    updateViewMatrix(): void;
    /**
     * Update the projection matrix
     */
    updateProjectionMatrix(): void;
    /**
     * Set the camera to look at a specific point
     * @param target Point to look at
     */
    lookAt(target: Vector3): void;
    /**
     * Set the camera position
     * @param x X position
     * @param y Y position
     * @param z Z position
     */
    setPosition(x: number, y: number, z: number): void;
    /**
     * Set the camera target
     * @param x X position
     * @param y Y position
     * @param z Z position
     */
    setTarget(x: number, y: number, z: number): void;
    /**
     * Set the camera up vector
     * @param x X component
     * @param y Y component
     * @param z Z component
     */
    setUp(x: number, y: number, z: number): void;
    /**
     * Set the perspective projection parameters
     * @param fov Field of view in degrees
     * @param aspect Aspect ratio (width / height)
     * @param near Near clipping plane
     * @param far Far clipping plane
     */
    setPerspective(fov: number, aspect: number, near: number, far: number): void;
    /**
     * Set the orthographic projection parameters
     * @param size Size of the orthographic view
     * @param aspect Aspect ratio (width / height)
     * @param near Near clipping plane
     * @param far Far clipping plane
     */
    setOrthographic(size: number, aspect: number, near: number, far: number): void;
    /**
     * Toggle between perspective and orthographic projection
     * @param useOrthographic Whether to use orthographic projection
     */
    toggleProjectionMode(useOrthographic: boolean): void;
}
