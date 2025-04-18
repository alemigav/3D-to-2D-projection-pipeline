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
}
