/**
 * Geometry class
 * Manages vertex data and drawing operations
 */
import { Vector3 } from '../math/Vector3';
import { Renderer } from './Renderer';
export declare enum PrimitiveType {
    POINTS,
    LINES,
    LINE_STRIP,
    LINE_LOOP,
    TRIANGLES,
    TRIANGLE_STRIP,
    TRIANGLE_FAN
}
export declare class Geometry {
    name: string;
    private positions;
    private normals;
    private colors;
    private indices;
    private positionBufferName;
    private normalBufferName;
    private colorBufferName;
    private indexBufferName;
    private primitiveType;
    private vertexCount;
    private indexCount;
    private boundingCenter;
    private boundingRadius;
    /**
     * Create a new Geometry
     * @param name Optional name for the geometry
     */
    constructor(name?: string);
    /**
     * Set vertex positions
     * @param positions Vertex positions (x, y, z, x, y, z, ...)
     */
    setPositions(positions: Float32Array): void;
    /**
     * Set vertex normals
     * @param normals Vertex normals (x, y, z, x, y, z, ...)
     */
    setNormals(normals: Float32Array): void;
    /**
     * Set vertex colors
     * @param colors Vertex colors (r, g, b, r, g, b, ...)
     */
    setColors(colors: Float32Array): void;
    /**
     * Set indices
     * @param indices Vertex indices
     */
    setIndices(indices: Uint16Array): void;
    /**
     * Set primitive type
     * @param type Primitive type
     */
    setPrimitiveType(type: PrimitiveType): void;
    /**
     * Calculate bounding information
     */
    private calculateBounds;
    /**
     * Upload geometry data to the GPU
     * @param renderer Renderer to use
     */
    upload(renderer: Renderer): void;
    /**
     * Bind geometry buffers for rendering
     * @param renderer Renderer to use
     * @param gl WebGL context
     */
    bind(renderer: Renderer, gl: WebGLRenderingContext | WebGL2RenderingContext): void;
    /**
     * Draw the geometry
     * @param gl WebGL context
     */
    draw(gl: WebGLRenderingContext | WebGL2RenderingContext): void;
    /**
     * Get the bounding center
     */
    getBoundingCenter(): Vector3;
    /**
     * Get the bounding radius
     */
    getBoundingRadius(): number;
    /**
     * Create a cube geometry
     * @param size Size of the cube
     */
    static createCube(size?: number): Geometry;
    /**
     * Create a wireframe cube geometry
     * @param size Size of the cube
     */
    static createWireframeCube(size?: number): Geometry;
    /**
     * Create coordinate axes geometry
     * @param size Size of the axes
     */
    static createCoordinateAxes(size?: number): Geometry;
    /**
     * Create coordinate axes geometry with arrow heads (gimbals)
     * @param size Size of the axes
     * @param arrowSize Size of the arrow heads
     */
    static createGimbalAxes(size?: number, arrowSize?: number): Geometry;
    /**
     * Create a pyramid geometry
     * @param size Base size of the pyramid
     * @param height Height of the pyramid
     */
    static createPyramid(size?: number, height?: number): Geometry;
    /**
     * Create a wireframe pyramid geometry
     * @param size Base size of the pyramid
     * @param height Height of the pyramid
     */
    static createWireframePyramid(size?: number, height?: number): Geometry;
    /**
     * Create an octahedron geometry
     * @param size Size of the octahedron
     */
    static createOctahedron(size?: number): Geometry;
    /**
     * Create a wireframe octahedron geometry
     * @param size Size of the octahedron
     */
    static createWireframeOctahedron(size?: number): Geometry;
}
