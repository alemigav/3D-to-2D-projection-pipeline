/**
 * SceneNode class
 * Represents a node in the scene graph hierarchy
 */
import { Vector3 } from '../math/Vector3';
import { Quaternion } from '../math/Quaternion';
import { Matrix4 } from '../math/Matrix4';

export class SceneNode {
    // Node properties
    name: string = '';
    
    // Transformation properties
    private _position: Vector3 = new Vector3();
    private _rotation: Quaternion = new Quaternion();
    private _scale: Vector3 = new Vector3(1, 1, 1);
    
    // Matrices
    private _localMatrix: Matrix4 = new Matrix4();
    private _worldMatrix: Matrix4 = new Matrix4();
    
    // Hierarchy
    parent: SceneNode | null = null;
    children: SceneNode[] = [];
    
    // Flags
    private _localMatrixNeedsUpdate: boolean = true;
    private _worldMatrixNeedsUpdate: boolean = true;
    private _visible: boolean = true;
    
    /**
     * Create a new SceneNode
     * @param name Optional name for the node
     */
    constructor(name: string = '') {
        this.name = name;
    }
    
    /**
     * Get the position
     */
    get position(): Vector3 {
        return this._position;
    }
    
    /**
     * Set the position
     */
    set position(value: Vector3) {
        this._position = value;
        this._localMatrixNeedsUpdate = true;
        this._worldMatrixNeedsUpdate = true;
    }
    
    /**
     * Get the rotation
     */
    get rotation(): Quaternion {
        return this._rotation;
    }
    
    /**
     * Set the rotation
     */
    set rotation(value: Quaternion) {
        this._rotation = value;
        this._localMatrixNeedsUpdate = true;
        this._worldMatrixNeedsUpdate = true;
    }
    
    /**
     * Get the scale
     */
    get scale(): Vector3 {
        return this._scale;
    }
    
    /**
     * Set the scale
     */
    set scale(value: Vector3) {
        this._scale = value;
        this._localMatrixNeedsUpdate = true;
        this._worldMatrixNeedsUpdate = true;
    }
    
    /**
     * Get the local matrix
     */
    get localMatrix(): Matrix4 {
        if (this._localMatrixNeedsUpdate) {
            this.updateLocalMatrix();
        }
        return this._localMatrix;
    }
    
    /**
     * Get the world matrix
     */
    get worldMatrix(): Matrix4 {
        if (this._worldMatrixNeedsUpdate) {
            this.updateWorldMatrix();
        }
        return this._worldMatrix;
    }
    
    /**
     * Get the visibility
     */
    get visible(): boolean {
        return this._visible;
    }
    
    /**
     * Set the visibility
     */
    set visible(value: boolean) {
        this._visible = value;
    }
    
    /**
     * Add a child node
     * @param child Child node to add
     */
    addChild(child: SceneNode): void {
        // Remove from previous parent if any
        if (child.parent) {
            child.parent.removeChild(child);
        }
        
        // Add to children
        this.children.push(child);
        
        // Set parent
        child.parent = this;
        
        // Update matrices
        child._worldMatrixNeedsUpdate = true;
    }
    
    /**
     * Remove a child node
     * @param child Child node to remove
     */
    removeChild(child: SceneNode): void {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }
    
    /**
     * Remove all children
     */
    removeAllChildren(): void {
        for (const child of this.children) {
            child.parent = null;
        }
        this.children = [];
    }
    
    /**
     * Update the local matrix
     */
    updateLocalMatrix(): void {
        // Create translation matrix
        const translationMatrix = Matrix4.translationFromVector(this._position);
        
        // Create rotation matrix
        const rotationMatrix = this._rotation.toMatrix4();
        
        // Create scale matrix
        const scaleMatrix = Matrix4.scalingFromVector(this._scale);
        
        // Combine matrices: translation * rotation * scale
        this._localMatrix = translationMatrix.multiply(rotationMatrix.multiply(scaleMatrix));
        
        this._localMatrixNeedsUpdate = false;
        this._worldMatrixNeedsUpdate = true;
    }
    
