/**
 * UIController class
 * Handles UI controls for the application
 */
import { WebGLApp } from '../core/WebGLApp';
import { Vector3 } from '../math/Vector3';
import { ProjectionType } from '../core/Camera';

// This is a circular import, but TypeScript can handle it
// The actual implementation will be loaded at runtime

export class UIController {
    private app: WebGLApp;
    private elements: Map<string, HTMLElement> = new Map();
    
    /**
     * Create a new UIController
     * @param app WebGLApp instance
     */
    constructor(app: WebGLApp) {
        this.app = app;
        this.setupControls();
    }
    
    /**
     * Set up UI controls
     */
    private setupControls(): void {
        // Camera position controls
        this.setupSlider('camera-x', -10, 10, 3, (value) => {
            const camera = this.app.getCamera();
            const position = camera.position;
            camera.setPosition(value, position.y, position.z);
            this.updateMatrixDisplays();
        });
        
        this.setupSlider('camera-y', -10, 10, 3, (value) => {
            const camera = this.app.getCamera();
            const position = camera.position;
            camera.setPosition(position.x, value, position.z);
            this.updateMatrixDisplays();
        });
        
        this.setupSlider('camera-z', -10, 10, 3, (value) => {
            const camera = this.app.getCamera();
            const position = camera.position;
            camera.setPosition(position.x, position.y, value);
            this.updateMatrixDisplays();
        });
        
        // Projection mode toggle
        this.setupSelect('projectionMode', (value) => {
            const camera = this.app.getCamera();
            const useOrthographic = value === 'orthographic';
            camera.toggleProjectionMode(useOrthographic);
            
            // Show/hide appropriate controls
            const perspectiveControls = document.getElementById('perspectiveControls');
            const orthographicControls = document.getElementById('orthographicControls');
            
            if (perspectiveControls && orthographicControls) {
                perspectiveControls.style.display = useOrthographic ? 'none' : 'block';
                orthographicControls.style.display = useOrthographic ? 'block' : 'none';
            }
            
            this.updateMatrixDisplays();
        });
        
        // Perspective projection controls
        this.setupSlider('fov', 30, 120, 75, (value) => {
            const camera = this.app.getCamera();
            camera.fov = value;
            this.updateMatrixDisplays();
        });
        
        this.setupSlider('near', 0.1, 5, 0.1, (value) => {
            const camera = this.app.getCamera();
            camera.near = value;
            this.updateMatrixDisplays();
        });
        
        this.setupSlider('far', 5, 100, 100, (value) => {
            const camera = this.app.getCamera();
            camera.far = value;
            this.updateMatrixDisplays();
        });
        
        // Orthographic projection controls
        this.setupSlider('orthoSize', 1, 10, 5, (value) => {
            const camera = this.app.getCamera();
            camera.orthoSize = value;
            this.updateMatrixDisplays();
        });
        
        // Shape selection
        this.setupSelect('shape', (value) => {
            // This will be implemented when we add mesh support
            console.log(`Selected shape: ${value}`);
        });
        
        // Render mode selection
        this.setupSelect('renderMode', (value) => {
            // This will be implemented when we add material support
            console.log(`Selected render mode: ${value}`);
        });
        
        // Auto-rotate toggle
        this.setupCheckbox('autoRotate', (checked) => {
            // This will be implemented when we add animation support
            console.log(`Auto-rotate: ${checked}`);
        });
    }
    
    /**
     * Set up a slider control
     * @param id Element ID
     * @param min Minimum value
     * @param max Maximum value
     * @param initial Initial value
     * @param onChange Change handler
     */
    private setupSlider(
        id: string, 
        min: number, 
        max: number, 
        initial: number,
        onChange: (value: number) => void
    ): void {
        const slider = document.getElementById(id) as HTMLInputElement;
        const display = document.getElementById(`${id}-value`) as HTMLElement;
        
        if (slider && display) {
            slider.min = min.toString();
            slider.max = max.toString();
            slider.value = initial.toString();
            
            // Set initial display value
            if (id === 'fov') {
                display.textContent = `${initial}°`;
            } else {
                display.textContent = initial.toFixed(1);
            }
            
            // Add event listener
            slider.addEventListener('input', () => {
                const value = parseFloat(slider.value);
                
                // Update display
                if (id === 'fov') {
                    display.textContent = `${value}°`;
                } else {
                    display.textContent = value.toFixed(1);
                }
                
                // Call change handler
                onChange(value);
            });
            
            // Store element reference
            this.elements.set(id, slider);
        } else {
            console.warn(`Could not find slider element with ID '${id}'`);
        }
    }
    
    /**
     * Set up a select control
     * @param id Element ID
     * @param onChange Change handler
     */
    private setupSelect(
        id: string,
        onChange: (value: string) => void
    ): void {
        const select = document.getElementById(id) as HTMLSelectElement;
        
        if (select) {
            // Add event listener
            select.addEventListener('change', () => {
                onChange(select.value);
            });
            
            // Store element reference
            this.elements.set(id, select);
        } else {
            console.warn(`Could not find select element with ID '${id}'`);
        }
    }
    
    /**
     * Set up a checkbox control
     * @param id Element ID
     * @param onChange Change handler
     */
    private setupCheckbox(
        id: string,
        onChange: (checked: boolean) => void
    ): void {
        const checkbox = document.getElementById(id) as HTMLInputElement;
        
        if (checkbox) {
            // Add event listener
            checkbox.addEventListener('change', () => {
                onChange(checkbox.checked);
            });
            
            // Store element reference
            this.elements.set(id, checkbox);
        } else {
            console.warn(`Could not find checkbox element with ID '${id}'`);
        }
    }
    
    /**
     * Update matrix displays
     */
    private updateMatrixDisplays(): void {
        const camera = this.app.getCamera();
        
        // Format matrices for display
        const viewMatrixStr = this.formatMatrix(camera.viewMatrix);
        const projMatrixStr = this.formatMatrix(camera.projectionMatrix);
        
        // Update displays
        const viewMatrixElement = document.getElementById('view-matrix');
        const projMatrixElement = document.getElementById('proj-matrix');
        
        if (viewMatrixElement) {
            viewMatrixElement.textContent = viewMatrixStr;
        }
        
        if (projMatrixElement) {
            projMatrixElement.textContent = projMatrixStr;
        }
    }
    
    /**
     * Format a matrix for display
     * @param matrix Matrix to format
     */
    private formatMatrix(matrix: any): string {
        const elements = matrix.elements;
        let result = "";
        
        for (let i = 0; i < 4; i++) {
            result += "| ";
            for (let j = 0; j < 4; j++) {
                // Format each element to 2 decimal places
                const value = elements[j * 4 + i].toFixed(2);
                // Pad with spaces for alignment
                result += value.padStart(7) + " ";
            }
            result += "|\n";
        }
        
        return result;
    }
    
    /**
     * Update the UI
     */
    update(): void {
        // Update matrix displays
        this.updateMatrixDisplays();
    }
    
    /**
     * Get an element by ID
     * @param id Element ID
     */
    getElement(id: string): HTMLElement | undefined {
        return this.elements.get(id);
    }
}
