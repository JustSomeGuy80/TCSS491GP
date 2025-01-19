import { Position } from "../components/position.js";

export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    subtract(other) {
        return this.add(other.negate());
    }

    negate() {
        return this.multiply(-1);
    }

    getMagnitude() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    normalize() {
        const length = this.getMagnitude();
        return new Vector(this.x / length, this.y / length);
    }

    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    toString() {
        return `Vector(x=${this.x}, y=${this.y})`;
    }

    draw() {
        ctx.save();

        ctx.fillStyle = "lime";
        ctx.fillRect(this.x - 5, this.y - 5, 10, 10);

        ctx.restore();
    }
}