    /**
     * Update the world matrix
     */
    updateWorldMatrix(): void {
        // Ensure local matrix is up to date
        if (this._localMatrixNeedsUpdate) {
            this.updateLocalMatrix();
        }
        
        // If has parent, multiply parent's world matrix by local matrix
        if (this.parent) {
            // Ensure parent's world matrix is up to date
            if (this.parent._worldMatrixNeedsUpdate) {
                this.parent.updateWorldMatrix();
            }
            
            this._worldMatrix = this.parent._worldMatrix.multiply(this._localMatrix);
        } else {
            // No parent, world matrix is the same as local matrix
            this._worldMatrix = this._localMatrix.clone();
        }
        
        this._worldMatrixNeedsUpdate = false;
    }
    
    /**
     * Update matrices
     */
    updateMatrices(): void {
        // Update world matrix (which will update local matrix if needed)
        if (this._worldMatrixNeedsUpdate) {
            this.updateWorldMatrix();
        }
    }
    
    /**
     * Set the position
     * @param x X position
     * @param y Y position
     * @param z Z position
     */
    setPosition(x: number, y: number, z: number): void {
        this._position = new Vector3(x, y, z);
        this._localMatrixNeedsUpdate = true;
        this._worldMatrixNeedsUpdate = true;
    }
    
    /**
     * Set the rotation from Euler angles
     * @param x X rotation in radians
     * @param y Y rotation in radians
     * @param z Z rotation in radians
     * @param order Rotation order (default: 'XYZ')
     */
    setRotationFromEuler(x: number, y: number, z: number, order: string = 'XYZ'): void {
        this._rotation = Quaternion.fromEuler(x, y, z, order);
        this._localMatrixNeedsUpdate = true;
        this._worldMatrixNeedsUpdate = true;
    }
    
    /**
     * Set the scale
     * @param x X scale
     * @param y Y scale
     * @param z Z scale
     */
    setScale(x: number, y: number, z: number): void {
        this._scale = new Vector3(x, y, z);
        this._localMatrixNeedsUpdate = true;
        this._worldMatrixNeedsUpdate = true;
    }
    
    /**
     * Look at a target
     * @param target Target position
     * @param up Up vector (default: Y up)
     */
    lookAt(target: Vector3, up: Vector3 = new Vector3(0, 1, 0)): void {
        // Calculate direction
        const direction = target.subtract(this._position).normalize();
        
        // Create quaternion from direction
        this._rotation = Quaternion.fromUnitVectors(new Vector3(0, 0, 1), direction);
        
        this._localMatrixNeedsUpdate = true;
        this._worldMatrixNeedsUpdate = true;
    }
    
    /**
     * Translate the node
     * @param x X translation
     * @param y Y translation
     * @param z Z translation
     */
    translate(x: number, y: number, z: number): void {
        this._position = this._position.add(new Vector3(x, y, z));
        this._localMatrixNeedsUpdate = true;
        this._worldMatrixNeedsUpdate = true;
    }
    
    /**
     * Rotate the node
     * @param axis Rotation axis
     * @param angle Rotation angle in radians
     */
    rotate(axis: Vector3, angle: number): void {
        const q = Quaternion.fromAxisAngle(axis, angle);
        this._rotation = this._rotation.multiply(q);
        this._localMatrixNeedsUpdate = true;
        this._worldMatrixNeedsUpdate = true;
    }
    
    /**
     * Scale the node
     * @param x X scale factor
     * @param y Y scale factor
     * @param z Z scale factor
     */
    scaleBy(x: number, y: number, z: number): void {
        this._scale = new Vector3(
            this._scale.x * x,
            this._scale.y * y,
            this._scale.z * z
        );
        this._localMatrixNeedsUpdate = true;
        this._worldMatrixNeedsUpdate = true;
    }
    
    /**
     * Update the node
     * @param deltaTime Time since last frame in seconds
     */
    update(deltaTime: number): void {
        // Base implementation does nothing
        // Override in derived classes
    }
    
    /**
     * Clone the node
     */
    clone(): SceneNode {
        const node = new SceneNode(this.name);
        
        // Copy transformation properties
        node._position = this._position.clone();
        node._rotation = this._rotation.clone();
        node._scale = this._scale.clone();
        
        // Copy flags
        node._visible = this._visible;
        
        // Mark matrices for update
        node._localMatrixNeedsUpdate = true;
        node._worldMatrixNeedsUpdate = true;
        
        return node;
    }
}
