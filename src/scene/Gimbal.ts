/**
 * Gimbal class
 * Special SceneNode that controls another object's position/orientation
 */
import { SceneNode } from './SceneNode';
import { Vector3 } from '../math/Vector3';
import { Matrix4 } from '../math/Matrix4';

export class Gimbal extends SceneNode {
    public controlledObject: SceneNode;
    private axisColors: {x: Vector3, y: Vector3, z: Vector3};
    private activeAxis: 'x'|'y'|'z'|null = null;

    /**
     * Create a new Gimbal
     * @param controlledObject The object this gimbal controls
     * @param name Optional name (default: 'local_axes')
     */
    constructor(controlledObject: SceneNode, name: string = 'local_axes') {
        super(name);
        this.controlledObject = controlledObject;
        
        // Set up axis colors (red, green, blue)
        this.axisColors = {
            x: new Vector3(1, 0, 0),
            y: new Vector3(0, 1, 0),
            z: new Vector3(0, 0, 1)
        };

        // Sync initial position with controlled object
        this.position = controlledObject.position.clone();
    }

    /**
     * Set the active axis for movement
     * @param axis Which axis is active (x/y/z)
     */
    setActiveAxis(axis: 'x'|'y'|'z'|null): void {
        this.activeAxis = axis;
    }

    /**
     * Get the color for an axis
     * @param axis Which axis (x/y/z)
     * @param isActive Whether the axis is currently active
     */
    getAxisColor(axis: 'x'|'y'|'z', isActive: boolean): Vector3 {
        const baseColor = this.axisColors[axis];
        if (isActive) {
            // Highlight active axis
            return new Vector3(
                baseColor.x * 1.5,
                baseColor.y * 1.5, 
                baseColor.z * 1.5
            );
        }
        return baseColor.clone();
    }

    /**
     * Update gimbal position to match controlled object
     */
    syncWithObject(): void {
        this.position = this.controlledObject.position.clone();
        this.rotation = this.controlledObject.rotation.clone();
        this.updateMatrices();
    }

    /**
     * Update controlled object position to match gimbal
     */
    syncToObject(): void {
        this.controlledObject.position = this.position.clone();
        this.controlledObject.updateMatrices();
    }
}
