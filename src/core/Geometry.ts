/**
 * Geometry class
 * Manages vertex data and drawing operations
 */
import { Vector3 } from '../math/Vector3';
import { Renderer } from './Renderer';

export enum PrimitiveType {
    POINTS = WebGLRenderingContext.POINTS,
    LINES = WebGLRenderingContext.LINES,
    LINE_STRIP = WebGLRenderingContext.LINE_STRIP,
    LINE_LOOP = WebGLRenderingContext.LINE_LOOP,
    TRIANGLES = WebGLRenderingContext.TRIANGLES,
    TRIANGLE_STRIP = WebGLRenderingContext.TRIANGLE_STRIP,
    TRIANGLE_FAN = WebGLRenderingContext.TRIANGLE_FAN
}

export class Geometry {
    // Geometry name
    name: string = '';
    
    // Vertex data
    private positions: Float32Array | null = null;
    private normals: Float32Array | null = null;
    private colors: Float32Array | null = null;
    private indices: Uint16Array | null = null;
    
    // Buffer names
    private positionBufferName: string = '';
    private normalBufferName: string = '';
    private colorBufferName: string = '';
    private indexBufferName: string = '';
    
    // Drawing properties
    private primitiveType: PrimitiveType = PrimitiveType.TRIANGLES;
    private vertexCount: number = 0;
    private indexCount: number = 0;
    
    // Bounding information
    private boundingCenter: Vector3 = new Vector3();
    private boundingRadius: number = 0;
    
    /**
     * Create a new Geometry
     * @param name Optional name for the geometry
     */
    constructor(name: string = '') {
        this.name = name;
    }
    
    /**
     * Set vertex positions
     * @param positions Vertex positions (x, y, z, x, y, z, ...)
     */
    setPositions(positions: Float32Array): void {
        this.positions = positions;
        this.vertexCount = positions.length / 3;
        
        // Calculate bounding information
        this.calculateBounds();
    }
    
    /**
     * Set vertex normals
     * @param normals Vertex normals (x, y, z, x, y, z, ...)
     */
    setNormals(normals: Float32Array): void {
        this.normals = normals;
    }
    
    /**
     * Set vertex colors
     * @param colors Vertex colors (r, g, b, r, g, b, ...)
     */
    setColors(colors: Float32Array): void {
        this.colors = colors;
    }
    
    /**
     * Set indices
     * @param indices Vertex indices
     */
    setIndices(indices: Uint16Array): void {
        this.indices = indices;
        this.indexCount = indices.length;
    }
    
    /**
     * Set primitive type
     * @param type Primitive type
     */
    setPrimitiveType(type: PrimitiveType): void {
        this.primitiveType = type;
    }
    
    /**
     * Calculate bounding information
     */
    private calculateBounds(): void {
        if (!this.positions || this.positions.length === 0) {
            this.boundingCenter = new Vector3();
            this.boundingRadius = 0;
            return;
        }
        
        // Calculate center
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        
        for (let i = 0; i < this.positions.length; i += 3) {
            const x = this.positions[i];
            const y = this.positions[i + 1];
            const z = this.positions[i + 2];
            
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            minZ = Math.min(minZ, z);
            
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            maxZ = Math.max(maxZ, z);
        }
        
        this.boundingCenter = new Vector3(
            (minX + maxX) / 2,
            (minY + maxY) / 2,
            (minZ + maxZ) / 2
        );
        
        // Calculate radius
        let maxDistSq = 0;
        
        for (let i = 0; i < this.positions.length; i += 3) {
            const x = this.positions[i] - this.boundingCenter.x;
            const y = this.positions[i + 1] - this.boundingCenter.y;
            const z = this.positions[i + 2] - this.boundingCenter.z;
            
            const distSq = x * x + y * y + z * z;
            maxDistSq = Math.max(maxDistSq, distSq);
        }
        
        this.boundingRadius = Math.sqrt(maxDistSq);
    }
    
