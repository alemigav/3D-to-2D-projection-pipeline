/**
 * Matrix4 class for 4x4 matrix operations
 * Used for transformations in 3D space
 */
import { Vector3 } from './Vector3';

export class Matrix4 {
    /**
     * Matrix elements stored in column-major order (WebGL standard)
     * [
     *   m00, m10, m20, m30,  // Column 0
     *   m01, m11, m21, m31,  // Column 1
     *   m02, m12, m22, m32,  // Column 2
     *   m03, m13, m23, m33   // Column 3
     * ]
     */
    public readonly elements: Float32Array;

    /**
     * Create a new Matrix4
     * @param elements Optional array of 16 elements in column-major order
     */
    constructor(elements?: number[] | Float32Array) {
        if (elements) {
            if (elements.length !== 16) {
                throw new Error('Matrix4: elements array must have 16 elements');
            }
            this.elements = new Float32Array(elements);
        } else {
            // Initialize as identity matrix
            this.elements = new Float32Array([
                1, 0, 0, 0,  // Column 0
                0, 1, 0, 0,  // Column 1
                0, 0, 1, 0,  // Column 2
                0, 0, 0, 1   // Column 3
            ]);
        }
    }

    /**
     * Create an identity matrix
     */
    static identity(): Matrix4 {
        return new Matrix4();
    }

    /**
     * Set this matrix to the identity matrix
     */
    setIdentity(): Matrix4 {
        const e = this.elements;
        e[0] = 1; e[4] = 0; e[8] = 0; e[12] = 0;
        e[1] = 0; e[5] = 1; e[9] = 0; e[13] = 0;
        e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
        e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
        return this;
    }

    /**
     * Create a translation matrix
     * @param x X translation
     * @param y Y translation
     * @param z Z translation
     */
    static translation(x: number, y: number, z: number): Matrix4 {
        const matrix = new Matrix4();
        const e = matrix.elements;
        
        e[12] = x;
        e[13] = y;
        e[14] = z;
        
        return matrix;
    }

    /**
     * Create a translation matrix from a Vector3
     * @param v Translation vector
     */
    static translationFromVector(v: Vector3): Matrix4 {
        return Matrix4.translation(v.x, v.y, v.z);
    }

    /**
     * Create a scaling matrix
     * @param x X scale
     * @param y Y scale
     * @param z Z scale
     */
    static scaling(x: number, y: number, z: number): Matrix4 {
        const matrix = new Matrix4();
        const e = matrix.elements;
        
        e[0] = x;
        e[5] = y;
        e[10] = z;
        
        return matrix;
    }

    /**
     * Create a scaling matrix from a Vector3
     * @param v Scale vector
     */
    static scalingFromVector(v: Vector3): Matrix4 {
        return Matrix4.scaling(v.x, v.y, v.z);
    }

    /**
     * Create a rotation matrix around the X axis
     * @param angle Angle in radians
     */
    static rotationX(angle: number): Matrix4 {
        const matrix = new Matrix4();
        const e = matrix.elements;
        
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        
        e[5] = c;
        e[6] = s;
        e[9] = -s;
        e[10] = c;
        
        return matrix;
    }

    /**
     * Create a rotation matrix around the Y axis
     * @param angle Angle in radians
     */
    static rotationY(angle: number): Matrix4 {
        const matrix = new Matrix4();
        const e = matrix.elements;
        
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        
        e[0] = c;
        e[2] = -s;
        e[8] = s;
        e[10] = c;
        
        return matrix;
    }

    /**
     * Create a rotation matrix around the Z axis
     * @param angle Angle in radians
     */
    static rotationZ(angle: number): Matrix4 {
        const matrix = new Matrix4();
        const e = matrix.elements;
        
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        
        e[0] = c;
        e[1] = s;
        e[4] = -s;
        e[5] = c;
        
        return matrix;
    }

