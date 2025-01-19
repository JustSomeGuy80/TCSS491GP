import { Vector } from "../primitives/vector.js";

export class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }

    copy() {
        return new Position(this.x, this.y);
    }

    asVector() {
        return new Vector(this.x, this.y);
    }

    toString() {
        return `Position(x=${this.x}, y=${this.y})`;
    }

    draw(ctx) {
        ctx.save();

        ctx.fillStyle = "lime";
        ctx.fillRect(this.x - 5, this.y - 5, 10, 10);

        ctx.restore();
    }
}
