/**
 * UIController class
 * Handles UI controls for the application
 */
import { WebGLApp } from '../core/WebGLApp';
export declare class UIController {
    private app;
    private elements;
    /**
     * Create a new UIController
     * @param app WebGLApp instance
     */
    constructor(app: WebGLApp);
    /**
     * Set up UI controls
     */
    private setupControls;
    /**
     * Set up a slider control
     * @param id Element ID
     * @param min Minimum value
     * @param max Maximum value
     * @param initial Initial value
     * @param onChange Change handler
     */
    private setupSlider;
    /**
     * Set up a select control
     * @param id Element ID
     * @param onChange Change handler
     */
    private setupSelect;
    /**
     * Set up a checkbox control
     * @param id Element ID
     * @param onChange Change handler
     */
    private setupCheckbox;
    /**
     * Update matrix displays
     */
    private updateMatrixDisplays;
    /**
     * Format a matrix for display
     * @param matrix Matrix to format
     */
    private formatMatrix;
    /**
     * Update the UI
     */
    update(): void;
    /**
     * Set up interaction mode controls
     */
    private setupInteractionModeControls;
    /**
     * Update the interaction mode display
     */
    private updateInteractionModeDisplay;
    /**
     * Get an element by ID
     * @param id Element ID
     */
    getElement(id: string): HTMLElement | undefined;
}
