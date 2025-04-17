/**
 * Quaternion class for representing rotations in 3D space
 * Provides a more efficient and stable way to handle rotations compared to Euler angles
 */
import { Vector3 } from './Vector3';
import { Matrix4 } from './Matrix4';

export class Quaternion {
    /**
     * Create a new Quaternion
     * @param x X component (default: 0)
     * @param y Y component (default: 0)
     * @param z Z component (default: 0)
     * @param w W component (default: 1)
     */
    constructor(
        public readonly x: number = 0,
        public readonly y: number = 0,
        public readonly z: number = 0,
        public readonly w: number = 1
    ) {}

    /**
     * Create a quaternion from axis-angle representation
     * @param axis Rotation axis (should be normalized)
     * @param angle Rotation angle in radians
     */
    static fromAxisAngle(axis: Vector3, angle: number): Quaternion {
        // Ensure the axis is normalized
        const normalizedAxis = axis.normalize();
        
        // Calculate half angle
        const halfAngle = angle / 2;
        const s = Math.sin(halfAngle);
        
        return new Quaternion(
            normalizedAxis.x * s,
            normalizedAxis.y * s,
            normalizedAxis.z * s,
            Math.cos(halfAngle)
        );
    }

    /**
     * Create a quaternion from Euler angles (in radians)
     * @param x Rotation around X axis (pitch)
     * @param y Rotation around Y axis (yaw)
     * @param z Rotation around Z axis (roll)
     * @param order Order of rotations (default: 'XYZ')
     */
    static fromEuler(x: number, y: number, z: number, order: string = 'XYZ'): Quaternion {
        // Calculate half angles
        const halfX = x / 2;
        const halfY = y / 2;
        const halfZ = z / 2;
        
        // Calculate sines and cosines
        const sx = Math.sin(halfX);
        const cx = Math.cos(halfX);
        const sy = Math.sin(halfY);
        const cy = Math.cos(halfY);
        const sz = Math.sin(halfZ);
        const cz = Math.cos(halfZ);
        
        // Calculate quaternion components based on rotation order
        switch (order) {
            case 'XYZ':
                return new Quaternion(
                    sx * cy * cz + cx * sy * sz,
                    cx * sy * cz - sx * cy * sz,
                    cx * cy * sz + sx * sy * cz,
                    cx * cy * cz - sx * sy * sz
                );
            case 'YXZ':
                return new Quaternion(
                    sx * cy * cz + cx * sy * sz,
                    cx * sy * cz - sx * cy * sz,
                    cx * cy * sz - sx * sy * cz,
                    cx * cy * cz + sx * sy * sz
                );
            case 'ZXY':
                return new Quaternion(
                    sx * cy * cz - cx * sy * sz,
                    cx * sy * cz + sx * cy * sz,
                    cx * cy * sz + sx * sy * cz,
                    cx * cy * cz - sx * sy * sz
                );
            case 'ZYX':
                return new Quaternion(
                    sx * cy * cz - cx * sy * sz,
                    cx * sy * cz + sx * cy * sz,
                    cx * cy * sz - sx * sy * cz,
                    cx * cy * cz + sx * sy * sz
                );
            case 'YZX':
                return new Quaternion(
                    sx * cy * cz + cx * sy * sz,
                    cx * sy * cz + sx * cy * sz,
                    cx * cy * sz - sx * sy * cz,
                    cx * cy * cz - sx * sy * sz
                );
            case 'XZY':
                return new Quaternion(
                    sx * cy * cz - cx * sy * sz,
                    cx * sy * cz - sx * cy * sz,
                    cx * cy * sz + sx * sy * cz,
                    cx * cy * cz + sx * sy * sz
                );
            default:
                console.warn(`Quaternion: Unknown Euler rotation order: ${order}`);
                return new Quaternion();
        }
    }

    /**
     * Create a quaternion from a rotation matrix
     * @param m Rotation matrix
     */
    static fromMatrix4(m: Matrix4): Quaternion {
        const e = m.elements;
        
        const m11 = e[0], m12 = e[4], m13 = e[8];
        const m21 = e[1], m22 = e[5], m23 = e[9];
        const m31 = e[2], m32 = e[6], m33 = e[10];
        
        const trace = m11 + m22 + m33;
        
        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);
            
