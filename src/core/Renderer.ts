/**
 * Renderer class
 * Handles WebGL rendering pipeline
 */
import { Scene } from '../scene/Scene';
import { Camera } from './Camera';
import { SceneNode } from '../scene/SceneNode';
import { Vector3 } from '../math/Vector3';

/**
 * WebGL capabilities detection
 */
export class GPUCapabilities {
    readonly isWebGL2: boolean;
    readonly maxTextureSize: number;
    readonly maxTextureUnits: number;
    readonly supportsPBR: boolean;
    readonly supportsInstancing: boolean;
    readonly supportsTransformFeedback: boolean;
    readonly supportsComputeShaders: boolean;
    readonly supportsTextureArrays: boolean;
    readonly supportsASTCCompression: boolean;
    readonly supportsDrawBuffers: boolean;
    
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
        // Check if WebGL2
        this.isWebGL2 = 'drawBuffers' in gl;
        
        // Get basic capabilities
        this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        this.maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        
        // Check for extensions
        this.supportsInstancing = this.isWebGL2 || !!gl.getExtension('ANGLE_instanced_arrays');
        this.supportsDrawBuffers = this.isWebGL2 || !!gl.getExtension('WEBGL_draw_buffers');
        this.supportsTextureArrays = this.isWebGL2;
        this.supportsTransformFeedback = this.isWebGL2;
        this.supportsComputeShaders = false; // Not available in WebGL
        this.supportsASTCCompression = !!gl.getExtension('WEBGL_compressed_texture_astc');
        
        // PBR support (approximation)
        this.supportsPBR = this.isWebGL2 && this.supportsDrawBuffers;
    }
}

