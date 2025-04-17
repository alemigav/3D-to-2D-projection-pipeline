# Interactive 3D to 2D Projection Visualization

A pure JavaScript implementation of an interactive 3D to 2D projection pipeline visualization, demonstrating how 3D objects are rendered on a 2D screen without using any external libraries.

## Overview

This project provides an educational tool to understand the mathematics and pipeline involved in projecting 3D objects onto a 2D screen. It implements the complete projection pipeline from scratch using only native JavaScript and the HTML5 Canvas API.

![3D to 2D Projection Demo](screenshot.png)

## Features

- **Interactive 3D Object Manipulation**:
  - Intuitive orbit controls with natural mouse interaction
  - Momentum-based rotation for smooth movement
  - Zoom in/out using the mouse wheel
  - Toggle auto-rotation

- **Multiple Projection Modes**:
  - Perspective projection with adjustable parameters
  - Orthographic (isometric) projection for technical visualization
  - Real-time switching between projection modes

- **Adjustable Camera Parameters**:
  - Control camera position (X, Y, Z) using sliders
  - See real-time updates of the view matrix

- **Configurable Projection Settings**:
  - Adjust Field of View (FOV) for perspective mode
  - Set near and far clipping planes
  - Control orthographic view size
  - Observe changes in the projection matrix

- **Multiple 3D Shapes**:
  - Cube
  - Pyramid
  - Octahedron

- **Visual Aids**:
  - Coordinate axes visualization (X, Y, Z in red, green, blue)
  - Vertex highlighting
  - Real-time matrix displays

## The Projection Pipeline

The visualization demonstrates the complete 3D to 2D projection pipeline:

1. **Model Transformation**: Apply rotations to the object in model space
2. **View Transformation**: Transform from world space to camera space
3. **Projection Transformation**: Apply perspective projection
4. **Perspective Divide**: Convert to Normalized Device Coordinates (NDC)
5. **Viewport Transformation**: Map to screen coordinates

## Implementation Details

### Core Mathematics

The project implements fundamental 3D graphics mathematics from scratch:

- **Vector3 Class**: Implements vector operations (dot product, cross product, normalization)
- **Matrix4 Class**: Provides matrix operations and transformations:
  - Identity matrix
  - Rotation matrices (X, Y, Z axes)
  - LookAt matrix for camera positioning
  - Perspective projection matrix
  - Matrix multiplication

### Renderer

The `Renderer3D` class handles:

- Canvas setup and rendering loop
- Mouse and UI interaction
- Shape creation and management
- Transformation pipeline application
- Drawing operations (edges, vertices, axes)

### User Interface

The HTML interface provides:

- Interactive controls for all parameters
- Real-time display of transformation matrices
- Mathematical explanation of the projection process
- Responsive layout

## How It Works

1. **Object Definition**: 3D objects are defined as sets of vertices and edges
2. **Transformation**: Vertices undergo a series of transformations:
   - Model matrix applies rotations
   - View matrix positions the camera
   - Projection matrix applies perspective
3. **Projection**: The pipeline projects 3D coordinates to 2D screen coordinates
4. **Rendering**: The 2D Canvas API draws the projected edges and vertices
5. **Animation**: RequestAnimationFrame creates a smooth rendering loop

## Implementation Process

This project was implemented by:

1. Creating a mathematical foundation with Vector3 and Matrix4 classes
2. Implementing the core projection pipeline functions
3. Building an interactive renderer with intuitive orbit controls
4. Adding support for both perspective and orthographic projections
5. Implementing UI controls for all parameters
6. Creating multiple 3D shapes for visualization
7. Adding visual aids like coordinate axes and matrix displays
8. Optimizing the rendering loop for smooth performance
9. Implementing momentum-based rotation for natural interaction

## Files

- `3d-projection-demo.html`: Main HTML file with UI and controls
- `3d-to-2d-projection-math.js`: Core mathematics and renderer implementation

## Usage

Simply open `3d-projection-demo.html` in a modern web browser to start the visualization.

## Educational Value

This visualization helps in understanding:

- How 3D objects are represented in computer graphics
- The mathematics of 3D transformations
- The role of matrices in the graphics pipeline
- The differences between perspective and orthographic projections
- How camera positioning affects the view
- The conversion from 3D world space to 2D screen space

By implementing everything from scratch without external libraries, the project provides clear insight into the fundamental concepts of 3D computer graphics.

## Controls

- **Mouse Drag**: Orbit around the 3D object
- **Mouse Wheel**: Zoom in/out
- **Projection Mode**: Switch between perspective and orthographic (isometric) views
- **Camera Position Sliders**: Adjust the camera's X, Y, Z position
- **FOV Slider**: Change the field of view (perspective mode)
- **Near/Far Sliders**: Adjust the near and far clipping planes
- **Ortho Size Slider**: Control the size of the orthographic view
- **Shape Selector**: Choose between different 3D shapes
- **Auto-rotate Toggle**: Enable/disable automatic rotation
