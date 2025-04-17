/**
 * WebGL 3D to 2D Projection Demo
 * Main entry point
 */

import { WebGLApp } from './core/WebGLApp';
import { Mesh } from './scene/Mesh';
import { Vector3 } from './math/Vector3';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize the WebGL application
        const app = new WebGLApp('webgl-canvas');
        
        // Create and add coordinate axes
        const axes = Mesh.createCoordinateAxes(2.0);
        app.getScene().addNode(axes);
        
        // Create initial shape (wireframe cube)
        let currentShape = Mesh.createWireframeCube(1.0, new Vector3(0, 0, 0));
        currentShape.name = 'current_shape';
        app.getScene().addNode(currentShape);
        
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
                currentShape = newShape;
            };
            
            // Set up event listeners
            shapeSelect.addEventListener('change', updateShape);
            renderModeSelect.addEventListener('change', updateShape);
        }
        
        // Start the rendering loop
        app.start();
        
        console.log('WebGL 3D to 2D Projection Demo initialized successfully');
    } catch (error) {
        console.error('Failed to initialize WebGL application:', error);
        
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
