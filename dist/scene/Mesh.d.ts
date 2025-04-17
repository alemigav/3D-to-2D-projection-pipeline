/**
 * Mesh class
 * Combines geometry and material for rendering
 */
import { SceneNode } from './SceneNode';
import { Geometry } from '../core/Geometry';
import { Renderer } from '../core/Renderer';
import { Vector3 } from '../math/Vector3';
export declare enum MaterialType {
    Basic = 0,
    Wireframe = 1
}
export interface Material {
    type: MaterialType;
    color: Vector3;
    wireframeColor?: Vector3;
    wireframe?: boolean;
    opacity?: number;
}
export declare class Mesh extends SceneNode {
    private geometry;
    private material;
    private isUploaded;
    /**
     * Create a new Mesh
     * @param geometry Geometry to use
     * @param material Material to use
     * @param name Optional name for the mesh
     */
    constructor(geometry: Geometry, material: Material, name?: string);
    /**
     * Get the geometry
     */
    getGeometry(): Geometry;
    /**
     * Set the geometry
     * @param geometry Geometry to use
     */
    setGeometry(geometry: Geometry): void;
    /**
     * Get the material
     */
    getMaterial(): Material;
    /**
     * Set the material
     * @param material Material to use
     */
    setMaterial(material: Material): void;
    /**
     * Render the mesh
     * @param renderer Renderer to use
     */
    render(renderer: Renderer): void;
    /**
     * Create a wireframe cube mesh
     * @param size Size of the cube
     * @param color Color of the wireframe
     */
    static createWireframeCube(size?: number, color?: Vector3): Mesh;
    /**
     * Create a solid cube mesh
     * @param size Size of the cube
     * @param color Color of the cube
     */
    static createCube(size?: number, color?: Vector3): Mesh;
    /**
     * Create coordinate axes mesh
     * @param size Size of the axes
     */
    static createCoordinateAxes(size?: number): Mesh;
    /**
     * Create a wireframe pyramid mesh
     * @param size Base size of the pyramid
     * @param height Height of the pyramid
     * @param color Color of the wireframe
     */
    static createWireframePyramid(size?: number, height?: number, color?: Vector3): Mesh;
    /**
     * Create a solid pyramid mesh
     * @param size Base size of the pyramid
     * @param height Height of the pyramid
     * @param color Color of the pyramid
     */
    static createPyramid(size?: number, height?: number, color?: Vector3): Mesh;
    /**
     * Create a wireframe octahedron mesh
     * @param size Size of the octahedron
     * @param color Color of the wireframe
     */
    static createWireframeOctahedron(size?: number, color?: Vector3): Mesh;
    /**
     * Create a solid octahedron mesh
     * @param size Size of the octahedron
     * @param color Color of the octahedron
     */
    static createOctahedron(size?: number, color?: Vector3): Mesh;
}
