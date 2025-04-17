/**
 * Quaternion class for representing rotations in 3D space
 * Provides a more efficient and stable way to handle rotations compared to Euler angles
 */
import { Vector3 } from './Vector3';
import { Matrix4 } from './Matrix4';
export declare class Quaternion {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
    /**
     * Create a new Quaternion
     * @param x X component (default: 0)
     * @param y Y component (default: 0)
     * @param z Z component (default: 0)
     * @param w W component (default: 1)
     */
    constructor(x?: number, y?: number, z?: number, w?: number);
    /**
     * Create a quaternion from axis-angle representation
     * @param axis Rotation axis (should be normalized)
     * @param angle Rotation angle in radians
     */
    static fromAxisAngle(axis: Vector3, angle: number): Quaternion;
    /**
     * Create a quaternion from Euler angles (in radians)
     * @param x Rotation around X axis (pitch)
     * @param y Rotation around Y axis (yaw)
     * @param z Rotation around Z axis (roll)
     * @param order Order of rotations (default: 'XYZ')
     */
    static fromEuler(x: number, y: number, z: number, order?: string): Quaternion;
    /**
     * Create a quaternion from a rotation matrix
     * @param m Rotation matrix
     */
    static fromMatrix4(m: Matrix4): Quaternion;
    /**
     * Create a quaternion to rotate from one direction to another
     * @param from Starting direction (should be normalized)
     * @param to Target direction (should be normalized)
     */
    static fromUnitVectors(from: Vector3, to: Vector3): Quaternion;
    /**
     * Calculate the length (magnitude) of this quaternion
     */
    length(): number;
    /**
     * Calculate the squared length of this quaternion
     */
    lengthSquared(): number;
    /**
     * Normalize this quaternion and return a new quaternion
     */
    normalize(): Quaternion;
    /**
     * Calculate the conjugate of this quaternion
     */
    conjugate(): Quaternion;
    /**
     * Calculate the inverse of this quaternion
     */
    inverse(): Quaternion;
    /**
     * Multiply this quaternion by another and return a new quaternion
     * @param q Quaternion to multiply by
     */
    multiply(q: Quaternion): Quaternion;
    /**
     * Rotate a vector by this quaternion
     * @param v Vector to rotate
     */
    rotateVector(v: Vector3): Vector3;
    /**
     * Convert this quaternion to a rotation matrix
     */
    toMatrix4(): Matrix4;
    /**
     * Convert this quaternion to Euler angles (in radians)
     * @param order Order of rotations (default: 'XYZ')
     */
    toEuler(order?: string): Vector3;
    /**
     * Spherical linear interpolation between two quaternions
     * @param q Target quaternion
     * @param t Interpolation factor (0-1)
     */
    slerp(q: Quaternion, t: number): Quaternion;
    /**
     * Create a copy of this quaternion
     */
    clone(): Quaternion;
    /**
     * Convert this quaternion to an array
     */
    toArray(): number[];
    /**
     * Convert this quaternion to a Float32Array
     */
    toFloat32Array(): Float32Array;
    /**
     * Convert this quaternion to a string representation
     */
    toString(): string;
}
