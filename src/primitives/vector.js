/**
 * Vector represents a 2D vector (anything with an x and y component)
 */
class Vector {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Adds this vector with another Vector and returns a new Vector
     * @param {Vector} other
     * @returns a new Vector object
     */
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    /**
     * Subtracts another Vector from this Vector (a-b where a is this and b is other)
     * @param {*} other
     * @returns a new Vector object
     */
    subtract(other) {
        return this.add(other.negate());
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
     */
    draw(ctx) {
        ctx.save();

        ctx.fillStyle = "lime";
        ctx.fillRect(this.x - 5, this.y - 5, 10, 10);

        ctx.restore();
    }
}
