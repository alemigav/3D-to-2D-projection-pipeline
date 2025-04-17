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
export enum ProjectionType {
    Perspective,
    Orthographic
}

export class Camera {
    // Camera position and orientation
    private _position: Vector3 = new Vector3(0, 0, 5);
    private _target: Vector3 = new Vector3(0, 0, 0);
    private _up: Vector3 = new Vector3(0, 1, 0);
    private _rotation: Quaternion = new Quaternion();

    // Orbit parameters
    private _orbitRadius: number = 5;
    private _orbitTheta: number = Math.PI / 4; // Horizontal angle
    private _orbitPhi: number = Math.PI / 4;   // Vertical angle

    // Projection parameters
    private _projectionType: ProjectionType = ProjectionType.Perspective;
    private _fov: number = 75; // Field of view in degrees
    private _aspect: number = 1; // Aspect ratio (width / height)
    private _near: number = 0.1; // Near clipping plane
    private _far: number = 100; // Far clipping plane
    private _orthoSize: number = 5; // Size of orthographic view

    // Matrices
    private _viewMatrix: Matrix4 = new Matrix4();
    private _projectionMatrix: Matrix4 = new Matrix4();

    // Flags
    private _viewMatrixNeedsUpdate: boolean = true;
    private _projectionMatrixNeedsUpdate: boolean = true;

    /**
     * Create a new Camera
     */
    constructor() {
        this.updateViewMatrix();
        this.updateProjectionMatrix();
    }

    /**
     * Get the camera position
     */
    get position(): Vector3 {
        return this._position;
    }

    /**
     * Set the camera position
     */
    set position(value: Vector3) {
        this._position = value;
        this._viewMatrixNeedsUpdate = true;
    }

    /**
     * Get the camera target
     */
    get target(): Vector3 {
        return this._target;
    }

    /**
     * Set the camera target
     */
    set target(value: Vector3) {
        this._target = value;
        this._viewMatrixNeedsUpdate = true;
    }

    /**
     * Get the camera up vector
     */
    get up(): Vector3 {
        return this._up;
    }

    /**
     * Set the camera up vector
     */
    set up(value: Vector3) {
        this._up = value;
        this._viewMatrixNeedsUpdate = true;
    }

    /**
     * Get the camera rotation
     */
    get rotation(): Quaternion {
        return this._rotation;
    }

    /**
     * Set the camera rotation
     */
    set rotation(value: Quaternion) {
        this._rotation = value;
        this._viewMatrixNeedsUpdate = true;
    }

    /**
     * Get the projection type
     */
    get projectionType(): ProjectionType {
        return this._projectionType;
    }

    /**
     * Set the projection type
     */
    set projectionType(value: ProjectionType) {
        this._projectionType = value;
        this._projectionMatrixNeedsUpdate = true;
    }

    /**
     * Get the field of view
     */
    get fov(): number {
        return this._fov;
    }

    /**
     * Set the field of view
     */
    set fov(value: number) {
        this._fov = value;
        this._projectionMatrixNeedsUpdate = true;
    }

    /**
     * Get the aspect ratio
     */
    get aspect(): number {
        return this._aspect;
    }

    /**
     * Set the aspect ratio
     */
    set aspect(value: number) {
        this._aspect = value;
        this._projectionMatrixNeedsUpdate = true;
    }

    /**
     * Get the near clipping plane
     */
    get near(): number {
        return this._near;
    }

    /**
     * Set the near clipping plane
     */
    set near(value: number) {
        this._near = value;
        this._projectionMatrixNeedsUpdate = true;
    }

    /**
     * Get the far clipping plane
     */
    get far(): number {
        return this._far;
    }

    /**
     * Set the far clipping plane
     */
    set far(value: number) {
        this._far = value;
        this._projectionMatrixNeedsUpdate = true;
    }

    /**
     * Get the orthographic size
     */
    get orthoSize(): number {
        return this._orthoSize;
    }

    /**
     * Set the orthographic size
     */
    set orthoSize(value: number) {
        this._orthoSize = value;
        this._projectionMatrixNeedsUpdate = true;
    }

    /**
     * Get the view matrix
     */
    get viewMatrix(): Matrix4 {
        if (this._viewMatrixNeedsUpdate) {
            this.updateViewMatrix();
        }
        return this._viewMatrix;
    }

    /**
     * Get the projection matrix
     */
    get projectionMatrix(): Matrix4 {
        if (this._projectionMatrixNeedsUpdate) {
            this.updateProjectionMatrix();
        }
        return this._projectionMatrix;
    }

