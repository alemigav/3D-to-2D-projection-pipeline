/**
 * Scene class
 * Manages the scene graph and objects in the 3D scene
 */
import { SceneNode } from './SceneNode';
import { Vector3 } from '../math/Vector3';
export declare class Scene {
    private root;
    private backgroundColor;
    private ambientLight;
    private lights;
    /**
     * Create a new Scene
     */
    constructor();
    /**
     * Set up default lights
     */
    private setupDefaultLights;
    /**
     * Add a node to the scene
     * @param node Node to add
     * @param parent Parent node (default: root)
     */
    addNode(node: SceneNode, parent?: SceneNode): void;
    /**
     * Remove a node from the scene
     * @param node Node to remove
     */
    removeNode(node: SceneNode): void;
    /**
     * Find a node by name
     * @param name Name of the node to find
     */
    findNodeByName(name: string): SceneNode | null;
    /**
     * Update the scene
     * @param deltaTime Time since last frame in seconds
     */
    update(deltaTime: number): void;
    /**
     * Update a node and its children
     * @param node Node to update
     * @param deltaTime Time since last frame in seconds
     */
    private updateNode;
    /**
     * Traverse the scene graph and call a function for each node
     * @param callback Function to call for each node
     */
    traverse(callback: (node: SceneNode) => void): void;
    /**
     * Get the root node
     */
    getRoot(): SceneNode;
    /**
     * Get the background color
     */
    getBackgroundColor(): Vector3;
    /**
     * Set the background color
     * @param color Background color
     */
    setBackgroundColor(color: Vector3): void;
    /**
     * Get the ambient light
     */
    getAmbientLight(): Vector3;
    /**
     * Set the ambient light
     * @param color Ambient light color
     */
    setAmbientLight(color: Vector3): void;
    /**
     * Get the lights
     */
    getLights(): any[];
    /**
     * Add a light to the scene
     * @param light Light to add
     */
    addLight(light: any): void;
    /**
     * Remove a light from the scene
     * @param light Light to remove
     */
    removeLight(light: any): void;
    /**
     * Clear all lights from the scene
     */
    clearLights(): void;
}
