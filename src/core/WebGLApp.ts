/**
 * WebGLApp class
 * Main entry point for the WebGL application
 */
import { Camera } from './Camera';
import { Renderer } from './Renderer';
import { Scene } from '../scene/Scene';
import { UIController } from '../ui/UIController';
import { Vector3 } from '../math/Vector3';

// Note: There are circular dependencies between WebGLApp, Camera, Renderer, Scene, and UIController
// TypeScript can handle this at compile time, but we need to be careful about initialization order at runtime

export class WebGLApp {
    private canvas: HTMLCanvasElement;
    private renderer: Renderer;
    private scene: Scene;
    private camera: Camera;
    private ui: UIController;
    private isRunning: boolean = false;
    private lastFrameTime: number = 0;
    private animationFrameId: number | null = null;

    /**
     * Create a new WebGLApp
     * @param canvasId ID of the canvas element to render to
     */
    constructor(canvasId: string) {
        // Get the canvas element
        const canvas = document.getElementById(canvasId);
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error(`Canvas element with ID '${canvasId}' not found or is not a canvas element`);
        }
        this.canvas = canvas;

        // Create the renderer
        this.renderer = new Renderer(this.canvas);

        // Create the scene
        this.scene = new Scene();

        // Create the camera
        this.camera = new Camera();
        this.camera.position = new Vector3(3, 3, 3);
        this.camera.lookAt(new Vector3(0, 0, 0));

        // Create the UI controller
        this.ui = new UIController(this);

        // Set up event listeners
        this.setupEventListeners();

        console.log('WebGLApp initialized');
    }

    /**
     * Set up event listeners for user interaction
     */
    private setupEventListeners(): void {
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));

        // Handle fullscreen toggle
        const fullscreenToggle = document.getElementById('fullscreenToggle');
        if (fullscreenToggle) {
            fullscreenToggle.addEventListener('click', this.toggleFullscreen.bind(this));
        }

        // Handle ESC key to exit fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.fullscreenElement) {
                document.exitFullscreen();
            }
        });

        // Handle fullscreen change
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
    }

    /**
     * Handle window resize event
     */
    private handleResize(): void {
        if (document.fullscreenElement) {
            // If in fullscreen mode, resize to window dimensions
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        } else {
            // Otherwise, restore original size
            this.canvas.width = 800;
            this.canvas.height = 500;
        }

        // Update renderer and camera
        this.renderer.resize(this.canvas.width, this.canvas.height);
        this.camera.aspect = this.canvas.width / this.canvas.height;
        this.camera.updateProjectionMatrix();
    }

    /**
     * Toggle fullscreen mode
     */
    private toggleFullscreen(): void {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            this.canvas.requestFullscreen();
        } else {
            // Exit fullscreen
            document.exitFullscreen();
        }
    }

    /**
     * Handle fullscreen change event
     */
    private handleFullscreenChange(): void {
        const container = document.querySelector('.container');
        const body = document.body;

        if (document.fullscreenElement) {
            // Add fullscreen classes
            container?.classList.add('fullscreen');
            body.classList.add('fullscreen');

            // Update button text
            const fullscreenButton = document.getElementById('fullscreenToggle');
            if (fullscreenButton) {
                fullscreenButton.innerHTML = '<i class="fullscreen-icon">⮌</i> Exit';
            }

            // Resize canvas to fill the screen
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        } else {
            // Remove fullscreen classes
            container?.classList.remove('fullscreen');
            body.classList.remove('fullscreen');

            // Update button text
            const fullscreenButton = document.getElementById('fullscreenToggle');
            if (fullscreenButton) {
                fullscreenButton.innerHTML = '<i class="fullscreen-icon">⛶</i> Full Screen';
            }

            // Restore original canvas size
            this.canvas.width = 800;
            this.canvas.height = 500;
        }

        // Update renderer and camera
        this.renderer.resize(this.canvas.width, this.canvas.height);
        this.camera.aspect = this.canvas.width / this.canvas.height;
        this.camera.updateProjectionMatrix();
    }

    /**
     * Start the rendering loop
     */
    start(): void {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.renderLoop.bind(this));

        console.log('Rendering loop started');
    }

    /**
     * Stop the rendering loop
     */
    stop(): void {
        if (!this.isRunning || this.animationFrameId === null) {
            return;
        }

        cancelAnimationFrame(this.animationFrameId);
        this.isRunning = false;
        this.animationFrameId = null;

        console.log('Rendering loop stopped');
    }

    /**
     * Main rendering loop
     * @param timestamp Current timestamp
     */
    private renderLoop(timestamp: number): void {
        // Calculate delta time
        const deltaTime = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;

        // Update scene
        this.update(deltaTime);

        // Render scene
        this.render();

        // Request next frame
        this.animationFrameId = requestAnimationFrame(this.renderLoop.bind(this));
    }

    /**
     * Update the scene
     * @param deltaTime Time since last frame in seconds
     */
    private update(deltaTime: number): void {
        // Update scene objects
        this.scene.update(deltaTime);

        // Update UI
        this.ui.update();
    }

    /**
     * Render the scene
     */
    private render(): void {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Get the camera
     */
    getCamera(): Camera {
        return this.camera;
    }

    /**
     * Get the scene
     */
    getScene(): Scene {
        return this.scene;
    }

    /**
     * Get the renderer
     */
    getRenderer(): Renderer {
        return this.renderer;
    }

    /**
     * Get the UI controller
     */
    getUI(): UIController {
        return this.ui;
    }
}
