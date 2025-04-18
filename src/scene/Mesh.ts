/**
 * Mesh class
 * Combines geometry and material for rendering
 */
import { SceneNode } from './SceneNode';
import { Geometry } from '../core/Geometry';
import { Renderer } from '../core/Renderer';
import { Vector3 } from '../math/Vector3';

export enum MaterialType {
    Basic,
    Wireframe
}

export interface Material {
    type: MaterialType;
    color: Vector3;
    wireframeColor?: Vector3;
    wireframe?: boolean;
    opacity?: number;
}

export class Mesh extends SceneNode {
    private geometry: Geometry;
    private material: Material;
    private isUploaded: boolean = false;
    
    // Local axes (gimbal) for manipulation
    private localAxes: Mesh | null = null;
    
    /**
     * Create a new Mesh
     * @param geometry Geometry to use
     * @param material Material to use
     * @param name Optional name for the mesh
     * @param createGimbal Whether to create gimbal axes for this mesh
     */
    constructor(geometry: Geometry, material: Material, name: string = '', createGimbal: boolean = true) {
        super(name || geometry.name);
        this.geometry = geometry;
        this.material = material;
        
        // Create local axes (gimbal) for manipulation
        if (createGimbal) {
            this.createLocalAxes();
        }
    }
    
    /**
     * Create local axes (gimbal) for this mesh
     */
    private createLocalAxes(): void {
        // Create gimbal axes mesh
        this.localAxes = Mesh.createGimbalAxes(0.5);
        this.localAxes.name = 'local_axes';
        
        // Add as child
        this.addChild(this.localAxes);
    }
    
    /**
     * Set the visibility of the local axes (gimbal)
     * @param visible Whether the local axes should be visible
     */
    setLocalAxesVisibility(visible: boolean): void {
        if (this.localAxes) {
            this.localAxes.visible = visible;
        }
    }
    
    /**
     * Get the geometry
     */
    getGeometry(): Geometry {
        return this.geometry;
    }
    
    /**
     * Set the geometry
     * @param geometry Geometry to use
     */
    setGeometry(geometry: Geometry): void {
        this.geometry = geometry;
        this.isUploaded = false;
    }
    
    /**
     * Get the material
     */
    getMaterial(): Material {
        return this.material;
    }
    
    /**
     * Set the material
     * @param material Material to use
     */
    setMaterial(material: Material): void {
        this.material = material;
    }
    
    /**
     * Render the mesh
     * @param renderer Renderer to use
     */
    render(renderer: Renderer): void {
        const gl = renderer.getContext();
        if (!gl) return;
        
        // Upload geometry data if needed
        if (!this.isUploaded) {
            this.geometry.upload(renderer);
            this.isUploaded = true;
        }
        
        // Set material properties
        if (this.material.type === MaterialType.Wireframe) {
            // Use wireframe shader
            renderer.useShaderProgram('wireframe');
            
            // Set color
            renderer.setUniform('uColor', this.material.wireframeColor || this.material.color);
        } else {
            // Use basic shader
            renderer.useShaderProgram('basic');
            
            // Set material properties
            renderer.setUniform('uColor', this.material.color);
            
            // Set lighting properties
            renderer.setUniform('uLightDirection', new Vector3(1, -1, 1).normalize());
            renderer.setUniform('uLightColor', new Vector3(1, 1, 1));
            renderer.setUniform('uAmbientColor', new Vector3(0.2, 0.2, 0.2));
        }
        
        // Set model matrix
        renderer.setUniform('uModelMatrix', this.worldMatrix);
        
        // Bind geometry buffers
        this.geometry.bind(renderer, gl);
        
        // Draw geometry
        this.geometry.draw(gl);
    }
    
