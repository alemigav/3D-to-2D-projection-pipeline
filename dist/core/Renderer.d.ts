/**
 * Renderer class
 * Handles WebGL rendering pipeline
 */
import { Scene } from '../scene/Scene';
import { Camera } from './Camera';
import { Vector3 } from '../math/Vector3';
/**
 * WebGL capabilities detection
 */
export declare class GPUCapabilities {
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
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext);
}
export declare class Renderer {
    private canvas;
    private gl;
    private capabilities;
    private clearColor;
    private clearAlpha;
    private shaderPrograms;
    private currentProgram;
    private buffers;
    private textures;
    /**
     * Create a new Renderer
     * @param canvas Canvas element to render to
     */
    constructor(canvas: HTMLCanvasElement);
    /**
     * Initialize WebGL context
     */
    private initWebGL;
    /**
     * Set up initial WebGL state
     */
    private setupWebGLState;
    /**
     * Initialize default shaders
     */
    private initDefaultShaders;
    /**
     * Get wireframe vertex shader source
     */
    private getWireframeVertexShader;
    /**
     * Get wireframe fragment shader source
     */
    private getWireframeFragmentShader;
    /**
     * Get basic vertex shader source
     */
    private getBasicVertexShader;
    /**
     * Get basic fragment shader source
     */
    private getBasicFragmentShader;
    /**
     * Create a shader program
     * @param name Program name
     * @param vertexSource Vertex shader source
     * @param fragmentSource Fragment shader source
     */
    createShaderProgram(name: string, vertexSource: string, fragmentSource: string): WebGLProgram | null;
    /**
     * Use a shader program
     * @param name Program name
     */
    useShaderProgram(name: string): boolean;
    /**
     * Set a uniform value
     * @param name Uniform name
     * @param value Uniform value
     */
    setUniform(name: string, value: any): boolean;
    /**
     * Create a buffer
     * @param name Buffer name
     * @param target Buffer target (default: ARRAY_BUFFER)
     * @param data Buffer data
     * @param usage Buffer usage (default: STATIC_DRAW)
     */
    createBuffer(name: string, target?: number, data?: ArrayBuffer | ArrayBufferView | null, usage?: number): WebGLBuffer | null;
    /**
     * Bind a buffer
     * @param name Buffer name
     * @param target Buffer target (default: ARRAY_BUFFER)
     */
    bindBuffer(name: string, target?: number): boolean;
    /**
     * Set the clear color
     * @param color Clear color
     * @param alpha Clear alpha (default: 1.0)
     */
    setClearColor(color: Vector3, alpha?: number): void;
    /**
     * Resize the renderer
     * @param width Width
     * @param height Height
     */
    resize(width: number, height: number): void;
    /**
     * Render a scene
     * @param scene Scene to render
     * @param camera Camera to use
     */
    render(scene: Scene, camera: Camera): void;
    /**
     * Render a node
     * @param node Node to render
     */
    private renderNode;
    /**
     * Get the WebGL context
     */
    getContext(): WebGLRenderingContext | WebGL2RenderingContext | null;
    /**
     * Get the capabilities
     */
    getCapabilities(): GPUCapabilities | null;
    /**
     * Check if WebGL2 is supported
     */
    isWebGL2(): boolean;
    /**
     * Get the canvas element
     */
    getCanvas(): HTMLCanvasElement;
}
