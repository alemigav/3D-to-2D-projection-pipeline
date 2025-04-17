/**
 * Vector3 class for 3D vector operations
 * Implements immutable vector operations that return new vectors
 */
export class Vector3 {
    /**
     * Create a new Vector3
     * @param x X component (default: 0)
     * @param y Y component (default: 0)
     * @param z Z component (default: 0)
     */
    constructor(
        public readonly x: number = 0,
        public readonly y: number = 0,
        public readonly z: number = 0
    ) {}

    /**
     * Create a Vector3 from an array
     * @param array Array containing [x, y, z] components
     */
    static fromArray(array: number[]): Vector3 {
        return new Vector3(
            array[0] || 0,
            array[1] || 0,
            array[2] || 0
        );
    }

    /**
     * Add another vector to this one and return a new vector
     * @param v Vector to add
     */
    add(v: Vector3): Vector3 {
        return new Vector3(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z
        );
    }

    /**
     * Subtract another vector from this one and return a new vector
     * @param v Vector to subtract
     */
    subtract(v: Vector3): Vector3 {
        return new Vector3(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z
        );
    }

    /**
     * Multiply this vector by a scalar and return a new vector
     * @param scalar Scalar value
     */
    multiply(scalar: number): Vector3 {
        return new Vector3(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar
        );
    }

    /**
     * Divide this vector by a scalar and return a new vector
     * @param scalar Scalar value
     */
    divide(scalar: number): Vector3 {
        if (scalar === 0) {
            console.warn('Vector3: Division by zero');
            return new Vector3();
        }
        
        const invScalar = 1 / scalar;
        return new Vector3(
            this.x * invScalar,
            this.y * invScalar,
            this.z * invScalar
        );
    }

    /**
     * Calculate the dot product of this vector and another
     * @param v Vector to calculate dot product with
     */
    dot(v: Vector3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * Calculate the cross product of this vector and another
     * @param v Vector to calculate cross product with
     */
    cross(v: Vector3): Vector3 {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    /**
     * Calculate the length (magnitude) of this vector
     */
    length(): number {
        return Math.sqrt(this.lengthSquared());
    }

    /**
     * Calculate the squared length of this vector
     * More efficient than length() when comparing distances
     */
    lengthSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * Return a normalized version of this vector (unit vector)
     */
    normalize(): Vector3 {
        const len = this.length();
        if (len === 0) {
            console.warn('Vector3: Normalization of zero vector');
            return new Vector3();
        }
        
        return this.divide(len);
    }

    /**
     * Calculate the distance between this vector and another
     * @param v Vector to calculate distance to
     */
    distanceTo(v: Vector3): number {
        return Math.sqrt(this.distanceToSquared(v));
    }

    /**
     * Calculate the squared distance between this vector and another
     * @param v Vector to calculate squared distance to
     */
    distanceToSquared(v: Vector3): number {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }

    /**
     * Linear interpolation between this vector and another
     * @param v Target vector
     * @param t Interpolation factor (0-1)
     */
    lerp(v: Vector3, t: number): Vector3 {
        // Clamp t to 0-1 range
        const clampedT = Math.max(0, Math.min(1, t));
        
        return new Vector3(
            this.x + (v.x - this.x) * clampedT,
            this.y + (v.y - this.y) * clampedT,
            this.z + (v.z - this.z) * clampedT
        );
    }

    /**
     * Create a copy of this vector
     */
    clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    /**
     * Convert this vector to an array
     */
    toArray(): number[] {
        return [this.x, this.y, this.z];
    }

    /**
     * Convert this vector to a Float32Array
     */
    toFloat32Array(): Float32Array {
        return new Float32Array(this.toArray());
    }

    /**
     * Convert this vector to a string representation
     */
    toString(): string {
        return `Vector3(${this.x}, ${this.y}, ${this.z})`;
    }

    /**
     * Static method to calculate the dot product of two vectors
     * @param a First vector
     * @param b Second vector
     */
    static dot(a: Vector3, b: Vector3): number {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    /**
     * Static method to calculate the cross product of two vectors
     * @param a First vector
     * @param b Second vector
     */
    static cross(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        );
    }
}