    /**
     * Create a perspective projection matrix
     * @param fov Field of view in degrees
     * @param aspect Aspect ratio (width / height)
     * @param near Near clipping plane
     * @param far Far clipping plane
     */
    static perspective(fov: number, aspect: number, near: number, far: number): Matrix4 {
        const matrix = new Matrix4();
        const e = matrix.elements;
        
        const f = 1.0 / Math.tan(fov * Math.PI / 360);
        const nf = 1 / (near - far);
        
        e[0] = f / aspect;
        e[5] = f;
        e[10] = (far + near) * nf;
        e[11] = -1;
        e[14] = 2 * far * near * nf;
        e[15] = 0;
        
        return matrix;
    }

    /**
     * Create an orthographic projection matrix
     * @param left Left clipping plane
     * @param right Right clipping plane
     * @param bottom Bottom clipping plane
     * @param top Top clipping plane
     * @param near Near clipping plane
     * @param far Far clipping plane
     */
    static orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4 {
        const matrix = new Matrix4();
        const e = matrix.elements;
        
        const w = 1 / (right - left);
        const h = 1 / (top - bottom);
        const d = 1 / (far - near);
        
        e[0] = 2 * w;
        e[5] = 2 * h;
        e[10] = -2 * d;
        e[12] = -(right + left) * w;
        e[13] = -(top + bottom) * h;
        e[14] = -(far + near) * d;
        
        return matrix;
    }

    /**
     * Create a "look at" view matrix
     * @param eye Camera position
     * @param target Point to look at
     * @param up Up vector
     */
    static lookAt(eye: Vector3, target: Vector3, up: Vector3): Matrix4 {
        const matrix = new Matrix4();
        
        // Calculate the z axis (forward)
        const zAxis = eye.subtract(target).normalize();
        
        // If eye and target are in the same position, return identity
        if (zAxis.lengthSquared() === 0) {
            return matrix;
        }
        
        // Calculate the x axis (right)
        let xAxis = up.cross(zAxis).normalize();
        
        // If up and z are parallel, use a default x axis
        if (xAxis.lengthSquared() === 0) {
            const defaultUp = new Vector3(0, 1, 0);
            if (Math.abs(zAxis.dot(defaultUp)) > 0.99) {
                // If z is close to up, use a different default
                const altUp = new Vector3(0, 0, 1);
                xAxis = altUp.cross(zAxis);
            } else {
                xAxis = defaultUp.cross(zAxis);
            }
        }
        
        // Calculate the y axis (up)
        const yAxis = zAxis.cross(xAxis);
        
        // Set the matrix elements
        const e = matrix.elements;
        
        e[0] = xAxis.x;
        e[1] = yAxis.x;
        e[2] = zAxis.x;
        
        e[4] = xAxis.y;
        e[5] = yAxis.y;
        e[6] = zAxis.y;
        
        e[8] = xAxis.z;
        e[9] = yAxis.z;
        e[10] = zAxis.z;
        
        e[12] = -xAxis.dot(eye);
        e[13] = -yAxis.dot(eye);
        e[14] = -zAxis.dot(eye);
        
        return matrix;
    }