export class Renderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    private capabilities: GPUCapabilities | null = null;
    
    // Rendering state
    private clearColor: Vector3 = new Vector3(0.9, 0.9, 0.9);
    private clearAlpha: number = 1.0;
    
    // Shader programs
    private shaderPrograms: Map<string, WebGLProgram> = new Map();
    private currentProgram: WebGLProgram | null = null;
    
    // Buffers
    private buffers: Map<string, WebGLBuffer> = new Map();
    
    // Textures
    private textures: Map<string, WebGLTexture> = new Map();
    
    /**
     * Create a new Renderer
     * @param canvas Canvas element to render to
     */
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.initWebGL();
    }
    
    /**
     * Initialize WebGL context
     */
    private initWebGL(): void {
        // Try to get WebGL2 context first
        this.gl = this.canvas.getContext('webgl2') as WebGL2RenderingContext | null;
        
        // Fall back to WebGL1 if WebGL2 is not available
        if (!this.gl) {
            this.gl = (
                this.canvas.getContext('webgl') as WebGLRenderingContext | null || 
                this.canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
            );
            
            if (!this.gl) {
                throw new Error('WebGL not supported');
            }
            
            console.warn('WebGL 2 not supported, falling back to WebGL 1');
        } else {
            console.log('Using WebGL 2');
        }
        
        // Detect capabilities
        this.capabilities = new GPUCapabilities(this.gl);
        
        // Set up initial WebGL state
        this.setupWebGLState();
        
        // Initialize default shaders
        this.initDefaultShaders();
    }
    
    /**
     * Set up initial WebGL state
     */
    private setupWebGLState(): void {
        if (!this.gl) return;
        
        // Enable depth testing
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        
        // Enable backface culling
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        
        // Set clear color
        this.gl.clearColor(
            this.clearColor.x,
            this.clearColor.y,
            this.clearColor.z,
            this.clearAlpha
        );
        
        // Set viewport
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Initialize default shaders
     */
    private initDefaultShaders(): void {
        // Wireframe shader
        this.createShaderProgram(
            'wireframe',
            this.getWireframeVertexShader(),
            this.getWireframeFragmentShader()
        );
        
        // Basic shader
        this.createShaderProgram(
            'basic',
            this.getBasicVertexShader(),
            this.getBasicFragmentShader()
        );
    }
    
    /**
     * Get wireframe vertex shader source
     */
    private getWireframeVertexShader(): string {
        // Use GLSL 3.00 ES for WebGL2, fallback to GLSL 1.00 for WebGL1
        const isWebGL2 = this.capabilities?.isWebGL2;
        
        if (isWebGL2) {
            return `#version 300 es
                in vec3 aPosition;
                
                uniform mat4 uModelMatrix;
                uniform mat4 uViewMatrix;
                uniform mat4 uProjectionMatrix;
                
                void main() {
                    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
                }
            `;
        } else {
            return `
                attribute vec3 aPosition;
                
                uniform mat4 uModelMatrix;
                uniform mat4 uViewMatrix;
                uniform mat4 uProjectionMatrix;
                
                void main() {
                    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
                }
            `;
        }
    }
    
    /**
     * Get wireframe fragment shader source
     */
    private getWireframeFragmentShader(): string {
        // Use GLSL 3.00 ES for WebGL2, fallback to GLSL 1.00 for WebGL1
        const isWebGL2 = this.capabilities?.isWebGL2;
        
        if (isWebGL2) {
            return `#version 300 es
                precision mediump float;
                
                uniform vec3 uColor;
                
                out vec4 fragColor;
                
                void main() {
                    fragColor = vec4(uColor, 1.0);
                }
            `;
        } else {
            return `
                precision mediump float;
                
                uniform vec3 uColor;
                
                void main() {
                    gl_FragColor = vec4(uColor, 1.0);
                }
            `;
        }
    }
    
    /**
     * Get basic vertex shader source
     */
    private getBasicVertexShader(): string {
        // Use GLSL 3.00 ES for WebGL2, fallback to GLSL 1.00 for WebGL1
        const isWebGL2 = this.capabilities?.isWebGL2;
        
        if (isWebGL2) {
            return `#version 300 es
                in vec3 aPosition;
                in vec3 aNormal;
                
                uniform mat4 uModelMatrix;
                uniform mat4 uViewMatrix;
                uniform mat4 uProjectionMatrix;
                
                out vec3 vNormal;
                out vec3 vPosition;
                
                void main() {
                    vPosition = (uModelMatrix * vec4(aPosition, 1.0)).xyz;
                    vNormal = mat3(uModelMatrix) * aNormal;
                    
                    gl_Position = uProjectionMatrix * uViewMatrix * vec4(vPosition, 1.0);
                }
            `;
        } else {
            return `
                attribute vec3 aPosition;
                attribute vec3 aNormal;
                
                uniform mat4 uModelMatrix;
                uniform mat4 uViewMatrix;
                uniform mat4 uProjectionMatrix;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vPosition = (uModelMatrix * vec4(aPosition, 1.0)).xyz;
                    vNormal = mat3(uModelMatrix) * aNormal;
                    
                    gl_Position = uProjectionMatrix * uViewMatrix * vec4(vPosition, 1.0);
                }
            `;
        }
    }
    
    /**
     * Get basic fragment shader source
     */
    private getBasicFragmentShader(): string {
        // Use GLSL 3.00 ES for WebGL2, fallback to GLSL 1.00 for WebGL1
        const isWebGL2 = this.capabilities?.isWebGL2;
        
        if (isWebGL2) {
            return `#version 300 es
                precision mediump float;
                
                in vec3 vNormal;
                in vec3 vPosition;
                
                uniform vec3 uColor;
                uniform vec3 uLightDirection;
                uniform vec3 uLightColor;
                uniform vec3 uAmbientColor;
                
                out vec4 fragColor;
                
                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 lightDir = normalize(uLightDirection);
                    
                    float diffuse = max(dot(normal, lightDir), 0.0);
                    vec3 diffuseColor = uColor * uLightColor * diffuse;
                    vec3 ambientColor = uColor * uAmbientColor;
                    
                    vec3 finalColor = ambientColor + diffuseColor;
                    
                    fragColor = vec4(finalColor, 1.0);
                }
            `;
        } else {
            return `
                precision mediump float;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                uniform vec3 uColor;
                uniform vec3 uLightDirection;
                uniform vec3 uLightColor;
                uniform vec3 uAmbientColor;
                
                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 lightDir = normalize(uLightDirection);
                    
                    float diffuse = max(dot(normal, lightDir), 0.0);
                    vec3 diffuseColor = uColor * uLightColor * diffuse;
                    vec3 ambientColor = uColor * uAmbientColor;
                    
                    vec3 finalColor = ambientColor + diffuseColor;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `;
        }
    }
    
    /**
     * Create a shader program
     * @param name Program name
     * @param vertexSource Vertex shader source
     * @param fragmentSource Fragment shader source
     */
    createShaderProgram(name: string, vertexSource: string, fragmentSource: string): WebGLProgram | null {
        if (!this.gl) return null;
        
        // Create shader program
        const program = this.gl.createProgram();
        if (!program) {
            console.error('Failed to create shader program');
            return null;
        }
        
        // Create and compile vertex shader
        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        if (!vertexShader) {
            console.error('Failed to create vertex shader');
            return null;
        }
        
        this.gl.shaderSource(vertexShader, vertexSource);
        this.gl.compileShader(vertexShader);
        
        // Check vertex shader compilation status
        if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
            console.error('Vertex shader compilation failed:', this.gl.getShaderInfoLog(vertexShader));
            this.gl.deleteShader(vertexShader);
            return null;
        }
        
        // Create and compile fragment shader
        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        if (!fragmentShader) {
            console.error('Failed to create fragment shader');
            return null;
        }
        
        this.gl.shaderSource(fragmentShader, fragmentSource);
        this.gl.compileShader(fragmentShader);
        
        // Check fragment shader compilation status
        if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
            console.error('Fragment shader compilation failed:', this.gl.getShaderInfoLog(fragmentShader));
            this.gl.deleteShader(vertexShader);
            this.gl.deleteShader(fragmentShader);
            return null;
        }
        
        // Attach shaders to program
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        
        // Link program
        this.gl.linkProgram(program);
        
        // Check program linking status
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Shader program linking failed:', this.gl.getProgramInfoLog(program));
            this.gl.deleteShader(vertexShader);
            this.gl.deleteShader(fragmentShader);
            this.gl.deleteProgram(program);
            return null;
        }
        
        // Store program
        this.shaderPrograms.set(name, program);
        
        // Clean up shaders
        this.gl.detachShader(program, vertexShader);
        this.gl.detachShader(program, fragmentShader);
        this.gl.deleteShader(vertexShader);
        this.gl.deleteShader(fragmentShader);
        
        console.log(`Shader program '${name}' created successfully`);
        
        return program;
    }
    
    /**
     * Use a shader program
     * @param name Program name
     */
    useShaderProgram(name: string): boolean {
        if (!this.gl) return false;
        
        const program = this.shaderPrograms.get(name);
        if (!program) {
            console.error(`Shader program '${name}' not found`);
            return false;
        }
        
        this.gl.useProgram(program);
        this.currentProgram = program;
        
        return true;
    }
    
    /**
     * Set a uniform value
     * @param name Uniform name
     * @param value Uniform value
     */
    setUniform(name: string, value: any): boolean {
        if (!this.gl || !this.currentProgram) return false;
        
        const location = this.gl.getUniformLocation(this.currentProgram, name);
        if (location === null) {
            console.warn(`Uniform '${name}' not found in current shader program`);
            return false;
        }
        
        // Determine uniform type and set value
        if (typeof value === 'number') {
            this.gl.uniform1f(location, value);
        } else if (Array.isArray(value) && value.length === 2) {
            this.gl.uniform2f(location, value[0], value[1]);
        } else if (Array.isArray(value) && value.length === 3) {
            this.gl.uniform3f(location, value[0], value[1], value[2]);
        } else if (Array.isArray(value) && value.length === 4) {
            this.gl.uniform4f(location, value[0], value[1], value[2], value[3]);
        } else if (value instanceof Float32Array && value.length === 16) {
            this.gl.uniformMatrix4fv(location, false, value);
        } else if (value.elements && value.elements.length === 16) {
            // Matrix4 object
            this.gl.uniformMatrix4fv(location, false, value.elements);
        } else if (value.x !== undefined && value.y !== undefined && value.z !== undefined) {
            // Vector3 object
            this.gl.uniform3f(location, value.x, value.y, value.z);
        } else {
            console.warn(`Unsupported uniform value type for '${name}'`);
            return false;
        }
        
        return true;
    }
    
    /**
     * Create a buffer
     * @param name Buffer name
     * @param target Buffer target (default: ARRAY_BUFFER)
     * @param data Buffer data
     * @param usage Buffer usage (default: STATIC_DRAW)
     */
    createBuffer(
        name: string,
        target: number = WebGLRenderingContext.ARRAY_BUFFER,
        data: ArrayBuffer | ArrayBufferView | null = null,
        usage: number = WebGLRenderingContext.STATIC_DRAW
    ): WebGLBuffer | null {
        if (!this.gl) return null;
        
        const buffer = this.gl.createBuffer();
        if (!buffer) {
            console.error(`Failed to create buffer '${name}'`);
            return null;
        }
        
        this.gl.bindBuffer(target, buffer);
        
        if (data) {
            this.gl.bufferData(target, data, usage);
        }
        
        this.buffers.set(name, buffer);
        
        return buffer;
    }
    
    /**
     * Bind a buffer
     * @param name Buffer name
     * @param target Buffer target (default: ARRAY_BUFFER)
     */
    bindBuffer(name: string, target: number = WebGLRenderingContext.ARRAY_BUFFER): boolean {
        if (!this.gl) return false;
        
        const buffer = this.buffers.get(name);
        if (!buffer) {
            console.error(`Buffer '${name}' not found`);
            return false;
        }
        
        this.gl.bindBuffer(target, buffer);
        
        return true;
    }
    
    /**
     * Set the clear color
     * @param color Clear color
     * @param alpha Clear alpha (default: 1.0)
     */
    setClearColor(color: Vector3, alpha: number = 1.0): void {
        this.clearColor = color;
        this.clearAlpha = alpha;
        
        if (this.gl) {
            this.gl.clearColor(color.x, color.y, color.z, alpha);
        }
    }
    
    /**
     * Resize the renderer
     * @param width Width
     * @param height Height
     */
    resize(width: number, height: number): void {
        this.canvas.width = width;
        this.canvas.height = height;
        
        if (this.gl) {
            this.gl.viewport(0, 0, width, height);
        }
    }
    
    /**
     * Render a scene
     * @param scene Scene to render
     * @param camera Camera to use
     */
    render(scene: Scene, camera: Camera): void {
        if (!this.gl) return;
        
        // Clear the canvas
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        // Set clear color from scene
        const bgColor = scene.getBackgroundColor();
        this.setClearColor(bgColor);
        
        // Use wireframe shader for now
        this.useShaderProgram('wireframe');
        
        // Set camera uniforms
        this.setUniform('uViewMatrix', camera.viewMatrix);
        this.setUniform('uProjectionMatrix', camera.projectionMatrix);
        
        // Set default color
        this.setUniform('uColor', new Vector3(0, 0, 0));
        
        // Traverse scene and render nodes
        scene.traverse((node: SceneNode) => {
            this.renderNode(node);
        });
    }
    
    /**
     * Render a node
     * @param node Node to render
     */
    private renderNode(node: SceneNode): void {
        // Skip invisible nodes
        if (!node.visible) return;
        
        // Check if node is a Mesh
        if ('render' in node && typeof (node as any).render === 'function') {
            // Call the mesh's render method
            (node as any).render(this);
        } else {
            // Set model matrix uniform for non-mesh nodes
            this.setUniform('uModelMatrix', node.worldMatrix);
        }
    }
    
    /**
     * Get the WebGL context
     */
    getContext(): WebGLRenderingContext | WebGL2RenderingContext | null {
        return this.gl;
    }
    
    /**
     * Get the capabilities
     */
    getCapabilities(): GPUCapabilities | null {
        return this.capabilities;
    }
    
    /**
     * Check if WebGL2 is supported
     */
    isWebGL2(): boolean {
        return this.capabilities?.isWebGL2 || false;
    }
    
    /**
     * Get the canvas element
     */
    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }
}