    /**
     * Create a wireframe cube mesh
     * @param size Size of the cube
     * @param color Color of the wireframe
     */
    static createWireframeCube(size: number = 1, color: Vector3 = new Vector3(0, 0, 0)): Mesh {
        const geometry = Geometry.createWireframeCube(size);
        const material: Material = {
            type: MaterialType.Wireframe,
            color: color
        };
        
        return new Mesh(geometry, material, 'wireframe_cube', true);
    }
    
    /**
     * Create a solid cube mesh
     * @param size Size of the cube
     * @param color Color of the cube
     */
    static createCube(size: number = 1, color: Vector3 = new Vector3(0.8, 0.8, 0.8)): Mesh {
        const geometry = Geometry.createCube(size);
        const material: Material = {
            type: MaterialType.Basic,
            color: color
        };
        
        return new Mesh(geometry, material, 'cube', true);
    }
    
    /**
     * Create coordinate axes mesh
     * @param size Size of the axes
     */
    static createCoordinateAxes(size: number = 1): Mesh {
        const geometry = Geometry.createCoordinateAxes(size);
        const material: Material = {
            type: MaterialType.Wireframe,
            color: new Vector3(1, 1, 1) // This will be overridden by vertex colors
        };
        
        // Pass createGimbal=false to prevent infinite recursion
        return new Mesh(geometry, material, 'coordinate_axes', false);
    }
    
    /**
     * Create gimbal axes mesh with arrow heads
     * @param size Size of the axes
     * @param arrowSize Size of the arrow heads
     */
    static createGimbalAxes(size: number = 1, arrowSize: number = 0.1): Mesh {
        const geometry = Geometry.createGimbalAxes(size, arrowSize);
        const material: Material = {
            type: MaterialType.Basic, // Use basic material to render triangles
            color: new Vector3(1, 1, 1) // This will be overridden by vertex colors
        };
        
        // Pass createGimbal=false to prevent infinite recursion
        return new Mesh(geometry, material, 'gimbal_axes', false);
    }
    
    /**
     * Create a wireframe pyramid mesh
     * @param size Base size of the pyramid
     * @param height Height of the pyramid
     * @param color Color of the wireframe
     */
    static createWireframePyramid(
        size: number = 1, 
        height: number = 1.5, 
        color: Vector3 = new Vector3(0, 0, 0)
    ): Mesh {
        const geometry = Geometry.createWireframePyramid(size, height);
        const material: Material = {
            type: MaterialType.Wireframe,
            color: color
        };
        
        return new Mesh(geometry, material, 'wireframe_pyramid', true);
    }
    
    /**
     * Create a solid pyramid mesh
     * @param size Base size of the pyramid
     * @param height Height of the pyramid
     * @param color Color of the pyramid
     */
    static createPyramid(
        size: number = 1, 
        height: number = 1.5, 
        color: Vector3 = new Vector3(0.8, 0.8, 0.8)
    ): Mesh {
        const geometry = Geometry.createPyramid(size, height);
        const material: Material = {
            type: MaterialType.Basic,
            color: color
        };
        
        return new Mesh(geometry, material, 'pyramid', true);
    }
    
    /**
     * Create a wireframe octahedron mesh
     * @param size Size of the octahedron
     * @param color Color of the wireframe
     */
    static createWireframeOctahedron(
        size: number = 1, 
        color: Vector3 = new Vector3(0, 0, 0)
    ): Mesh {
        const geometry = Geometry.createWireframeOctahedron(size);
        const material: Material = {
            type: MaterialType.Wireframe,
            color: color
        };
        
        return new Mesh(geometry, material, 'wireframe_octahedron', true);
    }
    
    /**
     * Create a solid octahedron mesh
     * @param size Size of the octahedron
     * @param color Color of the octahedron
     */
    static createOctahedron(
        size: number = 1, 
        color: Vector3 = new Vector3(0.8, 0.8, 0.8)
    ): Mesh {
        const geometry = Geometry.createOctahedron(size);
        const material: Material = {
            type: MaterialType.Basic,
            color: color
        };
        
        return new Mesh(geometry, material, 'octahedron', true);
    }
}
