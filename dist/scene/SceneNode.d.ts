/**
 * SceneNode class
 * Represents a node in the scene graph hierarchy
 */
import { Vector3 } from '../math/Vector3';
import { Quaternion } from '../math/Quaternion';
import { Matrix4 } from '../math/Matrix4';
export declare class SceneNode {
    name: string;
    private _position;
    private _rotation;
    private _scale;
    private _localMatrix;
    private _worldMatrix;
    parent: SceneNode | null;
    children: SceneNode[];
    private _localMatrixNeedsUpdate;
    private _worldMatrixNeedsUpdate;
    private _visible;
    /**
     * Create a new SceneNode
     * @param name Optional name for the node
     */
    constructor(name?: string);
    /**
     * Get the position
     */
    get position(): Vector3;
    /**
     * Set the position
     */
    set position(value: Vector3);
    /**
     * Get the rotation
     */
    get rotation(): Quaternion;
    /**
     * Set the rotation
     */
    set rotation(value: Quaternion);
    /**
     * Get the scale
     */
    get scale(): Vector3;
    /**
     * Set the scale
     */
    set scale(value: Vector3);
    /**
     * Get the local matrix
     */
    get localMatrix(): Matrix4;
    /**
     * Get the world matrix
     */
    get worldMatrix(): Matrix4;
    /**
     * Get the visibility
     */
    get visible(): boolean;
    /**
     * Set the visibility
     */
    set visible(value: boolean);
    /**
     * Add a child node
     * @param child Child node to add
     */
    addChild(child: SceneNode): void;
    /**
     * Remove a child node
     * @param child Child node to remove
     */
    removeChild(child: SceneNode): void;
    /**
     * Remove all children
     */
    removeAllChildren(): void;
    /**
     * Update the local matrix
     */
    updateLocalMatrix(): void;
    /**
     * Update the world matrix
     */
    updateWorldMatrix(): void;
    /**
     * Update matrices
     */
    updateMatrices(): void;
    /**
     * Set the position
     * @param x X position
     * @param y Y position
     * @param z Z position
     */
    setPosition(x: number, y: number, z: number): void;
    /**
     * Set the rotation from Euler angles
     * @param x X rotation in radians
     * @param y Y rotation in radians
     * @param z Z rotation in radians
     * @param order Rotation order (default: 'XYZ')
     */
    setRotationFromEuler(x: number, y: number, z: number, order?: string): void;
    /**
     * Set the scale
     * @param x X scale
     * @param y Y scale
     * @param z Z scale
     */
    setScale(x: number, y: number, z: number): void;
    /**
     * Look at a target
     * @param target Target position
     * @param up Up vector (default: Y up)
     */
    lookAt(target: Vector3, up?: Vector3): void;
    /**
     * Translate the node
     * @param x X translation
     * @param y Y translation
     * @param z Z translation
     */
    translate(x: number, y: number, z: number): void;
    /**
     * Rotate the node
     * @param axis Rotation axis
     * @param angle Rotation angle in radians
     */
    rotate(axis: Vector3, angle: number): void;
    /**
     * Scale the node
     * @param x X scale factor
     * @param y Y scale factor
     * @param z Z scale factor
     */
    scaleBy(x: number, y: number, z: number): void;
    /**
     * Update the node
     * @param deltaTime Time since last frame in seconds
     */
    update(deltaTime: number): void;
    /**
     * Clone the node
     */
    clone(): SceneNode;
}