            return new Quaternion(
                (m32 - m23) * s,
                (m13 - m31) * s,
                (m21 - m12) * s,
                0.25 / s
            );
        } else if (m11 > m22 && m11 > m33) {
            const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
            
            return new Quaternion(
                0.25 * s,
                (m12 + m21) / s,
                (m13 + m31) / s,
                (m32 - m23) / s
            );
        } else if (m22 > m33) {
            const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
            
            return new Quaternion(
                (m12 + m21) / s,
                0.25 * s,
                (m23 + m32) / s,
                (m13 - m31) / s
            );
        } else {
            const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
            
            return new Quaternion(
                (m13 + m31) / s,
                (m23 + m32) / s,
                0.25 * s,
                (m21 - m12) / s
            );
        }
    }

    /**
     * Create a quaternion to rotate from one direction to another
     * @param from Starting direction (should be normalized)
     * @param to Target direction (should be normalized)
     */
    static fromUnitVectors(from: Vector3, to: Vector3): Quaternion {
        // Ensure vectors are normalized
        const v1 = from.normalize();
        const v2 = to.normalize();
        
        const dot = v1.dot(v2);
        
        // If vectors are very close, return identity quaternion
        if (dot > 0.999999) {
            return new Quaternion();
        }
        
        // If vectors are opposite, rotate 180 degrees around any perpendicular axis
        if (dot < -0.999999) {
            // Find a perpendicular axis
            let axis = new Vector3(1, 0, 0).cross(v1);
            if (axis.lengthSquared() < 0.000001) {
                axis = new Vector3(0, 1, 0).cross(v1);
            }
            axis = axis.normalize();
            
            return Quaternion.fromAxisAngle(axis, Math.PI);
        }
        
        // Otherwise, find the quaternion that rotates from v1 to v2
        const axis = v1.cross(v2).normalize();
        const angle = Math.acos(dot);
        
        return Quaternion.fromAxisAngle(axis, angle);
    }

    /**
     * Calculate the length (magnitude) of this quaternion
     */
    length(): number {
        return Math.sqrt(this.lengthSquared());
    }

    /**
     * Calculate the squared length of this quaternion
     */
    lengthSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }

    /**
     * Normalize this quaternion and return a new quaternion
     */
    normalize(): Quaternion {
        const len = this.length();
        
        if (len === 0) {
            return new Quaternion(0, 0, 0, 1);
        }
        
        const invLen = 1 / len;
        
        return new Quaternion(
            this.x * invLen,
            this.y * invLen,
            this.z * invLen,
            this.w * invLen
        );
    }

    /**
     * Calculate the conjugate of this quaternion
     */
    conjugate(): Quaternion {
        return new Quaternion(-this.x, -this.y, -this.z, this.w);
    }

    /**
     * Calculate the inverse of this quaternion
     */
    inverse(): Quaternion {
        // For unit quaternions, the inverse is the same as the conjugate
        const lenSq = this.lengthSquared();
        
        if (lenSq === 0) {
            console.warn('Quaternion: Cannot invert zero quaternion');
            return new Quaternion();
        }
        
        if (Math.abs(lenSq - 1.0) < 0.00001) {
            return this.conjugate();
        }
        
        const invLenSq = 1 / lenSq;
        
        return new Quaternion(
            -this.x * invLenSq,
            -this.y * invLenSq,
            -this.z * invLenSq,
            this.w * invLenSq
        );
    }

    /**
     * Multiply this quaternion by another and return a new quaternion
     * @param q Quaternion to multiply by
     */
    multiply(q: Quaternion): Quaternion {
        return new Quaternion(
            this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
            this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
            this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w,
            this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z
        );
    }

    /**
     * Rotate a vector by this quaternion
     * @param v Vector to rotate
     */
    rotateVector(v: Vector3): Vector3 {
        // Ensure the quaternion is normalized
        const q = this.normalize();
        
        // Calculate quaternion * vector * quaternion^-1
        const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
        const vx = v.x, vy = v.y, vz = v.z;
        
        // Calculate quaternion * vector
        const ix = qw * vx + qy * vz - qz * vy;
        const iy = qw * vy + qz * vx - qx * vz;
        const iz = qw * vz + qx * vy - qy * vx;
        const iw = -qx * vx - qy * vy - qz * vz;
        
        // Calculate result * quaternion^-1
        return new Vector3(
            ix * qw + iw * -qx + iy * -qz - iz * -qy,
            iy * qw + iw * -qy + iz * -qx - ix * -qz,
            iz * qw + iw * -qz + ix * -qy - iy * -qx
        );
    }

    /**
     * Convert this quaternion to a rotation matrix
     */
    toMatrix4(): Matrix4 {
        // Ensure the quaternion is normalized
        const q = this.normalize();
        const x = q.x, y = q.y, z = q.z, w = q.w;
        
        const xx = x * x;
        const xy = x * y;
        const xz = x * z;
        const xw = x * w;
        
        const yy = y * y;
        const yz = y * z;
        const yw = y * w;
        
        const zz = z * z;
        const zw = z * w;
        
        // Calculate matrix elements
        const m = new Matrix4();
        const e = m.elements;
        
        e[0] = 1 - 2 * (yy + zz);
        e[1] = 2 * (xy - zw);
        e[2] = 2 * (xz + yw);
        
        e[4] = 2 * (xy + zw);
        e[5] = 1 - 2 * (xx + zz);
        e[6] = 2 * (yz - xw);
        
        e[8] = 2 * (xz - yw);
        e[9] = 2 * (yz + xw);
        e[10] = 1 - 2 * (xx + yy);
        
        return m;
    }

    /**
     * Convert this quaternion to Euler angles (in radians)
     * @param order Order of rotations (default: 'XYZ')
     */
    toEuler(order: string = 'XYZ'): Vector3 {
        const x = this.x, y = this.y, z = this.z, w = this.w;
        
        switch (order) {
            case 'XYZ':
                return new Vector3(
                    Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y)),
                    Math.asin(Math.max(-1, Math.min(1, 2 * (w * y - z * x)))),
                    Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z))
                );
            case 'YXZ':
                return new Vector3(
                    Math.asin(Math.max(-1, Math.min(1, 2 * (w * x - y * z)))),
                    Math.atan2(2 * (w * y + z * x), 1 - 2 * (x * x + y * y)),
                    Math.atan2(2 * (w * z + x * y), 1 - 2 * (x * x + z * z))
                );
            case 'ZXY':
                return new Vector3(
                    Math.asin(Math.max(-1, Math.min(1, 2 * (w * x + y * z)))),
                    Math.atan2(2 * (w * y - z * x), 1 - 2 * (x * x + y * y)),
                    Math.atan2(2 * (w * z - x * y), 1 - 2 * (x * x + z * z))
                );
            case 'ZYX':
                return new Vector3(
                    Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y)),
                    Math.asin(Math.max(-1, Math.min(1, 2 * (w * y - z * x)))),
                    Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z))
                );
            case 'YZX':
                return new Vector3(
                    Math.atan2(2 * (w * x - y * z), 1 - 2 * (x * x + z * z)),
                    Math.atan2(2 * (w * y - z * x), 1 - 2 * (y * y + x * x)),
                    Math.asin(Math.max(-1, Math.min(1, 2 * (w * z + x * y))))
                );
            case 'XZY':
                return new Vector3(
                    Math.atan2(2 * (w * x + z * y), 1 - 2 * (x * x + z * z)),
                    Math.atan2(2 * (w * y + x * z), 1 - 2 * (y * y + z * z)),
                    Math.asin(Math.max(-1, Math.min(1, 2 * (w * z - x * y))))
                );
            default:
                console.warn(`Quaternion: Unknown Euler rotation order: ${order}`);
                return new Vector3();
        }
    }

    /**
     * Spherical linear interpolation between two quaternions
     * @param q Target quaternion
     * @param t Interpolation factor (0-1)
     */
    slerp(q: Quaternion, t: number): Quaternion {
        // Clamp t to 0-1 range
        const clampedT = Math.max(0, Math.min(1, t));
        
        // Calculate cosine of angle between quaternions
        let cosHalfTheta = this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
        
        // If quaternions are very close, use linear interpolation
        if (Math.abs(cosHalfTheta) >= 0.999) {
            return new Quaternion(
                this.x + (q.x - this.x) * clampedT,
                this.y + (q.y - this.y) * clampedT,
                this.z + (q.z - this.z) * clampedT,
                this.w + (q.w - this.w) * clampedT
            ).normalize();
        }
        
        // Calculate interpolation parameters
        const halfTheta = Math.acos(cosHalfTheta);
        const sinHalfTheta = Math.sqrt(1 - cosHalfTheta * cosHalfTheta);
        
        // If quaternions are opposite, invert one
        let qx = q.x, qy = q.y, qz = q.z, qw = q.w;
        if (cosHalfTheta < 0) {
            qx = -qx;
            qy = -qy;
            qz = -qz;
            qw = -qw;
            cosHalfTheta = -cosHalfTheta;
        }
        
        // Calculate interpolation ratios
        const ratioA = Math.sin((1 - clampedT) * halfTheta) / sinHalfTheta;
        const ratioB = Math.sin(clampedT * halfTheta) / sinHalfTheta;
        
        // Calculate interpolated quaternion
        return new Quaternion(
            this.x * ratioA + qx * ratioB,
            this.y * ratioA + qy * ratioB,
            this.z * ratioA + qz * ratioB,
            this.w * ratioA + qw * ratioB
        );
    }

    /**
     * Create a copy of this quaternion
     */
    clone(): Quaternion {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }

    /**
     * Convert this quaternion to an array
     */
    toArray(): number[] {
        return [this.x, this.y, this.z, this.w];
    }

    /**
     * Convert this quaternion to a Float32Array
     */
    toFloat32Array(): Float32Array {
        return new Float32Array(this.toArray());
    }

    /**
     * Convert this quaternion to a string representation
     */
    toString(): string {
        return `Quaternion(${this.x}, ${this.y}, ${this.z}, ${this.w})`;
    }
}
