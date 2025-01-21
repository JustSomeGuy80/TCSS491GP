/** @typedef {import("../primitives/vector")} */

/**
 * Position is similar to a Vector but performing operations does not create a new copy.
 */
class Position {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Sets the x and y coordinates of this Position.
     * @param {number} x
     * @param {number} y
     */
    set(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Displaces this position by the given Vector.
     * @param {*} vector
     */
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }

    /**
     * Creates a deep copy of this Position.
     * @returns a new Position
     */
    copy() {
        return new Position(this.x, this.y);
    }

    /**
     * Converts this Position to a Vector with the same x and y values.
     * @returns a new Vector
     */
    asVector() {
        return new Vector(this.x, this.y);
    }

    /**
     * @returns a string representation of this Position
     */
    toString() {
        return `Position(x=${this.x}, y=${this.y})`;
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