    /**
     * Upload geometry data to the GPU
     * @param renderer Renderer to use
     */
    upload(renderer: Renderer): void {
        // Generate buffer names
        this.positionBufferName = `geometry_${this.name}_position`;
        this.normalBufferName = `geometry_${this.name}_normal`;
        this.colorBufferName = `geometry_${this.name}_color`;
        this.indexBufferName = `geometry_${this.name}_index`;
        
        // Upload positions
        if (this.positions) {
            renderer.createBuffer(
                this.positionBufferName,
                WebGLRenderingContext.ARRAY_BUFFER,
                this.positions,
                WebGLRenderingContext.STATIC_DRAW
            );
        }
        
        // Upload normals
        if (this.normals) {
            renderer.createBuffer(
                this.normalBufferName,
                WebGLRenderingContext.ARRAY_BUFFER,
                this.normals,
                WebGLRenderingContext.STATIC_DRAW
            );
        }
        
        // Upload colors
        if (this.colors) {
            renderer.createBuffer(
                this.colorBufferName,
                WebGLRenderingContext.ARRAY_BUFFER,
                this.colors,
                WebGLRenderingContext.STATIC_DRAW
            );
        }
        
        // Upload indices
        if (this.indices) {
            renderer.createBuffer(
                this.indexBufferName,
                WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,
                this.indices,
                WebGLRenderingContext.STATIC_DRAW
            );
        }
    }
    