    /**
     * Get the orbit radius
     */
    get orbitRadius(): number {
        return this._orbitRadius;
    }

    /**
     * Set the orbit radius
     */
    set orbitRadius(value: number) {
        this._orbitRadius = value;
        this.updateFromOrbit();
    }

    /**
     * Get the orbit theta angle
     */
    get orbitTheta(): number {
        return this._orbitTheta;
    }

    /**
     * Set the orbit theta angle
     */
    set orbitTheta(value: number) {
        this._orbitTheta = value;
        this.updateFromOrbit();
    }

    /**
     * Get the orbit phi angle
     */
    get orbitPhi(): number {
        return this._orbitPhi;
    }

    /**
     * Set the orbit phi angle
     */
    set orbitPhi(value: number) {
        // Clamp phi to avoid gimbal lock
        this._orbitPhi = Math.max(0.1, Math.min(Math.PI - 0.1, value));
        this.updateFromOrbit();
    }

    /**
     * Update the camera position from orbit parameters
     */
    updateFromOrbit(): void {
        // Convert spherical coordinates to Cartesian
        this._position = new Vector3(
            this._orbitRadius * Math.sin(this._orbitPhi) * Math.sin(this._orbitTheta),
            this._orbitRadius * Math.cos(this._orbitPhi),
            this._orbitRadius * Math.sin(this._orbitPhi) * Math.cos(this._orbitTheta)
        );

        // Add target position to get world-space position
        this._position = this._position.add(this._target);
        
        this._viewMatrixNeedsUpdate = true;
    }

    /**
     * Update the view matrix
     */
    updateViewMatrix(): void {
        this._viewMatrix = Matrix4.lookAt(this._position, this._target, this._up);
        this._viewMatrixNeedsUpdate = false;
    }

    /**
     * Update the projection matrix
     */
    updateProjectionMatrix(): void {
        if (this._projectionType === ProjectionType.Perspective) {
            this._projectionMatrix = Matrix4.perspective(
                this._fov,
                this._aspect,
                this._near,
                this._far
            );
        } else {
            const size = this._orthoSize;
            this._projectionMatrix = Matrix4.orthographic(
                -size * this._aspect, size * this._aspect,
                -size, size,
                this._near, this._far
            );
        }
        this._projectionMatrixNeedsUpdate = false;
    }

    /**
     * Set the camera to look at a specific point
     * @param target Point to look at
     */
    lookAt(target: Vector3): void {
        this._target = target;
        this._viewMatrixNeedsUpdate = true;
    }

    /**
     * Set the camera position
     * @param x X position
     * @param y Y position
     * @param z Z position
     */
    setPosition(x: number, y: number, z: number): void {
        this._position = new Vector3(x, y, z);
        this._viewMatrixNeedsUpdate = true;
    }

    /**
     * Set the camera target
     * @param x X position
     * @param y Y position
     * @param z Z position
     */
    setTarget(x: number, y: number, z: number): void {
        this._target = new Vector3(x, y, z);
        this._viewMatrixNeedsUpdate = true;
    }

    /**
     * Set the camera up vector
     * @param x X component
     * @param y Y component
     * @param z Z component
     */
    setUp(x: number, y: number, z: number): void {
        this._up = new Vector3(x, y, z);
        this._viewMatrixNeedsUpdate = true;
    }

    /**
     * Set the perspective projection parameters
     * @param fov Field of view in degrees
     * @param aspect Aspect ratio (width / height)
     * @param near Near clipping plane
     * @param far Far clipping plane
     */
    setPerspective(fov: number, aspect: number, near: number, far: number): void {
        this._fov = fov;
        this._aspect = aspect;
        this._near = near;
        this._far = far;
        this._projectionType = ProjectionType.Perspective;
        this._projectionMatrixNeedsUpdate = true;
    }

    /**
     * Set the orthographic projection parameters
     * @param size Size of the orthographic view
     * @param aspect Aspect ratio (width / height)
     * @param near Near clipping plane
     * @param far Far clipping plane
     */
    setOrthographic(size: number, aspect: number, near: number, far: number): void {
        this._orthoSize = size;
        this._aspect = aspect;
        this._near = near;
        this._far = far;
        this._projectionType = ProjectionType.Orthographic;
        this._projectionMatrixNeedsUpdate = true;
    }

    /**
     * Toggle between perspective and orthographic projection
     * @param useOrthographic Whether to use orthographic projection
     */
    toggleProjectionMode(useOrthographic: boolean): void {
        this._projectionType = useOrthographic ? ProjectionType.Orthographic : ProjectionType.Perspective;
        this._projectionMatrixNeedsUpdate = true;
    }
}
