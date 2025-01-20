import { Position } from "./position.js";

/** @type {ColliderRect[]} */
const colliders = [];

/**
 * ColliderRect exists only to detect (not resolve) collisions between 2 rectangles.
 * Currently, if there are 3 or more collisions then they will be ignored (only first counts)
 */
export class ColliderRect {
    /**
     * @param {Position} parent
     * @param {number} xOffset
     * @param {number} yOffset
     * @param {number} w width
     * @param {number} h height
     */
    constructor(parent, xOffset, yOffset, w, h) {
        this.parent = parent;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.w = w;
        this.h = h;

        colliders.push(this);
    }

    update() {}

    /**
     * Finds the first colliding rectangle and returns it.
     * @returns The ColliderRect object which collides with this one
     */
    *getCollision() {
        for (const collider of colliders) {
            if (this !== collider && this.collidesWith(collider)) {
                yield collider;
            }
        }

        return null;
    }

    /**
     * Gets the x and y starts and ends of this ColliderRect.
     * @returns The bounds of this ColliderRect
     */
    getBounds() {
        const xStart = this.parent.x + this.xOffset - Math.round(this.w / 2);
        const yStart = this.parent.y + this.yOffset - Math.round(this.h / 2);

        return {
            xStart,
            xEnd: xStart + this.w,
            yStart,
            yEnd: yStart + this.h,
        };
    }

    /**
     * Checks if this ColliderRect collides with the other ColliderRect
     * @param {ColliderRect} other
     * @returns true if there is a collision and false otherwise
     */
    collidesWith(other) {
        const selfBounds = this.getBounds();
        const otherBounds = other.getBounds();

        return !(
            selfBounds.xStart > otherBounds.xEnd ||
            otherBounds.xStart > selfBounds.xEnd ||
            selfBounds.yStart > otherBounds.yEnd ||
            otherBounds.yStart > selfBounds.yEnd
        );
    }

    /**
     * Draws this ColliderRect as a empty black rectangle on the canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        const bounds = this.getBounds();
        ctx.strokeRect(bounds.xStart, bounds.yStart, this.w, this.h);
    }
}
