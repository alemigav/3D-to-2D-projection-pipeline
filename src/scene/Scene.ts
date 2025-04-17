/**
 * Scene class
 * Manages the scene graph and objects in the 3D scene
 */
import { SceneNode } from './SceneNode';
import { Vector3 } from '../math/Vector3';

// Note: There's a circular dependency between Scene and SceneNode
// TypeScript can handle this at compile time, but we need to be careful about initialization order at runtime

export class Scene {
    // Root node of the scene graph
    private root: SceneNode;
    
    // Scene settings
    private backgroundColor: Vector3 = new Vector3(0.9, 0.9, 0.9);
    private ambientLight: Vector3 = new Vector3(0.2, 0.2, 0.2);
    
    // Lights
    private lights: any[] = [];
    
    /**
     * Create a new Scene
     */
    constructor() {
        // Create the root node
        this.root = new SceneNode();
        this.root.name = 'root';
        
        // Set up default lights
        this.setupDefaultLights();
        
        console.log('Scene created');
    }
    
    /**
     * Set up default lights
     */
    private setupDefaultLights(): void {
        // Add a default directional light
        this.lights.push({
            type: 'directional',
            direction: new Vector3(1, -1, 1).normalize(),
            color: new Vector3(1, 1, 1),
            intensity: 0.8
        });
        
        // Add a secondary directional light
        this.lights.push({
            type: 'directional',
            direction: new Vector3(-1, -0.5, -1).normalize(),
            color: new Vector3(0.3, 0.3, 0.5),
            intensity: 0.3
        });
    }
    
    /**
     * Add a node to the scene
     * @param node Node to add
     * @param parent Parent node (default: root)
     */
    addNode(node: SceneNode, parent?: SceneNode): void {
        if (parent) {
            parent.addChild(node);
        } else {
            this.root.addChild(node);
        }
    }
    
    /**
     * Remove a node from the scene
     * @param node Node to remove
     */
    removeNode(node: SceneNode): void {
        // If the node has a parent, remove it from the parent
        if (node.parent) {
            node.parent.removeChild(node);
        }
    }
    
    /**
     * Find a node by name
     * @param name Name of the node to find
     */
    findNodeByName(name: string): SceneNode | null {
        // Helper function to recursively search for a node
        const findNode = (node: SceneNode, name: string): SceneNode | null => {
            if (node.name === name) {
                return node;
            }
            
            for (const child of node.children) {
                const found = findNode(child, name);
                if (found) {
                    return found;
                }
            }
            
            return null;
        };
        
        return findNode(this.root, name);
    }
    
    /**
     * Update the scene
     * @param deltaTime Time since last frame in seconds
     */
    update(deltaTime: number): void {
        // Update the scene graph
        this.updateNode(this.root, deltaTime);
    }
    
    /**
     * Update a node and its children
     * @param node Node to update
     * @param deltaTime Time since last frame in seconds
     */
    private updateNode(node: SceneNode, deltaTime: number): void {
        // Update the node
        node.update(deltaTime);
        
        // Update the node's world matrix
        node.updateMatrices();
        
        // Update the node's children
        for (const child of node.children) {
            this.updateNode(child, deltaTime);
        }
    }
    
    /**
     * Traverse the scene graph and call a function for each node
     * @param callback Function to call for each node
     */
    traverse(callback: (node: SceneNode) => void): void {
        // Helper function to recursively traverse the scene graph
        const traverseNode = (node: SceneNode): void => {
            callback(node);
            
            for (const child of node.children) {
                traverseNode(child);
            }
        };
        
        traverseNode(this.root);
    }
    
    /**
     * Get the root node
     */
    getRoot(): SceneNode {
        return this.root;
    }
    
    /**
     * Get the background color
     */
    getBackgroundColor(): Vector3 {
        return this.backgroundColor;
    }
    
    /**
     * Set the background color
     * @param color Background color
     */
    setBackgroundColor(color: Vector3): void {
        this.backgroundColor = color;
    }
    
    /**
     * Get the ambient light
     */
    getAmbientLight(): Vector3 {
        return this.ambientLight;
    }
    
    /**
     * Set the ambient light
     * @param color Ambient light color
     */
    setAmbientLight(color: Vector3): void {
        this.ambientLight = color;
    }
    
    /**
     * Get the lights
     */
    getLights(): any[] {
        return this.lights;
    }
    
    /**
     * Add a light to the scene
     * @param light Light to add
     */
    addLight(light: any): void {
        this.lights.push(light);
    }
    
    /**
     * Remove a light from the scene
     * @param light Light to remove
     */
    removeLight(light: any): void {
        const index = this.lights.indexOf(light);
        if (index !== -1) {
            this.lights.splice(index, 1);
        }
    }
    
    /**
     * Clear all lights from the scene
     */
    clearLights(): void {
        this.lights = [];
    }
}
