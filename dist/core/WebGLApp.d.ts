/**
 * WebGLApp class
 * Main entry point for the WebGL application
 */
import { Camera } from './Camera';
import { Renderer } from './Renderer';
import { Scene } from '../scene/Scene';
import { UIController } from '../ui/UIController';
import { SelectionManager } from '../interaction/SelectionManager';
import { InteractionController } from '../interaction/InteractionController';
export declare class WebGLApp {
    private canvas;
    private renderer;
    private scene;
    private camera;
    private ui;
    private selectionManager;
    private interactionController;
    private isRunning;
    private lastFrameTime;
    private animationFrameId;
    /**
     * Create a new WebGLApp
     * @param canvasId ID of the canvas element to render to
     */
    constructor(canvasId: string);
    /**
     * Set up event listeners for user interaction
     */
    private setupEventListeners;
    /**
     * Handle window resize event
     */
    private handleResize;
    /**
     * Toggle fullscreen mode
     */
    private toggleFullscreen;
    /**
     * Handle fullscreen change event
     */
    private handleFullscreenChange;
    /**
     * Start the rendering loop
     */
    start(): void;
    /**
     * Stop the rendering loop
     */
    stop(): void;
    /**
     * Main rendering loop
     * @param timestamp Current timestamp
     */
    private renderLoop;
    /**
     * Update the scene
     * @param deltaTime Time since last frame in seconds
     */
    private update;
    /**
     * Render the scene
     */
    private render;
    /**
     * Get the camera
     */
    getCamera(): Camera;
    /**
     * Get the scene
     */
    getScene(): Scene;
    /**
     * Get the renderer
     */
    getRenderer(): Renderer;
    /**
     * Get the UI controller
     */
    getUI(): UIController;
    /**
     * Get the interaction controller
     */
    getInteractionController(): InteractionController;
    /**
     * Get the selection manager
     */
    getSelectionManager(): SelectionManager;
}
