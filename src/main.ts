/**
 * WebGL 3D to 2D Projection Demo
 * Main entry point
 */

import { WebGLApp } from './core/WebGLApp';
import { Mesh } from './scene/Mesh';
import { Vector3 } from './math/Vector3';
import { SelectionManager } from './interaction/SelectionManager';
import { InteractionController, InteractionMode } from './interaction/InteractionController';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize the WebGL application
        const app = new WebGLApp('webgl-canvas');
        
        // Create and add global coordinate axes
        const globalAxes = Mesh.createCoordinateAxes(2.0);
        globalAxes.name = 'global_axes';
        app.getScene().addNode(globalAxes);
        
        // Create initial shape (wireframe cube)
        let currentShape = Mesh.createWireframeCube(1.0, new Vector3(0, 0, 0));
        currentShape.name = 'current_shape';
        app.getScene().addNode(currentShape);
        
        // Create and add local gimbal axes for the shape
        const localAxes = Mesh.createGimbalAxes(0.5);
        localAxes.name = 'local_axes';
        currentShape.addChild(localAxes); // Attach to the shape as a child
        
        // Set up shape selection handler
        const shapeSelect = document.getElementById('shape') as HTMLSelectElement;
        const renderModeSelect = document.getElementById('renderMode') as HTMLSelectElement;
        
        if (shapeSelect && renderModeSelect) {
            const updateShape = () => {
                const shape = shapeSelect.value;
                const renderMode = renderModeSelect.value;
                const isWireframe = renderMode === 'wireframe';
                const color = isWireframe ? new Vector3(0, 0, 0) : new Vector3(0.8, 0.8, 0.8);
                
                // Remove current shape
                const oldShape = app.getScene().findNodeByName('current_shape');
                if (oldShape) {
                    app.getScene().removeNode(oldShape);
                }
                
                // Create new shape based on selection
                let newShape: Mesh;
                
                switch (shape) {
                    case 'cube':
                        newShape = isWireframe 
                            ? Mesh.createWireframeCube(1.0, color)
                            : Mesh.createCube(1.0, color);
                        break;
                    case 'pyramid':
                        newShape = isWireframe 
                            ? Mesh.createWireframePyramid(1.0, 1.5, color)
                            : Mesh.createPyramid(1.0, 1.5, color);
                        break;
                    case 'octahedron':
                        newShape = isWireframe 
                            ? Mesh.createWireframeOctahedron(1.0, color)
                            : Mesh.createOctahedron(1.0, color);
                        break;
                    default:
                        newShape = isWireframe 
                            ? Mesh.createWireframeCube(1.0, color)
                            : Mesh.createCube(1.0, color);
                }
                
                // Add new shape to scene
                newShape.name = 'current_shape';
                app.getScene().addNode(newShape);
                
                // Create and add local gimbal axes for the new shape
                const localAxes = Mesh.createGimbalAxes(0.5);
                localAxes.name = 'local_axes';
                newShape.addChild(localAxes); // Attach to the shape as a child
                
                currentShape = newShape;
            };
            
            // Set up event listeners
            shapeSelect.addEventListener('change', updateShape);
            renderModeSelect.addEventListener('change', updateShape);
        }
        
        // Initialize the interaction system
        const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
        const selectionManager = new SelectionManager(
            app.getScene(),
            app.getCamera(),
            app.getRenderer(),
            canvas
        );
        
        const interactionController = new InteractionController(
            app.getCamera(),
            app.getScene(),
            canvas,
            selectionManager
        );
        
        // Set up mode change callback
        interactionController.setOnModeChange((mode) => {
            // Update UI to reflect the current mode
            const modeText = mode === InteractionMode.CameraControl ? 'Camera Control' : 'Object Control';
            console.log(`Interaction mode changed to: ${modeText}`);
            
            // Update the mode display in the UI
            const modeDisplay = document.getElementById('interactionModeDisplay');
            if (modeDisplay) {
                modeDisplay.textContent = modeText;
                
                // Update color based on mode
                if (mode === InteractionMode.CameraControl) {
                    modeDisplay.style.color = '#2196F3'; // Blue for camera
                } else {
                    modeDisplay.style.color = '#FF9800'; // Orange for object
                }
            }
        });
        
        // Set up toggle button
        const toggleButton = document.getElementById('toggleInteractionMode');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                interactionController.toggleMode();
            });
        }
        
        // Start the rendering loop
        app.start();
        
        console.log('WebGL 3D to 2D Projection Demo initialized successfully');
    } catch (error) {
        console.error('Failed to initialize WebGL application:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Error stack:', (error as Error).stack);
        
        // Display error message to the user
        const canvas = document.getElementById('webgl-canvas');
        if (canvas instanceof HTMLCanvasElement) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#f8d7da';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.font = '16px Arial';
                ctx.fillStyle = '#721c24';
                ctx.textAlign = 'center';
                ctx.fillText('WebGL initialization failed', canvas.width / 2, canvas.height / 2 - 20);
                ctx.fillText('Please check if your browser supports WebGL', canvas.width / 2, canvas.height / 2 + 10);
                ctx.fillText(`Error: ${(error as Error).message || 'Unknown error'}`, canvas.width / 2, canvas.height / 2 + 40);
            }
        }
    }
});
