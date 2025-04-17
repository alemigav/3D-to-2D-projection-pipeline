/**
 * SelectionManager class
 * Handles object selection and highlighting in the 3D scene
 */
import { Vector3 } from '../math/Vector3';
import { Scene } from '../scene/Scene';
import { SceneNode } from '../scene/SceneNode';
import { Camera } from '../core/Camera';
import { Renderer } from '../core/Renderer';
export declare class SelectionManager {
    private scene;
    private camera;
    private renderer;
    private canvas;
    private selectedNode;
    private highlightColor;
    private originalMaterial;
    /**
     * Create a new SelectionManager
     * @param scene Scene to manage selections for
     * @param camera Camera for raycasting
     * @param renderer Renderer for picking
     * @param canvas Canvas element for mouse events
     */
    constructor(scene: Scene, camera: Camera, renderer: Renderer, canvas: HTMLCanvasElement);
    /**
     * Set up event listeners for selection
     */
    private setupEventListeners;
    /**
     * Select an object at the given normalized device coordinates
     * @param ndcX X coordinate in normalized device coordinates (-1 to 1)
     * @param ndcY Y coordinate in normalized device coordinates (-1 to 1)
     */
    private selectObjectAt;
    /**
     * Create a ray from the camera through a point in normalized device coordinates
     * @param ndcX X coordinate in normalized device coordinates (-1 to 1)
     * @param ndcY Y coordinate in normalized device coordinates (-1 to 1)
     * @returns Ray origin and direction
     */
    private createRayFromCamera;
    /**
     * Find the first node that intersects with the given ray
     * @param ray Ray to check intersections with
     * @returns The first intersected node, or null if none
     */
    private findIntersectedNode;
    /**
     * Select a node
     * @param node Node to select
     */
    selectNode(node: SceneNode): void;
    /**
     * Clear the current selection
     */
    clearSelection(): void;
    /**
     * Get the currently selected node
     */
    getSelectedNode(): SceneNode | null;
    /**
     * Check if a node is currently selected
     * @param node Node to check
     */
    isSelected(node: SceneNode): boolean;
    /**
     * Set the highlight color
     * @param color Highlight color
     */
    setHighlightColor(color: Vector3): void;
}