    /**
     * Bind geometry buffers for rendering
     * @param renderer Renderer to use
     * @param gl WebGL context
     */
    bind(renderer: Renderer, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
        // Bind position buffer
        if (this.positions) {
            renderer.bindBuffer(this.positionBufferName);
            
            const positionAttribLocation = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), 'aPosition');
            if (positionAttribLocation !== -1) {
                gl.enableVertexAttribArray(positionAttribLocation);
                gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
            }
        }
        
        // Bind normal buffer
        if (this.normals) {
            renderer.bindBuffer(this.normalBufferName);
            
            const normalAttribLocation = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), 'aNormal');
            if (normalAttribLocation !== -1) {
                gl.enableVertexAttribArray(normalAttribLocation);
                gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);
            }
        }
        
        // Bind color buffer
        if (this.colors) {
            renderer.bindBuffer(this.colorBufferName);
            
            const colorAttribLocation = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), 'aColor');
            if (colorAttribLocation !== -1) {
                gl.enableVertexAttribArray(colorAttribLocation);
                gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, false, 0, 0);
            }
        }
        
        // Bind index buffer
        if (this.indices) {
            renderer.bindBuffer(this.indexBufferName, WebGLRenderingContext.ELEMENT_ARRAY_BUFFER);
        }
    }
    
    /**
     * Draw the geometry
     * @param gl WebGL context
     */
    draw(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
        if (this.indices) {
            // Draw indexed geometry
            gl.drawElements(this.primitiveType, this.indexCount, gl.UNSIGNED_SHORT, 0);
        } else {
            // Draw non-indexed geometry
            gl.drawArrays(this.primitiveType, 0, this.vertexCount);
        }
    }
    
    /**
     * Get the bounding center
     */
    getBoundingCenter(): Vector3 {
        return this.boundingCenter;
    }
    
    /**
     * Get the bounding radius
     */
    getBoundingRadius(): number {
        return this.boundingRadius;
    }
    
    /**
     * Create a cube geometry
     * @param size Size of the cube
     */
    static createCube(size: number = 1): Geometry {
        const geometry = new Geometry('cube');
        
        // Half size
        const s = size / 2;
        
        // Vertex positions (8 vertices)
        const positions = new Float32Array([
            // Front face
            -s, -s,  s,  // 0: bottom-left-front
             s, -s,  s,  // 1: bottom-right-front
             s,  s,  s,  // 2: top-right-front
            -s,  s,  s,  // 3: top-left-front
            
            // Back face
            -s, -s, -s,  // 4: bottom-left-back
             s, -s, -s,  // 5: bottom-right-back
             s,  s, -s,  // 6: top-right-back
            -s,  s, -s   // 7: top-left-back
        ]);
        
        // Vertex normals
        const normals = new Float32Array([
            // Front face
             0,  0,  1,  // 0: bottom-left-front
             0,  0,  1,  // 1: bottom-right-front
             0,  0,  1,  // 2: top-right-front
             0,  0,  1,  // 3: top-left-front
            
            // Back face
             0,  0, -1,  // 4: bottom-left-back
             0,  0, -1,  // 5: bottom-right-back
             0,  0, -1,  // 6: top-right-back
             0,  0, -1   // 7: top-left-back
        ]);
        
        // Indices for triangles (6 faces, 2 triangles per face, 3 indices per triangle)
        const indices = new Uint16Array([
            // Front face
            0, 1, 2,
            0, 2, 3,
            
            // Back face
            5, 4, 7,
            5, 7, 6,
            
            // Top face
            3, 2, 6,
            3, 6, 7,
            
            // Bottom face
            4, 5, 1,
            4, 1, 0,
            
            // Right face
            1, 5, 6,
            1, 6, 2,
            
            // Left face
            4, 0, 3,
            4, 3, 7
        ]);
        
        geometry.setPositions(positions);
        geometry.setNormals(normals);
        geometry.setIndices(indices);
        
        return geometry;
    }
    
    /**
     * Create a wireframe cube geometry
     * @param size Size of the cube
     */
    static createWireframeCube(size: number = 1): Geometry {
        const geometry = new Geometry('wireframe_cube');
        
        // Half size
        const s = size / 2;
        
        // Vertex positions (8 vertices)
        const positions = new Float32Array([
            // Front face
            -s, -s,  s,  // 0: bottom-left-front
             s, -s,  s,  // 1: bottom-right-front
             s,  s,  s,  // 2: top-right-front
            -s,  s,  s,  // 3: top-left-front
            
            // Back face
            -s, -s, -s,  // 4: bottom-left-back
             s, -s, -s,  // 5: bottom-right-back
             s,  s, -s,  // 6: top-right-back
            -s,  s, -s   // 7: top-left-back
        ]);
        
        // Indices for lines (12 edges, 2 indices per edge)
        const indices = new Uint16Array([
            // Front face
            0, 1,
            1, 2,
            2, 3,
            3, 0,
            
            // Back face
            4, 5,
            5, 6,
            6, 7,
            7, 4,
            
            // Connecting edges
            0, 4,
            1, 5,
            2, 6,
            3, 7
        ]);
        
        geometry.setPositions(positions);
        geometry.setIndices(indices);
        geometry.setPrimitiveType(PrimitiveType.LINES);
        
        return geometry;
    }
    
    /**
     * Create coordinate axes geometry
     * @param size Size of the axes
     */
    static createCoordinateAxes(size: number = 1): Geometry {
        const geometry = new Geometry('coordinate_axes');
        
        // Vertex positions (6 vertices for 3 axes)
        const positions = new Float32Array([
            // X axis (red)
            0, 0, 0,
            size, 0, 0,
            
            // Y axis (green)
            0, 0, 0,
            0, size, 0,
            
            // Z axis (blue)
            0, 0, 0,
            0, 0, size
        ]);
        
        // Vertex colors
        const colors = new Float32Array([
            // X axis (red)
            1, 0, 0,
            1, 0, 0,
            
            // Y axis (green)
            0, 1, 0,
            0, 1, 0,
            
            // Z axis (blue)
            0, 0, 1,
            0, 0, 1
        ]);
        
        geometry.setPositions(positions);
        geometry.setColors(colors);
        geometry.setPrimitiveType(PrimitiveType.LINES);
        
        return geometry;
    }

    /**
     * Create a pyramid geometry
     * @param size Base size of the pyramid
     * @param height Height of the pyramid
     */
    static createPyramid(size: number = 1, height: number = 1.5): Geometry {
        const geometry = new Geometry('pyramid');
        
        // Half size for the base
        const s = size / 2;
        const h = height;
        
        // Vertex positions (5 vertices: 4 for base, 1 for apex)
        const positions = new Float32Array([
            // Base vertices
            -s, 0, -s,  // 0: bottom-left
             s, 0, -s,  // 1: bottom-right
             s, 0,  s,  // 2: top-right
            -s, 0,  s,  // 3: top-left
            
            // Apex
             0, h,  0   // 4: apex
        ]);
        
        // Vertex normals (approximate)
        const normals = new Float32Array([
            // Base vertices (pointing down)
             0, -1,  0,  // 0: bottom-left
             0, -1,  0,  // 1: bottom-right
             0, -1,  0,  // 2: top-right
             0, -1,  0,  // 3: top-left
            
            // Apex (pointing up)
             0,  1,  0   // 4: apex
        ]);
        
        // Indices for triangles
        const indices = new Uint16Array([
            // Base (2 triangles)
            0, 1, 2,
            0, 2, 3,
            
            // Sides (4 triangles)
            0, 4, 1,  // Front face
            1, 4, 2,  // Right face
            2, 4, 3,  // Back face
            3, 4, 0   // Left face
        ]);
        
        geometry.setPositions(positions);
        geometry.setNormals(normals);
        geometry.setIndices(indices);
        
        return geometry;
    }
    
    /**
     * Create a wireframe pyramid geometry
     * @param size Base size of the pyramid
     * @param height Height of the pyramid
     */
    static createWireframePyramid(size: number = 1, height: number = 1.5): Geometry {
        const geometry = new Geometry('wireframe_pyramid');
        
        // Half size for the base
        const s = size / 2;
        const h = height;
        
        // Vertex positions (5 vertices: 4 for base, 1 for apex)
        const positions = new Float32Array([
            // Base vertices
            -s, 0, -s,  // 0: bottom-left
             s, 0, -s,  // 1: bottom-right
             s, 0,  s,  // 2: top-right
            -s, 0,  s,  // 3: top-left
            
            // Apex
             0, h,  0   // 4: apex
        ]);
        
        // Indices for lines (8 edges: 4 for base, 4 connecting to apex)
        const indices = new Uint16Array([
            // Base edges
            0, 1,
            1, 2,
            2, 3,
            3, 0,
            
            // Edges to apex
            0, 4,
            1, 4,
            2, 4,
            3, 4
        ]);
        
        geometry.setPositions(positions);
        geometry.setIndices(indices);
        geometry.setPrimitiveType(PrimitiveType.LINES);
        
        return geometry;
    }
    
    /**
     * Create an octahedron geometry
     * @param size Size of the octahedron
     */
    static createOctahedron(size: number = 1): Geometry {
        const geometry = new Geometry('octahedron');
        
        // Scale factor
        const s = size / 2;
        
        // Vertex positions (6 vertices: top, bottom, and 4 around the middle)
        const positions = new Float32Array([
            // Top and bottom vertices
             0,  s,  0,  // 0: top
             0, -s,  0,  // 1: bottom
            
            // Middle vertices
             s,  0,  0,  // 2: +X
            -s,  0,  0,  // 3: -X
             0,  0,  s,  // 4: +Z
             0,  0, -s   // 5: -Z
        ]);
        
        // Vertex normals (normalized vertex positions)
        const normals = new Float32Array([
             0,  1,  0,  // 0: top
             0, -1,  0,  // 1: bottom
             1,  0,  0,  // 2: +X
            -1,  0,  0,  // 3: -X
             0,  0,  1,  // 4: +Z
             0,  0, -1   // 5: -Z
        ]);
        
        // Indices for triangles (8 triangular faces)
        const indices = new Uint16Array([
            // Top half
            0, 2, 4,  // Top, +X, +Z
            0, 4, 3,  // Top, +Z, -X
            0, 3, 5,  // Top, -X, -Z
            0, 5, 2,  // Top, -Z, +X
            
            // Bottom half
            1, 4, 2,  // Bottom, +Z, +X
            1, 3, 4,  // Bottom, -X, +Z
            1, 5, 3,  // Bottom, -Z, -X
            1, 2, 5   // Bottom, +X, -Z
        ]);
        
        geometry.setPositions(positions);
        geometry.setNormals(normals);
        geometry.setIndices(indices);
        
        return geometry;
    }
    
    /**
     * Create a wireframe octahedron geometry
     * @param size Size of the octahedron
     */
    static createWireframeOctahedron(size: number = 1): Geometry {
        const geometry = new Geometry('wireframe_octahedron');
        
        // Scale factor
        const s = size / 2;
        
        // Vertex positions (6 vertices: top, bottom, and 4 around the middle)
        const positions = new Float32Array([
            // Top and bottom vertices
             0,  s,  0,  // 0: top
             0, -s,  0,  // 1: bottom
            
            // Middle vertices
             s,  0,  0,  // 2: +X
            -s,  0,  0,  // 3: -X
             0,  0,  s,  // 4: +Z
             0,  0, -s   // 5: -Z
        ]);
        
        // Indices for lines (12 edges)
        const indices = new Uint16Array([
            // Edges from top vertex
            0, 2,  // Top to +X
            0, 3,  // Top to -X
            0, 4,  // Top to +Z
            0, 5,  // Top to -Z
            
            // Edges from bottom vertex
            1, 2,  // Bottom to +X
            1, 3,  // Bottom to -X
            1, 4,  // Bottom to +Z
            1, 5,  // Bottom to -Z
            
            // Edges around the middle
            2, 4,  // +X to +Z
            4, 3,  // +Z to -X
            3, 5,  // -X to -Z
            5, 2   // -Z to +X
        ]);
        
        geometry.setPositions(positions);
        geometry.setIndices(indices);
        geometry.setPrimitiveType(PrimitiveType.LINES);
        
        return geometry;
    }
}
