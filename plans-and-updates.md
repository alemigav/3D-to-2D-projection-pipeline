# WebGL Migration Plan for 3D to 2D Projection Pipeline

## Overview

This document outlines the plan for migrating the 3D to 2D projection visualization from Canvas-based rendering to WebGL/OpenGL ES. The goal is to rebuild the UI using a lower-level graphics abstraction that provides hardware acceleration while maintaining educational clarity.

## Goals

1. Replace Canvas-based rendering with WebGL/OpenGL ES
2. Maintain educational clarity as the primary focus
3. Implement a modular, efficient, and reproducible architecture
4. Add advanced rendering capabilities
5. Ensure code is well-documented and maintainable using TypeScript

## Architecture

The new implementation uses a hybrid approach:
- Object-oriented patterns for WebGL resource management (aligns with GPU's stateful nature)
- Functional principles for state transformations and UI logic
- TypeScript for type safety and better documentation

### Core Components

```
WebGLApp
├── Renderer (WebGL context management)
├── ResourceManager (Shaders, Geometries, Textures)
├── Scene (Hierarchical scene graph)
├── Camera (View and projection control)
└── UI Controller (HTML controls integration)
```

### Key Classes

- **WebGLApp**: Main application entry point
- **Renderer**: Manages WebGL context and rendering pipeline
- **ResourceManager**: Handles WebGL resources (shaders, buffers, textures)
- **Shader**: Compiles, links, and manages GLSL programs
- **Geometry**: Manages vertex data and drawing operations
- **Camera**: Controls view and projection transformations
- **SceneNode**: Base class for scene graph hierarchy
- **Mesh**: Combines geometry and material for rendering
- **Material**: Defines surface appearance and shader parameters
- **UIController**: Connects HTML controls to WebGL parameters

## Implementation Phases

### Phase 1: Foundation
- [x] Create plans-and-updates.md
- [x] Set up TypeScript project structure
- [x] Implement core math library (Vector3, Matrix4, Quaternion)
- [x] Create WebGL context initialization with WebGL 2.0/1.0 detection
- [x] Implement shader compilation and management
- [x] Create buffer management
- [x] Implement scene graph with SceneNode and Scene classes
- [x] Create Camera class with perspective and orthographic projections
- [x] Implement basic UI controller for interactive controls
- [ ] Implement basic wireframe rendering

### Phase 2: Feature Parity
- [ ] Implement camera system with orbit controls
- [ ] Support both perspective and orthographic projections
- [ ] Recreate the same shapes (cube, pyramid, octahedron)
- [ ] Implement coordinate axes visualization
- [ ] Create matrix displays for educational purposes
- [ ] Match all UI controls from the original implementation

### Phase 3: Advanced Features
- [ ] Implement Physically Based Rendering (PBR)
- [ ] Add instanced rendering for efficient drawing
- [ ] Implement transform feedback for particle effects
- [ ] Add support for texture arrays
- [ ] Implement MSDF font rendering
- [ ] Add occlusion culling for performance
- [ ] Implement raycasting for object selection
- [ ] Add gesture recognition for touch devices
- [ ] Set up PWA for offline use

## Technical Considerations

### WebGL 2.0 Features (Primary Target)
- Transform feedback for particle systems and advanced effects
- Instanced rendering for efficient drawing of repeated objects
- Multiple render targets (WEBGL_draw_buffers)
- 3D textures and texture arrays
- Compute shaders for general-purpose GPU computation
- ASTC texture compression for efficient texture storage

### WebGL 1.0 Fallbacks
- Extension-based instancing (ANGLE_instanced_arrays)
- Framebuffer-based alternatives to multiple render targets
- Shader workarounds for missing GLSL features
- Polyfills for missing functionality

### Performance Optimization
- Minimize state changes and draw calls
- Batch similar geometries
- Use instanced rendering for repeated elements
- Implement frustum culling for complex scenes
- Optimize shader complexity based on device capabilities
- Use buffer subdata updates for dynamic content

### Educational Clarity
- Maintain clear separation of projection pipeline stages
- Provide visual feedback for each transformation step
- Include detailed comments and documentation
- Create interactive controls for all parameters
- Display transformation matrices for educational purposes

## File Structure

```
/
├── index.html                  # Main HTML file
├── css/
│   └── styles.css              # UI styles
├── src/
│   ├── main.ts                 # Application entry point
│   ├── math/
│   │   ├── Vector3.ts          # Vector operations
│   │   ├── Matrix4.ts          # Matrix operations
│   │   └── Quaternion.ts       # Rotation utilities
│   ├── core/
│   │   ├── WebGLApp.ts         # Main application class
│   │   ├── Renderer.ts         # WebGL renderer
│   │   ├── ResourceManager.ts  # Resource management
│   │   ├── Shader.ts           # Shader programs
│   │   ├── Geometry.ts         # Geometry utilities
│   │   └── Camera.ts           # Camera system
│   ├── scene/
│   │   ├── SceneNode.ts        # Base scene node
│   │   ├── Mesh.ts             # Renderable object
│   │   ├── Scene.ts            # Scene graph
│   │   └── shapes/             # Predefined shapes
│   ├── materials/
│   │   ├── Material.ts         # Base material
│   │   ├── WireframeMaterial.ts # Wireframe rendering
│   │   └── PBRMaterial.ts      # Physically based rendering
│   ├── ui/
│   │   ├── UIController.ts     # UI controls
│   │   └── MatrixDisplay.ts    # Matrix visualization
│   └── shaders/
│       ├── wireframe.vert.ts   # Vertex shaders
│       ├── wireframe.frag.ts   # Fragment shaders
│       ├── pbr.vert.ts         # PBR vertex shader
│       └── pbr.frag.ts         # PBR fragment shader
└── plans-and-updates.md        # This document
```

## Updates

This section will track progress and updates as the implementation proceeds.

### Update 1: Initial Planning
- Created plans-and-updates.md
- Defined architecture and implementation phases
- Established technical considerations and file structure

### Update 2: Foundation (Current)
- Set up TypeScript project with webpack configuration
- Implemented core math library (Vector3, Matrix4, Quaternion)
- Created WebGL context initialization with WebGL2/WebGL1 detection
- Implemented scene graph with SceneNode and Scene classes
- Created Camera class with perspective and orthographic projections
- Implemented basic UI controller for interactive controls
- Set up WebGL renderer with shader management

### Update 3: Feature Parity (Upcoming)
- Implement mesh and geometry classes
- Add material system
- Create standard shapes (cube, pyramid, octahedron)
- Implement orbit camera controls
- Add coordinate axes visualization
