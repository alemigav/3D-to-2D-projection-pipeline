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
    
    /**
     * Create a new Mesh
     * @param geometry Geometry to use
     * @param material Material to use
     * @param name Optional name for the mesh
     */
    constructor(geometry: Geometry, material: Material, name: string = '') {
        super(name || geometry.name);
        this.geometry = geometry;
        this.material = material;
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
        
        return new Mesh(geometry, material, 'wireframe_cube');
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
        
        return new Mesh(geometry, material, 'cube');
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
        
        return new Mesh(geometry, material, 'coordinate_axes');
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
        
        return new Mesh(geometry, material, 'wireframe_pyramid');
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
        
        return new Mesh(geometry, material, 'pyramid');
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
        
        return new Mesh(geometry, material, 'wireframe_octahedron');
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
        
        return new Mesh(geometry, material, 'octahedron');
    }
}
