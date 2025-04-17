/**
 * Matrix4 class for 4x4 matrix operations
 * Used for transformations in 3D space
 */
import { Vector3 } from './Vector3';
export declare class Matrix4 {
    /**
     * Matrix elements stored in column-major order (WebGL standard)
     * [
     *   m00, m10, m20, m30,  // Column 0
     *   m01, m11, m21, m31,  // Column 1
     *   m02, m12, m22, m32,  // Column 2
     *   m03, m13, m23, m33   // Column 3
     * ]
     */
    readonly elements: Float32Array;
    /**
     * Create a new Matrix4
     * @param elements Optional array of 16 elements in column-major order
     */
    constructor(elements?: number[] | Float32Array);
    /**
     * Create an identity matrix
     */
    static identity(): Matrix4;
    /**
     * Set this matrix to the identity matrix
     */
    setIdentity(): Matrix4;
    /**
     * Create a translation matrix
     * @param x X translation
     * @param y Y translation
     * @param z Z translation
     */
    static translation(x: number, y: number, z: number): Matrix4;
    /**
     * Create a translation matrix from a Vector3
     * @param v Translation vector
     */
    static translationFromVector(v: Vector3): Matrix4;
    /**
     * Create a scaling matrix
     * @param x X scale
     * @param y Y scale
     * @param z Z scale
     */
    static scaling(x: number, y: number, z: number): Matrix4;
    /**
     * Create a scaling matrix from a Vector3
     * @param v Scale vector
     */
    static scalingFromVector(v: Vector3): Matrix4;
    /**
     * Create a rotation matrix around the X axis
     * @param angle Angle in radians
     */
    static rotationX(angle: number): Matrix4;
    /**
     * Create a rotation matrix around the Y axis
     * @param angle Angle in radians
     */
    static rotationY(angle: number): Matrix4;
    /**
     * Create a rotation matrix around the Z axis
     * @param angle Angle in radians
     */
    static rotationZ(angle: number): Matrix4;
    /**
     * Create a perspective projection matrix
     * @param fov Field of view in degrees
     * @param aspect Aspect ratio (width / height)
     * @param near Near clipping plane
     * @param far Far clipping plane
     */
    static perspective(fov: number, aspect: number, near: number, far: number): Matrix4;
    /**
     * Create an orthographic projection matrix
     * @param left Left clipping plane
     * @param right Right clipping plane
     * @param bottom Bottom clipping plane
     * @param top Top clipping plane
     * @param near Near clipping plane
     * @param far Far clipping plane
     */
    static orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4;
    /**
     * Create a "look at" view matrix
     * @param eye Camera position
     * @param target Point to look at
     * @param up Up vector
     */
    static lookAt(eye: Vector3, target: Vector3, up: Vector3): Matrix4;
    /**
     * Multiply this matrix by another and return a new matrix
     * @param m Matrix to multiply by
     */
    multiply(m: Matrix4): Matrix4;
    /**
     * Transform a Vector3 by this matrix
     * @param v Vector to transform
     * @param w W component (default: 1)
     */
    transformVector(v: Vector3, w?: number): Vector3;
    /**
     * Calculate the determinant of this matrix
     */
    determinant(): number;
    /**
     * Calculate the inverse of this matrix
     */
    inverse(): Matrix4;
    /**
     * Calculate the transpose of this matrix
     */
    transpose(): Matrix4;
    /**
     * Create a copy of this matrix
     */
    clone(): Matrix4;
    /**
     * Convert this matrix to an array
     */
    toArray(): number[];
    /**
     * Convert this matrix to a Float32Array
     */
    toFloat32Array(): Float32Array;
    /**
     * Convert this matrix to a string representation
     */
    toString(): string;
}
