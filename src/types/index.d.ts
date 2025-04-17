/**
 * Type declarations for the WebGL 3D to 2D Projection Demo
 * These declarations help break circular dependencies between modules
 */

declare module '*/WebGLApp' {
    import { Vector3 } from '../math/Vector3';
    import { Camera } from '../core/Camera';
    import { Scene } from '../scene/Scene';
    import { Renderer } from '../core/Renderer';
    import { UIController } from '../ui/UIController';

    export class WebGLApp {
        constructor(canvasId: string);
        start(): void;
        stop(): void;
        getCamera(): Camera;
        getScene(): Scene;
        getRenderer(): Renderer;
        getUI(): UIController;
    }
}

declare module '*/Camera' {
    import { Vector3 } from '../math/Vector3';
    import { Matrix4 } from '../math/Matrix4';
    import { Quaternion } from '../math/Quaternion';

    export enum ProjectionType {
        Perspective,
        Orthographic
    }

    export class Camera {
        position: Vector3;
        target: Vector3;
        up: Vector3;
        rotation: Quaternion;
        projectionType: ProjectionType;
        fov: number;
        aspect: number;
        near: number;
        far: number;
        orthoSize: number;
        viewMatrix: Matrix4;
        projectionMatrix: Matrix4;
        orbitRadius: number;
        orbitTheta: number;
        orbitPhi: number;

        constructor();
        updateFromOrbit(): void;
        updateViewMatrix(): void;
        updateProjectionMatrix(): void;
        lookAt(target: Vector3): void;
        setPosition(x: number, y: number, z: number): void;
        setTarget(x: number, y: number, z: number): void;
        setUp(x: number, y: number, z: number): void;
        setPerspective(fov: number, aspect: number, near: number, far: number): void;
        setOrthographic(size: number, aspect: number, near: number, far: number): void;
        toggleProjectionMode(useOrthographic: boolean): void;
    }
}

declare module '*/Renderer' {
    import { Scene } from '../scene/Scene';
    import { Camera } from '../core/Camera';
    import { Vector3 } from '../math/Vector3';

    export class GPUCapabilities {
        readonly isWebGL2: boolean;
        readonly maxTextureSize: number;
        readonly maxTextureUnits: number;
        readonly supportsPBR: boolean;
        readonly supportsInstancing: boolean;
        readonly supportsTransformFeedback: boolean;
        readonly supportsComputeShaders: boolean;
        readonly supportsTextureArrays: boolean;
        readonly supportsASTCCompression: boolean;
        readonly supportsDrawBuffers: boolean;
    }

    export class Renderer {
        constructor(canvas: HTMLCanvasElement);
        createShaderProgram(name: string, vertexSource: string, fragmentSource: string): WebGLProgram | null;
        useShaderProgram(name: string): boolean;
        setUniform(name: string, value: any): boolean;
        createBuffer(name: string, target?: number, data?: ArrayBuffer | ArrayBufferView | null, usage?: number): WebGLBuffer | null;
        bindBuffer(name: string, target?: number): boolean;
        setClearColor(color: Vector3, alpha?: number): void;
        resize(width: number, height: number): void;
        render(scene: Scene, camera: Camera): void;
        getContext(): WebGLRenderingContext | WebGL2RenderingContext | null;
        getCapabilities(): GPUCapabilities | null;
        isWebGL2(): boolean;
    }
}

declare module '*/Scene' {
    import { SceneNode } from '../scene/SceneNode';
    import { Vector3 } from '../math/Vector3';

    export class Scene {
        constructor();
        addNode(node: SceneNode, parent?: SceneNode): void;
        removeNode(node: SceneNode): void;
        findNodeByName(name: string): SceneNode | null;
        update(deltaTime: number): void;
        traverse(callback: (node: SceneNode) => void): void;
        getRoot(): SceneNode;
        getBackgroundColor(): Vector3;
        setBackgroundColor(color: Vector3): void;
        getAmbientLight(): Vector3;
        setAmbientLight(color: Vector3): void;
        getLights(): any[];
        addLight(light: any): void;
        removeLight(light: any): void;
        clearLights(): void;
    }
}

declare module '*/SceneNode' {
    import { Vector3 } from '../math/Vector3';
    import { Quaternion } from '../math/Quaternion';
    import { Matrix4 } from '../math/Matrix4';

    export class SceneNode {
        name: string;
        position: Vector3;
        rotation: Quaternion;
        scale: Vector3;
        localMatrix: Matrix4;
        worldMatrix: Matrix4;
        parent: SceneNode | null;
        children: SceneNode[];
        visible: boolean;

        constructor(name?: string);
        addChild(child: SceneNode): void;
        removeChild(child: SceneNode): void;
        removeAllChildren(): void;
        updateLocalMatrix(): void;
        updateWorldMatrix(): void;
        updateMatrices(): void;
        setPosition(x: number, y: number, z: number): void;
        setRotationFromEuler(x: number, y: number, z: number, order?: string): void;
        setScale(x: number, y: number, z: number): void;
        lookAt(target: Vector3, up?: Vector3): void;
        translate(x: number, y: number, z: number): void;
        rotate(axis: Vector3, angle: number): void;
        scaleBy(x: number, y: number, z: number): void;
        update(deltaTime: number): void;
        clone(): SceneNode;
    }
}

declare module '*/UIController' {
    import { WebGLApp } from '../core/WebGLApp';

    export class UIController {
        constructor(app: WebGLApp);
        update(): void;
        getElement(id: string): HTMLElement | undefined;
    }
}
