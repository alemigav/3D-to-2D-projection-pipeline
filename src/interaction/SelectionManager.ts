/**
 * SelectionManager class
 * Handles object selection and highlighting in the 3D scene
 */
import { Vector3 } from '../math/Vector3';
import { Scene } from '../scene/Scene';
import { SceneNode } from '../scene/SceneNode';
import { Mesh } from '../scene/Mesh';
import { Camera } from '../core/Camera';
import { Renderer } from '../core/Renderer';

export class SelectionManager {
    private scene: Scene;
    private camera: Camera;
    private renderer: Renderer;
    private canvas: HTMLCanvasElement;
    
    // Currently selected object
    private selectedNode: SceneNode | null = null;
    
    // Selection highlight color
    private highlightColor: Vector3 = new Vector3(0.2, 0.6, 1.0); // Blue highlight
    
    // Original material of selected object (to restore when deselected)
    private originalMaterial: any | null = null;
    
    /**
     * Create a new SelectionManager
     * @param scene Scene to manage selections for
     * @param camera Camera for raycasting
     * @param renderer Renderer for picking
     * @param canvas Canvas element for mouse events
     */
    constructor(scene: Scene, camera: Camera, renderer: Renderer, canvas: HTMLCanvasElement) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.canvas = canvas;
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners for selection
     */
    private setupEventListeners(): void {
        // Mouse click for selection
        this.canvas.addEventListener('click', (event: MouseEvent) => {
            // Only handle left clicks for selection
            if (event.button !== 0) return;
            
            // Get normalized device coordinates
            const rect = this.canvas.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / this.canvas.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / this.canvas.height) * 2 + 1;
            
            // Perform ray casting
            this.selectObjectAt(x, y);
            
            // Prevent default behavior
            event.preventDefault();
        });
    }
    
    /**
     * Select an object at the given normalized device coordinates
     * @param ndcX X coordinate in normalized device coordinates (-1 to 1)
     * @param ndcY Y coordinate in normalized device coordinates (-1 to 1)
     */
    private selectObjectAt(ndcX: number, ndcY: number): void {
        // Create ray from camera through the clicked point
        const ray = this.createRayFromCamera(ndcX, ndcY);
        
        // Find intersections with objects in the scene
        const intersectedNode = this.findIntersectedNode(ray);
        
        // If we found an intersection, select the object
        if (intersectedNode) {
            this.selectNode(intersectedNode);
        } else {
            // If no intersection, deselect current selection
            this.clearSelection();
        }
    }
    
    /**
     * Create a ray from the camera through a point in normalized device coordinates
     * @param ndcX X coordinate in normalized device coordinates (-1 to 1)
     * @param ndcY Y coordinate in normalized device coordinates (-1 to 1)
     * @returns Ray origin and direction
     */
    private createRayFromCamera(ndcX: number, ndcY: number): { origin: Vector3, direction: Vector3 } {
        // Get camera position (ray origin)
        const origin = this.camera.position.clone();
        
        // Calculate ray direction
        // This is a simplified version - in a real implementation, we would use the camera's
        // projection and view matrices to calculate the exact ray direction
        
        // For perspective camera:
        // 1. Create a point in clip space
        const clipX = ndcX;
        const clipY = ndcY;
        const clipZ = -1.0; // Near plane
        
        // 2. Transform to view space
        const invProjection = this.camera.projectionMatrix.inverse();
        const viewSpacePos = invProjection.transformVector(new Vector3(clipX, clipY, clipZ));
        
        // 3. Transform to world space
        const invView = this.camera.viewMatrix.inverse();
        const worldSpacePos = invView.transformVector(viewSpacePos);
        
        // 4. Calculate direction from camera to this point
        const direction = worldSpacePos.subtract(origin).normalize();
        
        return { origin, direction };
    }
    
    /**
     * Find the first node that intersects with the given ray
     * @param ray Ray to check intersections with
     * @returns The first intersected node, or null if none
     */
    private findIntersectedNode(ray: { origin: Vector3, direction: Vector3 }): SceneNode | null {
        // This is a simplified implementation
        // In a real implementation, we would check for intersections with all objects in the scene
        // and return the closest one
        
        let closestNode: SceneNode | null = null;
        let closestDistance = Infinity;
        
        // Helper function to recursively check nodes
        const checkNode = (node: SceneNode): void => {
            // Only check Mesh objects for now
            if (node instanceof Mesh) {
                // Simple bounding sphere intersection test
                const center = node.getGeometry().getBoundingCenter();
                const radius = node.getGeometry().getBoundingRadius();
                
                // Transform center to world space
                const worldCenter = node.worldMatrix.transformVector(center);
                
                // Calculate closest point on ray to sphere center
                const oc = worldCenter.subtract(ray.origin);
                const tca = oc.dot(ray.direction);
                
                // If closest point is behind the ray origin, skip
                if (tca < 0) return;
                
                const d2 = oc.dot(oc) - tca * tca;
                const radiusSquared = radius * radius;
                
                // If ray misses the sphere, skip
                if (d2 > radiusSquared) return;
                
                // Calculate intersection distance
                const thc = Math.sqrt(radiusSquared - d2);
                const t0 = tca - thc;
                const t1 = tca + thc;
                
                // Get the closest intersection in front of the ray
                let t = t0;
                if (t < 0) t = t1;
                if (t < 0) return;
                
                // If this is closer than previous intersections, update
                if (t < closestDistance) {
                    closestDistance = t;
                    closestNode = node;
                }
            }
            
            // Check children
            for (const child of node.children) {
                checkNode(child);
            }
        };
        
        // Start checking from the scene root
        checkNode(this.scene.getRoot());
        
        return closestNode;
    }
    
    /**
     * Select a node
     * @param node Node to select
     */
    selectNode(node: SceneNode): void {
        // If we already have a selection, deselect it first
        if (this.selectedNode) {
            this.clearSelection();
        }
        
        // Set the new selection
        this.selectedNode = node;
        
        // Highlight the selected node
        if (node instanceof Mesh) {
            // Store the original material
            this.originalMaterial = node.getMaterial();
            
            // Create a highlighted material
            const highlightedMaterial = { ...this.originalMaterial };
            highlightedMaterial.color = this.highlightColor;
            
            // Apply the highlighted material
            node.setMaterial(highlightedMaterial);
        }
        
        // Dispatch a custom event
        const event = new CustomEvent('object-selected', { detail: { node } });
        this.canvas.dispatchEvent(event);
    }
    
    /**
     * Clear the current selection
     */
    clearSelection(): void {
        // If we have a selection and it's a mesh, restore its original material
        if (this.selectedNode instanceof Mesh && this.originalMaterial) {
            this.selectedNode.setMaterial(this.originalMaterial);
        }
        
        // Clear the selection
        this.selectedNode = null;
        this.originalMaterial = null;
        
        // Dispatch a custom event
        const event = new CustomEvent('object-deselected');
        this.canvas.dispatchEvent(event);
    }
    
    /**
     * Get the currently selected node
     */
    getSelectedNode(): SceneNode | null {
        return this.selectedNode;
    }
    
    /**
     * Check if a node is currently selected
     * @param node Node to check
     */
    isSelected(node: SceneNode): boolean {
        return this.selectedNode === node;
    }
    
    /**
     * Set the highlight color
     * @param color Highlight color
     */
    setHighlightColor(color: Vector3): void {
        this.highlightColor = color;
        
        // If we have a selection, update its highlight
        if (this.selectedNode instanceof Mesh && this.originalMaterial) {
            const highlightedMaterial = { ...this.originalMaterial };
            highlightedMaterial.color = this.highlightColor;
            this.selectedNode.setMaterial(highlightedMaterial);
        }
    }
}
