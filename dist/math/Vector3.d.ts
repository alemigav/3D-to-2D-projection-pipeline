/**
 * Vector3 class for 3D vector operations
 * Implements immutable vector operations that return new vectors
 */
export declare class Vector3 {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    /**
     * Create a new Vector3
     * @param x X component (default: 0)
     * @param y Y component (default: 0)
     * @param z Z component (default: 0)
     */
    constructor(x?: number, y?: number, z?: number);
    /**
     * Create a Vector3 from an array
     * @param array Array containing [x, y, z] components
     */
    static fromArray(array: number[]): Vector3;
    /**
     * Add another vector to this one and return a new vector
     * @param v Vector to add
     */
    add(v: Vector3): Vector3;
    /**
     * Subtract another vector from this one and return a new vector
     * @param v Vector to subtract
     */
    subtract(v: Vector3): Vector3;
    /**
     * Multiply this vector by a scalar and return a new vector
     * @param scalar Scalar value
     */
    multiply(scalar: number): Vector3;
    /**
     * Divide this vector by a scalar and return a new vector
     * @param scalar Scalar value
     */
    divide(scalar: number): Vector3;
    /**
     * Calculate the dot product of this vector and another
     * @param v Vector to calculate dot product with
     */
    dot(v: Vector3): number;
    /**
     * Calculate the cross product of this vector and another
     * @param v Vector to calculate cross product with
     */
    cross(v: Vector3): Vector3;
    /**
     * Calculate the length (magnitude) of this vector
     */
    length(): number;
    /**
     * Calculate the squared length of this vector
     * More efficient than length() when comparing distances
     */
    lengthSquared(): number;
    /**
     * Return a normalized version of this vector (unit vector)
     */
    normalize(): Vector3;
    /**
     * Calculate the distance between this vector and another
     * @param v Vector to calculate distance to
     */
    distanceTo(v: Vector3): number;
    /**
     * Calculate the squared distance between this vector and another
     * @param v Vector to calculate squared distance to
     */
    distanceToSquared(v: Vector3): number;
    /**
     * Linear interpolation between this vector and another
     * @param v Target vector
     * @param t Interpolation factor (0-1)
     */
    lerp(v: Vector3, t: number): Vector3;
    /**
     * Create a copy of this vector
     */
    clone(): Vector3;
    /**
     * Convert this vector to an array
     */
    toArray(): number[];
    /**
     * Convert this vector to a Float32Array
     */
    toFloat32Array(): Float32Array;
    /**
     * Convert this vector to a string representation
     */
    toString(): string;
    /**
     * Static method to calculate the dot product of two vectors
     * @param a First vector
     * @param b Second vector
     */
    static dot(a: Vector3, b: Vector3): number;
    /**
     * Static method to calculate the cross product of two vectors
     * @param a First vector
     * @param b Second vector
     */
    static cross(a: Vector3, b: Vector3): Vector3;
    /**
     * Transform this vector as a direction by a matrix
     * @param matrix Matrix to transform by
     */
    transformDirection(matrix: any): Vector3;
}