    /**
     * Multiply this matrix by another and return a new matrix
     * @param m Matrix to multiply by
     */
    multiply(m: Matrix4): Matrix4 {
        const a = this.elements;
        const b = m.elements;
        const result = new Matrix4();
        const r = result.elements;
        
        // Perform matrix multiplication
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                r[i + j * 4] = 
                    a[i] * b[j * 4] +
                    a[i + 4] * b[j * 4 + 1] +
                    a[i + 8] * b[j * 4 + 2] +
                    a[i + 12] * b[j * 4 + 3];
            }
        }
        
        return result;
    }

    /**
     * Transform a Vector3 by this matrix
     * @param v Vector to transform
     * @param w W component (default: 1)
     */
    transformVector(v: Vector3, w: number = 1): Vector3 {
        const e = this.elements;
        const x = v.x;
        const y = v.y;
        const z = v.z;
        
        // Calculate transformed coordinates
        const tx = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
        const ty = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
        const tz = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
        const tw = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
        
        // Perform perspective division if w is not 1
        if (w !== 1 && tw !== 1 && tw !== 0) {
            return new Vector3(tx / tw, ty / tw, tz / tw);
        }
        
        return new Vector3(tx, ty, tz);
    }

    /**
     * Calculate the determinant of this matrix
     */
    determinant(): number {
        const e = this.elements;
        
        const n11 = e[0], n12 = e[4], n13 = e[8], n14 = e[12];
        const n21 = e[1], n22 = e[5], n23 = e[9], n24 = e[13];
        const n31 = e[2], n32 = e[6], n33 = e[10], n34 = e[14];
        const n41 = e[3], n42 = e[7], n43 = e[11], n44 = e[15];
        
        return (
            n41 * (
                n14 * n23 * n32 -
                n13 * n24 * n32 -
                n14 * n22 * n33 +
                n12 * n24 * n33 +
                n13 * n22 * n34 -
                n12 * n23 * n34
            ) +
            n42 * (
                n11 * n23 * n34 -
                n11 * n24 * n33 +
                n14 * n21 * n33 -
                n13 * n21 * n34 +
                n13 * n24 * n31 -
                n14 * n23 * n31
            ) +
            n43 * (
                n11 * n24 * n32 -
                n11 * n22 * n34 -
                n14 * n21 * n32 +
                n12 * n21 * n34 +
                n14 * n22 * n31 -
                n12 * n24 * n31
            ) +
            n44 * (
                n11 * n22 * n33 -
                n11 * n23 * n32 +
                n13 * n21 * n32 -
                n12 * n21 * n33 +
                n12 * n23 * n31 -
                n13 * n22 * n31
            )
        );
    }

    /**
     * Calculate the inverse of this matrix
     */
    inverse(): Matrix4 {
        const det = this.determinant();
        
        if (det === 0) {
            console.warn('Matrix4: Cannot invert matrix with determinant 0');
            return new Matrix4();
        }
        
        const e = this.elements;
        const result = new Matrix4();
        const r = result.elements;
        
        const n11 = e[0], n12 = e[4], n13 = e[8], n14 = e[12];
        const n21 = e[1], n22 = e[5], n23 = e[9], n24 = e[13];
        const n31 = e[2], n32 = e[6], n33 = e[10], n34 = e[14];
        const n41 = e[3], n42 = e[7], n43 = e[11], n44 = e[15];
        
        const invDet = 1 / det;
        
        r[0] = (n22 * n33 * n44 - n22 * n34 * n43 - n32 * n23 * n44 + n32 * n24 * n43 + n42 * n23 * n34 - n42 * n24 * n33) * invDet;
        r[1] = (-n21 * n33 * n44 + n21 * n34 * n43 + n31 * n23 * n44 - n31 * n24 * n43 - n41 * n23 * n34 + n41 * n24 * n33) * invDet;
        r[2] = (n21 * n32 * n44 - n21 * n34 * n42 - n31 * n22 * n44 + n31 * n24 * n42 + n41 * n22 * n34 - n41 * n24 * n32) * invDet;
        r[3] = (-n21 * n32 * n43 + n21 * n33 * n42 + n31 * n22 * n43 - n31 * n23 * n42 - n41 * n22 * n33 + n41 * n23 * n32) * invDet;
        
        r[4] = (-n12 * n33 * n44 + n12 * n34 * n43 + n32 * n13 * n44 - n32 * n14 * n43 - n42 * n13 * n34 + n42 * n14 * n33) * invDet;
        r[5] = (n11 * n33 * n44 - n11 * n34 * n43 - n31 * n13 * n44 + n31 * n14 * n43 + n41 * n13 * n34 - n41 * n14 * n33) * invDet;
        r[6] = (-n11 * n32 * n44 + n11 * n34 * n42 + n31 * n12 * n44 - n31 * n14 * n42 - n41 * n12 * n34 + n41 * n14 * n32) * invDet;
        r[7] = (n11 * n32 * n43 - n11 * n33 * n42 - n31 * n12 * n43 + n31 * n13 * n42 + n41 * n12 * n33 - n41 * n13 * n32) * invDet;
        
        r[8] = (n12 * n23 * n44 - n12 * n24 * n43 - n22 * n13 * n44 + n22 * n14 * n43 + n42 * n13 * n24 - n42 * n14 * n23) * invDet;
        r[9] = (-n11 * n23 * n44 + n11 * n24 * n43 + n21 * n13 * n44 - n21 * n14 * n43 - n41 * n13 * n24 + n41 * n14 * n23) * invDet;
        r[10] = (n11 * n22 * n44 - n11 * n24 * n42 - n21 * n12 * n44 + n21 * n14 * n42 + n41 * n12 * n24 - n41 * n14 * n22) * invDet;
        r[11] = (-n11 * n22 * n43 + n11 * n23 * n42 + n21 * n12 * n43 - n21 * n13 * n42 - n41 * n12 * n23 + n41 * n13 * n22) * invDet;
        
        r[12] = (-n12 * n23 * n34 + n12 * n24 * n33 + n22 * n13 * n34 - n22 * n14 * n33 - n32 * n13 * n24 + n32 * n14 * n23) * invDet;
        r[13] = (n11 * n23 * n34 - n11 * n24 * n33 - n21 * n13 * n34 + n21 * n14 * n33 + n31 * n13 * n24 - n31 * n14 * n23) * invDet;
        r[14] = (-n11 * n22 * n34 + n11 * n24 * n32 + n21 * n12 * n34 - n21 * n14 * n32 - n31 * n12 * n24 + n31 * n14 * n22) * invDet;
        r[15] = (n11 * n22 * n33 - n11 * n23 * n32 - n21 * n12 * n33 + n21 * n13 * n32 + n31 * n12 * n23 - n31 * n13 * n22) * invDet;
        
        return result;
    }

    /**
     * Calculate the transpose of this matrix
     */
    transpose(): Matrix4 {
        const e = this.elements;
        const result = new Matrix4();
        const r = result.elements;
        
        r[0] = e[0]; r[4] = e[1]; r[8] = e[2]; r[12] = e[3];
        r[1] = e[4]; r[5] = e[5]; r[9] = e[6]; r[13] = e[7];
        r[2] = e[8]; r[6] = e[9]; r[10] = e[10]; r[14] = e[11];
        r[3] = e[12]; r[7] = e[13]; r[11] = e[14]; r[15] = e[15];
        
        return result;
    }

    /**
     * Create a copy of this matrix
     */
    clone(): Matrix4 {
        return new Matrix4(this.elements);
    }

    /**
     * Convert this matrix to an array
     */
    toArray(): number[] {
        return Array.from(this.elements);
    }

    /**
     * Convert this matrix to a Float32Array
     */
    toFloat32Array(): Float32Array {
        return new Float32Array(this.elements);
    }

    /**
     * Extract the translation component from this matrix
     */
    getTranslation(): Vector3 {
        const e = this.elements;
        return new Vector3(e[12], e[13], e[14]);
    }
    
    /**
     * Transform a direction vector by this matrix (ignoring translation)
     * @param v Direction vector to transform
     */
    transformDirection(v: Vector3): Vector3 {
        const e = this.elements;
        const x = v.x;
        const y = v.y;
        const z = v.z;
        
        // Calculate transformed direction (ignoring translation)
        const tx = e[0] * x + e[4] * y + e[8] * z;
        const ty = e[1] * x + e[5] * y + e[9] * z;
        const tz = e[2] * x + e[6] * y + e[10] * z;
        
        return new Vector3(tx, ty, tz);
    }
    
    /**
     * Convert this matrix to a string representation
     */
    toString(): string {
        const e = this.elements;
        return `Matrix4(\n` +
            `  ${e[0]}, ${e[4]}, ${e[8]}, ${e[12]},\n` +
            `  ${e[1]}, ${e[5]}, ${e[9]}, ${e[13]},\n` +
            `  ${e[2]}, ${e[6]}, ${e[10]}, ${e[14]},\n` +
            `  ${e[3]}, ${e[7]}, ${e[11]}, ${e[15]}\n` +
            `)`;
    }
}
