/**
 * WebGL 3D to 2D Projection Demo
 * Main entry point
 */

import { WebGLApp } from './core/WebGLApp';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize the WebGL application
        const app = new WebGLApp('webgl-canvas');
        
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
