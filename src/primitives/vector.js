/**
 * Vector represents a 2D vector (anything with an x and y component)
 */
class Vector {
    /**
     * @param {Vector | number | undefined} arg1
     * @param {number | undefined} arg2
     */
    constructor(arg1, arg2) {
        if (arg1 === undefined) {
            this.x = 0;
            this.y = 0;
        } else if (arg2 === undefined) {
            if (typeof arg1 === "number") {
                this.x = arg1;
                this.y = 0;
            } else {
                this.x = arg1.x;
                this.y = arg1.y;
            }
        } else {
            this.x = arg1;
            this.y = arg2;
        }
    }

    /**
     * Checks if this Vector is equivalent to (0, 0)
     * @returns true if this Vector equals (0, 0), false otherwise
     */
    isZero() {
        return this.x === 0 && this.y === 0;
    }

    /**
     * Adds this vector with another Vector and returns a new Vector
     * @param {Vector | number} arg1
     * @param {number | undefined} arg2
     * @returns {Vector} a new Vector object
     */
    add(arg1, arg2) {
        if (arg2 === undefined) {
            if (typeof arg1 === "number") {
                return this.add(arg1, 0);
            } else {
                return this.add(arg1.x, arg1.y);
            }
        }

        return new Vector(this.x + arg1, this.y + arg2);
    }

    /**
     * Subtracts another Vector from this Vector (a-b where a is this and b is other)
     * @param {Vector | number} arg1
     * @param {number | undefined} arg2
     * @returns {Vector} a new Vector object
     */
    subtract(arg1, arg2) {
        if (arg2 === undefined) {
            if (typeof arg1 === "number") {
                return this.subtract(arg1, 0);
            } else {
                return this.subtract(arg1.x, arg1.y);
            }
        }

        return new Vector(this.x - arg1, this.y - arg2);
    }

    /**
     * Negates this vector and returns -a where a is this Vector
     * @returns a new Vector object
     */
    negate() {
        return this.multiply(-1);
    }

    /**
     * Calculates the magnitude of this Vector.
     * @returns the magnitude
     */
    getMagnitude() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    /**
     * Returns a new Vector which has the same direction as this but with a magnitude of 1.
     * @returns a new Vector
     */
    normalize() {
        if (this.isZero()) {
            return new Vector();
        }

        const length = this.getMagnitude();

        return new Vector(this.x / length, this.y / length);
    }

    /**
     * Performs a scalar multiplication on this Vector.
     * @param {number} scalar
     * @returns a new Vector
     */
    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    /**
     * Applies the transformation each element of a copy of this Vector
     * @param {(value: number) => number} transformation
     */
    map(transformation) {
        return new Vector(transformation(this.x), transformation(this.y));
    }

    /**
     * Makes a deep copy of this Vector.
     * @returns a new Vector
     */
    copy() {
        return new Vector(this.x, this.y);
    }

    /**
     * @returns a string representation of this Vector
     */
    toString() {
        return `Vector(x=${this.x}, y=${this.y})`;
    }

    /**
     * Draws this vector to the canvas as a lime colored 10px square (the center of that square is exactly where this Vector is)
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} offset
     */
    draw(ctx, offset) {
        const SIZE = 10;

        const position = this.subtract(offset);

        ctx.save();

        ctx.fillStyle = "lime";
        ctx.fillRect(position.x - SIZE / 2, position.y - SIZE / 2, 10, 10);

        ctx.restore();
    }
}
