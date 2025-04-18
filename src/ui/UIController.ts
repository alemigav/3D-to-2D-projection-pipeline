/**
 * UIController class
 * Handles UI controls for the application
 */
import { WebGLApp } from '../core/WebGLApp';
import { Vector3 } from '../math/Vector3';
import { ProjectionType } from '../core/Camera';
import { InteractionController, InteractionMode } from '../interaction/InteractionController';

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
        
        // Interaction mode controls
        this.setupInteractionModeControls();
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
        
        // Update interaction mode display
        this.updateInteractionModeDisplay();
    }
    
    /**
     * Set up interaction mode controls
     */
    private setupInteractionModeControls(): void {
        // Create container for interaction mode controls if it doesn't exist
        let interactionControls = document.getElementById('interactionControls');
        if (!interactionControls) {
            // Create the container
            interactionControls = document.createElement('div');
            interactionControls.id = 'interactionControls';
            interactionControls.className = 'control-group';
            
            // Create heading
            const heading = document.createElement('h3');
            heading.textContent = 'Interaction Mode';
            interactionControls.appendChild(heading);
            
            // Create mode display
            const modeDisplay = document.createElement('div');
            modeDisplay.id = 'interactionModeDisplay';
            modeDisplay.className = 'mode-display';
            modeDisplay.textContent = 'Camera Control';
            interactionControls.appendChild(modeDisplay);
            
            // Create toggle button
            const toggleButton = document.createElement('button');
            toggleButton.id = 'toggleInteractionMode';
            toggleButton.textContent = 'Toggle Mode (Tab)';
            toggleButton.addEventListener('click', () => {
                const interactionController = this.app.getInteractionController();
                interactionController.toggleMode();
                this.updateInteractionModeDisplay();
            });
            interactionControls.appendChild(toggleButton);
            
            // Create gimbal visibility toggle
            const gimbalToggleContainer = document.createElement('div');
            gimbalToggleContainer.className = 'control-row';
            
            const gimbalToggleLabel = document.createElement('label');
            gimbalToggleLabel.htmlFor = 'toggleGimbalVisibility';
            gimbalToggleLabel.textContent = 'Show Gimbal Axes:';
            gimbalToggleContainer.appendChild(gimbalToggleLabel);
            
            const gimbalToggleCheckbox = document.createElement('input');
            gimbalToggleCheckbox.type = 'checkbox';
            gimbalToggleCheckbox.id = 'toggleGimbalVisibility';
            gimbalToggleCheckbox.checked = true; // Default to visible
            gimbalToggleCheckbox.addEventListener('change', () => {
                const interactionController = this.app.getInteractionController();
                interactionController.setGimbalVisibility(gimbalToggleCheckbox.checked);
            });
            gimbalToggleContainer.appendChild(gimbalToggleCheckbox);
            
            interactionControls.appendChild(gimbalToggleContainer);
            
            // Create selection info
            const selectionInfo = document.createElement('div');
            selectionInfo.id = 'selectionInfo';
            selectionInfo.className = 'selection-info';
            selectionInfo.textContent = 'No object selected';
            interactionControls.appendChild(selectionInfo);
            
            // Add to the UI
            const controlPanel = document.querySelector('.control-panel');
            if (controlPanel) {
                controlPanel.appendChild(interactionControls);
            } else {
                document.body.appendChild(interactionControls);
            }
        }
        
        // Set up event listeners for selection changes
        const canvas = this.app.getRenderer().getCanvas();
        
        canvas.addEventListener('object-selected', ((event: Event) => {
            const customEvent = event as CustomEvent;
            const node = customEvent.detail?.node;
            const selectionInfo = document.getElementById('selectionInfo');
            
            if (selectionInfo && node) {
                selectionInfo.textContent = `Selected: ${node.name || 'Unnamed Object'}`;
                selectionInfo.style.color = '#4CAF50'; // Green
            }
            
            this.updateInteractionModeDisplay();
        }) as EventListener);
        
        canvas.addEventListener('object-deselected', (() => {
            const selectionInfo = document.getElementById('selectionInfo');
            
            if (selectionInfo) {
                selectionInfo.textContent = 'No object selected';
                selectionInfo.style.color = ''; // Reset color
            }
            
            this.updateInteractionModeDisplay();
        }) as EventListener);
        
        // Initial update
        this.updateInteractionModeDisplay();
    }
    
    /**
     * Update the interaction mode display
     */
    private updateInteractionModeDisplay(): void {
        const interactionController = this.app.getInteractionController();
        const modeDisplay = document.getElementById('interactionModeDisplay');
        const toggleButton = document.getElementById('toggleInteractionMode');
        
        if (modeDisplay) {
            const mode = interactionController.getMode();
            let modeText = 'Camera Control';
            let modeColor = '#2196F3'; // Blue for camera
            
            // Set mode text and color based on current mode
            switch (mode) {
                case InteractionMode.CameraControl:
                    modeText = 'Camera Control';
                    modeColor = '#2196F3'; // Blue for camera
                    break;
                    
                case InteractionMode.ObjectControl:
                    modeText = 'Object Control';
                    modeColor = '#FF9800'; // Orange for object
                    break;
                    
                case InteractionMode.GimbalControl:
                    modeText = 'Gimbal Control';
                    modeColor = '#E91E63'; // Pink for gimbal
                    break;
            }
            
            modeDisplay.textContent = modeText;
            modeDisplay.style.color = modeColor;
        }
        
        if (toggleButton) {
            // Disable toggle button if no object is selected and in camera mode
            const selectionManager = this.app.getSelectionManager();
            const hasSelection = selectionManager.getSelectedNode() !== null;
            const isCameraMode = interactionController.getMode() === InteractionMode.CameraControl;
            
            (toggleButton as HTMLButtonElement).disabled = isCameraMode && !hasSelection;
        }
    }
    
    /**
     * Get an element by ID
     * @param id Element ID
     */
    getElement(id: string): HTMLElement | undefined {
        return this.elements.get(id);
    }
}
