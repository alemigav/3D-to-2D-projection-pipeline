/**
 * Gimbal class
 * Special SceneNode that controls another object's position/orientation
 */
import { SceneNode } from './SceneNode';
import { Vector3 } from '../math/Vector3';
export declare class Gimbal extends SceneNode {
    controlledObject: SceneNode;
    private axisColors;
    private activeAxis;
    /**
     * Create a new Gimbal
     * @param controlledObject The object this gimbal controls
     * @param name Optional name (default: 'local_axes')
     */
    constructor(controlledObject: SceneNode, name?: string);
    /**
     * Set the active axis for movement
     * @param axis Which axis is active (x/y/z)
     */
    setActiveAxis(axis: 'x' | 'y' | 'z' | null): void;
    /**
     * Get the color for an axis
     * @param axis Which axis (x/y/z)
     * @param isActive Whether the axis is currently active
     */
    getAxisColor(axis: 'x' | 'y' | 'z', isActive: boolean): Vector3;
    /**
     * Update gimbal position to match controlled object
     */
    syncWithObject(): void;
    /**
     * Update controlled object position to match gimbal
     */
    syncToObject(): void;
    /**
     * Rotate the gimbal (and sync to object)
     * Overrides SceneNode.rotate to include syncing
     * @param axis Rotation axis
     * @param angle Rotation angle in radians
     */
    rotate(axis: Vector3, angle: number): void;
    /**
     * Set the gimbal rotation (and sync to object)
     * Overrides SceneNode.setRotationFromEuler to include syncing
     * @param x X rotation in radians
     * @param y Y rotation in radians
     * @param z Z rotation in radians
     * @param order Rotation order (default: 'XYZ')
     */
    setRotationFromEuler(x: number, y: number, z: number, order?: string): void;
    /**
    * Translate the gimbal (and sync to object)
    * Overrides SceneNode.translate to include syncing
    * @param x X translation
    * @param y Y translation
    * @param z Z translation
    */
    translate(x: number, y: number, z: number): void;
    /**
     * Set the gimbal position (and sync to object)
     * Overrides SceneNode.setPosition to include syncing
     * @param x X position
     * @param y Y position
     * @param z Z position
     */
    setPosition(x: number, y: number, z: number): void;
}
